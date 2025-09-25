const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory storage as fallback
const customers = [];

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Quiz submit endpoint
app.post('/api/customers/quiz-submit', (req, res) => {
    try {
        const { personalData, quizAnswers, consent, aiInsights } = req.body;
        
        // Generate consent ID
        const consentId = 'consent_' + crypto.randomBytes(16).toString('hex');
        
        // Store customer data
        const customer = {
            id: crypto.randomBytes(16).toString('hex'),
            consentId,
            personalData,
            quizAnswers,
            consent,
            aiInsights,
            createdAt: new Date().toISOString()
        };
        
        customers.push(customer);
        
        console.log('✅ Customer data received:', {
            name: personalData.firstName + ' ' + personalData.lastName,
            email: personalData.email,
            consentId
        });
        
        res.json({
            success: true,
            consentId,
            message: 'Data saved successfully'
        });
    } catch (error) {
        console.error('Error processing quiz submission:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Get all customers (for admin)
app.get('/api/customers', (req, res) => {
    res.json({
        success: true,
        data: customers.map(c => ({
            id: c.id,
            name: c.personalData.firstName + ' ' + c.personalData.lastName,
            email: c.personalData.email,
            createdAt: c.createdAt
        }))
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Minimal backend server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  - GET  /api/health');
    console.log('  - POST /api/customers/quiz-submit');
    console.log('  - GET  /api/customers');
});