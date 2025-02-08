const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { BadRequestError, UnauthorizedError } = require('../helpers/expressError');
const {compare} = require("bcrypt");

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || "secret_dev_key";

/** POST /auth/register { username, email, password } => { token }
 *  Creates a new regular user and returns an authentication token.
 *  Authorization required: None
 */
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) throw new BadRequestError("All fields are required.");

        const newUser = await User.createUser(username, email, password);
        const token = jwt.sign({ userId: newUser.id, isAdmin: newUser.is_admin }, SECRET_KEY, { expiresIn: '24h' });

        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
});


/**
 * POST /auth/login { email, password } => { token, user }
 * Authenticates a user and returns a JWT token + user details.
 * Authorization required: None
 */
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) throw new BadRequestError("Email and password required.");

        const user = await User.getUserByEmail(email);
        if (!user) throw new UnauthorizedError("Invalid email/password.");

        // Check if the password is correct
        const isValid = await compare(password, user.password_hash);
        if (!isValid) throw new UnauthorizedError("Invalid email/password.");

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, isAdmin: user.is_admin },
            SECRET_KEY,
            { expiresIn: "24h" }
        );

        // Remove sensitive data before sending response
        delete user.password_hash;

        return res.json({ token, user });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;