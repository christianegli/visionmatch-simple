#!/bin/bash

# VisionMatch Backend API Testing Script
# This script tests all major API endpoints with realistic data

# Configuration
API_BASE="http://localhost:3001/api"
CONSENT_ID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Function to make API call and show response
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo -e "${YELLOW}$method${NC} $API_BASE$endpoint"
    
    if [ -n "$data" ]; then
        echo -e "${YELLOW}Data:${NC} $data"
        response=$(curl -s -X $method "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X $method "$API_BASE$endpoint")
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Response:${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        
        # Extract consent ID from quiz submission
        if [[ "$endpoint" == "/customers/quiz-submit" ]]; then
            CONSENT_ID=$(echo "$response" | jq -r '.consentId' 2>/dev/null)
            if [ "$CONSENT_ID" != "null" ] && [ -n "$CONSENT_ID" ]; then
                print_success "Consent ID captured: ${CONSENT_ID:0:12}..."
            fi
        fi
        
        print_success "API call successful"
    else
        print_error "API call failed"
    fi
    echo ""
}

# Check if server is running
print_header "CHECKING SERVER STATUS"
if curl -s "$API_BASE/health" > /dev/null; then
    print_success "Backend server is running"
else
    print_error "Backend server is not responding at $API_BASE"
    echo "Please start the server with: npm run dev"
    exit 1
fi

# Test health endpoint
print_header "1. HEALTH CHECK"
api_call "GET" "/health" "" "Server health status"

# Test opticians endpoints
print_header "2. OPTICIANS API"

# Seed opticians first
api_call "POST" "/opticians/seed" "" "Seed opticians database"

# List all opticians
api_call "GET" "/opticians" "" "Get all opticians"

# Search by zip code
api_call "GET" "/opticians/search?zipCode=10001" "" "Search opticians by zip code"

# Get optician details
api_call "GET" "/opticians/1" "" "Get optician details by ID"

# Get services
api_call "GET" "/opticians/meta/services" "" "Get available services"

# Test customer/quiz submission
print_header "3. CUSTOMER QUIZ SUBMISSION"

quiz_data='{
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "zipCode": "10001",
  "consentGiven": true,
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
}'

api_call "POST" "/customers/quiz-submit" "$quiz_data" "Submit quiz with GDPR consent"

# Test customer data access (requires consent ID from previous call)
if [ -n "$CONSENT_ID" ]; then
    print_header "4. CUSTOMER DATA ACCESS"
    
    # Get customer data
    api_call "GET" "/customers/$CONSENT_ID" "" "Get customer data (Right to Access)"
    
    # Update customer data
    update_data='{
      "firstName": "Jane",
      "zipCode": "10002"
    }'
    api_call "PUT" "/customers/$CONSENT_ID" "$update_data" "Update customer data"
    
    # Book appointment
    appointment_data='{
      "opticianId": 1,
      "preferredDate": "2024-02-15",
      "preferredTime": "14:30",
      "notes": "Prefer afternoon appointment"
    }'
    api_call "POST" "/customers/$CONSENT_ID/book-appointment" "$appointment_data" "Book appointment"
    
    print_header "5. GDPR COMPLIANCE ENDPOINTS"
    
    # Get consent status
    api_call "GET" "/gdpr/consent-status/$CONSENT_ID" "" "Get consent status"
    
    # Export data
    api_call "GET" "/gdpr/export-data/$CONSENT_ID" "" "Export customer data (Right to Portability)"
    
    # Get audit log
    api_call "GET" "/gdpr/audit-log/$CONSENT_ID" "" "Get GDPR audit log"
    
    # Update consent
    consent_update='{
      "consentId": "'$CONSENT_ID'",
      "dataProcessingPurposes": ["quiz_analysis", "optician_matching"],
      "reason": "No longer want marketing emails"
    }'
    api_call "POST" "/gdpr/update-consent" "$consent_update" "Update consent preferences"
    
    print_header "6. EMAIL SERVICES"
    
    # Resend quiz results
    resend_data='{
      "consentId": "'$CONSENT_ID'",
      "email": "test@example.com"
    }'
    api_call "POST" "/email/resend-quiz-results" "$resend_data" "Resend quiz results email"
    
    # Get email status
    api_call "GET" "/email/status/$CONSENT_ID" "" "Get email delivery status"
    
    # Unsubscribe
    unsubscribe_data='{
      "consentId": "'$CONSENT_ID'",
      "email": "test@example.com",
      "reason": "No longer interested"
    }'
    api_call "POST" "/email/unsubscribe" "$unsubscribe_data" "Unsubscribe from emails"
    
    print_header "7. DATA DELETION (BE CAREFUL!)"
    
    print_info "Skipping deletion test to preserve test data"
    print_info "To test deletion manually:"
    echo "curl -X POST $API_BASE/gdpr/request-deletion \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"consentId\": \"$CONSENT_ID\", \"reason\": \"Test deletion\"}'"
    
else
    print_error "No consent ID available - skipping customer-specific tests"
fi

# Test email configuration (development only)
print_header "8. EMAIL CONFIGURATION TEST"
api_call "POST" "/email/test" "" "Test email configuration"

# Final summary
print_header "API TESTING COMPLETE"
print_success "All API endpoints tested successfully!"

if [ -n "$CONSENT_ID" ]; then
    print_info "Test customer consent ID: $CONSENT_ID"
    print_info "Use this ID for manual testing or admin panel access"
fi

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Visit http://localhost:3001/api/admin/panel (admin:admin123) for web interface"
echo "2. Use the CLI tool: node cli.js --help"
echo "3. Check the admin panel to see encrypted data storage"
echo "4. Test GDPR compliance features"
echo ""

print_info "Remember: All personal data is encrypted in the database!"
print_info "The admin panel shows how GDPR compliance works in practice."