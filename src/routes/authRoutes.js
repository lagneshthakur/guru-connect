const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();

// POST /register - Register a new user
router.post('/register', registerUser);

// POST /login - Login an existing user
router.post('/login', loginUser);

module.exports = router;