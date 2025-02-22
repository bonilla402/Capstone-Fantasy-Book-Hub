"use strict";
/**
 * Database setup for Fantasy Book Hub.
 *
 * This file automatically connects to the correct database based on `NODE_ENV`:
 * - `production`: Uses an SSL-secured connection.
 * - `test`: Connects to the test database.
 * - Otherwise, connects to the development database.
 */

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

// Ensure we only create one DB connection
if (!db) {
    console.log(`Connecting to database: ${getDatabaseUri()}`);

    db = new Client({
        connectionString: getDatabaseUri(),
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    db.connect();
}

module.exports = db;
