require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../app");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";
const bcrypt = require("bcrypt");

let testUserId, adminUserId, testUserToken, adminToken;

beforeAll(async () => {
    console.log("Seeding test data for users...");

    await db.query("DELETE FROM users");

    // Insert a test user (regular user) with hashed password
    const hashedPassword = await bcrypt.hash("password123", 10);
    const userInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id, username, is_admin
    `, ["TestUser", "testuser@example.com", hashedPassword, false]);
    const testUser = userInsert.rows[0];
    testUserId = testUser.id;

    // Insert an admin user
    const adminInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id, username, is_admin
    `, ["AdminUser", "admin@example.com", hashedPassword, true]);
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
    
});

afterAll(async () => {
    console.log("Cleaning up test database...");
    await db.query("DELETE FROM users");

    await db.end();
    console.log("Database connection closed.");
});

describe("Users Routes", () => {
    test("GET /api/users - retrieves all users (admin only)", async () => {
        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${adminToken}`);

        console.log("🔍 DEBUG: Response from /api/users:", res.statusCode, res.body);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("GET /api/users - fails if non-admin tries to list users", async () => {
        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(401); // Non-admins cannot view users
    });

    test("PATCH /api/users/:id - allows user to update own profile", async () => {
        const res = await request(app)
            .patch(`/api/users/${testUserId}`)
            .set("Authorization", `Bearer ${testUserToken}`)
            .send({ username: "UpdatedUser" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("username", "UpdatedUser");
    });

    test("PATCH /api/users/:id - allows admin to update any user", async () => {
        const res = await request(app)
            .patch(`/api/users/${testUserId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ username: "AdminUpdatedUser" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("username", "AdminUpdatedUser");
    });

    test("PATCH /api/users/:id - fails if user tries to update another user's profile", async () => {
        const res = await request(app)
            .patch(`/api/users/${adminUserId}`)
            .set("Authorization", `Bearer ${testUserToken}`)
            .send({ username: "HackerAttempt" });

        expect(res.statusCode).toBe(401); // Should be forbidden
    });

    test("DELETE /api/users/:id - allows admin to delete a user", async () => {
        const res = await request(app)
            .delete(`/api/users/${testUserId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "User deleted" });
    });

    test("DELETE /api/users/:id - fails if non-admin tries to delete a user", async () => {
        const res = await request(app)
            .delete(`/api/users/${adminUserId}`)
            .set("Authorization", `Bearer ${testUserToken}`);

        expect(res.statusCode).toBe(401); // Should be forbidden
    });

    test("DELETE /api/users/:id - fails to delete a non-existing user", async () => {
        const res = await request(app)
            .delete(`/api/users/9999`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404); // User not found
    });
});
