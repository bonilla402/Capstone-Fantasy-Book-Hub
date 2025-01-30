const express = require('express');
const routes = require('./routes');
const { NotFoundError } = require('./helpers/expressError');
const errorHandler = require('./middleware/errorHandler');
const { authenticateJWT } = require('./middleware/auth');
require('dotenv').config();

const app = express();

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