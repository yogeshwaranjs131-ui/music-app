const multer = require('multer');
const path = require('path');

// Local Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Middleware folder-ல் இருந்து ஒரு படி மேலே சென்று uploads folder-ஐக் குறிக்கிறோம்
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image or audio file!'), false);
  }
};

module.exports = multer({ storage: storage, fileFilter: fileFilter });