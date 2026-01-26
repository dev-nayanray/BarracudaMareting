import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getContactsCollection, getPostbacksCollection, getConversionsCollection, Contact, Postback, Conversion } from '@/lib/mongodb';
import { PrivateAPI, GOAL_TYPES, ClicksAPI } from '@/lib/private-api';

// Hooplaseft API Configuration
const HOOPLASEFT_CONFIG = {
  baseUrl: 'https://hooplaseft.com/api/v3',
  goalRegistration: '5',  // Registration Goal
  goalDeposit: '6',       // Deposit Goal
  defaultHash: process.env.HOOPLASEFT_HASH || 'eb20d583f46d5dc303e251607e04d240'
};

// Helper function to send Hooplaseft goal postback
async function sendHooplaseftPostback(
  goalId: string,
  clickId: string,
  affiliateId: string,
  hash: string,
  params: Record<string, string> = {}
): Promise<{ success: boolean; message: string }> {
  try {
    const urlParams = new URLSearchParams({
      hash: hash,
      click_id: clickId,
      affiliate_id: affiliateId,
      ...params
    });

    const url = `${HOOPLASEFT_CONFIG.baseUrl}/goal/${goalId}?${urlParams.toString()}`;
    console.log(`🎯 Sending Hooplaseft Goal #${goalId} postback:`, url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Next.js Affiliate API',
        'Accept': 'application/json'
      }
    });

    const text = await response.text();
    console.log(`✅ Hooplaseft Goal #${goalId} response:`, text.substring(0, 200));

    return { success: response.ok, message: text };
  } catch (error: any) {
    console.error(`❌ Hooplaseft Goal #${goalId} error:`, error.message);
    return { success: false, message: error.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const contactsCollection = getContactsCollection(db);
    const postbacksCollection = getPostbacksCollection(db);
    const conversionsCollection = getConversionsCollection(db);

    const body = await request.json();

    const {
      name,
      email,
      company,
      type,              // "affiliate" or "user"
      messenger,
      username,
      message,
      affiliate_id,
      url_id,
      sub1,
      sub2,
      sub3,
      campaignId,
      trackingSource,
      deposit_amount,
      sale_amount
    } = body;

    // -------------------------------
    // 1. Validation
    // -------------------------------
    if (!name || !email || !company || !type) {
      return NextResponse.json(
        { success: false, message: 'Name, email, company, and type are required.' },
        { status: 400 }
      );
    }

    // -------------------------------
    // 2. Check for duplicate email
    // -------------------------------
    const existingContact = await contactsCollection.findOne({ email });
    if (existingContact) {
      return NextResponse.json(
        { success: false, message: 'This email has already been registered.' },
        { status: 409 }
      );
    }

    // -------------------------------
    // 3. Save contact to MongoDB
    // -------------------------------
    const contactData = {
      name,
      email,
      company,
      type,
      messenger: messenger || undefined,
      username: username || undefined,
      message: message || undefined,
      affiliate_id: affiliate_id || undefined,
      url_id: url_id || undefined,
      sub1: sub1 || undefined,
      sub2: sub2 || undefined,
      sub3: sub3 || undefined,
      campaign_id: campaignId || undefined,
      tracking_source: trackingSource || 'contact_form',
      status: 'new',
      affiliate_status: type === 'affiliate' ? 'pending' : undefined,
      affiliateRegistered: false,
      affiliateError: undefined,
      ftd: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const contactResult = await contactsCollection.findOneAndUpdate(
      { email },
      { $setOnInsert: contactData },
      { upsert: true, returnDocument: 'after' }
    );
    
    const isNewContact = !!contactResult?.createdAt && contactResult.createdAt >= new Date(Date.now() - 1000);
    
    if (!isNewContact) {
      return NextResponse.json(
        { success: false, message: 'This email has already been registered.' },
        { status: 409 }
      );
    }
    
    console.log('✅ Contact saved to MongoDB:', contactResult?._id);

    // -------------------------------
    // 4. Affiliate Registration / Tracking
    // -------------------------------
    if (type === 'affiliate') {
      // Build the tracking URL - this will be clicked automatically to get sub1
      const trackingUrl = `${HOOPLASEFT_CONFIG.baseUrl}/offer/2?affiliate_id=${affiliate_id || '2'}&url_id=${url_id || '2'}&source=${trackingSource || 'contact_form'}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&company=${encodeURIComponent(company)}&unique=1`;
      
      console.log(`🎯 Tracking URL: ${trackingUrl}`);

      // Make the request with redirect follow to capture sub1 from the final URL
      fetch(trackingUrl, {
        method: 'GET',
        headers: { 
          'User-Agent': 'Next.js Affiliate API',
          'Accept': 'application/json'
        },
        redirect: 'follow'
      })
      .then(async (response) => {
        const finalUrl = response.url;
        console.log(`🎯 Redirect URL: ${finalUrl}`);
        
        // Extract sub1 (click hash) from the final URL
        const urlObj = new URL(finalUrl);
        const clickedSub1 = urlObj.searchParams.get('sub1') || urlObj.searchParams.get('click_id');
        
        if (!clickedSub1) {
          console.log('⚠️ No sub1 or click_id found in redirect URL');
          return;
        }
        
        console.log(`✅ Captured sub1: ${clickedSub1}`);
        
        // Update contact with captured sub1
        await contactsCollection.updateOne(
          { _id: contactResult?._id },
          { 
            $set: { 
              sub1: clickedSub1,
              clicked_url: finalUrl,
              updatedAt: new Date()
            }
          }
        );
        
        // Send Registration Postback (Goal #5) with the captured sub1
        console.log(`🎯 Sending Registration Postback (Goal #5) with sub1: ${clickedSub1}`);
        const registrationResult = await sendHooplaseftPostback(
          HOOPLASEFT_CONFIG.goalRegistration,
          clickedSub1,  // Use sub1 as click_id
          affiliate_id || '2',
          clickedSub1,  // Use sub1 as hash
          {
            sub1: clickedSub1,
            sub2: sub2 || '',
            sub3: sub3 || '',
            goal_type: 'registration',
            name: encodeURIComponent(name),
            email: encodeURIComponent(email),
            company: encodeURIComponent(company)
          }
        );
        
        console.log(`✅ Registration postback success: ${registrationResult.success}`);
        
        // Save registration conversion
        await conversionsCollection.findOneAndUpdate(
          { click_id: clickedSub1, goal_id: HOOPLASEFT_CONFIG.goalRegistration },
          {
            $setOnInsert: {
              click_id: clickedSub1,
              affiliate_id: affiliate_id || '2',
              goal_id: HOOPLASEFT_CONFIG.goalRegistration,
              goal_type: 'registration',
              offer_id: '2',
              amount: 0,
              sale_amount: undefined,
              status: registrationResult.success ? 'approved' : 'pending',
              sub1: clickedSub1,
              sub2: sub2 || undefined,
              sub3: sub3 || undefined,
              metadata: { name, email, company, deposit_amount: deposit_amount || undefined },
              createdAt: new Date()
            },
            $set: { updatedAt: new Date() }
          },
          { upsert: true }
        );
        
        // Update contact with registration status
        if (registrationResult.success) {
          await contactsCollection.updateOne(
            { _id: contactResult?._id },
            { 
              $set: { 
                affiliateRegistered: true,
                affiliateError: undefined,
                updatedAt: new Date()
              }
            }
          );
          
          // Auto-complete FTD
          const depositAmount = deposit_amount || 100;
          await contactsCollection.updateOne(
            { _id: contactResult?._id },
            { 
              $set: { 
                ftd: true,
                ftd_date: new Date(),
                ftd_amount: depositAmount,
                updatedAt: new Date()
              }
            }
          );
          
          // Send Deposit Postback (Goal #6) for FTD
          console.log(`🎯 Sending Deposit Postback (Goal #6) with sub1: ${clickedSub1}`);
          const depositResult = await sendHooplaseftPostback(
            HOOPLASEFT_CONFIG.goalDeposit,
            clickedSub1,
            affiliate_id || '2',
            clickedSub1,
            {
              sub1: clickedSub1,
              sub2: sub2 || '',
              sub3: sub3 || '',
              goal_type: 'deposit',
              deposit_amount: depositAmount.toString(),
              sale_amount: sale_amount?.toString() || depositAmount.toString()
            }
          );
          
          console.log(`✅ Deposit postback success: ${depositResult.success}`);
          
          // Save deposit conversion
          await conversionsCollection.findOneAndUpdate(
            { click_id: clickedSub1, goal_id: HOOPLASEFT_CONFIG.goalDeposit },
            {
              $setOnInsert: {
                click_id: clickedSub1,
                affiliate_id: affiliate_id || '2',
                goal_id: HOOPLASEFT_CONFIG.goalDeposit,
                goal_type: 'deposit',
                offer_id: '2',
                amount: depositAmount,
                sale_amount: sale_amount || depositAmount,
                status: depositResult.success ? 'approved' : 'pending',
                sub1: clickedSub1,
                sub2: sub2 || undefined,
                sub3: sub3 || undefined,
                metadata: { name, email, company },
                createdAt: new Date()
              },
              $set: { updatedAt: new Date() }
            },
            { upsert: true }
          );
          
          // Save postbacks to tracking collection
          await postbacksCollection.findOneAndUpdate(
            { click_id: clickedSub1, goal: 'registration' },
            {
              $setOnInsert: {
                click_id: clickedSub1,
                affiliate_id: affiliate_id || '2',
                offer_id: undefined,
                goal: 'registration',
                amount: undefined,
                sale_amount: undefined,
                status: 'pending',
                sub1: clickedSub1,
                sub2: sub2 || undefined,
                sub3: sub3 || undefined,
                createdAt: new Date()
              },
              $set: { updatedAt: new Date() }
            },
            { upsert: true }
          );
          
          await postbacksCollection.findOneAndUpdate(
            { click_id: clickedSub1, goal: 'deposit' },
            {
              $setOnInsert: {
                click_id: clickedSub1,
                affiliate_id: affiliate_id || '2',
                offer_id: undefined,
                goal: 'deposit',
                amount: depositAmount,
                sale_amount: sale_amount || depositAmount,
                status: depositResult.success ? 'approved' : 'pending',
                sub1: clickedSub1,
                sub2: sub2 || undefined,
                sub3: sub3 || undefined,
                createdAt: new Date()
              },
              $set: { updatedAt: new Date() }
            },
            { upsert: true }
          );
          
          console.log('✅ All postbacks completed successfully');
        } else {
          await contactsCollection.updateOne(
            { _id: contactResult?._id },
            { 
              $set: { 
                affiliateError: registrationResult.message,
                updatedAt: new Date()
              }
            }
          );
        }
      })
      .catch(async (err) => {
        console.error('❌ Tracking URL fetch error:', err.message);
        await contactsCollection.updateOne(
          { _id: contactResult?._id },
          { 
            $set: { 
              affiliateError: 'Tracking URL fetch failed: ' + err.message,
              updatedAt: new Date()
            }
          }
        );
      });

      // Return success immediately (postbacks are sent asynchronously)
      return NextResponse.json({
        success: true,
        message: 'Affiliate registration submitted successfully.',
        data: {
          affiliatePosted: true,
          isAffiliate: true,
          trackingLink: trackingUrl,
          affiliateId: affiliate_id || '2',
          dashboardUrl: 'https://barracuda-pp.irev.com/affiliates/en/app/dashboard',
          note: 'Your application is under review. You will receive iREV dashboard access within 24 hours via email.'
        }
      });
    }

    // -------------------------------
    // 5. Normal User Registration
    // -------------------------------
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Our team will contact you within 24 hours.',
      data: { isAffiliate: false, posted: true }
    });

  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Internal server error',
        data: { affiliateError: true }
      },
      { status: 500 }
    );
  }
}

