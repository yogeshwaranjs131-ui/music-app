const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  genre: { type: String },
  coverImage: { type: String }, // URL to image
  audioUrl: { type: String, required: true }, // URL to audio file (Cloudinary/S3)
  duration: { type: Number }, // in seconds
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema]
}, { timestamps: true });

// Index for search functionality
SongSchema.index({ title: 'text', artist: 'text', album: 'text' });

module.exports = mongoose.model('Song', SongSchema);
