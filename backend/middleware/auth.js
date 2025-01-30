const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../helpers/expressError');
const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";

/** Middleware to authenticate user via JWT
 *  Attaches user payload to res.locals.user
 *  Authorization required: None
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

/** Middleware to ensure a user is logged in
 *  Authorization required: Any logged-in user
 */
function ensureLoggedIn(req, res, next) {
    if (!res.locals.user) throw new UnauthorizedError("You must be logged in.");
    return next();
}

/** Middleware to ensure the correct user or admin
 *  Authorization required: Admin or same user as :id
 */
function ensureCorrectUserOrAdmin(req, res, next) {
    if (!res.locals.user || (res.locals.user.userId !== Number(req.params.id) && !res.locals.user.isAdmin)) {
        throw new UnauthorizedError("Unauthorized");
    }
    return next();
}

/** Middleware to ensure user is an admin
 *  Authorization required: Admin
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