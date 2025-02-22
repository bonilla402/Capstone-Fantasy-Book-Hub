const db = require('../config/db');
const bcrypt = require('bcrypt');
const BCRYPT_WORK_FACTOR = 12;

/**
 * The User class provides methods to manage user data,
 * including creation, retrieval, updating, and deletion.
 */
class User {
    /**
     * Retrieves all users from the database.
     *
     * @returns {Promise<Object[]>} A promise that resolves to an array of user objects,
     * each containing { id, username, email, is_admin }.
     *
     * @example
     * [
     *   {
     *     id: 1,
     *     username: "user1",
     *     email: "user1@example.com",
     *     is_admin: false
     *   },
     *   {
     *     id: 2,
     *     username: "admin",
     *     email: "admin@example.com",
     *     is_admin: true
     *   }
     * ]
     */
    static async getAllUsers() {
        const result = await db.query(`
            SELECT id, username, email, is_admin
            FROM users
        `);
        return result.rows;
    }

    /**
     * Retrieves a user by email address.
     *
     * @param {string} email - The email address of the user to retrieve.
     * @returns {Promise<Object|null>} A promise that resolves to a user object
     * ({ id, username, email, password_hash, is_admin }) if found, or null otherwise.
     *
     * @example
     * {
     *   id: 1,
     *   username: "user1",
     *   email: "user1@example.com",
     *   password_hash: "$2b$12$...",
     *   is_admin: false
     * }
     */
    static async getUserByEmail(email) {
        const result = await db.query(
            `SELECT id, username, email, password_hash, is_admin FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0];
    }

    /**
     * Creates a new user. Passwords are hashed before being stored.
     *
     * @param {string} username - The desired username for the new user.
     * @param {string} email - The email address for the new user.
     * @param {string} password - The plaintext password to be hashed.
     * @returns {Promise<Object>} A promise that resolves to the newly created user object
     * ({ id, username, email, is_admin }).
     *
     * @example
     * {
     *   id: 3,
     *   username: "newuser",
     *   email: "newuser@example.com",
     *   is_admin: false
     * }
     */
    static async createUser(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        const result = await db.query(
            `INSERT INTO users (username, email, password_hash, is_admin)
             VALUES ($1, $2, $3, false) RETURNING id, username, email, is_admin`,
            [username, email, hashedPassword]
        );
        return result.rows[0];
    }

    /**
     * Updates an existing user's username, email, and/or password.
     * Any null or undefined parameter (except userId) will be left unchanged.
     *
     * @param {number} userId - The ID of the user to update.
     * @param {string|null} username - The new username, or null to leave unchanged.
     * @param {string|null} email - The new email, or null to leave unchanged.
     * @param {string|null} password - The new password, or null to leave unchanged.
     * @returns {Promise<Object|null>} A promise that resolves to the updated user object
     * ({ id, username, email, is_admin }) if the user was found, or null otherwise.
     *
     * @example
     * {
     *   id: 1,
     *   username: "updated_user",
     *   email: "updated_email@example.com",
     *   is_admin: false
     * }
     */
    static async updateUser(userId, username, email, password) {
        let hashedPassword = password ? await bcrypt.hash(password, BCRYPT_WORK_FACTOR) : null;
        const result = await db.query(
            `UPDATE users 
            SET username = COALESCE($1, username),
                email = COALESCE($2, email),
                password_hash = COALESCE($3, password_hash)
            WHERE id = $4
             RETURNING id, username, email, is_admin`,
            [username, email, hashedPassword, userId]
        );
        return result.rows[0];
    }

    /**
     * Deletes a user by their ID.
     *
     * @param {number} userId - The ID of the user to delete.
     * @returns {Promise<Object|null>} A promise that resolves to an object containing
     * the deleted user's ID (e.g., { id: 1 }), or null if the user was not found.
     *
     * @example
     * {
     *   id: 3
     * }
     */
    static async deleteUser(userId) {
        const result = await db.query(`
            DELETE FROM users
            WHERE id = $1
                RETURNING id
        `, [userId]);
        return result.rows[0];
    }
}

module.exports = User;
