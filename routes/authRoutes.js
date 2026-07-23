const express = require('express');
const router = express.Router();
const uploadImage = require('../middlewares/uploadImageHandler'); // Import the new upload handler
const { createNewUser, loginUser, sendOtp, verifyOtp } = require('../controllers/authController');

router.post('/signup', uploadImage.single('profilePhoto'), createNewUser); // Apply multer middleware

router.post('/login', loginUser);

// router.post('/otp/send', sendOtp);

// router.post('/otp/verify', verifyOtp);

module.exports = router;
