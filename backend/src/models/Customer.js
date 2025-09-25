const { db } = require('./database');
const { encrypt, decrypt, hash, generateToken } = require('../utils/encryption');
const { v4: uuidv4 } = require('uuid');

class Customer {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.consentId = data.consentId || generateToken();
        this.consentGiven = data.consentGiven || false;
        this.consentTimestamp = data.consentTimestamp;
        this.consentIp = data.consentIp;
        this.dataProcessingPurposes = data.dataProcessingPurposes || ['quiz_analysis', 'optician_matching', 'email_communication'];
        
        // Encrypted fields
        this.email = data.email;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.zipCode = data.zipCode;
        
        // Quiz data
        this.quizAnswers = data.quizAnswers;
        this.aiInsights = data.aiInsights;
        
        // Data management
        this.dataRetentionUntil = data.dataRetentionUntil || this.calculateRetentionDate();
        this.deletionRequested = data.deletionRequested || false;
        this.deletionScheduledFor = data.deletionScheduledFor;
    }

    /**
     * Calculate data retention date (3 years from creation by default)
     */
    calculateRetentionDate() {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 3);
        return date.toISOString();
    }

    /**
     * Save customer data with GDPR compliance
     */
    async save() {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT OR REPLACE INTO customers (
                    id, consent_id, consent_given, consent_timestamp, consent_ip,
                    data_processing_purposes, encrypted_email, encrypted_first_name,
                    encrypted_last_name, encrypted_zip_code, quiz_answers, ai_insights,
                    data_retention_until, deletion_requested, deletion_scheduled_for,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `);

            stmt.run([
                this.id,
                this.consentId,
                this.consentGiven ? 1 : 0,
                this.consentTimestamp,
                this.consentIp,
                JSON.stringify(this.dataProcessingPurposes),
                this.email ? encrypt(this.email) : null,
                this.firstName ? encrypt(this.firstName) : null,
                this.lastName ? encrypt(this.lastName) : null,
                this.zipCode ? encrypt(this.zipCode) : null,
                this.quizAnswers ? JSON.stringify(this.quizAnswers) : null,
                this.aiInsights ? JSON.stringify(this.aiInsights) : null,
                this.dataRetentionUntil,
                this.deletionRequested ? 1 : 0,
                this.deletionScheduledFor
            ], (err) => {
                if (err) {
                    reject(err);
                } else {
                    // Log GDPR action
                    Customer.logGdprAction(this.consentId, 'data_saved', 'Customer data saved to database');
                    resolve(stmt.lastID || stmt.changes);
                }
            });
        });
    }

    /**
     * Find customer by consent ID (GDPR-compliant identifier)
     */
    static async findByConsentId(consentId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM customers WHERE consent_id = ? AND deletion_requested = 0`,
                [consentId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else if (row) {
                        // Decrypt sensitive data
                        const customer = new Customer({
                            id: row.id,
                            consentId: row.consent_id,
                            consentGiven: row.consent_given === 1,
                            consentTimestamp: row.consent_timestamp,
                            consentIp: row.consent_ip,
                            dataProcessingPurposes: row.data_processing_purposes ? JSON.parse(row.data_processing_purposes) : [],
                            email: row.encrypted_email ? decrypt(row.encrypted_email) : null,
                            firstName: row.encrypted_first_name ? decrypt(row.encrypted_first_name) : null,
                            lastName: row.encrypted_last_name ? decrypt(row.encrypted_last_name) : null,
                            zipCode: row.encrypted_zip_code ? decrypt(row.encrypted_zip_code) : null,
                            quizAnswers: row.quiz_answers ? JSON.parse(row.quiz_answers) : null,
                            aiInsights: row.ai_insights ? JSON.parse(row.ai_insights) : null,
                            dataRetentionUntil: row.data_retention_until,
                            deletionRequested: row.deletion_requested === 1,
                            deletionScheduledFor: row.deletion_scheduled_for
                        });

                        // Update access tracking
                        Customer.updateAccessTracking(consentId);
                        Customer.logGdprAction(consentId, 'data_accessed', 'Customer data retrieved from database');
                        
                        resolve(customer);
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }

    /**
     * Request data deletion (GDPR Right to be Forgotten)
     */
    static async requestDeletion(consentId, immediateDelete = false) {
        return new Promise((resolve, reject) => {
            const deletionDate = immediateDelete ? new Date().toISOString() : 
                new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(); // 30 days grace period

            db.run(
                `UPDATE customers SET 
                 deletion_requested = 1, 
                 deletion_scheduled_for = ?, 
                 updated_at = CURRENT_TIMESTAMP 
                 WHERE consent_id = ?`,
                [deletionDate, consentId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        Customer.logGdprAction(consentId, 'deletion_requested', 
                            `Data deletion ${immediateDelete ? 'immediate' : 'scheduled for ' + deletionDate}`);
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    /**
     * Permanently delete customer data (irreversible)
     */
    static async permanentlyDelete(consentId) {
        return new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM customers WHERE consent_id = ?`,
                [consentId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        Customer.logGdprAction(consentId, 'data_deleted', 'Customer data permanently deleted');
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    /**
     * Get customer data in portable format (GDPR Right to Data Portability)
     */
    async exportData() {
        return {
            personalData: {
                email: this.email,
                firstName: this.firstName,
                lastName: this.lastName,
                zipCode: this.zipCode
            },
            consentData: {
                consentGiven: this.consentGiven,
                consentTimestamp: this.consentTimestamp,
                dataProcessingPurposes: this.dataProcessingPurposes
            },
            quizData: {
                answers: this.quizAnswers,
                insights: this.aiInsights
            },
            dataManagement: {
                dataRetentionUntil: this.dataRetentionUntil,
                exportedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Update access tracking for compliance monitoring
     */
    static updateAccessTracking(consentId) {
        db.run(
            `UPDATE customers SET 
             last_accessed = CURRENT_TIMESTAMP, 
             access_count = access_count + 1 
             WHERE consent_id = ?`,
            [consentId]
        );
    }

    /**
     * Log GDPR actions for audit trail
     */
    static logGdprAction(consentId, actionType, details, ipAddress = null, userAgent = null) {
        db.run(
            `INSERT INTO gdpr_audit_log 
             (consent_id, action_type, details, ip_address, user_agent, legal_basis) 
             VALUES (?, ?, ?, ?, ?, 'consent')`,
            [consentId, actionType, details, ipAddress, userAgent]
        );
    }

    /**
     * Clean up expired data (run as scheduled job)
     */
    static async cleanupExpiredData() {
        const now = new Date().toISOString();
        
        return new Promise((resolve, reject) => {
            // Find customers scheduled for deletion
            db.all(
                `SELECT consent_id FROM customers 
                 WHERE deletion_scheduled_for <= ? OR data_retention_until <= ?`,
                [now, now],
                async (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    let deletedCount = 0;
                    for (const row of rows) {
                        await Customer.permanentlyDelete(row.consent_id);
                        deletedCount++;
                    }

                    console.log(`GDPR cleanup: Deleted ${deletedCount} expired customer records`);
                    resolve(deletedCount);
                }
            );
        });
    }
}

module.exports = Customer;