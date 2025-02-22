/**
 * bookModel.test.js
 *
 * Jest test suite for the Books Model in the Fantasy Book Hub backend.
 * Ensures database queries for books work correctly.
 */

const db = require("../config/testDatabase");
const Book = require("../models/bookModel");

beforeAll(async () => {
    console.log("Seeding test data for books...");

    // Ensure database is clean before tests
    await db.query("DELETE FROM book_topics");
    await db.query("DELETE FROM book_authors");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM authors");
    await db.query("DELETE FROM topics");

    // Insert test book
    await db.query(`
        INSERT INTO books (id, title, cover_image, year_published, synopsis)
        VALUES (1, 'Test Book', 'https://example.com/test.jpg', 2000, 'A test book for testing purposes.')
        ON CONFLICT (title) DO NOTHING;
    `);

    // Insert test author
    await db.query(`
        INSERT INTO authors (id, name)
        VALUES (1, 'Test Author')
        ON CONFLICT (name) DO NOTHING;
    `);

    // Insert test topic
    await db.query(`
        INSERT INTO topics (id, name)
        VALUES (1, 'Test Topic')
        ON CONFLICT (name) DO NOTHING;
    `);

    // Insert relationships
    await db.query(`
        INSERT INTO book_authors (book_id, author_id)
        VALUES (1, 1)
        ON CONFLICT DO NOTHING;
    `);

    await db.query(`
        INSERT INTO book_topics (book_id, topic_id)
        VALUES (1, 1)
        ON CONFLICT DO NOTHING;
    `);
});

afterAll(async () => {
    console.log("Cleaning up test database...");
    await db.query("DELETE FROM book_topics");
    await db.query("DELETE FROM book_authors");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM authors");
    await db.query("DELETE FROM topics");

    await new Promise((resolve) => setTimeout(resolve, 100));

    await db.end();
    console.log("Database connection closed.");
});


describe("Books Model", () => {
    // ========================
    // Test: getAllBooks()
    // ========================
    test("getAllBooks() retrieves a list of books with authors and topics", async () => {
        const result = await Book.getAllBooks(1, 10);

        expect(result).toHaveProperty("books");
        expect(result).toHaveProperty("totalBooks");

        expect(result.books.length).toBe(1);
        expect(result.totalBooks).toBe(1);

        const book = result.books[0];
        expect(book).toHaveProperty("id", 1);
        expect(book).toHaveProperty("title", "Test Book");
        expect(book.authors).toContain("Test Author");
        expect(book.topics).toContain("Test Topic");
    });

    // ========================
    // Test: getBookById()
    // ========================
    test("getBookById() retrieves a book by ID with authors and topics", async () => {
        const book = await Book.getBookById(1);

        expect(book).toHaveProperty("id", 1);
        expect(book).toHaveProperty("title", "Test Book");
        expect(book.authors).toContain("Test Author");
        expect(book.topics).toContain("Test Topic");
    });

    // ========================
    // Test: searchBooks()
    // ========================
    test("searchBooks() filters books by title", async () => {
        const result = await Book.searchBooks({ title: "Test Book" });

        expect(result).toHaveProperty("books");
        expect(result.books.length).toBe(1);
        expect(result.books[0].title).toBe("Test Book");

        const noMatch = await Book.searchBooks({ title: "Nonexistent" });
        expect(noMatch.books.length).toBe(0);
    });

    test("searchBooks() filters books by author name", async () => {
        const result = await Book.searchBooks({ author: "Test Author" });

        expect(result.books.length).toBe(1);
        expect(result.books[0].title).toBe("Test Book");
    });

    test("searchBooks() filters books by topic", async () => {
        const result = await Book.searchBooks({ topic: "Test Topic" });

        expect(result.books.length).toBe(1);
        expect(result.books[0].title).toBe("Test Book");
    });

    // ========================
    // Test: searchBooksByQuery()
    // ========================
    test("searchBooksByQuery() performs dynamic searches based on query string", async () => {
        const result = await Book.searchBooksByQuery("Test");

        expect(result.length).toBe(1);
        expect(result[0].title).toBe("Test Book");

        const noResult = await Book.searchBooksByQuery("xyz");
        expect(noResult.length).toBe(0);
    });

    // ========================
    // Test: getAllBooks() with Pagination
    // ========================
    test("getAllBooks() correctly applies pagination", async () => {
        await db.query(`
            INSERT INTO books (id, title, cover_image, year_published, synopsis)
            VALUES (2, 'Another Test Book', 'https://example.com/another.jpg', 2010, 'Another test book.')
        `);

        const page1 = await Book.getAllBooks(1, 1);
        expect(page1.books.length).toBe(1);
        expect(page1.totalBooks).toBe(2);

        const page2 = await Book.getAllBooks(2, 1);
        expect(page2.books.length).toBe(1);
        expect(page2.books[0].title).toBe("Another Test Book");
    });
});
