const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Import your actual route files. Make sure the paths are correct.
const songRoutes = require('./routes/songs');
const authRoutes = require('./routes/auth');
const playlistsRoutes = require('./routes/playlists');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - The paths here MUST match the paths used in your frontend api calls
app.use('/songs', songRoutes);
app.use('/auth', authRoutes);
app.use('/playlists', playlistsRoutes);

app.get('/', (req, res) => {
  res.send('Music App Backend is Running');
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});