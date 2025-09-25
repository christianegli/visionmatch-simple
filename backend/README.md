# VisionMatch Backend

GDPR-compliant backend service for the VisionMatch quiz application with customer data management, optician directory, and email services.

## Features

### 🔒 GDPR Compliance
- **Data Encryption**: All personal data encrypted at rest using AES-256-GCM
- **Consent Management**: Granular consent tracking and management
- **Right to be Forgotten**: Data deletion with grace periods
- **Data Portability**: Export customer data in JSON format
- **Audit Trail**: Complete logging of all data processing activities
- **Data Retention**: Automatic cleanup of expired data

### 📊 Customer Management
- Quiz data submission with consent validation
- Secure customer data storage and retrieval
- Profile updates with audit logging
- Appointment booking integration

### 🏥 Optician Directory
- Search opticians by zip code and radius
- Detailed optician profiles with services and specialties
- Rating and review integration ready
- Dummy data for development and testing

### 📧 Email Services
- GDPR-compliant email templates
- Quiz results delivery
- Appointment confirmations
- Unsubscribe management
- Support for SendGrid and SMTP

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Initialize Database (First Time)**
   ```bash
   # The database will be created automatically
   # To seed opticians data:
   curl -X POST http://localhost:3001/api/opticians/seed
   ```

## Configuration

### Required Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=development

# Database  
DATABASE_PATH=./data/visionmatch.db
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Email (choose one)
SENDGRID_API_KEY=your-sendgrid-api-key
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

FROM_EMAIL=noreply@visionmatch.com
FROM_NAME=VisionMatch

# CORS
FRONTEND_URL=http://localhost:8080
```

## API Endpoints

### Customer Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customers/quiz-submit` | Submit quiz data with GDPR consent |
| PUT | `/api/customers/:consentId` | Update customer data |
| GET | `/api/customers/:consentId` | Get customer data |
| POST | `/api/customers/:consentId/book-appointment` | Book eye exam appointment |

### GDPR Compliance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gdpr/request-deletion` | Request data deletion |
| POST | `/api/gdpr/cancel-deletion` | Cancel deletion request |
| GET | `/api/gdpr/export-data/:consentId` | Export customer data |
| GET | `/api/gdpr/audit-log/:consentId` | Get GDPR audit log |
| POST | `/api/gdpr/update-consent` | Update consent preferences |
| GET | `/api/gdpr/consent-status/:consentId` | Get consent status |

### Opticians Directory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/opticians/search?zipCode=12345` | Search opticians by location |
| GET | `/api/opticians` | Get all opticians |
| GET | `/api/opticians/:id` | Get optician details |
| GET | `/api/opticians/meta/services` | Get available services |
| POST | `/api/opticians/seed` | Seed database (dev only) |

### Email Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/email/resend-quiz-results` | Resend quiz results email |
| POST | `/api/email/appointment-reminder` | Send appointment reminder |
| GET | `/api/email/status/:consentId` | Get email delivery status |
| POST | `/api/email/unsubscribe` | Unsubscribe from emails |
| POST | `/api/email/test` | Test email configuration (dev only) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health status |

## Database Schema

### Customer Data (Encrypted)
- **Personal Information**: Email, name, zip code (encrypted)
- **Consent Management**: Consent ID, purposes, timestamps
- **Quiz Data**: Answers and AI insights (JSON)
- **Data Lifecycle**: Retention dates, deletion scheduling

### Opticians Directory
- **Business Information**: Name, address, contact details
- **Services**: Array of offered services
- **Specialties**: Medical specialties and focus areas
- **Ratings**: Customer ratings and review counts

### Audit Logs
- **GDPR Actions**: All data processing activities
- **Email Logs**: Delivery tracking with hashed recipients
- **Consent History**: Changes to consent preferences

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers for all responses
- **CORS**: Configured for frontend domain only
- **Input Validation**: All inputs validated and sanitized
- **Error Handling**: Secure error responses without data leakage

## GDPR Compliance Details

### Legal Basis
- **Consent**: Primary basis for quiz data processing
- **Legitimate Interest**: For service improvement (anonymized data)

### Data Subject Rights
- ✅ Right to Access (GET /api/customers/:consentId)
- ✅ Right to Rectification (PUT /api/customers/:consentId)
- ✅ Right to Erasure (POST /api/gdpr/request-deletion)
- ✅ Right to Data Portability (GET /api/gdpr/export-data/:consentId)
- ✅ Right to Object (POST /api/gdpr/update-consent)
- ✅ Right to Withdraw Consent (POST /api/gdpr/update-consent)

### Data Retention
- **Default Retention**: 3 years from collection
- **Grace Period**: 30 days for deletion requests
- **Automatic Cleanup**: Scheduled job for expired data

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Database Seeding
```bash
# Seed opticians (development only)
curl -X POST http://localhost:3001/api/opticians/seed

# Test email configuration
curl -X POST http://localhost:3001/api/email/test
```

## Deployment

1. **Production Environment Variables**
   - Set NODE_ENV=production
   - Use strong encryption keys
   - Configure production email service
   - Set proper CORS origins

2. **Database Backup**
   - SQLite database in ./data/ directory
   - Implement regular backups for production

3. **Scheduled Jobs**
   - Set up cron job for data cleanup: `Customer.cleanupExpiredData()`
   - Monitor email delivery rates

## Support

For questions about GDPR compliance or technical implementation:
- Email: privacy@visionmatch.com
- Technical Support: dev@visionmatch.com

## License

MIT License - See LICENSE file for details.