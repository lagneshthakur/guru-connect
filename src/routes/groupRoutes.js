const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to create a new group
router.post('/', authMiddleware.verifyToken, groupController.createGroup);

// Route to join a group
// Take groupId as path parameter
router.post('/:groupId/join', authMiddleware.verifyToken, groupController.joinGroup);

// Route to get join requests for a group
router.get('/:groupId/join-requests', authMiddleware.verifyToken, groupController.getJoinRequests);

// Route to accept a join request
router.post('/:groupId/accept-request/:joinRequestId', authMiddleware.verifyToken, groupController.acceptJoinRequest);

// Route to reject a join request
router.delete('/:groupId/reject-request/:joinRequestId', authMiddleware.verifyToken, groupController.rejectJoinRequest);

// Route to leave a group
router.delete('/:groupId/leave', authMiddleware.verifyToken, groupController.leaveGroup);

// Route to manage banishment (banish or unban a member)
router.post('/banish', authMiddleware.verifyToken, groupController.manageBanishment);


module.exports = router;