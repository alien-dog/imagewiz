#!/bin/bash

# Script to run the order confirmation test with colored output

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}iMagenWiz Order Confirmation Test${NC}"
echo -e "${BLUE}=================================${NC}"
echo

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js to run this test.${NC}"
    exit 1
fi

# Check if the test script exists
if [ ! -f "test-order-confirmation.js" ]; then
    echo -e "${RED}Error: test-order-confirmation.js not found.${NC}"
    exit 1
fi

# Check if the server is running
echo -e "${YELLOW}Checking if the server is running...${NC}"
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}Error: Server is not running. Please start the server first.${NC}"
    exit 1
fi
echo -e "${GREEN}Server is running!${NC}"
echo

# Run the test
echo -e "${YELLOW}Running order confirmation tests...${NC}"
node test-order-confirmation.js

# Exit with the status code of the last command
STATUS=$?
if [ $STATUS -eq 0 ]; then
    echo -e "\n${GREEN}✅ Tests completed successfully!${NC}"
    echo -e "${YELLOW}You can also test the order confirmation page in your browser at:${NC}"
    echo -e "${BLUE}http://localhost:3000/test-order-confirmation${NC}"
else
    echo -e "\n${RED}❌ Tests failed with status code $STATUS${NC}"
fi

exit $STATUS
