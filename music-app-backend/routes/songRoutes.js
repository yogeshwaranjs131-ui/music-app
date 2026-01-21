const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSongs, likeSong, addComment } = require('../controllers/songController');

router.get('/', getSongs);
router.put('/like/:id', auth, likeSong);
router.post('/comment/:id', auth, addComment);

module.exports = router;
