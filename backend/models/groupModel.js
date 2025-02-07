const db = require('../config/db');

class Group {
    /**
     * Retrieves all discussion groups.
     *
     * @returns {Promise<Object[]>} List of all discussion groups.
     * @example Response:
     * [
     *   {
     *     "id": 1,
     *     "group_name": "Fantasy Readers",
     *     "description": "A group for fantasy book lovers.",
     *     "created_by": 2,
     *     "created_by_username": "booklover",
     *     "created_at": "2024-02-06T12:00:00.000Z"
     *   }
     * ]
     */
    static async getAllGroups() {
        const result = await db.query(`
            SELECT dg.id, dg.group_name, dg.description, dg.created_at, 
                   u.id AS created_by, u.username AS created_by_username
            FROM discussion_groups dg
            JOIN users u ON dg.created_by = u.id
            ORDER BY dg.created_at DESC
        `);
        return result.rows;
    }

    /**
     * Retrieves a single discussion group by ID.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @returns {Promise<Object|null>} The discussion group or null if not found.
     * @example Response:
     * {
     *   "id": 1,
     *   "group_name": "Fantasy Readers",
     *   "description": "A group for fantasy book lovers.",
     *   "created_by": 2,
     *   "created_by_username": "booklover",
     *   "created_at": "2024-02-06T12:00:00.000Z"
     * }
     */
    static async getGroupById(groupId) {
        const result = await db.query(`
            SELECT dg.id, dg.group_name, dg.description, dg.created_at,
                   u.id AS created_by, u.username AS created_by_username
            FROM discussion_groups dg
            JOIN users u ON dg.created_by = u.id
            WHERE dg.id = $1
        `, [groupId]);

        return result.rows[0] || null;
    }

    /**
     * Creates a new discussion group.
     *
     * @param {string} groupName - The name of the group.
     * @param {string} description - The group's description.
     * @param {number} createdBy - The ID of the user creating the group.
     * @returns {Promise<Object>} The newly created discussion group.
     * @example Response:
     * {
     *   "id": 2,
     *   "group_name": "Sci-Fi Explorers",
     *   "description": "A group discussing the best sci-fi books.",
     *   "created_by": 3,
     *   "created_at": "2024-02-06T14:00:00.000Z"
     * }
     */
    static async createGroup(groupName, description, createdBy) {
        const result = await db.query(`
            INSERT INTO discussion_groups (group_name, description, created_by)
            VALUES ($1, $2, $3)
            RETURNING id, group_name, description, created_by, created_at
        `, [groupName, description, createdBy]);

        return result.rows[0];
    }

    /**
     * Updates a discussion group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @param {string|null} groupName - The new group name (optional).
     * @param {string|null} description - The new description (optional).
     * @returns {Promise<Object|null>} The updated discussion group or null if not found.
     * @example Response:
     * {
     *   "id": 1,
     *   "group_name": "Updated Group Name",
     *   "description": "A newly updated description.",
     *   "created_by": 2,
     *   "created_at": "2024-02-06T12:00:00.000Z"
     * }
     */
    static async updateGroup(groupId, groupName, description) {
        const result = await db.query(`
            UPDATE discussion_groups
            SET group_name = COALESCE($1, group_name),
                description = COALESCE($2, description)
            WHERE id = $3
            RETURNING id, group_name, description, created_by, created_at
        `, [groupName, description, groupId]);

        return result.rows[0] || null;
    }

    /**
     * Checks if a user is the creator of a discussion group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<boolean>} True if the user created the group, false otherwise.
     */
    static async isGroupOwner(groupId, userId) {
        const result = await db.query(
            `SELECT created_by FROM discussion_groups WHERE id = $1`,
            [groupId]
        );

        return result.rows.length > 0 && result.rows[0].created_by === userId;
    }

    /**
     * Deletes a discussion group.
     *
     * @param {number} groupId - The ID of the group to delete.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteGroup(groupId) {
        const result = await db.query(`
            DELETE FROM discussion_groups WHERE id = $1 RETURNING id
        `, [groupId]);

        return result.rows.length > 0;
    }

    
    /**
     * Adds a user to a discussion group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @param {number} userId - The ID of the user to add.
     * @returns {Promise<Object>} Confirmation of the added user.
     */
    static async addUserToGroup(groupId, userId) {
        const result = await db.query(`
            INSERT INTO group_members (group_id, user_id)
            VALUES ($1, $2)
            RETURNING group_id, user_id
        `, [groupId, userId]);

        return result.rows[0];
    }

    /**
     * Removes a user from a discussion group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @param {number} userId - The ID of the user to remove.
     * @returns {Promise<boolean>} True if the user was removed.
     */
    static async removeUserFromGroup(groupId, userId) {
        const result = await db.query(`
            DELETE FROM group_members WHERE group_id = $1 AND user_id = $2
            RETURNING group_id
        `, [groupId, userId]);

        return result.rows.length > 0;
    }

    /**
     * Checks if a user is in a group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<boolean>} True if the user is in the group.
     */
    static async isUserInGroup(groupId, userId) {
        const result = await db.query(`
            SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2
        `, [groupId, userId]);

        return result.rows.length > 0;
    }

    /**
     * Retrieves a list of members in a discussion group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @returns {Promise<Object[]>} List of group members.
     */
    static async getGroupMembers(groupId) {
        const result = await db.query(`
            SELECT u.id AS user_id, u.username
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = $1
        `, [groupId]);

        return result.rows;
    }

    /**
     * Checks if a user is the creator of a given group.
     *
     * @param {number} groupId - The ID of the group.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<boolean>} True if the user is the group creator, false otherwise.
     * @example Response:
     * true
     */
    static async isGroupCreator(groupId, userId) {
        const result = await db.query(`
            SELECT 1 FROM discussion_groups
            WHERE id = $1 AND created_by = $2
        `, [groupId, userId]);

        return result.rows.length > 0;
    }

    /**
     * Searches for groups matching book details or group details using AND logic.
     *
     * @param {string|null} author - The book author to search for.
     * @param {string|null} title - The book title to search for.
     * @param {string|null} topic - The book topic to search for.
     * @param {string|null} groupTitle - The group title to search for.
     * @param {string|null} groupDescription - The group description to search for.
     * @returns {Promise<Object[]>} List of matching groups.
     */
    static async searchGroups(author, title, topic, groupTitle, groupDescription) {
        const conditions = [];
        const values = [];

        if (author) {
            conditions.push(`a.name ILIKE $${values.length + 1}`);
            values.push(`%${author}%`);
        }
        if (title) {
            conditions.push(`b.title ILIKE $${values.length + 1}`);
            values.push(`%${title}%`);
        }
        if (topic) {
            conditions.push(`t.name ILIKE $${values.length + 1}`);
            values.push(`%${topic}%`);
        }
        if (groupTitle) {
            conditions.push(`g.group_name ILIKE $${values.length + 1}`);
            values.push(`%${groupTitle}%`);
        }
        if (groupDescription) {
            conditions.push(`g.description ILIKE $${values.length + 1}`);
            values.push(`%${groupDescription}%`);
        }

        if (conditions.length === 0) {
            throw new BadRequestError("At least one search field must be provided.");
        }

        // Apply AND logic by joining conditions with AND instead of OR
        const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        console.log("Executing Query with Params:", values); // Debugging log

        const result = await db.query(`
            SELECT DISTINCT g.id, g.group_name, g.description, g.created_at, u.username AS created_by
            FROM discussion_groups g
                     LEFT JOIN group_discussions d ON g.id = d.group_id
                     LEFT JOIN books b ON d.book_id = b.id
                     LEFT JOIN book_authors ba ON ba.book_id = b.id
                     LEFT JOIN authors a ON ba.author_id = a.id
                     LEFT JOIN book_topics bt ON bt.book_id = b.id
                     LEFT JOIN topics t ON bt.topic_id = t.id
                     JOIN users u ON g.created_by = u.id
                ${whereClause}
            ORDER BY g.created_at DESC
        `, values);

        return result.rows;
    }
}

module.exports = Group;