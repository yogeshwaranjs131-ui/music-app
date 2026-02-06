const Playlist = require('../models/Playlist');
const User = require('../models/User');

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, songs } = req.body;
    const newPlaylist = new Playlist({
      name,
      description,
      user: req.user.id,
      songs: songs || []
    });
    const playlist = await newPlaylist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getFavoriteSongs = async (req, res) => {
  try {
    // Find the user by their ID (from the auth middleware) and populate the 'likedSongs' field.
    // 'populate' will replace the song ObjectIDs in the array with the full song documents.
    const user = await User.findById(req.user.id).populate({
      path: 'likedSongs',
      model: 'Song'
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user.likedSongs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id }).populate('songs');
    res.json(playlists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.addSongToPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ msg: 'Playlist not found' });
    
    if (playlist.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const { songId } = req.body;
    if (!playlist.songs.some(id => id.toString() === songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }
    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate({
        path: 'songs',
        model: 'Song'
      })
      .populate('user', 'username');

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
