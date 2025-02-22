const db = require('../config/db');

/**
 * The Book class provides operations for retrieving and searching books,
 * including associated authors, topics, discussion group counts, and ratings.
 */
class Book {
    /**
     * Retrieves all books along with their authors and topics, as well as group counts
     * and average ratings, with optional pagination.
     *
     * @param {number} [page=1] - The page number for pagination (1-based).
     * @param {number} [limit=20] - The number of books to retrieve per page.
     * @returns {Promise<Object>} A promise that resolves to an object containing:
     *  - books: An array of book objects
     *  - totalBooks: The total count of books
     * @example
     * {
     *   books: [
     *     {
     *       id: 1,
     *       title: "The Hobbit",
     *       cover_image: "https://example.com/hobbit.jpg",
     *       year_published: 1937,
     *       synopsis: "A hobbit embarks on a journey...",
     *       authors: ["J.R.R. Tolkien"],
     *       topics: ["Fantasy", "Adventure"],
     *       group_count: 3,
     *       average_rating: "4.5 of 120 reviews"
     *     }
     *   ],
     *   totalBooks: 100
     * }
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
                   ) AS group_count,
                   COALESCE((
                                SELECT ROUND(AVG(r.rating), 1) || ' of ' || COUNT(r.id) || ' reviews'
                                FROM reviews r WHERE r.book_id = b.id
                            ), 'No reviews') AS average_rating
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
                group_count: row.group_count || 0,
                average_rating: row.average_rating
            })),
            totalBooks: totalBooks.rows[0].total
        };
    }

    /**
     * Searches for books based on various filters (title, author, topic), with optional pagination.
     *
     * @param {Object} filters - The filter object containing:
     *  - {string} [filters.title] - Partial title match (case-insensitive).
     *  - {string} [filters.author] - Partial author match (case-insensitive).
     *  - {string} [filters.topic] - Partial topic match (case-insensitive).
     *  - {number} [filters.page=1] - The page number for pagination.
     *  - {number} [filters.limit=20] - The number of books per page.
     * @returns {Promise<Object>} A promise that resolves to an object containing:
     *  - books: An array of book objects
     *  - totalBooks: The count of matching books (based on the current query results)
     * @example
     * {
     *   books: [
     *     {
     *       id: 2,
     *       title: "Harry Potter and the Sorcerer's Stone",
     *       cover_image: "https://example.com/hp1.jpg",
     *       year_published: 1997,
     *       synopsis: "A young wizard discovers his magical heritage...",
     *       authors: ["J.K. Rowling"],
     *       topics: ["Magic", "Adventure"],
     *       average_rating: "4.8 of 345 reviews"
     *     }
     *   ],
     *   totalBooks: 1
     * }
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
                COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS topics,
                (
                    SELECT COUNT(DISTINCT dg.id)
                    FROM discussion_groups dg
                             JOIN group_discussions gd ON dg.id = gd.group_id
                    WHERE gd.book_id = b.id
                ) AS group_count,
                COALESCE((
                             SELECT ROUND(AVG(r.rating), 1) || ' of ' || COUNT(r.id) || ' reviews'
                             FROM reviews r WHERE r.book_id = b.id
                         ), 'No reviews') AS average_rating
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

    /**
     * Searches for books by a given query string, matching titles or author names.
     *
     * @param {string} query - The partial search string.
     * @param {number} [limit=10] - The maximum number of results to return.
     * @returns {Promise<Object[]>} A promise that resolves to an array of matching book objects.
     * @example
     * [
     *   {
     *     id: 2,
     *     title: "Harry Potter and the Sorcerer's Stone",
     *     cover_image: "https://example.com/hp1.jpg",
     *     year_published: 1997,
     *     authors: ["J.K. Rowling"]
     *   }
     * ]
     */
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

    /**
     * Retrieves a single book by its unique ID, along with its authors, topics, average rating,
     * and the discussion groups that feature it.
     *
     * @param {number} bookId - The ID of the book to retrieve.
     * @returns {Promise<Object|null>} A promise that resolves to the book object if found,
     * or null otherwise.
     * @example
     * {
     *   id: 1,
     *   title: "The Hobbit",
     *   cover_image: "https://example.com/hobbit.jpg",
     *   year_published: 1937,
     *   synopsis: "A hobbit embarks on a journey...",
     *   authors: ["J.R.R. Tolkien"],
     *   topics: ["Fantasy", "Adventure"],
     *   average_rating: "4.5 of 120 reviews",
     *   groups: [
     *     {
     *       id: 10,
     *       group_name: "Fantasy Fans"
     *     }
     *   ]
     * }
     */
    static async getBookById(bookId) {
        const result = await db.query(`
            SELECT b.id,
                   b.title,
                   b.cover_image,
                   b.year_published,
                   b.synopsis,
                   COALESCE(json_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL), '[]') AS authors,
                   COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS topics,
                   COALESCE((
                                SELECT ROUND(AVG(r.rating), 1) || ' of ' || COUNT(r.id) || ' reviews'
                                FROM reviews r WHERE r.book_id = b.id
                            ), 'No reviews') AS average_rating
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
            average_rating: book.average_rating,
            groups: groupResults.rows || []
        };
    }
}

module.exports = Book;
