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
    const filePath = path.join(process.cwd(), 'members_data.csv');
    const csvText = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const member = {};
      headers.forEach((header, index) => {
        member[header] = values[index] || '';
      });
      return member;
    });
    
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