﻿const express = require('express');
const router = express.Router();

// Example route for user management
router.get('/', (req, res) => {
    res.send('Users route is working!');
});

module.exports = router;
