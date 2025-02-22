const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/auth');
const { BadRequestError, NotFoundError } = require('../helpers/expressError');
const Author = require('../models/authorModel');

/**
 * authors.js
 *
 * Provides routes under the /authors endpoint for retrieving and searching
 * author data. Includes:
 *  - Basic list of authors
 *  - Detailed author info with books and topics
 *  - Search functionality by author name
 *
 * Authorization required for all routes: Any logged-in user.
 */

/**
 * GET /authors
 * Retrieves a simple list of authors with their IDs.
 *
 * Authorization required: Any logged-in user.
 *
 * @returns {Object[]} 200 - List of authors
 */
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const authors = await Author.getAllAuthors();
        if (authors.length === 0) throw new NotFoundError("No authors found.");
        res.json(authors);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /authors/details
 * Retrieves a list of authors, each with their books and topics.
 *
 * Authorization required: Any logged-in user.
 *
 * @returns {Object[]} 200 - List of authors with books and topics.
 */
router.get('/details', ensureLoggedIn, async (req, res, next) => {
    try {
        const authors = await Author.getAuthorsWithBooks();
        if (authors.length === 0) throw new NotFoundError("No authors found.");
        res.json(authors);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /authors/search
 * Searches for authors by name and returns detailed info (books & topics).
 *
 * Query parameters:
 *  - name (string) - A word or phrase to match author names (case-insensitive).
 *
 * Authorization required: Any logged-in user.
 *
 * @returns {Object[]} 200 - List of matching authors with books and topics.
 */
router.get('/search', ensureLoggedIn, async (req, res, next) => {
    try {
        const { name } = req.query;
        if (!name) throw new BadRequestError("Query parameter 'name' is required.");

        const authors = await Author.searchAuthorsByName(name);
        if (authors.length === 0) throw new NotFoundError("No authors found matching your search.");
        res.json(authors);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
