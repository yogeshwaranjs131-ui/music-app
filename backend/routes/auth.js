const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  res.send('Register Route Working');
});

router.post('/login', (req, res) => {
  res.send('Login Route Working');
});

module.exports = router;