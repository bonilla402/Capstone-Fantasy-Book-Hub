require("dotenv").config({ path: ".env.test" });
const db = require("../config/db");
const Topic = require("./topicModel");

let testTopicId, testBookId, testAuthorId;

beforeAll(async () => {
    console.log("Seeding test data for topics...");

    // Ensure a clean database state
    await db.query("DELETE FROM book_topics");
    await db.query("DELETE FROM topics");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM authors");
    await db.query("DELETE FROM book_authors");

    // Insert a test topic
    const topicInsert = await db.query(`
        INSERT INTO topics (name) VALUES ($1) RETURNING id
    `, ["Fantasy"]);
    testTopicId = topicInsert.rows[0].id;

    // Insert a test author
    const authorInsert = await db.query(`
        INSERT INTO authors (name) VALUES ($1) RETURNING id
    `, ["J.R.R. Tolkien"]);
    testAuthorId = authorInsert.rows[0].id;

    // Insert a test book
    const bookInsert = await db.query(`
        INSERT INTO books (title, cover_image, year_published, synopsis)
        VALUES ($1, $2, $3, $4) RETURNING id
    `, ["The Hobbit", "https://example.com/hobbit.jpg", 1937, "A fantasy novel"]);
    testBookId = bookInsert.rows[0].id;

    // Link book to author
    await db.query(`
        INSERT INTO book_authors (book_id, author_id)
        VALUES ($1, $2)
    `, [testBookId, testAuthorId]);

    // Link book to topic
    await db.query(`
        INSERT INTO book_topics (book_id, topic_id)
        VALUES ($1, $2)
    `, [testBookId, testTopicId]);
});

afterAll(async () => {
    console.log("Cleaning up test database...");

    await db.query("DELETE FROM book_topics");
    await db.query("DELETE FROM topics");
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM authors");
    await db.query("DELETE FROM book_authors");

    await db.end();
});

describe("Topic Model", () => {
    test("getAllTopics() retrieves a list of topics", async () => {
        const topics = await Topic.getAllTopics();
        expect(topics.length).toBeGreaterThan(0);

        const topic = topics.find(t => t.id === testTopicId);
        expect(topic).toBeDefined();
        expect(topic).toHaveProperty("id", testTopicId);
        expect(topic).toHaveProperty("name", "Fantasy");
    });

    test("getTopicsWithBooks() retrieves topics with their books and authors", async () => {
        const topics = await Topic.getTopicsWithBooks();
        expect(topics.length).toBeGreaterThan(0);
        
        const topic = topics.find(t => t.topic_id === testTopicId);
        expect(topic).toBeDefined();
        expect(topic).toHaveProperty("topic_id", testTopicId);
        expect(topic).toHaveProperty("topic_name", "Fantasy");

        expect(Array.isArray(topic.books)).toBe(true);
        expect(topic.books.length).toBeGreaterThan(0);

        const book = topic.books.find(b => b.id === testBookId);
        expect(book).toBeDefined();
        expect(book).toHaveProperty("title", "The Hobbit");
        expect(book.authors).toContain("J.R.R. Tolkien");
    });

    test("getTopicsWithBooks() returns empty books array when no books are associated", async () => {

        const topicInsert = await db.query(`
            INSERT INTO topics (name) VALUES ($1) RETURNING id
        `, ["Science Fiction"]);
        const newTopicId = topicInsert.rows[0].id;

        if (!newTopicId) {
            throw new Error("❌ ERROR: Failed to insert new topic - `newTopicId` is undefined");
        }

        const topics = await Topic.getTopicsWithBooks();
        const topic = topics.find(t => t.topic_id === newTopicId);

        if (!topic) {
            console.error("❌ ERROR: `getTopicsWithBooks()` did not return the new topic. Available topics:", topics);
        }

        expect(topic).toBeDefined();
        expect(topic).toHaveProperty("topic_id", newTopicId);
        expect(topic).toHaveProperty("topic_name", "Science Fiction");
        expect(topic.books).toEqual([]); 
    });
});
