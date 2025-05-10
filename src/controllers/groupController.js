const Group = require('../models/Group');
const User = require('../models/User');
const Message = require('../models/Message');
const { encryptMessage, decryptMessage } = require('../utils/encryption');
const { validateGroupCreation, validateJoinRequest, GroupTypes } = require('../utils/validation');
const waitHours = 48; // Time to wait before rejoining a group after leaving

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

// Get all groups for a user
exports.getUserGroups = async (req, res) => {
    // #swagger.tags = ['Groups']
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).populate('groups', 'name type members owner banishedMembers');
        if (!user || user.groups.length === 0) {
            return res.status(404).json({ error: 'No groups found for user' });
        }
        res.status(200).json(user.groups);
    } catch (error) {
        console.error('Error fetching user groups:', error);
        res.status(500).json({ error: 'Failed to fetch user groups' });
    }
}

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
        // Check if the user was banished from the group
        if (group.banishedMembers && group.banishedMembers.includes(userId)) {
            // If the user was banished, create a new join request
            if (group.joinRequests.includes(userId)) {
                return res.status(400).json({ error: 'Join request already submitted' });
            }
            group.joinRequests.push(userId);
            await group.save();
            return res.status(200).json({ message: 'Join request submitted' });
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
            // Check if the user is a past member
            if (group.pastMembers && group.pastMembers.some(member => member._id.toString() === userId)) {
                // If a user leaves a private group, they must wait 48 hours before they can request to join that group again.
                const lastLeftAt = group.pastMembers.find(member => member._id.toString() === userId).leftAt;
                const hoursSinceLeft = (new Date() - new Date(lastLeftAt)) / (1000 * 60 * 60);
                if (hoursSinceLeft < waitHours) {
                    return res.status(400).json({ error: `You must wait ${waitHours} hours before rejoining this group` });
                }
            }
            // Logic for join request goes here
            if (group.joinRequests.includes(userId)) {
                return res.status(400).json({ error: 'Join request already submitted' });
            }
            group.joinRequests.push(userId);
            await group.save();
            
            return res.status(200).json({ message: 'Join request submitted' });
        }
    } catch (error) {
        console.error('Error joining group:', error);
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
        // Remove user from the banished list if they were banished
        if (group.banishedMembers && group.banishedMembers.includes(joinRequestId)) {
            group.banishedMembers = group.banishedMembers.filter(member => member.toString() !== joinRequestId);
        }
        // Also add group to the user's list of groups
        const user = await User.findById(joinRequestId);
        if (user) {
            user.groups.push(group._id);
            await user.save();
        }
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
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (!group.members.includes(userId)) {
            return res.status(400).json({ error: 'Not a member of the group' });
        }
        // Check if the user is the owner
        if (group.owner.toString() === userId) {
            return res.status(400).json({ error: 'The group owner must transfer the ownership to another member before leaving.' }); 
        }

        // Add entry to past members list
        group.pastMembers = group.pastMembers || [];
        if (group.pastMembers.findIndex(member => member._id.toString() === userId) === -1) {
            group.pastMembers.push({
                _id: userId,
                leftAt: new Date()
            });
        }
        group.members = group.members.filter(member => member.toString() !== userId);
        await group.save();
        res.status(200).json({ message: 'Left the group successfully' });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ error: 'Failed to leave group' });
    }
};

// Manage banishment
exports.banishUserFromGroup = async (req, res) => {
    // #swagger.tags = ['Groups']
    const { groupId, userId } = req.params;
    const ownerId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group || group.owner.toString() !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to manage banishment' });
        }

        group.members = group.members.filter(member => member.toString() !== userId);
        // Optionally, you can also remove the user from the group join requests
        group.joinRequests = group.joinRequests.filter(request => request.toString() !== userId);
        // Add the user to the banished list
        group.banishedMembers = group.banishedMembers || [];
        if (!group.banishedMembers.includes(userId)) {
            group.banishedMembers.push(userId);
        }
        // Save the group
        await group.save();
        // Also remove group from the user's list of groups
        const user = await User.findById(userId);
        if (user) {
            user.groups = user.groups.filter(group => group.toString() !== groupId);
            await user.save();
        }
        return res.status(200).json({ message: 'User banished from the group' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to manage banishment' });
    }
};

exports.transferGroupOwnership = async (req, res) => {
    // #swagger.tags = ['Groups']
    const { groupId, userId } = req.params;
    const ownerId = req.user.id;
    
    try {
        const group = await Group.findById(groupId);
        if (!group || group.owner.toString() !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to transfer group ownership' });
        }
        if (!group.members.includes(userId)) {
            return res.status(400).json({ error: 'User is not a member of the group' });
        }
        if (group.owner.toString() === userId) {
            return res.status(400).json({ error: 'User is already the owner of the group' });
        }
        // Transfer ownership
        group.owner = userId;
        await group.save();
        res.status(200).json({ message: 'Group ownership transferred successfully' });
    }
    catch (error) {
        console.error('Error transferring group ownership:', error);
        res.status(500).json({ error: 'Failed to transfer group ownership' });
    }
}

exports.deleteGroup = async (req, res) => {
    // #swagger.tags = ['Groups']
    const { groupId } = req.params;
    const ownerId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group || group.owner.toString() !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to delete the group' });
        }
        // Check if group has any members other than the owner
        if (group.members.length > 1) {
            return res.status(400).json({ error: 'Group has other members. Please remove them before deleting the group.' });
        }

        // Remove group from the owner's list
        const user = await User.findById(ownerId);
        if (user) {
            user.groups = user.groups.filter(group => group.toString() !== groupId);
            await user.save();
        }
        // Delete the group
        await Group.findByIdAndDelete(groupId);
        res.status(200).json({ message: 'Group deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Failed to delete group' });
    }
}