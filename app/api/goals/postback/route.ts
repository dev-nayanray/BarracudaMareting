import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getConversionsCollection, getContactsCollection, Conversion } from '@/lib/mongodb';

// Hooplaseft API Configuration
const HOOPLASEFT_CONFIG = {
  baseUrl: 'https://hooplaseft.com/api/v3',
  // Goal IDs
  goalRegistration: '5',  // Registration Goal
  goalDeposit: '6',       // Deposit Goal
  // TODO: Replace with actual hash from Hooplaseft dashboard
  hash: process.env.HOOPLASEFT_HASH || 'eb20d583f46d5dc303e251607e04d240'
};

// Helper function to send Hooplaseft goal postback
async function sendHooplaseftPostback(
  goalId: string,
  clickId: string,
  affiliateId: string,
  params: Record<string, string> = {}
): Promise<{ success: boolean; message: string; statusCode: number }> {
  try {
    const urlParams = new URLSearchParams({
      hash: HOOPLASEFT_CONFIG.hash,
      click_id: clickId,
      affiliate_id: affiliateId,
      ...params
    });

    const url = `${HOOPLASEFT_CONFIG.baseUrl}/goal/${goalId}?${urlParams.toString()}`;
    console.log(`🎯 Sending Hooplaseft Goal #${goalId} postback:`, url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Next.js Affiliate API',
        'Accept': 'application/json'
      }
    });

    const text = await response.text();
    console.log(`✅ Hooplaseft Goal #${goalId} response:`, text.substring(0, 200));

    return { success: response.ok, message: text, statusCode: response.status };
  } catch (error: any) {
    console.error(`❌ Hooplaseft Goal #${goalId} error:`, error.message);
    return { success: false, message: error.message, statusCode: 500 };
  }
}

// POST /api/goals/postback - Send a goal postback to Hooplaseft
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const conversionsCollection = getConversionsCollection(db);
    const contactsCollection = getContactsCollection(db);

    const body = await request.json();

    const {
      click_id,
      affiliate_id,
      goal_type,        // 'registration' | 'deposit'
      offer_id,
      amount,
      sale_amount,
      sub1,
      sub2,
      sub3,
      sub4,
      sub5,
      deposit_amount,   // Alias for amount
      
      // Tracking parameters
      user_agent,
      ip_address,
      country,
      region,
      source,
      platform,
      browser,
      os,
      os_version,
      manufacturer,
      device_type,
      is_test,
      
      // Additional identifiers
      advertiser_id,
      offer_url_id,
      affiliate_source,
      
      metadata
    } = body;

    // -------------------------------
    // Validation
    // -------------------------------
    if (!click_id || !affiliate_id) {
      return NextResponse.json(
        { success: false, message: 'click_id and affiliate_id are required' },
        { status: 400 }
      );
    }

    if (!goal_type || !['registration', 'deposit'].includes(goal_type)) {
      return NextResponse.json(
        { success: false, message: 'goal_type must be "registration" or "deposit"' },
        { status: 400 }
      );
    }

    // -------------------------------
    // Determine goal ID
    // -------------------------------
    const goalId = goal_type === 'registration' 
      ? HOOPLASEFT_CONFIG.goalRegistration 
      : HOOPLASEFT_CONFIG.goalDeposit;

    // -------------------------------
    // Send Hooplaseft postback FIRST (before MongoDB insert)
    // -------------------------------
    const postbackParams: Record<string, string> = {
      sub1: sub1 || '',
      sub2: sub2 || '',
      sub3: sub3 || '',
      goal_type,
      ...(deposit_amount && { deposit_amount: deposit_amount.toString() }),
      ...(amount && { amount: amount.toString() }),
      ...(sale_amount && { sale_amount: sale_amount.toString() })
    };

    const postbackResult = await sendHooplaseftPostback(
      goalId,
      click_id,
      affiliate_id,
      postbackParams
    );

    // -------------------------------
    // Prepare conversion data for atomic upsert
    // -------------------------------
    const conversionData = {
      click_id,
      affiliate_id,
      goal_id: goalId,
      goal_type,
      offer_id: offer_id || '2',
      amount: amount || deposit_amount || 0,
      sale_amount: sale_amount || amount || deposit_amount || undefined,
      status: postbackResult.success ? 'approved' : 'pending',
      
      // Affiliate sub parameters
      sub1: sub1 || undefined,
      sub2: sub2 || undefined,
      sub3: sub3 || undefined,
      sub4: sub4 || undefined,
      sub5: sub5 || undefined,
      
      // Tracking information
      user_agent: user_agent || undefined,
      ip_address: ip_address || undefined,
      country: country || undefined,
      region: region || undefined,
      source: source || undefined,
      platform: platform || undefined,
      browser: browser || undefined,
      os: os || undefined,
      os_version: os_version || undefined,
      manufacturer: manufacturer || undefined,
      device_type: device_type || undefined,
      is_test: is_test || undefined,
      
      // Additional identifiers
      advertiser_id: advertiser_id || undefined,
      offer_url_id: offer_url_id || undefined,
      affiliate_source: affiliate_source || undefined,
      
      metadata: metadata 
        ? { ...metadata, postbackResponse: postbackResult.message }
        : { postbackResponse: postbackResult.message },
      updatedAt: new Date()
    };

    // -------------------------------
    // Atomic upsert - PREVENTS duplicate key errors on concurrent requests
    // -------------------------------
    const result = await conversionsCollection.findOneAndUpdate(
      { click_id, goal_id: goalId },
      {
        $setOnInsert: {
          ...conversionData,
          createdAt: new Date()
        },
        $set: {
          ...conversionData,
          updatedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const isNewConversion = !!result?.createdAt && result.createdAt >= new Date(Date.now() - 1000);
    console.log(isNewConversion ? '✅ New conversion saved to MongoDB' : '⚠️ Duplicate conversion updated:', result?._id);

    // -------------------------------
    // Update associated contact if exists
    // -------------------------------
    if (sub1) {
      const updateFields: any = { updatedAt: new Date() };
      
      if (goal_type === 'registration') {
        updateFields.affiliateRegistered = postbackResult.success;
      } else if (goal_type === 'deposit') {
        updateFields.ftd = postbackResult.success;
        if (postbackResult.success) {
          updateFields.ftd_date = new Date();
          updateFields.ftd_amount = amount || deposit_amount || 0;
        }
      }

      await contactsCollection.updateOne(
        { sub1 },
        { $set: updateFields },
        { upsert: true }
      );
      console.log('✅ Associated contact updated');
    }

    // -------------------------------
    // Update by affiliate_id if exists (for FTD)
    // -------------------------------
    if (affiliate_id && goal_type === 'deposit') {
      await contactsCollection.updateMany(
        { affiliate_id },
        {
          $set: {
            ftd: postbackResult.success,
            ftd_date: postbackResult.success ? new Date() : undefined,
            ftd_amount: postbackResult.success ? (amount || deposit_amount || 0) : undefined,
            updatedAt: new Date()
          }
        }
      );
      console.log('✅ Contacts updated by affiliate_id');
    }

    return NextResponse.json({
      success: postbackResult.success,
      message: postbackResult.success 
        ? `Goal "${goal_type}" postback sent successfully` 
        : `Goal "${goal_type}" postback failed`,
      data: {
        id: result?._id?.toString() || null,
        click_id,
        affiliate_id,
        goal_id: goalId,
        goal_type,
        amount: conversionData.amount,
        status: conversionData.status,
        postbackResponse: postbackResult.message,
        postbackStatusCode: postbackResult.statusCode,
        isDuplicate: !isNewConversion
      }
    }, { status: postbackResult.success ? 200 : postbackResult.statusCode });

  } catch (error: any) {
    console.error('Goal postback error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/goals/postback - Test endpoint to check configuration
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'test';

  if (action === 'test') {
    return NextResponse.json({
      success: true,
      message: 'Goals API is working',
      config: {
        baseUrl: HOOPLASEFT_CONFIG.baseUrl,
        goalRegistration: HOOPLASEFT_CONFIG.goalRegistration,
        goalDeposit: HOOPLASEFT_CONFIG.goalDeposit,
        hashSet: HOOPLASEFT_CONFIG.hash !== 'YOUR_HASH_HERE'
      },
      usage: {
        registration: `${HOOPLASEFT_CONFIG.baseUrl}/goal/${HOOPLASEFT_CONFIG.goalRegistration}?hash=YOUR_HASH&click_id=XXX&affiliate_id=XXX`,
        deposit: `${HOOPLASEFT_CONFIG.baseUrl}/goal/${HOOPLASEFT_CONFIG.goalDeposit}?hash=YOUR_HASH&click_id=XXX&affiliate_id=XXX`
      }
    });
  }

  return NextResponse.json({
    success: false,
    message: 'Unknown action'
  }, { status: 400 });
}

