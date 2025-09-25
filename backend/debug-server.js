console.log('Starting debug server...');

try {
    console.log('Loading dotenv...');
    require('dotenv').config();
    console.log('PORT:', process.env.PORT || 3001);
    
    console.log('Loading express...');
    const express = require('express');
    const cors = require('cors');
    
    console.log('Creating app...');
    const app = express();
    
    console.log('Setting up middleware...');
    app.use(cors());
    app.use(express.json());
    
    console.log('Loading database module...');
    const { initializeDatabase } = require('./src/models/database');
    
    console.log('Initializing database...');
    initializeDatabase()
        .then(() => {
            console.log('Database initialized successfully');
            
            console.log('Loading routes...');
            const customerRoutes = require('./src/routes/customers');
            app.use('/api/customers', customerRoutes);
            
            const PORT = process.env.PORT || 3001;
            console.log('Starting server on port', PORT);
            
            app.listen(PORT, () => {
                console.log(`✅ Server is running on http://localhost:${PORT}`);
                console.log('Try: curl http://localhost:3001/api/health');
            });
        })
        .catch(err => {
            console.error('❌ Database initialization failed:', err);
            console.error('Stack trace:', err.stack);
        });
    
} catch (error) {
    console.error('❌ Failed to start:', error);
    console.error('Stack trace:', error.stack);
}