const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const User = require('../models/User');

// Duplicated from auth.js for simplicity
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'YOUR_JWT_SECRET');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route   GET /api/comments/:songId
// @desc    Get all comments for a song
router.get('/:songId', async (req, res) => {
  try {
    const comments = await Comment.find({ song: req.params.songId })
      .populate('user', 'username profileImage')
      .sort({ createdAt: 'desc' });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/comments/:songId
// @desc    Add a comment to a song
router.post('/:songId', authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    const newComment = new Comment({
      text,
      user: req.user.id,
      song: req.params.songId,
    });

    const comment = await newComment.save();
    const populatedComment = await Comment.findById(comment._id).populate('user', 'username profileImage');
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;