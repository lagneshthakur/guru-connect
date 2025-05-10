const Message = require('../models/Message');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

// Send a message to a group
exports.sendMessage = async (req, res) => {
    const { groupId, content } = req.body;
    const senderId = req.user.id; // Assuming user ID is stored in req.user after authentication

    try {
        const encryptedContent = encryptMessage(content);
        const message = new Message({
            sender: senderId,
            group: groupId,
            content: encryptedContent,
            timestamp: new Date()
        });

        await message.save();
        res.status(201).json({ message: 'Message sent successfully', messageId: message._id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get messages from a group
exports.getMessages = async (req, res) => {
    const { groupId } = req.params;

    try {
        const messages = await Message.find({ group: groupId }).sort({ timestamp: 1 });

        const decryptedMessages = messages.map(msg => ({
            sender: msg.sender,
            content: decryptMessage(msg.content),
            timestamp: msg.timestamp
        }));

        res.status(200).json(decryptedMessages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
};