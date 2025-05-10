// api/blog/share.js - Handle post shares

// Map to store user interactions (in a real app, you'd use a database)
// Structure: { postId: { likes: [userId1, userId2, ...], shares: number } }
const userInteractions = {
  1: { likes: [], shares: 47 },
  2: { likes: [], shares: 35 },
  3: { likes: [], shares: 62 }
};

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { postId } = req.body;
    
    // Validate input
    if (!postId) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }
    
    // Get the post interactions or initialize if not exists
    if (!userInteractions[postId]) {
      userInteractions[postId] = { likes: [], shares: 0 };
    }
    
    // Increment share count
    userInteractions[postId].shares += 1;
    
    return res.status(200).json({ 
      success: true, 
      shares: userInteractions[postId].shares 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};