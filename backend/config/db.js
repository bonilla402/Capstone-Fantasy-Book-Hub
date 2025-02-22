"use strict";
/**
 * Database setup for Fantasy Book Hub.
 *
 * Depending on the environment (production/test/other), this file creates
 * a new `Client` instance from `pg` with the appropriate connection string,
 * then establishes a connection.
 */

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

/**
 * If the `NODE_ENV` is set to "production", an SSL connection is used with
 * `rejectUnauthorized: false`. Otherwise, a standard non-SSL connection is used.
 */
if (process.env.NODE_ENV === "production") {
    db = new Client({
        connectionString: getDatabaseUri(),
        ssl: {
            rejectUnauthorized: false,
        },
    });
} else {
    db = new Client({
        connectionString: getDatabaseUri(),
    });
}

db.connect();

module.exports = db;
