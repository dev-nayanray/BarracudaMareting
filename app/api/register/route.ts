import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getContactsCollection, getPostbacksCollection, getConversionsCollection, Contact, Postback, Conversion } from '@/lib/mongodb';
import { PrivateAPI, GOAL_TYPES } from '@/lib/private-api';

// Hooplaseft API Configuration (for fallback/external postbacks)
const HOOPLASEFT_CONFIG = {
  baseUrl: 'https://hooplaseft.com/api/v3',
  // Goal IDs from the task
  goalRegistration: '5',  // Registration Goal
  goalDeposit: '6',       // Deposit Goal
  // TODO: Replace with actual hash from Hooplaseft dashboard
  hash: process.env.HOOPLASEFT_HASH || 'eb20d583f46d5dc303e251607e04d240'
};

// Helper function to send Hooplaseft goal postback (external API fallback)
async function sendHooplaseftPostback(
  goalId: string,
  clickId: string,
  affiliateId: string,
  params: Record<string, string> = {}
): Promise<{ success: boolean; message: string }> {
  try {
    const urlParams = new URLSearchParams({
      hash: HOOPLASEFT_CONFIG.hash,
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
      url_id,            // aff_click_id
      sub1,
      sub2,
      sub3,
      campaignId,
      trackingSource,
      deposit_amount,    // Optional: for FTD
      sale_amount        // Optional: for FTD
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
    // 2. Check for duplicate email (atomic upsert)
    // -------------------------------
    const existingContact = await contactsCollection.findOne({ email });
    if (existingContact) {
      return NextResponse.json(
        { success: false, message: 'This email has already been registered.' },
        { status: 409 }
      );
    }

    // -------------------------------
    // 3. Save contact to MongoDB (atomic upsert)
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

    // Use atomic upsert to prevent duplicate email errors
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
      // 4a. Build Hooplaseft tracking URL (optional)
      const params = new URLSearchParams({
        affiliate_id: affiliate_id || '2',
        url_id: url_id || '2',
        source: trackingSource || 'contact_form',
        name: encodeURIComponent(name),
        email: encodeURIComponent(email),
        company: encodeURIComponent(company)
      });
      if (sub1) params.append('sub1', encodeURIComponent(sub1));
      if (campaignId) params.append('campaign_id', encodeURIComponent(campaignId));
      if (deposit_amount) params.append('deposit_amount', deposit_amount.toString());
      if (sale_amount) params.append('sale_amount', sale_amount.toString());
      params.append('unique', '1'); // Marks first-time deposit

      const trackingLink = `https://hooplaseft.com/api/v3/offer/2?${params.toString()}`;

      // Call Hooplaseft API (non-blocking)
      fetch(trackingLink, {
        method: 'GET',
        headers: { 'User-Agent': 'Next.js Affiliate API' }
      }).catch((err) => console.log('Hooplaseft API call failed:', err.message));

      // 4b. Hooplaseft Registration Postback (Goal #5)
      if (affiliate_id && url_id) {
        console.log('🎯 Sending Hooplaseft Registration Postback (Goal #5)');
        
        // Send Hooplaseft Registration Goal Postback
        const registrationResult = await sendHooplaseftPostback(
          HOOPLASEFT_CONFIG.goalRegistration, // Goal ID: 5
          url_id,
          affiliate_id,
          {
            sub1: sub1 || '',
            sub2: sub2 || '',
            sub3: sub3 || '',
            goal_type: 'registration',
            name: encodeURIComponent(name),
            email: encodeURIComponent(email),
            company: encodeURIComponent(company)
          }
        );

        // Save conversion to MongoDB (atomic upsert - PREVENTS DUPLICATE KEY ERROR)
        await conversionsCollection.findOneAndUpdate(
          { click_id: url_id, goal_id: HOOPLASEFT_CONFIG.goalRegistration },
          {
            $setOnInsert: {
              click_id: url_id,
              affiliate_id: affiliate_id,
              goal_id: HOOPLASEFT_CONFIG.goalRegistration,
              goal_type: 'registration',
              offer_id: '2',
              amount: 0,
              sale_amount: undefined,
              status: registrationResult.success ? 'approved' : 'pending',
              sub1: sub1 || undefined,
              sub2: sub2 || undefined,
              sub3: sub3 || undefined,
              metadata: {
                name,
                email,
                company,
                deposit_amount: deposit_amount || undefined
              },
              createdAt: new Date()
            },
            $set: { updatedAt: new Date() }
          },
          { upsert: true }
        );
        console.log('✅ Registration conversion saved to MongoDB');

        // Update contact based on postback result
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
          console.log('✅ Updated contact affiliateRegistered to true');

          // 4e. Auto-complete FTD on successful registration
          const depositAmount = deposit_amount || 100; // Default to 100 if not provided
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
          console.log('✅ Auto-completed FTD for contact:', contactResult?._id);

          // 4f. Trigger Hooplaseft Deposit Postback (Goal #6) for FTD
          console.log('🎯 Sending Hooplaseft Deposit Postback (Goal #6)');
          
          const depositResult = await sendHooplaseftPostback(
            HOOPLASEFT_CONFIG.goalDeposit, // Goal ID: 6
            url_id,
            affiliate_id,
            {
              sub1: sub1 || '',
              sub2: sub2 || '',
              sub3: sub3 || '',
              goal_type: 'deposit',
              deposit_amount: depositAmount.toString(),
              sale_amount: sale_amount?.toString() || depositAmount.toString()
            }
          );

          // Save deposit conversion to MongoDB (atomic upsert - PREVENTS DUPLICATE KEY ERROR)
          await conversionsCollection.findOneAndUpdate(
            { click_id: url_id, goal_id: HOOPLASEFT_CONFIG.goalDeposit },
            {
              $setOnInsert: {
                click_id: url_id,
                affiliate_id: affiliate_id,
                goal_id: HOOPLASEFT_CONFIG.goalDeposit,
                goal_type: 'deposit',
                offer_id: '2',
                amount: depositAmount,
                sale_amount: sale_amount || depositAmount,
                status: depositResult.success ? 'approved' : 'pending',
                sub1: sub1 || undefined,
                sub2: sub2 || undefined,
                sub3: sub3 || undefined,
                metadata: {
                  name,
                  email,
                  company
                },
                createdAt: new Date()
              },
              $set: { updatedAt: new Date() }
            },
            { upsert: true }
          );
          console.log('✅ Deposit conversion saved to MongoDB');
        } else {
          // Mark as having an error but don't fail the registration
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
      }

      // 4c. Hooplaseft Deposit Postback (Goal #6) - if deposit_amount exists and no auto-FTD
      if (affiliate_id && url_id && deposit_amount && deposit_amount > 0) {
        console.log('🎯 Sending Hooplaseft Deposit Postback (Goal #6)');
        
        const depositResult = await sendHooplaseftPostback(
          HOOPLASEFT_CONFIG.goalDeposit, // Goal ID: 6
          url_id,
          affiliate_id,
          {
            sub1: sub1 || '',
            sub2: sub2 || '',
            sub3: sub3 || '',
            goal_type: 'deposit',
            deposit_amount: deposit_amount.toString(),
            sale_amount: sale_amount?.toString() || deposit_amount.toString()
          }
        );

        // Save deposit conversion to MongoDB (atomic upsert - PREVENTS DUPLICATE KEY ERROR)
        await conversionsCollection.findOneAndUpdate(
          { click_id: url_id, goal_id: HOOPLASEFT_CONFIG.goalDeposit },
          {
            $setOnInsert: {
              click_id: url_id,
              affiliate_id: affiliate_id,
              goal_id: HOOPLASEFT_CONFIG.goalDeposit,
              goal_type: 'deposit',
              offer_id: '2',
              amount: deposit_amount,
              sale_amount: sale_amount || deposit_amount,
              status: depositResult.success ? 'approved' : 'pending',
              sub1: sub1 || undefined,
              sub2: sub2 || undefined,
              sub3: sub3 || undefined,
              metadata: {
                name,
                email,
                company
              },
              createdAt: new Date()
            },
            $set: { updatedAt: new Date() }
          },
          { upsert: true }
        );
        console.log('✅ Deposit conversion saved to MongoDB');

        // Update contact based on postback result
        if (depositResult.success) {
          await contactsCollection.updateOne(
            { _id: contactResult?._id },
            { 
              $set: { 
                ftd: true,
                ftd_date: new Date(),
                ftd_amount: deposit_amount,
                updatedAt: new Date()
              }
            }
          );
          console.log('✅ Updated contact FTD status to true');
        }
      }

      // 4d. Also save to postbacks collection for tracking (atomic upsert)
      if (affiliate_id && url_id) {
        await postbacksCollection.findOneAndUpdate(
          { click_id: url_id, goal: 'registration' },
          {
            $setOnInsert: {
              click_id: url_id,
              affiliate_id: affiliate_id,
              offer_id: undefined,
              goal: 'registration',
              amount: undefined,
              sale_amount: undefined,
              status: 'pending',
              sub1: sub1 || undefined,
              sub2: sub2 || undefined,
              sub3: sub3 || undefined,
              createdAt: new Date()
            },
            $set: { updatedAt: new Date() }
          },
          { upsert: true }
        );
        console.log('✅ Postback saved to MongoDB for tracking');
      }

      return NextResponse.json({
        success: true,
        message: 'Affiliate registration submitted successfully.',
        data: {
          affiliatePosted: true,
          isAffiliate: true,
          trackingLink,
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

// -------------------------------
// Helper: Generate random password (if needed)
// -------------------------------
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

