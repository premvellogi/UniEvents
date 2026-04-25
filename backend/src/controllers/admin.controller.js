const User = require('../models/User');

// @desc    Get all secondary admins
// @route   GET /api/admin/secondary-admins
// @access  Superior Admin only
const getSecondaryAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'secondary_admin' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(admins);
    } catch (error) {
        console.error('Get secondary admins error:', error.message);
        res.status(500).json({ message: 'Failed to fetch secondary admins' });
    }
};

// @desc    Create a secondary admin
// @route   POST /api/admin/secondary-admins
// @access  Superior Admin only
const createSecondaryAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        // Prevent creating an admin with the superior admin email
        if (email.toLowerCase() === 'premvellogi@gmail.com') {
            return res.status(400).json({ message: 'Cannot create a secondary admin with this email' });
        }

        // Password is hashed automatically by the User model pre-save hook (bcrypt, salt factor 10)
        const admin = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: 'secondary_admin',
        });

        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            createdAt: admin.createdAt,
        });
    } catch (error) {
        console.error('Create secondary admin error:', error.message);
        res.status(500).json({ message: error.message || 'Failed to create secondary admin' });
    }
};

// @desc    Update a secondary admin
// @route   PUT /api/admin/secondary-admins/:id
// @access  Superior Admin only
const updateSecondaryAdmin = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);

        if (!admin || admin.role !== 'secondary_admin') {
            return res.status(404).json({ message: 'Secondary admin not found' });
        }

        const { name, email, password } = req.body;

        if (email && email.toLowerCase() === 'premvellogi@gmail.com') {
            return res.status(400).json({ message: 'Cannot use this email address' });
        }

        // Check for email uniqueness if email is being changed
        if (email && email.toLowerCase() !== admin.email) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ message: 'A user with this email already exists' });
            }
        }

        if (name) admin.name = name;
        if (email) admin.email = email.toLowerCase();
        if (password) admin.password = password; // Will be hashed by pre-save hook

        await admin.save();

        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            createdAt: admin.createdAt,
        });
    } catch (error) {
        console.error('Update secondary admin error:', error.message);
        res.status(500).json({ message: error.message || 'Failed to update secondary admin' });
    }
};

// @desc    Delete a secondary admin
// @route   DELETE /api/admin/secondary-admins/:id
// @access  Superior Admin only
const deleteSecondaryAdmin = async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);

        if (!admin || admin.role !== 'secondary_admin') {
            return res.status(404).json({ message: 'Secondary admin not found' });
        }

        await admin.deleteOne();
        res.json({ message: 'Secondary admin removed' });
    } catch (error) {
        console.error('Delete secondary admin error:', error.message);
        res.status(500).json({ message: 'Failed to delete secondary admin' });
    }
};

module.exports = {
    getSecondaryAdmins,
    createSecondaryAdmin,
    updateSecondaryAdmin,
    deleteSecondaryAdmin,
};
