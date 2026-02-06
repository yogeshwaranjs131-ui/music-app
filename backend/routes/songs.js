const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

// Upload a song (Audio + Image)
router.post('/', auth, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, album } = req.body;
    const audioFile = req.files.audio ? req.files.audio[0] : null;
    const imageFile = req.files.coverImage ? req.files.coverImage[0] : null;

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

// Delete a song
router.delete('/:id', auth, async (req, res) => {
  try {
    // TODO: Add a check to ensure only an admin can delete.
    // For example: if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const song = await Song.findByIdAndDelete(req.params.id);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // You should also add logic here to delete the actual files from your storage.

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting song', error: error.message });
  }
});

module.exports = router;