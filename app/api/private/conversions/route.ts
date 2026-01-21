import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getConversionsCollection, Conversion } from '@/lib/mongodb';
import { PrivateAPI, GOAL_TYPES } from '@/lib/private-api';

// POST /api/private/conversions - Create conversions using the Private API
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const conversionsCollection = getConversionsCollection(db);

    const body = await request.json();

    const {
      click_hash,
      goal_type_id,
      affiliate_id,
      offer_id,
      deposit_amount,
      sale_amount,
      payout,
      revenue,
      unique,
      is_test,
      
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
      
      // Affiliate sub parameters
      sub1,
      sub2,
      sub3,
      sub4,
      sub5,
      
      // Additional identifiers
      advertiser_id,
      offer_url_id,
      affiliate_source
    } = body;

    // -------------------------------
    // Validation
    // -------------------------------
    if (!click_hash) {
      return NextResponse.json(
        { success: false, message: 'click_hash is required' },
        { status: 400 }
      );
    }

    if (!goal_type_id) {
      return NextResponse.json(
        { success: false, message: 'goal_type_id is required' },
        { status: 400 }
      );
    }

    // -------------------------------
    // Create conversion using Private API first (before MongoDB insert)
    // -------------------------------
    let privateApiResult: any = null;
    let apiError: string | null = null;

    try {
      privateApiResult = await PrivateAPI.createAffiliateConversion({
        clickHash: click_hash,
        goalTypeId: goal_type_id,
        affiliateId: affiliate_id,
        offerId: offer_id,
        depositAmount: deposit_amount,
        saleAmount: sale_amount,
        unique: unique,
        isTest: is_test
      });
    } catch (error: any) {
      console.error('Private API conversion error:', error.message);
      apiError = error.message;
    }

    // -------------------------------
    // Atomic upsert conversion to MongoDB (prevents race conditions)
    // -------------------------------
    const conversionData = {
      click_id: click_hash,
      click_hash: click_hash,
      affiliate_id: affiliate_id?.toString() || '',
      goal_id: goal_type_id.toString(),
      goal_type: goal_type_id === GOAL_TYPES.REGISTRATION ? 'registration' : 
                 goal_type_id === GOAL_TYPES.DEPOSIT ? 'deposit' : 'other',
      offer_id: offer_id?.toString() || '2',
      amount: deposit_amount || 0,
      sale_amount: sale_amount || deposit_amount || undefined,
      status: privateApiResult?.success ? 'approved' : 'pending',
      
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
      advertiser_id: advertiser_id?.toString() || undefined,
      offer_url_id: offer_url_id?.toString() || undefined,
      affiliate_source: affiliate_source || undefined,
      
      metadata: {
        privateApiConversion: privateApiResult?.conversion || null,
        apiError: apiError
      },
      updatedAt: new Date()
    };

    // Use atomic upsert - this prevents duplicate key errors
    // If document exists, it returns the existing one; if not, it creates new one
    const result = await conversionsCollection.findOneAndUpdate(
      { click_id: click_hash, goal_id: goal_type_id.toString() },
      { 
        $setOnInsert: { 
          ...conversionData, 
          createdAt: new Date() 
        },
        $set: {
          updatedAt: new Date()
        }
      },
      { 
        upsert: true, 
        returnDocument: 'after' 
      }
    );

    const isDuplicate = !!result?.createdAt && result.createdAt < new Date(Date.now() - 1000);

    console.log(isDuplicate 
      ? '⚠️ Conversion already exists, updated metadata:' 
      : '✅ Conversion saved to MongoDB:', 
      result?._id
    );

    // -------------------------------
    // Return response
    // -------------------------------
    return NextResponse.json({
      success: privateApiResult?.success || false,
      message: isDuplicate 
        ? 'Conversion already exists, metadata updated' 
        : (privateApiResult?.success 
          ? 'Conversion created successfully via Private API' 
          : 'Conversion saved locally (Private API failed)'),
      data: {
        id: result?._id?.toString() || null,
        click_hash,
        goal_type_id,
        goal_type: conversionData.goal_type,
        amount: conversionData.amount,
        status: conversionData.status,
        privateApiConversion: privateApiResult?.conversion || null,
        apiError: apiError
      },
      isDuplicate: isDuplicate
    });

  } catch (error: any) {
    console.error('Create conversion error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/private/conversions - List conversions from Private API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      affiliate_id: searchParams.get('affiliate_id') ? parseInt(searchParams.get('affiliate_id')!) : undefined,
      offer_id: searchParams.get('offer_id') ? parseInt(searchParams.get('offer_id')!) : undefined,
      goal_type_id: searchParams.get('goal_type_id') ? parseInt(searchParams.get('goal_type_id')!) : undefined,
      hash: searchParams.get('hash') || undefined,
      created_at_from: searchParams.get('created_at_from') || undefined,
      created_at_to: searchParams.get('created_at_to') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      per_page: searchParams.get('per_page') ? parseInt(searchParams.get('per_page')!) : 50,
    };

    const result = await PrivateAPI.Conversions.list(params);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        per_page: result.per_page,
        page: result.page,
        pages: result.pages
      }
    });

  } catch (error: any) {
    console.error('List conversions error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

