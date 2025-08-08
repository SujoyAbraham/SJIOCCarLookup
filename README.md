# 🚗 SJIOC Car Lookup

**Modern React-based car identification system for St. John's Indian Orthodox Church**

Find car owners instantly by license plate number with privacy protection and mobile-first design.

---

## 🌟 What Does This App Do?

<details>
<summary><strong>🔍 Click here to see how it works (Interactive Demo)</strong></summary>

### Step-by-Step Guide:

1. **📱 Open the app** on your phone or computer
2. **✍️ Type any car number** in the search box:
   ```
   Examples you can try:
   • ABC1234
   • ABC-1234
   • ABC 1234
   • GJ01AB1234 (for government vehicles)
   ```
3. **⚡ Get instant results** showing:
   - 👤 **Owner name** (privacy protected: "John Sm***")
   - 🚙 **Car details** (Toyota Sedan)
   - 📋 **Membership status** (Active Member)
   - 📞 **Contact instructions**

### What makes it special:
- ✅ Works with **any car number format**
- ✅ **Privacy protected** - no full names shown
- ✅ **Mobile-friendly** - works on all phones
- ✅ **Instant search** with suggestions as you type

</details>

---

## 🛡️ Security & Privacy Features

> **🔐 Your data is protected with enterprise-grade security measures**

<table>
<tr>
<td width="50%">

### 🔒 **Privacy Protection**
- **Name Masking**: Shows "John Sm***" instead of full names
- **No Contact Info**: Phone numbers and addresses never displayed
- **Member Data Only**: Limited to church member information
- **Secure Storage**: Data encrypted and access-controlled

</td>
<td width="50%">

### 🛡️ **Technical Security**
- **Content Security Policy** (CSP) headers prevent malicious scripts
- **Input Sanitization** blocks harmful code injection
- **HTTPS-Only** communication in production
- **No Logging** of personal information in server logs
- **API Rate Limiting** prevents abuse

</td>
</tr>
</table>

> **🏛️ Church-Approved**: Designed specifically for church community safety and privacy

---

## 🚀 Quick Start

<details>
<summary><strong>👨‍💻 For Developers - Click to expand</strong></summary>

```bash
# 1. Clone the project
git clone https://github.com/SujoyAbraham/SJIOCCarLookup.git
cd SJIOCCarLookup

# 2. Install dependencies (takes ~30 seconds)
npm install

# 3. Set up your OpenAI API key
echo "OPENAI_API_KEY=your-key-here" > .env

# 4. Start the app (opens at http://localhost:3000)
npm run dev
```

**Need an OpenAI API key?** 
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create account → API Keys → Create new key
3. Copy and paste into `.env` file

</details>

<details>
<summary><strong>🌐 For Church Administrators - Click to expand</strong></summary>

### Deploy to the web (Free):

1. **Fork this repository** on GitHub
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Import your forked repository
3. **Add your API key** in Vercel dashboard:
   - Settings → Environment Variables
   - Add `OPENAI_API_KEY` with your key
4. **Deploy** - Your app will be live in minutes!

**💰 Cost**: ~$1-5/month depending on usage

</details>

---

## 💡 How to Use

### 📱 For Church Members (Simple Guide):

<details>
<summary><strong>🔍 Searching for a Car Owner</strong></summary>

**Scenario**: You see a car in the church parking lot and want to find the owner.

1. **📱 Open the app** on your phone
2. **👀 Look at the car's license plate**
3. **✍️ Type the number** in the search box:
   - Don't worry about spaces or dashes
   - Works with: `ABC1234`, `ABC-1234`, or `ABC 1234`
4. **📋 See the results**:
   ```
   🚗 ABC-1234
   👤 Owner: John Sm***
   🚙 Vehicle: Toyota Sedan
   📋 Status: Active Member
   📞 Contact church trustees for owner details
   ```

**✅ That's it!** The app protects privacy while helping you connect.

</details>

<details>
<summary><strong>🛠️ For Different Car Number Formats</strong></summary>

The app is smart and handles all these formats:

| Format | Example | Description |
|--------|---------|-------------|
| **Simple** | `ABC1234` | No spaces or symbols |
| **With Dash** | `ABC-1234` | Standard format |
| **With Spaces** | `ABC 1234` | Spaced format |
| **Government** | `GJ01AB1234` | 9-10 digit plates |
| **Mixed** | `AB12-CD34` | Any combination |

**💡 Pro Tip**: Just type what you see - the app figures out the rest!

</details>

---

## 🏗️ Architecture & Technology

<details>
<summary><strong>🔧 Technical Stack (For Developers)</strong></summary>

### Frontend (What Users See):
- **React 18** - Modern user interface
- **Tailwind CSS** - Beautiful, responsive design
- **Framer Motion** - Smooth animations
- **Vite** - Lightning-fast development

### Backend (Server Logic):
- **Vercel API** - Serverless functions
- **OpenAI GPT** - Intelligent search processing
- **CSV Database** - Simple member data storage

### Security Layer:
- **Content Security Policy** headers
- **Input sanitization** and validation  
- **Privacy masking** algorithms
- **HTTPS-only** communication

</details>

<details>
<summary><strong>📁 Project Structure</strong></summary>

```
📦 SJIOC Car Lookup
├── 📂 src/                    # React application
│   ├── 📂 components/         # UI components
│   │   ├── 🧩 MobileApp.jsx   # Main app interface
│   │   ├── 🔍 CarSearchInput.jsx # Search box
│   │   └── 📋 SearchResult.jsx    # Results display
│   ├── 📂 hooks/             # React logic
│   │   └── 🔗 useCarSearch.js # Search functionality
│   └── 📂 utils/             # Helper functions
│       └── 🔧 carSearchEngine.js # Search algorithms
├── 📂 api/                   # Server functions
│   ├── 🤖 chat.js           # AI-powered search
│   └── 👥 members.js        # Member data API
└── 📊 members_data.csv      # Church member database
```

</details>

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Free)
```bash
# Deploy in 3 commands:
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: Netlify (Alternative - Free)
1. Build the project: `npm run build`
2. Upload `dist/` folder to Netlify
3. Add environment variables

### Option 3: Church Server
- Upload built files to your church website
- Requires PHP/Node.js hosting

---

## 📊 Sample Data Format

<details>
<summary><strong>📄 CSV File Structure (For Data Management)</strong></summary>

Your `members_data.csv` should look like this:

```csv
First Name,Last Name,Member,Car Type,Car Manufacturer,Car Number
John,Smith,Y,Sedan,Toyota,ABC-1234
Mary,Johnson,Y,SUV,Honda,XYZ-5678
Peter,Williams,N,Hatchback,Maruti,DEF-9012
Sarah,Brown,Y,Sedan,Hyundai,GHI-3456
```

**Column Explanations**:
- **First Name, Last Name**: Member's name (privacy protected)
- **Member**: Y = Active Member, N = Non-Member
- **Car Type**: Sedan, SUV, Hatchback, etc.
- **Car Manufacturer**: Toyota, Honda, Maruti, etc.
- **Car Number**: License plate (any format)

</details>

---

## 🔧 Development Commands

<details>
<summary><strong>⌨️ Developer Commands</strong></summary>

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Maintenance
npm install              # Install dependencies
npm audit fix           # Fix security issues
npm update              # Update packages
```

</details>

---

## 🆘 Troubleshooting

<details>
<summary><strong>🔧 Common Issues & Solutions</strong></summary>

### 🚫 "No results found"
- **Check spelling** of car number
- **Try different formats**: ABC1234, ABC-1234, ABC 1234
- **Verify data**: Ensure car exists in CSV file

### ⚠️ "API Error"
- **Check API key**: Ensure OPENAI_API_KEY is set correctly
- **Check internet**: API requires internet connection
- **Check usage**: Verify OpenAI account has credits

### 📱 "App won't load"
- **Clear cache**: Refresh browser (Ctrl+F5)
- **Check JavaScript**: Ensure JavaScript is enabled
- **Try different browser**: Chrome, Safari, Firefox

### 💾 "Data upload issues"
- **CSV format**: Ensure proper column headers
- **File encoding**: Save CSV as UTF-8
- **File size**: Keep under 1MB for best performance

</details>

---

## 📞 Support & Contact

<details>
<summary><strong>🤝 Getting Help</strong></summary>

### For Church Members:
- **Contact Church Trustees** for general questions
- **Call Church Office** for urgent car owner contact needs
- **Ask IT Committee** for technical issues

### For Developers:
- **Create Issue**: [GitHub Issues](https://github.com/SujoyAbraham/SJIOCCarLookup/issues)
- **Email Support**: Contact church IT committee
- **Community**: Ask in church WhatsApp tech group

### For Administrators:
- **Data Updates**: Contact church secretary
- **Access Issues**: Contact IT trustees
- **Security Concerns**: Immediate escalation to leadership

</details>

---

## 📜 Privacy Policy Summary

> **🔐 Your privacy is our priority. This app follows strict church guidelines:**

- ✅ **Limited Data**: Only car numbers and masked owner names
- ✅ **No Tracking**: No user behavior tracking or analytics
- ✅ **Church Use Only**: Designed specifically for SJIOC community
- ✅ **No Sharing**: Data never shared with third parties
- ✅ **Secure Storage**: Enterprise-grade data protection

---

**🏛️ Made with ❤️ for St. John's Indian Orthodox Church Community**

*React • Secure • Mobile-First • Privacy-Protected*

---

<div align="center">

### 🌟 **Ready to get started?**

[📱 **Use the App**](#-how-to-use) | [👨‍💻 **Setup Guide**](#-quick-start) | [🔒 **Security Details**](#%EF%B8%8F-security--privacy-features)

</div>