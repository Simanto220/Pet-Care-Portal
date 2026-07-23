const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const petId = path.basename(req.params.id); // Sanitize petId
            const dir = path.join(__dirname, '../uploads/photos', petId);

            if (!fs.existsSync(dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
                console.log("Directory created:", dir);
            }

            cb(null, dir);
        } catch (err) {
            console.error("Error creating directory:", err.message);
            cb(new Error("Failed to create directory for photo upload"));
        }
    },
    filename: (req, file, cb) => {
        const petId = path.basename(req.params.id);
        const now = new Date();
        const creationDate = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
        const serial = String(Date.now()).slice(-5);
        
        const uniqueName = `${petId}_${creationDate}_${serial}${path.extname(file.originalname)}`;
        console.log("Generated filename:", uniqueName);
        cb(null, uniqueName);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype)) {
        return cb(null, true);
    }
    cb(new Error("Only images are allowed"));
};

// Multer config
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter,
});

module.exports = upload;
