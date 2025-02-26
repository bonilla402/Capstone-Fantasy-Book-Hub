require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../app");
const db = require("../config/db");

let registeredUser, registeredToken;

beforeAll(async () => {
    console.log("Seeding test data for authentication...");

    await db.query("DELETE FROM users");
});

afterAll(async () => {
    console.log("Cleaning up test database...");
    await db.query("DELETE FROM users");

    await db.end();
    console.log("Database connection closed.");
});

describe("Auth Routes", () => {
    test("POST /api/auth/register - registers a new user and returns token", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                username: "TestUser",
                email: "testuser@example.com",
                password: "password123"
            });

        console.log("🔍 DEBUG: Response from /api/auth/register:", res.statusCode, res.body);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body).toHaveProperty("user");

        registeredUser = res.body.user;
        registeredToken = res.body.token;
    });

    test("POST /api/auth/register - fails if fields are missing", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                username: "MissingFieldsUser"
                // Missing email and password
            });

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/auth/login - logs in with valid credentials and returns token", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "testuser@example.com",
                password: "password123"
            });

        console.log("🔍 DEBUG: Response from /api/auth/login:", res.statusCode, res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body).toHaveProperty("user");
    });

    test("POST /api/auth/login - fails with incorrect password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "testuser@example.com",
                password: "wrongpassword"
            });

        expect(res.statusCode).toBe(401);
    });

    test("POST /api/auth/login - fails with non-existent email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "nonexistent@example.com",
                password: "password123"
            });

        expect(res.statusCode).toBe(401);
    });
});
