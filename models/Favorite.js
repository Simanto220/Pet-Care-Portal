const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    postId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'PetAdoption', 
        required: true 
    },
    postType: { 
        type: String, 
        enum: ['adoption'], 
        default: 'adoption' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Create compound index to ensure a user can't favorite the same post twice
favoriteSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
