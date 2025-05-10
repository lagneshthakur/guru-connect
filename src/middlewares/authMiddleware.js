const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Remove 'Bearer ' prefix if present
    const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    
    // Verify the token
    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Token verification error:', err);
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = {};
        req.user.id = decoded.id;
        req.user.email = decoded.email;
        next();
    });
};


module.exports = {
    verifyToken
};