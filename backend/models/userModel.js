const db = require('../config/db');

class User {
    static async createUser(username, email, passwordHash) {
        const result = await db.query(
            `INSERT INTO users (username, email, password_hash)
             VALUES ($1, $2, $3) RETURNING id, username, email`,
            [username, email, passwordHash]
        );
        return result.rows[0];
    }

    static async getUserByEmail(email) {
        const result = await db.query(
            `SELECT id, username, email, password_hash FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0];
    }

    static async getAllUsers() {
        const result = await db.query(`SELECT id, username, email FROM users`);
        return result.rows;
    }
}

module.exports = User;
