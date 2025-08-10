import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multiparty from 'multiparty';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 'default-fallback-hash';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

function hashPassword(password) {
  const salt = process.env.SALT || 'sjioc-salt';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Simple password check for development - matches the client-side password
function simplePasswordCheck(password) {
  return password === 'sjioc-admin-2024';
}

function validateCSVStructure(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least header and one data row');
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const requiredHeaders = ['First Name', 'Last Name', 'Member', 'Car Type', 'Car Manufacturer', 'Plate Number'];
  
  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      throw new Error(`Missing required column: ${required}`);
    }
  }
  
  // Validate plate number format in data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const plateNumberIndex = headers.indexOf('Plate Number');
    const plateNumber = values[plateNumberIndex];
    
    // Allow various US license plate formats: XXX-####, ###-XXX, XX#-###, ####-XX, etc.
    if (plateNumber && !/^[A-Z0-9]{2,4}-[A-Z0-9]{2,4}$/i.test(plateNumber)) {
      throw new Error(`Invalid plate number format at row ${i + 1}: ${plateNumber}. Expected US license plate format (e.g., ABC-1234, 123-ABC, AB1-234)`);
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

  // Allow simple password check if environment variables aren't configured
  const useEnvironmentAuth = process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH !== 'default-fallback-hash';

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
      let authValid = false;
      
      if (useEnvironmentAuth) {
        authValid = password && hashPassword(password) === ADMIN_PASSWORD_HASH;
      } else {
        // Fallback to simple password check for development
        authValid = simplePasswordCheck(password);
      }
      
      if (!authValid) {
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
        
        // Note: Vercel serverless functions run in read-only filesystem
        // File system operations will fail in production deployment
        // This function validates data but cannot persist changes
        
        console.log(`Admin validated new member data: ${jsonData.length} records`);
        
        res.status(200).json({ 
          success: true, 
          message: `CSV validation successful! ${jsonData.length} records validated. Note: Data persistence requires database integration in Vercel deployment.`,
          recordCount: jsonData.length,
          validatedData: jsonData,
          warning: "Vercel serverless functions cannot write to filesystem. Consider using a database (MongoDB Atlas, PlanetScale, Supabase) for persistent data storage.",
          recommendation: "For production use, integrate with a cloud database to enable data updates."
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