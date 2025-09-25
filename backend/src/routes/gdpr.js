const express = require('express');
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const { requireConsent } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Request data deletion (GDPR Right to be Forgotten)
 * POST /api/gdpr/request-deletion
 */
router.post('/request-deletion', [
    body('consentId').isString().isLength({ min: 10 }),
    body('reason').optional().trim().isLength({ max: 500 }),
    body('immediateDelete').optional().isBoolean()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: true,
                message: 'Validation failed',
                details: errors.array()
            });
        }

        const { consentId, reason, immediateDelete = false } = req.body;

        // Verify customer exists
        const customer = await Customer.findByConsentId(consentId);
        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found or already deleted'
            });
        }

        // Request deletion
        const deletionRequested = await Customer.requestDeletion(consentId, immediateDelete);

        if (!deletionRequested) {
            return res.status(400).json({
                error: true,
                message: 'Deletion request could not be processed'
            });
        }

        // Log GDPR action
        Customer.logGdprAction(
            consentId,
            'deletion_requested',
            `Deletion requested. Reason: ${reason || 'Not specified'}. Immediate: ${immediateDelete}`,
            req.ip,
            req.headers['user-agent']
        );

        const deletionDate = immediateDelete ? 'immediately' : 'within 30 days';
        
        res.json({
            success: true,
            message: `Data deletion request processed successfully`,
            deletionSchedule: deletionDate,
            consentId: consentId,
            note: immediateDelete ? 
                'Your data has been scheduled for immediate deletion.' :
                'You have 30 days to cancel this request if submitted in error. After that, your data will be permanently deleted.',
            cancellationInfo: immediateDelete ? null : {
                message: 'To cancel this deletion request, contact us within 30 days',
                contact: 'privacy@visionmatch.com'
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Cancel data deletion request (if within grace period)
 * POST /api/gdpr/cancel-deletion
 */
router.post('/cancel-deletion', [
    body('consentId').isString().isLength({ min: 10 })
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: true,
                message: 'Validation failed',
                details: errors.array()
            });
        }

        const { consentId } = req.body;
        const customer = await Customer.findByConsentId(consentId);

        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found or already deleted'
            });
        }

        if (!customer.deletionRequested) {
            return res.status(400).json({
                error: true,
                message: 'No deletion request found for this account'
            });
        }

        // Check if still within grace period
        const now = new Date();
        const scheduledDeletion = new Date(customer.deletionScheduledFor);
        
        if (now >= scheduledDeletion) {
            return res.status(400).json({
                error: true,
                message: 'Deletion request cannot be cancelled - grace period has expired'
            });
        }

        // Cancel deletion by updating the database
        await new Promise((resolve, reject) => {
            const { db } = require('../models/database');
            db.run(
                `UPDATE customers SET 
                 deletion_requested = 0, 
                 deletion_scheduled_for = NULL,
                 updated_at = CURRENT_TIMESTAMP 
                 WHERE consent_id = ?`,
                [consentId],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Log GDPR action
        Customer.logGdprAction(
            consentId,
            'deletion_cancelled',
            'User cancelled their data deletion request',
            req.ip,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Data deletion request cancelled successfully',
            consentId: consentId
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Export customer data (GDPR Right to Data Portability)
 * GET /api/gdpr/export-data/:consentId
 */
router.get('/export-data/:consentId', async (req, res, next) => {
    try {
        const consentId = req.params.consentId;
        const customer = await Customer.findByConsentId(consentId);

        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found or consent withdrawn'
            });
        }

        const exportData = await customer.exportData();

        // Log GDPR action
        Customer.logGdprAction(
            consentId,
            'data_exported',
            'Customer requested data export',
            req.ip,
            req.headers['user-agent']
        );

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="visionmatch-data-export-${consentId.substring(0, 8)}.json"`);

        res.json({
            exportInfo: {
                exportedAt: new Date().toISOString(),
                dataController: 'VisionMatch',
                gdprBasis: 'Article 20 - Right to data portability',
                format: 'JSON'
            },
            customerData: exportData
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Get GDPR audit log for a customer
 * GET /api/gdpr/audit-log/:consentId
 */
router.get('/audit-log/:consentId', async (req, res, next) => {
    try {
        const consentId = req.params.consentId;
        
        // Verify customer exists first
        const customer = await Customer.findByConsentId(consentId);
        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found'
            });
        }

        // Get audit log
        const { db } = require('../models/database');
        const auditLog = await new Promise((resolve, reject) => {
            db.all(
                `SELECT action_type, details, timestamp, ip_address, legal_basis 
                 FROM gdpr_audit_log 
                 WHERE consent_id = ? 
                 ORDER BY timestamp DESC`,
                [consentId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.json({
            success: true,
            consentId: consentId,
            auditLog: auditLog.map(entry => ({
                action: entry.action_type,
                details: entry.details,
                timestamp: entry.timestamp,
                legalBasis: entry.legal_basis,
                ipAddress: process.env.NODE_ENV === 'development' ? entry.ip_address : '[REDACTED]'
            }))
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Update consent preferences
 * POST /api/gdpr/update-consent
 */
router.post('/update-consent', [
    body('consentId').isString().isLength({ min: 10 }),
    body('dataProcessingPurposes').isArray(),
    body('marketingConsent').optional().isBoolean(),
    body('reason').optional().trim().isLength({ max: 200 })
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: true,
                message: 'Validation failed',
                details: errors.array()
            });
        }

        const { consentId, dataProcessingPurposes, marketingConsent, reason } = req.body;

        // Validate purposes
        const allowedPurposes = ['quiz_analysis', 'optician_matching', 'email_communication', 'marketing'];
        const invalidPurposes = dataProcessingPurposes.filter(p => !allowedPurposes.includes(p));
        
        if (invalidPurposes.length > 0) {
            return res.status(400).json({
                error: true,
                message: 'Invalid data processing purposes',
                invalidPurposes: invalidPurposes
            });
        }

        const customer = await Customer.findByConsentId(consentId);
        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found'
            });
        }

        // Update consent preferences
        customer.dataProcessingPurposes = dataProcessingPurposes;
        await customer.save();

        // Log GDPR action
        Customer.logGdprAction(
            consentId,
            'consent_updated',
            `Updated consent purposes: ${dataProcessingPurposes.join(', ')}. Reason: ${reason || 'Not specified'}`,
            req.ip,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Consent preferences updated successfully',
            updatedPurposes: dataProcessingPurposes,
            effectiveDate: new Date().toISOString()
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Get current consent status
 * GET /api/gdpr/consent-status/:consentId
 */
router.get('/consent-status/:consentId', async (req, res, next) => {
    try {
        const consentId = req.params.consentId;
        const customer = await Customer.findByConsentId(consentId);

        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            consent: {
                consentId: customer.consentId,
                consentGiven: customer.consentGiven,
                consentTimestamp: customer.consentTimestamp,
                dataProcessingPurposes: customer.dataProcessingPurposes,
                dataRetentionUntil: customer.dataRetentionUntil,
                deletionRequested: customer.deletionRequested,
                deletionScheduledFor: customer.deletionScheduledFor
            },
            yourRights: {
                access: 'You can request a copy of your personal data',
                rectification: 'You can request corrections to your data',
                erasure: 'You can request deletion of your data',
                portability: 'You can request your data in a portable format',
                objection: 'You can object to certain data processing',
                withdraw: 'You can withdraw consent at any time'
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;