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
     *     "topics": ["Fantasy", "Adventure"],
     *     "group_count": groups featuring the book on its dicussions
     *   }
     * ]
     */
    static async getAllBooks(page = 1, limit = 20) {
        const offset = (page - 1) * limit;

        const result = await db.query(`
        SELECT b.id,
               b.title,
               b.cover_image,
               b.year_published,
               b.synopsis,
               COALESCE(json_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL), '[]') AS authors,
               COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS topics,
               (
                   SELECT COUNT(DISTINCT dg.id) 
                   FROM discussion_groups dg
                   JOIN group_discussions gd ON dg.id = gd.group_id
                   WHERE gd.book_id = b.id
               ) AS group_count
        FROM books b
                 LEFT JOIN book_authors ba ON ba.book_id = b.id
                 LEFT JOIN authors a ON ba.author_id = a.id
                 LEFT JOIN book_topics bt ON bt.book_id = b.id
                 LEFT JOIN topics t ON bt.topic_id = t.id
        GROUP BY b.id
        ORDER BY b.title
        LIMIT $1 OFFSET $2;
    `, [limit, offset]);

        const totalBooks = await db.query(`SELECT COUNT(*) AS total FROM books`);

        return {
            books: result.rows.map(row => ({
                id: row.id,
                title: row.title,
                cover_image: row.cover_image,
                year_published: row.year_published,
                synopsis: row.synopsis,
                authors: row.authors,
                topics: row.topics,
                group_count: row.group_count || 0
            })),
            totalBooks: totalBooks.rows[0].total
        };
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
    static async searchBooks({ title, author, topic, page = 1, limit = 20 }) {

        if (!title && !author && !topic) {
            return await Book.getAllBooks(page, limit);
        }

        let query = `
        SELECT
            b.id,
            b.title,
            b.cover_image,
            b.year_published,
            b.synopsis,
            b.created_at,
            COALESCE(json_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL), '[]') AS authors,
            COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS topics
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
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(limit, (page - 1) * limit);

        const result = await db.query(query, params);
        return { books: result.rows, totalBooks: result.rows.length };
    }

    static async searchBooksByQuery(query, limit = 10) {
        if (!query || query.length < 3) {
            return [];
        }

        const sql = `
        SELECT DISTINCT b.id,
               b.title,
               b.cover_image,
               b.year_published,
               COALESCE(ARRAY_AGG(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL), '{}') AS authors
        FROM books b
        LEFT JOIN book_authors ba ON ba.book_id = b.id
        LEFT JOIN authors a ON ba.author_id = a.id
        WHERE b.title ILIKE $1 
           OR a.name ILIKE $1
        GROUP BY b.id
        ORDER BY b.title
        LIMIT $2;
    `;

        console.log("Executing query:", sql, "with params:", [`%${query}%`, limit]);

        const result = await db.query(sql, [`%${query}%`, limit]);
        return result.rows;
    }

    static async getBookById(bookId) {
        const result = await db.query(`
            SELECT b.id,
                   b.title,
                   b.cover_image,
                   b.year_published,
                   b.synopsis,
                   COALESCE(json_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL), '[]') AS authors,
                   COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS topics
            FROM books b
                     LEFT JOIN book_authors ba ON ba.book_id = b.id
                     LEFT JOIN authors a ON ba.author_id = a.id
                     LEFT JOIN book_topics bt ON bt.book_id = b.id
                     LEFT JOIN topics t ON bt.topic_id = t.id
            WHERE b.id = $1
            GROUP BY b.id
        `, [bookId]);

        if (result.rows.length === 0) return null;

        const book = result.rows[0];

        const groupResults = await db.query(`
            SELECT DISTINCT dg.id, dg.group_name
            FROM discussion_groups dg
                     JOIN group_discussions gd ON dg.id = gd.group_id
            WHERE gd.book_id = $1
        `, [bookId]);

        return {
            id: book.id,
            title: book.title,
            cover_image: book.cover_image,
            year_published: book.year_published,
            synopsis: book.synopsis,
            authors: book.authors,
            topics: book.topics,
            groups: groupResults.rows || []
        };
    }

}

module.exports = Book;
