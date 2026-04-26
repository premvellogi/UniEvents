const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, department } = req.body;

        // Validate email domain
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'jainuniversity.ac.in';
        const emailDomain = email.split('@')[1];
        if (emailDomain !== allowedDomain) {
            return res.status(400).json({
                message: `Registration is only allowed with @${allowedDomain} email addresses`,
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password,
            department: department || '',
            role: 'student',
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ message: error.message || 'Registration failed' });
    }
};

// @desc    Login user (student or admin)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Auto-assign superior_admin role if logging in as premvellogi@gmail.com
        if (email === 'premvellogi@gmail.com' && user.role !== 'superior_admin') {
            user.role = 'superior_admin';
            await user.save();
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: error.message || 'Login failed' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.json(req.user);
};

module.exports = { register, login, getMe };
