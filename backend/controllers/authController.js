const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword });
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '365d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, message: 'Registration Accepted' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    
    // Password-ஐயும் சேர்த்து எடுக்கும்படி .select('+password') சேர்க்கிறோம்
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid Credentials' });
    }
    
    console.log('User found, comparing password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    console.log('Login successful for:', email);
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '365d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, message: 'Login Accepted' });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server Error');
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const songId = req.params.id;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('Toggle favorite error: User not found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if song is already liked (comparing as strings)
    const isLiked = user.likedSongs.some(id => id && id.toString() === songId);
    
    const update = isLiked 
      ? { $pull: { likedSongs: songId } } 
      : { $addToSet: { likedSongs: songId } };

    // Validate req.user.id before Mongoose operation
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) return res.status(400).json({ message: 'Invalid User ID format' });
    await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: false });
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Toggle favorite error in controller:', err.name, err.message, err.stack);
    res.status(500).json({ message: 'Error updating favorites', error: err.message, stack: err.stack });
  }
};

exports.uploadProfile = async (req, res) => {
  try {
    // Check if the uploads folder is correctly resolved
    if (!req.file) {
       console.error('Upload Error: No file provided in request');
       return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if auth middleware provided the user
    if (!req.user || !req.user.id) {
      console.error('Profile Upload Error: No user ID found in request. Token might be invalid or missing.');
      return res.status(401).json({ message: 'Unauthorized: User not identified' });
    }

    // Validate req.user.id as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      console.error('Profile Upload Error: Invalid user ID format:', req.user.id);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    console.log(`Uploading profile for user: ${req.user.id}, Filename: ${req.file.filename}`);
    console.log('Multer file object:', req.file); // Log the full Multer file object

    // Store as relative path for the frontend to resolve
    const imageUrl = `uploads/${req.file.filename}`.replace(/\\/g, '/');

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true, runValidators: false } // runValidators: false helps skip password validation
    ).select('-password');

    if (!user) {
      console.error('Profile Upload Error: User not found in DB for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' }); // Should not happen if authMiddleware works
    }

    console.log('Profile image updated successfully for user:', user._id);
    res.json(user);
  } catch (err) {
    console.error('Profile upload error in controller:', err.name, err.message, err.stack);
    if (err.name === 'CastError') { // Catch Mongoose CastError specifically
      return res.status(400).json({ message: 'Invalid User ID provided', error: err.message });
    }
    res.status(500).json({ message: 'Internal Server Error', error: err.message, stack: err.stack });
  }
};

exports.uploadGallery = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `uploads/${req.file.filename}`.replace(/\\/g, '/');

    // Validate req.user.id as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      console.error('Gallery Upload Error: Invalid user ID format:', req.user.id);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    console.log(`Uploading gallery photo for user: ${req.user.id}, Filename: ${req.file.filename}`);
    console.log('Multer file object:', req.file); // Log the full Multer file object

    // Use findByIdAndUpdate to avoid validation issues with the select:false password field
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { photoGallery: imageUrl } },
      { new: true, runValidators: false }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    console.log('Gallery photo added successfully for user:', updatedUser._id);
    res.json(updatedUser);
  } catch (err) {
    console.error('Gallery upload error in controller:', err.name, err.message, err.stack);
    if (err.name === 'CastError') { // Catch Mongoose CastError specifically
      return res.status(400).json({ message: 'Invalid User ID provided', error: err.message });
    }
    res.status(500).json({ message: 'Internal Server Error', error: err.message, stack: err.stack });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { photoGallery: photoUrl } },
      { new: true, runValidators: false }
    ).select('-password');

    if (!updatedUser) {
      console.error('Delete Gallery Error: User not found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Delete gallery error in controller:', err.name, err.message, err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message, stack: err.stack });
  }
};