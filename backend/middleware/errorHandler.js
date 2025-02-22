const { ExpressError } = require('../helpers/expressError');

/**
 * Express error-handling middleware.
 *
 * If an error is thrown in the application, this middleware
 * catches it, sets the appropriate status code (defaulting to 500),
 * and returns a JSON response with an `error` object. The `message`
 * and `status` are included in the response for clarity.
 *
 * @function errorHandler
 * @param {Error} err - The error object, which may include `status` and `message`.
 * @returns {void} Returns a JSON response with the error details.
 */
function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    res.status(status).json({ error: { message, status } });
}

module.exports = errorHandler;
