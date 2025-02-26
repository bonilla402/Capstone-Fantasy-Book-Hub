require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../app");
const db = require("../config/db");

let testBookId, testUserToken;

const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";
const bcrypt = require("bcrypt");

beforeAll(async () => {
    console.log("Seeding test data for books...");

    await db.query("DELETE FROM book_topics");
    await db.query("DELETE FROM book_authors");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM users");
    
    const hashedPassword = await bcrypt.hash("password123", 10);
    const userInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id, username, is_admin
    `, ["TestUser", "testuser@example.com", hashedPassword, false]);
    const testUser = userInsert.rows[0];
    
    testUserToken = jwt.sign(
        { userId: testUser.id, isAdmin: testUser.is_admin },
        SECRET_KEY,
        { expiresIn: "24h" }
    );
    
    const bookInsert = await db.query(`
        INSERT INTO books (title, cover_image, year_published, synopsis)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ["The Hobbit", "https://example.com/hobbit.jpg", 1937, "A fantasy novel"]);
    testBookId = bookInsert.rows[0].id;
});

afterAll(async () => {
    console.log("Cleaning up test database...");

    await db.query("DELETE FROM book_topics");
    await db.query("DELETE FROM book_authors");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM users");

    await db.end();
    console.log("Database connection closed.");
});

describe("Books Routes", () => {
    test("GET /api/books - retrieves all books", async () => {
        const res = await request(app)
            .get("/api/books")
            .set("Authorization", `Bearer ${testUserToken}`);

        console.log("🔍 DEBUG: Response from /api/books:", res.statusCode, res.body);

        expect(res.statusCode).toBe(200);
        
        expect(Array.isArray(res.body.books)).toBe(true);
        expect(res.body.books.length).toBeGreaterThan(0);

        expect(Number(res.body.totalBooks)).toBeGreaterThan(0);

        const book = res.body.books.find(b => b.id === testBookId);
        expect(book).toBeDefined();
        expect(book).toHaveProperty("title", "The Hobbit");
    });

    test("GET /api/books/search - searches books by title", async () => {
        const res = await request(app)
            .get("/api/books/search?title=Hobbit")
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.books)).toBe(true);
        expect(res.body.books.length).toBeGreaterThan(0);

        const book = res.body.books.find(b => b.id === testBookId);
        expect(book).toBeDefined();
        expect(book).toHaveProperty("title", "The Hobbit");
    });

    test("GET /api/books/search/dynamic - dynamic search requires min 3 chars", async () => {
        const res = await request(app).get("/api/books/search/dynamic?query=Ho");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toEqual([]); // Query too short, should return empty array
    });

    test("GET /api/books/:id - fetches a single book", async () => {
        const res = await request(app)
            .get(`/api/books/${testBookId}`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id", testBookId);
        expect(res.body).toHaveProperty("title", "The Hobbit");
    });
});
