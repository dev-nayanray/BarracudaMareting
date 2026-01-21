import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getAdminsCollection } from '@/lib/mongodb';
import crypto from 'crypto';

// Simple password hashing (must match login route)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const adminsCollection = getAdminsCollection(db);

    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Find admin with matching hashed token
    // Note: We store the token hash, so we need to hash the received token
    const tokenHash = hashPassword(token);
    const admin = await adminsCollection.findOne({ tokenHash });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Token is valid - return admin info
    return NextResponse.json({
      success: true,
      data: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error: any) {
    console.error('Profile validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

