const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import your actual route files. Make sure the paths are correct.
const songRoutes = require('./routes/songs');
const authRoutes = require('./routes/auth');
const playlistsRoutes = require('./routes/playlists');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve static assets like images and audio files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes - The paths here MUST match the paths used in your frontend api calls
app.use('/songs', songRoutes);
app.use('/auth', authRoutes);
app.use('/playlists', playlistsRoutes);

app.get('/', (req, res) => {
  res.send('Music App Backend is Running');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((error) => console.log(error.message));