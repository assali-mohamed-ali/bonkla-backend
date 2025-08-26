const express = require('express');
const router = express.Router();
const User = require('../models/User');
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

module.exports = router;
