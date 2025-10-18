const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// POST /api/posts
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file provided' });
    }

    // Basic logging to trace upload issues
    console.log('Upload received:', {
      userId: req.user && req.user.id,
      mime: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const newPost = new Post({
      userId: req.user.id,
      mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      mediaUrl: req.file.path, // Cloudinary URL
      description: req.body.description
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error('POST /api/posts error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// GET /api/posts - Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/user/:id - Get posts by user
router.get('/user/:id', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
