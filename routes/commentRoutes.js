const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/comments - Create a comment
router.post('/', auth, async (req, res) => {
  try {
    const { postId, text } = req.body;
    const userId = req.user.id;

    console.log('Creating comment:', { postId, text, userId });

    if (!postId || !text) {
      console.log('Missing required fields:', { postId: !!postId, text: !!text });
      return res.status(400).json({ error: 'Post ID and text are required' });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      console.log('Post not found:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create new comment
    const newComment = new Comment({ postId, userId, text });
    await newComment.save();

    console.log('Comment saved:', newComment._id);

    // Populate user info for response
    const commentWithUser = await Comment.findById(newComment._id)
      .populate('userId', 'username')
      .select('-__v');

    // Update comments count in post
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    console.log('Comment created successfully:', commentWithUser);

    res.status(201).json({ message: 'Comment created successfully', comment: commentWithUser });
  } catch (err) {
    console.error('POST /api/comments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/comments/:postId/count - Get comment count for a post (must be before /:postId)
router.get('/:postId/count', async (req, res) => {
  try {
    const { postId } = req.params;
    const count = await Comment.countDocuments({ postId });
    res.json({ count });
  } catch (err) {
    console.error('GET /api/comments/:postId/count error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/comments/:postId - Get all comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    console.log('Getting comments for post:', postId);

    const comments = await Comment.find({ postId })
      .populate('userId', 'username')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ postId });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('GET /api/comments/:postId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/comments/:commentId - Delete a comment
router.delete('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findOne({ _id: commentId, userId });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }

    // Delete comment
    await Comment.findByIdAndDelete(commentId);

    // Update comments count in post
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/comments/:commentId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/comments/user/:userId - Get all comments by a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.find({ userId })
      .populate('postId', 'mediaUrl mediaType description createdAt')
      .populate('userId', 'username')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ userId });

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('GET /api/comments/user/:userId error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
