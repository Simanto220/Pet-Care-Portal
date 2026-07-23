const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    start: String, // "09:00"
    end: String    // "10:00"
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  price: {
    type: Number,
    required: true
  },
  notes: {
    customerNotes: String,
    providerNotes: String,
    internalNotes: String
  },
  location: {
    type: String,
    enum: ['clinic', 'home', 'online'],
    default: 'clinic'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  reminder: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  },
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    scheduledDate: Date,
    completed: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

appointmentSchema.index({ customer: 1, appointmentDate: 1 });
appointmentSchema.index({ provider: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
