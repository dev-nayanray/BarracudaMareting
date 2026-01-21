import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getContactsCollection, Contact } from '@/lib/mongodb';

// GET /api/admin/contacts - Get all contacts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const contactsCollection = getContactsCollection(db);

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build filter
    const filter: any = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await contactsCollection.countDocuments(filter);

    // Fetch contacts
    const contacts = await contactsCollection
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get stats
    const stats = await contactsCollection.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          affiliateStats: [
            { $match: { type: 'affiliate' } },
            { $group: { _id: '$affiliate_status', count: { $sum: 1 } } }
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
          ftdStats: [
            { $match: { ftd: true } },
            { $count: 'count' }
          ],
          ftdAmountSum: [
            { $match: { ftd: true, ftd_amount: { $exists: true } } },
            { $group: { _id: null, total: { $sum: '$ftd_amount' } } }
          ]
        }
      }
    ]).toArray();

    const statsData = stats[0];

    // Calculate FTD count and total amount
    const ftdCount = statsData.ftdStats?.[0]?.count || 0;
    const totalFtdAmount = statsData.ftdAmountSum?.[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: contacts.map(contact => ({
        ...contact,
        id: contact._id?.toString(),
        _id: undefined
      })),
      stats: {
        total: statsData.total[0]?.count || 0,
        byType: statsData.byType.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byStatus: statsData.byStatus.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        affiliateStats: statsData.affiliateStats.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        thisMonth: statsData.thisMonth[0]?.count || 0,
        ftdCount: ftdCount,
        totalFtdAmount: totalFtdAmount
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/contacts - Export contacts
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const contactsCollection = getContactsCollection(db);

    const body = await request.json();
    const { type, status, search } = body;

    // Build filter
    const filter: any = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch all contacts matching filter
    const contacts = await contactsCollection.find(filter).sort({ createdAt: -1 }).toArray();

    // Generate CSV
    const headers = [
      'Name', 'Email', 'Company', 'Type', 'Status', 'Messenger', 'Username',
      'Affiliate ID', 'Sub1', 'Traffic Source', 'Campaign ID',
      'FTD', 'FTD Amount', 'FTD Date', 'Created At'
    ];

    const csvRows = [headers.join(',')];

    for (const contact of contacts) {
      const row = [
        `"${contact.name || ''}"`,
        `"${contact.email || ''}"`,
        `"${contact.company || ''}"`,
        `"${contact.type || ''}"`,
        `"${contact.status || ''}"`,
        `"${contact.messenger || ''}"`,
        `"${contact.username || ''}"`,
        `"${contact.affiliate_id || ''}"`,
        `"${contact.sub1 || ''}"`,
        `"${contact.tracking_source || ''}"`,
        `"${contact.campaign_id || ''}"`,
        contact.ftd ? 'Yes' : 'No',
        contact.ftd_amount || '',
        contact.ftd_date ? new Date(contact.ftd_date).toISOString() : '',
        contact.createdAt ? new Date(contact.createdAt).toISOString() : ''
      ];
      csvRows.push(row.join(','));
    }

    return new NextResponse(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error: any) {
    console.error('Export contacts error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

