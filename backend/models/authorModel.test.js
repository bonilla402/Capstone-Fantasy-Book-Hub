require("dotenv").config({ path: ".env.test" });
const db = require("../config/db");
const Author = require("./authorModel");

let testAuthorId, testBookId, testTopicId;

beforeAll(async () => {
    console.log("Seeding test data for authors...");

    // Clear all existing test data before inserting new data
    await db.query("DELETE FROM book_topics");
    await db.query("DELETE FROM book_authors");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM authors");
    await db.query("DELETE FROM topics");

    const authorInsert = await db.query(
        `INSERT INTO authors (name) VALUES ($1) RETURNING id`,
        ["Test Author"]
    );
    testAuthorId = authorInsert.rows[0].id;

    const bookInsert = await db.query(
        `INSERT INTO books (title, cover_image, year_published, synopsis)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ["Test Book", "https://example.com/test.jpg", 2000, "A test book for testing."]
    );
    testBookId = bookInsert.rows[0].id;

    await db.query(
        `INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)`,
        [testBookId, testAuthorId]
    );

    const topicInsert = await db.query(
        `INSERT INTO topics (name) VALUES ($1) RETURNING id`,
        ["Test Topic"]
    );
    testTopicId = topicInsert.rows[0].id;

    await db.query(
        `INSERT INTO book_topics (book_id, topic_id) VALUES ($1, $2)`,
        [testBookId, testTopicId]
    );
});

afterAll(async () => {
    console.log("Cleaning up test database...");

    await db.query("DELETE FROM book_topics");
    await db.query("DELETE FROM book_authors");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM authors");
    await db.query("DELETE FROM topics");

    await db.end();
    console.log("Database connection closed for book tests.");
});

describe("Author Model", () => {
    test("getAllAuthors() retrieves a list of authors", async () => {
        const authors = await Author.getAllAuthors();
        expect(authors.length).toBeGreaterThan(0);
        expect(authors[0]).toHaveProperty("id", testAuthorId);
        expect(authors[0]).toHaveProperty("name", "Test Author");
    });

    test("getAuthorsWithBooks() retrieves authors with books and topics", async () => {
        const authors = await Author.getAuthorsWithBooks();
        expect(authors.length).toBeGreaterThan(0);

        const author = authors.find(a => a.author_id === testAuthorId);
        expect(author).toBeDefined();
        expect(author).toHaveProperty("author_name", "Test Author");

        expect(Array.isArray(author.books)).toBe(true);
        expect(author.books.length).toBeGreaterThan(0);

        const book = author.books.find(b => b.id === testBookId);
        expect(book).toBeDefined();
        expect(book).toHaveProperty("title", "Test Book");
        expect(book.topics).toContain("Test Topic");
    });

    test("searchAuthorsByName() filters authors by name", async () => {
        const authors = await Author.searchAuthorsByName("Test");
        expect(authors.length).toBeGreaterThan(0);

        const author = authors.find(a => a.author_id === testAuthorId);
        expect(author).toBeDefined();
        expect(author).toHaveProperty("author_name", "Test Author");

        expect(Array.isArray(author.books)).toBe(true);
        expect(author.books.length).toBeGreaterThan(0);

        const book = author.books.find(b => b.id === testBookId);
        expect(book).toBeDefined();
        expect(book).toHaveProperty("title", "Test Book");
        expect(book.topics).toContain("Test Topic");
    });

    test("searchAuthorsByName() returns empty array when no match is found", async () => {
        const authors = await Author.searchAuthorsByName("Nonexistent");
        expect(authors.length).toBe(0);
    });
});
