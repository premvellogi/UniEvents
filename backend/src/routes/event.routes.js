const express = require('express');
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/auth');
const {
    getEvents, getEvent, createEvent, updateEvent, deleteEvent, getAnalytics,
} = require('../controllers/event.controller');

const router = express.Router();

// Use Cloudinary storage if configured, otherwise fallback to memory storage
let upload;
try {
    const cloudinaryConfigured =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

    console.log('Cloudinary configured:', cloudinaryConfigured);
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key present:', !!process.env.CLOUDINARY_API_KEY);
    console.log('API Secret present:', !!process.env.CLOUDINARY_API_SECRET);

    if (cloudinaryConfigured) {
        const { storage } = require('../config/cloudinary');
        upload = multer({ 
            storage,
            limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
        });
        console.log('Using Cloudinary storage for file uploads');
    } else {
        upload = multer({ storage: multer.memoryStorage() });
        console.log('Using memory storage (Cloudinary not configured)');
    }
} catch (e) {
    console.error('Cloudinary configuration error:', e.message);
    console.error('Stack:', e.stack);
    upload = multer({ storage: multer.memoryStorage() });
    console.log('Falling back to memory storage due to error');
}

// ⚠️ IMPORTANT: Specific named routes MUST come before /:id routes
// Admin analytics — must be before /:id or Express will match 'analytics' as an ID
router.get('/admin/analytics', protect, adminOnly, getAnalytics);

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Admin only routes (write operations)
router.post('/', protect, adminOnly, upload.single('poster'), createEvent);
router.put('/:id', protect, adminOnly, upload.single('poster'), updateEvent);
router.delete('/:id', protect, adminOnly, deleteEvent);

module.exports = router;
