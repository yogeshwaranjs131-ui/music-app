const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createPlaylist, getUserPlaylists, addSongToPlaylist } = require('../controllers/playlistController');

router.post('/', auth, createPlaylist);
router.get('/', auth, getUserPlaylists);
router.put('/add/:id', auth, addSongToPlaylist);

module.exports = router;
