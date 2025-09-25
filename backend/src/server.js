require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const customerRoutes = require('./routes/customers');
const opticiansRoutes = require('./routes/opticians');
const emailRoutes = require('./routes/email');
const gdprRoutes = require('./routes/gdpr');
const adminRoutes = require('./routes/admin');
const { initializeDatabase } = require('./models/database');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
// Configure Helmet but disable the default restrictive Content-Security-Policy so external assets (e.g. hosted fonts) can load during local development.
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like file:// or curl)
        if (!origin) return callback(null, true);
        
        // Allow localhost and file origins
        const allowedOrigins = [
            'http://localhost:8080',
            'http://localhost:8000',
            'http://localhost:3000',
            'http://127.0.0.1:8080',
            'file://'
        ];
        
        if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            callback(null, true);
        } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins in development
        }
    },
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/opticians', opticiansRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/admin', adminRoutes);

// Serve static frontend assets (index.html, css, etc.) from project root so visiting
// http://localhost:3001/ shows the landing page instead of a 404.
const staticRoot = path.join(__dirname, '..', '..');
app.use(express.static(staticRoot));

// Serve admin pages directly
app.get('/admin-simple', (req, res) => {
    res.sendFile(path.join(staticRoot, 'admin-simple.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(staticRoot, 'admin.html'));
});

// Fallback: for any non-API route, send index.html (useful for SPA routing)
app.get('/', (_, res) => {
    res.sendFile(path.join(staticRoot, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`VisionMatch Backend Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;