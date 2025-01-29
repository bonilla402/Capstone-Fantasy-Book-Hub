const db = require('../config/db');

class Book {
    static async getAllBooks() {
        const result = await db.query(`SELECT * FROM books ORDER BY created_at DESC`);
        return result.rows;
    }

    static async createBook(title, coverImage, yearPublished, synopsis) {
        const result = await db.query(
            `INSERT INTO books (title, cover_image, year_published, synopsis)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, coverImage, yearPublished, synopsis]
        );
        return result.rows[0];
    }
}

module.exports = Book;
