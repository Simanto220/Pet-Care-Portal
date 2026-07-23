const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: {
    type: String,
    required: true,
    enum: ['adoption_request', 'adoption_accepted', 'adoption_rejected', 'meeting_scheduled', 'post_liked', 'general'],
    default: 'general'
  },
  petId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pet', 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
