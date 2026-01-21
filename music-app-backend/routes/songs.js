const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Song = require('../models/Song');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
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
// @desc    Add a song (Optional: for testing purposes)
// @access  Public
router.post('/', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, singer, movie, album } = req.body;
    let audioUrl = '';
    let coverImage = '';

    if (req.files['audio']) {
        audioUrl = `http://localhost:5000/uploads/${req.files['audio'][0].filename}`;
    }
    if (req.files['coverImage']) {
        coverImage = `http://localhost:5000/uploads/${req.files['coverImage'][0].filename}`;
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