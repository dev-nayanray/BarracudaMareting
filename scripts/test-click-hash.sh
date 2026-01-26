#!/bin/bash

# Test script for Click Hash Lookup functionality
# This script tests that the correct hash is looked up for a given click_id

echo "=============================================="
echo "Testing Click Hash Lookup for Postbacks"
echo "=============================================="
echo ""

# Test API endpoint to check clicks
PRIVATE_API_URL="http://localhost:3000/api/private/conversions"

echo "1. Testing Clicks API (list clicks to see available click_ids):"
echo "   curl -X GET '${PRIVATE_API_URL}?page=1&per_page=5'"
echo ""

# Test registration with a click_id
echo "2. Testing Registration API with click_id lookup:"
echo "   Testing that the system looks up the hash from the click_id"
echo ""

# Sample test - this would need a real click_id from the API
# The click_id should be a number like 27692, 27534 from the API response
TEST_CLICK_ID="27692"
TEST_AFFILIATE_ID="2"

echo "Expected behavior for click_id: $TEST_CLICK_ID"
echo "----------------------------------------------"
echo ""
echo "When a user submits the form with:"
echo "  - url_id (click_id): $TEST_CLICK_ID"
echo "  - affiliate_id: $TEST_AFFILIATE_ID"
echo ""
echo "The system will:"
echo "1. Call ClicksAPI.getHashByClickId($TEST_CLICK_ID)"
echo "2. Look up the click in Hooplaseft API"
echo "3. Get the hash (e.g., '8e9ac0c08cd07f7ee4f85d7a8c4ac5b06' for click 27692)"
echo "4. Send postback with the correct hash"
echo ""
echo "Postback URL example:"
echo "https://hooplaseft.com/api/v3/goal/5?hash=8e9ac0c08cd07f7ee4f85d7a8c4ac5b06&click_id=$TEST_CLICK_ID&affiliate_id=$TEST_AFFILIATE_ID"
echo ""
echo "=============================================="
echo "Test Instructions:"
echo "=============================================="
echo ""
echo "1. Start the development server:"
echo "   cd c:/Users/USER/Desktop/BarracudaMareting"
echo "   npm run dev"
echo ""
echo "2. Get available click_ids from the API:"
echo "   curl -X GET 'http://localhost:3000/api/private/conversions?page=1&per_page=10'"
echo ""
echo "3. Submit the registration form with a click_id:"
echo "   Open: http://localhost:3000/landing?url_id=<click_id>&affiliate_id=2"
echo "   Fill in the form as an affiliate"
echo "   Submit"
echo ""
echo "4. Check console logs for:"
echo "   ✅ Found hash for click <id>: <hash>"
echo "   ✅ Using hash: <hash> for click_id: <id>"
echo "   🎯 Sending Hooplaseft Goal #5 postback: https://hooplaseft.com/api/v3/goal/5?hash=<correct_hash>&..."
echo ""
echo "=============================================="
echo "Console Log Verification:"
echo "=============================================="
echo ""
echo "✅ Expected log output (when click exists in API):"
echo "   getClickHash: Found hash for click 27692: 8e9ac0c08cd07f7ee4f85d7a8c4ac5b06"
echo "   Using hash: 8e9ac0c08cd07f7ee4f85d7a8c4ac5b06 for click_id: 27692"
echo "   🎯 Sending Hooplaseft Goal #5 postback: https://hooplaseft.com/api/v3/goal/5?hash=8e9ac0c08cd07f7ee4f85d7a8c4ac5b06&..."
echo ""
echo "✅ Expected log output (when click_id not provided):"
echo "   getClickHash: No click_id provided, using default hash"
echo "   Using hash: eb20d583f46d5dc303e251607e04d240 for click_id: undefined"
echo ""
echo "=============================================="

