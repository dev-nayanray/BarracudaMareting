# TODO: Fix Click Hash Lookup for Postbacks

## Problem
The registration API uses a hardcoded hash for all postbacks instead of looking up the correct hash for each click_id.

## Solution
Add click lookup functionality to fetch the exact hash for each click_id and use it in postbacks.

## Tasks

### Phase 1: Add ClicksAPI to lib/private-api.ts ✅
- [x] Add ClicksAPI.get() method to fetch a specific click by ID
- [x] Add ClicksAPI.list() method to fetch clicks with filtering
- [x] Add helper function to get click hash by click_id

### Phase 2: Update app/api/register/route.ts ✅
- [x] Remove hardcoded HOOPLASEFT_HASH constant (renamed to defaultHash for fallback)
- [x] Add function to look up click hash from Hooplaseft API (getClickHash)
- [x] Modify sendHooplaseftPostback to accept hash parameter
- [x] Update registration postback to use correct hash
- [x] Update deposit postback to use correct hash
- [x] Add proper error handling for missing clicks

### Phase 3: Testing
- [ ] Test with a real click_id from the API
- [ ] Verify postbacks use the correct hash
- [ ] Check for any "Conversion already exists" errors

## Changes Made

### lib/private-api.ts
- Added `Click` interface for type safety
- Added `ClicksAPI` object with:
  - `list()` - fetch clicks with filtering
  - `get()` - get a specific click by ID
  - `getHashByClickId()` - main helper function to get hash for a click
- Exported `ClicksAPI` in `PrivateAPI`

### app/api/register/route.ts
- Added `getClickHash()` helper function that:
  - Validates click_id format
  - Calls `ClicksAPI.getHashByClickId()` to get the correct hash
  - Falls back to default hash if lookup fails
- Modified `sendHooplaseftPostback()` to accept explicit hash parameter
- Updated all postback calls to look up and pass the correct hash:
  - Registration postback (Goal #5)
  - Deposit postback (Goal #6) - auto-FTD
  - Deposit postback (Goal #6) - manual deposit

## How It Works
1. When a user submits the form with a `click_id` (url_id), the system now:
2. Looks up the click in Hooplaseft API using `GET /backend/open-api/v1/affiliates/clicks`
3. Gets the exact `hash` associated with that click_id
4. Uses that specific hash in the postback instead of the hardcoded one
5. Falls back to default hash only if click lookup fails

## Example Log Output
```
✅ Found hash for click 27692: 8e9ac0c08cd07f7ee4f85d7a8c4ac5b06
✅ Using hash: 8e9ac0c08cd07f7ee4f85d7a8c4ac5b06 for click_id: 27692
🎯 Sending Hooplaseft Goal #5 postback: https://hooplaseft.com/api/v3/goal/5?hash=8e9ac0c08cd07f7ee4f85d7a8c4ac5b06&click_id=27692&...
```

