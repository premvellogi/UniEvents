const express = require('express');
const { protect, isSuperiorAdmin } = require('../middleware/auth');
const {
    getSecondaryAdmins,
    createSecondaryAdmin,
    updateSecondaryAdmin,
    deleteSecondaryAdmin,
} = require('../controllers/admin.controller');

const router = express.Router();

// All routes require Superior Admin access
router.use(protect, isSuperiorAdmin);

router.get('/secondary-admins', getSecondaryAdmins);
router.post('/secondary-admins', createSecondaryAdmin);
router.put('/secondary-admins/:id', updateSecondaryAdmin);
router.delete('/secondary-admins/:id', deleteSecondaryAdmin);

module.exports = router;
