#!/bin/bash
# Script to quickly test order confirmation page with different packages

# Base URL for the service
BASE_URL="https://e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev"

# Generate a random session ID
SESSION_ID="cs_test_$(openssl rand -hex 10)"

# Default package
PACKAGE_ID="lite_monthly"

# Process command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --package)
      PACKAGE_ID="$2"
      shift 2
      ;;
    --monthly)
      if [[ "$PACKAGE_ID" == *"yearly"* ]]; then
        PACKAGE_ID="${PACKAGE_ID/_yearly/_monthly}"
      else
        echo "Using monthly plan"
      fi
      shift
      ;;
    --yearly)
      if [[ "$PACKAGE_ID" == *"monthly"* ]]; then
        PACKAGE_ID="${PACKAGE_ID/_monthly/_yearly}"
      else
        echo "Using yearly plan"
      fi
      shift
      ;;
    --lite)
      if [[ "$PACKAGE_ID" == "pro_"* ]]; then
        if [[ "$PACKAGE_ID" == *"_yearly" ]]; then
          PACKAGE_ID="lite_yearly"
        else
          PACKAGE_ID="lite_monthly"
        fi
      else
        echo "Using Lite plan"
      fi
      shift
      ;;
    --pro)
      if [[ "$PACKAGE_ID" == "lite_"* ]]; then
        if [[ "$PACKAGE_ID" == *"_yearly" ]]; then
          PACKAGE_ID="pro_yearly"
        else
          PACKAGE_ID="pro_monthly"
        fi
      else
        echo "Using Pro plan"
      fi
      shift
      ;;
    --direct)
      DIRECT_MODE="true"
      shift
      ;;
    --api)
      API_MODE="true"
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Test order confirmation page with different packages"
      echo
      echo "Options:"
      echo "  --package PACKAGE_ID  Specify package ID (lite_monthly, lite_yearly, pro_monthly, pro_yearly)"
      echo "  --lite                Use Lite plan"
      echo "  --pro                 Use Pro plan"
      echo "  --monthly             Use monthly billing"
      echo "  --yearly              Use yearly billing"
      echo "  --direct              Use direct mode"
      echo "  --api                 Test API endpoint"
      echo "  --help                Show this help"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Build the URL based on mode
if [[ "$API_MODE" == "true" ]]; then
  URL="$BASE_URL/api/order-confirmation?session_id=$SESSION_ID&package_id=$PACKAGE_ID&in_redirect_fix=true"
  echo "Testing API endpoint with package: $PACKAGE_ID"
  
  # Make the request and print the response
  echo "Making request to: $URL"
  curl -s "$URL" | jq .
elif [[ "$DIRECT_MODE" == "true" ]]; then
  URL="$BASE_URL/order-confirmation?session_id=$SESSION_ID&package_id=$PACKAGE_ID&direct=true&in_redirect_fix=true"
  echo "Testing direct mode with package: $PACKAGE_ID"
  echo "Opening URL in browser: $URL"
  
  # Print instructions for manual testing
  echo "---------------------------------------------"
  echo "To test manually, open this URL in your browser:"
  echo "$URL"
  echo "---------------------------------------------"
else
  URL="$BASE_URL/order-confirmation?session_id=$SESSION_ID&package_id=$PACKAGE_ID&in_redirect_fix=true"
  echo "Testing order confirmation page with package: $PACKAGE_ID"
  echo "Opening URL in browser: $URL"
  
  # Print instructions for manual testing
  echo "---------------------------------------------"
  echo "To test manually, open this URL in your browser:"
  echo "$URL"
  echo "---------------------------------------------"
fi

# For non-API requests, open the URL in the browser if xdg-open is available
if [[ "$API_MODE" != "true" ]] && command -v xdg-open &>/dev/null; then
  xdg-open "$URL"
fi