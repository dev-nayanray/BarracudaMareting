# TODO - Fix Click Hash for Postbacks in Contact Form

## Task ✅ COMPLETED
Fix the contact form to use valid Hooplaseft click hash instead of generating random hashes.

## Problem
When `sub1` is undefined, the code generates a NEW random hash locally. But Hooplaseft rejects this because the hash was never created through their tracking system.

## Solution ✅ IMPLEMENTED
Call the Hooplaseft offer URL to get a valid click with a real hash from their system.

## Changes Made

### lib/private-api.ts ✅
- Added `ClicksAPI.createClickAndGetHash()` method that:
  - Calls `https://hooplaseft.com/api/v3/offer/2?affiliate_id=...&url_id=...`
  - Follows redirect to capture `sub1` from the redirect URL
  - Returns both `clickId` and `hash` from Hooplaseft

### app/api/contact/route.ts ✅
- Imported `ClicksAPI` from private-api.ts
- Modified the hash logic in the registration flow:
  - If `sub1` is a valid hash (32+ hex chars), use it
  - Otherwise, call `ClicksAPI.createClickAndGetHash()` to get a real hash from Hooplaseft
  - Fallback to generated hash only if API call fails
- Use the valid hash for both Registration (Goal #5) and Deposit (Goal #6) postbacks

## Expected Flow After Fix
```
1. User submits contact form with no sub1
2. Server calls Hooplaseft offer URL with redirect follow
3. Hooplaseft redirects to URL with sub1 parameter
4. Server captures sub1 from redirect (e.g., edbc0f2efd96821e5694cf5f43979ee7)
5. Server uses captured sub1 for Registration Postback (Goal #5)
6. Server uses same sub1 for Deposit Postback (Goal #6)
7. Both postbacks succeed with valid hash from Hooplaseft
```

## Example Log Output After Fix
```
🎯 No valid sub1 hash, calling Hooplaseft to create click...
🎯 Calling Hooplaseft offer URL to create click and get hash:
   URL: https://hooplaseft.com/api/v3/offer/2?affiliate_id=2&url_id=2
✅ Hooplaseft redirect URL: https://...?sub1=edbc0f2efd96821e5694cf5f43979ee7
   Extracted sub1 (hash): edbc0f2efd96821e5694cf5f43979ee7
🎯 Got valid hash from Hooplaseft: edbc0f2efd96821e5694cf5f43979ee7
🎯 Using dynamic click_id: edbc0f2efd96821e5694cf5f43979ee7 (sub1: undefined, url_id: 2)
🎯 Using hash: edbc0f2efd96821e5694cf5f43979ee7
🎯 Sending Hooplaseft Goal #5 postback:
   URL: https://hooplaseft.com/api/v3/goal/5?hash=edbc0f2efd96821e5694cf5f43979ee7&...
✅ Hooplaseft Goal #5 response (200): {"status":"success"}
   Registration postback success: true
```

