const express = require('express');
const router = express.Router();
const multer = require('multer');
const Song = require('../models/Song');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'music-app-songs', // Cloudinary folder name
    resource_type: 'auto', // Automatically detect audio/image
    allowed_formats: ['mp3', 'wav', 'jpg', 'jpeg', 'png']
  }
});
const upload = multer({ storage: storage });

// @route   GET /api/songs
// @desc    Get all songs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/songs
// @desc    Add a new song
// @access  Private
router.post('/', auth, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, singer, movie, album } = req.body;
    let audioUrl = '';
    let coverImage = '';

    if (req.files['audio']) {
        audioUrl = req.files['audio'][0].path; // Cloudinary URL
    }
    if (req.files['coverImage']) {
        coverImage = req.files['coverImage'][0].path; // Cloudinary URL
    }

    const newSong = new Song({
        title, artist, singer, movie, album, audioUrl, coverImage
    });

    const song = await newSong.save();
    res.json(song);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;