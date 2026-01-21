import { NextResponse } from 'next/server';
import { connectToDatabase, getConversionsCollection } from '@/lib/mongodb';

// GET /api/admin/conversions/stats - Get conversion statistics
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const conversionsCollection = getConversionsCollection(db);

    // Aggregate statistics
    const stats = await conversionsCollection.aggregate([
      {
        $facet: {
          // Total conversions
          total: [
            { $count: 'count' }
          ],
          
          // By goal type (registration vs deposit)
          byGoalType: [
            { $group: { _id: '$goal_type', count: { $sum: 1 } } }
          ],
          
          // By status
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          
          // Total revenue
          totalAmount: [
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          
          // Approved conversions
          approvedCount: [
            { $match: { status: 'approved' } },
            { $count: 'count' }
          ],
          
          // Approved amount
          approvedAmount: [
            { $match: { status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          
          // This month conversions
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
          
          // This month revenue
          thisMonthAmount: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
              }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          
          // By affiliate
          byAffiliate: [
            {
              $group: {
                _id: '$affiliate_id',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
          ],
          
          // Conversion rate (approved / total)
          conversionRate: [
            {
              $group: {
                _id: null,
                approved: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'approved'] }, 1, 0]
                  }
                },
                total: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]).toArray();

    const statsData = stats[0];

    // Calculate conversion rate
    const conversionData = statsData.conversionRate[0] || { approved: 0, total: 0 };
    const conversionRate = conversionData.total > 0 
      ? ((conversionData.approved / conversionData.total) * 100).toFixed(2) 
      : '0.00';

    return NextResponse.json({
      success: true,
      data: {
        total: statsData.total[0]?.count || 0,
        byGoalType: statsData.byGoalType.reduce((acc: any, item: any) => {
          acc[item._id] = {
            count: item.count,
            percentage: ((item.count / (statsData.total[0]?.count || 1)) * 100).toFixed(2)
          };
          return acc;
        }, {}),
        byStatus: statsData.byStatus.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalRevenue: statsData.totalAmount[0]?.total || 0,
        approvedConversions: statsData.approvedCount[0]?.count || 0,
        approvedRevenue: statsData.approvedAmount[0]?.total || 0,
        thisMonth: {
          count: statsData.thisMonth[0]?.count || 0,
          revenue: statsData.thisMonthAmount[0]?.total || 0
        },
        topAffiliates: statsData.byAffiliate.map((item: any) => ({
          affiliate_id: item._id,
          conversions: item.count,
          revenue: item.totalAmount
        })),
        conversionRate: `${conversionRate}%`
      }
    });

  } catch (error: any) {
    console.error('Get conversion stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

