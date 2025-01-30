const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { ensureLoggedIn, ensureCorrectUserOrAdmin, ensureAdmin } = require('../middleware/auth');

/** GET / => [{ id, username, email, is_admin }, ...]
 *  Returns all users (Admin only)
 *  Authorization required: Admin
 */
router.get('/', ensureAdmin, async (req, res, next) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (err) {
        return next(err);
    }
});

/** PATCH /:id { username, email, password } => { id, username, email, is_admin }
 *  Updates user information
 *  Authorization required: Admin or same user as :id
 */
router.patch('/:id', ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const updatedUser = await User.updateUser(req.params.id, username, email, password);
        res.json(updatedUser);
    } catch (err) {
        return next(err);
    }
});

/** DELETE /:id => { message: "User deleted" }
 *  Deletes a user from the system
 *  Authorization required: Admin
 */
router.delete('/:id', ensureAdmin, async (req, res, next) => {
    try {
        await User.deleteUser(req.params.id);
        res.json({ message: "User deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;