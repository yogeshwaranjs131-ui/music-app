const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addComment, getComments, deleteComment } = require('../controllers/commentController');

router.post('/', auth, addComment);
router.get('/:songId', getComments);
router.delete('/:id', auth, deleteComment);

module.exports = router;