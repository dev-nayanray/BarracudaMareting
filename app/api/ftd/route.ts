import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract required fields for FTD postback
    const {
      affiliate_id,
      url_id,
      sub1, // aff_click_id
      deposit_amount
    } = body;

    // Basic validation
    if (!affiliate_id || !deposit_amount) {
      return NextResponse.json(
        { success: false, message: 'Affiliate ID and deposit amount are required' },
        { status: 400 }
      );
    }

    // Build redirect URL for affiliate to access the offer/dashboard
    const redirectUrl = `https://hooplaseft.com/api/v3/offer/2?affiliate_id=${affiliate_id}&url_id=${url_id || '2'}`;

    // Non-blocking FTD postback - don't fail if hooplaseft.com is unavailable
    const ftdPostbackCall = async () => {
      try {
        // Build query parameters for Hooplaseft FTD postback
        const params = new URLSearchParams({
          affiliate_id: affiliate_id.toString(),
          url_id: url_id || '2',
          deposit_amount: deposit_amount.toString()
        });

        // Add optional sub1 (click ID)
        if (sub1) params.append('sub1', sub1);

        // Construct Hooplaseft API URL for FTD
        const hooplaseftUrl = `https://hooplaseft.com/api/v3/offer/2?${params.toString()}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(hooplaseftUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Next.js FTD Postback API',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log('FTD postback sent to Hooplaseft:', response.ok ? 'success' : `error ${response.status}`);
      } catch (error) {
        // Log but don't fail - FTD simulation should succeed regardless
        console.log('FTD postback to Hooplaseft failed (non-critical):', error.message);
      }
    };

    // Trigger non-blocking FTD postback
    ftdPostbackCall().catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'FTD simulated successfully! Your tracking has been recorded.',
      redirectUrl, // Include redirect URL for frontend to redirect affiliate
      data: {
        ftdPosted: true,
        affiliateId: affiliate_id,
        commission: deposit_amount * 0.3 // 30% commission estimate
      }
    });

  } catch (error) {
    console.error('FTD API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

