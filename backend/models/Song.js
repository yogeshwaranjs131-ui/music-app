const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  songUrl: { type: String, required: true }, // Cloudinary URL
  imageUrl: { type: String, required: true }, // Cloudinary URL
  duration: { type: Number },
  album: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);