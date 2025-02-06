const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/auth');
const { UnauthorizedError, BadRequestError, NotFoundError } = require('../helpers/expressError');
const Review = require('../models/reviewModel');

/**
 * GET /reviews
 * Retrieves all reviews with user and book details.
 *
 * Authorization required: Any logged-in user.
 *
 * @returns {Object[]} 200 - List of all reviews.
 * @example Response:
 * [
 *   {
 *     "id": 1,
 *     "rating": 5,
 *     "review_text": "Amazing book!",
 *     "created_at": "2024-02-06T12:00:00.000Z",
 *     "user_id": 2,
 *     "user_name": "booklover",
 *     "book_id": 10,
 *     "book_title": "Dune"
 *   }
 * ]
 */
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const reviews = await Review.getAllReviews();
        if (reviews.length === 0) throw new NotFoundError("No reviews found.");
        res.json(reviews);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /reviews/book/:bookId
 * Retrieves all reviews for a specific book.
 *
 * Authorization required: Any logged-in user.
 *
 * @param {number} bookId - The ID of the book.
 *
 * @returns {Object[]} 200 - List of reviews for the book.
 * @example Response:
 * [
 *   {
 *     "id": 2,
 *     "rating": 4,
 *     "review_text": "Great read, but a bit slow at times.",
 *     "created_at": "2024-02-06T14:00:00.000Z",
 *     "user_id": 5,
 *     "user_name": "fantasyfan"
 *   }
 * ]
 */
router.get('/book/:bookId', ensureLoggedIn, async (req, res, next) => {
    try {
        const reviews = await Review.getReviewsByBook(req.params.bookId);
        if (reviews.length === 0) throw new NotFoundError("No reviews found for this book.");
        res.json(reviews);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /reviews/user/:userId
 * Retrieves all reviews written by a specific user.
 *
 * Authorization required: Any logged-in user.
 *
 * @param {number} userId - The ID of the user.
 *
 * @returns {Object[]} 200 - List of reviews by the user.
 * @example Response:
 * [
 *   {
 *     "id": 3,
 *     "rating": 5,
 *     "review_text": "One of my favorite books!",
 *     "created_at": "2024-02-06T16:30:00.000Z",
 *     "book_id": 12,
 *     "book_title": "The Hobbit"
 *   }
 * ]
 */
router.get('/user/:userId', ensureLoggedIn, async (req, res, next) => {
    try {
        const reviews = await Review.getReviewsByUser(req.params.userId);
        if (reviews.length === 0) throw new NotFoundError("No reviews found by this user.");
        res.json(reviews);
    } catch (err) {
        return next(err);
    }
});

/**
 * POST /reviews
 * Adds a new review for a book.
 *
 * Authorization required: Any logged-in user.
 *
 * @body {number} bookId - The ID of the book.
 * @body {number} rating - The rating (1-5).
 * @body {string} reviewText - Optional review text.
 *
 * @returns {Object} 201 - The newly added review.
 * @example Request:
 * POST /reviews
 * {
 *   "bookId": 12,
 *   "rating": 5,
 *   "reviewText": "A timeless classic!"
 * }
 *
 * @example Response:
 * {
 *   "id": 4,
 *   "user_id": 8,
 *   "book_id": 12,
 *   "rating": 5,
 *   "review_text": "A timeless classic!",
 *   "created_at": "2024-02-06T18:00:00.000Z"
 * }
 */
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const { bookId, rating, reviewText } = req.body;

        if (!bookId || !rating) {
            throw new BadRequestError("Book ID and rating are required.");
        }
        if (rating < 1 || rating > 5) {
            throw new BadRequestError("Rating must be between 1 and 5.");
        }

        const review = await Review.addReview(res.locals.user.userId, bookId, rating, reviewText);
        res.status(201).json(review);
    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /reviews/:id
 * Deletes a review.
 *
 * Authorization required: Admin or the user who wrote the review.
 *
 * @param {number} id - The review ID.
 *
 * @returns {Object} 200 - Confirmation message.
 * @example Request:
 * DELETE /reviews/4
 *
 * @example Response:
 * {
 *   "message": "Review deleted."
 * }
 */
router.delete('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        const userId = res.locals.user.userId;
        const isAdmin = res.locals.user.isAdmin;

        // Check if review exists and if the user owns it
        const isOwner = await Review.isReviewOwner(reviewId, userId);

        if (isOwner === null) {
            throw new NotFoundError(`Review with ID ${reviewId} not found.`);
        }

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedError("You do not have permission to delete this review.");
        }

        await Review.deleteReview(reviewId);
        res.json({ message: "Review deleted." });

    } catch (err) {
        return next(err);
    }
});

module.exports = router;
