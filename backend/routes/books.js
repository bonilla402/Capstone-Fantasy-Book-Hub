const express = require('express');
const router = express.Router();
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const { BadRequestError, NotFoundError } = require('../helpers/expressError');
const Book = require('../models/bookModel');

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
router.get("/", async (req, res, next) => {
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

router.get("/search/dynamic", async (req, res) => {
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
 * POST /books
 * Adds a new book to the database.
 *
 * Authorization required: Admin only.
 *
 * @body {string} title - Book title (required).
 * @body {string} coverImage - URL of the cover image (required).
 * @body {number} yearPublished - Year the book was published (required).
 * @body {string} synopsis - Brief summary of the book (required).
 *
 * @returns {Object} 201 - The newly added book.
 * @example Request:
 * POST /books
 * {
 *   "title": "Mistborn: The Final Empire",
 *   "coverImage": "https://example.com/mistborn.jpg",
 *   "yearPublished": 2006,
 *   "synopsis": "A criminal mastermind discovers he has the power of Allomancy..."
 * }
 *
 * @example Response:
 * {
 *   "id": 3,
 *   "title": "Mistborn: The Final Empire",
 *   "cover_image": "https://example.com/mistborn.jpg",
 *   "year_published": 2006,
 *   "synopsis": "A criminal mastermind discovers he has the power of Allomancy..."
 * }
 */
router.post('/', ensureAdmin, async (req, res, next) => {
    try {
        const { title, coverImage, yearPublished, synopsis } = req.body;
        if (!title || !coverImage || !yearPublished || !synopsis) {
            throw new BadRequestError("All fields (title, coverImage, yearPublished, synopsis) are required.");
        }

        const newBook = await Book.createBook(title, coverImage, yearPublished, synopsis);
        res.status(201).json(newBook);
    } catch (err) {
        return next(err);
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

/**
 * DELETE /books/:id
 * Deletes a book by ID.
 *
 * Authorization required: Admin only.
 *
 * @param {string} id - The book's ID.
 *
 * @returns {Object} 200 - Confirmation message.
 * @example Request:
 * DELETE /books/1
 *
 * @example Response:
 * {
 *   "message": "Book deleted."
 * }
 */
router.delete('/:id', ensureAdmin, async (req, res, next) => {
    try {
        const deletedBook = await Book.deleteBook(req.params.id);
        if (!deletedBook) throw new NotFoundError(`Book with ID ${req.params.id} not found.`);
        res.json({ message: "Book deleted." });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
