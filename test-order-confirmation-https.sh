#!/bin/bash

# Set colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the Replit domain from environment
DOMAIN=$(echo $REPLIT_DOMAINS | tr ',' ' ' | cut -d' ' -f1)
if [ -z "$DOMAIN" ]; then
  # Fallback to localhost if not running in Replit
  DOMAIN="localhost:3000"
  echo -e "${YELLOW}Running locally, using $DOMAIN${NC}"
  PROTOCOL="http"
else
  echo -e "${GREEN}Running in Replit environment, using domain: $DOMAIN${NC}"
  PROTOCOL="https"
fi

echo -e "\n${BLUE}===========================================================${NC}"
echo -e "${BLUE}Testing Order Confirmation Page Direct Access with HTTPS${NC}"
echo -e "${BLUE}===========================================================${NC}\n"

# Test 1: Direct access to test HTML page
echo -e "${YELLOW}Test 1: Accessing test HTML page${NC}"
curl -s "${PROTOCOL}://$DOMAIN/test-order-confirmation.html" | grep -q "<title>Test Order Confirmation Page</title>"
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Test HTML page loads successfully${NC}"
else
  echo -e "${RED}✗ Failed to load test HTML page${NC}"
fi

# Test 2: Direct access to order confirmation page
echo -e "\n${YELLOW}Test 2: Accessing order confirmation page directly${NC}"
response=$(curl -s -i "${PROTOCOL}://$DOMAIN/order-confirmation")
echo "$response" | grep -q "HTTP/"
if [ $? -eq 0 ]; then
  status_code=$(echo "$response" | grep -oP "HTTP/[0-9.]+ \K[0-9]+")
  if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✓ Order confirmation page loads with status 200${NC}"
  else
    echo -e "${RED}✗ Order confirmation page returned status $status_code${NC}"
    echo -e "${YELLOW}Response headers:${NC}"
    echo "$response" | grep "HTTP"
  fi
else
  echo -e "${RED}✗ Failed to load order confirmation page${NC}"
fi

# Print useful debug information
echo -e "\n${YELLOW}Debug Information:${NC}"
echo -e "${BLUE}URLs tested:${NC}"
echo -e "Test page: ${PROTOCOL}://$DOMAIN/test-order-confirmation.html"
echo -e "Order confirmation: ${PROTOCOL}://$DOMAIN/order-confirmation"
