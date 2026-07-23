const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Upload handler for pet creation (stores files temporarily)
const createPetStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            // Store in a temporary directory during creation
            const dir = path.join(__dirname, '../uploads/temp');

            if (!fs.existsSync(dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
                console.log("Temp directory created:", dir);
            }

            cb(null, dir);
        } catch (err) {
            console.error("Error creating temp directory:", err.message);
            cb(new Error("Failed to create temp directory for photo upload"));
        }
    },
    filename: (req, file, cb) => {
        const now = new Date();
        const creationDate = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
        const serial = String(Date.now()).slice(-5);
        
        const uniqueName = `temp_${creationDate}_${serial}${path.extname(file.originalname)}`;
        console.log("Generated temp filename:", uniqueName);
        cb(null, uniqueName);
    }
});

const uploadCreate = multer({
    storage: createPetStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
    },
    fileFilter: (req, file, cb) => {
        console.log("Multer Filter - originalname:", file.originalname, "mimetype:", file.mimetype);
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.log("Multer Filter REJECTED - mimetype not allowed:", file.mimetype);
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

module.exports = uploadCreate;
