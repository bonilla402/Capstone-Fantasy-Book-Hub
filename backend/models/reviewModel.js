const db = require('../config/db');

/**
 * The Review class provides CRUD operations for book reviews,
 * including retrieving, adding, updating, and deleting reviews.
 */
class Review {
    /**
     * Retrieves all reviews from the database, including user and book details.
     *
     * @returns {Promise<Object[]>} A promise that resolves to an array of all reviews.
     * @example
     * [
     *   {
     *     id: 1,
     *     rating: 4,
     *     review_text: "Loved the character development!",
     *     created_at: "2024-02-06T12:00:00.000Z",
     *     user_id: 2,
     *     user_name: "booklover",
     *     book_id: 10,
     *     book_title: "The Hobbit"
     *   }
     * ]
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
     * Retrieves all reviews for a specific book, ordered by the most recent first.
     *
     * @param {number} bookId - The ID of the book for which reviews are fetched.
     * @returns {Promise<Object[]>} A promise that resolves to an array of review objects for the specified book.
     * @example
     * [
     *   {
     *     id: 5,
     *     rating: 5,
     *     review_text: "Absolutely fantastic read!",
     *     created_at: "2024-02-07T09:30:00.000Z",
     *     user_id: 3,
     *     user_name: "novelreader"
     *   }
     * ]
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
     * Retrieves all reviews authored by a specific user, ordered by the most recent first.
     *
     * @param {number} userId - The ID of the user whose reviews are fetched.
     * @returns {Promise<Object[]>} A promise that resolves to an array of the user's review objects.
     * @example
     * [
     *   {
     *     id: 7,
     *     rating: 3,
     *     review_text: "It was okay, but I expected more action.",
     *     created_at: "2024-02-08T10:00:00.000Z",
     *     book_id: 15,
     *     book_title: "A Game of Thrones"
     *   }
     * ]
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
     * Adds a new review for a book. The rating should be in the range 1-5.
     *
     * @param {number} userId - The ID of the user creating the review.
     * @param {number} bookId - The ID of the book being reviewed.
     * @param {number} rating - The star rating from 1 to 5.
     * @param {string} reviewText - Optional text content for the review.
     * @returns {Promise<Object>} A promise that resolves to the newly created review object.
     * @example
     * {
     *   id: 12,
     *   user_id: 2,
     *   book_id: 10,
     *   rating: 5,
     *   review_text: "One of my favorite books!",
     *   created_at: "2024-02-09T08:00:00.000Z"
     * }
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
     * Checks if a given review belongs to a specific user.
     *
     * @param {number} reviewId - The ID of the review.
     * @param {number} userId - The ID of the user to check against.
     * @returns {Promise<boolean|null>} A promise that resolves to true if the review belongs to the user,
     * false if it does not, or null if the review is not found.
     * @example
     * const isOwner = await Review.isReviewOwner(10, 2);
     * // returns true if review #10 is owned by user #2
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
     * Deletes a review by its ID.
     *
     * @param {number} reviewId - The ID of the review to delete.
     * @returns {Promise<Object|null>} A promise that resolves to an object containing the deleted review's ID,
     * or null if the review was not found.
     * @example
     * {
     *   id: 12
     * }
     */
    static async deleteReview(reviewId) {
        const result = await db.query(`
            DELETE FROM reviews
            WHERE id = $1
            RETURNING id
        `, [reviewId]);

        return result.rows[0] || null;
    }

    /**
     * Updates an existing review with a new rating or review text. Passing `null`
     * for a parameter will keep the existing value in the database.
     *
     * @param {number} reviewId - The ID of the review to update.
     * @param {number|null} rating - The updated rating (1-5), or null to leave unchanged.
     * @param {string|null} reviewText - The updated text review, or null to leave unchanged.
     * @returns {Promise<Object|null>} A promise that resolves to the updated review object, or null if not found.
     * @example
     * {
     *   id: 12,
     *   user_id: 2,
     *   book_id: 10,
     *   rating: 4,
     *   review_text: "Changed my mind, still excellent but not a five.",
     *   created_at: "2024-02-09T08:00:00.000Z"
     * }
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
}

module.exports = Review;
