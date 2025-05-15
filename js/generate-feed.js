// This JavaScript file will automatically generate and update your RSS feed
// Place this in your project's scripts directory (e.g., /js/generate-feed.js)

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  siteTitle: 'Multi Games',
  siteUrl: 'https://multi-games-fawn.vercel.app',
  siteDescription: 'The latest updates and new games from Multi Games',
  feedUrl: 'https://multi-games-fawn.vercel.app/feed.xml',
  language: 'en-us'
};

// This function would normally pull from your site's content/database
// For a simple static site, you'll need to manually define your entries here
function getContentEntries() {
  return [
    {
      title: 'New Game Added: Arcade Classic',
      link: `${config.siteUrl}/games/arcade-classic`,
      pubDate: new Date('2025-05-15T10:00:00Z'),
      description: "We've just added a new retro arcade game to our collection! Challenge your reflexes and compete for the high score."
    },
    {
      title: 'Site Update: New User Profiles',
      link: `${config.siteUrl}/updates/user-profiles`,
      pubDate: new Date('2025-05-14T14:30:00Z'),
      description: "You can now create your own gaming profile to track your scores and achievements across all our games."
    },
    {
      title: 'Weekend Tournament: Puzzle Masters',
      link: `${config.siteUrl}/events/puzzle-tournament`,
      pubDate: new Date('2025-05-12T09:00:00Z'),
      description: "Join our weekend puzzle tournament for a chance to win prizes and earn special badges for your profile."
    }
    // Add more entries as needed
  ];
}

function formatDate(date) {
  return date.toUTCString();
}

function generateRssFeed() {
  const entries = getContentEntries();
  const lastBuildDate = formatDate(new Date());
  
  let feedContent = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${config.siteTitle}</title>
  <link>${config.siteUrl}</link>
  <description>${config.siteDescription}</description>
  <language>${config.language}</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <atom:link href="${config.feedUrl}" rel="self" type="application/rss+xml" />
  
`;

  // Add items to feed
  entries.forEach(entry => {
    feedContent += `  <item>
    <title>${entry.title}</title>
    <link>${entry.link}</link>
    <pubDate>${formatDate(entry.pubDate)}</pubDate>
    <guid>${entry.link}</guid>
    <description>${entry.description}</description>
  </item>
  
`;
  });

  feedContent += `</channel>
</rss>`;

  // Write to file
  fs.writeFileSync(path.join(process.cwd(), 'public', 'feed.xml'), feedContent);
  console.log('RSS feed generated successfully!');
}

// Execute
generateRssFeed();