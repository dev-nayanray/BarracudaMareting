import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getPostbacksCollection, getContactsCollection, Postback } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const postbacksCollection = getPostbacksCollection(db);
    const contactsCollection = getContactsCollection(db);

    const { searchParams } = new URL(request.url);

    // -------------------------------
    // Extract parameters (MATCH POSTBACK URL)
    // -------------------------------
    const click_id = searchParams.get('click_id');
    const affiliate_id = searchParams.get('affiliate_id');
    const offer_id = searchParams.get('offer_id');
    const goal = searchParams.get('goal'); // registration | deposit
    const status = searchParams.get('status') || 'pending';

    const amount = parseFloat(searchParams.get('amount') || '0');
    const sale_amount = parseFloat(searchParams.get('sale_amount') || '0');

    const sub1 = searchParams.get('sub1');
    const sub2 = searchParams.get('sub2');
    const sub3 = searchParams.get('sub3');

    // -------------------------------
    // Validation
    // -------------------------------
    if (!click_id || !affiliate_id || !goal) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!['registration', 'deposit'].includes(goal)) {
      return NextResponse.json(
        { success: false, message: 'Invalid goal type' },
        { status: 400 }
      );
    }

    // -------------------------------
    // Debug logging
    // -------------------------------
    console.log('Affiliate postback received:', {
      click_id,
      affiliate_id,
      offer_id,
      goal,
      amount,
      sale_amount,
      status,
      sub1,
      sub2,
      sub3
    });

    // -------------------------------
    // 1. Atomic upsert postback to MongoDB (prevents duplicate key errors)
    // -------------------------------
    const postbackData = {
      click_id,
      affiliate_id,
      offer_id: offer_id || undefined,
      goal,
      amount: amount || undefined,
      sale_amount: sale_amount || undefined,
      status,
      sub1: sub1 || undefined,
      sub2: sub2 || undefined,
      sub3: sub3 || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const postbackResult = await postbacksCollection.findOneAndUpdate(
      { click_id, goal },
      {
        $setOnInsert: postbackData,
        $set: { updatedAt: new Date() }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const isNewPostback = !!postbackResult?.createdAt && postbackResult.createdAt >= new Date(Date.now() - 1000);
    
    if (!isNewPostback) {
      console.log('Duplicate postback ignored:', click_id, goal);
      return NextResponse.json({
        success: true,
        message: 'Duplicate postback ignored',
        isDuplicate: true
      });
    }

    console.log('✅ Postback saved to MongoDB');

    // -------------------------------
    // 2. Update associated contact if exists
    // -------------------------------
    if (sub1) {
      await contactsCollection.updateOne(
        { sub1: sub1 },
        {
          $set: {
            affiliateRegistered: goal === 'registration',
            updatedAt: new Date()
          },
          $setOnInsert: {
            ftd: goal === 'deposit' ? true : undefined,
            ftd_date: goal === 'deposit' ? new Date() : undefined,
            ftd_amount: goal === 'deposit' ? (amount || sale_amount) : undefined
          }
        },
        { upsert: true }
      );
    }

    // -------------------------------
    // 3. If deposit, mark FTD on contact by affiliate_id
    // -------------------------------
    if (goal === 'deposit' && affiliate_id) {
      await contactsCollection.updateMany(
        { affiliate_id: affiliate_id },
        {
          $set: {
            ftd: true,
            ftd_amount: amount || sale_amount,
            ftd_date: new Date(),
            updatedAt: new Date()
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Postback '${goal}' recorded successfully`,
      isDuplicate: false
    });

  } catch (error: any) {
    console.error('Postback error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

