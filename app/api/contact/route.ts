import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract required fields
    const {
      name,
      email,
      type,
      affiliate_id,
      url_id,
      sub1
    } = body;

    // Basic validation
    if (!email || !type) {
      return NextResponse.json(
        { success: false, message: 'Email and type are required' },
        { status: 400 }
      );
    }

    let affiliatePosted = false;
    let trackingLink = '';

    // Only submit to Hooplaseft for affiliate type
    if (type === 'affiliate') {
      try {
        // Build query parameters
        const params = new URLSearchParams({
          affiliate_id: affiliate_id || '2',
          url_id: url_id || '2',
        });

        // Add optional parameters
        if (sub1) params.append('sub1', sub1);
        if (name) params.append('name', name);
        if (email) params.append('email', email);

        // Construct Hooplaseft API URL
        const hooplaseftUrl = `https://hooplaseft.com/api/v3/offer/2?${params.toString()}`;

        // Make GET request to Hooplaseft
        const response = await fetch(hooplaseftUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Next.js Contact Form API',
          },
        });

        // Check if request was successful
        if (response.ok) {
          affiliatePosted = true;
          // Use the Hooplaseft URL as the tracking link
          trackingLink = hooplaseftUrl;
        } else {
          // Log error but don't fail the request
          console.error('Hooplaseft API error:', response.status, response.statusText);
        }
      } catch (error) {
        // Log error but don't fail the request
        console.error('Hooplaseft API request failed:', error);
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        affiliatePosted,
        trackingLink
      }
    });

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
