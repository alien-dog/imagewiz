#!/bin/bash

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the Replit domain from the URL
REPLIT_DOMAIN="e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev"
echo -e "${YELLOW}Testing Stripe redirects to: ${REPLIT_DOMAIN}${NC}"

# Test session ID
SESSION_ID="cs_test_simulated12345"

# Test different URL formats that Stripe might generate
echo -e "\n${BLUE}1. Testing standard success_url format${NC}"
URL="https://${REPLIT_DOMAIN}/order-confirmation?session_id=${SESSION_ID}"
echo "Trying URL: $URL"
curl -s -I "$URL" | grep "HTTP"

echo -e "\n${BLUE}2. Testing with malformed session_id parameter (encoded)${NC}"
URL="https://${REPLIT_DOMAIN}/order-confirmation%3Fsession_id=${SESSION_ID}"
echo "Trying URL: $URL"
curl -s -I "$URL" | grep "HTTP"

echo -e "\n${BLUE}3. Testing with old payment-success route${NC}"
URL="https://${REPLIT_DOMAIN}/payment-success?session_id=${SESSION_ID}"
echo "Trying URL: $URL"
curl -s -I "$URL" | grep "HTTP"

echo -e "\n${BLUE}4. Testing with legacy payment-verify route${NC}"
URL="https://${REPLIT_DOMAIN}/payment-verify?session_id=${SESSION_ID}"
echo "Trying URL: $URL"
curl -s -I "$URL" | grep "HTTP"

echo -e "\n${BLUE}5. Testing with fragment in URL (Stripe sometimes adds hash)${NC}"
URL="https://${REPLIT_DOMAIN}/order-confirmation?session_id=${SESSION_ID}#/"
echo "Trying URL: $URL"
curl -s -I "$URL" | grep "HTTP"

echo -e "\n${BLUE}6. Testing with unexpected port in the URL${NC}"
URL="https://${REPLIT_DOMAIN}:443/order-confirmation?session_id=${SESSION_ID}"
echo "Trying URL: $URL"
curl -s -I "$URL" | grep "HTTP"

echo -e "\n${BLUE}7. Testing with port 3000 in the URL${NC}"
URL="https://${REPLIT_DOMAIN}:3000/order-confirmation?session_id=${SESSION_ID}"
echo "Trying URL: $URL"
curl -s -I "$URL" | grep "HTTP"

echo -e "\n${BLUE}8. Testing with no path (root redirect)${NC}"
URL="https://${REPLIT_DOMAIN}"
echo "Trying URL: $URL"
curl -s -I "$URL" | grep "HTTP"

echo -e "\n${BLUE}9. Testing Stripe's common encoding format (double encoded)${NC}"
URL="https://${REPLIT_DOMAIN}/%2Forder-confirmation%3Fsession_id=${SESSION_ID}"
echo "Trying URL: $URL"
curl -s -I "$URL" | grep "HTTP"

echo -e "\n${BLUE}10. Testing with potentially truncated domain${NC}"
# Try a modification of the domain to simulate Stripe modifying it
URL="https://${REPLIT_DOMAIN%%-*}/order-confirmation?session_id=${SESSION_ID}"
echo "Trying URL: $URL"
curl -s -I "$URL" | grep "HTTP"

echo -e "\n${YELLOW}Test completed. Check the responses above for any issues.${NC}"