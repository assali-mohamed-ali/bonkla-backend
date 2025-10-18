const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Follow = require('../models/Follow');
const auth = require('../middleware/auth');
// GET all users
router.get('/',auth, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// POST create user (basic test, sans auth sécurisée)
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get current user (me)
router.get('/me', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('_id username email role');
    if (!me) return res.status(404).json({ message: 'User not found' });
    res.json(me);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Search users by username or email (public)
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  
  // Log the search query for debugging
  console.log('Search query:', q);
  
  if (!q) {
    console.log('Empty search query');
    return res.json([]);
  }

  try {
    const regex = new RegExp(q, 'i');
    const users = await User.find({
      $or: [
        { username: regex },
        { email: regex }
      ]
    })
    .select('_id username email')
    .limit(20); // Limit results for better performance

    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (e) {
    console.error('Search error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Get user by id (public minimal)
router.get('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('_id username email role');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Follow a user
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followedId = req.params.id;
    if (followerId === followedId) return res.status(400).json({ message: 'Cannot follow yourself' });
    const exists = await Follow.findOne({ followerId, followedId });
    if (exists) return res.status(200).json({ message: 'Already following' });
    await Follow.create({ followerId, followedId });
    res.json({ message: 'Followed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Unfollow a user
router.delete('/follow/:id', auth, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followedId = req.params.id;
    await Follow.deleteOne({ followerId, followedId });
    res.json({ message: 'Unfollowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Follow status
router.get('/follow/status/:id', auth, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followedId = req.params.id;
    const exists = await Follow.findOne({ followerId, followedId });
    res.json({ following: !!exists });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Counts
router.get('/:id/followers/count', async (req, res) => {
  try {
    const count = await Follow.countDocuments({ followedId: req.params.id });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id/following/count', async (req, res) => {
  try {
    const count = await Follow.countDocuments({ followerId: req.params.id });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
