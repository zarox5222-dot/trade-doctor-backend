import React, { useState, useEffect } from 'react';
import { Activity, Flame, Filter, Zap, Lock, Crown, ArrowUpRight, ArrowDownRight, Globe, Building2, Sparkles, RefreshCw } from 'lucide-react';

interface MatrixItem {
  ticker: string;
  name: string;
  sector: string;
  market: 'Global' | 'India';
  currentPrice: number;
  priceChange24h: number;
  volumeMultiplier: number;
  activityType: string;
  heatmapIntensity: 'Extreme' | 'High' | 'Moderate';
  zScore: number;
  rsi: number;
  aiExplanation: string;
  is_locked?: boolean;
}

interface SmartMoneyMatrixGridProps {
  subscriptionTier?: 'free' | 'pro';
  onOpenUpgradeModal?: (reason?: string) => void;
}

export const SmartMoneyMatrixGrid: React.FC<SmartMoneyMatrixGridProps> = ({
  subscriptionTier = 'free',
  onOpenUpgradeModal,
}) => {
  const isVip = subscriptionTier === 'pro';

  const [items, setItems] = useState<MatrixItem[]>([]);
  const [whaleAlerts, setWhaleAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'Global' | 'India'>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const fetchFlowData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/smart-money/flow?subscription_role=${isVip ? 'VIP' : 'Free'}`);
      const json = await res.json();
      if (json.heatmap) {
        // Map backend heatmap parameters to frontend MatrixItem keys
        const mapped = json.heatmap.map((item: any) => ({
          ticker: item.ticker,
          name: item.name,
          sector: item.sector || 'SaaS Assets',
          market: item.market || 'Global',
          currentPrice: item.price_change_pct ? 150.0 + item.price_change_pct : 150.0,
          priceChange24h: item.price_change_pct || 0.0,
          volumeMultiplier: item.volume_z_score || 1.2,
          activityType: item.label || 'Accumulation',
          heatmapIntensity: item.volume_z_score >= 2.5 ? 'Extreme' : 'Moderate',
          zScore: item.volume_z_score || 1.2,
          rsi: 45,
          aiExplanation: item.label || 'Stable price flow.',
          is_locked: item.label === '[LOCKED]'
        }));
        setItems(mapped);
      }
      if (json.whale_alerts) {
        const msgs = json.whale_alerts.map((alert: any) => alert.message);
        setWhaleAlerts(msgs);
      }
    } catch (err) {
      console.error('Failed to load matrix flow data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlowData();
  }, [subscriptionTier]);

  const filteredItems = items.filter((item) => {
    if (selectedRegion !== 'all' && item.market !== selectedRegion) return false;
    if (selectedSector !== 'all' && !item.sector.toLowerCase().includes(selectedSector)) return false;
    return true;
  });

  const getGlowStyle = (intensity: string, volume: number) => {
    if (volume >= 3.2) {
      return 'border-cyan-400 bg-slate-950/90 shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse';
    }
    if (volume >= 2.5) {
      return 'border-emerald-400 bg-slate-950/90 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
    }
    return 'border-slate-800 bg-slate-950/80 hover:border-cyan-500/50';
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-slate-950/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-bounce" /> Live Fluid Matrix Heat-Grid
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Institutional Smart Money & Whale Heat-Grid
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-2xl">
              Visual real-time fluid grid highlighting dark pool volume surges (&ge; 2.5x Z-Score) across Wall Street, Crypto, and Indian NSE Equities.
            </p>
          </div>

          <button
            onClick={fetchFlowData}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Refresh Matrix Stream
          </button>
        </div>
      </div>

      {/* Whale Alert Ticker Stream */}
      {whaleAlerts.length > 0 && (
        <div className="bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-4 overflow-x-auto shadow-inner">
          <div className="flex items-center gap-4 text-xs font-mono whitespace-nowrap">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 flex items-center gap-1 shrink-0">
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" /> WHALE STREAM
            </span>
            <div className="flex items-center gap-6 text-slate-300">
              {whaleAlerts.map((alertText, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <span>{alertText}</span>
                  {idx < whaleAlerts.length - 1 && <span className="text-slate-600">•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Matrix Controls / Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter Matrix:
          </div>

          {/* Region selector */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            {(['all', 'Global', 'India'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedRegion === r
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Markets' : r === 'Global' ? '🌐 Global' : '🇮🇳 India NSE'}
              </button>
            ))}
          </div>

          {/* Sector selector */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-900 text-slate-300 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="all">All Sectors</option>
            <option value="tech">Tech & IT</option>
            <option value="crypto">Crypto Assets</option>
            <option value="semi">Semiconductors</option>
            <option value="finance">Finance & Banking</option>
            <option value="energy">Energy & Retail</option>
          </select>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-cyan-400 font-bold">{filteredItems.length}</span> Smart Money Nodes
        </div>
      </div>

      {/* Fluid Matrix Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-slate-950 border border-slate-800 animate-pulse p-6" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isSpike = item.volumeMultiplier >= 2.5;

            return (
              <div
                key={item.ticker}
                className={`relative overflow-hidden rounded-3xl border p-6 space-y-4 transition-all duration-300 backdrop-blur-xl ${getGlowStyle(
                  item.heatmapIntensity,
                  item.volumeMultiplier
                )}`}
              >
                {/* Top Title Line */}
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-white text-lg">{item.ticker}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                        {item.market}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium truncate max-w-[180px]">{item.name}</p>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white block">${item.currentPrice.toLocaleString()}</span>
                    <span className={`text-xs font-bold flex items-center justify-end gap-0.5 ${item.priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.priceChange24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {item.priceChange24h}%
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Volume Surge</span>
                    <span className={`text-sm font-bold ${isSpike ? 'text-amber-400 font-black' : 'text-slate-200'}`}>
                      {item.volumeMultiplier}x MA {isSpike && '⚡'}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">RSI Index</span>
                    <span className="text-sm font-bold text-cyan-300">{item.rsi}</span>
                  </div>
                </div>

                {/* Status / Explanation */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Institutional Activity
                  </span>

                  {!item.is_locked ? (
                    <p className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 leading-relaxed font-medium">
                      {item.aiExplanation}
                    </p>
                  ) : (
                    /* Locked Paywall Blur Overlay */
                    <div className="relative py-2 space-y-2">
                      <p className="text-xs text-slate-500 blur-xs select-none">
                        Institutional dark pool flow detected. Upgrade to view full breakdown.
                      </p>

                      <button
                        onClick={() => {
                          if (onOpenUpgradeModal) {
                            onOpenUpgradeModal('🔒 Premium Feature: Dark Pool Smart Money Flow Matrix requires complete premium access ($19.99/mo).');
                          }
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-400 text-slate-950 font-mono font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" /> Unlock Smart Money Detail ($19.99/mo)
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
