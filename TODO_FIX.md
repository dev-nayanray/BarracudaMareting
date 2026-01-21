# TODO Fix - MongoDB Duplicate Key Error

## Issue
E11000 duplicate key error collection: barracuda.conversions index: click_id_1_goal_id_1 dup key: { click_id: "2", goal_id: "5" }

## Root Cause
Race condition in multiple API routes where:
1. The duplicate check (`findOne`) and insert (`insertOne`) are not atomic
2. Concurrent requests can both pass the check, then both try to insert
3. MongoDB's unique index rejects the second insert

## Solution
Use atomic upsert operation with `findOneAndUpdate` and `upsert: true` in ALL routes

## Files Fixed

### 1. app/api/private/conversions/route.ts
- Replaced check+insert with atomic `findOneAndUpdate` using `upsert: true`

### 2. app/api/contact/route.ts
- Added Hooplaseft postback integration (Goal #5, Goal #6)
- Uses atomic upserts for all database operations
- Auto-completes FTD on registration

### 3. app/api/register/route.ts
- Replaced `insertOne` with atomic `findOneAndUpdate`
- Fixed all conversion and postback inserts

### 4. app/api/ftd/route.ts
- Replaced `insertOne` with atomic `findOneAndUpdate`

### 5. app/api/postback/route.ts
- Replaced `updateOne` with atomic `findOneAndUpdate`

### 6. app/api/goals/postback/route.ts
- Replaced check+insert with atomic `findOneAndUpdate`
- Sends postback BEFORE MongoDB operation

### 7. app/api/admin/conversions/route.ts
- Replaced check+insert with atomic `findOneAndUpdate`

## Key Fix Pattern

**Before (vulnerable to race conditions):**
```javascript
// Check first
const existing = await collection.findOne({ click_id, goal_id });
if (existing) return duplicateResponse;

// Then insert
await collection.insertOne(data); // DUPLICATE ERROR HERE
```

**After (atomic operation):**
```javascript
// Single atomic operation - MongoDB handles check-and-insert internally
const result = await collection.findOneAndUpdate(
  { click_id, goal_id },
  {
    $setOnInsert: { ...data, createdAt: new Date() },
    $set: { updatedAt: new Date() }
  },
  { upsert: true, returnDocument: 'after' }
);

// Detect if new or existing
const isNew = !!result?.createdAt && result.createdAt >= new Date(Date.now() - 1000);
```

This pattern is now used in ALL 7 API routes that save conversions to MongoDB.

