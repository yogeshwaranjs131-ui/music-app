const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    createPlaylist, 
    getUserPlaylists, 
    addSongToPlaylist,
    getPlaylistById,
    getFavoriteSongs
} = require('../controllers/playlistController');

router.post('/', auth, createPlaylist);
router.get('/', auth, getUserPlaylists);
router.get('/favorites', auth, getFavoriteSongs); // For Liked Songs page
router.get('/:id', auth, getPlaylistById); // For a specific playlist page
router.put('/:id/songs', auth, addSongToPlaylist); // Changed from /add/:id to match frontend

module.exports = router;
