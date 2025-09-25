/**
 * Frontend Integration Examples for VisionMatch Backend
 * 
 * This file shows how to integrate the backend APIs with your frontend quiz application.
 * Replace the existing hardcoded data handling with these API calls.
 */

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api';

/**
 * Submit quiz data to backend (replaces current form submission)
 */
async function submitQuizData(quizData) {
    try {
        const response = await fetch(`${BACKEND_URL}/customers/quiz-submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Personal data
                email: quizData.email,
                firstName: quizData.firstName,
                lastName: quizData.lastName,
                zipCode: quizData.zipCode,
                
                // GDPR consent (required)
                consentGiven: true,
                
                // Quiz data
                quizAnswers: quizData.answers, // The full answers object from your quiz
                aiInsights: quizData.aiInsights // Generated AI insights
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Store consent ID for future API calls
            localStorage.setItem('visionmatch_consent_id', result.consentId);
            
            console.log('Quiz submitted successfully!');
            console.log('Consent ID:', result.consentId);
            console.log('Data retention until:', result.dataRetentionUntil);
            
            return {
                success: true,
                consentId: result.consentId,
                emailSent: result.emailSent
            };
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Quiz submission failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get opticians by zip code (replaces hardcoded optician list)
 */
async function getOpticiansByZip(zipCode) {
    try {
        const response = await fetch(`${BACKEND_URL}/opticians/search?zipCode=${zipCode}&radius=50`);
        const result = await response.json();
        
        if (result.success) {
            return result.opticians;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Failed to fetch opticians:', error);
        return [];
    }
}

/**
 * Book appointment with optician
 */
async function bookAppointment(appointmentData) {
    const consentId = localStorage.getItem('visionmatch_consent_id');
    
    if (!consentId) {
        throw new Error('No consent ID found. Please complete the quiz first.');
    }

    try {
        const response = await fetch(`${BACKEND_URL}/customers/${consentId}/book-appointment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Consent-ID': consentId
            },
            body: JSON.stringify({
                opticianId: appointmentData.opticianId,
                preferredDate: appointmentData.date,
                preferredTime: appointmentData.time,
                notes: appointmentData.notes
            })
        });

        const result = await response.json();
        
        if (result.success) {
            return result.appointment;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Appointment booking failed:', error);
        throw error;
    }
}

/**
 * Request data deletion (GDPR Right to be Forgotten)
 */
async function requestDataDeletion(reason = '') {
    const consentId = localStorage.getItem('visionmatch_consent_id');
    
    if (!consentId) {
        throw new Error('No consent ID found.');
    }

    try {
        const response = await fetch(`${BACKEND_URL}/gdpr/request-deletion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                consentId: consentId,
                reason: reason,
                immediateDelete: false // 30-day grace period
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Data deletion requested successfully');
            return result;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Data deletion request failed:', error);
        throw error;
    }
}

/**
 * Export user data (GDPR Right to Data Portability)
 */
async function exportUserData() {
    const consentId = localStorage.getItem('visionmatch_consent_id');
    
    if (!consentId) {
        throw new Error('No consent ID found.');
    }

    try {
        const response = await fetch(`${BACKEND_URL}/gdpr/export-data/${consentId}`);
        const result = await response.json();
        
        if (result.success || result.exportInfo) {
            // Create downloadable file
            const dataStr = JSON.stringify(result, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `visionmatch-data-export-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            return result;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Data export failed:', error);
        throw error;
    }
}

/**
 * Check GDPR consent status
 */
async function getConsentStatus() {
    const consentId = localStorage.getItem('visionmatch_consent_id');
    
    if (!consentId) {
        return null;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/gdpr/consent-status/${consentId}`);
        const result = await response.json();
        
        return result.success ? result.consent : null;
    } catch (error) {
        console.error('Failed to get consent status:', error);
        return null;
    }
}

// Example usage in your quiz application:

/*
// Replace your existing quiz submission code with:
document.getElementById('submit-quiz').addEventListener('click', async () => {
    const quizData = {
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        zipCode: document.getElementById('zipCode').value,
        answers: window.quizAnswers, // Your existing answers object
        aiInsights: window.aiInsights // Your generated insights
    };
    
    const result = await submitQuizData(quizData);
    
    if (result.success) {
        // Show success message
        alert('Quiz submitted! Check your email for results.');
        
        // Load opticians for their area
        const opticians = await getOpticiansByZip(quizData.zipCode);
        displayOpticians(opticians);
    } else {
        alert('Submission failed: ' + result.error);
    }
});

// Replace hardcoded optician data with API call:
async function displayOpticians(opticians) {
    const container = document.getElementById('opticians-list');
    container.innerHTML = '';
    
    opticians.forEach(optician => {
        const div = document.createElement('div');
        div.innerHTML = `
            <h3>${optician.name}</h3>
            <p>${optician.address}, ${optician.city}, ${optician.state} ${optician.zipCode}</p>
            <p>Phone: ${optician.phone}</p>
            <p>Rating: ${optician.rating} (${optician.reviewCount} reviews)</p>
            <p>Services: ${optician.services.join(', ')}</p>
            <button onclick="bookWithOptician(${optician.id})">Book Appointment</button>
        `;
        container.appendChild(div);
    });
}

// Add GDPR compliance buttons to your page:
function addGdprControls() {
    const gdprDiv = document.createElement('div');
    gdprDiv.innerHTML = `
        <h3>Your Data Rights</h3>
        <button onclick="exportUserData()">Download My Data</button>
        <button onclick="requestDataDeletion('No longer needed')">Delete My Data</button>
        <button onclick="showConsentStatus()">View My Consent Status</button>
    `;
    document.body.appendChild(gdprDiv);
}

async function showConsentStatus() {
    const status = await getConsentStatus();
    if (status) {
        alert(`Consent Status: ${status.consentGiven ? 'Active' : 'Withdrawn'}\nData Retention Until: ${status.dataRetentionUntil}`);
    } else {
        alert('No consent record found.');
    }
}
*/

// Export functions for use in your application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        submitQuizData,
        getOpticiansByZip,
        bookAppointment,
        requestDataDeletion,
        exportUserData,
        getConsentStatus
    };
}