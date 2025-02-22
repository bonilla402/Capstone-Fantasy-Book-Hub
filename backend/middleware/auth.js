const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../helpers/expressError');
const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";

/**
 * Middleware to authenticate a user via JWT.
 *
 * This function inspects the `Authorization` header for a Bearer token,
 * verifies it against the application's `SECRET_KEY`, and attaches the
 * decoded payload to `res.locals.user`. If no token or invalid token is found,
 * the request still proceeds, but `res.locals.user` remains undefined.
 *
 * @function authenticateJWT
 * @returns {void} Proceeds to the next middleware regardless of the token state.
 */
function authenticateJWT(req, res, next) {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (token) {
            res.locals.user = jwt.verify(token, SECRET_KEY);
        }
        return next();
    } catch {
        return next();
    }
}

/**
 * Middleware to ensure the user is logged in.
 *
 * This function checks if `res.locals.user` is set, which implies a valid
 * token was provided via `authenticateJWT`. If it is not set, an
 * `UnauthorizedError` is thrown.
 *
 * @function ensureLoggedIn
 * @throws {UnauthorizedError} If the user is not logged in.
 */
function ensureLoggedIn(req, res, next) {
    if (!res.locals.user) throw new UnauthorizedError("You must be logged in.");
    return next();
}

/**
 * Middleware to ensure the user is either an admin or the same user as the `:id` parameter.
 *
 * This function checks both `res.locals.user.userId` and `res.locals.user.isAdmin`.
 * If neither condition is satisfied, an `UnauthorizedError` is thrown.
 *
 * @function ensureCorrectUserOrAdmin
 * @throws {UnauthorizedError} If the user is neither an admin nor matches the `:id` param.
 */
function ensureCorrectUserOrAdmin(req, res, next) {
    if (
        !res.locals.user ||
        (res.locals.user.userId !== Number(req.params.id) && !res.locals.user.isAdmin)
    ) {
        throw new UnauthorizedError("Unauthorized");
    }
    return next();
}

/**
 * Middleware to ensure the user is an admin.
 *
 * This function checks the `isAdmin` property on `res.locals.user`. If the user
 * is not logged in or is not an admin, an `UnauthorizedError` is thrown.
 *
 * @function ensureAdmin
 * @throws {UnauthorizedError} If the user is not an admin or not logged in.
 */
function ensureAdmin(req, res, next) {
    if (!res.locals.user || !res.locals.user.isAdmin) {
        throw new UnauthorizedError("Admins only.");
    }
    return next();
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUserOrAdmin,
    ensureAdmin
};
