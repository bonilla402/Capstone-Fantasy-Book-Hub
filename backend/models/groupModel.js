const db = require("../config/db");

/**
 * The Group class manages discussion groups, including their creation, retrieval,
 * updates, membership, and related searches.
 */
class Group {
    /**
     * Retrieves all discussion groups, including their member count and discussion count.
     *
     * @returns {Promise<Object[]>} A promise that resolves to an array of discussion group objects,
     * each containing fields such as id, group_name, description, created_by, created_by_username,
     * created_at, member_count, and discussion_count.
     * @example
     * [
     *   {
     *     "id": 1,
     *     "group_name": "Fantasy Readers",
     *     "description": "A group for fantasy book lovers.",
     *     "created_by": 2,
     *     "created_by_username": "booklover",
     *     "created_at": "2024-02-06T12:00:00.000Z",
     *     "member_count": 5,
     *     "discussion_count": 5
     *   }
     * ]
     */
    static async getAllGroups() {
        const result = await db.query(`
            SELECT dg.id,
                   dg.group_name,
                   dg.description,
                   dg.created_at,
                   u.id AS created_by,
                   u.username AS created_by_username,
                   (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = dg.id) AS member_count,
                   (SELECT COUNT(*) FROM group_discussions gd WHERE gd.group_id = dg.id) AS discussion_count
            FROM discussion_groups dg
                     JOIN users u ON dg.created_by = u.id
            ORDER BY dg.id ASC
        `);
        return result.rows;
    }

    /**
     * Retrieves a single discussion group by its ID, including its member count and discussion count.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @returns {Promise<Object|null>} A promise that resolves to the discussion group object if found,
     * or null otherwise.
     * @example
     * {
     *   "id": 1,
     *   "group_name": "Fantasy Readers",
     *   "description": "A group for fantasy book lovers.",
     *   "created_by": 2,
     *   "created_by_username": "booklover",
     *   "created_at": "2024-02-06T12:00:00.000Z",
     *   "member_count": 5,
     *   "discussion_count": 5
     * }
     */
    static async getGroupById(groupId) {
        const result = await db.query(`
            SELECT dg.id,
                   dg.group_name,
                   dg.description,
                   dg.created_at,
                   u.id AS created_by,
                   u.username AS created_by_username,
                   (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = dg.id) AS member_count,
                   (SELECT COUNT(*) FROM group_discussions gd WHERE gd.group_id = dg.id) AS discussion_count
            FROM discussion_groups dg
                     JOIN users u ON dg.created_by = u.id
            WHERE dg.id = $1
        `, [groupId]);

        return result.rows[0] || null;
    }

    /**
     * Creates a new discussion group and automatically adds the creator as a member.
     *
     * @param {string} groupName - The name of the group.
     * @param {string} description - A brief description of the group's focus.
     * @param {number} createdBy - The user ID of the group's creator.
     * @returns {Promise<Object>} A promise that resolves to the newly created discussion group object.
     * @example
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

        const newGroup = result.rows[0];

        await db.query(`
            INSERT INTO group_members (group_id, user_id)
            VALUES ($1, $2)
        `, [newGroup.id, createdBy]);

        return newGroup;
    }

    /**
     * Updates an existing discussion group, allowing changes to its name and/or description.
     *
     * @param {number} groupId - The ID of the discussion group to update.
     * @param {string|null} groupName - The new group name, or null to leave it unchanged.
     * @param {string|null} description - The new group description, or null to leave it unchanged.
     * @returns {Promise<Object|null>} A promise that resolves to the updated discussion group object,
     * or null if the group was not found.
     * @example
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
     * Checks whether a user is the original creator of a discussion group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @param {number} userId - The ID of the user to check.
     * @returns {Promise<boolean>} A promise that resolves to true if the user created the group,
     * otherwise false.
     */
    static async isGroupOwner(groupId, userId) {
        const result = await db.query(
            `SELECT created_by FROM discussion_groups WHERE id = $1`,
            [groupId]
        );

        return result.rows.length > 0 && result.rows[0].created_by === userId;
    }

    /**
     * Deletes a discussion group by its ID.
     *
     * @param {number} groupId - The ID of the group to delete.
     * @returns {Promise<boolean>} A promise that resolves to true if the deletion
     * was successful, or false otherwise.
     */
    static async deleteGroup(groupId) {
        const result = await db.query(`
            DELETE
            FROM discussion_groups
            WHERE id = $1
            RETURNING id
        `, [groupId]);

        return result.rows.length > 0;
    }

    /**
     * Adds a user to a discussion group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @param {number} userId - The ID of the user to add.
     * @returns {Promise<Object>} A promise that resolves to an object containing
     * the group_id and user_id of the newly added member.
     * @example
     * {
     *   group_id: 1,
     *   user_id: 5
     * }
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
     * @returns {Promise<boolean>} A promise that resolves to true if the user
     * was successfully removed, or false otherwise.
     */
    static async removeUserFromGroup(groupId, userId) {
        const result = await db.query(`
            DELETE
            FROM group_members
            WHERE group_id = $1 AND user_id = $2
            RETURNING group_id
        `, [groupId, userId]);

        return result.rows.length > 0;
    }

    /**
     * Checks if a user is already a member of a discussion group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @param {number} userId - The ID of the user to check.
     * @returns {Promise<boolean>} A promise that resolves to true if the user is a member,
     * otherwise false.
     */
    static async isUserInGroup(groupId, userId) {
        const result = await db.query(`
            SELECT 1
            FROM group_members
            WHERE group_id = $1
              AND user_id = $2
        `, [groupId, userId]);

        return result.rows.length > 0;
    }

    /**
     * Retrieves a list of members (including user IDs and usernames) in a discussion group.
     *
     * @param {number} groupId - The ID of the discussion group.
     * @returns {Promise<Object[]>} A promise that resolves to an array of objects,
     * each containing user_id and username of a group member.
     * @example
     * [
     *   { user_id: 3, username: "user3" },
     *   { user_id: 5, username: "newbie" }
     * ]
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
     * Checks if a user is the creator of a given discussion group.
     *
     * @param {number} groupId - The ID of the group to check.
     * @param {number} userId - The ID of the user to verify.
     * @returns {Promise<boolean>} A promise that resolves to true if the user
     * is the group creator, or false otherwise.
     * @example
     * true
     */
    static async isGroupCreator(groupId, userId) {
        const result = await db.query(`
            SELECT 1
            FROM discussion_groups
            WHERE id = $1
              AND created_by = $2
        `, [groupId, userId]);

        return result.rows.length > 0;
    }

    /**
     * Searches for groups that match the given parameters (author, title, topic,
     * groupTitle, and groupDescription) using AND logic. All matches must meet
     * each condition if provided.
     *
     * @param {string|null} author - The book author to search for.
     * @param {string|null} title - The book title to search for.
     * @param {string|null} topic - The book topic to search for.
     * @param {string|null} groupTitle - The group title to search for.
     * @param {string|null} groupDescription - The group description to search for.
     * @returns {Promise<Object[]>} A promise that resolves to an array of matching groups,
     * each including details such as id, group_name, description, created_at, created_by, and member_count.
     * @example
     * [
     *   {
     *     "id": 1,
     *     "group_name": "Fantasy Readers",
     *     "description": "A group for fantasy book lovers.",
     *     "created_at": "2024-02-06T12:00:00.000Z",
     *     "created_by": "booklover",
     *     "member_count": 5
     *   }
     * ]
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
        
        const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        console.log("Executing Query with Params:", values); // Debugging log

        const result = await db.query(`
            SELECT DISTINCT g.id, g.group_name, g.description, g.created_at, u.username AS created_by,
                            (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
            FROM discussion_groups g
            LEFT JOIN group_discussions d ON g.id = d.group_id
            LEFT JOIN books b ON d.book_id = b.id
            LEFT JOIN book_authors ba ON ba.book_id = b.id
            LEFT JOIN authors a ON ba.author_id = a.id
            LEFT JOIN book_topics bt ON bt.book_id = b.id
            LEFT JOIN topics t ON bt.topic_id = t.id
            JOIN users u ON g.created_by = u.id
            ${whereClause}
            ORDER BY g.id ASC
        `, values);

        return result.rows;
    }
}

module.exports = Group;
