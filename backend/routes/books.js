﻿const express = require('express');
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
 */
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const books = await Book.getAllBooks();
        if (books.length === 0) throw new NotFoundError("No books found.");
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
 * @returns {Object[]} 200 - List of matching books with authors and topics.
 */
router.get('/search', ensureLoggedIn, async (req, res, next) => {
    try {
        const { title, author, topic } = req.query;
        if (!title && !author && !topic) {
            throw new BadRequestError("At least one search parameter (title, author, or topic) is required.");
        }

        const books = await Book.searchBooks({ title, author, topic });
        if (books.length === 0) throw new NotFoundError("No books found matching your search.");
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
 * @returns {Object} 201 - The newly added book.
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
 * @returns {Object} 200 - The book details with authors and topics.
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
 * @returns {Object} 200 - Confirmation message.
 */
router.delete('/:id', ensureAdmin, async (req, res, next) => {
    try {
        const deletedBook = await Book.deleteBook(req.params.id);
        if (!deletedBook) throw new NotFoundError(`Book with ID ${req.params.id} not found.`);
        res.json({ message: `Book with ID ${req.params.id} deleted.` });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
