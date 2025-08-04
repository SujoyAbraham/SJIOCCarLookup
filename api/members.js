import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const filePath = path.join(process.cwd(), 'members_data.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    res.status(200).json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error reading members data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load member data' 
    });
  }
}