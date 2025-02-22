require('dotenv').config();

/**
 * Constructs the database connection URI based on environment variables.
 *
 * - If `NODE_ENV` is set to "test", it uses the test database by default.
 * - Otherwise, it reads config from the environment variables or falls back to defaults.
 * - If `DATABASE_URL` is defined, that takes precedence over other settings.
 *
 * @function getDatabaseUri
 * @returns {string} The URI string for connecting to the PostgreSQL database.
 *
 * @example
 * // Example usage:
 * const uri = getDatabaseUri();
 * // uri might be something like: "postgresql://postgres:123456@localhost:5432/fantasy_book_hub"
 */
function getDatabaseUri() {
    const dbName = process.env.NODE_ENV === "test"
        ? "fantasy_book_hub_test" 
        : process.env.DATABASE_NAME || "fantasy_book_hub";

    const dbHost = process.env.DATABASE_HOST || "localhost";
    const dbPort = process.env.DATABASE_PORT || "5432";
    const dbUser = process.env.DATABASE_USER || "postgres";
    const dbPassword = process.env.DATABASE_PASSWORD || "123456";

    return process.env.DATABASE_URL
        || `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
}


module.exports = { getDatabaseUri };
