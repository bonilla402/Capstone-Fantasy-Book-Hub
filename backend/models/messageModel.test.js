require("dotenv").config({ path: ".env.test" });
const db = require("../config/db");
const Message = require("../models/messageModel");

let testUserId, testDiscussionId, testMessageId;

beforeAll(async () => {
    console.log("Seeding test data for messages...");

    // Ensure a clean database state
    await db.query("DELETE FROM discussion_messages");
    await db.query("DELETE FROM group_discussions");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM books");

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
    const testGroupId = groupInsert.rows[0].id;

    // Insert a test book
    const bookInsert = await db.query(`
        INSERT INTO books (title, cover_image, year_published, synopsis)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ["Test Book", "https://example.com/test.jpg", 2000, "A test book."]);
    const testBookId = bookInsert.rows[0].id;

    if (!testBookId) {
        throw new Error("Failed to insert book - `testBookId` is undefined");
    }

    // Insert a discussion
    const discussionInsert = await db.query(`
        INSERT INTO group_discussions (group_id, user_id, book_id, title, content)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [testGroupId, testUserId, testBookId, "Test Discussion", "Let's talk about books!"]);

    testDiscussionId = discussionInsert.rows[0]?.id;

    if (!testDiscussionId) {
        throw new Error("Failed to insert discussion - `testDiscussionId` is undefined");
    }

    // Insert a test message
    const messageInsert = await Message.addMessage(testDiscussionId, testUserId, "This is a test message.");
    testMessageId = messageInsert.id;
});

afterAll(async () => {
    console.log("Cleaning up test database...");

    await db.query("DELETE FROM discussion_messages");
    await db.query("DELETE FROM group_discussions");
    await db.query("DELETE FROM discussion_groups");
    await db.query("DELETE FROM users");

    await db.end();
});

describe("Message Model", () => {
    test("getMessagesByDiscussion() retrieves all messages in a discussion", async () => {
        const messages = await Message.getMessagesByDiscussion(testDiscussionId);
        expect(messages.length).toBeGreaterThan(0);

        const message = messages.find(m => m.id === testMessageId);
        expect(message).toBeDefined();
        expect(message).toHaveProperty("discussion_id", testDiscussionId);
        expect(message).toHaveProperty("user_id", testUserId);
        expect(message).toHaveProperty("content", "This is a test message.");
        expect(message).toHaveProperty("created_at");
    });

    test("getMessagesByDiscussion() handles discussions with no messages", async () => {
        const groupInsert = await db.query(`
            INSERT INTO discussion_groups (group_name, description, created_by)
            VALUES ($1, $2, $3) RETURNING id
        `, ["Test Group for Empty Discussion", "This is a temporary group.", testUserId]);
        const tempGroupId = groupInsert.rows[0].id;
        
        const bookInsert = await db.query(`
            INSERT INTO books (title, cover_image, year_published, synopsis)
            VALUES ($1, $2, $3, $4) RETURNING id
        `, ["Placeholder Book", "https://example.com/placeholder.jpg", 2022, "A placeholder book."]);
        const placeholderBookId = bookInsert.rows[0].id;
        
        const newDiscussionInsert = await db.query(`
        INSERT INTO group_discussions (group_id, user_id, book_id, title, content)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [tempGroupId, testUserId, placeholderBookId, "Empty Discussion", "This discussion has no messages."]);
        const newDiscussionId = newDiscussionInsert.rows[0].id;
        
        const messages = await Message.getMessagesByDiscussion(newDiscussionId);
        expect(messages.length).toBe(0);
    });

    test("addMessage() inserts a new message correctly", async () => {
        const newMessage = await Message.addMessage(testDiscussionId, testUserId, "Another test message.");
        expect(newMessage).toBeDefined();
        expect(newMessage).toHaveProperty("discussion_id", testDiscussionId);
        expect(newMessage).toHaveProperty("user_id", testUserId);
        expect(newMessage).toHaveProperty("content", "Another test message.");
        expect(newMessage).toHaveProperty("created_at");

        const messages = await Message.getMessagesByDiscussion(testDiscussionId);
        expect(messages.length).toBeGreaterThan(1);
    });

});
