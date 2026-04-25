const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [notifications, unreadCount] = await Promise.all([
            Notification.find({ userId: req.user._id })
                .populate('eventId', 'title date department poster')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Notification.countDocuments({ userId: req.user._id, read: false }),
        ]);

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error.message);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = async (req, res) => {
    try {
        const notif = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notif) return res.status(404).json({ message: 'Notification not found' });
        res.json(notif);
    } catch (error) {
        console.error('Mark read error:', error.message);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error.message);
        res.status(500).json({ message: 'Failed to mark notifications as read' });
    }
};

// @desc    Admin broadcast notification
// @route   POST /api/notifications/broadcast
// @access  Admin
const broadcast = async (req, res) => {
    try {
        const { message, eventId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Broadcast message is required' });
        }

        const students = await User.find({ role: 'student' }).select('_id');
        const notifications = students.map((s) => ({
            userId: s._id,
            eventId: eventId || null,
            message,
            type: 'system',
        }));

        await Notification.insertMany(notifications);
        res.json({ message: `Broadcast sent to ${students.length} students` });
    } catch (error) {
        console.error('Broadcast error:', error.message);
        res.status(500).json({ message: 'Failed to send broadcast' });
    }
};

// @desc    Get the latest broadcast message (public, for announcement banner)
// @route   GET /api/notifications/latest-broadcast
// @access  Public
const getLatestBroadcast = async (req, res) => {
    try {
        const latest = await Notification.findOne({ type: 'system' })
            .sort({ createdAt: -1 })
            .select('message createdAt');
        if (!latest) return res.json({ message: null });
        res.json({ message: latest.message, createdAt: latest.createdAt });
    } catch {
        res.json({ message: null });
    }
};

module.exports = { getNotifications, markRead, markAllRead, broadcast, getLatestBroadcast };
