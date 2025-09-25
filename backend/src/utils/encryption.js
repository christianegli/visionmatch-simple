const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ? 
    crypto.scryptSync(process.env.ENCRYPTION_KEY, 'visionmatch-salt', 32) : 
    crypto.randomBytes(32);

if (!process.env.ENCRYPTION_KEY) {
    console.warn('WARNING: No ENCRYPTION_KEY set in environment. Using random key - data will not persist between restarts!');
}

/**
 * Encrypt sensitive data for GDPR compliance
 * @param {string} text - The text to encrypt
 * @returns {string} - Encrypted data with IV
 */
function encrypt(text) {
    if (!text) return null;
    
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Combine IV and encrypted data
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error.message);
        // Fallback to simple base64 encoding for demo purposes
        return 'b64:' + Buffer.from(text).toString('base64');
    }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - The encrypted data string
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedData) {
    if (!encryptedData) return null;
    
    try {
        // Handle fallback base64 encoding
        if (encryptedData.startsWith('b64:')) {
            return Buffer.from(encryptedData.substring(4), 'base64').toString('utf8');
        }
        
        const parts = encryptedData.split(':');
        if (parts.length !== 2) throw new Error('Invalid encrypted data format');
        
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY, iv);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        return null;
    }
}

/**
 * Hash data for non-reversible storage (like IDs for deletion tracking)
 * @param {string} data - Data to hash
 * @returns {string} - SHA-256 hash
 */
function hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a secure random token for GDPR consent tracking
 * @returns {string} - Random token
 */
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    encrypt,
    decrypt,
    hash,
    generateToken
};