// Script to create admin user in MongoDB
// Run: node scripts/create-admin.js

const { MongoClient } = require('mongodb');
const crypto = require('crypto');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wpnayanray:t7lO9xs29k6kLOeQ@cluster0.7gjno.mongodb.net/project-checklist?retryWrites=true&w=majority';
const DB_NAME = process.env.DB_NAME || 'barracuda';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createAdmin() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const adminsCollection = db.collection('admins');
    
    // Check if admin exists
    const existingAdmin = await adminsCollection.findOne({ email: 'admin@barracuda.com' });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      
      // Update password
      await adminsCollection.updateOne(
        { email: 'admin@barracuda.com' },
        { $set: { password: hashPassword('admin123') } }
      );
      console.log('✅ Admin password updated');
    } else {
      // Create admin user
      await adminsCollection.insertOne({
        email: 'admin@barracuda.com',
        password: hashPassword('admin123'),
        name: 'Admin',
        role: 'admin',
        createdAt: new Date()
      });
      console.log('✅ Admin user created');
    }
    
    console.log('\n🔐 Admin Credentials:');
    console.log('   Email: admin@barracuda.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

createAdmin();

