const Notification = require('../models/Notification');

// Get notifications for user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error getting notifications' });
  }
};


// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking as read' });
  }
};

// Create notification (helper function)
exports.createNotification = async (userId, message, petId, type = 'general') => {
  try {
    console.log('Creating notification:', { userId, message, type }); // Debug log
    const notification = new Notification({
      userId,
      message,
      type,
      petId
    });
    await notification.save();
    console.log('Notification saved successfully'); // Debug log
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
