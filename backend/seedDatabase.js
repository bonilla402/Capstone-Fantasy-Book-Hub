/**
 * seedDatabase.js
 *
 * Seeds the PostgreSQL database for the Fantasy Book Hub application,
 * creating tables and populating them with initial data from a JSON file.
 * This script:
 *  1. Connects to the default PostgreSQL instance.
 *  2. Creates the database if it doesn't already exist.
 *  3. Connects to the newly created (or existing) database.
 *  4. Builds the schema (tables and relationships).
 *  5. Seeds default data, including an admin user.
 *  6. Inserts book, author, and topic data from a JSON file.
 *
 * Usage:
 *   node seedDatabase.js
 *
 * Environment Variables (optional):
 *   BCRYPT_WORK_FACTOR  (defaults to 12 if not set)
 *   Database connection details (in dbConfig) can be adjusted as needed.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

// The cost factor for hashing passwords.
const BCRYPT_WORK_FACTOR = 12;

// Load JSON data for books
const jsonFilePath = path.join(__dirname, 'books_data.json');
const booksData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

/**
 * Database connection configuration. Adjust these values to match
 * your local or remote database environment.
 */
const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '123456',
    port: 5432,
};

const client = new Client(dbConfig);

/**
 * Seeds the database by:
 *  1. Connecting to PostgreSQL and checking if the target database exists.
 *  2. Creating the database if necessary.
 *  3. Reconnecting to the target database.
 *  4. Dropping and recreating tables (if they exist).
 *  5. Creating a default admin user.
 *  6. Reading book data from JSON and inserting authors, books, and topics,
 *     avoiding duplicate entries via case-insensitive checks.
 *
 * @async
 * @function seedDatabase
 * @returns {Promise<void>} A Promise that resolves when all seeding steps are complete.
 * @throws Will log an error to the console if any operation fails.
 *
 * @example
 * // To run:
 * //  node seedDatabase.js
 */
async function seedDatabase() {
    try {
        // Step 1: Connect to the default PostgreSQL instance.
        await client.connect();
        console.log('Connected to PostgreSQL');

        // Determine if the 'fantasy_book_hub' database exists. Create it if not.
        const dbName = 'fantasy_book_hub';
        const checkDbExistsQuery = `SELECT 1 FROM pg_database WHERE LOWER(datname) = LOWER($1)`;
        const result = await client.query(checkDbExistsQuery, [dbName]);

        if (result.rowCount === 0) {
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }

        // Close the initial connection
        await client.end();

        // Step 2: Connect to the target database.
        const newDbConfig = { ...dbConfig, database: dbName };
        const newClient = new Client(newDbConfig);
        await newClient.connect();
        console.log(`Connected to database '${dbName}'`);

        // Step 3: Create or recreate tables (drops any existing tables).
        const schemaSQL = `
            DROP TABLE IF EXISTS book_topics, book_authors, books, authors, topics, users, discussion_groups, group_discussions, reviews, group_members, discussion_messages CASCADE;

            CREATE TABLE users (
                                   id SERIAL PRIMARY KEY,
                                   username VARCHAR(50) NOT NULL UNIQUE,
                                   email VARCHAR(100) NOT NULL UNIQUE,
                                   password_hash TEXT NOT NULL,
                                   is_admin BOOLEAN DEFAULT FALSE,
                                   profile_image TEXT,
                                   bio TEXT,
                                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE authors (
                                     id SERIAL PRIMARY KEY,
                                     name VARCHAR(100) NOT NULL,
                                     bio TEXT,
                                     birth_year INTEGER,
                                     death_year INTEGER
            );

            CREATE TABLE books (
                                   id SERIAL PRIMARY KEY,
                                   title VARCHAR(255) NOT NULL,
                                   cover_image TEXT,
                                   year_published INTEGER,
                                   synopsis TEXT,
                                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE book_authors (
                                          book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
                                          author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
                                          PRIMARY KEY (book_id, author_id)
            );

            CREATE TABLE topics (
                                    id SERIAL PRIMARY KEY,
                                    name VARCHAR(100) NOT NULL UNIQUE
            );

            CREATE TABLE book_topics (
                                         book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
                                         topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
                                         PRIMARY KEY (book_id, topic_id)
            );

            CREATE TABLE reviews (
                                     id SERIAL PRIMARY KEY,
                                     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                     book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
                                     rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                                     review_text TEXT,
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE discussion_groups (
                                               id SERIAL PRIMARY KEY,
                                               group_name VARCHAR(100) NOT NULL UNIQUE,
                                               description TEXT,
                                               created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
                                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE group_discussions (
                                               id SERIAL PRIMARY KEY,
                                               group_id INTEGER NOT NULL REFERENCES discussion_groups(id) ON DELETE CASCADE,
                                               user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
                                               book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
                                               title VARCHAR(255) NOT NULL,
                                               content TEXT NOT NULL,
                                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE group_members (
                                           user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                           group_id INTEGER NOT NULL REFERENCES discussion_groups(id) ON DELETE CASCADE,
                                           PRIMARY KEY (user_id, group_id)
            );

            CREATE TABLE discussion_messages (
                                                 id SERIAL PRIMARY KEY,
                                                 discussion_id INTEGER NOT NULL REFERENCES group_discussions(id) ON DELETE CASCADE,
                                                 user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
                                                 content TEXT NOT NULL,
                                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await newClient.query(schemaSQL);
        console.log('Tables created successfully.');

        // Step 4: Create a default admin user if not already present.
        console.log("Seeding users...");
        const hashedAdminPassword = await bcrypt.hash("admin123", BCRYPT_WORK_FACTOR);

        await newClient.query(
            `INSERT INTO users (username, email, password_hash, is_admin)
             VALUES ('admin', 'admin@example.com', $1, TRUE)
             ON CONFLICT (email) DO NOTHING`,
            [hashedAdminPassword]
        );
        console.log("Admin user seeded.");

        // Step 5: Insert book data from the JSON file.
        // Each book record may contain multiple authors and topics.
        for (const book of booksData) {
            const title = book.title.trim();
            const coverUrl = book.coverUrl ? book.coverUrl.trim() : null;
            const yearPublished = (book.firstPublished && !isNaN(parseInt(book.firstPublished)))
                ? parseInt(book.firstPublished)
                : null;
            const synopsis = book.synopsis ? book.synopsis.trim() : null;
            const authors = book.author ? book.author.split(',').map(a => a.trim()) : [];

            // Parse topic fields, merging, splitting, and cleaning up delimiters.
            let topics = [];
            if (Array.isArray(book.topics)) {
                topics = book.topics.flatMap(t =>
                    t.split('/').join(',')
                        .split(';').join(',')
                        .split('-').join(',')
                        .split(',')
                        .map(x => x.trim()))
                    .filter(x => x !== '');
            } else if (typeof book.topics === 'string') {
                topics = book.topics.split('/').join(',')
                    .split(';').join(',')
                    .split('-').join(',')
                    .split(',')
                    .map(x => x.trim())
                    .filter(x => x !== '');
            }

            // Insert the book into the "books" table.
            const bookInsertQuery = `
                INSERT INTO books (title, cover_image, year_published, synopsis)
                VALUES ($1, $2, $3, $4) RETURNING id
            `;
            const bookValues = [title, coverUrl, yearPublished, synopsis];
            const bookResult = await newClient.query(bookInsertQuery, bookValues);
            const bookId = bookResult.rows[0].id;

            // Insert authors, avoiding duplicates by using case-insensitive checks.
            for (const author of authors) {
                const trimmedAuthor = author.toLowerCase();
                const authorCheck = await newClient.query(
                    `SELECT id FROM authors WHERE LOWER(name) = LOWER($1)`, [trimmedAuthor]
                );

                let authorId;
                if (authorCheck.rowCount === 0) {
                    const authorInsert = await newClient.query(
                        `INSERT INTO authors (name) VALUES ($1) RETURNING id`, [author.trim()]
                    );
                    authorId = authorInsert.rows[0].id;
                } else {
                    authorId = authorCheck.rows[0].id;
                }

                await newClient.query(
                    `INSERT INTO book_authors (book_id, author_id)
                     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [bookId, authorId]
                );
            }

            // Insert topics, also avoiding duplicates by using case-insensitive checks.
            for (const topic of topics) {
                const trimmedTopic = topic.toLowerCase();
                const topicCheck = await newClient.query(
                    `SELECT id FROM topics WHERE LOWER(name) = LOWER($1)`, [trimmedTopic]
                );

                let topicId;
                if (topicCheck.rowCount === 0) {
                    const topicInsert = await newClient.query(
                        `INSERT INTO topics (name) VALUES ($1) RETURNING id`, [topic]
                    );
                    topicId = topicInsert.rows[0].id;
                } else {
                    topicId = topicCheck.rows[0].id;
                }

                await newClient.query(
                    `INSERT INTO book_topics (book_id, topic_id)
                     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [bookId, topicId]
                );
            }
        }

        console.log('Data imported successfully.');
        await newClient.end();
        console.log('Database seeding complete.');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

// Execute the main seeding function
seedDatabase();
