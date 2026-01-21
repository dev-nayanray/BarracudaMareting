import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getFTDsCollection, getContactsCollection, FTD } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const ftdCollection = getFTDsCollection(db);
    const contactsCollection = getContactsCollection(db);

    const body = await request.json();

    const {
      click_id,
      affiliate_id,
      offer_id,
      amount,
      sale_amount,
      status
    } = body;

    // -------------------------------
    // Validation
    // -------------------------------
    if (!click_id || !affiliate_id || !amount) {
      return NextResponse.json(
        { success: false, message: 'click_id, affiliate_id and amount are required' },
        { status: 400 }
      );
    }

    // -------------------------------
    // Atomic upsert FTD to MongoDB (prevents duplicate key errors)
    // -------------------------------
    const ftdData = {
      click_id,
      affiliate_id,
      offer_id: offer_id || undefined,
      amount: typeof amount === 'string' ? parseFloat(amount) : amount,
      sale_amount: sale_amount ? (typeof sale_amount === 'string' ? parseFloat(sale_amount) : sale_amount) : undefined,
      status: status || 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const ftdResult = await ftdCollection.findOneAndUpdate(
      { click_id: click_id },
      {
        $setOnInsert: ftdData,
        $set: { updatedAt: new Date() }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const isNewFTD = !!ftdResult?.createdAt && ftdResult.createdAt >= new Date(Date.now() - 1000);
    
    if (!isNewFTD) {
      console.log('Duplicate FTD ignored:', click_id);
      return NextResponse.json({
        success: true,
        message: 'Duplicate FTD ignored',
        data: {
          click_id,
          isDuplicate: true
        },
        isDuplicate: true
      });
    }

    console.log('✅ FTD saved to MongoDB:', ftdResult?._id);

    // -------------------------------
    // Update associated contact
    // -------------------------------
    await contactsCollection.updateMany(
      {
        $or: [
          { sub1: click_id },
          { affiliate_id: affiliate_id }
        ]
      },
      {
        $set: {
          ftd: true,
          ftd_amount: ftdData.amount,
          ftd_date: new Date(),
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'FTD recorded successfully',
      data: {
        click_id,
        affiliate_id,
        amount: ftdData.amount,
        sale_amount: ftdData.sale_amount,
        status: ftdData.status,
        isDuplicate: false
      }
    });

  } catch (error: any) {
    console.error('FTD API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

