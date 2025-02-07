const db = require('../config/db');

class Discussion {

    /**
     * Retrieves all discussions for a specific group with book details.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @returns {Promise<Object[]>} List of discussions with book details.
     * @example Response:
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
     *     "created_at": "2024-02-06T12:00:00.000Z"
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
                   COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS topics
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
            created_at: row.created_at
        }));
    }

    /**
     * Creates a new discussion within a group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @param {number} userId - The ID of the user creating the discussion.
     * @param {number} bookId - The ID of the book the discussion is about.
     * @param {string} title - The title of the discussion.
     * @param {string} content - The discussion content.
     * @returns {Promise<Object>} The created discussion.
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
     * Checks if a user is the creator of a discussion.
     *
     * @param {number} discussionId - The ID of the discussion.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<boolean>} True if the user is the discussion creator.
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
     * Retrieves the group creator of a discussion.
     *
     * @param {number} discussionId - The ID of the discussion.
     * @returns {Promise<number|null>} The user ID of the group creator or null if not found.
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
     * Updates an existing discussion.
     *
     * @param {number} discussionId - The ID of the discussion.
     * @param {string} title - The updated title (optional).
     * @param {string} content - The updated content (optional).
     * @returns {Promise<Object|null>} The updated discussion or null if not found.
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
     * Deletes a discussion.
     *
     * @param {number} discussionId - The ID of the discussion.
     * @returns {Promise<boolean>} True if deletion was successful.
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
