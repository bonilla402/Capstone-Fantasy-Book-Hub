require("dotenv").config({ path: ".env.test" });
const db = require("../config/testDatabase");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

let testUserId;

beforeAll(async () => {
    console.log("Seeding test data for users...");

    await Promise.all([
        db.query("DELETE FROM discussion_groups"),
        db.query("DELETE FROM users")
    ]);

    const passwordHash = await bcrypt.hash("testpassword", 12);

    const userInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ["TestUser", "testuser@example.com", passwordHash, false]);

    testUserId = userInsert.rows[0].id;

    await db.query(`
        INSERT INTO discussion_groups (group_name, description, created_by)
        VALUES ($1, $2, $3)
    `, ["Test Group", "A discussion group for testing", testUserId]);
});

afterAll(async () => {
    console.log("Cleaning up test database...");

    await Promise.all([
        db.query("DELETE FROM discussion_groups"),
        db.query("DELETE FROM users")
    ]);

    await db.end();
    console.log("Database connection closed.");
});

describe("User Model", () => {
    test("getAllUsers() retrieves all users", async () => {
        const users = await User.getAllUsers();
        expect(users.length).toBeGreaterThan(0);
        expect(users[0]).toHaveProperty("id");
        expect(users[0]).toHaveProperty("username");
        expect(users[0]).toHaveProperty("email");
    });

    test("getUserByEmail() retrieves a user by email", async () => {
        const user = await User.getUserByEmail("testuser@example.com");
        expect(user).toHaveProperty("id", testUserId);
        expect(user).toHaveProperty("username", "TestUser");
        expect(user).toHaveProperty("email", "testuser@example.com");
    });

    test("createUser() adds a new user", async () => {
        const newUser = await User.createUser("NewUser", "newuser@example.com", "newpassword");
        expect(newUser).toHaveProperty("id");
        expect(newUser).toHaveProperty("username", "NewUser");
        expect(newUser).toHaveProperty("email", "newuser@example.com");

        const dbUser = await User.getUserByEmail("newuser@example.com");
        expect(dbUser).toHaveProperty("id", newUser.id);
    });

    test("updateUser() modifies user data", async () => {
        const updatedUser = await User.updateUser(testUserId, "UpdatedUser", "updated@example.com", "updatedpassword");
        expect(updatedUser).toHaveProperty("id", testUserId);
        expect(updatedUser).toHaveProperty("username", "UpdatedUser");
        expect(updatedUser).toHaveProperty("email", "updated@example.com");

        const dbUser = await User.getUserByEmail("updated@example.com");
        expect(dbUser).toHaveProperty("username", "UpdatedUser");
    });

    test("deleteUser() removes a user", async () => {
        await db.query("DELETE FROM discussion_groups WHERE created_by = $1", [testUserId]);

        const deletedUser = await User.deleteUser(testUserId);
        expect(deletedUser).toHaveProperty("id", testUserId);

        const dbUser = await User.getUserByEmail("updated@example.com");
        expect(dbUser).toBeUndefined();
    });
});
