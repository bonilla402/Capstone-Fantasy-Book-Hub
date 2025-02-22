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
const messagesRoutes = require('./messages');

/**
 * index.js (routes/index.js)
 *
 * This file serves as the central point for combining all sub-route modules:
 *  - Auth
 *  - Users
 *  - Books
 *  - Authors
 *  - Topics
 *  - Reviews
 *  - Groups
 *  - Discussions
 *  - Messages
 *
 * The routes are mounted here and will be prefixed in `app.js` with /api.
 * Example: `/api/books`, `/api/auth`, etc.
 */

// Use routes (the '/api' prefix is applied in app.js)
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/books', bookRoutes);
router.use('/authors', authorRoutes);
router.use('/topics', topicRoutes);
router.use('/reviews', reviewRoutes);
router.use('/groups', groupsRoutes);
router.use('/discussions', discussionsRoutes);
router.use('/messages', messagesRoutes);

module.exports = router;
