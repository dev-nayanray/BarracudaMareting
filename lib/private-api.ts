/**
 * Private API Client for Affiliate Platform
 * Documentation: https://docs.affiliate-platform.com/
 * 
 * This is for internal admin use only - do not expose to affiliates
 */

const API_BASE_URL = process.env.PRIVATE_API_BASE_URL || 'https://hooplaseft.com/backend/open-api/v1';
const API_TOKEN = process.env.PRIVATE_API_TOKEN || '49c6fbc5d8f07187e6d312cb1d754db354bdc5937f76f5cd2af09ac8a3880d6d';

// Goal Type IDs (from the platform)
export const GOAL_TYPES = {
  REGISTRATION: 5,  // Goal #5 - Registration
  DEPOSIT: 6,       // Goal #6 - Deposit
};

// Click interface from the API
export interface Click {
  id: number;
  offer_name: string;
  offer_id: number;
  offer_url_id: number;
  hash: string;
  device_model: string;
  device_brand: string;
  device_os: string;
  device_os_version: string;
  country_code: string;
  aff_sub: string;
  aff_sub2: string;
  aff_sub3: string;
  aff_sub4: string;
  aff_sub5: string;
  aff_sub6: string;
  aff_sub7: string;
  aff_sub8: string;
  aff_sub9: string;
  aff_sub10: string;
  aff_sub11: string;
  aff_sub12: string;
  aff_sub13: string;
  aff_sub14: string;
  aff_sub15: string;
  aff_sub16: string;
  aff_sub17: string;
  aff_sub18: string;
  aff_sub19: string;
  aff_sub20: string;
  affiliate_source: string;
  user_agent: string;
  browser: string;
  created_at: string;
}

// Helper to make authenticated requests
async function privateApiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `API request failed: ${res.status}`);
    }

    return data;
  } catch (error: any) {
    console.error('Private API error:', error);
    throw error;
  }
}

// ==================== Conversions API ====================

export const ConversionsAPI = {
  /**
   * Get list of conversions with filtering
   */
  async list(params: {
    affiliate_id?: number;
    offer_id?: number;
    goal_type_id?: number;
    hash?: string | string[];
    created_at_from?: string;
    created_at_to?: string;
    afm_date_from?: string;
    afm_date_to?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<any> {
    const query = new URLSearchParams();
    if (params.affiliate_id) query.append('affiliate_id', params.affiliate_id.toString());
    if (params.offer_id) query.append('offer_id', params.offer_id.toString());
    if (params.goal_type_id) query.append('goal_type_id', params.goal_type_id.toString());
    if (params.hash) query.append('hash', Array.isArray(params.hash) ? params.hash.join(',') : params.hash);
    if (params.created_at_from) query.append('created_at_from', params.created_at_from);
    if (params.created_at_to) query.append('created_at_to', params.created_at_to);
    if (params.afm_date_from) query.append('afm_date_from', params.afm_date_from);
    if (params.afm_date_to) query.append('afm_date_to', params.afm_date_to);
    if (params.page) query.append('page', params.page.toString());
    if (params.per_page) query.append('per_page', params.per_page.toString());

    return privateApiRequest(`/users/conversions?${query.toString()}`);
  },

  /**
   * Get a specific conversion by ID
   */
  async get(id: number): Promise<any> {
    return privateApiRequest(`/users/conversions/${id}`);
  },

  /**
   * Create one or more conversions
   * Maximum 100 conversions per request
   */
  async create(conversions: Array<{
    hash: string;
    goal_type_id: number;
    unique?: string;
    created_at?: string;
    payout?: number;
    revenue?: number;
    sale_amount?: number;
    withdrawal_amount?: number;
    deposit_amount?: number;
    net_gaming_amount?: number;
    win_amount?: number;
    bet_amount?: number;
    charge_back_amount?: number;
    wagered_bonus?: number;
    bonus_cash?: number;
    net_gaming_cash?: number;
    is_test?: boolean;
    custom_text_profile?: string;
    custom_number_profile?: number;
    custom_email_profile?: string;
    custom_date_profile?: string;
    custom_money_profile?: number;
    custom_boolean_profile?: boolean;
  }>): Promise<any> {
    if (conversions.length > 100) {
      throw new Error('Maximum 100 conversions per request');
    }

    return privateApiRequest('/users/conversions', {
      method: 'POST',
      body: JSON.stringify({ conversions }),
    });
  },

  /**
   * Create a single conversion (convenience method)
   */
  async createOne(params: {
    hash: string;
    goal_type_id: number;
    unique?: string;
    deposit_amount?: number;
    sale_amount?: number;
    payout?: number;
    revenue?: number;
    is_test?: boolean;
  }): Promise<any> {
    const result = await this.create([params]);
    return result.conversions?.[0];
  },

  /**
   * Update one or more conversions
   */
  async update(conversions: Array<{
    id: number;
    created_at?: string;
    payout?: number;
    revenue?: number;
    sale_amount?: number;
    withdrawal_amount?: number;
    deposit_amount?: number;
    net_gaming_amount?: number;
    win_amount?: number;
    bet_amount?: number;
    charge_back_amount?: number;
    wagered_bonus?: number;
    bonus_cash?: number;
    net_gaming_cash?: number;
    is_test?: boolean;
  }>): Promise<any> {
    return privateApiRequest('/users/conversions_update', {
      method: 'POST',
      body: JSON.stringify({ conversions }),
    });
  },
};

// ==================== Goals API ====================

export const GoalsAPI = {
  /**
   * Get goals for an offer
   */
  async list(offerId: number, goalId?: number): Promise<any> {
    const endpoint = goalId 
      ? `/users/offers/${offerId}/goals/${goalId}`
      : `/users/offers/${offerId}/goals`;
    return privateApiRequest(endpoint);
  },

  /**
   * Create a new goal for an offer
   */
  async create(offerId: number, goal: {
    name: string;
    enable_extra_payout: boolean;
    hide_from_affiliates: boolean;
    conversion_auto_approve: boolean;
    is_active: boolean;
    is_multiple_conversion: boolean;
    is_unique: boolean;
    is_unique_not_empty: boolean;
    type_id: number;
  }): Promise<any> {
    return privateApiRequest(`/users/offers/${offerId}/goals`, {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },

  /**
   * Edit a goal
   */
  async update(offerId: number, goalId: number, updates: {
    name?: string;
    enable_extra_payout?: boolean;
    hide_from_affiliates?: boolean;
    conversion_auto_approve?: boolean;
    is_active?: boolean;
    is_multiple_conversion?: boolean;
    is_unique?: boolean;
    is_unique_not_empty?: boolean;
    type_id?: number;
  }): Promise<any> {
    return privateApiRequest(`/users/offers/${offerId}/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ==================== Risk Management API ====================

export const RiskManagementAPI = {
  /**
   * Get risk rules for an affiliate
   */
  async getAffiliateRisks(affiliateId: number): Promise<any> {
    return privateApiRequest(`/users/affiliates/${affiliateId}/risks`);
  },

  /**
   * Create a risk rule for an affiliate
   */
  async createAffiliateRisk(affiliateId: number, risk: {
    name?: string;
    type: 'Local Conversions Risk' | 'Global Conversions Risk' | 'Relative Conversion Risk' | 'Late Conversions Risk';
    skip_first?: boolean;
    skipping_count?: number | string;
    annulate_money_calculation?: boolean;
    goal_type?: number;
    skipper_count?: string;
    goal_types?: number[];
    difference_relative_type?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    difference_relative_offset?: number;
    skip_also_goal_types?: number[];
    goal_absolute_session_lifespan?: number;
  }): Promise<any> {
    return privateApiRequest(`/users/affiliates/${affiliateId}/risks`, {
      method: 'POST',
      body: JSON.stringify(risk),
    });
  },

  /**
   * Get risk rules for an offer
   */
  async getOfferRisks(offerId: number): Promise<any> {
    return privateApiRequest(`/users/offers/${offerId}/risks`);
  },

  /**
   * Create a risk rule for an offer
   */
  async createOfferRisk(offerId: number, risk: {
    name?: string;
    type: 'Local Conversions Risk' | 'Global Conversions Risk' | 'Relative Conversion Risk' | 'Late Conversions Risk';
    skip_first?: boolean;
    skipping_count?: number | string;
    annulate_money_calculation?: boolean;
    goal_type?: number;
    skipper_count?: string;
    goal_types?: number[];
    difference_relative_type?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    difference_relative_offset?: number;
    skip_also_goal_types?: number[];
    goal_absolute_session_lifespan?: number;
  }): Promise<any> {
    return privateApiRequest(`/users/offers/${offerId}/risks`, {
      method: 'POST',
      body: JSON.stringify(risk),
    });
  },
};

// ==================== Qualifications API ====================

export const QualificationsAPI = {
  /**
   * Get qualification rules for an affiliate
   */
  async getAffiliateQualifications(affiliateId: number): Promise<any> {
    return privateApiRequest(`/users/affiliates/${affiliateId}/qualifications`);
  },

  /**
   * Create a qualification rule for an affiliate
   */
  async createAffiliateQualification(affiliateId: number, qualification: {
    name?: string;
    type: 'Baseline' | 'Required Goal';
    description?: string;
    pql?: string;
    goal_type: number;
    baseline_field?: string;
    amount?: number;
    skip_unsatisfied?: boolean;
    tracking_goal_types?: number[];
    is_active?: boolean;
  }): Promise<any> {
    return privateApiRequest(`/users/affiliates/${affiliateId}/qualifications`, {
      method: 'POST',
      body: JSON.stringify(qualification),
    });
  },

  /**
   * Get qualification rules for an offer
   */
  async getOfferQualifications(offerId: number): Promise<any> {
    return privateApiRequest(`/users/offers/${offerId}/qualifications`);
  },

  /**
   * Create a qualification rule for an offer
   */
  async createOfferQualification(offerId: number, qualification: {
    name?: string;
    type: 'Baseline' | 'Required Goal';
    description?: string;
    pql?: string;
    goal_type: number;
    baseline_field?: string;
    amount?: number;
    skip_unsatisfied?: boolean;
    tracking_goal_types?: number[];
    is_active?: boolean;
  }): Promise<any> {
    return privateApiRequest(`/users/offers/${offerId}/qualifications`, {
      method: 'POST',
      body: JSON.stringify(qualification),
    });
  },
};

// ==================== Clicks API ====================

export const ClicksAPI = {
  /**
   * Get list of clicks with filtering
   */
  async list(params: {
    affiliate_id?: number;
    offer_id?: number;
    page?: number;
    per_page?: number;
  } = {}): Promise<{ data: Click[]; total: number; per_page: number; page: number; pages: number }> {
    const query = new URLSearchParams();
    if (params.affiliate_id) query.append('affiliate_id', params.affiliate_id.toString());
    if (params.offer_id) query.append('offer_id', params.offer_id.toString());
    if (params.page) query.append('page', params.page.toString());
    if (params.per_page) query.append('per_page', params.per_page.toString());

    return privateApiRequest(`/affiliates/clicks?${query.toString()}`);
  },

  /**
   * Get a specific click by ID
   * Note: The API doesn't have a direct endpoint for single click by ID,
   * so we search through the list with per_page=1 and page based on ID
   */
  async get(clickId: number): Promise<Click | null> {
    // Since there's no direct endpoint, we try to find it by iterating through pages
    // This is a workaround - ideally the API should have /affiliates/clicks/{id}
    try {
      const result = await this.list({ per_page: 200, page: 1 });
      
      if (result.data) {
        const click = result.data.find((c: Click) => c.id === clickId);
        return click || null;
      }
    } catch (error) {
      // Suppress errors - this endpoint might not be accessible
      console.warn('⚠️ ClicksAPI.list() failed, clicks endpoint may not be accessible');
    }
    
    return null;
  },

  /**
   * Get the hash for a specific click ID
   * This is the main helper function needed for postbacks
   * 
   * IMPORTANT: If the clicks API is not accessible, this function will:
   * 1. Log a warning
   * 2. Return null (caller should use fallback hash)
   */
  async getHashByClickId(clickId: number): Promise<string | null> {
    try {
      const click = await this.get(clickId);
      if (click && click.hash) {
        console.log(`✅ Found hash for click ${clickId}: ${click.hash}`);
        return click.hash;
      }
      console.warn(`⚠️ No hash found for click ${clickId}`);
      return null;
    } catch (error: any) {
      console.warn(`⚠️ ClicksAPI.getHashByClickId() failed for click ${clickId}:`, error.message);
      return null;
    }
  },

  /**
   * Alternative method: Try to find hash from conversions
   * If clicks endpoint is not accessible, we can try to get the hash from
   * existing conversions that match the click_id
   */
  async findHashFromConversions(db: any, clickId: string): Promise<string | null> {
    try {
      const conversionsCollection = db.collection('conversions');
      const conversion = await conversionsCollection.findOne({ click_id: clickId });
      
      if (conversion && conversion.click_hash) {
        console.log(`✅ Found hash from existing conversion: ${conversion.click_hash}`);
        return conversion.click_hash;
      }
      
      // Also check postbacks collection
      const postbacksCollection = db.collection('postbacks');
      const postback = await postbacksCollection.findOne({ click_id: clickId });
      
      if (postback && (postback as any).click_hash) {
        console.log(`✅ Found hash from existing postback: ${(postback as any).click_hash}`);
        return (postback as any).click_hash;
      }
      
      return null;
    } catch (error: any) {
      console.warn('⚠️ Failed to find hash from conversions:', error.message);
      return null;
    }
  },
};

// ==================== Affiliate Signup Helper ====================

export async function createAffiliateConversion(params: {
  clickHash: string;
  goalTypeId: number;
  affiliateId?: number;
  offerId?: number;
  depositAmount?: number;
  saleAmount?: number;
  unique?: string;
  isTest?: boolean;
}): Promise<any> {
  // First, check if conversion already exists
  const existing = await ConversionsAPI.list({
    hash: params.clickHash,
    goal_type_id: params.goalTypeId,
    per_page: 1,
  });

  if (existing.data && existing.data.length > 0) {
    console.log('Conversion already exists for hash:', params.clickHash);
    return { 
      success: true, 
      conversion: existing.data[0],
      isDuplicate: true 
    };
  }

  // Create new conversion
  const result = await ConversionsAPI.createOne({
    hash: params.clickHash,
    goal_type_id: params.goalTypeId,
    unique: params.unique || 'API',
    deposit_amount: params.depositAmount,
    sale_amount: params.saleAmount,
    is_test: params.isTest,
  });

  return { 
    success: true, 
    conversion: result,
    isDuplicate: false
  };
}

// Export all APIs
export const PrivateAPI = {
  Conversions: ConversionsAPI,
  Clicks: ClicksAPI,
  Goals: GoalsAPI,
  RiskManagement: RiskManagementAPI,
  Qualifications: QualificationsAPI,
  createAffiliateConversion,
  GOAL_TYPES,
};

export default PrivateAPI;

