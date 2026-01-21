import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getConversionsCollection, Conversion } from '@/lib/mongodb';

// GET /api/admin/conversions - Get all conversions with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const conversionsCollection = getConversionsCollection(db);

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const goalType = searchParams.get('goal_type');
    const affiliateId = searchParams.get('affiliate_id');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build filter
    const filter: any = {};
    
    if (goalType) {
      filter.goal_type = goalType;
    }
    
    if (affiliateId) {
      filter.affiliate_id = affiliateId;
    }
    
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await conversionsCollection.countDocuments(filter);

    // Fetch conversions
    const conversions = await conversionsCollection
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get stats
    const stats = await conversionsCollection.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byGoalType: [
            { $group: { _id: '$goal_type', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          totalAmount: [
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          thisMonth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
              }
            },
            { $count: 'count' }
          ],
          approvedCount: [
            { $match: { status: 'approved' } },
            { $count: 'count' }
          ]
        }
      }
    ]).toArray();

    const statsData = stats[0];

    return NextResponse.json({
      success: true,
      data: conversions.map(conversion => ({
        ...conversion,
        id: conversion._id?.toString(),
        _id: undefined
      })),
      stats: {
        total: statsData.total[0]?.count || 0,
        byGoalType: statsData.byGoalType.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byStatus: statsData.byStatus.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalAmount: statsData.totalAmount[0]?.total || 0,
        thisMonth: statsData.thisMonth[0]?.count || 0,
        approvedCount: statsData.approvedCount[0]?.count || 0
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Get conversions error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/conversions - Create a new conversion (atomic upsert)
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const conversionsCollection = getConversionsCollection(db);

    const body = await request.json();

    const {
      click_id,
      affiliate_id,
      goal_id,
      goal_type,
      offer_id,
      amount,
      sale_amount,
      status,
      sub1,
      sub2,
      sub3,
      sub4,
      sub5,
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
      advertiser_id,
      offer_url_id,
      affiliate_source,
      metadata
    } = body;

    // -------------------------------
    // Validation
    // -------------------------------
    if (!click_id || !affiliate_id || !goal_id || !goal_type) {
      return NextResponse.json(
        { success: false, message: 'click_id, affiliate_id, goal_id, and goal_type are required' },
        { status: 400 }
      );
    }

    // -------------------------------
    // Prepare conversion data for atomic upsert
    // -------------------------------
    const conversionData = {
      click_id,
      affiliate_id,
      goal_id,
      goal_type,
      offer_id: offer_id || undefined,
      amount: amount || 0,
      sale_amount: sale_amount || undefined,
      status: status || 'pending',
      
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
      
      metadata: metadata || undefined,
      updatedAt: new Date()
    };

    // -------------------------------
    // Atomic upsert - PREVENTS duplicate key errors on concurrent requests
    // -------------------------------
    const result = await conversionsCollection.findOneAndUpdate(
      { click_id, goal_id },
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
    
    console.log(isNewConversion ? '✅ New conversion saved' : '⚠️ Duplicate conversion updated:', result?._id);

    return NextResponse.json({
      success: true,
      message: isNewConversion ? 'Conversion recorded successfully' : 'Conversion already exists, updated',
      data: {
        id: result?._id?.toString() || null,
        click_id,
        affiliate_id,
        goal_id,
        goal_type,
        amount: conversionData.amount,
        status: conversionData.status,
        isDuplicate: !isNewConversion
      }
    });

  } catch (error: any) {
    console.error('Create conversion error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

