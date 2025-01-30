const db = require('../config/db');
const bcrypt = require('bcrypt');
const BCRYPT_WORK_FACTOR = 12;

class User {
    /** Get all users
     *  Returns [{ id, username, email, is_admin }, ...]
     *  Authorization required: Admin only
     */
    static async getAllUsers() {
        const result = await db.query(`SELECT id, username, email, is_admin FROM users`);
        return result.rows;
    }

    /** Get user by email
     *  Returns { id, username, email, password_hash, is_admin }
     *  Authorization required: None
     */
    static async getUserByEmail(email) {
        const result = await db.query(
            `SELECT id, username, email, password_hash, is_admin FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0];
    }

    /** Create a new user
     *  Returns { id, username, email, is_admin }
     *  Authorization required: None
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

    /** Update user
     *  Returns { id, username, email, is_admin }
     *  Authorization required: Admin or same user as :id
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

    /** Delete user
     *  Returns { id }
     *  Authorization required: Admin only
     */
    static async deleteUser(userId) {
        const result = await db.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [userId]);
        return result.rows[0];
    }
}

module.exports = User;