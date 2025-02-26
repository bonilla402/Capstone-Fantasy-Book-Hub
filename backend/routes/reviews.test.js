require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../app");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";

let testUserId, adminUserId, testBookId, testReviewId, testUserToken, adminToken;

beforeAll(async () => {
    console.log("Seeding test data for reviews...");

    await db.query("DELETE FROM reviews");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM users");

    //  Insert a book before using book_id
    const bookInsert = await db.query(`
        INSERT INTO books (title, cover_image, year_published, synopsis)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ["The Hobbit", "https://example.com/hobbit.jpg", 1937, "A fantasy novel"]);
    testBookId = bookInsert.rows[0].id;

    
    //  Insert a test user (regular user)
    const userInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id, username, is_admin
    `, ["TestUser", "testuser@example.com", "hashedpassword", false]);
    testUserId = userInsert.rows[0].id;

    //  Insert an admin user
    const adminInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id, username, is_admin
    `, ["AdminUser", "admin@example.com", "hashedpassword", true]);
    adminUserId = adminInsert.rows[0].id;

    //  Generate JWT tokens for authentication
    testUserToken = jwt.sign(
        { userId: testUserId, isAdmin: false },
        SECRET_KEY,
        { expiresIn: "24h" }
    );

    adminToken = jwt.sign(
        { userId: adminUserId, isAdmin: true },
        SECRET_KEY,
        { expiresIn: "24h" }
    );
    

    //  Insert a test review
    const reviewInsert = await db.query(`
        INSERT INTO reviews (user_id, book_id, rating, review_text)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, [testUserId, testBookId, 5, "Great book!"]);
    testReviewId = reviewInsert.rows[0].id;
});

afterAll(async () => {
    console.log("Cleaning up test database...");
    await db.query("DELETE FROM reviews");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM users");
});

describe("Reviews Routes", () => {
    test("GET /api/reviews - retrieves all reviews", async () => {
        const res = await request(app)
            .get("/api/reviews")
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /api/reviews/book/:bookId - retrieves reviews for a book", async () => {
        const res = await request(app)
            .get(`/api/reviews/book/${testBookId}`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
    });

    test("POST /api/reviews - allows users to create a review", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .set("Authorization", `Bearer ${testUserToken}`)
            .send({ bookId: testBookId, rating: 4, reviewText: "Nice book!" });

        expect(res.statusCode).toBe(201);
    });

    test("POST /api/reviews - fails if bookId or rating is missing", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .set("Authorization", `Bearer ${testUserToken}`)
            .send({ reviewText: "Missing bookId and rating" });

        expect(res.statusCode).toBe(400);
    });

    test("PATCH /api/reviews/:id - allows review owner to update", async () => {
        const res = await request(app)
            .patch(`/api/reviews/${testReviewId}`)
            .set("Authorization", `Bearer ${testUserToken}`)
            .send({ rating: 3, reviewText: "Updated review text" });

        expect(res.statusCode).toBe(200);
    });

    test("PATCH /api/reviews/:id - fails for unauthorized users", async () => {
        const res = await request(app)
            .patch(`/api/reviews/${testReviewId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ rating: 2 });

        expect(res.statusCode).toBe(401);
    });

    test("PATCH /api/reviews/:id - fails for unauthorized users", async () => {
        const res = await request(app)
            .patch(`/api/reviews/${testReviewId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ rating: 2 });

        expect(res.statusCode).toBe(401);
    });

    test("DELETE /api/reviews/:id - allows review owner/admin to delete", async () => {
        const res = await request(app)
            .delete(`/api/reviews/${testReviewId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Review deleted." });
    });

    test("DELETE /api/reviews/:id - fails for unauthorized users", async () => {
        const res = await request(app)
            .delete(`/api/reviews/${testReviewId}`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(500);
    });
    
});
