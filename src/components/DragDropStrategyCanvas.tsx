import React, { useState } from 'react';
import { Layers, Play, Plus, Trash2, Zap, ArrowRight, CheckCircle2, Radio, Sparkles, Sliders } from 'lucide-react';

interface StrategyBlock {
  id: string;
  type: 'ticker' | 'condition' | 'action';
  title: string;
  detail: string;
  badgeColor: string;
}

export const DragDropStrategyCanvas: React.FC = () => {
  const [tickerBlock, setTickerBlock] = useState<string>('BTC-USD');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([
    'RSI < 35 (Oversold Zone)',
    'Smart Money Inflow (> 2.5x Vol)',
  ]);
  const [selectedActions, setSelectedActions] = useState<string[]>([
    'Generate AI Trade Health Score',
    'Calculate ATR 1:2 Stop Loss',
  ]);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const AVAILABLE_TICKERS = ['BTC-USD', 'NVDA', 'RELIANCE.NS', 'ETH-USD', 'AAPL', 'TSLA'];

  const AVAILABLE_CONDITIONS = [
    'RSI < 35 (Oversold Zone)',
    'Smart Money Inflow (> 2.5x Vol)',
    'MACD Bullish Reversal Cross',
    'ATR Volatility Expansion',
    'Near Support Level',
  ];

  const AVAILABLE_ACTIONS = [
    'Generate AI Trade Health Score',
    'Calculate ATR 1:2 Stop Loss',
    'Push Telegram Channel Alert',
    'Synthesize Voice Briefing',
  ];

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      if (selectedConditions.length > 1) {
        setSelectedConditions(selectedConditions.filter((c) => c !== cond));
      }
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const toggleAction = (act: string) => {
    if (selectedActions.includes(act)) {
      if (selectedActions.length > 1) {
        setSelectedActions(selectedActions.filter((a) => a !== act));
      }
    } else {
      setSelectedActions([...selectedActions, act]);
    }
  };

  const handleExecuteStrategy = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const res = await fetch(`/api/synthesize-signal?ticker=${encodeURIComponent(tickerBlock)}`);
      const json = await res.json();
      setExecutionResult(json);
    } catch (e) {
      console.error('Failed to execute strategy canvas', e);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-slate-950/90 border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Interactive Strategy Canvas
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Visual Trade Condition & Execution Pipeline
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Construct visual algorithmic trade setups by connecting tickers, technical indicator filters, and automated execution actions.
            </p>
          </div>

          <button
            onClick={handleExecuteStrategy}
            disabled={isExecuting}
            className="self-start md:self-auto px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isExecuting ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950" />
            )}
            Run Strategy Engine
          </button>
        </div>
      </div>

      {/* Block Selector Trays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Tray 1: Ticker Target */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
            1. Target Ticker Block
          </span>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_TICKERS.map((t) => (
              <button
                key={t}
                onClick={() => setTickerBlock(t)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  tickerBlock === t
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tray 2: Technical Condition Blocks */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-3">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
            2. Technical Conditions
          </span>
          <div className="space-y-2">
            {AVAILABLE_CONDITIONS.map((cond) => {
              const active = selectedConditions.includes(cond);
              return (
                <button
                  key={cond}
                  onClick={() => toggleCondition(cond)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-between border ${
                    active
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-xs'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{cond}</span>
                  {active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tray 3: Action Execution Blocks */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-3">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
            3. Automated Actions
          </span>
          <div className="space-y-2">
            {AVAILABLE_ACTIONS.map((act) => {
              const active = selectedActions.includes(act);
              return (
                <button
                  key={act}
                  onClick={() => toggleAction(act)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-between border ${
                    active
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-xs'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{act}</span>
                  {active && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Visual Flow Canvas Pipeline */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Active Visual Pipeline Canvas
          </h3>
          <span className="text-xs font-mono text-slate-400">Flow Order: Left &rarr; Right</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 py-4 overflow-x-auto">
          {/* Ticker Block */}
          <div className="bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 px-4 py-3 rounded-2xl font-mono text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
            <span className="text-[10px] text-cyan-400 block uppercase font-bold">TARGET TICKER</span>
            {tickerBlock}
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          {/* Condition Blocks */}
          {selectedConditions.map((cond, idx) => (
            <React.Fragment key={cond}>
              <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 px-4 py-3 rounded-2xl font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
                <span className="text-[10px] text-emerald-400 block uppercase font-bold">CONDITION #{idx + 1}</span>
                {cond}
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
            </React.Fragment>
          ))}

          {/* Action Blocks */}
          {selectedActions.map((act, idx) => (
            <React.Fragment key={act}>
              <div className="bg-amber-950/90 border border-amber-500/60 text-amber-300 px-4 py-3 rounded-2xl font-mono text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
                <span className="text-[10px] text-amber-400 block uppercase font-bold">ACTION #{idx + 1}</span>
                {act}
              </div>
              {idx < selectedActions.length - 1 && <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Execution Results */}
      {executionResult && (
        <div className="bg-slate-950/90 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.2)] animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" /> Pipeline Execution Result: {executionResult.ticker}
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              ⚡ Live Signal Synthesized
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Trade Health Score</span>
              <div className="text-xl font-bold text-cyan-300 mt-1">{executionResult.trade_health_score}/100</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Smart Money Spike</span>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {executionResult.smart_money_spike_detected ? 'DETECTED ⚡' : 'Normal Vol'}
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">ATR Stop-Loss</span>
              <div className="text-xl font-bold text-rose-400 mt-1">${executionResult.volatility_atr_stop_loss}</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Price (1:2)</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">${executionResult.target_price}</div>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs font-mono">
            <span className="text-cyan-400 font-bold block uppercase">AI Synthesis Briefing:</span>
            <p className="text-slate-300 font-medium">{executionResult.ai_one_liner_briefing}</p>
          </div>
        </div>
      )}

    </div>
  );
};
