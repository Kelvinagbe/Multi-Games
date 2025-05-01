
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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
  app = initializeApp(firebaseAdminConfig);
} catch (error) {
  // App might already be initialized
  app = getApp();
}

const auth = getAuth(app);

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
      case 'createCustomToken':
        // Authenticate user and create a custom token
        if (!payload.uid) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        
        const customToken = await auth.createCustomToken(payload.uid);
        return res.status(200).json({ token: customToken });
        
      case 'verifyIdToken':
        // Verify the ID token
        if (!payload.idToken) {
          return res.status(400).json({ error: 'ID token is required' });
        }
        
        const decodedToken = await auth.verifyIdToken(payload.idToken);
        return res.status(200).json({ uid: decodedToken.uid });
        
      // Add more actions as needed
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(500).json({ error: error.message });
  }
}


