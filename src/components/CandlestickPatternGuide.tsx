import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PatternItem {
  id: string;
  nameEnglish: string;
  category: 'Reversal' | 'Continuation' | 'Chart Formation';
  type: 'Bullish' | 'Bearish' | 'Neutral';
  descriptionEnglish: string;
  keyConfirmationEnglish: string;
  commonMistakeEnglish: string;
}

const PATTERNS: PatternItem[] = [
  {
    id: 'bullish_engulfing',
    nameEnglish: 'Bullish Engulfing',
    category: 'Reversal',
    type: 'Bullish',
    descriptionEnglish: 'A small red candlestick is completely engulfed by a large subsequent green candlestick. Signals a powerful bullish trend reversal or buyer surge at the end of a downtrend.',
    keyConfirmationEnglish: 'Must form at a major key support level or demand zone. Expanding volume on the green candle is essential.',
    commonMistakeEnglish: 'Buying an engulfing candle at resistance. Engulfing patterns are only valid at key support or demand levels.',
  },
  {
    id: 'bearish_engulfing',
    nameEnglish: 'Bearish Engulfing',
    category: 'Reversal',
    type: 'Bearish',
    descriptionEnglish: 'A small green candlestick is completely swallowed or engulfed by a large subsequent red candlestick. Indicates strong seller control following an uptrend.',
    keyConfirmationEnglish: 'Must form at major overhead resistance or a proven supply zone.',
    commonMistakeEnglish: 'Shorting a bearish engulfing pattern at the bottom of an extended downtrend, risking a sudden short squeeze.',
  },
  {
    id: 'hammer_candlestick',
    nameEnglish: 'Hammer Candlestick',
    category: 'Reversal',
    type: 'Bullish',
    descriptionEnglish: 'Features a small body with a long lower wick/shadow (at least 2x the body length). Shows that sellers pushed prices down, but buyers surged back to close near the high.',
    keyConfirmationEnglish: 'The next candlestick must be green and close above the hammer candle high.',
    commonMistakeEnglish: 'Entering prematurely without waiting for the confirmation candle to close.',
  },
  {
    id: 'shooting_star',
    nameEnglish: 'Shooting Star',
    category: 'Reversal',
    type: 'Bearish',
    descriptionEnglish: 'Features a small body with a long upper wick/shadow. Forms at the peak of an uptrend, signaling strong price rejection and potential bearish reversal.',
    keyConfirmationEnglish: 'The following candlestick must be a solid bearish red candle.',
    commonMistakeEnglish: 'Trading this pattern in the middle of a range; it is only effective at top key resistance levels.',
  },
  {
    id: 'head_shoulders',
    nameEnglish: 'Head & Shoulders Formation',
    category: 'Chart Formation',
    type: 'Bearish',
    descriptionEnglish: 'Consists of three peaks where the middle peak (Head) is the highest and the side peaks (Shoulders) are lower and roughly equal. A breakdown below the neckline indicates a major downtrend.',
    keyConfirmationEnglish: 'High-volume breakdown below the Neckline support level or successful retest of the broken neckline.',
    commonMistakeEnglish: 'Holding long buy positions before the neckline breakdown is confirmed.',
  },
  {
    id: 'double_bottom',
    nameEnglish: 'Double Bottom (W Pattern)',
    category: 'Chart Formation',
    type: 'Bullish',
    descriptionEnglish: 'Prices touch the same support level twice, creating a "W" shaped pattern. A classic bullish trend reversal structure.',
    keyConfirmationEnglish: 'Wait for a confirmed breakout above the middle peak (neckline resistance).',
    commonMistakeEnglish: 'Jumping into a buy immediately on the second touch without breakout confirmation.',
  },
];

export const CandlestickPatternGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Bullish' | 'Bearish'>('All');

  const filteredPatterns = PATTERNS.filter((p) => {
    const matchesSearch = p.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || p.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Candlestick & Technical Pattern Dictionary
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Master chart patterns, confirm technical entries, and avoid common trader mistakes.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {(['All', 'Bullish', 'Bearish'] as const).map((flt) => (
              <button
                key={flt}
                onClick={() => setSelectedFilter(flt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  selectedFilter === flt
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {flt === 'All' ? 'All' : flt === 'Bullish' ? '🟢 Bullish' : '🔴 Bearish'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search pattern (e.g. Engulfing, Hammer, Head and Shoulders)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium shadow-inner"
          />
        </div>
      </div>

      {/* Pattern Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPatterns.map((pattern) => (
          <div key={pattern.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">{pattern.nameEnglish}</h3>
                <span className="text-[11px] text-slate-500 font-mono font-bold">{pattern.category}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                pattern.type === 'Bullish'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {pattern.type}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {pattern.descriptionEnglish}
            </p>

            <div className="space-y-2 text-xs">
              <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-800 block mb-0.5">Key Confirmation:</span>
                  <span className="text-slate-700 font-medium">{pattern.keyConfirmationEnglish}</span>
                </div>
              </div>

              <div className="bg-rose-50/80 border border-rose-200 p-3 rounded-2xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-800 block mb-0.5">Most Common Mistake:</span>
                  <span className="text-slate-700 font-medium">{pattern.commonMistakeEnglish}</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Top Trading Rules Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Golden Rules for Trading Success
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-emerald-700 block">1. Always Use Stop Losses</span>
            <p className="text-slate-600 leading-relaxed font-medium">
              A stop loss is your trading insurance. Unexpected bad news or volatility can cause sharp price drops on any technical setup.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-amber-800 block">2. Avoid FOMO Buying</span>
            <p className="text-slate-600 leading-relaxed font-medium">
              Never chase after 4–5 consecutive green candles. Wait for price to pull back to key support before initiating positions.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-cyan-700 block">3. Prevent Revenge Trading</span>
            <p className="text-slate-600 leading-relaxed font-medium">
              If a trade hits your stop loss, take a break. Never over-leverage to quickly recover losses—stay disciplined.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
