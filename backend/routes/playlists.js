const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth'); // Assume you have JWT middleware

// Get all playlists for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.id }).populate('songs');
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching playlists' });
  }
});

// Get specifically the "Liked Songs" / Favorites
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('likedSongs');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user.likedSongs || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching liked songs' });
  }
});

// Get a specific playlist by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'username')
      .populate('songs');
      
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching playlist' });
  }
});

// Create a new playlist
router.post('/', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Playlist name is required' });

  try {
    const newPlaylist = new Playlist({
      name,
      owner: req.user.id,
      songs: []
    });

    const savedPlaylist = await newPlaylist.save();
    res.status(201).json(savedPlaylist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating playlist' });
  }
});

module.exports = router;