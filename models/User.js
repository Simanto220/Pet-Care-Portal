const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    phoneVerified: { type: Boolean, default: false},
    facebookId: { type: String, unique: true, sparse: true },
    password: { type: String},
    role: { type: String, required: true, default: "user" },                    // ["user", "admin"]
    status: { type: String, default: "Active" },                                // ["Active", "Inactive"]
    licenseNumber: { type: String },
    specialization: { type: String },
    clinicName: { type: String },
    isApprovedVet: { type: Boolean, default: false },
    petsOwned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }],
    profilePhoto: { type: String },
    location: { type: String },
    bio: { type: String },
    temporaryAdoptions: [
        {
            petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },        
            adoptionEndDate: { type: Date }
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

  