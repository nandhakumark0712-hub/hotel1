const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinary } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            console.error('[Upload API] No file found in req.file');
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        console.log(`[Upload API] Temporary file created: ${req.file.path}`);
        
        // Manual upload to Cloudinary and deletion of local file
        const secureUrl = await uploadToCloudinary(req.file.path);
        
        // Return only the Cloudinary secure URL
        res.status(200).json({ 
            success: true, 
            url: secureUrl,
            message: 'Image uploaded successfully to Cloudinary' 
        });
    } catch (error) {
        console.error('[Upload API] Image upload error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Internal server error during image upload' });
    }
});

module.exports = router;
