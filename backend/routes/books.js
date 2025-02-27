const express = require('express');
const router = express.Router();
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const { BadRequestError, NotFoundError } = require('../helpers/expressError');
const Book = require('../models/bookModel');

/**
 * books.js
 *
 * Provides routes under the /books endpoint for managing and retrieving book data.
 * This includes:
 *  - Listing and searching books
 *  - Viewing book details
 *  - Creating and deleting books (admin-only)
 *
 * Authorization Notes:
 *  - Most routes require the user to be logged in.
 *  - Certain routes (like creation/deletion) require admin privileges.
 */

/**
 * GET /books
 * Retrieves all books with their authors and topics.
 *
 * Authorization required: Any logged-in user.
 *
 * @returns {Object[]} 200 - List of books with authors and topics.
 * @example Response:
 * [
 *   {
 *     "id": 1,
 *     "title": "The Hobbit",
 *     "cover_image": "https://example.com/hobbit.jpg",
 *     "year_published": 1937,
 *     "synopsis": "A hobbit embarks on a journey...",
 *     "authors": ["J.R.R. Tolkien"],
 *     "topics": ["Fantasy", "Adventure"]
 *   }
 * ]
 */
router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Default to page 1
        const limit = parseInt(req.query.limit) || 20;  // Default to 20 books per page

        const data = await Book.getAllBooks(page, limit);
        res.json(data);
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
 * @returns {Object[]} 200 - List of matching books with authors and topics.
 * @example Request:
 * GET /books/search?title=harry
 *
 * @example Response:
 * [
 *   {
 *     "id": 2,
 *     "title": "Harry Potter and the Sorcerer's Stone",
 *     "cover_image": "https://example.com/hp1.jpg",
 *     "year_published": 1997,
 *     "synopsis": "A young wizard discovers his magical heritage...",
 *     "authors": ["J.K. Rowling"],
 *     "topics": ["Magic", "Adventure"]
 *   }
 * ]
 */
router.get('/search', ensureLoggedIn, async (req, res, next) => {
    try {
        const { title, author, topic, page = 1, limit = 20 } = req.query;

        const books = await Book.searchBooks({ title, author, topic, page, limit });

        res.json({ books: books.books, totalBooks: books.totalBooks });
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /books/search/dynamic
 * Dynamically searches books by a query string (title or author),
 * expecting at least 3 characters before returning results.
 *
 * Authorization required: None (public endpoint).
 *
 * @returns {Object[]} 200 - List of matching books.
 * @example Request:
 * GET /books/search/dynamic?query=ring
 *
 * @example Response:
 * [
 *   {
 *     "id": 3,
 *     "title": "The Lord of the Rings",
 *     "cover_image": "https://example.com/lotr.jpg",
 *     "year_published": 1954,
 *     "authors": ["J.R.R. Tolkien"]
 *   }
 * ]
 */
router.get("/search/dynamic", ensureLoggedIn, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 3) {
            return res.json([]); // Return empty list if query is too short
        }

        const books = await Book.searchBooksByQuery(query);
        res.json(books);
    } catch (error) {
        console.error("Error searching books:", error);
        res.status(500).json({ error: "Server error while searching books." });
    }
});


/**
 * GET /books/:id
 * Retrieves details of a single book by its ID, including authors and topics.
 *
 * Authorization required: Any logged-in user.
 *
 * @param {string} id - The book's ID.
 *
 * @returns {Object} 200 - The book details with authors and topics.
 * @example Request:
 * GET /books/1
 *
 * @example Response:
 * {
 *   "id": 1,
 *   "title": "The Hobbit",
 *   "cover_image": "https://example.com/hobbit.jpg",
 *   "year_published": 1937,
 *   "synopsis": "A hobbit embarks on a journey...",
 *   "authors": ["J.R.R. Tolkien"],
 *   "topics": ["Fantasy", "Adventure"]
 * }
 */
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const book = await Book.getBookById(req.params.id);
        if (!book) throw new NotFoundError(`Book with ID ${req.params.id} not found.`);
        res.json(book);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
