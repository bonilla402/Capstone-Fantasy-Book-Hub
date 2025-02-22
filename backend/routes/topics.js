const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/auth');
const { BadRequestError, NotFoundError } = require('../helpers/expressError');
const Topic = require('../models/topicModel');

/**
 * topics.js
 *
 * This file provides endpoints for retrieving and searching topic data.
 * Routes require the user to be logged in. Endpoints include:
 *  - Listing all topics
 *  - Retrieving detailed topics (with associated books and authors)
 *  - Searching topics by name
 */

/**
 * GET /topics
 * Retrieves a list of all possible topics with their IDs.
 *
 * Authorization required: Any logged-in user.
 *
 * @returns {Object[]} 200 - List of topics
 */
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const topics = await Topic.getAllTopics();
        if (topics.length === 0) throw new NotFoundError("No topics found.");
        res.json(topics);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /topics/details
 * Retrieves a list of topics, each with books and their authors.
 *
 * Authorization required: Any logged-in user.
 *
 * @returns {Object[]} 200 - List of topics with books and authors.
 */
router.get('/details', ensureLoggedIn, async (req, res, next) => {
    try {
        const topics = await Topic.getTopicsWithBooks();
        if (topics.length === 0) throw new NotFoundError("No topics found.");
        res.json(topics);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /topics/search
 * Searches for topics by name and returns detailed info (books & authors).
 *
 * Query parameters:
 *  - name (string) - A word or phrase to match topic names (case-insensitive).
 *
 * Authorization required: Any logged-in user.
 *
 * @returns {Object[]} 200 - List of matching topics with books and authors.
 */
router.get('/search', ensureLoggedIn, async (req, res, next) => {
    try {
        const { name } = req.query;
        if (!name) throw new BadRequestError("Query parameter 'name' is required.");

        const topics = await Topic.searchTopicsByName(name);
        if (topics.length === 0) throw new NotFoundError("No topics found matching your search.");
        res.json(topics);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
