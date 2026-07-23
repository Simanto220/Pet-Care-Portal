const mongoose = require('mongoose');

const adoptionHomeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    services: [
        {
            name: { type: String, required: true },
            description: { type: String, required: true },
            price: { type: Number, required: true },
            discount: { type: Number, required: true },
        }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdoptionHome', adoptionHomeSchema);