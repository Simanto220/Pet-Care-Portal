const express = require('express');
const router = express.Router();
const { getUserInfo, updateUserProfile } = require('../controllers/authController');
const { jwtVerification } = require('../middlewares/authMiddleware');
const uploadImage = require('../middlewares/uploadImageHandler'); // Import the upload handler

// Route to get user information
router.get("/userInfo", jwtVerification, getUserInfo);

// Route to update user profile
router.put('/updateProfile', jwtVerification, uploadImage.single('profilePhoto'), updateUserProfile);

module.exports = router;

