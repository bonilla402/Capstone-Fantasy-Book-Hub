require('dotenv').config();

function getDatabaseUri() {
    const dbName = process.env.NODE_ENV === "test"
        ? "fantasy_book_hub"
        : process.env.DATABASE_NAME || "fantasy_book_hub";

    const dbHost = process.env.DATABASE_HOST || "localhost";
    const dbPort = process.env.DATABASE_PORT || "5432";
    const dbUser = process.env.DATABASE_USER || "postgres";
    const dbPassword = process.env.DATABASE_PASSWORD || "123456";

    return process.env.DATABASE_URL || `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
}

module.exports = { getDatabaseUri };
