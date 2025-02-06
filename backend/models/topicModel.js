const db = require('../config/db');

class Topic {
    /**
     * Retrieves a list of all possible topics (ID and Name).
     *
     * @returns {Promise<Object[]>} List of topics.
     * @example Response:
     * [
     *   { "id": 1, "name": "Fantasy" },
     *   { "id": 2, "name": "Adventure" }
     * ]
     */
    static async getAllTopics() {
        const result = await db.query(`SELECT id, name
                                       FROM topics
                                       ORDER BY name ASC`);
        return result.rows;
    }

    /**
     * Retrieves a list of topics, each with books and their authors.
     *
     * @returns {Promise<Object[]>} List of topics with books and authors.
     * @example Response:
     * [
     *   {
     *     "id": 1,
     *     "name": "Fantasy",
     *     "books": [
     *       {
     *         "id": 1,
     *         "title": "The Hobbit",
     *         "authors": ["J.R.R. Tolkien"]
     *       }
     *     ]
     *   }
     * ]
     */
    static async getTopicsWithBooks() {
        const result = await db.query(`
            SELECT t.id   AS topic_id,
                   t.name AS topic_name,
                   COALESCE(
                                   JSONB_AGG(
                                   DISTINCT JSONB_BUILD_OBJECT(
                                           'id', b.id,
                                           'title', b.title,
                                           'authors', COALESCE(
                                                   (SELECT JSONB_AGG(DISTINCT a.name)
                                                    FROM book_authors ba
                                                             LEFT JOIN authors a ON ba.author_id = a.id
                                                    WHERE ba.book_id = b.id), '[]')
                                            )
                                            ) FILTER (WHERE b.id IS NOT NULL), '[]'
                   )      AS books
            FROM topics t
                     LEFT JOIN book_topics bt ON t.id = bt.topic_id
                     LEFT JOIN books b ON bt.book_id = b.id
            GROUP BY t.id, t.name
            ORDER BY t.name ASC
        `);

        console.log("Processed Topics DB result:", result.rows); // Debugging output
        return result.rows;
    }
}

module.exports = Topic;
