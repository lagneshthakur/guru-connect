const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to send a message to a group
router.post('/:groupId', verifyToken, sendMessage);

// Route to get messages for a specific group
router.get('/:groupId', verifyToken, getMessages);

module.exports = router;