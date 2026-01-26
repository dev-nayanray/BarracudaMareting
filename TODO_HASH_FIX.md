# TODO - Fix Tracking Link Hash Generation

## Task
Generate a unique hash (sub1 parameter) when the registration form is submitted and include it in the tracking link.

## Completed ✅

### Implementation Summary

The fix has been implemented to:
1. Automatically click the Hooplaseft tracking URL when user submits the form
2. Capture the `sub1` value from the redirect URL
3. Use the captured `sub1` for registration and FTD postbacks

### Changes Made

#### `app/api/register/route.ts`
- Simplified the code to make a single request to Hooplaseft offer URL with `redirect: 'follow'`
- Capture the `sub1` parameter from the final redirect URL
- Use the captured `sub1` as both `click_id` and `hash` for postbacks
- Send Registration Postback (Goal #5) with captured sub1
- Auto-complete FTD and send Deposit Postback (Goal #6) with same sub1

### How it works now:

1. User submits the affiliate registration form
2. Server makes a request to: `https://hooplaseft.com/api/v3/offer/2?affiliate_id=2&url_id=2&source=contact_form&name=...&email=...&company=...&unique=1`
3. Hooplaseft redirects to a URL that includes `sub1` parameter (the click hash)
4. Server captures the `sub1` from the redirect URL
5. Server sends Registration Postback (Goal #5) using the captured `sub1`
6. Server auto-completes FTD and sends Deposit Postback (Goal #6) using the same `sub1`

### Expected Flow:
```
POST /api/register
  ↓
Call Hooplaseft offer URL with redirect follow
  ↓
Capture sub1 from redirect URL: https://...?sub1=edbc0f2efd96821e5694cf5f43979ee7
  ↓
Send Registration Postback (Goal #5) with hash=sub1
  ↓
Send Deposit Postback (Goal #6) with hash=sub1
  ↓
Return success to user
```

This ensures that the postbacks use the actual hash that Hooplaseft generates for the click, rather than a locally generated hash.



