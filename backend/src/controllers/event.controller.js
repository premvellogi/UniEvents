const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEventNotificationEmail } = require('../utils/email');

// Safely import cloudinary only if configured
let cloudinary;
try {
    const isConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
    if (isConfigured) {
        cloudinary = require('../config/cloudinary').cloudinary;
    }
} catch (e) { /* Cloudinary not configured */ }

const safeCloudinaryDelete = async (publicId) => {
    if (cloudinary && publicId) {
        try { await cloudinary.uploader.destroy(publicId); } catch (e) { /*ignore*/ }
    }
};


// @desc    Get all events with search & filter
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const { search, department, eventType, status, featured, page = 1, limit = 12 } = req.query;

        const query = {};

        if (search) {
            query.$text = { $search: search };
        }
        if (department) query.department = department;
        if (eventType) query.eventType = eventType;
        if (status) query.status = status;
        if (featured) query.featured = featured === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [events, total] = await Promise.all([
            Event.find(query)
                .populate('createdBy', 'name')
                .sort({ date: status === 'completed' ? -1 : 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Event.countDocuments(query),
        ]);

        res.json({
            events,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error('Get events error:', error.message);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        console.error('Get event error:', error.message);
        res.status(500).json({ message: 'Failed to fetch event' });
    }
};

// @desc    Create event
// @route   POST /api/events
// @access  Admin
const createEvent = async (req, res) => {
    try {
        const {
            title, description, department, eventType, date, endDate, venue,
            registrationLink, status, featured, tags,
        } = req.body;

        const poster = req.file ? req.file.path : '';
        const posterPublicId = req.file ? req.file.filename : '';

        const event = await Event.create({
            title, description, department, eventType,
            date, endDate, venue, registrationLink,
            status: status || 'upcoming',
            featured: featured === 'true' || featured === true,
            tags: tags ? tags.split(',').map((t) => t.trim()) : [],
            poster, posterPublicId,
            createdBy: req.user._id,
        });

        // Create in-app notifications for all students
        const students = await User.find({ role: 'student', notificationsEnabled: true });
        if (students.length > 0) {
            const notifications = students.map((s) => ({
                userId: s._id,
                eventId: event._id,
                message: `New event posted: ${event.title}`,
                type: 'new_event',
            }));
            await Notification.insertMany(notifications);

            // Send email notifications (non-blocking)
            const emails = students.map((s) => s.email);
            sendEventNotificationEmail(emails, event);
        }

        res.status(201).json(event);
    } catch (error) {
        console.error('Create event error:', error.message);
        res.status(500).json({ message: error.message || 'Failed to create event' });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Admin
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const updates = { ...req.body };
        if (updates.featured !== undefined) {
            updates.featured = updates.featured === 'true' || updates.featured === true;
        }
        if (updates.tags) {
            updates.tags = updates.tags.split(',').map((t) => t.trim());
        }

        // Handle new poster upload
        if (req.file) {
            // Delete old poster from cloudinary if configured
            await safeCloudinaryDelete(event.posterPublicId);
            updates.poster = req.file.path || '';
            updates.posterPublicId = req.file.filename || '';
        }

        const updated = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        res.json(updated);
    } catch (error) {
        console.error('Update event error:', error.message);
        res.status(500).json({ message: error.message || 'Failed to update event' });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        await safeCloudinaryDelete(event.posterPublicId);

        await event.deleteOne();
        await Notification.deleteMany({ eventId: req.params.id });

        res.json({ message: 'Event removed' });
    } catch (error) {
        console.error('Delete event error:', error.message);
        res.status(500).json({ message: 'Failed to delete event' });
    }
};

// @desc    Get admin event analytics
// @route   GET /api/events/admin/analytics
// @access  Admin
const getAnalytics = async (req, res) => {
    try {
        const [total, upcoming, completed, featured, students] = await Promise.all([
            Event.countDocuments(),
            Event.countDocuments({ status: 'upcoming' }),
            Event.countDocuments({ status: 'completed' }),
            Event.countDocuments({ featured: true }),
            User.countDocuments({ role: 'student' }),
        ]);

        // Events by department
        const byDepartment = await Event.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // Recent 5 events
        const recent = await Event.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title department date status featured');

        res.json({ total, upcoming, completed, featured, students, byDepartment, recent });
    } catch (error) {
        console.error('Analytics error:', error.message);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getAnalytics };
