const Playlist = require('../models/Playlist');

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

exports.getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id }).populate('songs');
    res.json(playlists);
  } catch (err) {
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
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }
    res.json(playlist);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
