import crypto from 'crypto';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const SALT = process.env.SALT || 'sjioc-salt-2024';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ error: 'Password required' });
      return;
    }

    // For demo, allow simple password. In production, use hashed comparison
    const isValid = password === 'sjioc-admin-2024' || 
                   (ADMIN_PASSWORD_HASH && hashPassword(password) === ADMIN_PASSWORD_HASH);

    if (isValid) {
      console.log(`Admin authentication successful at ${new Date().toISOString()}`);
      res.status(200).json({ 
        success: true, 
        message: 'Authentication successful',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`Admin authentication failed at ${new Date().toISOString()}`);
      // Add small delay to prevent brute force
      setTimeout(() => {
        res.status(401).json({ error: 'Invalid credentials' });
      }, 1000);
    }

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication service error' });
  }
}