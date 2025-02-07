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
}

module.exports = Group;