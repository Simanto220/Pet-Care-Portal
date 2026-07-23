const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for temporary uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path.join(__dirname, '../uploads/temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase()) && (allowedTypes.test(file.mimetype) || file.mimetype === 'image/jpg')) {
        return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, gif, webp, avif) are allowed"));
};

const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: fileFilter,
});

module.exports = uploadImage;
