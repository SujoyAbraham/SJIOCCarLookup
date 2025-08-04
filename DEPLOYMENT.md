# 🚀 SJIOC Car Lookup - Vercel Deployment Guide

## Overview
This application is optimized for deployment on Vercel with secure admin functionality and AI integration.

## 🔧 Pre-Deployment Setup

### 1. Environment Variables
Set these environment variables in your Vercel dashboard:

```bash
# Required for AI functionality
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Admin security (optional - uses default if not set)
ADMIN_PASSWORD_HASH=your-hashed-password
SALT=your-custom-salt
```

### 2. Generate Admin Password Hash (Optional)
If you want to use a custom admin password:

```javascript
// Run this in Node.js to generate your hash
const crypto = require('crypto');
const password = 'your-secure-admin-password';
const salt = 'your-custom-salt';
const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
console.log('ADMIN_PASSWORD_HASH:', hash);
```

## 📁 File Structure
```
├── api/                    # Vercel serverless functions
│   ├── members.js         # Member data API
│   ├── admin-auth.js      # Admin authentication
│   └── admin-upload.js    # Secure file upload
├── members_data.json      # Member database (JSON)
├── members_data.csv       # Member database (CSV backup)
├── script.js             # Main chatbot with admin commands
├── index.html            # Main application
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

## 🔐 Admin Commands (In-Chat)

### Authentication
- `/admin <password>` - Login to admin mode
- `/logout` - Exit admin mode

### Data Management  
- `/stats` - View database statistics
- `/upload` - Upload new member CSV file
- `/help-admin` - Show admin command reference

### Security Features
- Password-based authentication
- Automatic file validation
- Backup creation before updates
- Command logging
- Session timeout

## 📋 CSV File Requirements

### Required Columns
- `First Name`
- `Last Name` 
- `Member` (Y/N for active/inactive)
- `Car Type`
- `Car Manufacturer`
- `Car Number` (format: GJ-XX-XX-XXXX)

### Example CSV Format
```csv
First Name,Last Name,Member,Car Type,Car Manufacturer,Car Number
John,Smith,Y,Sedan,Jaguar,GJ-01-AB-1234
Sarah,Johnson,Y,SUV,BMW,GJ-02-CD-5678
```

## 🚀 Deployment Steps

### 1. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Set Environment Variables
In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the required variables listed above

### 3. Test Deployment
1. Visit your deployed URL
2. Test basic chatbot functionality
3. Test admin access with `/admin <password>`
4. Test file upload functionality

## 🛡️ Security Considerations

### Church/Organization Security
- Admin passwords are hashed with salt
- File uploads are validated and size-limited
- Admin sessions don't persist across page refreshes
- All admin actions are logged
- CORS properly configured for your domain

### Recommendations
- Use strong admin passwords
- Regularly backup your member data
- Monitor admin access logs
- Keep OpenAI API key secure
- Restrict admin access to trusted personnel

## 🔄 Data Management

### Updating Member Data
1. Admin logs in via chat: `/admin <password>`
2. Uses upload command: `/upload`
3. Selects CSV file with proper format
4. System automatically:
   - Validates file structure
   - Creates backup of current data
   - Updates database
   - Reloads application data

### Backup Strategy
- Automatic backups created before each update
- Files stored as `members_data_backup_[timestamp].json`
- Manual backups recommended before major changes

## 🐛 Troubleshooting

### Common Issues
1. **API Not Working**: Check environment variables in Vercel
2. **Admin Login Failed**: Verify password or check logs
3. **File Upload Failed**: Check CSV format and file size
4. **AI Responses Not Working**: Verify OpenAI API key

### Debug Mode
Check browser console for detailed error messages during development.

## 📞 Support
For technical support, contact the system administrator or check the application logs in Vercel dashboard.