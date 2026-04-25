const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
    getNotifications, markRead, markAllRead, broadcast, getLatestBroadcast,
} = require('../controllers/notification.controller');

const router = express.Router();

// Public – no auth required (for announcement banner)
router.get('/latest-broadcast', getLatestBroadcast);

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markRead);
router.post('/broadcast', protect, adminOnly, broadcast);

module.exports = router;
