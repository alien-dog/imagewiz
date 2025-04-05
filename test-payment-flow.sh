#!/bin/bash
# Simple script to test the payment flow with the order confirmation page

# Clear the screen
clear

# Display banner
echo "====================================================="
echo "        iMagenWiz Payment Flow Test Script           "
echo "====================================================="
echo ""

# Base URL of the application
BASE_URL="https://e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev"

# Generate a random session ID
SESSION_ID="cs_test_$(date +%s)_$(head /dev/urandom | tr -dc a-z0-9 | head -c 10)"

# Options for package selection
PS3="Select a package to test: "
options=("Lite Monthly ($9.90 for 50 credits)" "Lite Yearly ($106.80 for 600 credits)" "Pro Monthly ($24.90 for 150 credits)" "Pro Yearly ($262.80 for 1800 credits)" "Quit")

# Display package options and get selection
echo "Available packages for testing:"
select opt in "${options[@]}"
do
    case $opt in
        "Lite Monthly ($9.90 for 50 credits)")
            PACKAGE_ID="lite_monthly"
            PACKAGE_NAME="Lite Monthly"
            PRICE="9.90"
            CREDITS="50"
            break
            ;;
        "Lite Yearly ($106.80 for 600 credits)")
            PACKAGE_ID="lite_yearly"
            PACKAGE_NAME="Lite Yearly"
            PRICE="106.80"
            CREDITS="600"
            break
            ;;
        "Pro Monthly ($24.90 for 150 credits)")
            PACKAGE_ID="pro_monthly"
            PACKAGE_NAME="Pro Monthly"
            PRICE="24.90"
            CREDITS="150"
            break
            ;;
        "Pro Yearly ($262.80 for 1800 credits)")
            PACKAGE_ID="pro_yearly"
            PACKAGE_NAME="Pro Yearly"
            PRICE="262.80"
            CREDITS="1800"
            break
            ;;
        "Quit")
            echo "Exiting..."
            exit 0
            ;;
        *) 
            echo "Invalid option $REPLY"
            ;;
    esac
done

# URLs for testing
ORDER_CONFIRMATION_URL="${BASE_URL}/order-confirmation?session_id=${SESSION_ID}&package_id=${PACKAGE_ID}&in_redirect_fix=true"
API_URL="${BASE_URL}/api/order-confirmation?session_id=${SESSION_ID}&package_id=${PACKAGE_ID}&in_redirect_fix=true"

# Display selected package and URLs
echo ""
echo "====================================================="
echo "Selected Package: ${PACKAGE_NAME}"
echo "Price: $${PRICE}"
echo "Credits: ${CREDITS}"
echo "Session ID: ${SESSION_ID}"
echo "====================================================="
echo ""
echo "Order Confirmation URL:"
echo "${ORDER_CONFIRMATION_URL}"
echo ""
echo "API Endpoint URL:"
echo "${API_URL}"
echo ""

# Ask what to test
echo "What would you like to test?"
PS3="Select an option: "
test_options=("Test API Endpoint" "Open Order Confirmation Page" "Quit")

select test_opt in "${test_options[@]}"
do
    case $test_opt in
        "Test API Endpoint")
            echo ""
            echo "Testing API endpoint..."
            echo "Sending request to: ${API_URL}"
            echo ""
            
            # Use curl to test API endpoint if available
            if command -v curl &> /dev/null; then
                curl -s "${API_URL}" | json_pp 2>/dev/null || curl -s "${API_URL}"
                echo ""
            else
                echo "curl not available. Please test manually by opening the URL in a browser."
            fi
            
            break
            ;;
        "Open Order Confirmation Page")
            echo ""
            echo "To test the order confirmation page, open this URL in your browser:"
            echo "${ORDER_CONFIRMATION_URL}"
            echo ""
            
            # Try to open URL in browser if possible
            if command -v xdg-open &> /dev/null; then
                xdg-open "${ORDER_CONFIRMATION_URL}"
            elif command -v open &> /dev/null; then
                open "${ORDER_CONFIRMATION_URL}"
            else
                echo "Could not automatically open browser. Please copy the URL and open it manually."
            fi
            
            break
            ;;
        "Quit")
            echo "Exiting..."
            exit 0
            ;;
        *) 
            echo "Invalid option $REPLY"
            ;;
    esac
done

echo ""
echo "====================================================="
echo "          Test completed for ${PACKAGE_NAME}         "
echo "====================================================="