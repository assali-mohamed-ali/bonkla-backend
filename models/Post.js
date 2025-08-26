const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  mediaUrl: { type: String, required: true },
  description: String,
  Likes: { type: mongoose.Schema.Types.ObjectId, ref: 'Like' },
  Comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  shares: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
