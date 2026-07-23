const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Null for top-level comments
    createdAt: { type: Date, default: Date.now }
});

const petAdoptionSchema = new mongoose.Schema({
    PetID: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, unique: true },
    AdoptionDescription: { type: String, required: true },
    adoptionType: { type: String, required: true }, // ["permanent", "temporary"]
    ReturnDate: { type: Date },
    comments: [commentSchema], // Embedding comments inside PetAdoption
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PetAdoption', petAdoptionSchema);
