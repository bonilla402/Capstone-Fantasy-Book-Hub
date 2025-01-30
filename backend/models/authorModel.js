const db = require('../config/db');

class Author {
    static async getAllAuthors() {
        const result = await db.query(`SELECT *
                                       FROM authors
                                       ORDER BY name `);
        return result.rows;
    }
}

module.exports = Author;
