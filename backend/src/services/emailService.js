const nodemailer = require('nodemailer');
const { db } = require('../models/database');
const { hash } = require('../utils/encryption');

class EmailService {
    constructor() {
        this.transporter = this.createTransporter();
    }

    /**
     * Create email transporter based on configuration
     */
    createTransporter() {
        if (process.env.SENDGRID_API_KEY) {
            // SendGrid configuration
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: 'apikey',
                    pass: process.env.SENDGRID_API_KEY
                }
            });
        } else if (process.env.SMTP_HOST) {
            // SMTP configuration
            return nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_PORT == 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            // Development mode - log emails instead of sending
            console.warn('No email configuration found. Running in development mode - emails will be logged only.');
            return nodemailer.createTransport({
                streamTransport: true,
                newline: 'unix',
                buffer: true
            });
        }
    }

    /**
     * Send quiz results email with GDPR compliance
     */
    async sendQuizResults(customerData, quizResults, aiInsights) {
        const emailHtml = this.generateQuizResultsEmail(customerData, quizResults, aiInsights);
        const emailText = this.generateQuizResultsText(customerData, quizResults, aiInsights);

        const mailOptions = {
            from: `${process.env.FROM_NAME || 'VisionMatch'} <${process.env.FROM_EMAIL || 'noreply@visionmatch.com'}>`,
            to: customerData.email,
            subject: `${customerData.firstName}, Your VisionMatch Results Are Ready! 👓`,
            html: emailHtml,
            text: emailText,
            headers: {
                'List-Unsubscribe': `<mailto:unsubscribe@visionmatch.com?subject=Unsubscribe-${customerData.consentId}>`,
                'X-Privacy-Policy': 'https://visionmatch.com/privacy'
            }
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            
            // Log email send for GDPR audit
            await this.logEmailSent(
                customerData.consentId,
                'quiz_results',
                customerData.email,
                mailOptions.subject,
                result.messageId
            );

            console.log(`Quiz results email sent to ${customerData.email}`);
            return result;
        } catch (error) {
            console.error('Error sending quiz results email:', error);
            throw error;
        }
    }

    /**
     * Send appointment confirmation email
     */
    async sendAppointmentConfirmation(customerData, appointmentDetails) {
        const emailHtml = this.generateAppointmentEmail(customerData, appointmentDetails);
        const emailText = this.generateAppointmentText(customerData, appointmentDetails);

        const mailOptions = {
            from: `${process.env.FROM_NAME || 'VisionMatch'} <${process.env.FROM_EMAIL || 'noreply@visionmatch.com'}>`,
            to: customerData.email,
            subject: `Eye Exam Confirmed: ${appointmentDetails.opticianName} - ${appointmentDetails.date}`,
            html: emailHtml,
            text: emailText
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            
            await this.logEmailSent(
                customerData.consentId,
                'appointment_confirmation',
                customerData.email,
                mailOptions.subject,
                result.messageId
            );

            console.log(`Appointment confirmation sent to ${customerData.email}`);
            return result;
        } catch (error) {
            console.error('Error sending appointment confirmation:', error);
            throw error;
        }
    }

    /**
     * Generate HTML email template for quiz results
     */
    generateQuizResultsEmail(customer, quizResults, aiInsights) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your VisionMatch Results</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
                .content { padding: 30px; }
                .insight-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
                .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
                .gdpr-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 6px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>👓 Your VisionMatch Results</h1>
                    <p>Hi ${customer.firstName}, your personalized vision analysis is ready!</p>
                </div>
                
                <div class="content">
                    <h2>Your Vision Profile Analysis</h2>
                    
                    ${aiInsights ? `
                    <div class="insight-box">
                        <h3>🎯 Key Insight</h3>
                        <p><strong>${aiInsights.headline || 'Personalized Recommendation'}</strong></p>
                        <p>${aiInsights.insight || 'Based on your responses, we have recommendations to improve your vision experience.'}</p>
                    </div>
                    ` : ''}
                    
                    <h3>📊 Your Quiz Summary</h3>
                    <p>We analyzed your responses about:</p>
                    <ul>
                        <li>Current eyewear situation</li>
                        <li>Daily activities and screen time</li>
                        <li>Vision symptoms and challenges</li>
                        <li>Lifestyle and preferences</li>
                    </ul>
                    
                    <div class="insight-box">
                        <h3>🏥 Important Health Reminder</h3>
                        <p>Regular comprehensive eye exams can detect early signs of serious conditions like glaucoma, diabetic retinopathy, macular degeneration, and even high blood pressure or diabetes before you notice any symptoms. Early detection helps preserve your vision and overall health.</p>
                    </div>
                    
                    <p>Your results suggest that a professional eye examination would help you optimize your vision setup for your specific needs.</p>
                    
                    <div style="text-align: center;">
                        <a href="https://visionmatch.com/opticians?zip=${customer.zipCode}&ref=${customer.consentId}" class="cta-button">
                            Find Eye Care Professionals Near You
                        </a>
                    </div>
                    
                    <div class="gdpr-notice">
                        <strong>Privacy & Data:</strong> This email contains your personal vision analysis. We process your data based on your consent to provide these results. You can request data deletion or updates at any time by replying to this email or visiting our privacy center.
                    </div>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} VisionMatch. Helping you see clearly.</p>
                    <p>
                        <a href="https://visionmatch.com/privacy">Privacy Policy</a> |
                        <a href="mailto:unsubscribe@visionmatch.com?subject=Unsubscribe-${customer.consentId}">Unsubscribe</a> |
                        <a href="https://visionmatch.com/contact">Contact Us</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Generate plain text version of quiz results email
     */
    generateQuizResultsText(customer, quizResults, aiInsights) {
        return `
VisionMatch - Your Vision Analysis Results

Hi ${customer.firstName},

Your personalized vision analysis is ready!

${aiInsights ? `
KEY INSIGHT: ${aiInsights.headline || 'Personalized Recommendation'}
${aiInsights.insight || 'Based on your responses, we have recommendations to improve your vision experience.'}
` : ''}

YOUR QUIZ SUMMARY:
We analyzed your responses about:
- Current eyewear situation
- Daily activities and screen time  
- Vision symptoms and challenges
- Lifestyle and preferences

IMPORTANT HEALTH REMINDER:
Regular comprehensive eye exams can detect early signs of serious conditions like glaucoma, diabetic retinopathy, macular degeneration, and even high blood pressure or diabetes before you notice any symptoms.

Find eye care professionals near you:
https://visionmatch.com/opticians?zip=${customer.zipCode}&ref=${customer.consentId}

PRIVACY NOTICE: This email contains your personal vision analysis. We process your data based on your consent. You can request data deletion or updates by replying to this email.

© ${new Date().getFullYear()} VisionMatch
Privacy Policy: https://visionmatch.com/privacy
Unsubscribe: mailto:unsubscribe@visionmatch.com?subject=Unsubscribe-${customer.consentId}
        `;
    }

    /**
     * Generate appointment confirmation email HTML
     */
    generateAppointmentEmail(customer, appointment) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Eye Exam Confirmed</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f8f9fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { background: #10b981; color: white; padding: 30px 20px; text-align: center; }
                .content { padding: 30px; }
                .appointment-details { background: #ecfdf5; border: 1px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Eye Exam Confirmed!</h1>
                    <p>Your appointment is all set, ${customer.firstName}</p>
                </div>
                
                <div class="content">
                    <div class="appointment-details">
                        <h3>📅 Appointment Details</h3>
                        <p><strong>Practice:</strong> ${appointment.opticianName}</p>
                        <p><strong>Date & Time:</strong> ${appointment.date}</p>
                        <p><strong>Address:</strong> ${appointment.address}</p>
                        <p><strong>Phone:</strong> ${appointment.phone}</p>
                    </div>
                    
                    <h3>What to Expect</h3>
                    <ul>
                        <li>Comprehensive eye examination</li>
                        <li>Discussion of your VisionMatch results</li>
                        <li>Personalized recommendations</li>
                        <li>Free lens upgrade consultation (if applicable)</li>
                    </ul>
                    
                    <p><strong>What to Bring:</strong></p>
                    <ul>
                        <li>Current glasses and/or contact lenses</li>
                        <li>Insurance card</li>
                        <li>List of current medications</li>
                        <li>This email confirmation</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>Need to reschedule? Contact ${appointment.opticianName} directly at ${appointment.phone}</p>
                    <p>© ${new Date().getFullYear()} VisionMatch</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Generate appointment confirmation text
     */
    generateAppointmentText(customer, appointment) {
        return `
Eye Exam Confirmed!

Hi ${customer.firstName},

Your eye exam appointment is confirmed:

APPOINTMENT DETAILS:
Practice: ${appointment.opticianName}
Date & Time: ${appointment.date}
Address: ${appointment.address}
Phone: ${appointment.phone}

WHAT TO BRING:
- Current glasses and/or contact lenses
- Insurance card
- List of current medications
- This confirmation

Need to reschedule? Contact the practice directly at ${appointment.phone}

© ${new Date().getFullYear()} VisionMatch
        `;
    }

    /**
     * Log email send for GDPR compliance
     */
    async logEmailSent(consentId, emailType, recipientEmail, subject, messageId) {
        return new Promise((resolve, reject) => {
            const recipientHash = hash(recipientEmail);
            
            db.run(
                `INSERT INTO email_logs 
                 (customer_consent_id, email_type, recipient_hash, subject_line, email_provider_id) 
                 VALUES (?, ?, ?, ?, ?)`,
                [consentId, emailType, recipientHash, subject, messageId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    /**
     * Test email configuration
     */
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service connection verified successfully');
            return true;
        } catch (error) {
            console.error('Email service connection failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();