import React, { useState, useEffect } from 'react';
import { MarketCategory, Timeframe, ChartVisionAnalysis } from '../types';
import { PresetChart } from '../data/presetCharts';
import {
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Target,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  Printer,
  Info,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
} from 'lucide-react';

interface CandlestickVisionDoctorProps {
  selectedPreset?: PresetChart | null;
}

const MARKET_CATEGORIES: MarketCategory[] = [
  'Crypto',
  'US Stocks',
  'Forex',
  'Indian / Asian Equity',
  'Futures & Commodities',
];

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

// Classic World Candlestick Patterns Catalogue with SVG Diagrams
interface CandlestickPatternReference {
  id: string;
  name: string;
  category: 'Bullish Reversal' | 'Bearish Reversal' | 'Continuation' | 'Neutral';
  reliability: string;
  winRatePct: number;
  description: string;
  keyRule: string;
  svgDiagram: React.ReactNode;
}

const WORLD_CANDLESTICK_PATTERNS: CandlestickPatternReference[] = [
  {
    id: 'hammer-pinbar',
    name: 'Hammer / Bullish Pinbar',
    category: 'Bullish Reversal',
    reliability: 'High Probability',
    winRatePct: 78,
    description: 'A long lower wick rejection (at least 2x body height) occurring at a key support zone, indicating strong buyer intervention.',
    keyRule: 'Enter above high of Hammer candle with Stop Loss placed below the lower wick tail.',
    svgDiagram: (
      <svg className="w-full h-24 bg-slate-950 rounded-xl p-2" viewBox="0 0 100 60">
        <line x1="30" y1="10" x2="30" y2="45" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="25" y="15" width="10" height="20" fill="#ef4444" rx="1" />
        {/* Hammer Candle */}
        <line x1="70" y1="12" x2="70" y2="52" stroke="#22c55e" strokeWidth="1.5" />
        <rect x="65" y="15" width="10" height="10" fill="#22c55e" rx="1" />
        {/* Entry Line */}
        <line x1="60" y1="10" x2="85" y2="10" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2" />
      </svg>
    ),
  },
  {
    id: 'bullish-engulfing',
    name: 'Bullish Engulfing Pattern',
    category: 'Bullish Reversal',
    reliability: 'Very High',
    winRatePct: 82,
    description: 'A large green body candle completely engulfs the real body of the preceding red candle after a downtrend.',
    keyRule: 'Volume on the green candle must exceed average volume. Stop loss below lowest low of pattern.',
    svgDiagram: (
      <svg className="w-full h-24 bg-slate-950 rounded-xl p-2" viewBox="0 0 100 60">
        {/* Small Red Candle */}
        <line x1="35" y1="20" x2="35" y2="45" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="30" y="25" width="10" height="15" fill="#ef4444" rx="1" />
        {/* Big Green Engulfing Candle */}
        <line x1="65" y1="10" x2="65" y2="52" stroke="#22c55e" strokeWidth="1.5" />
        <rect x="58" y="14" width="14" height="34" fill="#22c55e" rx="1" />
      </svg>
    ),
  },
  {
    id: 'morning-star',
    name: 'Morning Star Pattern',
    category: 'Bullish Reversal',
    reliability: 'High Probability',
    winRatePct: 76,
    description: 'A 3-candle reversal pattern: large red candle, gapping small Doji/Spinning Top, followed by a strong green candle closing above 50% of 1st candle.',
    keyRule: 'Third candle confirmation confirms major trend change.',
    svgDiagram: (
      <svg className="w-full h-24 bg-slate-950 rounded-xl p-2" viewBox="0 0 100 60">
        <rect x="20" y="10" width="10" height="30" fill="#ef4444" />
        <rect x="45" y="42" width="8" height="6" fill="#f59e0b" />
        <rect x="68" y="15" width="10" height="30" fill="#22c55e" />
      </svg>
    ),
  },
  {
    id: 'shooting-star',
    name: 'Shooting Star / Bearish Pinbar',
    category: 'Bearish Reversal',
    reliability: 'High Probability',
    winRatePct: 75,
    description: 'A long upper shadow rejection occurring at resistance, demonstrating heavy selling pressure pushing prices back down.',
    keyRule: 'Enter short below body with Stop Loss placed above upper wick extreme.',
    svgDiagram: (
      <svg className="w-full h-24 bg-slate-950 rounded-xl p-2" viewBox="0 0 100 60">
        <line x1="30" y1="15" x2="30" y2="50" stroke="#22c55e" strokeWidth="1.5" />
        <rect x="25" y="25" width="10" height="20" fill="#22c55e" rx="1" />
        {/* Shooting Star */}
        <line x1="70" y1="8" x2="70" y2="48" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="65" y="36" width="10" height="10" fill="#ef4444" rx="1" />
      </svg>
    ),
  },
  {
    id: 'head-shoulders',
    name: 'Head & Shoulders Reversal',
    category: 'Bearish Reversal',
    reliability: 'Very High',
    winRatePct: 84,
    description: 'Classic chart structure with Left Shoulder, Head peak, Right Shoulder, and Neckline support breakdown.',
    keyRule: 'Neckline breakdown with volume expansion triggers full short target.',
    svgDiagram: (
      <svg className="w-full h-24 bg-slate-950 rounded-xl p-2" viewBox="0 0 100 60">
        <path d="M 10 45 L 28 25 L 42 45 L 55 10 L 68 45 L 82 28 L 95 45" fill="none" stroke="#06b6d4" strokeWidth="2" />
        <line x1="10" y1="45" x2="95" y2="45" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2" />
      </svg>
    ),
  },
  {
    id: 'double-bottom',
    name: 'Double Bottom (W Pattern)',
    category: 'Bullish Reversal',
    reliability: 'Very High',
    winRatePct: 81,
    description: 'Price tests the same support level twice without breaching, creating a W-shaped bullish reversal baseline.',
    keyRule: 'Breakout above the central peak (neckline) confirms entry target.',
    svgDiagram: (
      <svg className="w-full h-24 bg-slate-950 rounded-xl p-2" viewBox="0 0 100 60">
        <path d="M 10 15 L 30 48 L 50 25 L 70 48 L 90 15" fill="none" stroke="#22c55e" strokeWidth="2" />
        <line x1="10" y1="25" x2="90" y2="25" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2" />
      </svg>
    ),
  },
  {
    id: 'cup-handle',
    name: 'Cup & Handle Breakout',
    category: 'Continuation',
    reliability: 'High Probability',
    winRatePct: 79,
    description: 'A rounded consolidation bowl followed by a small downward handle drift before a strong upward breakout.',
    keyRule: 'Volume surges on the rim breakout.',
    svgDiagram: (
      <svg className="w-full h-24 bg-slate-950 rounded-xl p-2" viewBox="0 0 100 60">
        <path d="M 15 20 Q 40 55 65 20 Q 72 32 80 22 L 92 10" fill="none" stroke="#22c55e" strokeWidth="2" />
        <line x1="15" y1="20" x2="80" y2="20" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="2" />
      </svg>
    ),
  },
  {
    id: 'falling-wedge',
    name: 'Falling Wedge Pattern',
    category: 'Bullish Reversal',
    reliability: 'High Probability',
    winRatePct: 77,
    description: 'Price consolidates within converging downwards trendlines. Sellers lose momentum before an explosive upside breakout.',
    keyRule: 'Upside trendline breach signals strong buy momentum.',
    svgDiagram: (
      <svg className="w-full h-24 bg-slate-950 rounded-xl p-2" viewBox="0 0 100 60">
        <line x1="15" y1="10" x2="80" y2="40" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="15" y1="30" x2="80" y2="48" stroke="#f59e0b" strokeWidth="1.5" />
        <path d="M 20 12 L 35 32 L 50 22 L 65 42 L 85 15" fill="none" stroke="#22c55e" strokeWidth="2" />
      </svg>
    ),
  },
];

export const CandlestickVisionDoctor: React.FC<CandlestickVisionDoctorProps> = ({ selectedPreset }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [marketCategory, setMarketCategory] = useState<MarketCategory>('Crypto');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [userTradePlan, setUserTradePlan] = useState('');
  const [capitalAmount, setCapitalAmount] = useState<number>(1000);
  const [riskTolerancePercent, setRiskTolerancePercent] = useState<number>(2);

  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ChartVisionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load preset if provided
  useEffect(() => {
    if (selectedPreset) {
      setImagePreview(selectedPreset.svgPlaceholder);
      setImageMimeType('image/svg+xml');
      setMarketCategory(selectedPreset.marketCategory);
      setTimeframe(selectedPreset.timeframe);
      setUserTradePlan(selectedPreset.userPlan);
      setAnalysis(null);
      setError(null);
    }
  }, [selectedPreset]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be less than 15MB.');
      return;
    }

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setError(null);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setError('Please upload a screenshot/photo of your trading chart or select a sample preset.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-chart-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          imageMimeType,
          marketCategory,
          timeframe,
          userTradePlan,
          capitalAmount,
          riskTolerancePercent,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Unable to complete chart analysis.');
      }

      const data: ChartVisionAnalysis = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with Gemini AI Server.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'DANGEROUS_MISTAKE':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          textEnglish: '❌ Critical Trading Mistake Detected',
          icon: ShieldAlert,
        };
      case 'HIGH_RISK_WARNING':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          textEnglish: '⚠️ High Risk Trade Location',
          icon: AlertTriangle,
        };
      case 'VALID_SETUP_BUY':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          textEnglish: '✅ Valid Technical Buy Setup',
          icon: CheckCircle2,
        };
      case 'VALID_SETUP_SELL':
        return {
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          textEnglish: '📉 Valid Technical Sell / Short Setup',
          icon: TrendingUp,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          textEnglish: '⏸️ Wait / Neutral Consolidation Zone',
          icon: Info,
        };
    }
  };

  const handleCopyAnalysis = () => {
    if (!analysis) return;
    const text = `AI TRADE DOCTOR DIAGNOSIS REPORT
----------------------------------
VERDICT: ${analysis.headlineEnglish}
SAFETY SCORE: ${analysis.overallScore}/100
TREND: ${analysis.trendDirection}

MISTAKES IDENTIFIED:
${analysis.mistakesFound.map((m) => `- [${m.category}] ${m.title}: ${m.description}`).join('\n')}

DANGER ZONE: ${analysis.dangerZoneDescription}
SAFE ENTRY ZONE: ${analysis.safeZoneDescription}

SUGGESTED TRADE LEVELS:
- Entry Price: ${analysis.suggestedEntryPrice}
- Stop Loss: ${analysis.suggestedStopLoss}
- Take Profit 1: ${analysis.takeProfitTarget1}
- Take Profit 2: ${analysis.takeProfitTarget2}
- Risk-Reward Ratio: ${analysis.riskRewardRatio}

POSITION SIZING:
- Max Capital at Risk: ${analysis.suggestedMaxRiskAmount}
- Recommended Position Size: ${analysis.suggestedPositionSize}
- Recommended Leverage: ${analysis.recommendedLeverage}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">

      {/* Upload Form Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden">

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              Photo Chart Upload & Gemini Multimodal Diagnosis
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Upload a screenshot or photo of your chart from TradingView, Binance, MT4/MT5 or any exchange for instant pattern feedback.
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left Box: Image Upload & Preview */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chart Photo / Screenshot *
              </label>

              <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center transition-all bg-slate-50/80 min-h-[260px] flex flex-col items-center justify-center group overflow-hidden">
                {imagePreview ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Uploaded Candlestick Chart"
                      className="max-h-[220px] w-auto object-contain rounded-xl shadow-sm border border-slate-200"
                    />
                    <label
                      htmlFor="chart-upload-change"
                      className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 cursor-pointer font-bold underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Change / Upload Another Chart Photo
                    </label>
                  </div>
                ) : (
                  <label htmlFor="chart-upload" className="cursor-pointer space-y-3 p-6 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">Drag & Drop Chart Image Here, or Click to Upload</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP or Screenshot (Max 15MB)</p>
                    </div>
                  </label>
                )}

                <input
                  id="chart-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  id="chart-upload-change"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Right Box: Context Input & Risk Rules */}
            <div className="space-y-4">

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Market Type
                  </label>
                  <select
                    value={marketCategory}
                    onChange={(e) => setMarketCategory(e.target.value as MarketCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                  >
                    {MARKET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Timeframe
                  </label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                  >
                    {TIMEFRAMES.map((tf) => (
                      <option key={tf} value={tf}>
                        {tf} Chart
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Account Capital ($)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={capitalAmount}
                    onChange={(e) => setCapitalAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Risk Per Trade (% Target)
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={100}
                    step={0.5}
                    value={riskTolerancePercent}
                    onChange={(e) => setRiskTolerancePercent(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex justify-between">
                  <span>Your Trade Idea / Entry Plan (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. "Looking to buy breakout at $180"</span>
                </label>
                <textarea
                  rows={3}
                  value={userTradePlan}
                  onChange={(e) => setUserTradePlan(e.target.value)}
                  placeholder="e.g. Saw 3 large green candles and want to enter long. Where should my Stop Loss be?"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                />
              </div>

            </div>

          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={isLoading || !imagePreview}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isLoading || !imagePreview
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-98'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gemini Multimodal AI Analyzing Chart Photo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>Analyze Chart Photo with Gemini AI</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* Diagnosis Results Display */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* Verdict Banner Header */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">

              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {(() => {
                    const badge = getVerdictBadge(analysis.verdict);
                    const IconComp = badge.icon;
                    return (
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${badge.bg} flex items-center gap-1.5 shadow-xs`}>
                        <IconComp className="w-4 h-4" /> {badge.textEnglish}
                      </span>
                    );
                  })()}

                  <span className="text-xs text-slate-600 font-mono bg-slate-100 border border-slate-200 px-3 py-1 rounded-full font-bold">
                    Trend: {analysis.trendDirection}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {analysis.headlineEnglish}
                </h2>
              </div>

              {/* Health Score Gauge */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 self-start md:self-auto shrink-0 min-w-[210px]">
                <div className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center font-mono font-black text-2xl ${
                  analysis.overallScore >= 75
                    ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                    : analysis.overallScore >= 50
                    ? 'text-amber-800 border-amber-300 bg-amber-50'
                    : 'text-rose-700 border-rose-300 bg-rose-50'
                }`}>
                  {analysis.overallScore}
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Score</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trade Health Score</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">
                    {analysis.overallScore >= 75 ? 'Safe Setup' : analysis.overallScore >= 50 ? 'Caution Required' : 'High Risk Mistake'}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-1">
                    AI Doctor Ver. 3.6
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Action bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Multimodal Pattern & Risk Analysis Report</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAnalysis}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-bold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Report Copied!' : 'Copy Report'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Export PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Diagnostic Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left Box: Mistakes & Detected Patterns */}
            <div className="space-y-6">

              {/* Identified Trading Mistakes */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-600" /> Identified Entry Mistakes & Risks ({analysis.mistakesFound.length})
                </h3>

                <div className="space-y-3">
                  {analysis.mistakesFound.map((mistake, idx) => (
                    <div key={idx} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          mistake.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {mistake.severity} Risk
                        </span>
                        <span className="text-[10px] text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded font-mono font-bold">
                          {mistake.category}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {mistake.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {mistake.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Candlestick Patterns */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-600" /> Patterns Detected in Your Photo
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedPattern.map((pat, pIdx) => (
                    <span key={pIdx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-3 py-1.5 rounded-xl font-bold">
                      🔍 {pat}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Box: Zones & Calculated Target Levels */}
            <div className="space-y-6">

              {/* Danger Zone vs Safe Zone */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Target className="w-4.5 h-4.5 text-amber-500" /> Danger Zone vs Safe Entry Zone
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-2xl space-y-1">
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                      ⚠️ Danger Zone (Avoid Entering Here):
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {analysis.dangerZoneDescription}
                    </p>
                  </div>

                  <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl space-y-1">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      🛡️ Safe Entry Zone (High Probability Target):
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {analysis.safeZoneDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Exact Suggested Price Levels */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <DollarSign className="w-4.5 h-4.5 text-emerald-600" /> Suggested Technical Price Levels
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Suggested Entry</span>
                    <span className="text-sm font-mono font-bold text-emerald-700">{analysis.suggestedEntryPrice}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Stop Loss Guardrail</span>
                    <span className="text-sm font-mono font-bold text-rose-600">{analysis.suggestedStopLoss}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Target 1 (TP 1)</span>
                    <span className="text-sm font-mono font-bold text-teal-700">{analysis.takeProfitTarget1}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Target 2 (TP 2)</span>
                    <span className="text-sm font-mono font-bold text-cyan-700">{analysis.takeProfitTarget2}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 font-sans font-bold">Risk-Reward Ratio:</span>
                  <span className="text-emerald-700 font-extrabold">{analysis.riskRewardRatio}</span>
                </div>
              </div>

              {/* Recommended Position Size & Amount */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                  <DollarSign className="w-4.5 h-4.5 text-amber-500" /> Capital Sizing & Risk Allocation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] font-bold">Max Capital at Risk</span>
                    <span className="font-bold text-slate-900 font-mono">{analysis.suggestedMaxRiskAmount}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] font-bold">Recommended Position</span>
                    <span className="font-bold text-emerald-700 font-mono">{analysis.suggestedPositionSize}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px] font-bold">Safe Leverage</span>
                    <span className="font-bold text-amber-700 font-mono">{analysis.recommendedLeverage}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Actionable Step-by-Step Guidance */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Comprehensive AI Trade Doctor Diagnosis & Actionable Plan
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200 font-medium">
                {analysis.bengaliSummary || analysis.headlineEnglish}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
                Step-by-Step Trade Correction Steps:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.stepByStepCorrection.map((step, sIdx) => (
                  <div key={sIdx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-[11px] shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* World Classic Candlestick Patterns Visual Reference Library */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> World Classic Candlestick Pattern Catalog
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Suggested World Candlestick Patterns & Visual Diagrams
            </h3>
            <p className="text-xs text-slate-400 font-medium max-w-2xl">
              Compare your chart photo against every recognized classic candlestick pattern in technical analysis literature.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3.5 py-2 rounded-2xl shrink-0">
            📚 8 World Literature Patterns Loaded
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORLD_CANDLESTICK_PATTERNS.map((pattern) => (
            <div
              key={pattern.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Pattern Diagram */}
                {pattern.svgDiagram}

                {/* Pattern Header */}
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      pattern.category.includes('Bullish')
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : pattern.category.includes('Bearish')
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {pattern.category}
                    </span>
                    <span className="text-[9px] font-mono text-amber-400 font-bold">
                      {pattern.winRatePct}% Win Rate
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{pattern.name}</h4>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {pattern.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-300">
                <span className="text-slate-500 uppercase font-bold block">Key Trade Rule:</span>
                <span className="line-clamp-2">{pattern.keyRule}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
