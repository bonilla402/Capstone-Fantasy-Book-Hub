﻿const db = require('../config/db');

/**
 * The Discussion class provides methods for managing and retrieving discussion data,
 * including associated books, messages, and user information.
 */
class Discussion {
    /**
     * Retrieves all discussions for a specific group, including associated book details
     * (title, cover image, authors, topics) and the total message count for each discussion.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @returns {Promise<Object[]>} A promise that resolves to an array of discussion objects.
     * @example
     * [
     *   {
     *     "id": 1,
     *     "group_id": 2,
     *     "book": {
     *       "id": 10,
     *       "title": "The Hobbit",
     *       "cover_image": "https://example.com/hobbit.jpg",
     *       "authors": ["J.R.R. Tolkien"],
     *       "topics": ["Fantasy", "Adventure"]
     *     },
     *     "title": "Exploring Fantasy Worlds",
     *     "content": "Let's discuss the best fantasy books.",
     *     "created_by": "booklover",
     *     "created_at": "2024-02-06T12:00:00.000Z",
     *     "message_count": 0
     *   }
     * ]
     */
    static async getDiscussionsByGroup(groupId) {
        const result = await db.query(`
            SELECT gd.id,
                   gd.group_id,
                   gd.title,
                   gd.content,
                   gd.created_at,
                   gd.user_id,
                   u.username                                                                AS created_by,
                   b.id                                                                      AS book_id,
                   b.title                                                                   AS book_title,
                   b.cover_image,
                   COALESCE(json_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL), '[]') AS authors,
                   COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS topics,
                   (SELECT COUNT(*) FROM discussion_messages m WHERE m.discussion_id = gd.id) AS message_count
            FROM group_discussions gd
                     JOIN users u ON gd.user_id = u.id
                     JOIN books b ON gd.book_id = b.id
                     LEFT JOIN book_authors ba ON ba.book_id = b.id
                     LEFT JOIN authors a ON ba.author_id = a.id
                     LEFT JOIN book_topics bt ON bt.book_id = b.id
                     LEFT JOIN topics t ON bt.topic_id = t.id
            WHERE gd.group_id = $1
            GROUP BY gd.id, gd.group_id, gd.title, gd.content, gd.created_at, gd.user_id, u.username,
                     b.id, b.title, b.cover_image
            ORDER BY gd.created_at DESC
        `, [groupId]);

        return result.rows.map(row => ({
            id: row.id,
            group_id: row.group_id,
            book: {
                id: row.book_id,
                title: row.book_title,
                cover_image: row.cover_image,
                authors: row.authors,
                topics: row.topics
            },
            title: row.title,
            content: row.content,
            created_by: row.created_by,
            created_at: row.created_at,
            message_count: row.message_count || 0
        }));
    }

    /**
     * Creates a new discussion within a specified group.
     *
     * @param {number} groupId - The ID of the group where the discussion will be created.
     * @param {number} userId - The ID of the user creating the discussion.
     * @param {number} bookId - The ID of the book that the discussion is about.
     * @param {string} title - The title of the discussion.
     * @param {string} content - The main content/body of the discussion.
     * @returns {Promise<Object>} A promise that resolves to the newly created discussion object.
     * @example
     * {
     *   "id": 15,
     *   "group_id": 2,
     *   "book_id": 10,
     *   "title": "Exploring Fantasy Worlds",
     *   "content": "Let's discuss the best fantasy books.",
     *   "user_id": 5,
     *   "created_at": "2024-02-06T12:00:00.000Z"
     * }
     */
    static async createDiscussion(groupId, userId, bookId, title, content) {
        const result = await db.query(`
            INSERT INTO group_discussions (group_id, user_id, book_id, title, content)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, group_id, book_id, title, content, user_id, created_at
        `, [groupId, userId, bookId, title, content]);

        return result.rows[0];
    }

    /**
     * Retrieves a single discussion by its unique ID, including associated book details.
     *
     * @param {number} discussionId - The ID of the discussion to retrieve.
     * @returns {Promise<Object|null>} A promise that resolves to the discussion object or null if not found.
     * @example
     * {
     *   "id": 12,
     *   "group_id": 5,
     *   "book": {
     *     "id": 20,
     *     "title": "Dune",
     *     "cover_image": "https://example.com/dune.jpg",
     *     "authors": ["Frank Herbert"]
     *   },
     *   "title": "Exploring Science Fiction",
     *   "content": "Let's discuss the themes in Dune.",
     *   "created_by": "sci-fi_reader",
     *   "created_at": "2024-02-06T14:00:00.000Z"
     * }
     */
    static async getDiscussionById(discussionId) {
        const result = await db.query(`
            SELECT d.id, d.group_id, d.title, d.content, d.created_at,
                   d.user_id, u.username AS created_by,
                   b.id AS book_id, b.title AS book_title, b.cover_image,
                   COALESCE(json_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL), '[]') AS authors
            FROM group_discussions d
                     JOIN users u ON d.user_id = u.id
                     JOIN books b ON d.book_id = b.id
                     LEFT JOIN book_authors ba ON ba.book_id = b.id
                     LEFT JOIN authors a ON ba.author_id = a.id
            WHERE d.id = $1
            GROUP BY d.id, d.group_id, d.title, d.content, d.created_at, d.user_id, u.username,
                     b.id, b.title, b.cover_image
        `, [discussionId]);

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            id: row.id,
            group_id: row.group_id,
            book: {
                id: row.book_id,
                title: row.book_title,
                cover_image: row.cover_image,
                authors: row.authors
            },
            title: row.title,
            content: row.content,
            created_by: row.created_by,
            created_at: row.created_at
        };
    }

    /**
     * Checks if a user is the creator of a particular discussion.
     *
     * @param {number} discussionId - The ID of the discussion.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<boolean>} A promise that resolves to true if the user is the discussion creator, or false otherwise.
     */
    static async isDiscussionCreator(discussionId, userId) {
        const result = await db.query(`
            SELECT 1
            FROM group_discussions
            WHERE id = $1
              AND user_id = $2
        `, [discussionId, userId]);

        return result.rows.length > 0;
    }

    /**
     * Retrieves the user ID of the creator of the group that a discussion belongs to.
     *
     * @param {number} discussionId - The ID of the discussion.
     * @returns {Promise<number|null>} A promise that resolves to the user ID of the group creator or null if none found.
     */
    static async getGroupCreatorByDiscussion(discussionId) {
        const result = await db.query(`
            SELECT dg.created_by
            FROM discussion_groups dg
                     JOIN group_discussions gd ON gd.group_id = dg.id
            WHERE gd.id = $1
        `, [discussionId]);

        return result.rows.length > 0 ? result.rows[0].created_by : null;
    }

    /**
     * Updates an existing discussion's title and/or content.
     * Passes `null` or `undefined` for any parameter you do not wish to update.
     *
     * @param {number} discussionId - The ID of the discussion to update.
     * @param {string|null} title - The updated discussion title (optional).
     * @param {string|null} content - The updated discussion content (optional).
     * @returns {Promise<Object|null>} A promise that resolves to the updated discussion object, or null if not found.
     * @example
     * // Example usage:
     * const updated = await Discussion.updateDiscussion(12, 'New Discussion Title', 'Updated content...');
     * // updated might look like:
     * {
     *   id: 12,
     *   group_id: 5,
     *   book_id: 20,
     *   title: 'New Discussion Title',
     *   content: 'Updated content...',
     *   user_id: 4,
     *   created_at: '2024-02-06T14:00:00.000Z'
     * }
     */
    static async updateDiscussion(discussionId, title, content) {
        const result = await db.query(`
            UPDATE group_discussions
            SET title   = COALESCE($1, title),
                content = COALESCE($2, content)
            WHERE id = $3
            RETURNING id, group_id, book_id, title, content, user_id, created_at
        `, [title, content, discussionId]);

        return result.rows[0] || null;
    }

    /**
     * Deletes a discussion by its ID.
     *
     * @param {number} discussionId - The ID of the discussion to delete.
     * @returns {Promise<boolean>} A promise that resolves to true if the discussion was successfully deleted, false otherwise.
     * @example
     * // Example usage:
     * const success = await Discussion.deleteDiscussion(12);
     * // success = true if deletion occurred, false if not
     */
    static async deleteDiscussion(discussionId) {
        const result = await db.query(`
            DELETE
            FROM group_discussions
            WHERE id = $1
            RETURNING id
        `, [discussionId]);

        return result.rows.length > 0;
    }
}

module.exports = Discussion;
