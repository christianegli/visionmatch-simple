const express = require('express');
const path = require('path');
const Customer = require('../models/Customer');
const Optician = require('../models/Optician');
const { db } = require('../models/database');

const router = express.Router();

// Simple authentication for development
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
        res.set('WWW-Authenticate', 'Basic realm="VisionMatch Admin"');
        return res.status(401).send('Authentication required');
    }

    const credentials = Buffer.from(auth.slice(6), 'base64').toString();
    const [username, password] = credentials.split(':');
    
    if (username === 'admin' && password === ADMIN_PASSWORD) {
        next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm="VisionMatch Admin"');
        return res.status(401).send('Invalid credentials');
    }
}

// Admin panel HTML interface
router.get('/panel', requireAuth, (req, res) => {
    res.send(generateAdminPanelHTML());
});

// API endpoints for admin panel
router.get('/customers', requireAuth, async (req, res) => {
    try {
        const customers = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id, consent_id, consent_given, consent_timestamp, 
                        encrypted_email, encrypted_first_name, encrypted_last_name, 
                        encrypted_zip_code, created_at, last_accessed, access_count,
                        deletion_requested, deletion_scheduled_for, data_retention_until
                 FROM customers 
                 ORDER BY created_at DESC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.json({
            success: true,
            count: customers.length,
            customers: customers.map(customer => ({
                id: customer.id,
                consentId: customer.consent_id,
                consentGiven: customer.consent_given === 1,
                consentTimestamp: customer.consent_timestamp,
                hasEmail: !!customer.encrypted_email,
                hasName: !!(customer.encrypted_first_name && customer.encrypted_last_name),
                hasZipCode: !!customer.encrypted_zip_code,
                createdAt: customer.created_at,
                lastAccessed: customer.last_accessed,
                accessCount: customer.access_count,
                deletionRequested: customer.deletion_requested === 1,
                deletionScheduledFor: customer.deletion_scheduled_for,
                dataRetentionUntil: customer.data_retention_until
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get decrypted customer data
router.get('/customers/:consentId', requireAuth, async (req, res) => {
    try {
        const customer = await Customer.findByConsentId(req.params.consentId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const exportData = await customer.exportData();
        res.json({
            success: true,
            customer: exportData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get audit log
router.get('/audit/:consentId', requireAuth, async (req, res) => {
    try {
        const auditLog = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM gdpr_audit_log 
                 WHERE consent_id = ? 
                 ORDER BY timestamp DESC`,
                [req.params.consentId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.json({
            success: true,
            auditLog: auditLog
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get email logs
router.get('/emails', requireAuth, async (req, res) => {
    try {
        const emailLogs = await new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM email_logs 
                 ORDER BY sent_at DESC 
                 LIMIT 50`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.json({
            success: true,
            emailLogs: emailLogs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get opticians
router.get('/opticians', requireAuth, async (req, res) => {
    try {
        const opticians = await Optician.findAll();
        res.json({
            success: true,
            count: opticians.length,
            opticians: opticians
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Database statistics
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const stats = await new Promise((resolve, reject) => {
            const queries = [
                'SELECT COUNT(*) as count FROM customers',
                'SELECT COUNT(*) as count FROM customers WHERE deletion_requested = 1',
                'SELECT COUNT(*) as count FROM opticians',
                'SELECT COUNT(*) as count FROM email_logs',
                'SELECT COUNT(*) as count FROM gdpr_audit_log'
            ];

            Promise.all(queries.map(query => 
                new Promise((res, rej) => {
                    db.get(query, [], (err, row) => {
                        if (err) rej(err);
                        else res(row.count);
                    });
                })
            )).then(results => {
                resolve({
                    totalCustomers: results[0],
                    pendingDeletions: results[1],
                    totalOpticians: results[2],
                    totalEmails: results[3],
                    auditLogEntries: results[4]
                });
            }).catch(reject);
        });

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test data cleanup
router.post('/cleanup-test-data', requireAuth, async (req, res) => {
    try {
        const deletedCount = await Customer.cleanupExpiredData();
        res.json({
            success: true,
            message: `Cleaned up ${deletedCount} expired customer records`,
            deletedCount: deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function generateAdminPanelHTML() {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>VisionMatch Admin Panel</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #3b82f6; }
        .tabs { display: flex; margin-bottom: 20px; }
        .tab { padding: 10px 20px; background: white; border: 1px solid #ddd; cursor: pointer; margin-right: 5px; border-radius: 5px 5px 0 0; }
        .tab.active { background: #3b82f6; color: white; }
        .content { background: white; padding: 20px; border-radius: 0 8px 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
        .table th { background: #f8f9fa; font-weight: 600; }
        .btn { background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #2563eb; }
        .btn-danger { background: #ef4444; }
        .btn-danger:hover { background: #dc2626; }
        .json { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; overflow: auto; max-height: 400px; }
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; }
        .modal-content { background: white; margin: 50px auto; padding: 20px; width: 80%; max-width: 800px; border-radius: 8px; max-height: 80vh; overflow: auto; }
        .close { float: right; font-size: 28px; font-weight: bold; cursor: pointer; }
        .loading { display: none; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 VisionMatch Admin Panel</h1>
            <p>GDPR-compliant data management and system monitoring</p>
        </div>

        <div id="stats" class="stats">
            <div class="stat-card">
                <div class="stat-number" id="stat-customers">-</div>
                <div>Total Customers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="stat-deletions">-</div>
                <div>Pending Deletions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="stat-opticians">-</div>
                <div>Opticians</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="stat-emails">-</div>
                <div>Emails Sent</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="stat-audit">-</div>
                <div>Audit Entries</div>
            </div>
        </div>

        <div class="tabs">
            <div class="tab active" onclick="showTab('customers')">Customers</div>
            <div class="tab" onclick="showTab('opticians')">Opticians</div>
            <div class="tab" onclick="showTab('emails')">Email Logs</div>
            <div class="tab" onclick="showTab('tools')">Admin Tools</div>
        </div>

        <div class="content">
            <div id="tab-customers">
                <h3>Customer Data (GDPR Compliant View)</h3>
                <div class="loading" id="customers-loading">Loading customers...</div>
                <table class="table" id="customers-table" style="display: none;">
                    <thead>
                        <tr>
                            <th>Consent ID</th>
                            <th>Consent Given</th>
                            <th>Has Data</th>
                            <th>Created</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="customers-tbody"></tbody>
                </table>
            </div>

            <div id="tab-opticians" style="display: none;">
                <h3>Opticians Directory</h3>
                <button class="btn" onclick="seedOpticians()">Seed Test Data</button>
                <div class="loading" id="opticians-loading">Loading opticians...</div>
                <table class="table" id="opticians-table" style="display: none;">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>City, State</th>
                            <th>Phone</th>
                            <th>Rating</th>
                            <th>Services</th>
                        </tr>
                    </thead>
                    <tbody id="opticians-tbody"></tbody>
                </table>
            </div>

            <div id="tab-emails" style="display: none;">
                <h3>Email Delivery Logs</h3>
                <div class="loading" id="emails-loading">Loading email logs...</div>
                <table class="table" id="emails-table" style="display: none;">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Sent At</th>
                            <th>Status</th>
                            <th>Subject</th>
                        </tr>
                    </thead>
                    <tbody id="emails-tbody"></tbody>
                </table>
            </div>

            <div id="tab-tools" style="display: none;">
                <h3>Administrative Tools</h3>
                <div style="margin-bottom: 20px;">
                    <h4>Database Management</h4>
                    <button class="btn" onclick="cleanupExpiredData()">Cleanup Expired Data</button>
                    <button class="btn btn-danger" onclick="resetTestData()">Reset Test Data</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4>Email Testing</h4>
                    <button class="btn" onclick="testEmailConfig()">Test Email Configuration</button>
                </div>

                <div>
                    <h4>API Testing</h4>
                    <button class="btn" onclick="showApiTests()">Show API Test Examples</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div id="modal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <div id="modal-body"></div>
        </div>
    </div>

    <script>
        let currentCustomers = [];
        
        async function loadStats() {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                if (data.success) {
                    document.getElementById('stat-customers').textContent = data.stats.totalCustomers;
                    document.getElementById('stat-deletions').textContent = data.stats.pendingDeletions;
                    document.getElementById('stat-opticians').textContent = data.stats.totalOpticians;
                    document.getElementById('stat-emails').textContent = data.stats.totalEmails;
                    document.getElementById('stat-audit').textContent = data.stats.auditLogEntries;
                }
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }

        async function loadCustomers() {
            document.getElementById('customers-loading').style.display = 'block';
            try {
                const response = await fetch('/api/admin/customers');
                const data = await response.json();
                if (data.success) {
                    currentCustomers = data.customers;
                    displayCustomers(data.customers);
                }
            } catch (error) {
                console.error('Failed to load customers:', error);
            }
            document.getElementById('customers-loading').style.display = 'none';
        }

        function displayCustomers(customers) {
            const tbody = document.getElementById('customers-tbody');
            tbody.innerHTML = '';
            
            customers.forEach(customer => {
                const row = tbody.insertRow();
                row.innerHTML = \`
                    <td>\${customer.consentId.substring(0, 8)}...</td>
                    <td>\${customer.consentGiven ? '✅ Yes' : '❌ No'}</td>
                    <td>\${customer.hasEmail ? 'Email ' : ''}\${customer.hasName ? 'Name ' : ''}\${customer.hasZipCode ? 'Zip' : ''}</td>
                    <td>\${new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td>\${customer.deletionRequested ? '🗑️ Deletion Requested' : '✅ Active'}</td>
                    <td>
                        <button class="btn" onclick="viewCustomer('\${customer.consentId}')">View Data</button>
                        <button class="btn" onclick="viewAuditLog('\${customer.consentId}')">Audit Log</button>
                    </td>
                \`;
            });
            
            document.getElementById('customers-table').style.display = 'table';
        }

        async function loadOpticians() {
            document.getElementById('opticians-loading').style.display = 'block';
            try {
                const response = await fetch('/api/admin/opticians');
                const data = await response.json();
                if (data.success) {
                    displayOpticians(data.opticians);
                }
            } catch (error) {
                console.error('Failed to load opticians:', error);
            }
            document.getElementById('opticians-loading').style.display = 'none';
        }

        function displayOpticians(opticians) {
            const tbody = document.getElementById('opticians-tbody');
            tbody.innerHTML = '';
            
            opticians.forEach(optician => {
                const row = tbody.insertRow();
                row.innerHTML = \`
                    <td>\${optician.name}</td>
                    <td>\${optician.city}, \${optician.state}</td>
                    <td>\${optician.phone}</td>
                    <td>\${optician.rating} ⭐ (\${optician.reviewCount})</td>
                    <td>\${optician.services.slice(0, 2).join(', ')}\${optician.services.length > 2 ? '...' : ''}</td>
                \`;
            });
            
            document.getElementById('opticians-table').style.display = 'table';
        }

        async function loadEmailLogs() {
            document.getElementById('emails-loading').style.display = 'block';
            try {
                const response = await fetch('/api/admin/emails');
                const data = await response.json();
                if (data.success) {
                    displayEmailLogs(data.emailLogs);
                }
            } catch (error) {
                console.error('Failed to load email logs:', error);
            }
            document.getElementById('emails-loading').style.display = 'none';
        }

        function displayEmailLogs(logs) {
            const tbody = document.getElementById('emails-tbody');
            tbody.innerHTML = '';
            
            logs.forEach(log => {
                const row = tbody.insertRow();
                row.innerHTML = \`
                    <td>\${log.email_type}</td>
                    <td>\${new Date(log.sent_at).toLocaleString()}</td>
                    <td>\${log.delivery_status}</td>
                    <td>\${log.subject_line || '-'}</td>
                \`;
            });
            
            document.getElementById('emails-table').style.display = 'table';
        }

        async function viewCustomer(consentId) {
            try {
                const response = await fetch(\`/api/admin/customers/\${consentId}\`);
                const data = await response.json();
                if (data.success) {
                    showModal(\`
                        <h3>Customer Data: \${consentId.substring(0, 8)}...</h3>
                        <div class="json">\${JSON.stringify(data.customer, null, 2)}</div>
                    \`);
                }
            } catch (error) {
                alert('Failed to load customer data: ' + error.message);
            }
        }

        async function viewAuditLog(consentId) {
            try {
                const response = await fetch(\`/api/admin/audit/\${consentId}\`);
                const data = await response.json();
                if (data.success) {
                    showModal(\`
                        <h3>GDPR Audit Log: \${consentId.substring(0, 8)}...</h3>
                        <div class="json">\${JSON.stringify(data.auditLog, null, 2)}</div>
                    \`);
                }
            } catch (error) {
                alert('Failed to load audit log: ' + error.message);
            }
        }

        async function seedOpticians() {
            try {
                const response = await fetch('/api/opticians/seed', { method: 'POST' });
                const data = await response.json();
                alert(data.message || 'Opticians seeded successfully');
                loadOpticians();
                loadStats();
            } catch (error) {
                alert('Failed to seed opticians: ' + error.message);
            }
        }

        async function cleanupExpiredData() {
            try {
                const response = await fetch('/api/admin/cleanup-test-data', { method: 'POST' });
                const data = await response.json();
                alert(data.message);
                loadCustomers();
                loadStats();
            } catch (error) {
                alert('Failed to cleanup data: ' + error.message);
            }
        }

        async function testEmailConfig() {
            try {
                const response = await fetch('/api/email/test', { method: 'POST' });
                const data = await response.json();
                showModal(\`
                    <h3>Email Configuration Test</h3>
                    <div class="json">\${JSON.stringify(data, null, 2)}</div>
                \`);
            } catch (error) {
                alert('Email test failed: ' + error.message);
            }
        }

        function showApiTests() {
            showModal(\`
                <h3>API Testing Examples</h3>
                <h4>Submit Quiz Data:</h4>
                <pre>curl -X POST http://localhost:3001/api/customers/quiz-submit \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe", 
    "zipCode": "10001",
    "consentGiven": true,
    "quizAnswers": {"age": "25-35", "glasses": "Yes"},
    "aiInsights": {"headline": "Test insight"}
  }'</pre>
                
                <h4>Search Opticians:</h4>
                <pre>curl http://localhost:3001/api/opticians/search?zipCode=10001</pre>
                
                <h4>Export Customer Data:</h4>
                <pre>curl http://localhost:3001/api/gdpr/export-data/[CONSENT_ID]</pre>
                
                <h4>Request Data Deletion:</h4>
                <pre>curl -X POST http://localhost:3001/api/gdpr/request-deletion \\
  -H "Content-Type: application/json" \\
  -d '{"consentId": "[CONSENT_ID]", "reason": "Test deletion"}'</pre>
            \`);
        }

        function showTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('[id^="tab-"]').forEach(tab => {
                tab.style.display = 'none';
            });
            
            // Remove active class from all tab buttons
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(\`tab-\${tabName}\`).style.display = 'block';
            event.target.classList.add('active');
            
            // Load data for the tab
            if (tabName === 'customers' && currentCustomers.length === 0) {
                loadCustomers();
            } else if (tabName === 'opticians') {
                loadOpticians();
            } else if (tabName === 'emails') {
                loadEmailLogs();
            }
        }

        function showModal(content) {
            document.getElementById('modal-body').innerHTML = content;
            document.getElementById('modal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }

        // Initialize
        loadStats();
        loadCustomers();
    </script>
</body>
</html>
    `;
}

module.exports = router;