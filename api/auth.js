// /api/auth.js

import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { firebaseServerConfig } from './firebaseConfig';

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
  app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApp();
} catch (error) {
  console.error('Firebase admin initialization error:', error);
  app = getApp();
}

const auth = getAuth(app);
const database = getDatabase(app);

export default async function handler(req, res) {
  // Set CORS headers to allow requests only from your domain
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
  
  try {
    switch (action) {
      case 'verifyIdToken':
        // Verify the ID token
        if (!payload.idToken) {
          return res.status(400).json({ error: 'ID token is required' });
        }
        
        const decodedToken = await auth.verifyIdToken(payload.idToken);
        return res.status(200).json({ uid: decodedToken.uid });
      
      case 'updateProfile':
        // Update user profile in database
        if (!payload.userId || !payload.userData) {
          return res.status(400).json({ error: 'User ID and data are required' });
        }
        
        // Verify authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const idToken = authHeader.split('Bearer ')[1];
        const tokenData = await auth.verifyIdToken(idToken);
        
        // Only allow updates to own profile
        if (tokenData.uid !== payload.userId) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        
        // Update user profile
        const userRef = database.ref(`users/${payload.userId}`);
        await userRef.update({
          ...payload.userData,
          lastUpdated: new Date().toISOString()
        });
        
        return res.status(200).json({ success: true, message: 'Profile updated successfully' });
      
      case 'getClientConfig':
        // Return minimal client config
        const { getClientFirebaseConfig } = require('./firebaseConfig');
        return res.status(200).json(getClientFirebaseConfig());
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(500).json({ error: error.message });
  }
}