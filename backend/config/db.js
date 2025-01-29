const { Client } = require('pg');
require('dotenv').config();

const db = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://localhost/fantasy_book_hub"
});

db.connect();

module.exports = db;
