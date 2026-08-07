import React, { useState, useEffect, useCallback } from 'react';
import { TickerAnalysisResult } from '../types';
import {
  LineChart as LineChartIcon,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const POPULAR_TICKERS = [
  { symbol: 'BTC-USD', name: 'Bitcoin / USD' },
  { symbol: 'ETH-USD', name: 'Ethereum / USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corp' },
  { symbol: 'AAPL', name: 'Apple Inc' },
  { symbol: 'TSLA', name: 'Tesla Inc' },
  { symbol: 'GOLD', name: 'Gold / USD Spot' },
];

export const MarketScanner: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState('BTC-USD');
  const [customTicker, setCustomTicker] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TickerAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTickerAnalysis = useCallback(async (tickerToFetch: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/analyze-ticker?ticker=${encodeURIComponent(tickerToFetch)}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'টিকার তথ্য অ্যানালাইসিস ব্যর্থ হয়েছে।');
      }

      const data: TickerAnalysisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'নেটওয়ার্ক ত্রুটি।');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickerAnalysis(selectedTicker);
  }, [selectedTicker, fetchTickerAnalysis]);

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTicker.trim()) return;
    const clean = customTicker.trim().toUpperCase();
    setSelectedTicker(clean);
  };

  const getSignalBadgeClass = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SELL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">

      {/* Search Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-emerald-600" />
              টেকনিক্যাল মার্কেট ইন্ডিকেটর স্ক্যানার
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              RSI, MACD, Moving Average এবং Gemini AI রিয়েল-টাইম মার্কেট সিগন্যাল
            </p>
          </div>

          {/* Quick Ticker Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {POPULAR_TICKERS.map((item) => (
              <button
                key={item.symbol}
                onClick={() => {
                  setSelectedTicker(item.symbol);
                  setCustomTicker('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTicker === item.symbol
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {item.symbol}
              </button>
            ))}
          </div>

        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="অন্য যেকোনো সিম্বল লিখুন (যেমন: SOL-USD, AMZN, MSFT, NIFTY50)"
              value={customTicker}
              onChange={(e) => setCustomTicker(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !customTicker.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            স্ক্যান করুন
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-600 font-bold">
            {selectedTicker} এর রিয়েল-টাইম চার্ট ও টেকনিক্যাল ইন্ডিকেটর ডাটা লোড হচ্ছে...
          </p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold">
          ⚠️ {error}
        </div>
      )}

      {!isLoading && result && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* Top Metric Header */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-900">{result.ticker}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSignalBadgeClass(result.signal)} flex items-center gap-1`}>
                    <Sparkles className="w-3.5 h-3.5" /> AI SIGNAL: {result.signal} ({result.confidence} Confidence)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-xl font-mono font-bold text-emerald-700">${result.currentPrice.toLocaleString()}</span>
                  <span className={`font-mono font-bold flex items-center gap-0.5 ${result.priceChange24h >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {result.priceChange24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {result.priceChange24h}%
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <button
                onClick={() => fetchTickerAnalysis(result.ticker)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>রিফ্রেশ ডাটা</span>
              </button>

            </div>

            {/* Indicator Mini Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">RSI (14) Index</span>
                <div className="text-sm font-mono font-bold text-teal-700 mt-0.5">{result.rsiValue}</div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {result.rsiValue > 70 ? 'Overbought (>70)' : result.rsiValue < 30 ? 'Oversold (<30)' : 'Neutral (30-70)'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">MACD Momentum</span>
                <div className="text-sm font-bold text-cyan-700 mt-0.5">{result.macdState}</div>
                <span className="text-[10px] text-slate-500 font-medium">Moving Avg Divergence</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">সাপোর্ট লেভেল</span>
                <div className="text-sm font-mono font-bold text-emerald-700 mt-0.5">${result.supportLevel}</div>
                <span className="text-[10px] text-slate-500 font-medium">Key Demand Zone</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">রেজিস্ট্যান্স লেভেল</span>
                <div className="text-sm font-mono font-bold text-rose-600 mt-0.5">${result.resistanceLevel}</div>
                <span className="text-[10px] text-slate-500 font-medium">Key Supply Zone</span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Chart */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-emerald-600" />
                মূল্য ও ভলিউম ট্রেন্ড চার্ট (Price & Volume Trend)
              </h3>
              <span className="text-[11px] text-slate-500 font-mono font-bold">30-Day Historical Data</span>
            </div>

            <div className="h-[320px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={result.history}>
                  <defs>
                    <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="price" orientation="right" stroke="#059669" fontSize={10} domain={['auto', 'auto']} />
                  <YAxis yAxisId="volume" orientation="left" stroke="#94a3b8" fontSize={9} hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '11px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar yAxisId="volume" dataKey="volume" fill="#cbd5e1" opacity={0.6} />
                  <Area yAxisId="price" type="monotone" dataKey="close" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClose)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gemini AI Rationale Box */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Zap className="w-5 h-5 text-emerald-600" />
              Gemini 3.6 AI ট্রেড লজিক ও বাংলা ব্যাখ্যা
            </h3>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {result.rationaleBengali}
              </p>
              <div className="text-xs text-slate-500 font-mono pt-2 border-t border-slate-200">
                English Summary: {result.rationaleEnglish}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-bold">প্রস্তাবিত স্টপ লস (Stop Loss):</span>
                <span className="font-mono font-bold text-rose-600">${result.suggestedStopLoss}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-bold">প্রস্তাবিত টেক প্রফিট (Take Profit):</span>
                <span className="font-mono font-bold text-emerald-700">${result.suggestedTakeProfit}</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
