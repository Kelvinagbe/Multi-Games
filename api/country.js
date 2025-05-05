export default function handler(req, res) {
  // Get country from Vercel's headers
  const country = req.headers['x-vercel-ip-country'] || null;
  
  res.status(200).json({
    country: country,
    isAllowed: country === 'NG'
  });
}