const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const Song = require('../models/Song'); // Assuming this model exists
const auth = require('../middleware/auth');
const { getLikedSongs } = require('../controllers/playlistController');

// @route   POST /api/playlists
// @desc    Create a new playlist
router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newPlaylist = new Playlist({
      name: name || 'My Playlist',
      owner: req.user.id,
      songs: [],
    });

    const playlist = await newPlaylist.save();
    user.playlists.push(playlist._id);
    await user.save();

    res.status(201).json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/playlists
// @desc    Get all playlists for a user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('playlists');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.playlists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/playlists/favorites
// @desc    Get all liked songs for the current user
// @access  Private
router.get('/favorites', auth, getLikedSongs);

// @route   GET /api/playlists/:id
// @desc    Get a single playlist by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate('songs').populate('owner', 'username');
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }
        if (playlist.owner._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized' });
        }
        res.json(playlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/playlists/:id/songs
// @desc    Add a song to a playlist
router.put('/:id/songs', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { songId } = req.body;
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }
    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;