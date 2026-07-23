const express = require('express');
const router = express.Router();
const {
    addToFavorites,
    removeFromFavorites,
    getUserFavorites,
    getFavoriteCount,
    checkFavoriteStatus
} = require('../controllers/favoriteController');

// Import auth middleware
const { jwtVerification } = require('../middlewares/authMiddleware');

// POST /favorites - Add post to favorites (requires auth)
router.post('/add', jwtVerification, addToFavorites);

// DELETE /favorites/:postId - Remove post from favorites (requires auth)
router.delete('/delete/:postId', jwtVerification, removeFromFavorites);

// GET /favorites/user/:userId - Get all favorites for a user (requires auth)
router.get('/user', jwtVerification, getUserFavorites);

// GET /favorites/count/:postId - Get favorite count for a post (no auth required)
router.get('/count/:postId', jwtVerification, getFavoriteCount);

// GET /favorites/check/:postId - Check if a post is favorited by user (requires auth)
router.get('/check/:postId', jwtVerification, checkFavoriteStatus);

module.exports = router;
