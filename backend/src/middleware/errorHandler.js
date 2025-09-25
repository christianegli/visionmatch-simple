/**
 * Global error handling middleware for Express
 */
function errorHandler(err, req, res, next) {
    console.error('Error occurred:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // GDPR compliance - don't log sensitive data
    if (err.message.includes('consent') || err.message.includes('email')) {
        console.error('GDPR-sensitive error occurred - details logged separately');
    }

    // Default error response
    let status = err.status || err.statusCode || 500;
    let message = 'Internal server error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Invalid input data';
    } else if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized access';
    } else if (err.message.includes('GDPR') || err.message.includes('consent')) {
        status = 403;
        message = 'GDPR compliance error - consent required';
    } else if (err.message.includes('not found')) {
        status = 404;
        message = 'Resource not found';
    } else if (process.env.NODE_ENV === 'development') {
        // In development, send the actual error message
        message = err.message;
    }

    res.status(status).json({
        error: true,
        message: message,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: err.details 
        })
    });
}

/**
 * 404 handler for unmatched routes
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        error: true,
        message: 'API endpoint not found',
        timestamp: new Date().toISOString(),
        path: req.path
    });
}

/**
 * GDPR consent validation middleware
 */
function requireConsent(req, res, next) {
    const consentId = req.headers['x-consent-id'] || req.body.consentId;
    
    if (!consentId) {
        return res.status(400).json({
            error: true,
            message: 'GDPR consent ID required',
            code: 'CONSENT_REQUIRED'
        });
    }

    req.consentId = consentId;
    next();
}

module.exports = {
    errorHandler,
    notFoundHandler,
    requireConsent
};