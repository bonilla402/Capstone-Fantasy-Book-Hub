const db = require('../config/db');

class Topic {
    static async getAllTopics() {
        const result = await db.query(`SELECT * FROM topics ORDER BY name ASC`);
        return result.rows;
    }
}

module.exports = Topic;
