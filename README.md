# HarvestAI

**HarvestAI** is a high-performance, AI-driven SaaS platform for web data extraction and lead generation. It combines the power of modern scraping engines with Large Language Models (LLMs) to turn any website into structured, actionable data.

Built with a focus on speed, reliability, and ease of use, HarvestAI is designed for businesses, marketers, and researchers who need complex data without writing a single line of code.

---

## 🚀 Core Features

### 1. Lead Finder 🎯
*   **Directory Scraping**: Automatically extracts leads from popular Nigerian directories (VConnect, BusinessList NG) and global sources (Yellow Pages, Google Maps, Kompass).
*   **AI Enrichment**: Uses Gemini 2.0 Flash to extract contact details (Email, Phone, LinkedIn) and rank each lead by relevance.
*   **Deduplication**: Automatically filters out duplicate entries to ensure a clean list.
*   **Scoring**: Intelligent scoring based on proximity, review count, and business relevance.

### 2. Data Extractor 🔍
*   **Plain English Extraction**: Paste any URL and describe what you want in natural language (e.g., "Extract every product name, price, and image URL").
*   **Hybrid Scraping**: Switches between fast static HTML scraping (Cheerio) and headless browser execution (Playwright) to handle modern, JavaScript-heavy sites.
*   **Schema Logic**: AI-powered schema generation for flexible data structures.

### 3. Usage & Billing 💳
*   **Credit-Based System**: Flexible consumption model with monthly free resets.
*   **Multi-Region Payments**: Full integration with **Paystack** for NGN (Nigerian Naira) and **Stripe** for USD (US Dollars).
*   **Tiered Pricing**: Starter, Pro, and Power packs for varying needs.

### 4. Real-Time Experience ⚡
*   **SSE Job Streaming**: Watch your jobs run in real-time with Server-Sent Events (SSE) providing live progress updates.
*   **Export Ready**: Download your data as professional CSV or JSON with a single click.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: Vanilla CSS (Industrial Dark Design System)
- **Auth**: [Firebase Auth](https://firebase.google.com/docs/auth)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Scraping**: [Playwright](https://playwright.dev/) & [Cheerio](https://cheerio.js.org/)
- **AI Engine**: Gemini 2.0 Flash (Primary), Gemini 1.5 Flash, Groq (Llama 3.3 70B)
- **Deployment**: Render (Server), Vercel (Client)

---

## 🛠️ Local Development

### 1. Prerequisites
- Node.js 20+
- A Neon Postgres Database
- Firebase Project (Admin SDK JSON)
- Gemini API Key

### 2. Setup Environments
Create `.env` files in both `client/` and `server/` using the `.env.example` templates.

**Server (`server/.env`):**
```bash
DATABASE_URL=...
GEMINI_API_KEY=...
FIREBASE_SERVICE_ACCOUNT_JSON=...
STRIPE_SECRET_KEY=...
PAYSTACK_SECRET_KEY=...
```

**Client (`client/.env`):**
```bash
VITE_API_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=...
```

### 3. Installation
```bash
# Install root dependencies (scripts)
npm install

# Install server/client
cd server && npm install
cd ../client && npm install
```

### 4. Running the App
Use the provided automation script:
```powershell
./scripts/start-all.ps1
```
Or run manually:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

---

## 🧩 Browser Extension

HarvestAI comes with a **Chromium & Safari** extension to capture URLs directly from your browser.

- **To install (Chrome)**: 
    1. Go to `chrome://extensions`.
    2. Enable "Developer mode".
    3. Click "Load unpacked" and select the `extension` folder.
- **To sync auth**: The extension automatically syncs your login token if you are logged into the web app.

---

## 📄 License
© 2026 HarvestAI. Built by TrueWeb Solutions. All rights reserved.
