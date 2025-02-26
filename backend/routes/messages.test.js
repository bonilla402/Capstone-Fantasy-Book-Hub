require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../app");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";

let testUserId, adminUserId, groupCreatorId, testUserToken, adminToken, groupCreatorToken, testGroupId, testDiscussionId, testMessageId, testBookId;

beforeAll(async () => {
    console.log("Seeding test data for messages...");

    await db.query("DELETE FROM discussion_messages");
    await db.query("DELETE FROM group_discussions");
    await db.query("DELETE FROM discussion_groups");
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

    //  Insert a group creator user
    const groupCreatorInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id, username, is_admin
    `, ["GroupCreator", "groupcreator@example.com", "hashedpassword", false]);
    groupCreatorId = groupCreatorInsert.rows[0].id;

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

    groupCreatorToken = jwt.sign(
        { userId: groupCreatorId, isAdmin: false },
        SECRET_KEY,
        { expiresIn: "24h" }
    );

    // Insert a test group owned by groupCreator
    const groupInsert = await db.query(`
        INSERT INTO discussion_groups (group_name, description, created_by)
        VALUES ($1, $2, $3) RETURNING id
    `, ["Message Testing Group", "A group for testing messages", groupCreatorId]);
    testGroupId = groupInsert.rows[0].id;

    // Insert a test discussion using the correct book_id
    const discussionInsert = await db.query(`
        INSERT INTO group_discussions (group_id, user_id, book_id, title, content)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [testGroupId, testUserId, testBookId, "Test Discussion", "This is a test discussion."]);
    testDiscussionId = discussionInsert.rows[0].id;

    // Add test user to the group
    await db.query(`
        INSERT INTO group_members (group_id, user_id)
        VALUES ($1, $2)
    `, [testGroupId, testUserId]);

    console.log("Test user joined the group:", testUserId);

    // Insert a test message
    const messageInsert = await db.query(`
        INSERT INTO discussion_messages (discussion_id, user_id, content)
        VALUES ($1, $2, $3) RETURNING id
    `, [testDiscussionId, testUserId, "This is a test message."]);
    testMessageId = messageInsert.rows[0].id;
});

afterAll(async () => {
    console.log("Cleaning up test database...");
    await db.query("DELETE FROM discussion_messages");
    await db.query("DELETE FROM group_discussions");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM users");

    await db.end();
    console.log("Database connection closed.");
});

describe("Messages Routes", () => {
    test("GET /api/messages/:discussionId - retrieves messages for a discussion", async () => {
        const res = await request(app)
            .get(`/api/messages/${testDiscussionId}`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("POST /api/messages/:discussionId - allows discussion members to post messages", async () => {
        const res = await request(app)
            .post(`/api/messages/${testDiscussionId}`)
            .set("Authorization", `Bearer ${testUserToken}`)
            .send({ content: "This is another test message." });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("content", "This is another test message.");
    });

    test("POST /api/messages/:discussionId - fails if content is missing", async () => {
        const res = await request(app)
            .post(`/api/messages/${testDiscussionId}`)
            .set("Authorization", `Bearer ${testUserToken}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });
    
    test("POST /api/messages/:discussionId - fails for non-members", async () => {
        const res = await request(app)
            .post(`/api/messages/${testDiscussionId}`)
            .set("Authorization", `Bearer ${adminToken}`) // Admin is not a member
            .send({ content: "Unauthorized message attempt." });

        expect(res.statusCode).toBe(401);
    });
});
