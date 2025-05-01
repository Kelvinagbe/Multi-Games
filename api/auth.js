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
let app;
try {
  app = !getApps().length ? initializeApp(firebaseAdminConfig) : getApp();
} catch (error) {
  console.error("Firebase admin initialization error:", error);
  // Handle error gracefully
}

const auth = getAuth(app);
const db = getDatabase(app);

export default async function handler(req, res) {
  // Set CORS headers
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
      
      // Verify payload user matches token
      if (payload.userId && payload.userId !== uid) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  }
  
  try {
    switch (action) {
      case 'createCustomToken':
        // Create a custom token for a user
        if (!payload.uid) {
          return res.status(400).json({ error: 'User ID is required' });
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
        
        // Reference to user's profile in database
        const userRef = db.ref(`users/${uid}`);
        
        // Check if profile already exists
        const snapshot = await userRef.once('value');
        if (snapshot.exists()) {
          return res.status(409).json({ error: 'User profile already exists' });
        }
        
        // Create user profile with timestamp
        await userRef.set({
          ...payload.userData,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        
        // If there's a referral code, update the referrer's stats
        if (payload.userData.referredBy) {
          try {
            // Find the referrer by code
            const referrersSnapshot = await db.ref('users')
              .orderByChild('referralCode')
              .equalTo(payload.userData.referredBy)
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
              await db.ref(`referrals/${uid}`).set({
                referredBy: referrerId,
                referralCode: payload.userData.referredBy,
                timestamp: new Date().toISOString()
              });
            }
          } catch (refError) {
            console.error("Error processing referral:", refError);
            // Don't fail the request if referral processing fails
          }
        }
        
        return res.status(201).json({ success: true, uid });
      
      case 'updateProfile':
        // Update user profile data
        if (!uid || !payload.userData) {
          return res.status(400).json({ error: 'User ID and update data are required' });
        }
        
        // Add last updated timestamp
        payload.userData.lastUpdated = new Date().toISOString();
        
        // Update user profile
        await db.ref(`users/${uid}`).update(payload.userData);
        
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
        // const { sensitiveField, ...safeUserData } = userData;
        
        return res.status(200).json(userData);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error(`Error handling ${action} action:`, error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// For Next.js 13+ App Router, use the following export configuration
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};