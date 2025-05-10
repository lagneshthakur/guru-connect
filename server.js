const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./src/app');
const { errorHandler } = require('./src/middlewares/errorHandler');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected at:', process.env.MONGODB_URI.split('@')[1]);
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });