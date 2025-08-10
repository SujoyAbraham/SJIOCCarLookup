# 🚗 SJIOC Car Lookup

**Find car owners instantly by license plate number**

Modern React app for St. John's Indian Orthodox Church with privacy protection and natural language support.

---

## ✨ Features

- **🗣️ Natural Language**: "Who owns car ABC-1234?" or "Find owner of XYZ-789"
- **🔍 Smart Search**: Works with any US state license plate format
- **🔒 Privacy Protected**: Shows masked names (John Sm***)
- **📱 Mobile-First**: Touch-friendly responsive design
- **⚡ Instant Results**: Real-time search with auto-suggestions

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

**Natural Language Queries:**
- "Who owns car ABC-1234?"
- "Find the owner of XYZ-789"
- "I need info on plate 7ABC123"
- "Car blocking me: FLORIDA123"

**Direct Search:**
- Just type any license plate number
- Works with all formats: ABC1234, ABC-1234, ABC 1234

---

## 🔒 Security

- **Privacy First**: No full names or contact details shown
- **No Reverse Lookup**: Can't search by owner name
- **No Bulk Queries**: Prevents listing all cars/owners
- **Strict Symbol Matching**: Wrong symbols get helpful corrections

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
```

---

## 🎯 Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** + **Framer Motion**  
- **OpenAI GPT** (optional enhancement)
- **Vercel** deployment

---

**Made with ❤️ for SJIOC Community**  
*Privacy-Protected • Mobile-First • Natural Language*