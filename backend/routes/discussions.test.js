require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../app");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";

let testUserId, adminUserId, groupCreatorId, testUserToken, adminToken, groupCreatorToken, testGroupId, testDiscussionId, testBookId;

beforeAll(async () => {
    console.log("Seeding test data for discussions...");

    await db.query("DELETE FROM group_discussions");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM users");

    //  Insert a book before creating discussions
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

    // Insert a group creator user
    const groupCreatorInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id, username, is_admin
    `, ["GroupCreator", "groupcreator@example.com", "hashedpassword", false]);
    groupCreatorId = groupCreatorInsert.rows[0].id;

    //  Generate valid JWT tokens
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

    //  Insert a test group owned by groupCreator
    const groupInsert = await db.query(`
        INSERT INTO discussion_groups (group_name, description, created_by)
        VALUES ($1, $2, $3) RETURNING id
    `, ["Book Discussions", "A group for discussing books", groupCreatorId]);
    testGroupId = groupInsert.rows[0].id;

    //  Insert a test discussion
    const discussionInsert = await db.query(`
        INSERT INTO group_discussions (group_id, user_id, book_id, title, content)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [testGroupId, testUserId, testBookId, "Best Fantasy Books", "Let's discuss the best fantasy books."]);
    testDiscussionId = discussionInsert.rows[0].id;

    //  Add test user to the group
    await db.query(`
        INSERT INTO group_members (group_id, user_id)
        VALUES ($1, $2)
    `, [testGroupId, testUserId]);

    console.log(" Test user joined the group:", testUserId);
});

afterAll(async () => {
    console.log("Cleaning up test database...");
    await db.query("DELETE FROM group_discussions");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM users");

    await db.end();
    console.log("Database connection closed.");
});

describe("Discussions Routes", () => {
    test("GET /api/discussions/:groupId - retrieves discussions for a group", async () => {
        const res = await request(app)
            .get(`/api/discussions/${testGroupId}`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("PATCH /api/discussions/:id - allows discussion creator to update", async () => {
        const res = await request(app)
            .patch(`/api/discussions/${testDiscussionId}`)
            .set("Authorization", `Bearer ${testUserToken}`)
            .send({ title: "Updated Discussion Title" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("title", "Updated Discussion Title");
    });

    test("DELETE /api/discussions/:id - allows discussion creator to delete", async () => {
        const res = await request(app)
            .delete(`/api/discussions/${testDiscussionId}`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Discussion deleted." });
    });
});
