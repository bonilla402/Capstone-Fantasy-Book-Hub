require("dotenv").config({ path: ".env.test" });
const db = require("../config/testDatabase");
const Book = require("../models/bookModel");

let testBookId, testAuthorId, testTopicId;

beforeAll(async () => {
    console.log("Seeding test data for books...");

    await Promise.all([
        db.query("DELETE FROM book_topics"),
        db.query("DELETE FROM book_authors"),
        db.query("DELETE FROM books"),
        db.query("DELETE FROM authors"),
        db.query("DELETE FROM topics")
    ]);

    const bookInsert = await db.query(`
        INSERT INTO books (title, cover_image, year_published, synopsis)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ['Test Book', 'https://example.com/test.jpg', 2000, 'A test book for testing purposes.']);

    testBookId = bookInsert.rows[0].id;

    const authorInsert = await db.query(`
        INSERT INTO authors (name) VALUES ($1) RETURNING id
    `, ['Test Author']);

    testAuthorId = authorInsert.rows[0].id;

    await db.query(`
        INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)
    `, [testBookId, testAuthorId]);

    const topicInsert = await db.query(`
        INSERT INTO topics (name) VALUES ($1) RETURNING id
    `, ['Test Topic']);

    testTopicId = topicInsert.rows[0].id;

    await db.query(`
        INSERT INTO book_topics (book_id, topic_id) VALUES ($1, $2)
    `, [testBookId, testTopicId]);
});

afterAll(async () => {
    console.log("Cleaning up test database...");

    await Promise.all([
        db.query("DELETE FROM book_topics"),
        db.query("DELETE FROM book_authors"),
        db.query("DELETE FROM books"),
        db.query("DELETE FROM authors"),
        db.query("DELETE FROM topics")
    ]);

    await db.end();
    console.log("Database connection closed.");
});

describe("Books Model", () => {
    test("getBookById() retrieves a book by ID with authors and topics", async () => {
        const book = await Book.getBookById(testBookId);
        expect(book).toHaveProperty("id", testBookId);
        expect(book).toHaveProperty("title", "Test Book");
        expect(book.authors).toContain("Test Author");
        expect(book.topics).toContain("Test Topic");
    });

    test("getAllBooks() retrieves a list of books with authors and topics", async () => {
        const result = await Book.getAllBooks(1, 10);
        expect(result).toHaveProperty("books");
        expect(result).toHaveProperty("totalBooks");
        expect(result.books.length).toBeGreaterThan(0);
    });

    test("searchBooks() filters books by title", async () => {
        const result = await Book.searchBooks({ title: "Test Book" });
        expect(result.books.length).toBeGreaterThan(0);
    });

    test("searchBooks() filters books by author name", async () => {
        const result = await Book.searchBooks({ author: "Test Author" });
        expect(result.books.length).toBeGreaterThan(0);
    });

    test("searchBooks() filters books by topic", async () => {
        const result = await Book.searchBooks({ topic: "Test Topic" });
        expect(result.books.length).toBeGreaterThan(0);
    });

    test("searchBooksByQuery() performs dynamic searches", async () => {
        const result = await Book.searchBooksByQuery("Test");
        expect(result.length).toBeGreaterThan(0);
    });

    test("getAllBooks() correctly applies pagination", async () => {
        const anotherBookInsert = await db.query(`
            INSERT INTO books (title, cover_image, year_published, synopsis)
            VALUES ('Another Test Book', 'https://example.com/another.jpg', 2010, 'Another test book.') RETURNING id
        `);

        const anotherBookId = anotherBookInsert.rows[0].id;

        const page1 = await Book.getAllBooks(1, 1);
        expect(page1.books.length).toBe(1);
    });
});
