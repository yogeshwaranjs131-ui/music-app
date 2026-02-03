const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Playlists Route Working');
});

module.exports = router;