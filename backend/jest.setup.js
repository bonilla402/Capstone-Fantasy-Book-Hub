require("dotenv").config({ path: ".env.test" });
const db = require("./config/testDatabase");

/**
 * Global setup for Jest.
 * - Ensures test database is clean before each test.
 * - Closes the database connection after all tests.
 */

beforeAll(async () => {
    console.log("Setting up test database...");

    // Ensure test database is clean before tests
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM authors");
    await db.query("DELETE FROM book_authors");
    await db.query("DELETE FROM book_topics");
    await db.query("DELETE FROM topics");
});

afterAll(async () => {
    console.log("Closing test database connection...");
    await db.end(); // Close the connection pool
});

module.exports = db;
