const Song = require('../models/Song');
const User = require('../models/User');

// Get all songs or search
exports.getSongs = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = { $text: { $search: search } };
    }

    const songs = await Song.find(query);
    res.json(songs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Like a song
exports.likeSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ msg: 'Song not found' });

    // Check if already liked
    if (song.likes.includes(req.user.id)) {
      // Unlike
      song.likes = song.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // Like
      song.likes.push(req.user.id);
    }

    await song.save();
    res.json(song.likes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const song = await Song.findById(req.params.id);
    
    const newComment = {
      user: req.user.id,
      username: user.username,
      text: req.body.text
    };

    song.comments.unshift(newComment);
    await song.save();
    res.json(song.comments);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
