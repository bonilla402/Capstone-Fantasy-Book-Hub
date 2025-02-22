const db = require('../config/db');

/**
 * The Topic class provides methods for retrieving topics and their associated books.
 */
class Topic {
    /**
     * Retrieves a list of all topics, returning each topic's ID and name.
     *
     * @returns {Promise<Object[]>} A promise that resolves to an array of topic objects.
     * @example
     * [
     *   { "id": 1, "name": "Fantasy" },
     *   { "id": 2, "name": "Adventure" }
     * ]
     */
    static async getAllTopics() {
        const result = await db.query(`
            SELECT id, name
            FROM topics
            ORDER BY name ASC
        `);
        return result.rows;
    }

    /**
     * Retrieves a list of topics, each including a nested array of books
     * associated with that topic, as well as the books' authors.
     *
     * @returns {Promise<Object[]>} A promise that resolves to an array of topics,
     * where each topic contains a list of books and their authors.
     * @example
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
                                                   (
                                                       SELECT JSONB_AGG(DISTINCT a.name)
                                                       FROM book_authors ba
                                                                LEFT JOIN authors a ON ba.author_id = a.id
                                                    WHERE ba.book_id = b.id), '[]')
                                                      )
                                            ) FILTER (WHERE b.id IS NOT NULL), '[]'
                   ) AS books
            FROM topics t
                     LEFT JOIN book_topics bt ON t.id = bt.topic_id
                     LEFT JOIN books b ON bt.book_id = b.id
            GROUP BY t.id, t.name
            ORDER BY t.name ASC
        `);
        
        return result.rows;
    }
}

module.exports = Topic;
