// File: pages/api/auth.js (Next.js 12) or app/api/auth/route.js (Next.js 13+)

import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

// Initialize Firebase Admin SDK
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
};

// Initialize the app only once
const getAdminApp = () => {
  if (!getApps().length) {
    try {
      return initializeApp(firebaseAdminConfig);
    } catch (error) {
      console.error("Firebase admin initialization error:", error);
      throw new Error("Failed to initialize Firebase Admin");
    }
  } else {
    return getApp();
  }
};

// Handler for Next.js 12 API Routes
export default async function handler(req, res) {
  // Set CORS headers - customize ALLOWED_ORIGIN in your environment variables
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const app = getAdminApp();
    const auth = getAuth(app);
    const db = getDatabase(app);
    
    const { action, payload } = req.body;
    
    // Authorization check for protected endpoints
    let decodedToken = null;
    let uid = null;
    
    if (action !== 'verifyIdToken' && req.headers.authorization) {
      try {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        if (!idToken) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        decodedToken = await auth.verifyIdToken(idToken);
        uid = decodedToken.uid;
        
        // Verify payload user matches token (prevent impersonation)
        if (payload.userId && payload.userId !== uid) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid authentication token' });
      }
    }
    
    switch (action) {
      case 'createCustomToken':
        // Create a custom token for a user - requires admin privileges
        if (!payload.uid) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Add additional admin verification here if needed
        if (!decodedToken?.admin) {
          return res.status(403).json({ error: 'Admin privileges required' });
        }
        
        const customToken = await auth.createCustomToken(payload.uid);
        return res.status(200).json({ token: customToken });
      
      case 'verifyIdToken':
        // Verify an ID token
        if (!payload.idToken) {
          return res.status(400).json({ error: 'ID token is required' });
        }
        
        decodedToken = await auth.verifyIdToken(payload.idToken);
        return res.status(200).json({ uid: decodedToken.uid });
      
      case 'createProfile':
        // Create a user profile in the database
        if (!uid || !payload.userData) {
          return res.status(400).json({ error: 'User ID and profile data are required' });
        }
        
        // Validate required fields
        const requiredFields = ['email', 'username'];
        for (const field of requiredFields) {
          if (!payload.userData[field]) {
            return res.status(400).json({ error: `Missing required field: ${field}` });
          }
        }
        
        // Reference to user's profile in database
        const userRef = db.ref(`users/${uid}`);
        
        // Check if profile already exists
        const snapshot = await userRef.once('value');
        if (snapshot.exists()) {
          return res.status(409).json({ error: 'User profile already exists' });
        }
        
        // Generate a unique referral code
        const referralCode = generateReferralCode(payload.userData.email, uid);
        
        // Create user profile with referral code and timestamps
        await userRef.set({
          ...payload.userData,
          referralCode,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        
        // Process referral if provided
        if (payload.userData.referredBy) {
          await processReferral(db, uid, payload.userData.referredBy);
        }
        
        return res.status(201).json({ 
          success: true, 
          uid, 
          referralCode 
        });
      
      case 'updateProfile':
        // Update user profile data (non-sensitive fields only)
        if (!uid || !payload.userData) {
          return res.status(400).json({ error: 'User ID and update data are required' });
        }
        
        // Security check: don't allow updating sensitive fields via this endpoint
        const sensitiveFields = ['admin', 'role', 'permissions', 'referralCode'];
        const updateData = { ...payload.userData };
        
        for (const field of sensitiveFields) {
          if (field in updateData) {
            delete updateData[field];
          }
        }
        
        // Add last updated timestamp
        updateData.lastUpdated = new Date().toISOString();
        
        // Update user profile
        await db.ref(`users/${uid}`).update(updateData);
        
        return res.status(200).json({ success: true });
      
      case 'updateLogin':
        // Update user's last login timestamp
        if (!uid) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Update last login timestamp
        await db.ref(`users/${uid}`).update({
          lastLogin: new Date().toISOString()
        });
        
        return res.status(200).json({ success: true });
      
      case 'getUserProfile':
        // Get user profile data
        if (!uid) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        
        const userSnapshot = await db.ref(`users/${uid}`).once('value');
        const userData = userSnapshot.val();
        
        if (!userData) {
          return res.status(404).json({ error: 'User profile not found' });
        }
        
        // Remove sensitive information if needed
        const { sensitiveField, ...safeUserData } = userData;
        
        return res.status(200).json(safeUserData);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error(`Error in auth API:`, error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// Generate unique referral code for users
function generateReferralCode(email, userId) {
  // Create a referral code from first part of email + random characters + user ID portion
  const emailPrefix = email.split('@')[0].substring(0, 4).toUpperCase();
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  const userIdPortion = userId.substring(0, 3).toUpperCase();
  
  return `${emailPrefix}${randomChars}${userIdPortion}`;
}

// Process referral relationship
async function processReferral(db, newUserId, referralCode) {
  try {
    // Find the referrer by referral code (more efficient query)
    const referrersSnapshot = await db.ref('users')
      .orderByChild('referralCode')
      .equalTo(referralCode)
      .limitToFirst(1)
      .once('value');
    
    // Get the first matching user
    const referrers = referrersSnapshot.val();
    if (referrers) {
      const referrerId = Object.keys(referrers)[0];
      
      // Update referrer's referral count
      await db.ref(`users/${referrerId}`).update({
        referrals: (referrers[referrerId].referrals || 0) + 1,
        lastUpdated: new Date().toISOString()
      });
      
      // Log referral relationship
      await db.ref(`referrals/${newUserId}`).set({
        referredBy: referrerId,
        referralCode: referralCode,
        timestamp: new Date().toISOString()
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error processing referral:", error);
    // Don't throw - we don't want the profile creation to fail
    return false;
  }
}

// For Next.js 13+ App Router
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};

/**
 * For Next.js 13+ App Router with Route Handlers
 * Replace the above export default with:
 */
 
/*
export async function POST(request) {
  const body = await request.json();
  
  // Extract auth header
  const authHeader = request.headers.get('authorization');
  
  // Create headers for the response
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Get Firebase Admin app
  const app = getAdminApp();
  const auth = getAuth(app);
  const db = getDatabase(app);
  
  // Process the action/payload similar to the API route handler
  try {
    // The rest of the code remains similar to the handler function
    // but using Response objects instead of res.status().json()
    
    // Example for a successful response:
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers
      }
    );
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  headers.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return new Response(null, {
    status: 200,
    headers
  });
}
*/