#!/usr/bin/env node

/**
 * VisionMatch Backend CLI Tool
 * 
 * This tool provides command-line access to the backend for:
 * - Database management
 * - Data inspection
 * - Testing and development
 * - GDPR compliance operations
 */

require('dotenv').config();
const { program } = require('commander');
const Customer = require('./src/models/Customer');
const Optician = require('./src/models/Optician');
const { initializeDatabase, db } = require('./src/models/database');
const emailService = require('./src/services/emailService');

program
    .name('visionmatch-cli')
    .description('VisionMatch Backend CLI Tool')
    .version('1.0.0');

// Database commands
program
    .command('db:init')
    .description('Initialize the database')
    .action(async () => {
        try {
            await initializeDatabase();
            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
        }
        process.exit(0);
    });

program
    .command('db:seed')
    .description('Seed database with test data')
    .action(async () => {
        try {
            await initializeDatabase();
            const count = await Optician.seedDatabase();
            console.log(`✅ Seeded ${count} opticians successfully`);
        } catch (error) {
            console.error('❌ Database seeding failed:', error.message);
        }
        process.exit(0);
    });

program
    .command('db:stats')
    .description('Show database statistics')
    .action(async () => {
        try {
            await initializeDatabase();
            
            const stats = await Promise.all([
                queryCount('SELECT COUNT(*) as count FROM customers'),
                queryCount('SELECT COUNT(*) as count FROM customers WHERE deletion_requested = 1'),
                queryCount('SELECT COUNT(*) as count FROM opticians'),
                queryCount('SELECT COUNT(*) as count FROM email_logs'),
                queryCount('SELECT COUNT(*) as count FROM gdpr_audit_log')
            ]);

            console.log('\n📊 Database Statistics');
            console.log('=====================');
            console.log(`Total Customers: ${stats[0]}`);
            console.log(`Pending Deletions: ${stats[1]}`);
            console.log(`Opticians: ${stats[2]}`);
            console.log(`Emails Sent: ${stats[3]}`);
            console.log(`Audit Log Entries: ${stats[4]}\n`);
        } catch (error) {
            console.error('❌ Failed to get stats:', error.message);
        }
        process.exit(0);
    });

program
    .command('db:cleanup')
    .description('Cleanup expired customer data')
    .action(async () => {
        try {
            await initializeDatabase();
            const deletedCount = await Customer.cleanupExpiredData();
            console.log(`✅ Cleaned up ${deletedCount} expired customer records`);
        } catch (error) {
            console.error('❌ Cleanup failed:', error.message);
        }
        process.exit(0);
    });

// Customer commands
program
    .command('customer:list')
    .description('List all customers (GDPR compliant view)')
    .action(async () => {
        try {
            await initializeDatabase();
            
            const customers = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT consent_id, consent_given, consent_timestamp, 
                            created_at, deletion_requested, deletion_scheduled_for
                     FROM customers 
                     ORDER BY created_at DESC`,
                    [],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            console.log('\n👥 Customer List (GDPR Compliant)');
            console.log('=====================================');
            
            if (customers.length === 0) {
                console.log('No customers found.\n');
                return;
            }

            customers.forEach((customer, index) => {
                console.log(`${index + 1}. Consent ID: ${customer.consent_id.substring(0, 12)}...`);
                console.log(`   Consent Given: ${customer.consent_given === 1 ? 'Yes' : 'No'}`);
                console.log(`   Created: ${new Date(customer.created_at).toLocaleDateString()}`);
                console.log(`   Status: ${customer.deletion_requested === 1 ? 'Deletion Requested' : 'Active'}`);
                if (customer.deletion_scheduled_for) {
                    console.log(`   Deletion Scheduled: ${new Date(customer.deletion_scheduled_for).toLocaleDateString()}`);
                }
                console.log('');
            });
        } catch (error) {
            console.error('❌ Failed to list customers:', error.message);
        }
        process.exit(0);
    });

program
    .command('customer:view <consentId>')
    .description('View customer data (decrypted)')
    .action(async (consentId) => {
        try {
            await initializeDatabase();
            const customer = await Customer.findByConsentId(consentId);
            
            if (!customer) {
                console.log('❌ Customer not found');
                process.exit(1);
            }

            const exportData = await customer.exportData();
            console.log('\n👤 Customer Data');
            console.log('================');
            console.log(JSON.stringify(exportData, null, 2));
        } catch (error) {
            console.error('❌ Failed to view customer:', error.message);
        }
        process.exit(0);
    });

program
    .command('customer:audit <consentId>')
    .description('View customer audit log')
    .action(async (consentId) => {
        try {
            await initializeDatabase();
            
            const auditLog = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT * FROM gdpr_audit_log 
                     WHERE consent_id = ? 
                     ORDER BY timestamp DESC`,
                    [consentId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            console.log(`\n📋 Audit Log for ${consentId.substring(0, 12)}...`);
            console.log('=====================================');
            
            if (auditLog.length === 0) {
                console.log('No audit entries found.\n');
                return;
            }

            auditLog.forEach((entry, index) => {
                console.log(`${index + 1}. ${entry.action_type.toUpperCase()}`);
                console.log(`   Time: ${new Date(entry.timestamp).toLocaleString()}`);
                console.log(`   Details: ${entry.details}`);
                console.log(`   Legal Basis: ${entry.legal_basis}`);
                console.log('');
            });
        } catch (error) {
            console.error('❌ Failed to view audit log:', error.message);
        }
        process.exit(0);
    });

program
    .command('customer:delete <consentId>')
    .description('Request customer data deletion')
    .option('--immediate', 'Delete immediately (skip grace period)')
    .action(async (consentId, options) => {
        try {
            await initializeDatabase();
            const success = await Customer.requestDeletion(consentId, options.immediate);
            
            if (success) {
                const period = options.immediate ? 'immediately' : 'in 30 days';
                console.log(`✅ Data deletion requested for ${consentId.substring(0, 12)}... (${period})`);
            } else {
                console.log('❌ Deletion request failed');
            }
        } catch (error) {
            console.error('❌ Failed to request deletion:', error.message);
        }
        process.exit(0);
    });

// Optician commands
program
    .command('opticians:list')
    .description('List all opticians')
    .action(async () => {
        try {
            await initializeDatabase();
            const opticians = await Optician.findAll();

            console.log('\n🏥 Opticians Directory');
            console.log('=====================');
            
            if (opticians.length === 0) {
                console.log('No opticians found. Run "db:seed" to add test data.\n');
                return;
            }

            opticians.forEach((optician, index) => {
                console.log(`${index + 1}. ${optician.name}`);
                console.log(`   ${optician.address}, ${optician.city}, ${optician.state} ${optician.zipCode}`);
                console.log(`   Phone: ${optician.phone}`);
                console.log(`   Rating: ${optician.rating}⭐ (${optician.reviewCount} reviews)`);
                console.log(`   Services: ${optician.services.join(', ')}`);
                console.log('');
            });
        } catch (error) {
            console.error('❌ Failed to list opticians:', error.message);
        }
        process.exit(0);
    });

program
    .command('opticians:search <zipCode>')
    .description('Search opticians by zip code')
    .action(async (zipCode) => {
        try {
            await initializeDatabase();
            const opticians = await Optician.findByZipCode(zipCode);

            console.log(`\n🔍 Opticians near ${zipCode}`);
            console.log('============================');
            
            if (opticians.length === 0) {
                console.log(`No opticians found near ${zipCode}\n`);
                return;
            }

            opticians.forEach((optician, index) => {
                console.log(`${index + 1}. ${optician.name} (${optician.zipCode})`);
                console.log(`   ${optician.address}, ${optician.city}, ${optician.state}`);
                console.log(`   Phone: ${optician.phone}`);
                console.log('');
            });
        } catch (error) {
            console.error('❌ Failed to search opticians:', error.message);
        }
        process.exit(0);
    });

// Email commands
program
    .command('email:test')
    .description('Test email configuration')
    .action(async () => {
        try {
            console.log('🧪 Testing email configuration...');
            const result = await emailService.testConnection();
            
            if (result) {
                console.log('✅ Email service connection successful');
                console.log(`Provider: ${process.env.SENDGRID_API_KEY ? 'SendGrid' : process.env.SMTP_HOST ? 'SMTP' : 'Development Mode'}`);
                console.log(`From: ${process.env.FROM_NAME || 'VisionMatch'} <${process.env.FROM_EMAIL || 'noreply@visionmatch.com'}>`);
            } else {
                console.log('❌ Email service connection failed');
                console.log('Check your email configuration in .env file');
            }
        } catch (error) {
            console.error('❌ Email test failed:', error.message);
        }
        process.exit(0);
    });

program
    .command('email:logs')
    .description('Show recent email logs')
    .option('--limit <number>', 'Number of logs to show', '10')
    .action(async (options) => {
        try {
            await initializeDatabase();
            
            const logs = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT * FROM email_logs 
                     ORDER BY sent_at DESC 
                     LIMIT ?`,
                    [parseInt(options.limit)],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });

            console.log(`\n📧 Recent Email Logs (${options.limit})`);
            console.log('========================');
            
            if (logs.length === 0) {
                console.log('No email logs found.\n');
                return;
            }

            logs.forEach((log, index) => {
                console.log(`${index + 1}. ${log.email_type.toUpperCase()}`);
                console.log(`   Sent: ${new Date(log.sent_at).toLocaleString()}`);
                console.log(`   Status: ${log.delivery_status}`);
                console.log(`   Subject: ${log.subject_line || 'N/A'}`);
                console.log('');
            });
        } catch (error) {
            console.error('❌ Failed to show email logs:', error.message);
        }
        process.exit(0);
    });

// Test commands
program
    .command('test:submit-quiz')
    .description('Submit test quiz data')
    .option('--email <email>', 'Test email address', 'test@example.com')
    .action(async (options) => {
        try {
            await initializeDatabase();
            
            console.log('🧪 Submitting test quiz data...');
            
            const testCustomer = new Customer({
                email: options.email,
                firstName: 'Test',
                lastName: 'User',
                zipCode: '10001',
                consentGiven: true,
                consentTimestamp: new Date().toISOString(),
                consentIp: '127.0.0.1',
                quizAnswers: {
                    age: '26-35',
                    gender: 'Male',
                    glasses: 'Yes, I wear glasses',
                    screenTime: '6-8 hours',
                    symptoms: ['Eye strain', 'Headaches']
                },
                aiInsights: {
                    headline: 'Test Insight',
                    insight: 'This is a test insight generated by the CLI tool.',
                    hook: 'Your full analysis would provide detailed recommendations.'
                }
            });

            await testCustomer.save();
            
            console.log(`✅ Test customer created successfully`);
            console.log(`Consent ID: ${testCustomer.consentId}`);
            console.log(`Email: ${options.email}`);
            
            // Try to send email
            try {
                await emailService.sendQuizResults(testCustomer, testCustomer.quizAnswers, testCustomer.aiInsights);
                console.log('✅ Test email sent successfully');
            } catch (emailError) {
                console.log('⚠️ Test email failed (but customer data was saved)');
                console.log(`Email error: ${emailError.message}`);
            }
            
        } catch (error) {
            console.error('❌ Test submission failed:', error.message);
        }
        process.exit(0);
    });

// Utility functions
function queryCount(query) {
    return new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
        });
    });
}

// Handle unknown commands
program.on('command:*', function (operands) {
    console.error(`❌ Unknown command: ${operands[0]}`);
    console.log('Run "visionmatch-cli --help" for available commands.');
    process.exit(1);
});

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}

program.parse();