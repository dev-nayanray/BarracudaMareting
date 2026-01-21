import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// Types for your collections
export interface Contact {
  _id?: ObjectId;
  name: string;
  email: string;
  company: string;
  type: string; // 'affiliate' | 'publisher' | 'advertiser' | 'influencer' | 'media_buyer' | 'agency' | 'user'
  messenger?: string;
  username?: string;
  message?: string;
  
  // Affiliate tracking fields
  affiliate_id?: string;
  url_id?: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  campaign_id?: string;
  tracking_source?: string;
  
  // Status fields
  status: string; // 'new' | 'contacted' | 'qualified' | 'rejected'
  notes?: string;
  affiliate_status?: string; // 'pending' | 'approved' | 'rejected'
  
  // API tracking
  affiliateRegistered?: boolean;
  affiliateError?: string;
  tracking_link?: string;
  
  // FTD tracking
  ftd?: boolean;
  ftd_amount?: number;
  ftd_date?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Postback {
  _id?: ObjectId;
  click_id: string;
  affiliate_id: string;
  offer_id?: string;
  goal: string; // 'registration' | 'deposit'
  amount?: number;
  sale_amount?: number;
  status: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  createdAt: Date;
}

export interface FTD {
  _id?: ObjectId;
  click_id: string;
  affiliate_id: string;
  offer_id?: string;
  amount: number;
  sale_amount?: number;
  status: string;
  createdAt: Date;
}

export interface Conversion {
  _id?: ObjectId;
  click_id: string;
  affiliate_id: string;
  goal_id: string;          // Goal ID from Hooplaseft (e.g., '5' for registration, '6' for deposit)
  goal_type: string;        // 'registration' | 'deposit'
  offer_id?: string;
  amount: number;
  sale_amount?: number;
  status: string;           // 'pending' | 'approved' | 'rejected'
  
  // Affiliate sub parameters
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
  
  // Tracking information
  user_agent?: string;
  ip_address?: string;
  country?: string;
  region?: string;
  source?: string;
  platform?: string;
  browser?: string;
  os?: string;
  os_version?: string;
  manufacturer?: string;
  device_type?: string;     // 'desktop' | 'mobile' | 'tablet'
  is_test?: boolean;
  
  // Additional identifiers
  click_hash?: string;      // Alternative hash identifier
  advertiser_id?: string;
  offer_url_id?: string;
  affiliate_source?: string;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Admin {
  _id?: ObjectId;
  email: string;
  password: string; // Hashed
  name: string;
  role: string;
  createdAt: Date;
}

// MongoDB connection singleton
let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'barracuda';

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) {
    return { client, db };
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('✅ Connected to MongoDB');
    
    // Create indexes
    await createIndexes(db);
    
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function createIndexes(db: Db): Promise<void> {
  // Contact indexes
  const contactsCollection = db.collection<Contact>('contacts');
  await contactsCollection.createIndex({ email: 1 });
  await contactsCollection.createIndex({ type: 1 });
  await contactsCollection.createIndex({ status: 1 });
  await contactsCollection.createIndex({ affiliate_id: 1 });
  await contactsCollection.createIndex({ createdAt: -1 });
  await contactsCollection.createIndex({ sub1: 1 });

  // Postback indexes
  const postbacksCollection = db.collection<Postback>('postbacks');
  await postbacksCollection.createIndex({ click_id: 1, goal: 1 }, { unique: true }); // Duplicate protection
  await postbacksCollection.createIndex({ affiliate_id: 1 });
  await postbacksCollection.createIndex({ createdAt: -1 });

  // FTD indexes
  const ftdCollection = db.collection<FTD>('ftds');
  await ftdCollection.createIndex({ click_id: 1 }, { unique: true }); // Duplicate protection
  await ftdCollection.createIndex({ affiliate_id: 1 });
  await ftdCollection.createIndex({ createdAt: -1 });

  // Admin indexes
  const adminCollection = db.collection<Admin>('admins');
  await adminCollection.createIndex({ email: 1 }, { unique: true });

  // Conversion indexes
  const conversionsCollection = db.collection<Conversion>('conversions');
  await conversionsCollection.createIndex({ click_id: 1, goal_id: 1 }, { unique: true }); // Duplicate protection
  await conversionsCollection.createIndex({ affiliate_id: 1 });
  await conversionsCollection.createIndex({ goal_type: 1 });
  await conversionsCollection.createIndex({ createdAt: -1 });

  console.log('✅ Database indexes created');
}

// Collection getters
export function getContactsCollection(db: Db): Collection<Contact> {
  return db.collection<Contact>('contacts');
}

export function getPostbacksCollection(db: Db): Collection<Postback> {
  return db.collection<Postback>('postbacks');
}

export function getFTDsCollection(db: Db): Collection<FTD> {
  return db.collection<FTD>('ftds');
}

export function getAdminsCollection(db: Db): Collection<Admin> {
  return db.collection<Admin>('admins');
}

export function getConversionsCollection(db: Db): Collection<Conversion> {
  return db.collection<Conversion>('conversions');
}

// Helper to check if a conversion already exists (for duplicate protection)
export async function conversionExists(
  db: Db,
  clickId: string,
  goal: string
): Promise<boolean> {
  const collection = getPostbacksCollection(db);
  const existing = await collection.findOne({ click_id: clickId, goal });
  return !!existing;
}

export async function ftdExists(db: Db, clickId: string): Promise<boolean> {
  const collection = getFTDsCollection(db);
  const existing = await collection.findOne({ click_id: clickId });
  return !!existing;
}

// Close connection
export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

