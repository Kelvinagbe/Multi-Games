// api/blog.js - Get all blog posts
// This file should be placed in an 'api' folder at the root of your project

// Sample blog data - in a real app, you'd use a database
const blogPosts = [
  {
    id: 1,
    title: "ggEvolution of Open-World Gaming",
    category: "Gaming Trends",
    excerpt: "How open-world games have transformed the gaming landscape over the past decade and what to expect in the future.",
    image: "https://multi-games-fawn.vercel.app/assets/image/13.png",
    date: "May 5, 2025",
    likes: 124,
    shares: 47
  },
  {
    id: 2,
    title: "Top 10 Indie Games of 2025",
    category: "Indie Games",
    excerpt: "Discover the most innovative indie games that are making waves in the gaming community this year.",
    image: "https://multi-games-fawn.vercel.app/assets/image/13.png",
    date: "April 28, 2025",
    likes: 98,
    shares: 35
  },
  {
    id: 3,
    title: "Beginner's Guide to Competitive Gaming",
    category: "Esports",
    excerpt: "Everything you need to know to start your journey in competitive gaming and esports tournaments.",
    image: "https://multi-games-fawn.vercel.app/assets/image/13.png",
    date: "April 23, 2025",
    likes: 156,
    shares: 62
  }
];

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

  // Return blog posts data
  res.status(200).json(blogPosts);
};