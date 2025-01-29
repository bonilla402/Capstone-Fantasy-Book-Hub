const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load JSON data
const jsonFilePath = path.join(__dirname, 'books_data.json');
const booksData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

// PostgreSQL connection configuration
const dbConfig = {
    user: 'postgres',      
    host: 'localhost',
    database: 'postgres',   
    password: '123456',     
    port: 5432,             
};

const client = new Client(dbConfig);

async function seedDatabase() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        // Step 1: Create the database if it doesn't exist
        const dbName = 'fantasy_book_hub';
        const checkDbExistsQuery = `SELECT 1 FROM pg_database WHERE LOWER(datname) = LOWER($1)`;
        const result = await client.query(checkDbExistsQuery, [dbName]);

        if (result.rowCount === 0) {
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }

        await client.end();

        // Step 2: Connect to the new database
        const newDbConfig = { ...dbConfig, database: dbName };
        const newClient = new Client(newDbConfig);
        await newClient.connect();
        console.log(`Connected to database '${dbName}'`);

        // Step 3: Create tables
        const schemaSQL = `
            DROP TABLE IF EXISTS book_topics, book_authors, books, authors, topics, users, discussion_groups, group_discussions, reviews CASCADE;

            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
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
        `;

        await newClient.query(schemaSQL);
        console.log('Tables created successfully.');

        // Step 4: Insert book data with trimming and case-insensitive checks
        for (const book of booksData) {
            const title = book.title.trim();
            const coverUrl = book.coverUrl ? book.coverUrl.trim() : null;
            const yearPublished = (book.firstPublished && !isNaN(parseInt(book.firstPublished)))
                ? parseInt(book.firstPublished)
                : null;
            const synopsis = book.synopsis ? book.synopsis.trim() : null;
            const authors = book.author ? book.author.split(',').map(a => a.trim()) : [];

            // Ensure topics are properly processed and split
            let topics = [];
            if (Array.isArray(book.topics)) {
                topics = book.topics.flatMap(t => t.split('/').join(',')
                                                   .split(';').join(',')
                                                   .split('-').join(',')
                                                   .split(',')
                                                   .map(t => t.trim()))
                                    .filter(t => t !== '');
            } else if (typeof book.topics === 'string') {
                topics = book.topics.split('/').join(',')
                                    .split(';').join(',')
                                    .split('-').join(',')
                                    .split(',')
                                    .map(t => t.trim())
                                    .filter(t => t !== '');
            }

            // Insert book data
            const bookInsertQuery = `
                INSERT INTO books (title, cover_image, year_published, synopsis)
                VALUES ($1, $2, $3, $4) RETURNING id
            `;
            const bookValues = [title, coverUrl, yearPublished, synopsis];
            const bookResult = await newClient.query(bookInsertQuery, bookValues);
            const bookId = bookResult.rows[0].id;

            // Insert authors with case-insensitive check and avoid duplicates
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
                    `INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, 
                    [bookId, authorId]
                );
            }

            // Insert topics with case-insensitive check and avoid duplicates
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
                    `INSERT INTO book_topics (book_id, topic_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, 
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

seedDatabase();
