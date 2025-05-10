const crypto = require('crypto');

const algorithm = 'aes-128-cbc';
const key = crypto.scryptSync(process.env.AES_SECRET_KEY, 'salt', 16);
const iv = crypto.randomBytes(16); // Initialization vector

function encryptMessage(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}

function decryptMessage(encryptedData, iv) {
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encryptMessage,
    decryptMessage
};