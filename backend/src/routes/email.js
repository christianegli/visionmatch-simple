const express = require('express');
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const emailService = require('../services/emailService');

const router = express.Router();

/**
 * Resend quiz results email
 * POST /api/email/resend-quiz-results
 */
router.post('/resend-quiz-results', [
    body('consentId').isString().isLength({ min: 10 }),
    body('email').isEmail().normalizeEmail()
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

        const { consentId, email } = req.body;
        const customer = await Customer.findByConsentId(consentId);

        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found'
            });
        }

        // Verify email matches (for security)
        if (customer.email !== email) {
            return res.status(403).json({
                error: true,
                message: 'Email verification failed'
            });
        }

        // Resend quiz results email
        await emailService.sendQuizResults(customer, customer.quizAnswers, customer.aiInsights);

        // Log GDPR action
        Customer.logGdprAction(
            consentId,
            'email_resent',
            'Quiz results email resent at customer request',
            req.ip,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Quiz results email resent successfully',
            sentTo: email
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Send appointment reminder email
 * POST /api/email/appointment-reminder
 */
router.post('/appointment-reminder', [
    body('consentId').isString().isLength({ min: 10 }),
    body('appointmentDetails').isObject(),
    body('appointmentDetails.opticianName').isString(),
    body('appointmentDetails.date').isString(),
    body('appointmentDetails.address').isString(),
    body('appointmentDetails.phone').isString()
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

        const { consentId, appointmentDetails } = req.body;
        const customer = await Customer.findByConsentId(consentId);

        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found'
            });
        }

        // Send appointment reminder
        await emailService.sendAppointmentConfirmation(customer, appointmentDetails);

        // Log GDPR action
        Customer.logGdprAction(
            consentId,
            'appointment_reminder_sent',
            `Appointment reminder sent for ${appointmentDetails.opticianName}`,
            req.ip,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Appointment reminder sent successfully',
            appointment: appointmentDetails
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Get email delivery status for a customer
 * GET /api/email/status/:consentId
 */
router.get('/status/:consentId', async (req, res, next) => {
    try {
        const consentId = req.params.consentId;
        
        // Verify customer exists
        const customer = await Customer.findByConsentId(consentId);
        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found'
            });
        }

        // Get email logs
        const { db } = require('../models/database');
        const emailLogs = await new Promise((resolve, reject) => {
            db.all(
                `SELECT email_type, sent_at, delivery_status, subject_line 
                 FROM email_logs 
                 WHERE customer_consent_id = ? 
                 ORDER BY sent_at DESC`,
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
            emailHistory: emailLogs.map(log => ({
                type: log.email_type,
                sentAt: log.sent_at,
                status: log.delivery_status,
                subject: log.subject_line
            }))
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Unsubscribe from emails (GDPR compliance)
 * POST /api/email/unsubscribe
 */
router.post('/unsubscribe', [
    body('consentId').isString().isLength({ min: 10 }),
    body('email').isEmail().normalizeEmail(),
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

        const { consentId, email, reason } = req.body;
        const customer = await Customer.findByConsentId(consentId);

        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found'
            });
        }

        // Verify email matches
        if (customer.email !== email) {
            return res.status(403).json({
                error: true,
                message: 'Email verification failed'
            });
        }

        // Update consent to remove email communications
        const updatedPurposes = customer.dataProcessingPurposes.filter(p => p !== 'email_communication');
        customer.dataProcessingPurposes = updatedPurposes;
        await customer.save();

        // Log GDPR action
        Customer.logGdprAction(
            consentId,
            'email_unsubscribed',
            `Unsubscribed from emails. Reason: ${reason || 'Not specified'}`,
            req.ip,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Successfully unsubscribed from email communications',
            consentId: consentId,
            note: 'You will no longer receive marketing emails, but may still receive important account-related messages.',
            resubscribe: {
                message: 'You can resubscribe anytime by updating your consent preferences',
                url: `https://visionmatch.com/privacy/consent?id=${consentId}`
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Test email configuration (development only)
 * POST /api/email/test
 */
router.post('/test', async (req, res, next) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({
                error: true,
                message: 'Email testing not allowed in production'
            });
        }

        const testResult = await emailService.testConnection();

        res.json({
            success: true,
            emailServiceStatus: testResult ? 'Connected' : 'Failed',
            configuration: {
                provider: process.env.SENDGRID_API_KEY ? 'SendGrid' : 
                          process.env.SMTP_HOST ? 'SMTP' : 'Development Mode',
                fromEmail: process.env.FROM_EMAIL || 'noreply@visionmatch.com',
                fromName: process.env.FROM_NAME || 'VisionMatch'
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;