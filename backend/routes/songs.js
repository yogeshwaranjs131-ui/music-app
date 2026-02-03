const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const Song = require('../models/Song');

// Upload a song (Audio + Image)
router.post('/upload', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, album } = req.body;
    const audioFile = req.files.audio ? req.files.audio[0] : null;
    const imageFile = req.files.image ? req.files.image[0] : null;

    if (!audioFile || !imageFile) {
      return res.status(400).json({ message: 'Audio and Image files are required' });
    }

    const newSong = new Song({
      title,
      artist,
      album,
      songUrl: audioFile.path, // Cloudinary URL
      imageUrl: imageFile.path, // Cloudinary URL
    });

    await newSong.save();
    res.status(201).json(newSong);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading song', error: error.message });
  }
});

// Get all songs
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find();
    res.status(200).json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching songs', error: error.message });
  }
});

module.exports = router;