import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getContactsCollection, getFTDsCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const contactsCollection = getContactsCollection(db);
    const ftdCollection = getFTDsCollection(db);

    // Get total contacts
    const total = await contactsCollection.countDocuments();

    // Get contacts this month
    const thisMonth = await contactsCollection.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    // Get counts by type
    const byType = await contactsCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).toArray();

    // Get counts by status
    const byStatus = await contactsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();

    // Get affiliate stats
    const affiliateStats = await contactsCollection.aggregate([
      { $match: { type: 'affiliate' } },
      { $group: { _id: '$affiliate_status', count: { $sum: 1 } } }
    ]).toArray();

    // Get FTD stats
    const totalFTDs = await ftdCollection.countDocuments();
    const totalRevenue = await ftdCollection.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();

    // Format response
    const formatByField = (arr: any[]) => {
      return arr.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
    };

    return NextResponse.json({
      success: true,
      data: {
        total,
        thisMonth,
        byType: formatByField(byType),
        byStatus: formatByField(byStatus),
        affiliateStats: formatByField(affiliateStats),
        ftd: {
          total: totalFTDs,
          revenue: totalRevenue[0]?.total || 0
        }
      }
    });

  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

