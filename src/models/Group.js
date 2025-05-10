const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['Private', 'Open'],
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    maxMembers: {
        type: Number,
        min: 2,
        required: true
    },
    joinRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    banishedMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;