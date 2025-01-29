const express = require('express');
const routes = require('./routes');
const { NotFoundError } = require('./helpers/expressError');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
    return next(new NotFoundError());
});

// General error handler
app.use(errorHandler);

module.exports = app;
