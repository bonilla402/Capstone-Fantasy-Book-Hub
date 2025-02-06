const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { ensureLoggedIn, ensureCorrectUserOrAdmin, ensureAdmin } = require('../middleware/auth');
const { BadRequestError, NotFoundError } = require('../helpers/expressError');

/**
 * GET /users
 * Retrieves a list of all users (Admin only).
 *
 * Authorization required: Admin.
 *
 * @returns {Object[]} 200 - List of users.
 * @example Response:
 * [
 *   {
 *     "id": 1,
 *     "username": "adminUser",
 *     "email": "admin@example.com",
 *     "is_admin": true
 *   },
 *   {
 *     "id": 2,
 *     "username": "regularUser",
 *     "email": "user@example.com",
 *     "is_admin": false
 *   }
 * ]
 */
router.get('/', ensureAdmin, async (req, res, next) => {
    try {
        const users = await User.getAllUsers();
        if (users.length === 0) throw new NotFoundError("No users found.");
        res.json(users);
    } catch (err) {
        return next(err);
    }
});

/**
 * PATCH /users/:id
 * Updates user information.
 *
 * Authorization required: Admin or the same user as :id.
 *
 * @param {string} id - The user's ID.
 * @body {string} [username] - New username (optional).
 * @body {string} [email] - New email (optional).
 * @body {string} [password] - New password (optional).
 *
 * @returns {Object} 200 - Updated user details.
 * @example Request:
 * PATCH /users/2
 * {
 *   "username": "newUser",
 *   "email": "newuser@example.com"
 * }
 *
 * @example Response:
 * {
 *   "id": 2,
 *   "username": "newUser",
 *   "email": "newuser@example.com",
 *   "is_admin": false
 * }
 */
router.patch('/:id', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        if (!username && !email && !password) {
            throw new BadRequestError("At least one field (username, email, or password) must be provided for an update.");
        }

        const updatedUser = await User.updateUser(req.params.id, username, email, password);
        if (!updatedUser) throw new NotFoundError(`User with ID ${req.params.id} not found.`);
        res.json(updatedUser);
    } catch (err) {
        return next(err);
    }
});

/**
 * DELETE /users/:id
 * Deletes a user from the system.
 *
 * Authorization required: Admin.
 *
 * @param {string} id - The user's ID.
 *
 * @returns {Object} 200 - Confirmation message.
 * @example Request:
 * DELETE /users/2
 *
 * @example Response:
 * {
 *   "message": "User deleted"
 * }
 */
router.delete('/:id', ensureAdmin, async (req, res, next) => {
    try {
        const deletedUser = await User.deleteUser(req.params.id);
        if (!deletedUser) throw new NotFoundError(`User with ID ${req.params.id} not found.`);
        res.json({ message: "User deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
