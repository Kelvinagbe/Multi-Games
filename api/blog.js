// api/blog.js - Get all blog posts
// This file should be placed in an 'api' folder at the root of your project

// Sample blog data - in a real app, you'd use a database
const blogPosts = [
  {
    id: 1,
    title: " ",
    category: "Gaming Trends",
    excerpt: "How open-world games have transformed the gaming landscape over the past decade and what to expect in the future.",
    image: "https://multi-games-fawn.vercel.app/assets/image/.png",
    date: "May 5, 2025",
    likes: 124,
    shares: 47
  },
  {
    id: 2,
    title: "Most played Games ",
    category: "Games trends",
    excerpt: "Pixel Shooter has taken the arcade world by storm — with thousands of daily plays, fast-paced action, and vibrant retro visuals, it's become one of the most addictive and talked-about games on the platform.",
    image: "https://multi-games-fawn.vercel.app/assets/image/13.png",
    date: "April 28, 2025",
    likes: 98,
    shares: 35
  },
  {
    id: 3,
    title: "Celebrate the Season with Subway Surfers Holiday: A Festive Adventure Awaits!",
    category: "Seasonal Gaming Events",
    excerpt: "This holiday season, Subway Surfers is back with a festive twist! Race through snowy streets, explore wintery environments, and unlock limited-time holiday skins and characters. With exclusive seasonal rewards and exciting challenges, it’s the perfect time to join Jake, Tricky, and Fresh for a high-speed holiday adventure.

Don’t miss out—dive into Subway Surfers Holiday today and experience the most festive run of the year!
",
    image: "https://multi-games-fawn.vercel.app/assets/image/23.png",
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