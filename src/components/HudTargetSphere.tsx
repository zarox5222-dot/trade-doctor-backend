import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, Lock, ShieldAlert, Zap, Radio, ChevronRight, Activity, Send, CheckCircle2 } from 'lucide-react';

interface HudTargetSphereProps {
  ticker?: string;
  subscriptionTier?: 'free' | 'pro' | 'vip';
  onOpenUpgradeModal?: (reason?: string) => void;
}

export const HudTargetSphere: React.FC<HudTargetSphereProps> = ({
  ticker = 'BTC-USD',
  subscriptionTier = 'free',
  onOpenUpgradeModal,
}) => {
  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'vip';
  const isVip = subscriptionTier === 'vip';

  const [selectedTicker, setSelectedTicker] = useState<string>(ticker);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [telegramChatId, setTelegramChatId] = useState<string>('');
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  const fetchSignal = async (sym: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/synthesize-signal?ticker=${encodeURIComponent(sym)}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Failed to fetch synthesized signal', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignal(selectedTicker);
  }, [selectedTicker]);

  const handleSpeakBriefing = () => {
    if (!isVip) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal('🔒 VIP Feature: 1-Click AI Voice Market Briefings & Audio Waves require VIP Inner Circle ($69.99/mo).');
      }
      return;
    }

    if (!data?.ai_one_liner_briefing) return;

    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(data.ai_one_liner_briefing);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert(data.ai_one_liner_briefing);
    }
  };

  const handleSendTelegramTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVip) {
      if (onOpenUpgradeModal) {
        onOpenUpgradeModal('🔒 VIP Feature: Real-time Telegram Bot Push Alerts on Whale Spikes require VIP Inner Circle ($69.99/mo).');
      }
      return;
    }

    if (!telegramChatId.trim()) return;
    try {
      const res = await fetch('/api/telegram/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: selectedTicker, chat_id: telegramChatId.trim() }),
      });
      const resJson = await res.json();
      setTelegramStatus(resJson.message || 'Telegram alert test sent!');
    } catch (err) {
      setTelegramStatus('Telegram integration request failed.');
    }
  };

  const score = data?.trade_health_score || 78;
  const glowColor = score > 75 ? 'cyan' : score > 50 ? 'emerald' : 'rose';

  return (
    <div className="space-y-6">

      {/* HUD Header Bar */}
      <div className="relative bg-slate-950/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> AI HUD Command Center
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              3D AI Target Sphere & Signal Synthesizer
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Real-time multi-indicator neural synthesis, ATR stop-loss guardrails & Audio Briefings
            </p>
          </div>

          {/* Ticker Quick Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {['BTC-USD', 'NVDA', 'RELIANCE.NS', 'ETH-USD', 'AAPL', 'TSLA'].map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedTicker(sym)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedTicker === sym
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                    : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main HUD Centerpiece: 3D AI Target Sphere & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left / Center 3D Target Sphere (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center relative shadow-[0_0_40px_rgba(6,182,212,0.12)] min-h-[420px] overflow-hidden">

          {/* Animated 3D Target Reticle BG */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-80 h-80 rounded-full border border-dashed border-cyan-400 animate-[spin_20s_linear_infinite]" />
            <div className="w-64 h-64 rounded-full border border-cyan-500 animate-[spin_12s_linear_infinite_reverse]" />
            <div className="w-48 h-48 rounded-full border border-dashed border-emerald-400 animate-[spin_8s_linear_infinite]" />
          </div>

          {/* Glowing 3D Target Sphere Core */}
          <div className="relative z-10 flex flex-col items-center my-6">
            <div className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center transition-all duration-700 ${
              score >= 75
                ? 'bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-slate-950 border-2 border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.5)]'
                : score >= 50
                ? 'bg-gradient-to-br from-emerald-500/20 via-amber-500/20 to-slate-950 border-2 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.4)]'
                : 'bg-gradient-to-br from-rose-500/20 via-amber-500/20 to-slate-950 border-2 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.4)]'
            }`}>

              {/* Outer Pulsing Aura Ring */}
              <div className="absolute -inset-3 rounded-full border border-cyan-500/30 animate-ping opacity-30" />

              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> {selectedTicker}
              </span>

              <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tighter">
                {loading ? '...' : score}
              </div>

              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">
                Trade Health Score (0-100)
              </span>

              <div className={`mt-3 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border ${
                score >= 75
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : score >= 50
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
              }`}>
                {score >= 75 ? '⚡ HIGH PROBABILITY BUY SETUP' : score >= 50 ? '⚖️ NEUTRAL CONSOLIDATION' : '⚠️ HIGH RISK / OVERBOUGHT'}
              </div>
            </div>
          </div>

          {/* Audio Briefing Waveform Trigger */}
          <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">
                1-Click AI Audio Briefing
              </span>
              <p className="text-xs text-slate-300 font-medium line-clamp-1">
                {data?.ai_one_liner_briefing || 'Synthesizing voice briefing statement...'}
              </p>
            </div>

            <button
              onClick={handleSpeakBriefing}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isSpeaking
                  ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" /> Stop Voice
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" /> Listen Briefing
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Metric Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">

          {/* Real-time Indicator Snapshot */}
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> Neural Technical Snapshot
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-400">${data?.current_price || '---'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">RSI (14 Index)</span>
                <span className="text-base font-bold text-cyan-300">{data?.rsi_14 ? data.rsi_14.toFixed(1) : '38.5'}</span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Volume Z-Score</span>
                <span className={`text-base font-bold ${data?.smart_money_spike_detected ? 'text-amber-400' : 'text-slate-300'}`}>
                  {data?.volume_z_score || '2.4'}x {data?.smart_money_spike_detected && '⚡'}
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">ATR Stop Loss (1:2)</span>
                <span className="text-base font-bold text-rose-400">${data?.volatility_atr_stop_loss || '---'}</span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Take Profit Target</span>
                <span className="text-base font-bold text-emerald-400">${data?.target_price || '---'}</span>
              </div>
            </div>
          </div>

          {/* Telegram Alert Webhook Test Box */}
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <Send className="w-4 h-4 text-cyan-400" /> Telegram Bot Alert Webhook
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Receive live push alerts on Telegram when {selectedTicker} achieves Trade Health Score &gt; 85.
            </p>

            <form onSubmit={handleSendTelegramTest} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Telegram Chat ID (e.g., 12345678)"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
              >
                Connect Bot
              </button>
            </form>

            {telegramStatus && (
              <p className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/60">
                ✅ {telegramStatus}
              </p>
            )}
          </div>

        </div>

      </div>

      {/* High-Converting "Beast" Paywall Hook Below 3D Score */}
      <div className="relative overflow-hidden bg-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.15)] space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> Institutional Inner Circle Layer
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Whale Money Flow & Real-time Telegram Push Signals
            </h3>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 self-start sm:self-auto">
            {isVip ? 'VIP Active Member' : isPro ? 'VIP Upgrade Required ($69.99/mo)' : '$69.99 / Month'}
          </span>
        </div>

        {/* Locked / Blurred Grid Section */}
        <div className="relative py-4">

          {/* Content display depending on VIP status */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isVip ? 'opacity-100' : 'blur-md select-none opacity-40 pointer-events-none'}`}>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300">Whale Dark Pool Inflow</span>
              <div className="text-lg font-bold text-emerald-400">+$142,500,000 USD</div>
              <p className="text-[10px] text-slate-400">Wall Street institutional block trades detected at 09:32 AM.</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300">Exact Entry & Take-Profit Targets</span>
              <div className="text-lg font-bold text-cyan-400">Entry: $184.20 | TP: $198.50</div>
              <p className="text-[10px] text-slate-400">ATR 1:3 risk reward ratio calculated with moving avg alignment.</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300">Instant Telegram Whale Signals</span>
              <div className="text-lg font-bold text-amber-400">Active Telegram Bot Push</div>
              <p className="text-[10px] text-slate-400">Real-time alerts directly to mobile phone for volume spikes.</p>
            </div>
          </div>

          {/* High-Converting Overlay Box when not VIP */}
          {!isVip && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl text-center space-y-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 inline-flex">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-1 max-w-md">
                <h4 className="text-base sm:text-lg font-black text-white">
                  {isPro ? 'Pro Active — Upgrade to VIP to Unlock Dark Pool Flow & Telegram Alerts' : 'Unlock Institutional Entry Points & Live Telegram Whale Alerts'}
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  {isPro
                    ? 'Your Pro Plan ($29.99) includes strategy canvas & screener. Upgrade to VIP ($69.99) for dark pool flow & Telegram alerts.'
                    : 'Gain instant access to dark pool money flow, exact entry/exit levels, and live Telegram push alerts.'}
                </p>
              </div>

              <button
                onClick={() => {
                  if (onOpenUpgradeModal) {
                    onOpenUpgradeModal('🔒 VIP Feature: Instant Telegram Alerts & Smart Money Flow require VIP Inner Circle ($69.99/mo).');
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-mono font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
              >
                🔒 Unlock VIP Inner Circle ($69.99/mo) <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mandatory Legal Compliance Banner */}
      <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl text-center text-[11px] font-mono text-slate-400 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-400" /> Mandatory Educational Compliance Notice
        </div>
        <p className="max-w-3xl mx-auto leading-relaxed">
          All metrics, visual HUD indicators, and AI scores are generated for educational and analytics purposes only. Not financial advice. Past technical performance is not indicative of future market outcomes.
        </p>
      </div>

    </div>
  );
};
