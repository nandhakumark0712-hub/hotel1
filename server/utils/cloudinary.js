const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use disk storage for temp files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

/**
 * Uploads a file to Cloudinary and deletes the local copy
 * @param {string} localPath - Path to the local file
 * @returns {Promise<string>} - The Cloudinary secure URL
 */
const uploadToCloudinary = async (localPath) => {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'hotel-booking',
      resource_type: 'auto'
    });
    
    // Delete local file
    fs.unlinkSync(localPath);
    
    console.log(`[Cloudinary] Successfully uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    console.error('[Cloudinary] Upload failed:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = { cloudinary, upload, uploadToCloudinary };
