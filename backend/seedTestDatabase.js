require("dotenv").config({ path: ".env.test" });
const { Client } = require("pg");
const bcrypt = require("bcrypt");

const BCRYPT_WORK_FACTOR = 12;

const dbConfig = {
    user: process.env.DATABASE_USER || "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    database: "postgres",
    password: process.env.DATABASE_PASSWORD || "123456",
    port: process.env.DATABASE_PORT || 5432,
};

const client = new Client(dbConfig);

async function seedTestDatabase() {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL for test database setup.");

        const testDbName = "fantasy_book_hub_test";
        const checkDbExistsQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
        const result = await client.query(checkDbExistsQuery, [testDbName]);

        if (result.rowCount === 0) {
            await client.query(`CREATE DATABASE ${testDbName}`);
            console.log(`Test database '${testDbName}' created.`);
        } else {
            console.log(`Test database '${testDbName}' already exists.`);
        }

        await client.end();

        const testDbConfig = { ...dbConfig, database: testDbName };
        const testClient = new Client(testDbConfig);
        await testClient.connect();
        console.log(`Connected to test database '${testDbName}'`);

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

        await testClient.query(schemaSQL);
        console.log("Test database schema created successfully.");

        console.log("Seeding users...");
        const hashedAdminPassword = await bcrypt.hash("admin123", BCRYPT_WORK_FACTOR);

        await testClient.query(
            `INSERT INTO users (username, email, password_hash, is_admin)
             VALUES ('admin', 'admin@example.com', $1, TRUE)
             ON CONFLICT (email) DO NOTHING`,
            [hashedAdminPassword]
        );

        console.log("Admin user seeded.");

        console.log("Test database seeded successfully.");
        await testClient.end();
    } catch (error) {
        console.error("Error seeding test database:", error);
    }
}

seedTestDatabase();
