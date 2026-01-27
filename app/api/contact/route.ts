import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getContactsCollection, getPostbacksCollection, getConversionsCollection, Contact, Postback, Conversion } from '@/lib/mongodb';
import { PrivateAPI, GOAL_TYPES, ClicksAPI } from '@/lib/private-api';

// Hooplaseft API Configuration
const HOOPLASEFT_CONFIG = {
  baseUrl: 'https://hooplaseft.com/api/v3',
  goalRegistration: '5',  // Registration Goal
  goalDeposit: '6',       // Deposit Goal
  defaultHash: 'eb20d583f46d5dc303e251607e04d240'  // Default hash if not provided
};

// Helper function to generate a unique click hash (sub1)
// This creates a 32-character hex string that Hooplaseft expects
function generateClickHash(): string {
  // Generate a random 16-byte hex string (32 characters)
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to send Hooplaseft goal postback
async function sendHooplaseftPostback(
  goalId: string,
  clickId: string,
  affiliateId: string,
  hash: string,
  params: Record<string, string> = {}
): Promise<{ success: boolean; message: string; statusCode: number }> {
  try {
    const urlParams = new URLSearchParams({
      hash: hash,
      click_id: clickId,
      affiliate_id: affiliateId,
      ...params
    });

    const url = `${HOOPLASEFT_CONFIG.baseUrl}/goal/${goalId}?${urlParams.toString()}`;
    console.log(`🎯 Sending Hooplaseft Goal #${goalId} postback:`);
    console.log(`   URL: ${url}`);
    console.log(`   Click ID: ${clickId}`);
    console.log(`   Affiliate ID: ${affiliateId}`);
    console.log(`   Hash: ${hash}`);

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

// Helper function to get click_id from Hooplaseft by calling the offer URL
async function getHooplaseftClickId(
  affiliateId: string,
  urlId: string,
  params: Record<string, string> = {}
): Promise<{ success: boolean; clickId: string | null; message: string }> {
  try {
    // Build the offer URL that will redirect and give us a click_id
    const urlParams = new URLSearchParams({
      affiliate_id: affiliateId,
      url_id: urlId,
      ...params
    });
    
    const offerUrl = `${HOOPLASEFT_CONFIG.baseUrl}/offer/2?${urlParams.toString()}`;
    console.log(`🎯 Calling Hooplaseft offer URL to get click_id:`);
    console.log(`   URL: ${offerUrl}`);

    // Follow the redirect to get the click_id
    const response = await fetch(offerUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Next.js Affiliate API',
        'Accept': 'application/json'
      },
      redirect: 'follow'
    });

    // Extract click_id from the final URL
    const finalUrl = response.url;
    console.log(`✅ Hooplaseft redirect URL: ${finalUrl}`);
    
    // Try to extract click_id from URL parameters
    const urlObj = new URL(finalUrl);
    const clickId = urlObj.searchParams.get('click_id') || urlObj.searchParams.get('affiliate_id') || urlId;
    
    console.log(`   Extracted click_id: ${clickId}`);
    
    return { success: true, clickId, message: 'Click ID obtained from Hooplaseft' };
  } catch (error: any) {
    console.error(`❌ Failed to get click_id from Hooplaseft:`, error.message);
    return { success: false, clickId: urlId, message: error.message };
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
      const effectiveAffiliateId = affiliate_id || '2';
      
      // Generate a unique hash for this registration if not provided from URL
      // This is the KEY fix: Get a valid hash from Hooplaseft instead of generating random ones
      const hashPattern = /^[a-f0-9]{32,}$/i;
      let effectiveHash: string;
      let effectiveClickId: string;
      
      if (sub1 && hashPattern.test(sub1)) {
        // Use the hash from URL if it's a valid hash
        effectiveHash = sub1;
        effectiveClickId = sub1;
        console.log(`🎯 Using hash from URL: ${effectiveHash}`);
      } else {
        // Call Hooplaseft offer URL to get a valid click with hash
        // This is the KEY fix: Get a real hash from Hooplaseft instead of generating random ones
        console.log(`🎯 No valid sub1 hash, calling Hooplaseft to create click...`);
        const clickResult = await ClicksAPI.createClickAndGetHash(
          effectiveAffiliateId,
          url_id || '1',  // Use url_id 1 (the working offer)
          { name, email, company }
        );
        
        if (clickResult.success && clickResult.hash) {
          effectiveHash = clickResult.hash;
          effectiveClickId = clickResult.clickId || clickResult.hash;
          console.log(`🎯 Got valid hash from Hooplaseft: ${effectiveHash}`);
        } else {
          // Fallback to generated hash if API call fails
          effectiveHash = generateClickHash();
          effectiveClickId = effectiveHash;
          console.log(`🎯 Hooplaseft API failed, using generated hash: ${effectiveHash}`);
        }
      }
      
      console.log(`🎯 Using dynamic click_id: ${effectiveClickId} (sub1: ${sub1}, url_id: ${url_id})`);
      console.log(`🎯 Using hash: ${effectiveHash}`);
      
      // 1. Send Registration Postback (Goal #5)
      console.log('🎯 Sending Hooplaseft Registration Postback (Goal #5)');
      
      const registrationResult = await sendHooplaseftPostback(
        HOOPLASEFT_CONFIG.goalRegistration,
        effectiveClickId,
        effectiveAffiliateId,
        effectiveHash,
        {
          sub1: effectiveClickId,
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
        { click_id: effectiveClickId, goal_id: HOOPLASEFT_CONFIG.goalRegistration },
        {
          $setOnInsert: {
            click_id: effectiveClickId,
            affiliate_id: effectiveAffiliateId,
            goal_id: HOOPLASEFT_CONFIG.goalRegistration,
            goal_type: 'registration',
            offer_id: '2',
            amount: 0,
            sale_amount: undefined,
            status: registrationResult.success ? 'approved' : 'pending',
            sub1: effectiveClickId,
            sub2: sub2 || undefined,
            sub3: sub3 || undefined,
            hash: effectiveHash,
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
        effectiveClickId,
        effectiveAffiliateId,
        effectiveHash,
        {
          sub1: effectiveClickId,
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
        { click_id: effectiveClickId, goal_id: HOOPLASEFT_CONFIG.goalDeposit },
        {
          $setOnInsert: {
            click_id: effectiveClickId,
            affiliate_id: effectiveAffiliateId,
            goal_id: HOOPLASEFT_CONFIG.goalDeposit,
            goal_type: 'deposit',
            offer_id: '2',
            amount: depositAmount,
            sale_amount: sale_amount || depositAmount,
            status: depositResult.success ? 'approved' : 'pending',
            sub1: effectiveClickId,
            sub2: sub2 || undefined,
            sub3: sub3 || undefined,
            hash: effectiveHash,
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
        { click_id: effectiveClickId, goal: 'registration' },
        {
          $setOnInsert: {
            click_id: effectiveClickId,
            affiliate_id: effectiveAffiliateId,
            offer_id: undefined,
            goal: 'registration',
            amount: undefined,
            sale_amount: undefined,
            status: 'pending',
            sub1: effectiveClickId,
            sub2: sub2 || undefined,
            sub3: sub3 || undefined,
            hash: effectiveHash,
            createdAt: new Date()
          },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
      console.log('✅ Registration postback saved');

      // 8. Save deposit postback
      await postbacksCollection.findOneAndUpdate(
        { click_id: effectiveClickId, goal: 'deposit' },
        {
          $setOnInsert: {
            click_id: effectiveClickId,
            affiliate_id: effectiveAffiliateId,
            offer_id: undefined,
            goal: 'deposit',
            amount: depositAmount,
            sale_amount: sale_amount || depositAmount,
            status: depositResult.success ? 'approved' : 'pending',
            sub1: effectiveClickId,
            sub2: sub2 || undefined,
            sub3: sub3 || undefined,
            hash: effectiveHash,
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
          clickId: effectiveClickId,
          affiliateId: effectiveAffiliateId,
          sub1: effectiveClickId,
          hash: effectiveHash,
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
      
      // Extract hash from sub1 if it looks like a hash
      const hashPattern = /^[a-f0-9]{32,}$/i;
      const effectiveHash = (sub1 && hashPattern.test(sub1)) 
        ? sub1 
        : HOOPLASEFT_CONFIG.defaultHash;
      
      const depositResult = await sendHooplaseftPostback(
        HOOPLASEFT_CONFIG.goalDeposit,
        url_id,
        affiliate_id,
        effectiveHash,
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
            hash: effectiveHash,
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
          ftd_amount: deposit_amount,
          hash: effectiveHash
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

