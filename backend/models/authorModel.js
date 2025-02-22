const db = require('../config/db');

/**
 * The Author class provides methods for retrieving authors and their associated books,
 * as well as searching authors by name.
 */
class Author {
    /**
     * Retrieves a simple list of authors, returning each author's ID and name.
     *
     * @returns {Promise<Object[]>} A promise that resolves to an array of author objects.
     * @example
     * [
     *   { "id": 1, "name": "J.R.R. Tolkien" },
     *   { "id": 2, "name": "J.K. Rowling" }
     * ]
     */
    static async getAllAuthors() {
        const result = await db.query(`SELECT id, name
                                       FROM authors
                                       ORDER BY name ASC`);
        return result.rows;
    }

    /**
     * Retrieves a list of authors, each with their associated books and the books' topics.
     *
     * @returns {Promise<Object[]>} A promise that resolves to an array of authors,
     * each containing a nested list of their books and associated topics.
     * @example
     * [
     *   {
     *     "id": 1,
     *     "name": "J.R.R. Tolkien",
     *     "books": [
     *       {
     *         "id": 1,
     *         "title": "The Hobbit",
     *         "topics": ["Fantasy", "Adventure"]
     *       },
     *       {
     *         "id": 2,
     *         "title": "The Lord of the Rings",
     *         "topics": ["Fantasy", "Epic"]
     *       }
     *     ]
     *   }
     * ]
     */
    static async getAuthorsWithBooks() {
        const result = await db.query(`
            SELECT a.id   AS author_id,
                   a.name AS author_name,
                   COALESCE(
                                   JSONB_AGG(
                                   DISTINCT JSONB_BUILD_OBJECT(
                                           'id', b.id,
                                           'title', b.title,
                                           'topics', COALESCE(
                                                   (SELECT JSONB_AGG(DISTINCT t.name)
                                                    FROM book_topics bt
                                                             LEFT JOIN topics t ON bt.topic_id = t.id
                                                    WHERE bt.book_id = b.id), '[]')
                                            )
                                            ) FILTER (WHERE b.id IS NOT NULL), '[]'
                   )      AS books
            FROM authors a
                     LEFT JOIN book_authors ba ON a.id = ba.author_id
                     LEFT JOIN books b ON ba.book_id = b.id
            GROUP BY a.id, a.name
            ORDER BY a.name ASC
        `);

        return result.rows;
    }

    /**
     * Searches for authors by name (case-insensitive) and returns a list
     * of matching authors along with their books and associated topics.
     *
     * @param {string} name - The partial or full name to search for (case-insensitive).
     * @returns {Promise<Object[]>} A promise that resolves to an array of author objects
     * matching the provided name. Each author includes a list of their books and topics.
     * @example
     * [
     *   {
     *     "id": 2,
     *     "name": "J.K. Rowling",
     *     "books": [
     *       {
     *         "id": 5,
     *         "title": "Harry Potter and the Sorcerer's Stone",
     *         "topics": ["Magic", "Adventure"]
     *       }
     *     ]
     *   }
     * ]
     */
    static async searchAuthorsByName(name) {
        const result = await db.query(`
            SELECT
                a.id AS author_id,
                a.name AS author_name,
                COALESCE(
                                JSONB_AGG(
                                DISTINCT JSONB_BUILD_OBJECT(
                                        'id', b.id,
                                        'title', b.title,
                                        'topics', COALESCE(
                                                (SELECT JSONB_AGG(DISTINCT t.name)
                                                 FROM book_topics bt
                                                          LEFT JOIN topics t ON bt.topic_id = t.id
                                                 WHERE bt.book_id = b.id), '[]')
                                         )
                                         ) FILTER (WHERE b.id IS NOT NULL), '[]'
                ) AS books
            FROM authors a
                     LEFT JOIN book_authors ba ON a.id = ba.author_id
                     LEFT JOIN books b ON ba.book_id = b.id
            WHERE a.name ILIKE $1
            GROUP BY a.id, a.name
            ORDER BY a.name ASC
        `, [`%${name}%`]);

        return result.rows;
    }
}

module.exports = Author;
