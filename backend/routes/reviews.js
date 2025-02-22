const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/auth');
const { UnauthorizedError, BadRequestError } = require('../helpers/expressError');
const Review = require('../models/reviewModel');

/**
 * reviews.js
 *
 * Provides routes under the /reviews endpoint for reading, creating,
 * updating, and deleting book reviews.
 *
 * All routes require the user to be logged in, except for additional
 * logic to ensure only admins or review owners can modify/delete reviews.
 */

/**
 * GET /reviews
 * Retrieves all reviews with user and book details.
 *
 * Authorization required: Any logged-in user.
 */
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const reviews = await Review.getAllReviews();
        res.json(reviews || []);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /reviews/book/:bookId
 * Retrieves all reviews for a specific book.
 *
 * Authorization required: Any logged-in user.
 */
router.get('/book/:bookId', ensureLoggedIn, async (req, res, next) => {
    try {
        const reviews = await Review.getReviewsByBook(req.params.bookId);
        res.json(reviews || []);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /reviews/user/:userId
 * Retrieves all reviews written by a specific user.
 *
 * Authorization required: Any logged-in user.
 */
router.get('/user/:userId', ensureLoggedIn, async (req, res, next) => {
    try {
        const reviews = await Review.getReviewsByUser(req.params.userId);
        res.json(reviews || []);
    } catch (err) {
        return next(err);
    }
});

/**
 * POST /reviews
 * Adds a new review for a book.
 *
 * Authorization required: Any logged-in user.
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

/**
 * PATCH /reviews/:id
 * Updates a review (can change review text or rating).
 *
 * Authorization required: Only the user who wrote the review.
 */
router.patch('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        const userId = res.locals.user.userId;
        const { rating, reviewText } = req.body;

        // Validate input (at least one field must be provided)
        if (rating === undefined && reviewText === undefined) {
            throw new BadRequestError("At least one field (rating or reviewText) must be provided.");
        }

        if (rating !== undefined && (rating < 1 || rating > 5)) {
            throw new BadRequestError("Rating must be between 1 and 5.");
        }

        // Check if review exists and if the user is the owner
        const isOwner = await Review.isReviewOwner(reviewId, userId);

        if (isOwner === null) {
            throw new NotFoundError(`Review with ID ${reviewId} not found.`);
        }

        if (!isOwner) {
            throw new UnauthorizedError("You do not have permission to update this review.");
        }

        // Update the review
        const updatedReview = await Review.updateReview(reviewId, rating, reviewText);
        res.json(updatedReview);

    } catch (err) {
        return next(err);
    }
});

module.exports = router;
