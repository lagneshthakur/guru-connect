const Group = require('../models/Group');
const User = require('../models/User');
const Message = require('../models/Message');
const { encryptMessage, decryptMessage } = require('../utils/encryption');
const { validateGroupCreation, validateJoinRequest, GroupTypes } = require('../utils/validation');

// Create a new group
exports.createGroup = async (req, res) => {
    // #swagger.tags = ['Groups']
    const { groupName, groupType, maxMembers } = req.body;
    const ownerId = req.user.id;

    const validationError = validateGroupCreation(groupName, groupType, maxMembers);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const newGroup = new Group({
        name: groupName,
        type: groupType,
        owner: ownerId,
        members: [ownerId],
        maxMembers: maxMembers
    });

    // Also add group to the owner's list of groups
    const user = await User.findById(ownerId);
    if (user) {
        user.groups.push(newGroup._id);
        await user.save();
    }

    try {
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }
};

// Join a group
exports.joinGroup = async (req, res) => {
    // #swagger.tags = ['Groups']
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        if (group.members.includes(userId)) {
            return res.status(400).json({ error: 'Already a member of the group' });
        }

        if (group.type === GroupTypes.OPEN) {
            group.members.push(userId);
            // Also add group to the user's list of groups
            const user = await User.findById(userId);
            if (user) {
                user.groups.push(group._id);
                await user.save();
            }
            await group.save();
            return res.status(200).json(group);
        } else {
            // Handle join request for private groups
            // Logic for join request goes here
            if (group.joinRequests.includes(userId)) {
                return res.status(400).json({ error: 'Join request already submitted' });
            }
            group.joinRequests.push(userId);
            await group.save();
            
            return res.status(200).json({ message: 'Join request submitted' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to join group' });
    }
};

// Get join requests for a group
exports.getJoinRequests = async (req, res) => {
    // #swagger.tags = ['Groups']
    const { groupId } = req.params;
    const ownerId = req.user.id;

    try {
        const group = await Group.findById(groupId).populate('joinRequests', 'email groups');
        if (!group || group.owner.toString() !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to view join requests' });
        }
        if (!group.joinRequests || group.joinRequests.length === 0) {
            return res.status(404).json({ message: 'No join requests found' });
        }
        
        res.status(200).json(group.joinRequests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve join requests' });
    }
};

// Accept a join request
exports.acceptJoinRequest = async (req, res) => {
    // #swagger.tags = ['Groups']
    const { groupId, joinRequestId } = req.params;
    const ownerId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group || group.owner.toString() !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to accept join requests' });
        }

        if (!group.joinRequests.includes(joinRequestId)) {
            return res.status(400).json({ error: 'Join request not found' });
        }

        group.members.push(joinRequestId);
        group.joinRequests = group.joinRequests.filter(request => request.toString() !== joinRequestId);
        await group.save();
        res.status(200).json({ message: 'Join request accepted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept join request' });
    }
};

// Reject a join request
exports.rejectJoinRequest = async (req, res) => {
    // #swagger.tags = ['Groups']
    const { groupId, joinRequestId } = req.params;
    const ownerId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group || group.owner.toString() !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to reject join requests' });
        }

        if (!group.joinRequests.includes(joinRequestId)) {
            return res.status(400).json({ error: 'Join request not found' });
        }

        group.joinRequests = group.joinRequests.filter(request => request.toString() !== joinRequestId);
        await group.save();
        res.status(200).json({ message: 'Join request rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject join request' });
    }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
    // #swagger.tags = ['Groups']
    const { groupId } = req.body;
    const userId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (!group.members.includes(userId)) {
            return res.status(400).json({ error: 'Not a member of the group' });
        }

        group.members = group.members.filter(member => member.toString() !== userId);
        await group.save();
        res.status(200).json({ message: 'Left the group successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to leave group' });
    }
};

// Manage banishment
exports.manageBanishment = async (req, res) => {
    // #swagger.tags = ['Groups']
    const { groupId, userId, action } = req.body;
    const ownerId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group || group.owner.toString() !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to manage banishment' });
        }

        if (action === 'banish') {
            group.members = group.members.filter(member => member.toString() !== userId);
            await group.save();
            return res.status(200).json({ message: 'User banished from the group' });
        } else if (action === 'unbanish') {
            // Logic for unbanishing a user goes here
            return res.status(200).json({ message: 'User unbanished from the group' });
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to manage banishment' });
    }
};