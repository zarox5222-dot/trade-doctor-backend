import React, { useState, useEffect } from 'react';
import { SmartMoneyFlowItem } from '../types';
import { Activity, Lock, Crown, Zap, Flame, BarChart3, TrendingUp, TrendingDown, Eye, AlertCircle } from 'lucide-react';

interface SmartMoneyTrackerProps {
  isPremium: boolean;
  onOpenUpgradeModal: () => void;
}

export const SmartMoneyTracker: React.FC<SmartMoneyTrackerProps> = ({
  isPremium,
  onOpenUpgradeModal,
}) => {
  const [flowItems, setFlowItems] = useState<SmartMoneyFlowItem[]>([]);
  const [whaleAlerts, setWhaleAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSmartMoneyData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/smart-money-flow?isPremium=${isPremium}`);
      const data = await res.json();
      if (data.flowItems) {
        setFlowItems(data.flowItems);
      }
      if (data.whaleAlerts) {
        setWhaleAlerts(data.whaleAlerts);
      }
    } catch (err) {
      console.error('Failed to fetch Smart Money Flow:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartMoneyData();
  }, [isPremium]);

  const getIntensityBadge = (intensity: string) => {
    switch (intensity) {
      case 'Extreme':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Whale Activity Ticker Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md text-white">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs shrink-0 uppercase tracking-wider pr-3 border-r border-slate-800">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Whale Activity Alerts</span>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            {whaleAlerts.map((alert, idx) => (
              <span key={idx} className="text-xs font-mono text-slate-200 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 shrink-0">
                {alert}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feature Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Institutional Smart Money Flow
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Track Dark Pool Blocks & Volume Z-Score Spikes
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
              Detect assets experiencing 2.5x+ Volume Spikes above their 20-day Moving Average. Pinpoint institutional accumulation before retail momentum breakouts.
            </p>
          </div>

          {!isPremium && (
            <button
              onClick={onOpenUpgradeModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              Unlock Full Heatmap ($19.99/mo)
            </button>
          )}
        </div>
      </div>

      {/* Smart Money Heatmap Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            Institutional Smart Money Heatmap
          </h3>
          <span className="text-xs text-slate-500 font-bold">Volume Threshold: ≥ 2.5x 20-Day Moving Average</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flowItems.map((item, idx) => {
            const isLocked = item.is_locked;

            return (
              <div
                key={idx}
                className={`relative bg-white border rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all ${
                  isLocked ? 'border-slate-200' : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-lg">{item.ticker}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {item.market}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{item.name}</p>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getIntensityBadge(item.heatmapIntensity)}`}>
                    {item.zScore}x Z-Score
                  </span>
                </div>

                {/* Heatmap Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Price</span>
                    <span className="text-xs font-bold text-slate-900">${item.currentPrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">24h Impact</span>
                    <span className={`text-xs font-bold ${item.priceChange24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.priceChange24h >= 0 ? '+' : ''}{item.priceChange24h}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Volume Spike</span>
                    <span className="text-xs font-bold text-amber-700">{item.volumeMultiplier}x MA</span>
                  </div>
                </div>

                {/* Institutional Activity Tag */}
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 w-full justify-center">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <span>{item.activityType}</span>
                </div>

                {/* AI Explanation / Blurred Overlay */}
                <div className="relative">
                  <p className={`text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-medium ${isLocked ? 'blur-sm select-none' : ''}`}>
                    🐋 <span className="font-bold text-slate-900">Whale Activity:</span> {item.aiExplanation}
                  </p>

                  {/* Locked Paywall Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-amber-300 text-center space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span>Locked with Inner Circle ($19.99/mo)</span>
                      </div>
                      <button
                        onClick={onOpenUpgradeModal}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm"
                      >
                        Unlock Whale Signal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
