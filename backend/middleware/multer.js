const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'music-app',
    resource_type: 'auto',
    public_id: (req, file) => {
      // Sanitize filename and make it unique
      const fileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      return `${Date.now()}-${fileName}`;
    },
  },
});

const upload = multer({ storage: storage });

module.exports = upload;