# 🚗 SJIOC Plate Lookup

**Find car owners instantly by license plate number**

Modern React app for St. John's Indian Orthodox Church with privacy protection, smart AI assistance, and flexible search options.

---

## ✨ Features

- **🗣️ Natural Language**: "Who owns xy9876?" or "Find owner of ABC 1234"
- **🔍 Flexible Search**: Works with ANY format - abc1234, ABC-1234, ABC 1234
- **🤖 AI-Powered**: Smart GPT integration with optimized context
- **🔒 Privacy Protected**: Shows masked names (John Sm***)
- **📱 Mobile-First**: Touch-friendly responsive design
- **⚡ Cost Efficient**: ~$0.0003 per search (very affordable!)

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd SJIOCCarLookup
npm install

# Add OpenAI API key (optional)
echo "OPENAI_API_KEY=your-key-here" > .env

# Start development
npm run dev
```

---

## 💬 How to Use

**Natural Language Queries (Works with ANY format!):**
- "find xy9876" → Finds XY9-876
- "who owns abc1234" → Finds ABC-1234  
- "owner of GH1 234" → Finds GH1-234
- "car blocking me: tu7-234" → Finds TU7-234

**Direct Search:**
- Type any plate: **xy9876**, **ABC-1234**, **GH1 234**
- Supports: lowercase, UPPERCASE, with/without dashes or spaces
- Auto-suggests as you type

---

## 🔒 Security & Privacy

- **Privacy First**: Shows only "John Sm***" (masked names)
- **No Reverse Lookup**: Can't search by owner name
- **Smart Context**: Sends only relevant records to AI (not full database)
- **No Bulk Access**: Prevents downloading all member data
- **Secure API**: OpenAI integration with privacy controls

---

## 🌐 Deployment

**Vercel (Free):**
```bash
vercel --prod
```

Add `OPENAI_API_KEY` in Vercel dashboard environment variables.

---

## 📊 Data Format

```csv
First Name,Last Name,Member,Car Type,Car Manufacturer,Plate Number
John,Smith,Y,Sedan,Toyota,ABC-1234
Sarah,Johnson,Y,SUV,Honda,XY9-876
```

## 💰 AI Cost Summary

**Current Implementation:**
- **Cost per search**: ~$0.0003 (very affordable!)
- **Monthly cost** (1000 searches): ~$0.30
- **Smart context**: Only sends relevant records (not full database)
- **Token usage**: ~1,690 tokens per query
- **Optimized**: 70-80% reduction vs sending full CSV

*Perfect for church community use - minimal ongoing costs!*

---

## 🎯 Tech Stack

- **React 18** + **Vite** (Modern frontend)
- **Tailwind CSS** + **Framer Motion** (Beautiful UI)  
- **OpenAI GPT-4o-mini** (Smart AI with cost optimization)
- **Smart Context Algorithm** (Sends only relevant data)
- **Vercel** deployment (Free hosting)

---

---

## 🔧 For Church Admins

**Adding New Members:**
1. Update `members_data.csv` with new plate numbers
2. Use format: `ABC-1234` (letters-dash-numbers)
3. Deploy automatically updates the search

**Cost Monitoring:**
- Each search costs ~$0.0003
- Monthly limit recommendations: Set OpenAI API limit to $10/month
- Expected usage: 1000 searches = $0.30

---

**Made with ❤️ for SJIOC Community**  
*AI-Powered • Privacy-Protected • Mobile-First • Cost-Efficient*