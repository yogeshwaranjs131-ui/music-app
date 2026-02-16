const Comment = require('../models/Comment');

exports.addComment = async (req, res) => {
  try {
    const { songId, text } = req.body;
    const newComment = new Comment({
      user: req.user.id,
      song: songId,
      text
    });
    await newComment.save();
    
    // Populate user details to return immediately (username, profile pic)
    const comment = await Comment.findById(newComment._id).populate('user', 'username profileImage');
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ song: req.params.songId })
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        // Check if the user deleting is the one who created it
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await comment.deleteOne();
        res.json({ msg: 'Comment removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};