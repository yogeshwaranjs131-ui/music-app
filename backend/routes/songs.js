const express = require('express');
const router = express.Router();
const multer = require('multer');
const Song = require('../models/Song');
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'music-app-songs', // Cloudinary folder name
    resource_type: 'auto', // Automatically detect audio/image
    allowed_formats: ['mp3', 'wav', 'jpg', 'jpeg', 'png']
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
// @desc    Add a new song
// @access  Private
router.post('/', auth, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, singer, movie, album } = req.body;
    let audioUrl = '';
    let coverImage = '';

    if (req.files['audio']) {
        audioUrl = req.files['audio'][0].path; // Cloudinary URL
    }
    if (req.files['coverImage']) {
        coverImage = req.files['coverImage'][0].path; // Cloudinary URL
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

// @route   GET /api/songs/:id/comments
// @desc    Get comments for a song
// @access  Public
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ song: req.params.id })
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/songs/:id/comments
// @desc    Add a comment to a song
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const newComment = new Comment({
      text: req.body.text,
      user: req.user.id,
      song: req.params.id
    });
    const comment = await newComment.save();
    const populatedComment = await Comment.findById(comment._id).populate('user', 'username profileImage');
    res.json(populatedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/songs/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;