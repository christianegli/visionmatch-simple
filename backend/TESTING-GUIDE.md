# 🧪 VisionMatch Backend Testing & Access Guide

Complete guide to testing the GDPR-compliant VisionMatch backend system with all available tools and interfaces.

## 🚀 Quick Start

1. **Start the Backend Server**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

2. **Verify Server is Running**
   ```bash
   curl http://localhost:3001/api/health
   ```

## 🎯 Testing Options

### 1. **Web Admin Panel** (Recommended)
**Best for: Visual data inspection, GDPR compliance verification**

- **URL**: http://localhost:3001/api/admin/panel
- **Login**: `admin` / `admin123` (set in .env as ADMIN_PASSWORD)
- **Features**:
  - Real-time database statistics
  - Customer data viewer (GDPR-compliant)
  - GDPR audit logs
  - Email delivery tracking
  - Opticians management
  - Admin tools for data cleanup

**Screenshots of what you'll see:**
- Dashboard with customer count, deletion requests, email statistics
- Encrypted customer data (shows data exists but protects privacy)
- Complete GDPR audit trail
- Email delivery logs

### 2. **Command Line Interface (CLI)**
**Best for: Database management, automated testing**

```bash
# Make CLI executable
chmod +x cli.js

# Show all available commands
node cli.js --help

# Database management
node cli.js db:init          # Initialize database
node cli.js db:seed          # Add test opticians
node cli.js db:stats         # Show database statistics
node cli.js db:cleanup       # Clean expired data

# Customer management
node cli.js customer:list    # List all customers (GDPR view)
node cli.js customer:view <consentId>   # View customer data
node cli.js customer:audit <consentId>  # View audit log
node cli.js customer:delete <consentId> # Request deletion

# Opticians
node cli.js opticians:list   # List all opticians
node cli.js opticians:search 10001  # Search by zip code

# Email testing
node cli.js email:test       # Test email configuration
node cli.js email:logs       # Show recent email logs

# Submit test data
node cli.js test:submit-quiz --email test@example.com
```

### 3. **Automated API Testing Scripts**

#### **Bash Script** (Unix/macOS/Linux)
```bash
chmod +x test-api.sh
./test-api.sh
```

#### **Python Script** (Cross-platform)
```bash
chmod +x test_api.py
python3 test_api.py
# or
./test_api.py
```

**Both scripts test:**
- Server health
- Opticians API (search, details, services)
- Quiz submission with GDPR consent
- Customer data access and updates
- GDPR compliance (data export, audit logs)
- Email services
- Data deletion procedures

### 4. **Manual API Testing with cURL**

#### **Submit Test Quiz Data:**
```bash
curl -X POST http://localhost:3001/api/customers/quiz-submit \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "zipCode": "10001",
    "consentGiven": true,
    "quizAnswers": {
      "age": "26-35",
      "gender": "Male",
      "glasses": "Yes, I wear glasses",
      "screenTime": "6-8 hours",
      "symptoms": ["Eye strain", "Headaches"]
    },
    "aiInsights": {
      "headline": "Screen Time Analysis",
      "insight": "Your 6-8 hours of screen time may be causing eye strain."
    }
  }'
```

#### **Search Opticians:**
```bash
curl http://localhost:3001/api/opticians/search?zipCode=10001
```

#### **Export Customer Data (GDPR):**
```bash
# Use consent ID from quiz submission response
curl http://localhost:3001/api/gdpr/export-data/[CONSENT_ID]
```

## 🔍 What You'll See During Testing

### **Database Structure**
- **Encrypted Personal Data**: Email, names, zip codes stored encrypted
- **Consent Tracking**: Every action logged with timestamps and IP addresses
- **Audit Trail**: Complete GDPR compliance history
- **Data Retention**: Automatic expiration dates set on all customer data

### **GDPR Compliance in Action**
1. **Consent Management**: Clear consent IDs for tracking
2. **Data Encryption**: All PII encrypted with AES-256
3. **Access Logging**: Every data access logged
4. **Right to be Forgotten**: 30-day grace period for deletions
5. **Data Portability**: JSON export of all customer data
6. **Consent Withdrawal**: Granular permission updates

### **Email Integration**
- **Professional Templates**: HTML emails with health reminders
- **Delivery Tracking**: Hashed recipient tracking for privacy
- **GDPR Compliance**: Unsubscribe links and consent references
- **Multiple Providers**: SendGrid or SMTP support

## 📊 Key Features to Test

### **Customer Journey**
1. Submit quiz with GDPR consent ✅
2. Receive personalized email with results ✅
3. Search for local opticians ✅
4. Book appointment ✅
5. Access/update personal data anytime ✅
6. Request data deletion if needed ✅

### **Privacy Protection**
- All personal data encrypted in database
- No plaintext emails or names stored
- Consent tracked with legal basis
- Audit trail for all data processing
- Automatic data expiration

### **Business Operations**
- Optician directory with search
- Email delivery tracking
- Customer consent management
- GDPR compliance reporting
- Data cleanup automation

## 🛠️ Troubleshooting

### **Server Won't Start**
```bash
# Check if port is in use
lsof -i :3001

# Check environment variables
cat .env

# Check database directory exists
ls -la data/
```

### **Email Not Working**
```bash
# Test email configuration
node cli.js email:test

# Check environment variables
echo $SENDGRID_API_KEY
echo $SMTP_HOST
```

### **Database Issues**
```bash
# Reinitialize database
rm data/visionmatch.db
node cli.js db:init
node cli.js db:seed
```

### **Authentication Issues**
```bash
# Admin panel authentication
# Username: admin
# Password: admin123 (or ADMIN_PASSWORD from .env)
```

## 📈 Performance Testing

### **Load Testing with Apache Bench**
```bash
# Test quiz submission endpoint
ab -n 100 -c 10 -T 'application/json' \
   -p quiz-data.json \
   http://localhost:3001/api/customers/quiz-submit

# Test optician search
ab -n 1000 -c 50 \
   http://localhost:3001/api/opticians/search?zipCode=10001
```

### **Database Performance**
```bash
# Check database size
ls -lh data/visionmatch.db

# Get detailed stats
node cli.js db:stats
```

## 🔒 Security Testing

### **GDPR Compliance Verification**
1. ✅ Data encryption at rest
2. ✅ Consent tracking and withdrawal
3. ✅ Right to be forgotten (30-day grace period)
4. ✅ Data portability (JSON export)
5. ✅ Access logging and audit trails
6. ✅ Data retention limits
7. ✅ Secure data deletion

### **API Security**
- Rate limiting (100 requests/15 minutes)
- Input validation and sanitization
- CORS protection
- Helmet security headers
- No sensitive data in error messages

## 🎯 Next Steps After Testing

1. **Configure Email Service**: Set up SendGrid or SMTP
2. **Set Strong Encryption Key**: Generate 32-character key for production
3. **Configure CORS**: Set proper frontend URLs
4. **Set Up Monitoring**: Track API usage and errors
5. **Schedule Data Cleanup**: Automate GDPR compliance tasks
6. **Deploy to Production**: Use environment-specific configurations

## 📞 Support

If you encounter any issues:
1. Check the logs in the terminal where you started the server
2. Review the TESTING-GUIDE.md troubleshooting section
3. Use the admin panel to inspect data and system status
4. Test with the CLI tool for detailed debugging

**Remember**: This system demonstrates full GDPR compliance with real encryption and audit trails. All customer data is protected even during testing!