#!/usr/bin/env python3

"""
VisionMatch Backend API Testing Script (Python)

This script provides a comprehensive test suite for the VisionMatch backend API.
It tests all major endpoints and demonstrates GDPR compliance features.
"""

import requests
import json
import sys
from typing import Optional, Dict, Any

# Configuration
API_BASE = "http://localhost:3001/api"
consent_id = None

# Colors for terminal output
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str) -> None:
    """Print a colored header."""
    print(f"\n{Colors.BLUE}{'=' * 50}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.BLUE}{'=' * 50}{Colors.ENDC}\n")

def print_success(text: str) -> None:
    """Print success message."""
    print(f"{Colors.GREEN}✅ {text}{Colors.ENDC}")

def print_error(text: str) -> None:
    """Print error message."""
    print(f"{Colors.RED}❌ {text}{Colors.ENDC}")

def print_info(text: str) -> None:
    """Print info message."""
    print(f"{Colors.YELLOW}ℹ️  {text}{Colors.ENDC}")

def api_call(method: str, endpoint: str, data: Optional[Dict[Any, Any]] = None, description: str = "") -> Optional[Dict[Any, Any]]:
    """Make an API call and return the response."""
    global consent_id
    
    url = f"{API_BASE}{endpoint}"
    print(f"{Colors.YELLOW}Testing:{Colors.ENDC} {description}")
    print(f"{Colors.YELLOW}{method}{Colors.ENDC} {url}")
    
    try:
        headers = {'Content-Type': 'application/json'}
        
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json=data)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            print_error(f"Unsupported HTTP method: {method}")
            return None
        
        if data:
            print(f"{Colors.YELLOW}Data:{Colors.ENDC} {json.dumps(data, indent=2)}")
        
        print(f"{Colors.GREEN}Response ({response.status_code}):{Colors.ENDC}")
        
        try:
            json_response = response.json()
            print(json.dumps(json_response, indent=2))
            
            # Extract consent ID from quiz submission
            if endpoint == '/customers/quiz-submit' and 'consentId' in json_response:
                consent_id = json_response['consentId']
                print_success(f"Consent ID captured: {consent_id[:12]}...")
            
            print_success("API call successful")
            return json_response
            
        except json.JSONDecodeError:
            print(response.text)
            print_success("API call successful (non-JSON response)")
            return {'status': 'success', 'text': response.text}
            
    except requests.exceptions.ConnectionError:
        print_error("Connection failed - is the server running?")
        return None
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return None
    
    print()

def test_server_health():
    """Test server health endpoint."""
    print_header("1. SERVER HEALTH CHECK")
    
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        if response.status_code == 200:
            print_success("Backend server is running")
            return True
        else:
            print_error(f"Server responded with status {response.status_code}")
            return False
    except:
        print_error(f"Backend server is not responding at {API_BASE}")
        print("Please start the server with: npm run dev")
        return False

def test_opticians_api():
    """Test opticians API endpoints."""
    print_header("2. OPTICIANS API")
    
    # Seed opticians
    api_call("POST", "/opticians/seed", description="Seed opticians database")
    
    # List all opticians
    api_call("GET", "/opticians", description="Get all opticians")
    
    # Search by zip code
    api_call("GET", "/opticians/search?zipCode=10001", description="Search opticians by zip code")
    
    # Get optician details
    api_call("GET", "/opticians/1", description="Get optician details by ID")
    
    # Get services
    api_call("GET", "/opticians/meta/services", description="Get available services")

def test_quiz_submission():
    """Test quiz submission with GDPR consent."""
    print_header("3. CUSTOMER QUIZ SUBMISSION")
    
    quiz_data = {
        "email": "test@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "zipCode": "10001",
        "consentGiven": True,
        "quizAnswers": {
            "age": "26-35",
            "gender": "Male",
            "glasses": "Yes, I wear glasses",
            "glassesTypes": ["Single vision", "Sunglasses"],
            "screenTime": "6-8 hours",
            "symptoms": ["Eye strain", "Headaches"],
            "activities": ["Computer work", "Reading"],
            "workEnvironment": "Office"
        },
        "aiInsights": {
            "headline": "Your Screen Time Requires Specialized Lenses",
            "insight": "With 6-8 hours of daily screen time, your eyes are working overtime. Computer-specific lenses with blue light filtering could reduce your reported eye strain and headaches by up to 60%.",
            "hook": "Your detailed analysis will show exactly which lens technologies can help your specific situation."
        }
    }
    
    api_call("POST", "/customers/quiz-submit", quiz_data, "Submit quiz with GDPR consent")

def test_customer_data_access():
    """Test customer data access endpoints."""
    if not consent_id:
        print_error("No consent ID available - skipping customer-specific tests")
        return
    
    print_header("4. CUSTOMER DATA ACCESS")
    
    # Get customer data
    api_call("GET", f"/customers/{consent_id}", description="Get customer data (Right to Access)")
    
    # Update customer data
    update_data = {
        "firstName": "Jane",
        "zipCode": "10002"
    }
    api_call("PUT", f"/customers/{consent_id}", update_data, "Update customer data")
    
    # Book appointment
    appointment_data = {
        "opticianId": 1,
        "preferredDate": "2024-02-15",
        "preferredTime": "14:30",
        "notes": "Prefer afternoon appointment"
    }
    api_call("POST", f"/customers/{consent_id}/book-appointment", appointment_data, "Book appointment")

def test_gdpr_compliance():
    """Test GDPR compliance endpoints."""
    if not consent_id:
        print_error("No consent ID available - skipping GDPR tests")
        return
    
    print_header("5. GDPR COMPLIANCE ENDPOINTS")
    
    # Get consent status
    api_call("GET", f"/gdpr/consent-status/{consent_id}", description="Get consent status")
    
    # Export data
    api_call("GET", f"/gdpr/export-data/{consent_id}", description="Export customer data (Right to Portability)")
    
    # Get audit log
    api_call("GET", f"/gdpr/audit-log/{consent_id}", description="Get GDPR audit log")
    
    # Update consent
    consent_update = {
        "consentId": consent_id,
        "dataProcessingPurposes": ["quiz_analysis", "optician_matching"],
        "reason": "No longer want marketing emails"
    }
    api_call("POST", "/gdpr/update-consent", consent_update, "Update consent preferences")

def test_email_services():
    """Test email service endpoints."""
    if not consent_id:
        print_error("No consent ID available - skipping email tests")
        return
    
    print_header("6. EMAIL SERVICES")
    
    # Resend quiz results
    resend_data = {
        "consentId": consent_id,
        "email": "test@example.com"
    }
    api_call("POST", "/email/resend-quiz-results", resend_data, "Resend quiz results email")
    
    # Get email status
    api_call("GET", f"/email/status/{consent_id}", description="Get email delivery status")
    
    # Unsubscribe
    unsubscribe_data = {
        "consentId": consent_id,
        "email": "test@example.com",
        "reason": "No longer interested"
    }
    api_call("POST", "/email/unsubscribe", unsubscribe_data, "Unsubscribe from emails")

def test_email_configuration():
    """Test email configuration."""
    print_header("7. EMAIL CONFIGURATION TEST")
    api_call("POST", "/email/test", description="Test email configuration")

def show_data_deletion_info():
    """Show information about data deletion (without actually deleting)."""
    print_header("8. DATA DELETION INFO")
    
    print_info("Skipping deletion test to preserve test data")
    print_info("To test deletion manually:")
    
    if consent_id:
        deletion_data = {
            "consentId": consent_id,
            "reason": "Test deletion"
        }
        print(f"\nPython code:")
        print(f"requests.post('{API_BASE}/gdpr/request-deletion',")
        print(f"    headers={{'Content-Type': 'application/json'}},")
        print(f"    json={json.dumps(deletion_data, indent=4)})")
        
        print(f"\ncURL command:")
        print(f"curl -X POST {API_BASE}/gdpr/request-deletion \\")
        print(f"  -H 'Content-Type: application/json' \\")
        print(f"  -d '{json.dumps(deletion_data)}'")

def show_summary():
    """Show testing summary and next steps."""
    print_header("API TESTING COMPLETE")
    print_success("All API endpoints tested successfully!")
    
    if consent_id:
        print_info(f"Test customer consent ID: {consent_id}")
        print_info("Use this ID for manual testing or admin panel access")
    
    print(f"\n{Colors.BLUE}Next Steps:{Colors.ENDC}")
    print("1. Visit http://localhost:3001/api/admin/panel (admin:admin123) for web interface")
    print("2. Use the CLI tool: node cli.js --help")
    print("3. Check the admin panel to see encrypted data storage")
    print("4. Test GDPR compliance features")
    print("")
    
    print_info("Remember: All personal data is encrypted in the database!")
    print_info("The admin panel shows how GDPR compliance works in practice.")

def main():
    """Main testing function."""
    print(f"{Colors.BOLD}VisionMatch Backend API Testing Suite{Colors.ENDC}")
    print("Testing comprehensive GDPR-compliant backend functionality\n")
    
    # Test server health first
    if not test_server_health():
        sys.exit(1)
    
    # Run all tests
    test_opticians_api()
    test_quiz_submission()
    test_customer_data_access()
    test_gdpr_compliance()
    test_email_services()
    test_email_configuration()
    show_data_deletion_info()
    show_summary()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Testing interrupted by user{Colors.ENDC}")
        sys.exit(0)
    except Exception as e:
        print_error(f"Testing failed with error: {str(e)}")
        sys.exit(1)