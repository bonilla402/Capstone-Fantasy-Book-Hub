require("dotenv").config({ path: ".env.test" });
const db = require("../config/db");
const Review = require("./reviewModel");

let testUserId, testBookId, testReviewId;

beforeAll(async () => {
    console.log("Seeding test data for reviews...");

    // Ensure a clean database state
    await db.query("DELETE FROM reviews");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM books");

    // Insert a test user
    const userInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ["TestUser", "testuser@example.com", "hashedpassword", false]);
    testUserId = userInsert.rows[0].id;

    // Insert a test book
    const bookInsert = await db.query(`
        INSERT INTO books (title, cover_image, year_published, synopsis)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ["Test Book", "https://example.com/test.jpg", 2000, "A test book."]);
    testBookId = bookInsert.rows[0].id;

    // Insert a test review
    const reviewInsert = await Review.addReview(testUserId, testBookId, 4, "Great book!");
    testReviewId = reviewInsert.id;
});

afterAll(async () => {
    console.log("Cleaning up test database...");

    await db.query("DELETE FROM reviews");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM books");

    await db.end();
});

describe("Review Model", () => {
    test("getAllReviews() retrieves all reviews", async () => {
        const reviews = await Review.getAllReviews();
        expect(reviews.length).toBeGreaterThan(0);

        const review = reviews.find(r => r.id === testReviewId);
        expect(review).toBeDefined();
        expect(review).toHaveProperty("rating", 4);
        expect(review).toHaveProperty("review_text", "Great book!");
    });

    test("getReviewsByBook() retrieves reviews for a specific book", async () => {
        const reviews = await Review.getReviewsByBook(testBookId);
        expect(reviews.length).toBeGreaterThan(0);

        const review = reviews.find(r => r.id === testReviewId);
        expect(review).toBeDefined();
        expect(review).toHaveProperty("rating", 4);
    });

    test("getReviewsByUser() retrieves reviews written by a user", async () => {
        const reviews = await Review.getReviewsByUser(testUserId);
        expect(reviews.length).toBeGreaterThan(0);

        const review = reviews.find(r => r.id === testReviewId);
        expect(review).toBeDefined();
        expect(review).toHaveProperty("rating", 4);
    });

    test("updateReview() modifies a review", async () => {
        const updatedReview = await Review.updateReview(testReviewId, 5, "Amazing book!");
        expect(updatedReview).toBeDefined();
        expect(updatedReview).toHaveProperty("rating", 5);
        expect(updatedReview).toHaveProperty("review_text", "Amazing book!");
    });

    test("deleteReview() removes a review", async () => {
        const deleted = await Review.deleteReview(testReviewId);
        expect(deleted).toBeDefined();
        expect(deleted).toHaveProperty("id", testReviewId);

        const reviews = await Review.getReviewsByBook(testBookId);
        expect(reviews.length).toBe(0);
    });
});
