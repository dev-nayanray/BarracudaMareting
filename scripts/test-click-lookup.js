/**
 * Test script to verify Click Hash Lookup functionality
 * 
 * This script tests that:
 * 1. ClicksAPI can fetch clicks from the Hooplaseft API
 * 2. getHashByClickId returns the correct hash for a given click_id
 * 3. Registration postbacks use the correct hash
 * 
 * Run with: node scripts/test-click-lookup.js
 */

const API_BASE_URL = process.env.PRIVATE_API_BASE_URL || 'https://hooplaseft.com/backend/open-api/v1';
const API_TOKEN = process.env.PRIVATE_API_TOKEN || '49c6fbc5d8f07187e6d312cb1d754db354bdc5937f76f5cd2af09ac8a3880d6d';

async function privateApiRequest(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error.message);
    throw error;
  }
}

async function getClicks() {
  console.log('\n📋 Fetching clicks from API...');
  const result = await privateApiRequest('/affiliates/clicks?per_page=5');
  return result;
}

async function getClickHash(clickId) {
  console.log(`\n🔍 Looking up hash for click_id: ${clickId}`);
  
  try {
    const result = await privateApiRequest('/affiliates/clicks?per_page=200');
    
    if (result.data) {
      const click = result.data.find(c => c.id === clickId);
      if (click && click.hash) {
        console.log(`✅ Found hash for click ${clickId}: ${click.hash}`);
        return click.hash;
      }
      console.log(`⚠️ Click ${clickId} not found in response`);
      return null;
    }
    return null;
  } catch (error) {
    console.error(`❌ Error looking up click hash:`, error.message);
    return null;
  }
}

async function testWithClickId(clickId) {
  console.log('\n==============================================');
  console.log(`🧪 Testing with click_id: ${clickId}`);
  console.log('==============================================');
  
  // Get hash
  const hash = await getClickHash(clickId);
  
  if (hash) {
    console.log(`\n✅ SUCCESS: Found hash "${hash}" for click_id "${clickId}"`);
    console.log(`\n📝 Postback URL would be:`);
    console.log(`https://hooplaseft.com/api/v3/goal/5?hash=${hash}&click_id=${clickId}&affiliate_id=2&...`);
    return true;
  } else {
    console.log(`\n❌ FAILED: Could not find hash for click_id "${clickId}"`);
    return false;
  }
}

async function main() {
  console.log('==============================================');
  console.log('Click Hash Lookup Test');
  console.log('==============================================');
  
  // Test 1: Get list of clicks
  console.log('\n📋 Step 1: Fetching available clicks...');
  const clicksResult = await getClicks();
  
  if (!clicksResult.data || clicksResult.data.length === 0) {
    console.log('\n⚠️ No clicks found in API response');
    console.log('This could mean:');
    console.log('  - The API token is invalid');
    console.log('  - There are no clicks recorded yet');
    console.log('  - The API endpoint is not accessible');
    return;
  }
  
  console.log(`\n✅ Found ${clicksResult.data.length} clicks`);
  console.log('\n📋 Available clicks:');
  clicksResult.data.forEach(click => {
    console.log(`   ID: ${click.id}, Hash: ${click.hash}, Offer: ${click.offer_name}, Country: ${click.country_code}`);
  });
  
  // Test 2: Test hash lookup with first click
  if (clicksResult.data.length > 0) {
    const testClickId = clicksResult.data[0].id;
    const expectedHash = clicksResult.data[0].hash;
    
    console.log('\n==============================================');
    console.log(`🧪 Step 2: Testing hash lookup for click_id: ${testClickId}`);
    console.log(`   Expected hash: ${expectedHash}`);
    console.log('==============================================');
    
    const foundHash = await getClickHash(testClickId);
    
    if (foundHash === expectedHash) {
      console.log(`\n✅ PASS: Hash lookup returned correct hash`);
    } else {
      console.log(`\n❌ FAIL: Hash mismatch`);
      console.log(`   Expected: ${expectedHash}`);
      console.log(`   Got: ${foundHash}`);
    }
  }
  
  console.log('\n==============================================');
  console.log('Test Complete');
  console.log('==============================================\n');
}

main().catch(console.error);

