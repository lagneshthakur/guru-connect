const Group = require('../models/Group');
const User = require('../models/User');
const Message = require('../models/Message');
const { encryptMessage, decryptMessage } = require('../utils/encryption');
const { validateGroupCreation, validateJoinRequest } = require('../utils/validation');

// Create a new group
exports.createGroup = async (req, res) => {
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

    try {
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create group' });
    }
};

// Join a group
exports.joinGroup = async (req, res) => {
    const { groupId } = req.body;
    const userId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (group.type === 'Open') {
            if (group.members.includes(userId)) {
                return res.status(400).json({ error: 'Already a member of the group' });
            }
            group.members.push(userId);
            await group.save();
            return res.status(200).json(group);
        } else {
            // Handle join request for private groups
            // Logic for join request goes here
            return res.status(200).json({ message: 'Join request submitted' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to join group' });
    }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
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