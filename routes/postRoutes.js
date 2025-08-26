const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// POST /api/posts
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const newPost = new Post({
      userId: req.user.id,
      mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      mediaUrl: req.file.path, // Cloudinary URL
      description: req.body.description
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
