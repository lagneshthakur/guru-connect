const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route to create a new group
router.post('/', authMiddleware.verifyToken, groupController.createGroup);

//  Route to get all groups for a user
router.get('/', authMiddleware.verifyToken, groupController.getUserGroups);

// Route to join a group
// Take groupId as path parameter
router.post('/:groupId/join', authMiddleware.verifyToken, groupController.joinGroup);

// Route to get join requests for a group
router.get('/:groupId/join-requests', authMiddleware.verifyToken, groupController.getJoinRequests);

// Route to accept a join request
router.post('/:groupId/join-requests/:joinRequestId/accept', authMiddleware.verifyToken, groupController.acceptJoinRequest);

// Route to reject a join request
router.delete('/:groupId/join-requests/:joinRequestId/reject', authMiddleware.verifyToken, groupController.rejectJoinRequest);

// Route to leave a group
router.delete('/:groupId/leave', authMiddleware.verifyToken, groupController.leaveGroup);

// Route to banish a user from a group
router.post('/:groupId/banish/:userId', authMiddleware.verifyToken, groupController.banishUserFromGroup);

// Router to transfer group ownership
router.post('/:groupId/transfer-ownership/:userId', authMiddleware.verifyToken, groupController.transferGroupOwnership);

// Route to delete a group
router.delete('/:groupId', authMiddleware.verifyToken, groupController.deleteGroup);


module.exports = router;