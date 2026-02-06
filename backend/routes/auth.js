const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getUser, 
    toggleFavorite, 
    uploadProfile, 
    uploadGallery, 
    deleteGallery 
} = require('../controllers/authController');
const auth = require('../middleware/auth');
// Use the same multer middleware configured for songs
const upload = require('../middleware/multer');

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getUser);

// These routes were missing, causing 404 errors from Home and Profile pages.
router.put('/favorites/:id', auth, toggleFavorite);
router.post('/upload-profile', auth, upload.fields([{ name: 'profileImage', maxCount: 1 }]), uploadProfile);
router.post('/upload-gallery-photo', auth, upload.fields([{ name: 'galleryPhoto', maxCount: 1 }]), uploadGallery);
router.delete('/gallery-photo', auth, deleteGallery);

module.exports = router;