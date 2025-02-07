const db = require('../config/db');

class Message {
    /**
     * Retrieves all messages for a discussion.
     *
     * @param {number} discussionId - The ID of the discussion.
     * @returns {Promise<Object[]>} List of messages in the discussion.
     */
    static async getMessagesByDiscussion(discussionId) {
        const result = await db.query(`
            SELECT dm.id, dm.discussion_id, dm.user_id, u.username, dm.content, dm.created_at
            FROM discussion_messages dm
                     JOIN users u ON dm.user_id = u.id
            WHERE dm.discussion_id = $1
            ORDER BY dm.created_at
        `, [discussionId]);

        return result.rows;
    }

    /**
     * Adds a message to a discussion.
     *
     * @param {number} discussionId - The ID of the discussion.
     * @param {number} userId - The ID of the user sending the message.
     * @param {string} content - The message content.
     * @returns {Promise<Object>} The created message.
     */
    static async addMessage(discussionId, userId, content) {
        const result = await db.query(`
            INSERT INTO discussion_messages (discussion_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING id, discussion_id, user_id, content, created_at
        `, [discussionId, userId, content]);

        return result.rows[0];
    }
}

module.exports = Message;
