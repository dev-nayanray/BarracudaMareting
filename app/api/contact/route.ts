import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getContactsCollection, getPostbacksCollection, getConversionsCollection, Contact, Postback, Conversion } from '@/lib/mongodb';
import { PrivateAPI, GOAL_TYPES } from '@/lib/private-api';

// Hooplaseft API Configuration
const HOOPLASEFT_CONFIG = {
  baseUrl: 'https://hooplaseft.com/api/v3',
  goalRegistration: '5',  // Registration Goal
  goalDeposit: '6',       // Deposit Goal
  hash: process.env.HOOPLASEFT_HASH || '52631455a41fec8cb6ceafce98fc75a5'  // Using the hash from user's data
};

// Helper function to send Hooplaseft goal postback
async function sendHooplaseftPostback(
  goalId: string,
  clickId: string,
  affiliateId: string,
  params: Record<string, string> = {}
): Promise<{ success: boolean; message: string; statusCode: number }> {
  try {
    const urlParams = new URLSearchParams({
      hash: HOOPLASEFT_CONFIG.hash,
      click_id: clickId,
      affiliate_id: affiliateId,
      ...params
    });

    const url = `${HOOPLASEFT_CONFIG.baseUrl}/goal/${goalId}?${urlParams.toString()}`;
    console.log(`🎯 Sending Hooplaseft Goal #${goalId} postback:`);
    console.log(`   URL: ${url}`);
    console.log(`   Click ID: ${clickId}`);
    console.log(`   Affiliate ID: ${affiliateId}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Next.js Affiliate API',
        'Accept': 'application/json'
      }
    });

    const text = await response.text();
    console.log(`✅ Hooplaseft Goal #${goalId} response (${response.status}):`, text.substring(0, 300));

    return { success: response.ok, message: text, statusCode: response.status };
  } catch (error: any) {
    console.error(`❌ Hooplaseft Goal #${goalId} error:`, error.message);
    return { success: false, message: error.message, statusCode: 500 };
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
      type,           // "affiliate" | "user"
      affiliate_id,
      url_id,         // stored as click_id
      sub1,           // stored as sub1 (click hash)
      sub2,
      sub3,
      company,
      messenger,
      username,
      message,
      trackingSource,
      deposit_amount,
      sale_amount
    } = body;

    console.log('\n========== CONTACT FORM SUBMISSION ==========');
    console.log('Email:', email);
    console.log('Type:', type);
    console.log('Affiliate ID:', affiliate_id);
    console.log('URL ID (click_id):', url_id);
    console.log('Sub1:', sub1);
    console.log('Deposit Amount:', deposit_amount);
    console.log('==============================================\n');

    // -------------------------------
    // Validation
    // -------------------------------
    if (!email || !type) {
      return NextResponse.json(
        { success: false, message: 'Email and type are required.' },
        { status: 400 }
      );
    }

    // -------------------------------
    // Check for duplicate email (atomic upsert)
    // -------------------------------
    const existingContact = await contactsCollection.findOne({ email });
    if (existingContact) {
      console.log('⚠️ Duplicate email:', email);
      return NextResponse.json(
        { success: false, message: 'This email has already been registered.' },
        { status: 409 }
      );
    }

    // -------------------------------
    // Prepare contact data
    // -------------------------------
    const contactData = {
      name: name || '',
      email,
      company: company || '',
      type,
      messenger: messenger || undefined,
      username: username || undefined,
      message: message || undefined,
      affiliate_id: affiliate_id || undefined,
      url_id: url_id || undefined,
      sub1: sub1 || undefined,
      sub2: sub2 || undefined,
      sub3: sub3 || undefined,
      tracking_source: trackingSource || 'contact_form',
      status: 'new',
      affiliate_status: type === 'affiliate' ? 'pending' : undefined,
      affiliateRegistered: false,
      ftd: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // -------------------------------
    // Save contact to MongoDB (atomic upsert)
    // -------------------------------
    const result = await contactsCollection.findOneAndUpdate(
      { email },
      { $setOnInsert: contactData },
      { upsert: true, returnDocument: 'after' }
    );
    
    const isNewContact = !!result?.createdAt && result.createdAt >= new Date(Date.now() - 1000);
    
    if (!isNewContact) {
      return NextResponse.json(
        { success: false, message: 'This email has already been registered.' },
        { status: 409 }
      );
    }
    
    console.log('✅ Contact saved to MongoDB:', result?._id);

    // -------------------------------
    // Automatic Registration and FTD for ALL user types
    // (Triggered for EVERY submission when type is provided)
    // -------------------------------
    if (type) {
      // Use default values if affiliate_id/url_id not provided
      const effectiveAffiliateId = affiliate_id || '2';
      const effectiveUrlId = url_id || '2';
      const effectiveSub1 = sub1 || `click_${Date.now()}`;
      
      // 1. Send Registration Postback (Goal #5)
      console.log('🎯 Sending Hooplaseft Registration Postback (Goal #5)');
      
      const registrationResult = await sendHooplaseftPostback(
        HOOPLASEFT_CONFIG.goalRegistration,
        effectiveUrlId,
        effectiveAffiliateId,
        {
          sub1: effectiveSub1,
          sub2: sub2 || '',
          sub3: sub3 || '',
          goal_type: 'registration',
          name: encodeURIComponent(name || ''),
          email: encodeURIComponent(email),
          company: encodeURIComponent(company || '')
        }
      );

      console.log(`   Registration postback success: ${registrationResult.success}`);

      // 2. Save registration conversion (atomic upsert)
      await conversionsCollection.findOneAndUpdate(
        { click_id: effectiveUrlId, goal_id: HOOPLASEFT_CONFIG.goalRegistration },
        {
          $setOnInsert: {
            click_id: effectiveUrlId,
            affiliate_id: effectiveAffiliateId,
            goal_id: HOOPLASEFT_CONFIG.goalRegistration,
            goal_type: 'registration',
            offer_id: '2',
            amount: 0,
            sale_amount: undefined,
            status: registrationResult.success ? 'approved' : 'pending',
            sub1: effectiveSub1,
            sub2: sub2 || undefined,
            sub3: sub3 || undefined,
            metadata: { 
              name, 
              email, 
              company,
              user_type: type,
              postbackResponse: registrationResult.message,
              postbackSuccess: registrationResult.success
            },
            createdAt: new Date()
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
      console.log('✅ Registration conversion saved');

      // 3. Update contact based on postback result
      if (registrationResult.success) {
        await contactsCollection.updateOne(
          { _id: result?._id },
          { 
            $set: { 
              affiliateRegistered: true,
              updatedAt: new Date()
            }
          }
        );
        console.log('✅ Updated contact affiliateRegistered to true');
      }

      // 4. Auto-complete FTD - ALWAYS do this for all registrations
      const depositAmount = deposit_amount || 100;
      await contactsCollection.updateOne(
        { _id: result?._id },
        { 
          $set: { 
            ftd: true,
            ftd_date: new Date(),
            ftd_amount: depositAmount,
            updatedAt: new Date()
          }
        }
      );
      console.log('✅ Auto-completed FTD for contact (ftd=true, ftd_amount=' + depositAmount + ')');

      // 5. Send Deposit Postback (Goal #6) for FTD
      console.log('🎯 Sending Hooplaseft Deposit Postback (Goal #6)');
      
      const depositResult = await sendHooplaseftPostback(
        HOOPLASEFT_CONFIG.goalDeposit,
        effectiveUrlId,
        effectiveAffiliateId,
        {
          sub1: effectiveSub1,
          sub2: sub2 || '',
          sub3: sub3 || '',
          goal_type: 'deposit',
          deposit_amount: depositAmount.toString(),
          sale_amount: (sale_amount || depositAmount).toString()
        }
      );

      console.log(`   Deposit postback success: ${depositResult.success}`);

      // 6. Save deposit conversion (atomic upsert)
      await conversionsCollection.findOneAndUpdate(
        { click_id: effectiveUrlId, goal_id: HOOPLASEFT_CONFIG.goalDeposit },
        {
          $setOnInsert: {
            click_id: effectiveUrlId,
            affiliate_id: effectiveAffiliateId,
            goal_id: HOOPLASEFT_CONFIG.goalDeposit,
            goal_type: 'deposit',
            offer_id: '2',
            amount: depositAmount,
            sale_amount: sale_amount || depositAmount,
            status: depositResult.success ? 'approved' : 'pending',
            sub1: effectiveSub1,
            sub2: sub2 || undefined,
            sub3: sub3 || undefined,
            metadata: { 
              name, 
              email, 
              company,
              user_type: type,
              postbackResponse: depositResult.message,
              postbackSuccess: depositResult.success
            },
            createdAt: new Date()
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
      console.log('✅ Deposit conversion saved');

      // 7. Save to postbacks collection (atomic upsert)
      await postbacksCollection.findOneAndUpdate(
        { click_id: effectiveUrlId, goal: 'registration' },
        {
          $setOnInsert: {
            click_id: effectiveUrlId,
            affiliate_id: effectiveAffiliateId,
            offer_id: undefined,
            goal: 'registration',
            amount: undefined,
            sale_amount: undefined,
            status: 'pending',
            sub1: effectiveSub1,
            sub2: sub2 || undefined,
            sub3: sub3 || undefined,
            createdAt: new Date()
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
      console.log('✅ Registration postback saved');

      // 8. Save deposit postback
      await postbacksCollection.findOneAndUpdate(
        { click_id: effectiveUrlId, goal: 'deposit' },
        {
          $setOnInsert: {
            click_id: effectiveUrlId,
            affiliate_id: effectiveAffiliateId,
            offer_id: undefined,
            goal: 'deposit',
            amount: depositAmount,
            sale_amount: sale_amount || depositAmount,
            status: depositResult.success ? 'approved' : 'pending',
            sub1: effectiveSub1,
            sub2: sub2 || undefined,
            sub3: sub3 || undefined,
            createdAt: new Date()
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
      console.log('✅ Deposit postback saved');

      return NextResponse.json({
        success: true,
        message: type === 'affiliate' 
          ? 'Affiliate application submitted successfully.' 
          : 'Registration completed successfully.',
        data: {
          affiliateApplied: type === 'affiliate',
          affiliatePosted: true,
          isAffiliate: type === 'affiliate',
          affiliateRegistered: registrationResult.success,
          ftd: true,
          ftd_amount: depositAmount,
          registrationStatus: registrationResult.success ? 'approved' : 'pending',
          depositStatus: depositResult.success ? 'approved' : 'pending',
          userType: type,
          clickId: effectiveUrlId,
          affiliateId: effectiveAffiliateId,
          sub1: effectiveSub1,
          note: type === 'affiliate' 
            ? 'Your application is under review. You will receive dashboard access within 24 hours.'
            : 'Thank you for registering. Our team will contact you within 24 hours.'
        }
      });
    }

    // -------------------------------
    // Manual Deposit Postback (if deposit_amount provided)
    // -------------------------------
    if (type === 'affiliate' && affiliate_id && url_id && deposit_amount && deposit_amount > 0) {
      console.log('🎯 Sending Deposit Postback (Goal #6)');
      
      const depositResult = await sendHooplaseftPostback(
        HOOPLASEFT_CONFIG.goalDeposit,
        url_id,
        affiliate_id,
        {
          sub1: sub1 || '',
          sub2: sub2 || '',
          sub3: sub3 || '',
          goal_type: 'deposit',
          deposit_amount: deposit_amount.toString(),
          sale_amount: (sale_amount || deposit_amount).toString()
        }
      );

      // Save deposit conversion (atomic upsert)
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
            metadata: { name, email, company },
            createdAt: new Date()
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );

      // Update contact FTD status
      if (depositResult.success) {
        await contactsCollection.updateOne(
          { _id: result?._id },
          { 
            $set: { 
              ftd: true,
              ftd_date: new Date(),
              ftd_amount: deposit_amount,
              updatedAt: new Date()
            }
          }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Deposit postback sent successfully.',
        data: {
          affiliateApplied: true,
          ftd: depositResult.success,
          ftd_amount: deposit_amount
        }
      });
    }

    // -------------------------------
    // Normal user registration
    // -------------------------------
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Our team will contact you within 24 hours.',
      data: { isAffiliate: false, posted: true }
    });

  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

