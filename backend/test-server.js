const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/customers/quiz-submit', (req, res) => {
    console.log('Quiz submit received:', req.body);
    res.json({ 
        success: true, 
        message: 'Test server - data received',
        consentId: 'test-consent-' + Date.now()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Test server running' });
});

app.listen(3001, () => {
    console.log('Test server running on port 3001');
});