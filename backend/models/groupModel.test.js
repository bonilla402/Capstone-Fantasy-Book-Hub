require("dotenv").config({ path: ".env.test" });
const db = require("../config/db");
const Group = require("./groupModel");

let testUserId, testGroupId;

beforeAll(async () => {
    console.log("Seeding test data for groups...");

    // Ensure a clean database state
    await db.query("DELETE FROM group_members");
    await db.query("DELETE FROM group_discussions");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM users");

    // Insert a test user
    const userInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ["TestUser", "testuser@example.com", "hashedpassword", false]);
    testUserId = userInsert.rows[0].id;

    // Insert a test group
    const groupInsert = await Group.createGroup("Test Group", "A test discussion group", testUserId);
    testGroupId = groupInsert.id;
});

afterAll(async () => {
    console.log("Cleaning up test database...");

    await db.query("DELETE FROM group_members");
    await db.query("DELETE FROM group_discussions");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM users");

    await db.end();
});

describe("Group Model", () => {
    test("getAllGroups() retrieves all discussion groups", async () => {
        const groups = await Group.getAllGroups();
        expect(groups.length).toBeGreaterThan(0);

        const group = groups.find(g => g.id === testGroupId);
        expect(group).toBeDefined();
        expect(group).toHaveProperty("group_name", "Test Group");
        expect(group).toHaveProperty("description", "A test discussion group");

        // PostgreSQL returns COUNT(*) as a string, so we check against "1"
        expect(group).toHaveProperty("member_count", String(1));
        expect(group).toHaveProperty("discussion_count", String(0));
    });

    test("getGroupById() retrieves a single discussion group", async () => {
        const group = await Group.getGroupById(testGroupId);
        expect(group).toBeDefined();
        expect(group).toHaveProperty("id", testGroupId);
        expect(group).toHaveProperty("group_name", "Test Group");

        // PostgreSQL COUNT(*) returns as string
        expect(group).toHaveProperty("member_count", String(1));
        expect(group).toHaveProperty("discussion_count", String(0));
    });

    test("isGroupOwner() returns true for the creator", async () => {
        const isOwner = await Group.isGroupOwner(testGroupId, testUserId);
        expect(isOwner).toBe(true);
    });

    test("isGroupOwner() returns false for non-creator", async () => {
        const isOwner = await Group.isGroupOwner(testGroupId, 9999);
        expect(isOwner).toBe(false);
    });

    test("updateGroup() modifies the discussion group", async () => {
        const updatedGroup = await Group.updateGroup(testGroupId, "Updated Group Name", "Updated description");
        expect(updatedGroup).toBeDefined();
        expect(updatedGroup).toHaveProperty("id", testGroupId);
        expect(updatedGroup).toHaveProperty("group_name", "Updated Group Name");
        expect(updatedGroup).toHaveProperty("description", "Updated description");
    });

    test("deleteGroup() removes the group", async () => {
        const deleted = await Group.deleteGroup(testGroupId);
        expect(deleted).toBe(true);

        const group = await Group.getGroupById(testGroupId);
        expect(group).toBeNull();
    });
});
