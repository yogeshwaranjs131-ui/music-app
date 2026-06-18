const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const playlistRoutes = require('./routes/playlists');
const songRoutes = require('./routes/songs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/songs', songRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Basic Health Check
app.get('/', (req, res) => {
  res.send('Music Streaming API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/music-app')
  .then(() => {
    console.log('Connected to MongoDB');
    // Server தொடங்கும் போது குறிப்பிட்ட User-ஐ உருவாக்குகிறது அல்லது புதுப்பிக்கிறது
    seedMainUser();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

async function seedMainUser() {
  try {
    const email = 'yogeshwaranjs131@gmail.com';
    const rawPassword = 'Nathiya@123';
    const username = 'Yogeshwaran';
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);
      await User.findByIdAndUpdate(existingUser._id, 
        { $set: { password: hashedPassword } },
        { runValidators: false } // Skip password validation during update
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);
      await User.create({ username, email, password: hashedPassword });
    }
    console.log("Main user credentials are ready!");
  } catch (err) {
    console.error('Error seeding user:', err);
  }
}

module.exports = app;