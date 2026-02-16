const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
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
    
    // Check if song is already liked
    const index = user.likedSongs.indexOf(songId);
    if (index === -1) {
      user.likedSongs.push(songId); // Add to likes
    } else {
      user.likedSongs.splice(index, 1); // Remove from likes
    }
    
    await user.save();
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.uploadProfile = async (req, res) => {
  try {
    if (!req.files || !req.files.profileImage) {
       return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = req.files.profileImage[0].path; 

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.uploadGallery = async (req, res) => {
  try {
    if (!req.files || !req.files.galleryPhoto) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = req.files.galleryPhoto[0].path;

    const user = await User.findById(req.user.id);
    user.photoGallery.push(imageUrl);
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const user = await User.findById(req.user.id);
    
    user.photoGallery = user.photoGallery.filter(photo => photo !== photoUrl);
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};