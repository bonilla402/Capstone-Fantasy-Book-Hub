require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../app");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";

let testUserId, adminUserId, testUserToken, adminToken, testGroupId;

beforeAll(async () => {
    console.log("Seeding test data for groups...");

    await db.query("DELETE FROM group_members");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM users");

    // Insert a test user (regular user)
    const userInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id, username, is_admin
    `, ["TestUser", "testuser@example.com", "hashedpassword", false]);
    const testUser = userInsert.rows[0];
    testUserId = testUser.id;

    // Insert an admin user
    const adminInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id, username, is_admin
    `, ["AdminUser", "admin@example.com", "hashedpassword", true]);
    const adminUser = adminInsert.rows[0];
    adminUserId = adminUser.id;

    // Generate valid JWT tokens
    testUserToken = jwt.sign(
        { userId: testUser.id, isAdmin: testUser.is_admin },
        SECRET_KEY,
        { expiresIn: "24h" }
    );

    adminToken = jwt.sign(
        { userId: adminUser.id, isAdmin: adminUser.is_admin },
        SECRET_KEY,
        { expiresIn: "24h" }
    );

    console.log("Test User Token:", testUserToken);
    console.log("Admin Token:", adminToken);

    // Insert a test group
    const groupInsert = await db.query(`
        INSERT INTO discussion_groups (group_name, description, created_by)
        VALUES ($1, $2, $3) RETURNING id
    `, ["Fantasy Readers", "A group for fantasy book lovers", testUserId]);
    testGroupId = groupInsert.rows[0].id;
});

afterAll(async () => {
    console.log("Cleaning up test database...");
    await db.query("DELETE FROM group_members");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM users");

    await db.end();
    console.log("Database connection closed.");
});

describe("Groups Routes", () => {
    test("GET /api/groups - retrieves all groups (logged-in users)", async () => {
        const res = await request(app)
            .get("/api/groups")
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("POST /api/groups - creates a new group", async () => {
        const res = await request(app)
            .post("/api/groups")
            .set("Authorization", `Bearer ${testUserToken}`)
            .send({ groupName: "Sci-Fi Lovers", description: "A group for sci-fi fans" });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("group_name", "Sci-Fi Lovers");
    });

    test("PATCH /api/groups/:id - allows group owner to update", async () => {
        const res = await request(app)
            .patch(`/api/groups/${testGroupId}`)
            .set("Authorization", `Bearer ${testUserToken}`)
            .send({ groupName: "Updated Fantasy Readers" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("group_name", "Updated Fantasy Readers");
    });

    test("PATCH /api/groups/:id - fails if unauthorized user tries to update", async () => {
        const res = await request(app)
            .patch(`/api/groups/${testGroupId}`)
            .send({ groupName: "Hacked Group Name" });

        expect(res.statusCode).toBe(401);
    });
    
    test("POST /api/groups/:id/join - allows user to join a group", async () => {
        const res = await request(app)
            .post(`/api/groups/${testGroupId}/join`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "User added to group.");
    });

    test("DELETE /api/groups/:id/leave - allows user to leave a group", async () => {
        const res = await request(app)
            .delete(`/api/groups/${testGroupId}/leave`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "User removed from group.");
    });

    test("GET /api/groups/:id/members - retrieves group members", async () => {
        const res = await request(app)
            .get(`/api/groups/${testGroupId}/members`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /api/groups/:id/is-member - checks if user is in group", async () => {
        const res = await request(app)
            .get(`/api/groups/${testGroupId}/is-member`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("isMember", false);
    });

    test("DELETE /api/groups/:id - allows group owner to delete", async () => {
        const res = await request(app)
            .delete(`/api/groups/${testGroupId}`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Group deleted." });
    });
});
