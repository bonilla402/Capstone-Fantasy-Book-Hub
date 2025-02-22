const db = require('../config/db');

/**
 * The Message class handles message-related operations within a discussion,
 * including retrieving and adding messages.
 */
class Message {
    /**
     * Retrieves all messages for a given discussion, including the user's username.
     *
     * @param {number} discussionId - The ID of the discussion whose messages are to be retrieved.
     * @returns {Promise<Object[]>} A promise that resolves to an array of message objects.
     * @example
     * [
     *   {
     *     id: 1,
     *     discussion_id: 5,
     *     user_id: 3,
     *     username: "booklover",
     *     content: "I absolutely loved the ending!",
     *     created_at: "2024-02-06T12:00:00.000Z"
     *   }
     * ]
     */
    static async getMessagesByDiscussion(discussionId) {
        const result = await db.query(`
            SELECT dm.id,
                   dm.discussion_id,
                   dm.user_id,
                   u.username,
                   dm.content,
                   dm.created_at
            FROM discussion_messages dm
                     JOIN users u ON dm.user_id = u.id
            WHERE dm.discussion_id = $1
            ORDER BY dm.created_at
        `, [discussionId]);

        return result.rows;
    }

    /**
     * Adds a new message to a specified discussion.
     *
     * @param {number} discussionId - The ID of the discussion to which the message will be added.
     * @param {number} userId - The ID of the user sending the message.
     * @param {string} content - The textual content of the message.
     * @returns {Promise<Object>} A promise that resolves to the newly created message object.
     * @example
     * {
     *   id: 10,
     *   discussion_id: 5,
     *   user_id: 3,
     *   content: "So, what did everyone think about the plot twist?",
     *   created_at: "2024-02-06T13:00:00.000Z"
     * }
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
