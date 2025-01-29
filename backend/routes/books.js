const express = require('express');
const router = express.Router();
const Book = require('../models/bookModel');

router.get('/', async (req, res, next) => {
    try {
        const books = await Book.getAllBooks();
        res.json(books);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
