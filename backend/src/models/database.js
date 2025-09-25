const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DATABASE_PATH = process.env.DATABASE_PATH || './data/visionmatch.db';

// Ensure data directory exists
const dataDir = path.dirname(DATABASE_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DATABASE_PATH);

/**
 * Initialize the database with GDPR-compliant schema
 */
async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Customers table - stores encrypted PII data
            db.run(`CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                -- GDPR Consent Management
                consent_id TEXT UNIQUE NOT NULL,
                consent_given INTEGER NOT NULL DEFAULT 0,
                consent_timestamp DATETIME,
                consent_ip TEXT,
                data_processing_purposes TEXT,
                
                -- Encrypted Personal Data
                encrypted_email TEXT,
                encrypted_first_name TEXT,
                encrypted_last_name TEXT,
                encrypted_zip_code TEXT,
                
                -- Quiz Data (anonymized/pseudonymized)
                quiz_answers TEXT, -- JSON string of answers
                ai_insights TEXT,  -- Generated insights
                
                -- Data Management
                data_retention_until DATETIME,
                deletion_requested INTEGER DEFAULT 0,
                deletion_scheduled_for DATETIME,
                
                -- Audit Trail
                last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 0
            )`, (err) => {
                if (err) reject(err);
            });

            // Opticians table - business data, not personal
            db.run(`CREATE TABLE IF NOT EXISTS opticians (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                state TEXT,
                zip_code TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                website TEXT,
                hours TEXT,
                services TEXT, -- JSON array of services
                specialties TEXT, -- JSON array of specialties
                latitude REAL,
                longitude REAL,
                rating REAL DEFAULT 0.0,
                review_count INTEGER DEFAULT 0,
                verified INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) reject(err);
            });

            // Email logs - for delivery tracking and GDPR audit
            db.run(`CREATE TABLE IF NOT EXISTS email_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_consent_id TEXT NOT NULL,
                email_type TEXT NOT NULL, -- 'quiz_results', 'appointment_confirmation', etc.
                recipient_hash TEXT NOT NULL, -- Hashed email for audit without storing email
                sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                delivery_status TEXT DEFAULT 'sent',
                email_provider_id TEXT, -- External provider message ID
                subject_line TEXT,
                gdpr_compliant INTEGER DEFAULT 1
            )`, (err) => {
                if (err) reject(err);
            });

            // GDPR Data Processing Log
            db.run(`CREATE TABLE IF NOT EXISTS gdpr_audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                consent_id TEXT NOT NULL,
                action_type TEXT NOT NULL, -- 'consent_given', 'data_accessed', 'data_updated', 'data_deleted'
                details TEXT,
                ip_address TEXT,
                user_agent TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                legal_basis TEXT -- 'consent', 'legitimate_interest', etc.
            )`, (err) => {
                if (err) reject(err);
            });

            // Indexes for performance and GDPR compliance
            db.run(`CREATE INDEX IF NOT EXISTS idx_customers_consent_id ON customers(consent_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_customers_deletion_scheduled ON customers(deletion_scheduled_for)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_opticians_zip ON opticians(zip_code)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_email_logs_consent ON email_logs(customer_consent_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_audit_consent ON gdpr_audit_log(consent_id)`);
            
            resolve();
        });
    });
}

/**
 * Close database connection gracefully
 */
function closeDatabase() {
    return new Promise((resolve) => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            }
            resolve();
        });
    });
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing database connection...');
    await closeDatabase();
    process.exit(0);
});

module.exports = {
    db,
    initializeDatabase,
    closeDatabase
};