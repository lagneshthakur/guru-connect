const crypto = require('crypto');

const algorithm = 'aes-128-cbc';
const key = crypto.randomBytes(16); // Replace with a secure key management solution
const iv = crypto.randomBytes(16); // Initialization vector

function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}

function decrypt(encryptedData, iv) {
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt
};