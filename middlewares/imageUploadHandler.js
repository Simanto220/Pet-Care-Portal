const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const fileFilter = (req, file, cb) => {
  const allowedType = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedType.includes(file.mimetype)) {
    cb(null, true);
  } else cb(null, false);
};

const profileImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
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

let uploadProfileImage = multer({ storage: profileImage, fileFilter });

module.exports = uploadProfileImage;