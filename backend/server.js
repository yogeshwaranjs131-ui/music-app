const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const path = require('path');

// Import your actual route files. Make sure the paths are correct.
const songRoutes = require('./routes/songs');
const authRoutes = require('./routes/auth');
const playlistsRoutes = require('./routes/playlistRoutes');
const commentRoutes = require('./routes/comments');

const app = express();

// Middleware
const corsOptions = {
  // Replace this with your deployed frontend URL on Netlify or Vercel
  origin: (origin, callback) => {
    const allowedOrigin = process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : true;
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigin === true || allowedOrigin === origin) {
      callback(null, true);
    } else {
      console.log(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());


// API Routes - The paths here MUST match the paths used in your frontend api calls
app.use('/api/songs', songRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
  res.send('Music App Backend is Running');
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});