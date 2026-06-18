const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false // Password-ஐ API response-ல் அனுப்பாமல் இருக்க
  },
  profileImage: { // Profile படத்திற்கான பீல்டு
    type: String,
    default: 'uploads/default-profile.png' // Default படம்
  },
  photoGallery: { // Gallery படங்களுக்கான பீல்டு
    type: [String],
    default: []
  },
  likedSongs: [ // பிடித்த பாடல்களுக்கான பீல்டு
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    }
  ]
}, {
  timestamps: true // createdAt மற்றும் updatedAt தானாகச் சேர்க்க
});

module.exports = mongoose.model('User', UserSchema);