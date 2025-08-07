# 🚗 SJIOC Car Lookup Assistant

Simple car identification system for **St. John's Indian Orthodox Church** - find car owners by license plate number.

## ✨ What It Does

- **Car Owner Lookup**: Enter any license plate number (ABC-1234, GH1234, etc.)
- **Smart Search**: Handles plates with/without spaces, dashes, symbols
- **Privacy Protected**: Shows first name + masked last name (John Sm***)
- **Admin Panel**: Upload new car data via chat commands

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo-url>
cd SJIOCCarLookup
npm install

# Set up environment
cp .env.example .env
# Add your OPENAI_API_KEY

# Run locally
npm run dev
```

## 💬 How to Use

1. Click the chat icon
2. Type a car number: `ABC1234` or `ABC-1234`
3. Get owner info instantly

**Admin Access**: `/admin sjioc-admin-2024`

## 📊 Example Queries

- `ABC1234` - Find owner of plate ABC1234
- `GJ01AB1234` - Government/municipal plates supported
- `Help` - Show available commands

## 🔧 Admin Features

- `/admin <password>` - Login
- `/upload` - Add new car data (CSV)
- `/stats` - View database info
- `/logout` - Exit admin mode

## 📁 Required CSV Format

```csv
First Name,Last Name,Member,Car Type,Car Manufacturer,Car Number
John,Smith,Y,Sedan,Toyota,ABC-1234
```

## ⚙️ Configuration

Set in `.env`:
```env
OPENAI_API_KEY=your-openai-api-key
```

## 🌐 Deploy to Vercel

```bash
vercel --prod
```

Add environment variables in Vercel dashboard.

## 🔒 Security Features

- Name masking for privacy
- Admin password protection
- No personal contact info shown
- Church-appropriate responses

## 🐛 Troubleshooting

- **No response**: Check if data files exist
- **Upload fails on Vercel**: Expected (read-only filesystem)
- **API errors**: Verify OPENAI_API_KEY

## 📞 Support

Contact church trustees or create an issue in this repository.

---

**Made for SJIOC Community** 🏛️  
*Simple • Secure • Privacy-First*