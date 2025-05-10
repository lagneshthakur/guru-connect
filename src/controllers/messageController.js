const Message = require('../models/Message');
const Group = require('../models/Group');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

// Send a message to a group
exports.sendMessage = async (req, res) => {
    // #swagger.tags = ['Messages']
    const { groupId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id; // Assuming user ID is stored in req.user after authentication

    try {
        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        // Check if the user is a member of the group
        const isMember = group.members.includes(senderId);
        if (!isMember) {
            return res.status(403).json({ error: 'User is not a member of the group' });
        }
        const encryptedContent = encryptMessage(content);
        const message = new Message({
            senderId: senderId,
            groupId: groupId,
            encryptedContent: encryptedContent,
            timestamp: new Date()
        });

        await message.save();
        res.status(201).json({ message: 'Message sent successfully', messageId: message._id });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get messages from a group
exports.getMessages = async (req, res) => {
    // #swagger.tags = ['Messages']
    // Get pagination parameters from query
    const { page = 1, limit = 10 } = req.query;
    const { groupId } = req.params;

    try {
        const messages = await Message.find({ groupId: groupId })
            .populate('senderId', 'email') // Populate senderId with user details
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const decryptedMessages = messages.map(msg => ({
            sender: msg.senderId.email,
            content: decryptMessage(msg.encryptedContent.encryptedData, msg.encryptedContent.iv),
            timestamp: msg.timestamp
        }));

        res.status(200).json(decryptedMessages);
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
};