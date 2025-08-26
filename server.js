const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const UserRoutes = require('./routes/UserRoutes');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/users', UserRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
});

// Test route
app.get('/', (req, res) => {
  res.send('Bonkla backend is running ✅');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
