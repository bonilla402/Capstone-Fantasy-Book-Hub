const app = require('./app');

/**
 * The entry point for running the Fantasy Book Hub server.
 *
 * This file:
 *  - Loads environment variables (via dotenv).
 *  - Imports the Express `app` from app.js.
 *  - Starts the server on the specified port (defaults to 3000 if not provided).
 *
 * Environment variables:
 *  - `PORT`: The port on which the server will listen.
 */

const PORT = process.env.PORT || 3000;

/**
 * Starts the Express server on the specified port.
 * Logs a message to confirm successful startup.
 */
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
