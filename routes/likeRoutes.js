const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// POST /api/likes - Like a post
router.post('/', auth, async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ postId, userId });
    if (existingLike) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    // Create new like
    const newLike = new Like({ postId, userId });
    await newLike.save();

    // Update likes count in post
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    res.status(201).json({ message: 'Post liked successfully', like: newLike });
  } catch (err) {
    console.error('POST /api/likes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/likes/:postId - Unlike a post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const like = await Like.findOneAndDelete({ postId, userId });
    if (!like) {
      return res.status(404).json({ error: 'Like not found' });
    }

    // Update likes count in post
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

    res.json({ message: 'Post unliked successfully' });
  } catch (err) {
    console.error('DELETE /api/likes/:postId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/likes/:postId - Get like status for a post
router.get('/:postId/status', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const like = await Like.findOne({ postId, userId });
    res.json({ liked: !!like });
  } catch (err) {
    console.error('GET /api/likes/:postId/status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/likes/:postId/count - Get like count for a post
router.get('/:postId/count', async (req, res) => {
  try {
    const { postId } = req.params;
    const count = await Like.countDocuments({ postId });
    res.json({ count });
  } catch (err) {
    console.error('GET /api/likes/:postId/count error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/likes/user/:userId - Get all likes by a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const likes = await Like.find({ userId }).populate('postId', 'mediaUrl mediaType description createdAt');
    res.json(likes);
  } catch (err) {
    console.error('GET /api/likes/user/:userId error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
