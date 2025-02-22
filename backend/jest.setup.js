require("dotenv").config({ path: ".env.test" });

/**
 * Global setup for Jest.
 * - Loads environment variables.
 * - Does NOT handle database connections or cleanup (handled by test files).
 */

beforeAll(async () => {
    console.log("Global Jest setup complete.");
});

afterAll(async () => {
    console.log("Global Jest teardown complete.");
});
