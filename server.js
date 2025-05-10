const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = require('./src/app');
const chatSockets = require('./src/sockets/chat');

const server = require('http').createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // To be updated for production
    methods: ['GET', 'POST']
  }
});
chatSockets(io);
const PORT = process.env.PORT || 5000;


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected at:', process.env.MONGODB_URI.split('@')[1]);
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });