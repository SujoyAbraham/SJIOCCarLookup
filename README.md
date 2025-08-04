# 🚗 SJIOC Car Lookup Chatbot

A secure, AI-powered chatbot for the **Surat Jaguar Independent Owners Club (SJIOC)** website that helps users search through member car information using natural language queries with integrated admin functionality.

## ✨ Features

### 🤖 Smart Chatbot Interface
- **Modern Popup Design**: Smooth animations and responsive layout
- **AI Integration**: ChatGPT-powered responses for complex queries
- **Natural Language Processing**: Understands various query formats
- **Multi-Search Options**: Search by name, car number, manufacturer
- **Real-time Responses**: Instant member and car information
- **Fallback Intelligence**: Local search + AI backup for comprehensive answers

### 🔐 Secure Admin Panel (In-Chat)
- **Command-Based Interface**: MCP-style admin commands (`/admin`, `/upload`, `/stats`)
- **Password Protection**: Secure authentication system
- **File Upload Management**: CSV file upload with validation
- **Automatic Backups**: Data protection before updates
- **Session Security**: Admin sessions don't persist across refreshes
- **Audit Logging**: All admin actions are logged for security

### 🌐 Cloud-Ready Architecture
- **Vercel Optimized**: Serverless deployment ready
- **JSON Database**: Fast, file-based data storage
- **API Endpoints**: RESTful backend functions
- **CORS Configured**: Secure cross-origin access
- **Environment Variables**: Secure configuration management

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI Integration**: OpenAI ChatGPT API
- **Database**: JSON file storage with CSV backup
- **Security**: Password hashing, file validation, CORS protection
- **Deployment**: Vercel cloud platform

## 📁 Project Structure

```
SJIOCCarLookup/
├── api/                    # Vercel serverless functions
│   ├── members.js         # Member data API endpoint
│   ├── admin-auth.js      # Admin authentication API
│   └── admin-upload.js    # Secure file upload handler
├── index.html             # Main application interface
├── script.js              # Chatbot logic with admin commands
├── styles.css             # UI styling and animations
├── members_data.json      # Member database (JSON format)
├── members_data.csv       # Member database (CSV backup)
├── vercel.json           # Vercel deployment configuration
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── DEPLOYMENT.md         # Detailed deployment guide
└── README.md            # Project documentation
```

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd SJIOCCarLookup

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard
# OPENAI_API_KEY, ADMIN_PASSWORD_HASH, SALT
```

### Basic Usage
1. **Open the application** in your web browser
2. **Click the chat icon** in the bottom-right corner
3. **Start asking questions** about SJIOC members and their cars
4. **For admin access**, use `/admin <password>` in the chat

## 💬 Example Queries

### Search by Name
- "Show me John's car"
- "Find Sarah Johnson"
- "What car does Michael drive?"

### Search by Manufacturer
- "List all Jaguar cars"
- "Show BMW vehicles"
- "Audi cars in the club"

### Search by Car Number
- "Find GJ-01-AB-1234"
- "Look up car number GJ-15-CD-8901"

### Statistics & Lists
- "How many members?"
- "Show member statistics"
- "List all active members"

### Help & Commands
- "Help"
- "What can you do?"

### Admin Commands (Secure Access)
- `/admin sjioc-admin-2024` - Login to admin mode
- `/stats` - View database statistics
- `/upload` - Upload new member CSV file  
- `/help-admin` - Show admin command reference
- `/logout` - Exit admin mode

## 📊 CSV Data Format

The chatbot reads data from `members_data.csv` with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| First Name | Member's first name | John |
| Last Name | Member's last name | Smith |
| Member | Membership status (Y/N) | Y |
| Car Type | Type of vehicle | Sedan |
| Car Manufacturer | Car brand | Jaguar |
| Car Number | Registration number | GJ-01-AB-1234 |

## 🔧 Configuration

### Environment Variables
Create `.env` file from template:
```env
# Required for AI functionality
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Admin security (optional - uses default if not set)
ADMIN_PASSWORD_HASH=your-hashed-password
SALT=your-custom-salt
```

### Admin Password Setup
Default password: `sjioc-admin-2024`

To set custom admin password:
```javascript
// Generate hash in Node.js
const crypto = require('crypto');
const password = 'your-secure-password';
const salt = 'your-custom-salt';
const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
console.log('Set ADMIN_PASSWORD_HASH to:', hash);
```

## 🎨 Customization

### Updating Member Data (Admin)
1. Login with `/admin <password>`
2. Use `/upload` command in chat
3. Select CSV file following required format
4. System automatically validates and updates data

### Styling Changes
- Modify `styles.css` for visual customization
- Update chatbot colors and animations
- Responsive design adjustments

### Adding New Features  
- Extend admin commands in `script.js`
- Add new API endpoints in `/api` folder
- Customize AI prompts for your organization

## 🌟 Key Features Explained

### Natural Language Processing
The chatbot uses keyword matching and pattern recognition to understand user queries:
- Recognizes greetings and responds appropriately
- Identifies names mentioned in queries
- Detects manufacturer names and car-related keywords
- Handles various query formats naturally

### Smart Search
- **Fuzzy matching**: Finds partial name matches
- **Case insensitive**: Works regardless of capitalization  
- **Multiple results**: Shows all matching entries when applicable
- **Detailed responses**: Provides comprehensive car and member information

### User Experience
- **Typing indicators**: Shows when the bot is "thinking"
- **Smooth animations**: Pleasant visual transitions
- **Mobile responsive**: Optimized for all screen sizes
- **Accessible design**: Clear typography and good contrast ratios

## 🔧 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🛡️ Security Features

### Church/Organization Security
- **Password Protection**: Hashed admin passwords with salt
- **File Validation**: CSV format and content validation  
- **Automatic Backups**: Data protection before updates
- **Session Management**: Admin sessions don't persist
- **Audit Logging**: All admin actions logged
- **Size Limits**: File upload restrictions (5MB max)
- **CORS Protection**: Secure cross-origin requests

### Best Practices
- Use strong, unique admin passwords
- Regularly backup member data
- Monitor admin access logs  
- Keep API keys secure in environment variables
- Restrict admin access to trusted personnel only

## 🐛 Troubleshooting

### Common Issues
1. **Chatbot not responding**: Check if JSON/CSV data files exist
2. **Admin login fails**: Verify password in environment variables
3. **File upload errors**: Ensure CSV format matches requirements
4. **AI not working**: Verify OpenAI API key is correctly set
5. **Deployment issues**: Check Vercel environment variables

### Debug Steps
- Check browser console for JavaScript errors
- Review Vercel function logs for API issues
- Verify all required environment variables are set
- Test file upload with sample CSV data

## 📝 Future Enhancements

- [ ] Voice input/output capabilities
- [ ] Export search results to PDF  
- [ ] Advanced filtering and sorting options
- [ ] Member photo integration
- [ ] Car image gallery with photos
- [ ] Multi-language support (Gujarati/Hindi)
- [ ] SMS/WhatsApp integration
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Support

For questions or support:
- 📧 Email: support@sjioc.com
- 🌐 Website: [SJIOC Official](https://www.sjioc.org/)
- 💬 Create an issue in this repository
- 📚 See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Made with ❤️ for the Surat Jaguar Independent Owners Club**  
*Secure • AI-Powered • Church-Ready*