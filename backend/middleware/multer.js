const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folderName = 'music-app/others';
    let resourceType = 'image';

    if (file.fieldname === 'audio') {
      folderName = 'music-app/songs';
      resourceType = 'video'; // Cloudinary treats audio as video
    } else if (file.fieldname === 'coverImage') {
      folderName = 'music-app/images';
      resourceType = 'image';
    }

    return {
      folder: folderName,
      resource_type: resourceType,
      public_id: file.originalname.split('.')[0] + '-' + Date.now(),
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image or audio file!'), false);
  }
};

module.exports = multer({ storage: storage, fileFilter: fileFilter });