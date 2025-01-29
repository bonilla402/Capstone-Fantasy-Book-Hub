const express = require('express');
const router = express.Router();

// Import individual route files
const authRoutes = require('./auth');
const userRoutes = require('./users');

// Use routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
