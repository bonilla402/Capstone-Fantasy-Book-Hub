const express = require('express');
const router = express.Router();

// Example route for authentication
router.get('/', (req, res) => {
    res.send('Auth route is working!');
});

module.exports = router;
