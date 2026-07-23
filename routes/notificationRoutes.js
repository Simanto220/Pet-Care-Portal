const express = require('express');
const router = express.Router();
const { jwtVerification } = require('../middlewares/authMiddleware');
const {
  getNotifications,
  markAsRead
} = require('../controllers/notificationController');

// Get all notifications
router.get('/', jwtVerification, getNotifications);

// Mark as read
router.patch('/:id/read', jwtVerification, markAsRead);

module.exports = router;
