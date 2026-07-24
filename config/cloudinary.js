const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "fygjige4",
  api_key: process.env.CLOUDINARY_API_KEY || "949654154997865",
  api_secret: process.env.CLOUDINARY_API_SECRET || "kfM26jE01t3tw4VEKNLX1CTTOTk",
});

module.exports = cloudinary;
