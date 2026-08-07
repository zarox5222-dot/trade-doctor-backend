import React, { useState } from 'react';
import { Search, Mic, MicOff, Sparkles, Zap, Lock, Filter, ShieldAlert, ArrowRight, Activity, Crown } from 'lucide-react';
import { AiScreenerMatch, AiScreenerResponse } from '../types';

interface AiScreenerProps {
  subscriptionTier?: 'free' | 'pro' | 'vip';
  freeSearchCount: number;
  onIncrementSearchCount: () => void;
  onOpenUpgradeModal: (reason?: string) => void;
}

const PRESET_PROMPTS = [
  'Show me tech stocks with RSI < 35 and unusual volume',
  'Find stocks with bullish momentum today',
  'High growth crypto with bullish RSI',
  'Indian NSE stocks near support levels',
  'Semiconductor stocks breaking resistance',
];

export const AiScreener: React.FC<AiScreenerProps> = ({
  subscriptionTier = 'free',
  freeSearchCount,
  onIncrementSearchCount,
  onOpenUpgradeModal,
}) => {
  const isProOrVip = subscriptionTier === 'pro' || subscriptionTier === 'vip';

  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screenerData, setScreenerData] = useState<AiScreenerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your search.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        executeSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Freemium Check
    if (!isProOrVip && freeSearchCount >= 1) {
      onOpenUpgradeModal('🔒 Pro Trader ($29.99/mo) or VIP ($69.99/mo) required for Unlimited AI Screener Searches.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai-screener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          userIsPremium: isProOrVip,
          searchCountToday: freeSearchCount,
        }),
      });

      const data: AiScreenerResponse = await res.json();

      if (data.freeLimitReached && !isProOrVip) {
        onOpenUpgradeModal('🔒 Pro Trader ($29.99/mo) required for Unlimited AI Searches.');
      } else {
        setScreenerData(data);
        if (!isProOrVip) {
          onIncrementSearchCount();
        }
      }
    } catch (err: any) {
      setError(err.message || 'AI Screener request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Natural Language AI Screener
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Search Markets in Plain English or Voice
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
              Describe the setup you want (RSI threshold, volume multipliers, sector) and Gemini AI will scan our 55+ asset universe in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isProOrVip && (
              <div className="text-right">
                <span className="text-xs text-amber-600 font-bold block">Free Tier Usage</span>
                <span className="text-xs text-slate-500 font-mono">{freeSearchCount}/1 Free Daily AI Search</span>
              </div>
            )}
            <button
              onClick={() => onOpenUpgradeModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              {isProOrVip ? 'Pro/VIP Plan Active' : 'Upgrade ($29.99/mo)'}
            </button>
          </div>
        </div>

        {/* Intelligent Search Input */}
        <form onSubmit={handleSubmit} className="mt-6 relative z-10">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "Show me tech stocks with RSI < 35 and unusual volume"'
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm sm:text-base pl-12 pr-28 py-4 rounded-2xl border border-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner font-medium"
            />

            <div className="absolute right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceSearch}
                title="Voice Search"
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {loading ? <Activity className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>
        </form>

        {/* Example Prompt Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 relative z-10">
          <span className="text-xs text-slate-500 font-bold mr-1">Sample Prompts:</span>
          {PRESET_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(prompt);
                executeSearch(prompt);
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer flex items-center gap-1 font-medium"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Free Limit Reached Warning Banner */}
      {!isProOrVip && freeSearchCount >= 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Free Daily Search Limit Reached (1/1)</p>
              <p className="text-xs text-amber-800">Upgrade to Pro ($29.99/mo) or VIP ($69.99/mo) for unlimited AI Natural Language Searches.</p>
            </div>
          </div>

          <button
            onClick={() => onOpenUpgradeModal()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            Unlock Unlimited Searches
          </button>
        </div>
      )}

      {/* Results Display Grid */}
      {screenerData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              AI Matching Results ({screenerData.totalMatches})
            </h3>
            <span className="text-xs text-slate-500 font-mono font-bold">Query: "{screenerData.query}"</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenerData.results.map((match, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-base">{match.ticker}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {match.market}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate font-medium">{match.name}</p>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {match.matchScore}% Match
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Price</span>
                    <span className="text-xs font-bold text-slate-900">${match.price}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">RSI (14)</span>
                    <span className={`text-xs font-bold ${match.rsi < 35 ? 'text-emerald-600' : match.rsi > 65 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {match.rsi}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Volume</span>
                    <span className="text-xs font-bold text-amber-700">{match.volumeMultiplier}x MA</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                  💡 <span className="font-bold text-slate-900">AI Summary:</span> {match.aiSummary}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl text-center text-[11px] text-slate-500 font-medium">
            ⚖️ {screenerData.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
