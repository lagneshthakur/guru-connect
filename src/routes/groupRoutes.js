const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to create a new group
router.post('/groups', authMiddleware.verifyToken, groupController.createGroup);

// Route to join a group
router.post('/groups/join', authMiddleware.verifyToken, groupController.joinGroup);

// Route to leave a group
router.delete('/groups/leave', authMiddleware.verifyToken, groupController.leaveGroup);

// Route to manage banishment (banish or unban a member)
router.post('/groups/banish', authMiddleware.verifyToken, groupController.manageBanishment);

module.exports = router;