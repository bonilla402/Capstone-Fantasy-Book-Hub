require("dotenv").config({ path: ".env.test" });
const db = require("../config/db");
const Discussion = require("./discussionModel");

let testGroupId, testUserId, testBookId, testDiscussionId;

beforeAll(async () => {
    console.log("Seeding test data for discussions...");

    // Ensure a clean database state
    await db.query("DELETE FROM discussion_messages");
    await db.query("DELETE FROM group_discussions");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM group_members");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM authors");
    await db.query("DELETE FROM book_authors");
    await db.query("DELETE FROM topics");
    await db.query("DELETE FROM book_topics");

    // Insert a test user
    const userInsert = await db.query(`
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ["TestUser", "testuser@example.com", "hashedpassword", false]);
    testUserId = userInsert.rows[0].id;

    // Insert a test group
    const groupInsert = await db.query(`
        INSERT INTO discussion_groups (group_name, description, created_by)
        VALUES ($1, $2, $3) RETURNING id
    `, ["Test Group", "A test discussion group", testUserId]);
    testGroupId = groupInsert.rows[0].id;

    // Add the user as a group member
    await db.query(`
        INSERT INTO group_members (user_id, group_id)
        VALUES ($1, $2)
    `, [testUserId, testGroupId]);

    // Insert a test book
    const bookInsert = await db.query(`
        INSERT INTO books (title, cover_image, year_published, synopsis)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ["Test Book", "https://example.com/test.jpg", 2000, "A test book."]);
    testBookId = bookInsert.rows[0].id;

    // Insert a test discussion
    const discussionInsert = await Discussion.createDiscussion(
        testGroupId, testUserId, testBookId, "Test Discussion", "Let's talk about books!"
    );
    testDiscussionId = discussionInsert.id;
});

afterAll(async () => {
    console.log("Cleaning up test database...");

    await db.query("DELETE FROM discussion_messages");
    await db.query("DELETE FROM group_discussions");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM group_members");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM authors");
    await db.query("DELETE FROM book_authors");
    await db.query("DELETE FROM topics");
    await db.query("DELETE FROM book_topics");

    await db.end();
});

describe("Discussion Model", () => {
    test("getDiscussionsByGroup() retrieves all discussions in a group", async () => {
        const discussions = await Discussion.getDiscussionsByGroup(testGroupId);
        expect(discussions.length).toBeGreaterThan(0);

        const discussion = discussions.find(d => d.id === testDiscussionId);
        expect(discussion).toBeDefined();
        expect(discussion).toHaveProperty("group_id", testGroupId);
        expect(discussion).toHaveProperty("title", "Test Discussion");
        expect(discussion).toHaveProperty("message_count", String(0));
        expect(discussion.book).toHaveProperty("id", testBookId);
        expect(discussion.book).toHaveProperty("title", "Test Book");
    });

    test("getDiscussionById() retrieves a single discussion", async () => {
        const discussion = await Discussion.getDiscussionById(testDiscussionId);
        expect(discussion).toBeDefined();
        expect(discussion).toHaveProperty("id", testDiscussionId);
        expect(discussion).toHaveProperty("title", "Test Discussion");
        expect(discussion).toHaveProperty("created_by", "TestUser");
        expect(discussion.book).toHaveProperty("id", testBookId);
    });

    test("isDiscussionCreator() returns true for creator", async () => {
        const isCreator = await Discussion.isDiscussionCreator(testDiscussionId, testUserId);
        expect(isCreator).toBe(true);
    });

    test("isDiscussionCreator() returns false for non-creator", async () => {
        const isCreator = await Discussion.isDiscussionCreator(testDiscussionId, 9999);
        expect(isCreator).toBe(false);
    });

    test("updateDiscussion() modifies the discussion", async () => {
        const updatedDiscussion = await Discussion.updateDiscussion(testDiscussionId, "Updated Title", "New content...");
        expect(updatedDiscussion).toBeDefined();
        expect(updatedDiscussion).toHaveProperty("id", testDiscussionId);
        expect(updatedDiscussion).toHaveProperty("title", "Updated Title");
        expect(updatedDiscussion).toHaveProperty("content", "New content...");
    });

    test("deleteDiscussion() removes the discussion", async () => {
        const deleted = await Discussion.deleteDiscussion(testDiscussionId);
        expect(deleted).toBe(true);

        const discussion = await Discussion.getDiscussionById(testDiscussionId);
        expect(discussion).toBeNull();
    });
});
