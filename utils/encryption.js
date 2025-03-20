const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Clave de 32 bytes
const IV_LENGTH = 16; // 16 bytes para AES

function encryptAES(text) {
    try {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
        let encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('🔴 Error en la encriptación:', error.message);
        throw new Error('Error en la encriptación de datos');
    }

   
}

function decryptAES(text) {
    
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts[0], 'hex');
        let encryptedText = Buffer.from(textParts[1], 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
        let decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('🔴 Error en la desencriptación:', error.message);
        throw new Error('Error en la desencriptación de datos');
    }
}

module.exports = { encryptAES, decryptAES };
