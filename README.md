# Trade Doctor - "Beast-Level" Financial Analytics SaaS

Trade Doctor is a comprehensive, highly optimized technical market intelligence and AI-driven educational trading assistant. Designed with a futuristic, cyberpunk Bloomberg Terminal aesthetic, it combines a high-performance Python/Flask data calculation engine, an ultra-modern React/Vite frontend, and Google Gemini 1.5 Flash multimodal analytics to diagnose trading entry mistakes and track institutional smart money flow.

---

## Workspace Architecture

- **`app.py`**: The main Flask server exposing REST API endpoints for indicators, custom pre-trade diagnostics, natural language queries, and subscription validation.
- **`data_fetcher.py`**: Free, high-performance integration with `yfinance` to query actual real-time ticker data and historical daily candles. Tracks exactly 55 Global (US/Crypto/Wall Street) and Indian (NSE/BSE) high-growth assets.
- **`indicator_engine.py`**: Computes aligned SMA, EMA, RSI, MACD, and ATR. Includes pre-trade Trade Health Scores (0 to 100), Volume Z-score smart money indicators, and risk ratio stop estimation tools.
- **`ai_signal.py`**: Conversational natural language query parser and Base64 image-uploaded screenshot diagnostics identifying candlestick/chart patterns (Double Bottom, Hammer, etc.) with strict legal disclaimers.
- **`src/`**: The complete cyberpunk React/Vite/Tailwind frontend dashboard.
- **`tests.py`**: Exhaustive unittest coverage verifying calculations and routes.

---

## Core Requirements & Gating Logic

- **Free Tier ($0)**: Access to basic metrics, candle charts, and top-level health score. Conversational search limited to 1 query per 24 hours. Includes a special promo pre-activating Pro Tier ($29.99/mo) completely free in the first month!
- **Pro Tier ($29.99/mo)**: Unlocks unlimited AI Searches, personal Trade Journals, ATR stop sizers, and unlimited chart review uploads.
- **VIP Inner Circle ($69.99/mo)**: Complete unrestricted access. Unlocks live Dark Pool smart money volume Z-scores, live Whale Alerts, Telegram bot push alert hookups, and 1-Click AI morning briefs.

---

## Setup & Running Locally

Ensure you have Python 3.8+ and Node.js 18+ installed on your machine.

### 1. Install & Run the Python/Flask Backend API
```bash
# Install Python packages
pip install -r requirements.txt

# Start the backend server on port 5000
python3 app.py
```

### 2. Install & Run the TypeScript/React Frontend Dashboard
```bash
# Set your local Gemini API Key in .env
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

# Install Node modules
npm install

# Start Vite frontend development server
npm run dev
```

---

## Running the Unit Tests
Execute the full Python backend test suite:
```bash
python3 -m unittest tests.py
```
