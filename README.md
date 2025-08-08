# 🚗 SJIOC Car Lookup

**Modern React-based car identification system for St. John's Indian Orthodox Church**

Find car owners instantly by license plate number with privacy protection and mobile-first design.

## ✨ Features

- **🔍 Smart Search**: Handles any plate format (ABC-1234, GH1234, etc.)
- **📱 Mobile-First**: Optimized for phones with touch-friendly interface
- **🔒 Privacy Protected**: Shows masked names (John Sm***)
- **⚡ Real-time**: Instant search with auto-suggestions
- **🛡️ Secure**: Enhanced security headers and data protection

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd SJIOCCarLookup
npm install

# Add environment variables
echo "OPENAI_API_KEY=your-key-here" > .env

# Start development server
npm run dev
```

## 💡 Usage

1. **Enter any car number** in the search box
2. **Get instant results** with owner information
3. **Works with all formats**: ABC1234, ABC-1234, GJ01AB1234

## 🏗️ Architecture

**React + Vite** with modern tooling:
- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Backend**: Vercel API routes with OpenAI integration
- **Security**: CSP headers, input sanitization, privacy masking
- **Mobile**: Progressive Web App with touch optimization

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── MobileApp.jsx   # Main app component
│   ├── CarSearchInput.jsx
│   └── SearchResult.jsx
├── hooks/              # Custom React hooks
│   └── useCarSearch.js
├── utils/              # Search engine utilities
│   └── carSearchEngine.js
└── index.css          # Tailwind CSS styles

api/                    # Vercel serverless functions
├── chat.js            # AI-powered search endpoint
└── members.js         # Member data API

members_data.csv       # Church member database
```

## 🎨 Tech Stack

- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **OpenAI GPT** - Intelligent search processing

## 🔧 Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🌐 Deployment

**Vercel (Recommended)**:
```bash
vercel --prod
```

Add `OPENAI_API_KEY` in Vercel dashboard environment variables.

## 📊 CSV Data Format

```csv
First Name,Last Name,Member,Car Type,Car Manufacturer,Car Number
John,Smith,Y,Sedan,Toyota,ABC-1234
```

## 🔒 Security

- **Content Security Policy** headers
- **Privacy masking** of personal information
- **Input sanitization** and validation
- **HTTPS-only** in production
- **No sensitive data logging**

## 📱 Mobile Optimization

- **Touch-friendly** 44px minimum tap targets
- **Dynamic viewport** height support
- **Offline-ready** PWA capabilities
- **Fast loading** with code splitting
- **Responsive design** for all screen sizes

---

**Made with ❤️ for SJIOC Community**  
*React • Secure • Mobile-First • Privacy-Protected*