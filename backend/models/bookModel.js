const db = require('../config/db');

class Book {
    /**
     * Retrieves all books along with their authors and topics.
     *
     * @returns {Promise<Object[]>} List of books with authors and topics.
     * @example Response:
     * [
     *   {
     *     "id": 1,
     *     "title": "The Hobbit",
     *     "cover_image": "https://example.com/hobbit.jpg",
     *     "year_published": 1937,
     *     "synopsis": "A hobbit embarks on a journey...",
     *     "created_at": "2024-02-06T12:00:00.000Z",
     *     "authors": ["J.R.R. Tolkien"],
     *     "topics": ["Fantasy", "Adventure"]
     *   }
     * ]
     */
    static async getAllBooks() {
        const result = await db.query(`
            SELECT
                b.id,
                b.title,
                b.cover_image,
                b.year_published,
                b.synopsis,
                b.created_at,
                COALESCE(json_agg(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL), '[]') AS authors,
                COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS topics
            FROM books b
                     LEFT JOIN book_authors ba ON b.id = ba.book_id
                     LEFT JOIN authors a ON ba.author_id = a.id
                     LEFT JOIN book_topics bt ON b.id = bt.book_id
                     LEFT JOIN topics t ON bt.topic_id = t.id
            GROUP BY b.id
            ORDER BY b.title ASC
        `);
        return result.rows;
    }

    /**
     * Searches for books by title, author, or topic.
     *
     * @param {Object} filters - Search filters.
     * @param {string} [filters.title] - Partial title match (case-insensitive).
     * @param {string} [filters.author] - Partial author match (case-insensitive).
     * @param {string} [filters.topic] - Partial topic match (case-insensitive).
     *
     * @returns {Promise<Object[]>} List of matching books with authors and topics.
     * @example Response:
     * [
     *   {
     *     "id": 2,
     *     "title": "Harry Potter and the Sorcerer's Stone",
     *     "cover_image": "https://example.com/hp1.jpg",
     *     "year_published": 1997,
     *     "synopsis": "A young wizard discovers his magical heritage...",
     *     "created_at": "2024-02-06T12:00:00.000Z",
     *     "authors": ["J.K. Rowling"],
     *     "topics": ["Magic", "Adventure"]
     *   }
     * ]
     */
    static async searchBooks({ title, author, topic }) {
        let query = `
            SELECT
                b.id,
                b.title,
                b.cover_image,
                b.year_published,
                b.synopsis,
                b.created_at,
                COALESCE(json_agg(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL), '[]') AS authors,
                COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS topics
            FROM books b
                     LEFT JOIN book_authors ba ON b.id = ba.book_id
                     LEFT JOIN authors a ON ba.author_id = a.id
                     LEFT JOIN book_topics bt ON b.id = bt.book_id
                     LEFT JOIN topics t ON bt.topic_id = t.id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (title) {
            query += ` AND b.title ILIKE $${paramIndex}`;
            params.push(`%${title}%`);
            paramIndex++;
        }
        if (author) {
            query += ` AND a.name ILIKE $${paramIndex}`;
            params.push(`%${author}%`);
            paramIndex++;
        }
        if (topic) {
            query += ` AND t.name ILIKE $${paramIndex}`;
            params.push(`%${topic}%`);
            paramIndex++;
        }

        query += `
            GROUP BY b.id
            ORDER BY b.title ASC
        `;

        const result = await db.query(query, params);
        return result.rows;
    }
}

module.exports = Book;
