import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getConversionsCollection, Conversion } from '@/lib/mongodb';
import { PrivateAPI, GOAL_TYPES } from '@/lib/private-api';

// Test API endpoint to verify Private API connection and test conversions
export async function GET(request: NextRequest) {
  try {
    // Test 1: Check Private API connection
    console.log('Testing Private API connection...');
    let apiStatus = 'unknown';
    let apiError = null;
    
    try {
      const conversions = await PrivateAPI.Conversions.list({
        per_page: 1
      });
      apiStatus = conversions.data ? 'connected' : 'no data';
      console.log('✅ Private API connected successfully');
    } catch (error: any) {
      apiStatus = 'error';
      apiError = error.message;
      console.error('❌ Private API error:', error.message);
    }

    // Test 2: Get MongoDB connection and stats
    const { db } = await connectToDatabase();
    const conversionsCollection = getConversionsCollection(db);
    
    const mongoStats = await conversionsCollection.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byGoalType: [
            { $group: { _id: '$goal_type', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          testCount: [
            { $match: { is_test: true } },
            { $count: 'count' }
          ]
        }
      }
    ]).toArray();

    const stats = mongoStats[0];
    
    // Test 3: Check for test leads (is_test = true)
    const testLeads = await conversionsCollection
      .find({ is_test: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({
      success: true,
      test: {
        apiConnection: {
          status: apiStatus,
          error: apiError
        },
        database: {
          totalConversions: stats.total[0]?.count || 0,
          testLeadsCount: stats.testCount[0]?.count || 0,
          byGoalType: stats.byGoalType.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          byStatus: stats.byStatus.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        recentTestLeads: testLeads.map(lead => ({
          id: lead._id?.toString(),
          click_id: lead.click_id,
          goal_type: lead.goal_type,
          amount: lead.amount,
          status: lead.status,
          createdAt: lead.createdAt,
          user_agent: lead.user_agent?.substring(0, 50) + '...' || null,
          country: lead.country
        }))
      }
    });

  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a test conversion
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const conversionsCollection = getConversionsCollection(db);

    const body = await request.json();
    const {
      click_id = 'test_' + Date.now(),
      goal_type = 'registration',
      amount = 0,
      is_test = true
    } = body;

    // Goal type ID mapping
    const goalId = goal_type === 'registration' 
      ? GOAL_TYPES.REGISTRATION.toString()
      : GOAL_TYPES.DEPOSIT.toString();

    // Create test conversion
    const testConversion: Conversion = {
      click_id,
      affiliate_id: 'test_affiliate',
      goal_id: goalId,
      goal_type,
      offer_id: '1',
      amount,
      sale_amount: undefined,
      status: 'pending',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (Test Lead)',
      ip_address: '192.168.1.100',
      country: 'US',
      region: 'CA',
      source: 'test_api',
      platform: 'desktop',
      browser: 'Chrome',
      os: 'Windows',
      os_version: '10',
      device_type: 'desktop',
      is_test,
      createdAt: new Date()
    };

    // Atomic upsert to prevent duplicates
    const existingConversion = await conversionsCollection.findOneAndUpdate(
      { click_id, goal_id: goalId },
      { $setOnInsert: testConversion },
      { upsert: false, returnDocument: 'before' }
    );

    if (existingConversion) {
      return NextResponse.json({
        success: true,
        message: 'Test conversion already exists',
        data: {
          id: existingConversion._id?.toString(),
          click_id: existingConversion.click_id,
          goal_type: existingConversion.goal_type
        },
        isDuplicate: true
      });
    }

    const result = await conversionsCollection.insertOne(testConversion);
    console.log('✅ Test conversion created:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: 'Test conversion created successfully',
      data: {
        id: result.insertedId.toString(),
        click_id,
        goal_type,
        is_test
      },
      isDuplicate: false
    });

  } catch (error: any) {
    console.error('Create test conversion error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
