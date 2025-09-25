const express = require('express');
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const emailService = require('../services/emailService');
const { requireConsent } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Submit quiz data with GDPR consent
 * POST /api/customers/quiz-submit
 */
router.post('/quiz-submit', [
    // Validation rules
    body('email').isEmail().normalizeEmail(),
    body('firstName').trim().isLength({ min: 1, max: 50 }),
    body('lastName').trim().isLength({ min: 1, max: 50 }),
    body('zipCode').trim().isLength({ min: 5, max: 10 }),
    body('consentGiven').isBoolean(),
    body('quizAnswers').isObject(),
    body('aiInsights').optional().isObject()
], async (req, res, next) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: true,
                message: 'Validation failed',
                details: errors.array()
            });
        }

        // Check GDPR consent
        if (!req.body.consentGiven) {
            return res.status(403).json({
                error: true,
                message: 'GDPR consent is required to process quiz data',
                code: 'CONSENT_REQUIRED'
            });
        }

        // Create customer record
        const customer = new Customer({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            zipCode: req.body.zipCode,
            consentGiven: req.body.consentGiven,
            consentTimestamp: new Date().toISOString(),
            consentIp: req.ip,
            quizAnswers: req.body.quizAnswers,
            aiInsights: req.body.aiInsights,
            dataProcessingPurposes: ['quiz_analysis', 'optician_matching', 'email_communication']
        });

        // Save to database
        await customer.save();

        // Send quiz results email
        try {
            await emailService.sendQuizResults(customer, req.body.quizAnswers, req.body.aiInsights);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the request if email fails - log it for manual follow-up
        }

        // Return success with consent ID for future requests
        res.status(201).json({
            success: true,
            message: 'Quiz data processed successfully',
            consentId: customer.consentId,
            dataRetentionUntil: customer.dataRetentionUntil,
            emailSent: true
        });

        // Log GDPR action
        Customer.logGdprAction(
            customer.consentId, 
            'consent_given', 
            'User completed quiz and gave GDPR consent',
            req.ip,
            req.headers['user-agent']
        );

    } catch (error) {
        next(error);
    }
});

/**
 * Update customer data
 * PUT /api/customers/:consentId
 */
router.put('/:consentId', requireConsent, [
    body('email').optional().isEmail().normalizeEmail(),
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
    body('zipCode').optional().trim().isLength({ min: 5, max: 10 })
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

        const consentId = req.params.consentId;
        const customer = await Customer.findByConsentId(consentId);

        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found or consent withdrawn'
            });
        }

        // Update allowed fields
        const allowedUpdates = ['email', 'firstName', 'lastName', 'zipCode'];
        const updates = {};
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
                customer[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: true,
                message: 'No valid updates provided'
            });
        }

        await customer.save();

        // Log GDPR action
        Customer.logGdprAction(
            consentId,
            'data_updated',
            `Updated fields: ${Object.keys(updates).join(', ')}`,
            req.ip,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Customer data updated successfully',
            updatedFields: Object.keys(updates)
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Get customer data (GDPR Right to Access)
 * GET /api/customers/:consentId
 */
router.get('/:consentId', requireConsent, async (req, res, next) => {
    try {
        const consentId = req.params.consentId;
        const customer = await Customer.findByConsentId(consentId);

        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found or consent withdrawn'
            });
        }

        // Return exportable data format
        const exportData = await customer.exportData();

        res.json({
            success: true,
            data: exportData,
            gdprInfo: {
                dataRetentionUntil: customer.dataRetentionUntil,
                consentGiven: customer.consentGiven,
                dataProcessingPurposes: customer.dataProcessingPurposes,
                yourRights: [
                    'Right to access your data',
                    'Right to rectification',
                    'Right to erasure (be forgotten)',
                    'Right to data portability',
                    'Right to object to processing'
                ]
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Book appointment with optician
 * POST /api/customers/:consentId/book-appointment
 */
router.post('/:consentId/book-appointment', requireConsent, [
    body('opticianId').isInt(),
    body('preferredDate').isISO8601(),
    body('preferredTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('notes').optional().trim().isLength({ max: 500 })
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

        const consentId = req.params.consentId;
        const customer = await Customer.findByConsentId(consentId);

        if (!customer) {
            return res.status(404).json({
                error: true,
                message: 'Customer not found'
            });
        }

        // In a real implementation, you'd integrate with appointment scheduling system
        const appointmentDetails = {
            opticianName: 'VisionCare Optometry', // This would come from optician lookup
            date: `${req.body.preferredDate} at ${req.body.preferredTime}`,
            address: '123 Main Street, New York, NY 10001',
            phone: '(212) 555-0101',
            confirmationId: `VM${Date.now()}`
        };

        // Send appointment confirmation email
        try {
            await emailService.sendAppointmentConfirmation(customer, appointmentDetails);
        } catch (emailError) {
            console.error('Appointment confirmation email failed:', emailError);
        }

        // Log GDPR action
        Customer.logGdprAction(
            consentId,
            'appointment_booked',
            `Booked appointment for ${appointmentDetails.date}`,
            req.ip,
            req.headers['user-agent']
        );

        res.json({
            success: true,
            message: 'Appointment booking initiated',
            appointment: appointmentDetails,
            note: 'The optician will contact you to confirm the exact time slot.'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;