const db = require('../config/db');

class Review {
    /**
     * Retrieves all reviews with user and book details.
     *
     * @returns {Promise<Object[]>} List of all reviews.
     */
    static async getAllReviews() {
        const result = await db.query(`
            SELECT r.id,
                   r.rating,
                   r.review_text,
                   r.created_at,
                   u.id AS user_id,
                   u.username AS user_name,
                   b.id AS book_id,
                   b.title AS book_title
            FROM reviews r
                     JOIN users u ON r.user_id = u.id
                     JOIN books b ON r.book_id = b.id
            ORDER BY r.created_at DESC
        `);
        return result.rows;
    }

    /**
     * Retrieves all reviews for a specific book.
     *
     * @param {number} bookId - The ID of the book.
     * @returns {Promise<Object[]>} List of reviews for the book.
     */
    static async getReviewsByBook(bookId) {
        const result = await db.query(`
            SELECT r.id,
                   r.rating,
                   r.review_text,
                   r.created_at,
                   u.id AS user_id,
                   u.username AS user_name
            FROM reviews r
                     JOIN users u ON r.user_id = u.id
            WHERE r.book_id = $1
            ORDER BY r.created_at DESC
        `, [bookId]);
        return result.rows;
    }

    /**
     * Retrieves all reviews written by a specific user.
     *
     * @param {number} userId - The ID of the user.
     * @returns {Promise<Object[]>} List of reviews by the user.
     */
    static async getReviewsByUser(userId) {
        const result = await db.query(`
            SELECT r.id, 
                   r.rating, 
                   r.review_text, 
                   r.created_at, 
                   b.id AS book_id, 
                   b.title AS book_title
            FROM reviews r
            JOIN books b ON r.book_id = b.id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `, [userId]);
        return result.rows;
    }

    /**
     * Adds a new review for a book.
     *
     * @param {number} userId - The ID of the user writing the review.
     * @param {number} bookId - The ID of the book being reviewed.
     * @param {number} rating - The rating (1-5).
     * @param {string} reviewText - Optional text review.
     * @returns {Promise<Object>} The newly created review.
     */
    static async addReview(userId, bookId, rating, reviewText) {
        const result = await db.query(`
            INSERT INTO reviews (user_id, book_id, rating, review_text)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, book_id, rating, review_text, created_at
        `, [userId, bookId, rating, reviewText]);

        return result.rows[0];
    }

    /**
     * Checks if a review belongs to a specific user.
     *
     * @param {number} reviewId - The ID of the review.
     * @param {number} userId - The ID of the logged-in user.
     * @returns {Promise<boolean>} True if the user owns the review, false otherwise.
     */
    static async isReviewOwner(reviewId, userId) {
        const result = await db.query(
            `SELECT user_id FROM reviews WHERE id = $1`,
            [reviewId]
        );

        if (result.rows.length === 0) {
            return null; // Review not found
        }

        return result.rows[0].user_id === userId;
    }

    /**
     * Deletes a review by ID.
     *
     * @param {number} reviewId - The ID of the review.
     * @returns {Promise<Object|null>} The deleted review confirmation or null if not found.
     */
    static async deleteReview(reviewId) {
        const result = await db.query(`
            DELETE FROM reviews WHERE id = $1 RETURNING id
        `, [reviewId]);

        return result.rows[0] || null;
    }
}

/**
 * Updates a review (rating and/or review text).
 *
 * @param {number} reviewId - The ID of the review.
 * @param {number|null} rating - The new rating (optional).
 * @param {string|null} reviewText - The new review text (optional).
 * @returns {Promise<Object>} The updated review.
 */
static async updateReview(reviewId, rating, reviewText) {
    const result = await db.query(`
        UPDATE reviews
        SET rating = COALESCE($1, rating),
            review_text = COALESCE($2, review_text)
        WHERE id = $3
        RETURNING id, user_id, book_id, rating, review_text, created_at
    `, [rating, reviewText, reviewId]);

    return result.rows[0] || null;
}

module.exports = Review;
