require("dotenv").config({ path: ".env.test" });
const db = require("../config/testDatabase");
const Book = require("../models/bookModel");

beforeAll(async () => {
    console.log("Seeding test data for books...");

    await db.query("DELETE FROM book_topics");
    await db.query("DELETE FROM book_authors");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM authors");
    await db.query("DELETE FROM topics");

    const bookCheck = await db.query(`SELECT id FROM books WHERE title = $1`, ['Test Book']);
    let bookId;

    if (bookCheck.rowCount === 0) {
        const bookInsert = await db.query(`
            INSERT INTO books (title, cover_image, year_published, synopsis)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ['Test Book', 'https://example.com/test.jpg', 2000, 'A test book for testing purposes.']);
        bookId = bookInsert.rows[0].id;
    } else {
        bookId = bookCheck.rows[0].id;
    }

    const authorCheck = await db.query(`SELECT id FROM authors WHERE name = $1`, ['Test Author']);
    let authorId;

    if (authorCheck.rowCount === 0) {
        const authorInsert = await db.query(`
            INSERT INTO authors (name) VALUES ($1) RETURNING id
        `, ['Test Author']);
        authorId = authorInsert.rows[0].id;
    } else {
        authorId = authorCheck.rows[0].id;
    }

    await db.query(`
        INSERT INTO book_authors (book_id, author_id)
        SELECT $1, $2
        WHERE NOT EXISTS (
            SELECT 1 FROM book_authors WHERE book_id = $1 AND author_id = $2
        )
    `, [bookId, authorId]);

    const topicCheck = await db.query(`SELECT id FROM topics WHERE name = $1`, ['Test Topic']);
    let topicId;

    if (topicCheck.rowCount === 0) {
        const topicInsert = await db.query(`
            INSERT INTO topics (name) VALUES ($1) RETURNING id
        `, ['Test Topic']);
        topicId = topicInsert.rows[0].id;
    } else {
        topicId = topicCheck.rows[0].id;
    }

    await db.query(`
        INSERT INTO book_topics (book_id, topic_id)
        SELECT $1, $2
        WHERE NOT EXISTS (
            SELECT 1 FROM book_topics WHERE book_id = $1 AND topic_id = $2
        )
    `, [bookId, topicId]);
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
    test("getAllBooks() retrieves a list of books with authors and topics", async () => {
        const result = await Book.getAllBooks(1, 10);
        expect(result).toHaveProperty("books");
        expect(result).toHaveProperty("totalBooks");
        expect(result.books.length).toBeGreaterThan(0);
    });

    test("getBookById() retrieves a book by ID with authors and topics", async () => {
        const book = await Book.getBookById(1);
        expect(book).toHaveProperty("id");
        expect(book).toHaveProperty("title");
        expect(book.authors).toContain("Test Author");
        expect(book.topics).toContain("Test Topic");
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
        await db.query(`
            INSERT INTO books (title, cover_image, year_published, synopsis)
            VALUES ('Another Test Book', 'https://example.com/another.jpg', 2010, 'Another test book.')
        `);
        const page1 = await Book.getAllBooks(1, 1);
        expect(page1.books.length).toBe(1);
    });
});
