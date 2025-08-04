import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multiparty from 'multiparty';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + process.env.SALT || 'sjioc-salt').digest('hex');
}

function validateCSVStructure(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least header and one data row');
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const requiredHeaders = ['First Name', 'Last Name', 'Member', 'Car Type', 'Car Manufacturer', 'Car Number'];
  
  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      throw new Error(`Missing required column: ${required}`);
    }
  }
  
  // Validate car number format in data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const carNumberIndex = headers.indexOf('Car Number');
    const carNumber = values[carNumberIndex];
    
    if (carNumber && !/^GJ-\d{2}-[A-Z]{2}-\d{4}$/i.test(carNumber)) {
      throw new Error(`Invalid car number format at row ${i + 1}: ${carNumber}. Expected format: GJ-XX-XX-XXXX`);
    }
  }
  
  return true;
}

function csvToJson(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!ADMIN_PASSWORD_HASH) {
    res.status(500).json({ error: 'Admin authentication not configured' });
    return;
  }

  try {
    const form = new multiparty.Form({
      maxFilesSize: MAX_FILE_SIZE
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        res.status(400).json({ error: 'File upload failed' });
        return;
      }

      // Verify admin password
      const password = fields.password?.[0];
      if (!password || hashPassword(password) !== ADMIN_PASSWORD_HASH) {
        console.log('Invalid admin authentication attempt');
        res.status(401).json({ error: 'Invalid admin credentials' });
        return;
      }

      // Validate file upload
      const uploadedFile = files.csvFile?.[0];
      if (!uploadedFile) {
        res.status(400).json({ error: 'No CSV file provided' });
        return;
      }

      if (!uploadedFile.originalFilename.toLowerCase().endsWith('.csv')) {
        res.status(400).json({ error: 'Only CSV files are allowed' });
        return;
      }

      // Read and validate CSV content
      const csvContent = fs.readFileSync(uploadedFile.path, 'utf8');
      
      try {
        validateCSVStructure(csvContent);
        const jsonData = csvToJson(csvContent);
        
        // Create backup of current data
        const backupPath = path.join(process.cwd(), `members_data_backup_${Date.now()}.json`);
        const currentDataPath = path.join(process.cwd(), 'members_data.json');
        
        if (fs.existsSync(currentDataPath)) {
          fs.copyFileSync(currentDataPath, backupPath);
        }
        
        // Write new data
        fs.writeFileSync(currentDataPath, JSON.stringify(jsonData, null, 2));
        
        // Also update CSV file
        const csvPath = path.join(process.cwd(), 'members_data.csv');
        fs.writeFileSync(csvPath, csvContent);
        
        console.log(`Admin uploaded new member data: ${jsonData.length} records`);
        
        res.status(200).json({ 
          success: true, 
          message: `Successfully updated member data with ${jsonData.length} records`,
          recordCount: jsonData.length
        });
        
      } catch (validationError) {
        res.status(400).json({ 
          error: `CSV validation failed: ${validationError.message}` 
        });
      }

      // Clean up temp file
      try {
        fs.unlinkSync(uploadedFile.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};