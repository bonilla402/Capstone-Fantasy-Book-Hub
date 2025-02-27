require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { NotFoundError } = require('./helpers/expressError');
const errorHandler = require('./middleware/errorHandler');
const { authenticateJWT } = require('./middleware/auth');


/**
 * The main Express application for the Fantasy Book Hub API.
 *
 * This file:
 *  - Loads environment variables (via dotenv).
 *  - Configures and applies CORS.
 *  - Parses incoming JSON requests.
 *  - Authenticates users by checking JWT tokens.
 *  - Mounts all routes under the `/api` prefix.
 *  - Handles 404 and general errors.
 *
 * Environment variables:
 *  - `PORT` (optional): The port on which the app will listen (typically set in index.js).
 *  - `SECRET_KEY`: Used to sign/verify JWTs (loaded via dotenv or defaults in auth.js).
 */
const app = express();

/**
 * CORS configuration object, specifying which origins,
 * methods, and headers are allowed, as well as credential settings.
 */
const corsOptions = {
    origin: [
        "http://localhost:3001",  // Allow local development
        "https://frontend-fantasy-book-hub.onrender.com" // Allow deployed frontend
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

// Apply CORS middleware globally with the specified options.
app.use(cors(corsOptions));

// Parse JSON bodies in incoming requests.
app.use(express.json());

// Middleware to authenticate users via JWT (if present).
app.use(authenticateJWT);

// Mount all application routes under the `/api` prefix.
app.use('/api', routes);

/**
 * Catch-all 404 handler. If no route matches, create a NotFoundError.
 * The error will be handled by the general error handler below.
 */
app.use((req, res, next) => {
    return next(new NotFoundError());
});

/**
 * General error handler middleware.
 * Catches thrown or uncaught errors, formats them,
 * and returns an appropriate JSON response with error details.
 */
app.use(errorHandler);

module.exports = app;
