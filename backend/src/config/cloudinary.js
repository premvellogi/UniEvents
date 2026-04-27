const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

console.log('Initializing Cloudinary config...');
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key present:', !!process.env.CLOUDINARY_API_KEY);
console.log('API Secret present:', !!process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uni-events',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 630, crop: 'limit' }],
        public_id: (req, file) => {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 15);
            return `event_${timestamp}_${random}`;
        }
    },
});

// Test Cloudinary connection
storage.cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('Cloudinary connection failed:', error.message);
    } else {
        console.log('Cloudinary connection successful:', result);
    }
});

module.exports = { cloudinary, storage };
