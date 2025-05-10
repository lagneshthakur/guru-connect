const Group = require('../models/Group');
const User = require('../models/User');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const { encryptMessage } = require('../utils/encryption');

// sockets/chat.js
module.exports = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.headers.token;
        console.log('Token from socket:', token);
        if (!token) {
          return next(new Error("Authentication token required"));
        }
    
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.user = {};
          socket.user.id = decoded.id;
          socket.user.email = decoded.email;
          next();
        } catch (err) {
          return next(new Error("Invalid token"));
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        console.log('User Email from socket:', socket.user.email);
  
        // Join a group room
        socket.on('joinGroup', async (groupId) => {
            // Check if groupId is valid
            if (!groupId || groupId.length !== 24) {
            return socket.emit('error', { message: 'Invalid group ID' });
            }
            // Check if groupId exists in the database
            const group = await Group.findById(groupId);
            if (!group) {
            return socket.emit('error', { message: 'Group not found' });
            }
            // Check if user is a member of the group
            const isMember = group.members.includes(socket.user.id);
            if (!isMember) {
            return socket.emit('error', { message: 'User is not a member of the group' });
            }
            socket.join(groupId);
            socket.groupId = groupId; // Store groupId in socket for later use
            console.log(`User ${socket.id} joined group ${groupId}`); 
            io.to(groupId).emit('userJoined', { userId: socket.id });
        });

        // Leave a group room
        socket.on('leaveGroup', (groupId) => {
            socket.leave(groupId);
            console.log(`User ${socket.id} left group ${groupId}`);
            io.to(groupId).emit('userLeft', { userId: socket.id });
        });
    
        // Handle message send
        socket.on('sendMessage', (data) => {
        console.log('Message data:', data);
        const encryptedContent = encryptMessage(data);
        // Optional: Save to DB here
        const message = new Message({
            senderId: socket.user.id,
            groupId: socket.groupId,
            encryptedContent: encryptedContent,
            timestamp: Date.now()
        });
        message.save();

        // Emit to everyone in the group room
        io.to(socket.groupId).emit('newMessage', {
            sender: socket.user.email,
            text: data,
            timestamp: Date.now()
        });
        });
    
        socket.on('disconnect', () => {
            console.log(`User ${socket.id} disconnected`);
        });
    });
  };