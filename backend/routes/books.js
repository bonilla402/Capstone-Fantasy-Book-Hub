const express = require('express');
const router = express.Router();
const Book = require('../models/bookModel');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');

/**
 * GET /books
 * Retrieves all books.
 *
 * Authorization required: Any logged-in user.
 *
 * @returns {Object[]} 200 - List of books
 * @example Response:
 * [
 *   {
 *     "id": 1,
 *     "title": "The Hobbit",
 *     "cover_image": "https://example.com/hobbit.jpg",
 *     "year_published": 1937,
 *     "synopsis": "A hobbit embarks on a journey...",
 *     "created_at": "2024-02-06T12:00:00.000Z"
 *   }
 * ]
 */
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const books = await Book.getAllBooks();
        res.json(books);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /books/search
 * Searches for books by title, author, or topic.
 *
 * Query parameters (optional):
 *  - title (string) - Partial title match (case-insensitive).
 *  - author (string) - Partial author name match (case-insensitive).
 *  - topic (string) - Partial topic match (case-insensitive).
 *
 * Authorization required: Any logged-in user.
 *
 * @returns {Object[]} 200 - List of matching books
 * @example Response:
 * [
 *   {
 *     "id": 2,
 *     "title": "Harry Potter and the Sorcerer's Stone",
 *     "cover_image": "https://example.com/hp1.jpg",
 *     "year_published": 1997,
 *     "synopsis": "A young wizard discovers his magical heritage...",
 *     "created_at": "2024-02-06T12:00:00.000Z"
 *   }
 * ]
 */
router.get('/search', ensureLoggedIn, async (req, res, next) => {
    try {
        const { title, author, topic } = req.query;
        const books = await Book.searchBooks({ title, author, topic });
        res.json(books);
    } catch (err) {
        return next(err);
    }
});

/**
 * POST /books
 * Adds a new book to the database.
 *
 * Request body parameters:
 *  - title (string) [required]
 *  - coverImage (string) [required]
 *  - yearPublished (integer) [required]
 *  - synopsis (string) [required]
 *
 * Authorization required: Admin only.
 *
 * @returns {Object} 201 - The newly added book
 * @example Response:
 * {
 *   "id": 3,
 *   "title": "Mistborn: The Final Empire",
 *   "cover_image": "https://example.com/mistborn.jpg",
 *   "year_published": 2006,
 *   "synopsis": "A criminal mastermind discovers he has the power of Allomancy...",
 *   "created_at": "2024-02-06T12:00:00.000Z"
 * }
 */
router.post('/', ensureAdmin, async (req, res, next) => {
    try {
        const { title, coverImage, yearPublished, synopsis } = req.body;
        if (!title || !coverImage || !yearPublished || !synopsis) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const newBook = await Book.createBook(title, coverImage, yearPublished, synopsis);
        res.status(201).json(newBook);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
