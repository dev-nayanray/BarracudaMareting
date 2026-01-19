import { NextRequest, NextResponse } from 'next/server';

// Optional: Import your database client if you have one
// import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      company,
      type,
      messenger,
      username,
      message,
      affiliate_id,
      url_id,
      sub1,
      trackingSource,
      campaignId
    } = body;

    // Validation
    if (!name || !email || !company || !type) {
      return NextResponse.json(
        { success: false, message: 'Name, email, company, and type are required' },
        { status: 400 }
      );
    }

    // 1. Save to local database (uncomment if you have a DB)
    /*
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        company,
        type,
        messenger: messenger || null,
        username: username || null,
        message: message || null,
        affiliateId: affiliate_id || '2',
        urlId: url_id || '2',
        sub1: sub1 || null,
        trackingSource: trackingSource || 'contact_form',
        campaignId: campaignId || null,
        status: 'pending'
      }
    });
    */

    // 2. Handle affiliate registration
    if (type === 'affiliate') {
      // Generate tracking parameters
      const params = new URLSearchParams({
        affiliate_id: affiliate_id || '2',
        url_id: url_id || '2',
        source: trackingSource || 'contact_form'
      });

      if (sub1) params.append('sub1', sub1);
      if (campaignId) params.append('campaign_id', campaignId);
      
      // Add contact info for better tracking
      params.append('name', encodeURIComponent(name));
      params.append('email', encodeURIComponent(email));
      params.append('company', encodeURIComponent(company));

      const trackingLink = `https://hooplaseft.com/api/v3/offer/2?${params.toString()}`;

      // Non-blocking external API call - don't fail if hooplaseft.com is unavailable
      // Start the external API call but don't wait for it
      const externalApiCall = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          await fetch(`https://hooplaseft.com/api/v3/offer/2?${params.toString()}`, {
            method: 'GET',
            headers: {
              'User-Agent': 'Next.js Contact Form API',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          console.log('Hooplaseft API notification sent successfully');
        } catch (error) {
          // Log but don't fail - form submission should succeed regardless
          console.log('Hooplaseft API notification failed (non-critical):', error.message);
        }
      };

      // Trigger non-blocking API call
      externalApiCall().catch(() => {});

      return NextResponse.json({
        success: true,
        message: 'Affiliate application submitted successfully',
        data: {
          affiliatePosted: true,
          isAffiliate: true, // Critical flag for frontend to show affiliate content
          trackingLink,
          affiliateId: affiliate_id || '2',
          dashboardUrl: 'https://barracuda-pp.irev.com/affiliates/en/app/dashboard',
          note: 'Your application is under review. You will receive iREV dashboard access within 24 hours via email.'
        }
      });
    }

    // 3. Non-affiliate submission (advertiser, influencer, etc.)
    // Always include isAffiliate flag for frontend consistency
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully. Our team will contact you within 24 hours.',
      data: {
        posted: true,
        isAffiliate: false // Explicitly mark as non-affiliate
      }
    });

  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Internal server error',
        data: {
          affiliateError: true
        }
      },
      { status: 500 }
    );
  }
}

// Helper function to generate random password
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper function to send email notification (if you have email setup)
/*
async function sendAffiliateNotification(data) {
  // Implement your email sending logic here
  // Example using Resend, SendGrid, Nodemailer, etc.
}
*/