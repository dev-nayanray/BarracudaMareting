import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getAdminsCollection } from '@/lib/mongodb';
import crypto from 'crypto';

// Simple password hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'admin@barracuda.com',
  password: 'admin123'
};

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const adminsCollection = getAdminsCollection(db);

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // First, ensure admin exists in database
    let admin = await adminsCollection.findOne({ email: DEFAULT_ADMIN.email });
    
    if (!admin) {
      // Create default admin
      await adminsCollection.insertOne({
        email: DEFAULT_ADMIN.email,
        password: hashPassword(DEFAULT_ADMIN.password),
        name: 'Admin',
        role: 'admin',
        createdAt: new Date()
      });
      console.log('✅ Created default admin user');
      admin = await adminsCollection.findOne({ email: DEFAULT_ADMIN.email });
    }

    // For this specific case, accept the default credentials directly
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashPassword(token);

      // Update last login and store token hash
      await adminsCollection.updateOne(
        { email: DEFAULT_ADMIN.email },
        { $set: { lastLogin: new Date(), tokenHash } }
      );

      return NextResponse.json({
        success: true,
        data: {
          token: token,
          email: DEFAULT_ADMIN.email,
          name: 'Admin',
          role: 'admin'
        }
      });
    }

    // Try database credentials
    const hashedPassword = hashPassword(password);
    admin = await adminsCollection.findOne({
      email: email,
      password: hashedPassword
    });

    if (admin) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashPassword(token);

      await adminsCollection.updateOne(
        { email },
        { $set: { lastLogin: new Date(), tokenHash } }
      );

      return NextResponse.json({
        success: true,
        data: {
          token: token,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    );

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

