const express = require('express');
const router = express.Router();

// Import individual route files
const authRoutes = require('./auth');
const userRoutes = require('./users');
const bookRoutes = require('./books');
const authorRoutes = require('./authors');
const topicRoutes = require('./topics');
const reviewRoutes = require('./reviews');
const groupsRoutes = require('./groups');
const discussionsRoutes = require('./discussions');

// Use routes (without '/api', since it's handled in app.js)
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/books', bookRoutes);
router.use('/authors', authorRoutes);
router.use('/topics', topicRoutes);
router.use('/reviews', reviewRoutes);
router.use('/groups', groupsRoutes);
router.use('/discussions', discussionsRoutes);

module.exports = router;
