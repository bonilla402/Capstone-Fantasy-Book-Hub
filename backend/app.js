const express = require('express');
const cors = require('cors'); // ✅ Import CORS
const routes = require('./routes');
const { NotFoundError } = require('./helpers/expressError');
const errorHandler = require('./middleware/errorHandler');
const { authenticateJWT } = require('./middleware/auth');
require('dotenv').config();

const app = express();

// ✅ Apply CORS Middleware
const corsOptions = {
    origin: "http://localhost:3001", // Allow frontend to access API
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};
app.use(cors(corsOptions)); // ✅ Ensures CORS is applied to all requests

// Middleware
app.use(express.json());
app.use(authenticateJWT);
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
    return next(new NotFoundError());
});

// General error handler
app.use(errorHandler);

module.exports = app;
