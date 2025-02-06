const db = require('../config/db');

class Author {
    /**
     * Retrieves a simple list of authors (ID and Name).
     *
     * @returns {Promise<Object[]>} List of authors.
     * @example Response:
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
     * Retrieves a list of authors, each with their books and topics.
     *
     * @returns {Promise<Object[]>} List of authors with books and topics.
     * @example Response:
     * [
     *   {
     *     "id": 1,
     *     "name": "J.R.R. Tolkien",
     *     "books": [
     *       {
     *         "id": 1,
     *         "title": "The Hobbit",
     *         "topics": ["Fantasy", "Adventure"]
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
     * Searches for authors by name (case-insensitive) and returns their books & topics.
     *
     * @param {string} name - The search term for matching authors.
     * @returns {Promise<Object[]>} List of matching authors with books and topics.
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
                            (SELECT JSONB_AGG(DISTINCT t.name) FROM book_topics bt 
                             LEFT JOIN topics t ON bt.topic_id = t.id WHERE bt.book_id = b.id), '[]')
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
