import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApp();
const db = getDatabase(app);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action } = req.body;

    if (action === 'getClientConfig') {
      return res.status(200).json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}