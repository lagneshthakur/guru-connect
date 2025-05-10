const express = require('express');
const { registerUser, loginUser, getUserDetails } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// POST /register - Register a new user
router.post('/register', registerUser);

// POST /login - Login an existing user
router.post('/login', loginUser);

// GET /me - Get user details
router.get('/me', authMiddleware.verifyToken, getUserDetails);

module.exports = router;