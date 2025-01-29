﻿const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

router.get('/', async (req, res, next) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
