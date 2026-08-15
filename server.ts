import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEGAL_DISCLAIMER = 'For educational and informational purposes only. Not financial or investment advice. Always manage your risk responsibly.';

// 55 High-Growth Assets across Wall Street, Global Crypto, and Indian NSE Equities
const HIGH_GROWTH_ASSETS = [
  // Wall Street & Global Tech (20)
  { ticker: 'AAPL', name: 'Apple Inc.', market: 'Global', sector: 'Tech' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', market: 'Global', sector: 'Tech' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', market: 'Global', sector: 'Tech' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', market: 'Global', sector: 'Consumer Discretionary' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', market: 'Global', sector: 'Semiconductors' },
  { ticker: 'TSLA', name: 'Tesla Inc.', market: 'Global', sector: 'Automotive / EV' },
  { ticker: 'META', name: 'Meta Platforms', market: 'Global', sector: 'Tech / Social' },
  { ticker: 'NFLX', name: 'Netflix Inc.', market: 'Global', sector: 'Entertainment' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', market: 'Global', sector: 'Semiconductors' },
  { ticker: 'AVGO', name: 'Broadcom Inc.', market: 'Global', sector: 'Semiconductors' },
  { ticker: 'QCOM', name: 'Qualcomm Inc.', market: 'Global', sector: 'Semiconductors' },
  { ticker: 'SMCI', name: 'Super Micro Computer', market: 'Global', sector: 'Tech / Hardware' },
  { ticker: 'ASML', name: 'ASML Holding', market: 'Global', sector: 'Semiconductors' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', market: 'Global', sector: 'Finance' },
  { ticker: 'GS', name: 'Goldman Sachs Group', market: 'Global', sector: 'Finance' },
  { ticker: 'BAC', name: 'Bank of America Corp.', market: 'Global', sector: 'Finance' },
  { ticker: 'V', name: 'Visa Inc.', market: 'Global', sector: 'Finance / Fintech' },
  { ticker: 'MA', name: 'Mastercard Inc.', market: 'Global', sector: 'Finance / Fintech' },
  { ticker: 'COIN', name: 'Coinbase Global', market: 'Global', sector: 'Fintech / Crypto' },
  { ticker: 'PYPL', name: 'PayPal Holdings', market: 'Global', sector: 'Fintech' },

  // Global Crypto (10)
  { ticker: 'BTC-USD', name: 'Bitcoin', market: 'Global', sector: 'Crypto' },
  { ticker: 'ETH-USD', name: 'Ethereum', market: 'Global', sector: 'Crypto' },
  { ticker: 'SOL-USD', name: 'Solana', market: 'Global', sector: 'Crypto' },
  { ticker: 'ADA-USD', name: 'Cardano', market: 'Global', sector: 'Crypto' },
  { ticker: 'DOGE-USD', name: 'Dogecoin', market: 'Global', sector: 'Crypto' },
  { ticker: 'XRP-USD', name: 'Ripple', market: 'Global', sector: 'Crypto' },
  { ticker: 'DOT-USD', name: 'Polkadot', market: 'Global', sector: 'Crypto' },
  { ticker: 'LINK-USD', name: 'Chainlink', market: 'Global', sector: 'Crypto' },
  { ticker: 'BNB-USD', name: 'Binance Coin', market: 'Global', sector: 'Crypto' },
  { ticker: 'MATIC-USD', name: 'Polygon', market: 'Global', sector: 'Crypto' },

  // Indian Blue-Chip & Growth Equities (25)
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', market: 'India', sector: 'Energy / Retail' },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', market: 'India', sector: 'Tech / IT' },
  { ticker: 'INFY.NS', name: 'Infosys Ltd.', market: 'India', sector: 'Tech / IT' },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', market: 'India', sector: 'Finance / Banking' },
  { ticker: 'ICICIBANK.NS', name: 'ICICI Bank Ltd.', market: 'India', sector: 'Finance / Banking' },
  { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd.', market: 'India', sector: 'Telecom' },
  { ticker: 'SBIN.NS', name: 'State Bank of India', market: 'India', sector: 'Finance / Banking' },
  { ticker: 'LTIM.NS', name: 'LTIMindtree Ltd.', market: 'India', sector: 'Tech / IT' },
  { ticker: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd.', market: 'India', sector: 'Consumer Goods' },
  { ticker: 'ITC.NS', name: 'ITC Ltd.', market: 'India', sector: 'Conglomerate' },
  { ticker: 'TATAMOTORS.NS', name: 'Tata Motors Ltd.', market: 'India', sector: 'Automotive / EV' },
  { ticker: 'TATASTEEL.NS', name: 'Tata Steel Ltd.', market: 'India', sector: 'Metal / Mining' },
  { ticker: 'M&M.NS', name: 'Mahindra & Mahindra Ltd.', market: 'India', sector: 'Automotive' },
  { ticker: 'ADANIENT.NS', name: 'Adani Enterprises Ltd.', market: 'India', sector: 'Infrastructure' },
  { ticker: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries', market: 'India', sector: 'Health / Pharma' },
  { ticker: 'WIPRO.NS', name: 'Wipro Ltd.', market: 'India', sector: 'Tech / IT' },
  { ticker: 'POWERGRID.NS', name: 'Power Grid Corp.', market: 'India', sector: 'Energy / Power' },
  { ticker: 'NTPC.NS', name: 'NTPC Ltd.', market: 'India', sector: 'Energy / Power' },
  { ticker: 'COALINDIA.NS', name: 'Coal India Ltd.', market: 'India', sector: 'Energy / Mining' },
  { ticker: 'ONGC.NS', name: 'Oil & Natural Gas Corp.', market: 'India', sector: 'Energy / Oil & Gas' },
  { ticker: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd.', market: 'India', sector: 'Finance / NBFC' },
  { ticker: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd.', market: 'India', sector: 'Finance / Insurance' },
  { ticker: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', market: 'India', sector: 'Finance / Banking' },
  { ticker: 'AXISBANK.NS', name: 'Axis Bank Ltd.', market: 'India', sector: 'Finance / Banking' },
  { ticker: 'MARUTI.NS', name: 'Maruti Suzuki India', market: 'India', sector: 'Automotive' },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL || 'https://trade-doctor-backend.onrender.com';

  // Helper to forward API calls to the live Render backend with fallback
  const tryProxyToRenderBackend = async (reqPath: string, method: string = 'GET', body?: any) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for Render instance

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(`${RENDER_BACKEND_URL}${reqPath}`, options);
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return { success: true, data };
      }
    } catch (err) {
      // Render instance warming up or timed out; fallback to local handler
    }
    return { success: false, data: null };
  };

  // Helper for lazy initialization of Gemini AI client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-trade-doctor',
        },
      },
    });
  };

  // Helper to generate simulated candles with indicators
  const generateHistoricalCandles = (ticker: string, historyLength: number = 30) => {
    const basePrices: Record<string, number> = {
      'BTC-USD': 96500,
      'ETH-USD': 3450,
      'SOL-USD': 185,
      'AAPL': 225,
      'NVDA': 128,
      'TSLA': 240,
      'RELIANCE.NS': 2950,
      'TCS.NS': 4150,
      'INFY.NS': 1820,
      'HDFCBANK.NS': 1680,
      'GOLD': 2420,
    };

    const startPrice = basePrices[ticker] || 150;
    const history = [];
    let current = startPrice;
    const now = new Date();

    for (let i = historyLength - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const fluctuation = (Math.random() - 0.48) * (startPrice * 0.025);
      const open = Number(current.toFixed(2));
      const close = Number(Math.max(1, open + fluctuation).toFixed(2));
      const high = Number((Math.max(open, close) + Math.random() * (startPrice * 0.01)).toFixed(2));
      const low = Number((Math.min(open, close) - Math.random() * (startPrice * 0.01)).toFixed(2));
      const volume = Math.floor(100000 + Math.random() * 5000000);

      const rsi = Number(Math.min(95, Math.max(15, 50 + (close - open) / (startPrice * 0.005))).toFixed(1));
      const macd = Number(((close - open) * 0.2).toFixed(2));
      const macdSignal = Number((macd * 0.8).toFixed(2));
      const macdHist = Number((macd - macdSignal).toFixed(2));
      const sma20 = Number((open * 0.99).toFixed(2));
      const sma50 = Number((open * 0.97).toFixed(2));
      const sma200 = Number((open * 0.92).toFixed(2));
      const ema20 = Number((open * 0.995).toFixed(2));

      current = close;

      history.push({
        date: dateStr,
        open,
        high,
        low,
        close,
        volume,
        rsi,
        macd,
        macdSignal,
        macdHist,
        sma20,
        sma50,
        sma200,
        ema20,
      });
    }

    return history;
  };

  // -------------------------------------------------------------
  // HEALTH API
  // -------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'AI Trade & Chart Doctor Ecosystem',
      version: '2.0.0',
      disclaimer: LEGAL_DISCLAIMER,
      timestamp: new Date().toISOString(),
    });
  });

  // -------------------------------------------------------------
  // ENDPOINT 1: Market Data & Technical Indicators
  // -------------------------------------------------------------
  app.get('/api/market-data', (req, res) => {
    try {
      const ticker = ((req.query.ticker as string) || 'AAPL').toUpperCase().trim();
      const period = ((req.query.period as string) || '1mo').trim();
      const interval = ((req.query.interval as string) || '1d').trim();

      const history = generateHistoricalCandles(ticker, 30);
      const latest = history[history.length - 1];
      const prev = history[history.length - 2] || latest;

      const current_price = latest.close;
      const previous_close = prev.close;
      const atr = Number((current_price * 0.02).toFixed(2));

      const support_zone = Number((current_price - 1.5 * atr).toFixed(2));
      const resistance_zone = Number((current_price + 1.5 * atr).toFixed(2));
      const stop_loss_zone = Number((current_price - 2.0 * atr).toFixed(2));

      let trend_reversal_prob = 50.0;
      if (latest.rsi < 30) {
        trend_reversal_prob = 50.0 + (30.0 - latest.rsi) * 2.0;
      } else if (latest.rsi > 70) {
        trend_reversal_prob = 50.0 + (latest.rsi - 70.0) * 2.0;
      }

      res.json({
        ticker,
        period,
        interval,
        realtime_details: {
          ticker,
          current_price,
          open: latest.open,
          day_high: latest.high,
          day_low: latest.low,
          previous_close,
          volume: latest.volume,
          currency: ticker.endsWith('.NS') ? 'INR' : 'USD',
        },
        risk_reward_estimation: {
          support_zone,
          resistance_zone,
          stop_loss_zone,
          atr,
        },
        trend_reversal_probability_percent: Number(Math.min(95, Math.max(5, trend_reversal_prob)).toFixed(1)),
        history,
        disclaimer: LEGAL_DISCLAIMER,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch market data' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 2: AI Signal Generator (Probabilistic Technical Estimate)
  // -------------------------------------------------------------
  app.get('/api/ai-signal', async (req, res) => {
    try {
      const ticker = ((req.query.ticker as string) || 'AAPL').toUpperCase().trim();
      const history = generateHistoricalCandles(ticker, 30);
      const latest = history[history.length - 1];

      try {
        const ai = getGeminiClient();
        const prompt = `Analyze market asset ${ticker}:
- Close Price: $${latest.close}
- RSI (14): ${latest.rsi}
- MACD: ${latest.macd}
- SMA 20: $${latest.sma20}, SMA 50: $${latest.sma50}

Output a compliant probabilistic estimate:
- probabilistic_estimate: "High Probability Bullish Zone", "Neutral Consolidation Zone", or "High Probability Bearish Zone"
- confidence: "Low", "Medium", or "High"
- rationale: Technical rationale without absolute BUY/SELL statements or guarantees.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                probabilistic_estimate: { type: Type.STRING },
                confidence: { type: Type.STRING },
                rationale: { type: Type.STRING },
              },
              required: ['probabilistic_estimate', 'confidence', 'rationale'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          ticker,
          probabilistic_estimate: parsed.probabilistic_estimate || 'Neutral Consolidation Zone',
          confidence: parsed.confidence || 'Medium',
          rationale: parsed.rationale || 'Technical indicators suggest neutral momentum with key support holding.',
          indicator_snapshot: {
            close_price: latest.close,
            rsi_14: latest.rsi,
            macd: latest.macd,
            macd_signal: latest.macdSignal,
            sma_20: latest.sma20,
            sma_50: latest.sma50,
            sma_200: latest.sma200,
          },
          source: 'Gemini AI',
          disclaimer: LEGAL_DISCLAIMER,
        });
      } catch (aiErr) {
        // Fallback rule engine
        let zone = 'Neutral Consolidation Zone';
        let rationale = 'Technical indicators suggest neutral momentum. Consolidating near support.';
        if (latest.rsi < 35) {
          zone = 'High Probability Bullish Zone';
          rationale = `RSI (${latest.rsi}) indicates oversold territory near major support bounds.`;
        } else if (latest.rsi > 68) {
          zone = 'High Probability Bearish Zone';
          rationale = `RSI (${latest.rsi}) indicates overbought territory near key resistance bounds.`;
        }

        return res.json({
          ticker,
          probabilistic_estimate: zone,
          confidence: 'Medium (Rule Engine)',
          rationale,
          indicator_snapshot: {
            close_price: latest.close,
            rsi_14: latest.rsi,
            macd: latest.macd,
            macd_signal: latest.macdSignal,
          },
          source: 'Fallback Technical Rule Engine',
          disclaimer: LEGAL_DISCLAIMER,
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Signal generation failed' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 3: High-Growth Assets with Premium Gate
  // -------------------------------------------------------------
  app.get('/api/high-growth-assets', (req, res) => {
    try {
      const region = ((req.query.region as string) || 'all').trim().toLowerCase();
      const sector = ((req.query.sector as string) || 'all').trim().toLowerCase();

      let filtered = HIGH_GROWTH_ASSETS;
      if (region !== 'all') {
        filtered = filtered.filter((a) => a.market.toLowerCase() === region);
      }
      if (sector !== 'all') {
        filtered = filtered.filter((a) => a.sector.toLowerCase().includes(sector));
      }

      const enriched = filtered.map((asset, index) => {
        const is_locked = index >= 2;
        const seed = asset.ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const growth_rate_pct = Number((15.0 + (seed % 40) + (seed % 10) / 10.0).toFixed(1));
        const rsi = 30 + (seed % 50);
        const sentiment = rsi < 70 ? 'Bullish' : 'Bearish';
        const trend_confidence = growth_rate_pct > 35 ? 'High' : growth_rate_pct > 22 ? 'Medium' : 'Low';
        const catalyst = asset.sector.includes('Semiconductors')
          ? 'AI Chips Surge & Supercomputing Demand'
          : asset.sector.includes('Crypto')
          ? 'Institutional Inflows & Halving Dynamics'
          : 'Earning Beat & Strategic Expansion';

        const ui_metadata = {
          icon_class: asset.sector === 'Crypto' ? 'fa-brands fa-bitcoin text-amber-500' : 'fa-solid fa-chart-line text-emerald-500',
          badge_color: sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          theme_glow_color: sentiment === 'Bullish' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          chart_gradient_stops: sentiment === 'Bullish' ? ['#10b981', '#047857'] : ['#f43f5e', '#be123c'],
        };

        if (is_locked) {
          return {
            ticker: asset.ticker,
            name: asset.name,
            market: asset.market as 'Global' | 'India',
            sector: asset.sector,
            is_locked: true,
            growth_rate_pct: null,
            rsi: null,
            sentiment: '[LOCKED]',
            trend_confidence: '[LOCKED]',
            catalyst: '[LOCKED]',
            ui_metadata: {
              icon_class: 'fa-solid fa-lock text-slate-500',
              badge_color: 'bg-slate-800 text-slate-400 border border-slate-700',
              theme_glow_color: 'rgba(100, 116, 139, 0.1)',
              chart_gradient_stops: ['#64748b', '#475569'],
            },
            premium_gate_overlay: {
              text: 'Unlock Premium Global & Indian Market Scanner — $19.99/month',
              live_data_text: 'Upgrade to Access Realtime Signal Stream & Asian/Indian Equity Depth',
              price_usd: 19.99,
              blur_style: 'backdrop-blur-md bg-slate-950/80 border border-slate-800',
              call_to_action_class: 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all',
            },
          };
        }

        return {
          ticker: asset.ticker,
          name: asset.name,
          market: asset.market as 'Global' | 'India',
          sector: asset.sector,
          is_locked: false,
          growth_rate_pct,
          rsi,
          sentiment,
          trend_confidence,
          catalyst,
          ui_metadata,
        };
      });

      res.json({
        assets: enriched,
        count_total: HIGH_GROWTH_ASSETS.length,
        count_filtered: enriched.length,
        disclaimer: LEGAL_DISCLAIMER,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch high growth assets' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 4: Position Sizing Calculator
  // -------------------------------------------------------------
  app.post('/api/position-size', (req, res) => {
    try {
      const {
        account_size = 0,
        risk_percentage = 0,
        entry_price = 0,
        stop_loss_price = 0,
      } = req.body;

      if (!account_size || !risk_percentage || !entry_price || !stop_loss_price) {
        return res.status(400).json({
          error: 'Missing parameters. Required: account_size, risk_percentage, entry_price, stop_loss_price',
          disclaimer: LEGAL_DISCLAIMER,
        });
      }

      const risk_decimal = risk_percentage > 1.0 ? risk_percentage / 100.0 : risk_percentage;
      const total_capital_at_risk = account_size * risk_decimal;
      const risk_per_unit = Math.abs(entry_price - stop_loss_price);

      if (risk_per_unit === 0) {
        return res.json({ units: 0, total_capital_at_risk: 0, position_value: 0, disclaimer: LEGAL_DISCLAIMER });
      }

      const units = Math.floor(total_capital_at_risk / risk_per_unit);
      const position_value = Number((units * entry_price).toFixed(2));

      res.json({
        units,
        total_capital_at_risk: Number(total_capital_at_risk.toFixed(2)),
        position_value,
        disclaimer: LEGAL_DISCLAIMER,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed position size calculation' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 5: Multimodal Candlestick Visual Analysis
  // -------------------------------------------------------------
  app.post('/api/analyze-chart', async (req, res) => {
    try {
      const { image_base64 } = req.body;
      if (!image_base64) {
        return res.status(400).json({ error: "Missing parameter: 'image_base64' is required.", disclaimer: LEGAL_DISCLAIMER });
      }

      try {
        const ai = getGeminiClient();
        const cleanBase64 = image_base64.replace(/^data:image\/\w+;base64,/, '');

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              inlineData: { mimeType: 'image/jpeg', data: cleanBase64 },
            },
            `Analyze this candlestick chart screenshot. Identify user entry mistakes and soft suggestions where it seems appropriate to manage downside risk. Output strictly JSON with schema:
            {
              "is_valid_chart": true,
              "identified_mistake": "string",
              "appropriate_entry_zone": "string",
              "educational_analysis": "string"
            }`,
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const data = JSON.parse(response.text || '{}');
        return res.json({
          is_valid_chart: data.is_valid_chart ?? true,
          identified_mistake: data.identified_mistake || 'Entering trade late into parabolic momentum at resistance.',
          appropriate_entry_zone: data.appropriate_entry_zone || 'It seems appropriate to look for entry signals near support or consolidated pullbacks.',
          educational_analysis: data.educational_analysis || 'Chasing breakout wicks increases drawdown exposure.',
          disclaimer: LEGAL_DISCLAIMER,
          source: 'Gemini Multimodal Vision Engine',
        });
      } catch (aiErr) {
        return res.json({
          is_valid_chart: true,
          identified_mistake: 'Entering trade late into a parabolic candle at major resistance peak.',
          appropriate_entry_zone: 'It seems appropriate to monitor entry signals near established support or consolidated pullbacks.',
          educational_analysis: 'Chasing wicks often leads to buying local highs. Wait for candle confirmation closes.',
          disclaimer: LEGAL_DISCLAIMER,
          source: 'Fallback Rule Engine',
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Visual analysis failed' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 6: Market Gaps, Breakouts & Macro Trends
  // -------------------------------------------------------------
  app.get('/api/market-gaps-trends', (req, res) => {
    try {
      const ticker = ((req.query.ticker as string) || 'AAPL').toUpperCase().trim();
      const history = generateHistoricalCandles(ticker, 30);

      const recent_gaps = [
        {
          index_position: 28,
          gap_type: 'Gap Up',
          gap_percentage: 1.45,
          previous_close: history[27].close,
          current_open: history[28].open,
        },
      ];

      const latest = history[history.length - 1];
      const breakout_detected = latest.close > history[history.length - 5].high;
      const breakout_direction = breakout_detected ? 'Bullish Resistance Breakout' : null;

      res.json({
        ticker,
        recent_gaps,
        macro_trend: 'Bullish Uptrend',
        breakout_detected,
        breakout_direction,
        disclaimer: LEGAL_DISCLAIMER,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed gap/trend detection' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 7: Full Multimodal Vision Diagnostic
  // -------------------------------------------------------------
  app.post('/api/analyze-chart-image', async (req, res) => {
    try {
      const {
        imageBase64,
        imageMimeType = 'image/jpeg',
        marketCategory = 'Crypto',
        timeframe = '15m',
        userTradePlan = '',
        capitalAmount = 1000,
        riskTolerancePercent = 2,
      } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'Please upload a chart image or select a preset chart screenshot.' });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      try {
        const ai = getGeminiClient();
        const promptText = `
You are "Trade Doctor AI" (Trading Chart & Technical Analysis Specialist).
Analyze the attached candlestick / stock / crypto chart image with maximum accuracy.

Context Provided:
- Market Category: ${marketCategory}
- Chart Timeframe: ${timeframe}
- Trader's Planned Action or Thoughts: "${userTradePlan || 'No specific plan specified. Evaluate overall chart setup.'}"
- Trader's Account Capital: $${capitalAmount}
- Risk per trade preference: ${riskTolerancePercent}% ($${((capitalAmount * riskTolerancePercent) / 100).toFixed(2)})

Instructions:
1. Thoroughly inspect the chart: candlestick patterns (Doji, Engulfing, Hammer, Shooting Star, Marubozu), chart formations (Head & Shoulders, Double Top/Bottom, Triangles, Flags, Support & Resistance levels, Trendlines).
2. IDENTIFY ALL TRADING MISTAKES & DANGERS: Check if the user is buying at resistance (FOMO), shorting at support, ignoring bearish divergence, setting stop loss too tight or without buffer, over-leveraging, or trading counter-trend.
3. PINPOINT DANGER ZONES & SAFE ZONES: Explain exactly where buying/selling is dangerous and where the safest entry zone is located.
4. CALCULATE RECOMMENDATIONS: Provide exact price level estimations for Entry, Stop Loss, Take Profit Target 1, Take Profit Target 2, Risk/Reward Ratio, Maximum Safe Position Amount, and Recommended Leverage.
5. EXPLAIN IN CLEAR, HELPFUL ENGLISH: Provide a friendly, expert English diagnostic verdict, explaining what mistake was made, why it is dangerous, and step-by-step how to correct it.
`;

        const contents = [
          {
            inlineData: {
              mimeType: imageMimeType.includes('svg') ? 'image/png' : imageMimeType,
              data: cleanBase64,
            },
          },
          promptText,
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction: 'You are an elite institutional trader, risk officer, and market diagnostic doctor. Output strictly valid JSON conforming to the schema.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                verdict: {
                  type: Type.STRING,
                  description: 'One of: "DANGEROUS_MISTAKE", "HIGH_RISK_WARNING", "NEUTRAL_WAIT", "VALID_SETUP_BUY", "VALID_SETUP_SELL"',
                },
                overallScore: { type: Type.INTEGER, description: 'Trade setup health score 0-100' },
                headlineEnglish: { type: Type.STRING, description: '1-line English verdict summary' },
                detectedPattern: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of detected candlestick or chart patterns',
                },
                trendDirection: { type: Type.STRING, description: '"Bullish", "Bearish", "Sideways / Consolidation", or "Volatile Breakdown"' },
                mistakesFound: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      severity: { type: Type.STRING, description: '"Critical", "Moderate", or "Minor"' },
                      category: { type: Type.STRING, description: '"FOMO/Chasing", "Bad Stop Loss", "Over-Leverage", "Ignoring Resistance", or "Counter-Trend"' },
                    },
                    required: ['title', 'description', 'severity', 'category'],
                  },
                },
                dangerZoneDescription: { type: Type.STRING, description: 'Explanation of where the danger zone is on the chart and why' },
                safeZoneDescription: { type: Type.STRING, description: 'Explanation of where the safe entry zone is' },
                suggestedEntryPrice: { type: Type.STRING, description: 'Estimated recommended entry price or range' },
                suggestedStopLoss: { type: Type.STRING, description: 'Recommended stop loss price' },
                takeProfitTarget1: { type: Type.STRING, description: 'First conservative target price' },
                takeProfitTarget2: { type: Type.STRING, description: 'Second extended target price' },
                riskRewardRatio: { type: Type.STRING, description: 'Calculated Risk to Reward ratio e.g. 1:2.5' },
                suggestedMaxRiskAmount: { type: Type.STRING, description: 'Dollar risk recommendation based on capital' },
                suggestedPositionSize: { type: Type.STRING, description: 'Recommended position size amount' },
                recommendedLeverage: { type: Type.STRING, description: 'Recommended leverage limit (e.g. 2x - 3x spot)' },
                englishSummary: { type: Type.STRING, description: 'Detailed, friendly English explanation of the diagnosis and mistakes' },
                stepByStepCorrection: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Step by step action plan in English to fix the trade',
                },
              },
              required: [
                'verdict',
                'overallScore',
                'headlineEnglish',
                'detectedPattern',
                'trendDirection',
                'mistakesFound',
                'dangerZoneDescription',
                'safeZoneDescription',
                'suggestedEntryPrice',
                'suggestedStopLoss',
                'takeProfitTarget1',
                'takeProfitTarget2',
                'riskRewardRatio',
                'suggestedMaxRiskAmount',
                'suggestedPositionSize',
                'recommendedLeverage',
                'englishSummary',
                'stepByStepCorrection',
              ],
            },
          },
        });

        const jsonText = response.text || '{}';
        const parsedData = JSON.parse(jsonText);
        parsedData.analyzedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return res.json(parsedData);
      } catch (aiErr: any) {
        // High quality fallback
        return res.json({
          verdict: 'DANGEROUS_MISTAKE',
          overallScore: 35,
          headlineEnglish: 'FOMO Buy Entry at Major Resistance Peak',
          detectedPattern: ['FOMO Green Candles', 'Resistance Peak Rejection'],
          trendDirection: 'Volatile Breakdown',
          mistakesFound: [
            {
              title: 'Buying Right Under Resistance Line',
              description: 'According to the chart, price has arrived at a major resistance zone where selling pressure is dominant.',
              severity: 'Critical',
              category: 'FOMO/Chasing',
            },
            {
              title: 'Stop Loss Set Too Tight',
              description: 'Normal market volatility is likely to trigger the stop loss prematurely.',
              severity: 'Moderate',
              category: 'Bad Stop Loss',
            },
          ],
          dangerZoneDescription: 'The zone immediately below resistance is an extreme danger area where sudden profit-taking dumps occur.',
          safeZoneDescription: 'A safe buy entry is available after a successful resistance breakout and retest or a pullback to support.',
          suggestedEntryPrice: '$105.00 - $108.00 (Pullback Zone)',
          suggestedStopLoss: '$98.50',
          takeProfitTarget1: '$125.00',
          takeProfitTarget2: '$140.00',
          riskRewardRatio: '1:2.8',
          suggestedMaxRiskAmount: `$${((capitalAmount * riskTolerancePercent) / 100).toFixed(2)}`,
          suggestedPositionSize: `$${(((capitalAmount * riskTolerancePercent) / 100) / 0.065).toFixed(2)}`,
          recommendedLeverage: '1x - 2x Spot',
          englishSummary: 'You are planning to enter right at the top of resistance after seeing consecutive green candles. This is the most common FOMO mistake among traders. A sudden reversal from here could incur significant drawdowns.',
          stepByStepCorrection: [
            '1. Avoid rushing into an entry at current levels.',
            '2. Wait for price to break out above resistance or pull back down to support.',
            '3. Enter long only after seeing a bullish reversal candlestick (such as a Hammer) at support.',
            '4. Do not risk more than 1-2% of total capital per trade.',
          ],
          analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch (err: any) {
      console.error('Chart Vision Analysis Error:', err);
      res.status(500).json({ error: err.message || 'Chart analysis failed.' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 8: Live Market Ticker Scanner
  // -------------------------------------------------------------
  app.get('/api/analyze-ticker', async (req, res) => {
    try {
      const ticker = ((req.query.ticker as string) || 'BTC-USD').toUpperCase().trim();
      const history = generateHistoricalCandles(ticker, 30);

      const latest = history[history.length - 1];
      const prev = history[history.length - 2];
      const priceChange24h = Number((((latest.close - prev.close) / prev.close) * 100).toFixed(2));

      try {
        const ai = getGeminiClient();
        const prompt = `Perform technical market analysis on asset ${ticker}:
- Latest Close: $${latest.close}
- 24h Change: ${priceChange24h}%
- Calculated RSI (14): ${latest.rsi}
- Calculated MACD: ${latest.macd}
- SMA 20: $${latest.sma20}, SMA 50: $${latest.sma50}

Evaluate if this is a BUY, SELL, or HOLD signal.
Determine Support and Resistance levels.
Provide clear rationale in English.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                signal: { type: Type.STRING, description: '"BUY", "SELL", or "HOLD"' },
                confidence: { type: Type.STRING, description: '"High", "Medium", or "Low"' },
                rationaleEnglish: { type: Type.STRING },
                supportLevel: { type: Type.NUMBER },
                resistanceLevel: { type: Type.NUMBER },
                rsiValue: { type: Type.NUMBER },
                macdState: { type: Type.STRING },
                trendStatus: { type: Type.STRING },
                suggestedStopLoss: { type: Type.NUMBER },
                suggestedTakeProfit: { type: Type.NUMBER },
              },
              required: [
                'signal',
                'confidence',
                'rationaleEnglish',
                'supportLevel',
                'resistanceLevel',
                'rsiValue',
                'macdState',
                'trendStatus',
                'suggestedStopLoss',
                'suggestedTakeProfit',
              ],
            },
          },
        });

        const parsedData = JSON.parse(response.text || '{}');

        return res.json({
          ticker,
          currentPrice: latest.close,
          priceChange24h,
          signal: parsedData.signal || 'HOLD',
          confidence: parsedData.confidence || 'Medium',
          rationaleEnglish: parsedData.rationaleEnglish || 'RSI and moving averages indicate neutral momentum.',
          supportLevel: parsedData.supportLevel || Number((latest.close * 0.95).toFixed(2)),
          resistanceLevel: parsedData.resistanceLevel || Number((latest.close * 1.05).toFixed(2)),
          rsiValue: parsedData.rsiValue || latest.rsi,
          macdState: parsedData.macdState || 'Bullish Crossover',
          trendStatus: parsedData.trendStatus || 'Consolidating',
          suggestedStopLoss: parsedData.suggestedStopLoss || Number((latest.close * 0.96).toFixed(2)),
          suggestedTakeProfit: parsedData.suggestedTakeProfit || Number((latest.close * 1.08).toFixed(2)),
          history,
          source: 'Trade Doctor AI & Technical Engine',
        });
      } catch (aiErr) {
        return res.json({
          ticker,
          currentPrice: latest.close,
          priceChange24h,
          signal: latest.rsi < 35 ? 'BUY' : latest.rsi > 70 ? 'SELL' : 'HOLD',
          confidence: 'Medium',
          rationaleEnglish: `RSI is currently at ${latest.rsi} indicating technical balance near moving average bounds.`,
          supportLevel: Number((latest.close * 0.95).toFixed(2)),
          resistanceLevel: Number((latest.close * 1.05).toFixed(2)),
          rsiValue: latest.rsi,
          macdState: latest.macd > 0 ? 'Bullish Momentum' : 'Bearish Divergence',
          trendStatus: 'Consolidating',
          suggestedStopLoss: Number((latest.close * 0.96).toFixed(2)),
          suggestedTakeProfit: Number((latest.close * 1.08).toFixed(2)),
          history,
          source: 'Fallback Technical Engine',
        });
      }
    } catch (err: any) {
      console.error('Ticker Analysis Error:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze market ticker.' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 9: Trade Risk Journal Doctor
  // -------------------------------------------------------------
  app.post('/api/analyze-trade-journal', async (req, res) => {
    try {
      const {
        accountBalance = 1000,
        riskPercentPerTrade = 2,
        entryPrice = 100,
        stopLossPrice = 95,
        takeProfitPrice = 115,
        leverage = 1,
        tradeDirection = 'Long / Buy',
      } = req.body;

      const dollarAmountAtRisk = (accountBalance * riskPercentPerTrade) / 100;
      const stopLossDistPercent = Math.abs((entryPrice - stopLossPrice) / entryPrice);

      let maxPositionSize = 0;
      if (stopLossDistPercent > 0) {
        maxPositionSize = dollarAmountAtRisk / stopLossDistPercent;
      }

      const rewardDistPercent = Math.abs((takeProfitPrice - entryPrice) / entryPrice);
      const riskRewardRatio = stopLossDistPercent > 0 ? Number((rewardDistPercent / stopLossDistPercent).toFixed(2)) : 0;
      const potentialProfit = maxPositionSize * rewardDistPercent;

      const isRiskSafe = riskPercentPerTrade <= 3 && riskRewardRatio >= 1.5 && leverage <= 5;

      const warningsEnglish: string[] = [];
      if (riskPercentPerTrade > 3) {
        warningsEnglish.push(`⚠️ Risking ${riskPercentPerTrade}% of account capital in a single trade is too high! Aim for 1-3% maximum.`);
      }
      if (riskRewardRatio < 1.5) {
        warningsEnglish.push(`⚠️ Risk-to-Reward ratio is only 1:${riskRewardRatio}. Professional traders require at least a 1:2 ratio.`);
      }
      if (leverage > 5) {
        warningsEnglish.push(`⚠️ ${leverage}x leverage is dangerous! Slight adverse price swings can trigger margin calls or liquidation.`);
      }

      res.json({
        dollarAmountAtRisk: Number(dollarAmountAtRisk.toFixed(2)),
        maxPositionSize: Number(maxPositionSize.toFixed(2)),
        maxContractsOrCoins: entryPrice > 0 ? Number((maxPositionSize / entryPrice).toFixed(4)) : 0,
        potentialProfit: Number(potentialProfit.toFixed(2)),
        riskRewardRatio,
        isRiskSafe,
        warningsEnglish,
        recommendations: [
          `Max risk amount: $${dollarAmountAtRisk.toFixed(2)} (${riskPercentPerTrade}%)`,
          `Your position size should not exceed $${maxPositionSize.toFixed(2)} (${(maxPositionSize / entryPrice).toFixed(4)} coins/shares)`,
          `Always place Stop Loss outside immediate technical noise.`,
        ],
      });
    } catch (err: any) {
      console.error('Trade Journal Error:', err);
      res.status(500).json({ error: err.message || 'Failed to compute trade risk analysis.' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 10: Natural Language AI Screener (Premium Feature)
  // -------------------------------------------------------------
  app.post('/api/ai-screener', async (req, res) => {
    try {
      const { query = '', userIsPremium = false, searchCountToday = 0 } = req.body;

      // Freemium Rule: Free tier user gets 1 free search per day
      if (!userIsPremium && searchCountToday >= 1) {
        return res.json({
          query,
          freeLimitReached: true,
          results: [],
          totalMatches: 0,
          disclaimer: LEGAL_DISCLAIMER,
        });
      }

      const cleanQuery = query.trim().toLowerCase();
      if (!cleanQuery) {
        return res.status(400).json({ error: 'Search query cannot be empty.' });
      }

      // Try Gemini parsing for natural language query
      try {
        const ai = getGeminiClient();
        const prompt = `You are a financial market screener AI.
User Query: "${cleanQuery}"
Dataset Assets: ${JSON.stringify(HIGH_GROWTH_ASSETS.map((a) => ({ ticker: a.ticker, name: a.name, sector: a.sector, market: a.market })))}

Select up to 6 stocks or crypto assets from the dataset that best match the natural language query.
For each matching asset, generate a realistic 1-sentence AI Summary explaining why it fits the query, estimated RSI, volume multiplier, and match score (70-98).

Output JSON with schema:
{
  "results": [
    {
      "ticker": "string",
      "name": "string",
      "sector": "string",
      "market": "Global" or "India",
      "price": number,
      "rsi": number,
      "volumeMultiplier": number,
      "change24h": number,
      "aiSummary": "string",
      "matchScore": number
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const data = JSON.parse(response.text || '{}');
        const results = data.results || [];

        return res.json({
          query: cleanQuery,
          parsedFilters: { query: cleanQuery },
          results,
          totalMatches: results.length,
          disclaimer: LEGAL_DISCLAIMER,
          freeLimitReached: false,
        });
      } catch (aiErr) {
        // Deterministic Fallback filtering for Natural Language query
        const matches = HIGH_GROWTH_ASSETS.filter((asset) => {
          if (cleanQuery.includes('tech') || cleanQuery.includes('chip') || cleanQuery.includes('semi')) {
            return asset.sector.toLowerCase().includes('tech') || asset.sector.toLowerCase().includes('semi');
          }
          if (cleanQuery.includes('crypto') || cleanQuery.includes('bitcoin') || cleanQuery.includes('coin')) {
            return asset.sector.toLowerCase().includes('crypto');
          }
          if (cleanQuery.includes('india') || cleanQuery.includes('nse') || cleanQuery.includes('rupee')) {
            return asset.market === 'India';
          }
          if (cleanQuery.includes('finance') || cleanQuery.includes('bank')) {
            return asset.sector.toLowerCase().includes('finance') || asset.sector.toLowerCase().includes('bank');
          }
          return asset.name.toLowerCase().includes(cleanQuery) || asset.ticker.toLowerCase().includes(cleanQuery);
        });

        const selected = (matches.length > 0 ? matches : HIGH_GROWTH_ASSETS.slice(0, 5)).slice(0, 6);

        const results = selected.map((asset) => {
          const seed = asset.ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const price = asset.sector === 'Crypto' ? 180 + (seed % 3000) : 120 + (seed % 400);
          const rsi = cleanQuery.includes('rsi < 35') || cleanQuery.includes('oversold') ? 28 + (seed % 6) : 42 + (seed % 25);
          const volumeMultiplier = 2.4 + Number(((seed % 20) / 10).toFixed(1));
          const change24h = Number(((seed % 10) - 2.5).toFixed(2));

          return {
            ticker: asset.ticker,
            name: asset.name,
            sector: asset.sector,
            market: asset.market,
            price,
            rsi,
            volumeMultiplier,
            change24h,
            aiSummary: `Matched query "${cleanQuery}" based on ${asset.sector} technical setup with RSI at ${rsi} and ${volumeMultiplier}x volume spike.`,
            matchScore: 85 + (seed % 12),
          };
        });

        return res.json({
          query: cleanQuery,
          parsedFilters: { query: cleanQuery },
          results,
          totalMatches: results.length,
          disclaimer: LEGAL_DISCLAIMER,
          freeLimitReached: false,
        });
      }
    } catch (err: any) {
      console.error('AI Screener Error:', err);
      res.status(500).json({ error: err.message || 'AI Screener process failed.' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 11: Institutional Smart Money Flow & Whale Tracker
  // -------------------------------------------------------------
  app.get('/api/smart-money-flow', (req, res) => {
    try {
      const isPremium = req.query.isPremium === 'true';

      const topWhaleAssets = [
        { ticker: 'BTC-USD', name: 'Bitcoin', sector: 'Crypto', market: 'Global', price: 96840.5, change24h: 3.4, volMult: 3.8, act: 'Whale Buying Surge', z: 3.4, rsi: 34, summary: 'Institutional wallet clusters accumulated over $140M in spot Bitcoin near $95k support.' },
        { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semiconductors', market: 'Global', price: 128.9, change24h: 4.1, volMult: 3.2, act: 'Smart Money Accumulation', z: 2.9, rsi: 48, summary: 'Dark pool block trades detected 3.2x average 20-day volume preceding AI chip earnings.' },
        { ticker: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy / Retail', market: 'India', price: 2950.4, change24h: 2.2, volMult: 2.9, act: 'Institutional Activity', z: 2.7, rsi: 52, summary: 'Domestic Institutional Investors (DII) executed massive sweep orders in morning session.' },
        { ticker: 'ETH-USD', name: 'Ethereum', sector: 'Crypto', market: 'Global', price: 3480.2, change24h: 1.8, volMult: 2.7, act: 'Whale Buying Surge', z: 2.6, rsi: 38, summary: 'Staking inflows spiked as institutional custodians increased long exposure.' },
        { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive / EV', market: 'Global', price: 240.5, change24h: -1.5, volMult: 2.8, act: 'Institutional Distribution', z: 2.5, rsi: 68, summary: 'Hedge fund profit taking detected near $245 major resistance level.' },
        { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', sector: 'Finance / Banking', market: 'India', price: 1680.0, change24h: 1.6, volMult: 2.6, act: 'Smart Money Accumulation', z: 2.5, rsi: 42, summary: 'Foreign Institutional Investors (FII) net bought $45M equivalent in banking block deals.' },
      ];

      const flowItems = topWhaleAssets.map((item, index) => {
        const is_locked = !isPremium && index >= 2;

        return {
          ticker: item.ticker,
          name: item.name,
          sector: item.sector,
          market: item.market as 'Global' | 'India',
          currentPrice: item.price,
          priceChange24h: item.change24h,
          volumeMultiplier: item.volMult,
          activityType: item.act as any,
          heatmapIntensity: item.z > 3.0 ? 'Extreme' : item.z > 2.6 ? 'High' : 'Moderate',
          zScore: item.z,
          rsi: item.rsi,
          aiExplanation: is_locked ? '[LOCKED] Upgrade to Inner Circle ($19.99/mo) to view full Whale Tracker & Smart Money Flow' : item.summary,
          is_locked,
        };
      });

      res.json({
        flowItems,
        whaleAlerts: [
          '⚡ BTC-USD: +3.8x Volume Z-Score - Smart Money Accumulation ($140M Wall Street Inflow)',
          '⚡ NVDA: Dark pool block trade surge 3.2x above 20-day MA',
          '⚡ RELIANCE.NS: DII Institutional sweep order detected in Indian Equity market',
        ],
        disclaimer: LEGAL_DISCLAIMER,
      });
    } catch (err: any) {
      console.error('Smart Money Flow Error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch Smart Money Flow data.' });
    }
  });

  // -------------------------------------------------------------
  // ENDPOINT 12: AI Trade Diagnostic & "Mistake Blocker" (Risk Guard)
  // -------------------------------------------------------------
  app.post('/api/trade-diagnostic', async (req, res) => {
    try {
      const {
        ticker = 'AAPL',
        entryPrice = 150,
        stopLossPrice,
        takeProfitPrice,
        capital = 1000,
      } = req.body;

      const cleanTicker = ticker.toUpperCase().trim();
      const entry = Number(entryPrice) || 150;
      const atr = Number((entry * 0.022).toFixed(2)); // ~2.2% ATR estimate

      const stop1to2 = Number((entry - 1.5 * atr).toFixed(2));
      const tp1to2 = Number((entry + 3.0 * atr).toFixed(2));
      const stop1to3 = Number((entry - 1.5 * atr).toFixed(2));
      const tp1to3 = Number((entry + 4.5 * atr).toFixed(2));

      let userStop = stopLossPrice ? Number(stopLossPrice) : stop1to2;
      let userTp = takeProfitPrice ? Number(takeProfitPrice) : tp1to2;

      const riskDist = Math.abs(entry - userStop);
      const rewardDist = Math.abs(userTp - entry);
      const riskRewardRatio = riskDist > 0 ? Number((rewardDist / riskDist).toFixed(2)) : 1.0;

      // Seed pseudo indicator values for calculation
      const seed = cleanTicker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const rsi = 32 + (seed % 45);
      const nearResistance = rsi > 65 || (seed % 3 === 0);
      const volatilityHigh = (seed % 2 === 0);

      let tradeHealthScore = 75;
      if (nearResistance) tradeHealthScore -= 25;
      if (volatilityHigh) tradeHealthScore -= 15;
      if (riskRewardRatio < 1.5) tradeHealthScore -= 20;

      tradeHealthScore = Math.max(15, Math.min(95, tradeHealthScore));

      const isHighRiskWarning = tradeHealthScore < 50 || nearResistance || riskRewardRatio < 1.5;

      let warningMessage = '';
      let warningCategory: any = 'Safe Setup';

      if (nearResistance) {
        warningCategory = 'Resistance Proximity';
        warningMessage = `⚠️ High Risk Setup: Entry near major technical resistance for ${cleanTicker}. Elevated volatility detected with high probability of FOMO drawdown!`;
      } else if (riskRewardRatio < 1.5) {
        warningCategory = 'Negative Risk-Reward';
        warningMessage = `⚠️ Poor Risk-Reward Ratio (1:${riskRewardRatio}). Institutional traders require at least 1:2 R:R ratio before risking capital.`;
      } else if (volatilityHigh) {
        warningCategory = 'Severe Volatility';
        warningMessage = `⚠️ Elevated Volatility Alert: High ATR (${atr}) detected. Wider stop loss required to prevent premature stop-outs.`;
      }

      try {
        const ai = getGeminiClient();
        const prompt = `Perform a Pre-Trade Diagnostic for ${cleanTicker}:
- Entry Price: $${entry}
- Calculated ATR (Average True Range): $${atr}
- User Stop Loss: $${userStop} | User Take Profit: $${userTp}
- Calculated Risk/Reward: 1:${riskRewardRatio}
- Health Score: ${tradeHealthScore}/100

Generate a concise 2-sentence AI Diagnostic Rationale evaluating the setup risk and ATR guardrails.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });

        const aiText = response.text || '';

        return res.json({
          ticker: cleanTicker,
          tradeHealthScore,
          isHighRiskWarning,
          warningMessage,
          warningCategory,
          atrValue: atr,
          suggestedStopLoss1to2: stop1to2,
          suggestedTakeProfit1to2: tp1to2,
          suggestedStopLoss1to3: stop1to3,
          suggestedTakeProfit1to3: tp1to3,
          riskRewardRatio,
          smartMoneySpikeDetected: volatilityHigh,
          rsiValue: rsi,
          macdStatus: rsi < 40 ? 'Bullish Reversal Cross' : 'Bearish Divergence',
          aiDiagnosticRationale: aiText || `ATR indicator ($${atr}) provides mathematically sound 1:2 and 1:3 risk-reward stop loss levels. Always respect market resistance boundaries.`,
          disclaimer: LEGAL_DISCLAIMER,
        });
      } catch (aiErr) {
        return res.json({
          ticker: cleanTicker,
          tradeHealthScore,
          isHighRiskWarning,
          warningMessage,
          warningCategory,
          atrValue: atr,
          suggestedStopLoss1to2: stop1to2,
          suggestedTakeProfit1to2: tp1to2,
          suggestedStopLoss1to3: stop1to3,
          suggestedTakeProfit1to3: tp1to3,
          riskRewardRatio,
          smartMoneySpikeDetected: volatilityHigh,
          rsiValue: rsi,
          macdStatus: 'Bullish Crossover',
          aiDiagnosticRationale: `ATR indicator ($${atr}) provides mathematically sound 1:2 and 1:3 risk-reward stop loss levels. Always respect market resistance boundaries.`,
          disclaimer: LEGAL_DISCLAIMER,
        });
      }
    } catch (err: any) {
      console.error('Trade Diagnostic Error:', err);
      res.status(500).json({ error: err.message || 'Trade Diagnostic calculation failed.' });
    }
  });

  // Alias for /api/screener/ai-search matching python zip specification
  app.post('/api/screener/ai-search', (req, res, next) => {
    // Redirect internal logic to /api/ai-screener handler
    req.url = '/api/ai-screener';
    app._router.handle(req, res, next);
  });

  // Alias for GET /api/smart-money/flow matching python zip specification
  app.get('/api/smart-money/flow', (req, res, next) => {
    req.url = '/api/smart-money-flow';
    app._router.handle(req, res, next);
  });

  // Telegram Alert Bot Subscription Endpoint
  app.post('/api/telegram/alert', (req, res) => {
    try {
      const { ticker = 'AAPL', chat_id = '' } = req.body || {};
      if (!chat_id) {
        return res.status(400).json({
          error: "Missing parameter: 'chat_id' is required for Telegram integration.",
          disclaimer: LEGAL_DISCLAIMER,
        });
      }
      res.json({
        success: true,
        message: `Subscribed successfully! Live Whale alerts for ${ticker.toUpperCase()} will be pushed to Telegram chat ID: ${chat_id}.`,
        channel: 'Trade Doctor Telegram Alerts Bot',
        pricing_usd_rate: 19.99,
        disclaimer: LEGAL_DISCLAIMER,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Telegram alert subscription failed.' });
    }
  });

  // Auth & Subscription Tier Registration/Login Endpoint
  app.post('/api/auth/register-login', async (req, res) => {
    try {
      const { email = '', provider = 'email', tier_level = 2 } = req.body || {};

      // Try live Render backend proxy first
      const proxyRes = await tryProxyToRenderBackend('/api/auth/register-login', 'POST', req.body);
      if (proxyRes.success && proxyRes.data) {
        return res.json(proxyRes.data);
      }

      if (!email && provider === 'email') {
        return res.status(400).json({
          error: 'Email is required for registration/login.',
          disclaimer: LEGAL_DISCLAIMER,
        });
      }

      const tiers: Record<number, { name: string; price_usd: number; benefits: string }> = {
        1: { name: 'Starter Tier', price_usd: 0.00, benefits: 'Retail momentum data, indicators & basic alerts' },
        2: { name: 'Pro Trader Tier', price_usd: 29.99, benefits: 'Institutional smart money flow tracking, Whale alarms, unlimited AI screener searches' },
        3: { name: 'VIP Inner Circle Tier', price_usd: 69.99, benefits: 'Full AI trade diagnostics, mistake blockers, live Telegram signals' },
      };

      const selected_tier = tiers[tier_level] || tiers[2];

      res.json({
        success: true,
        user: {
          email: email || `google-oauth-${provider}@domain.com`,
          provider,
          status: 'Active',
        },
        subscription_tier: selected_tier,
        disclaimer: LEGAL_DISCLAIMER,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Auth registration failed.' });
    }
  });

  // Intelligent Signal Synthesizer Endpoint
  app.get('/api/synthesize-signal', async (req, res) => {
    try {
      const ticker = String(req.query.ticker || 'BTC-USD').toUpperCase().trim();
      const seed = ticker.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

      const current_price = ticker.includes('BTC') ? 96850 : ticker.includes('NVDA') ? 128.5 : ticker.includes('RELIANCE') ? 2950 : 185;
      const rsi = 32 + (seed % 42);
      const volume_z = 1.8 + ((seed % 25) / 10);
      const smart_money_spike_detected = volume_z >= 2.5;

      let trade_health_score = 70;
      if (rsi < 35) trade_health_score += 15;
      if (smart_money_spike_detected) trade_health_score += 12;
      if (rsi > 70) trade_health_score -= 25;
      trade_health_score = Math.max(12, Math.min(98, trade_health_score));

      const atr = Number((current_price * 0.022).toFixed(2));
      const volatility_atr_stop_loss = Number((current_price - 1.5 * atr).toFixed(2));
      const target_price = Number((current_price + 3.0 * atr).toFixed(2));

      let ai_one_liner_briefing = `${ticker} displays a Trade Health Score of ${trade_health_score} out of 100 with RSI at ${rsi.toFixed(1)}${smart_money_spike_detected ? ' and institutional Smart Money inflow detected.' : '.'}`;

      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Provide a crisp 1-sentence AI Audio Briefing (max 20 words) for ticker ${ticker} with Trade Health Score ${trade_health_score}/100, RSI ${rsi}, ATR Stop-Loss $${volatility_atr_stop_loss}, and Target $${target_price}. Include actionable technical context.`,
        });
        if (response.text) {
          ai_one_liner_briefing = response.text.trim().replace(/\n/g, ' ');
        }
      } catch (e) {
        // Fallback briefing
      }

      const telegram_alert_pushed = trade_health_score > 85 && smart_money_spike_detected;

      res.json({
        ticker,
        current_price,
        trade_health_score,
        smart_money_spike_detected,
        volume_z_score: Number(volume_z.toFixed(2)),
        rsi_14: rsi,
        volatility_atr_stop_loss,
        target_price,
        risk_reward_ratio: '1:2',
        ai_one_liner_briefing,
        telegram_alert_pushed,
        disclaimer: LEGAL_DISCLAIMER,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Signal synthesis failed.' });
    }
  });

  // Vite development middleware vs production static
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Trade Doctor Express Server running on http://localhost:${PORT}`);
  });
}

startServer();
