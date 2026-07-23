const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema({
    adoptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetAdoption', required: true },
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, required: true, default: "under review" },                       // ["under review", "meet scheduled", "approved", "rejected"]
    meetingDate: { type: Date },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema);
  