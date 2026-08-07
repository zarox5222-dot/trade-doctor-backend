import React, { useState, useEffect } from 'react';
import { TradeDiagnosticResult } from '../types';
import { ShieldAlert, ShieldCheck, Activity, AlertTriangle, Sparkles, Zap, ArrowRight, Info, CheckCircle2, RefreshCw } from 'lucide-react';

interface PreTradeDiagnosticProps {
  initialTicker?: string;
  initialEntryPrice?: number;
}

export const PreTradeDiagnostic: React.FC<PreTradeDiagnosticProps> = ({
  initialTicker = 'BTC-USD',
  initialEntryPrice = 96500,
}) => {
  const [ticker, setTicker] = useState(initialTicker);
  const [entryPrice, setEntryPrice] = useState(initialEntryPrice);
  const [userStopLoss, setUserStopLoss] = useState<string>('');
  const [userTakeProfit, setUserTakeProfit] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState<TradeDiagnosticResult | null>(null);

  const fetchDiagnostic = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trade-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.toUpperCase().trim(),
          entryPrice: Number(entryPrice) || 100,
          stopLossPrice: userStopLoss ? Number(userStopLoss) : undefined,
          takeProfitPrice: userTakeProfit ? Number(userTakeProfit) : undefined,
        }),
      });

      const data: TradeDiagnosticResult = await res.json();
      setDiagnostic(data);
    } catch (err) {
      console.error('Failed to run trade diagnostic:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostic();
  }, [ticker]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" /> AI Pre-Trade Diagnostic & Mistake Blocker
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Trade Setup Health & ATR Risk Guardrails
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Validate entry safety, calculate ATR stop-losses, and detect FOMO resistance traps before placing trades.
          </p>
        </div>

        <button
          onClick={fetchDiagnostic}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto border border-slate-200 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-Run Diagnostic</span>
        </button>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
            Ticker Symbol
          </label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="e.g. BTC-USD, NVDA"
            className="w-full bg-white text-slate-900 font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 shadow-inner font-bold"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
            Entry Price ($USD)
          </label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            className="w-full bg-white text-slate-900 font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 shadow-inner font-bold"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
            Planned Stop Loss ($)
          </label>
          <input
            type="number"
            value={userStopLoss}
            onChange={(e) => setUserStopLoss(e.target.value)}
            placeholder="Optional"
            className="w-full bg-white text-slate-900 font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 shadow-inner font-bold"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
            Planned Take Profit ($)
          </label>
          <input
            type="number"
            value={userTakeProfit}
            onChange={(e) => setUserTakeProfit(e.target.value)}
            placeholder="Optional"
            className="w-full bg-white text-slate-900 font-mono text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 shadow-inner font-bold"
          />
        </div>
      </div>

      {/* MISTAKE BLOCKER BANNER (High Visibility Warning) */}
      {diagnostic && diagnostic.isHighRiskWarning && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 space-y-2 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-800 block">
                MISTAKE BLOCKER ACTIVE • {diagnostic.warningCategory}
              </span>
              <p className="text-sm font-black text-rose-950 leading-snug">
                {diagnostic.warningMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Safe Setup Banner */}
      {diagnostic && !diagnostic.isHighRiskWarning && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-emerald-800 block uppercase">Low Risk Setup Validated</span>
            <p className="text-xs text-emerald-900 font-medium">
              Entry location is supported by technical indicators with favorable risk-reward boundaries.
            </p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {diagnostic && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Trade Health Score Gauge */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Trade Health Score</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="text-center py-2">
              <span className={`text-4xl font-black px-4 py-2 rounded-2xl border ${getScoreColor(diagnostic.tradeHealthScore)}`}>
                {diagnostic.tradeHealthScore} / 100
              </span>
              <p className="text-xs text-slate-600 mt-3 font-bold">
                {diagnostic.tradeHealthScore >= 75 ? 'Excellent Setup Health' : diagnostic.tradeHealthScore >= 50 ? 'Moderate Caution Setup' : 'High Risk Trade Setup'}
              </p>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  diagnostic.tradeHealthScore >= 75 ? 'bg-emerald-500' : diagnostic.tradeHealthScore >= 50 ? 'bg-amber-500' : 'bg-rose-600'
                }`}
                style={{ width: `${diagnostic.tradeHealthScore}%` }}
              />
            </div>
          </div>

          {/* ATR Stop-Loss & Take-Profit Levels */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                ATR Mathematical Stop-Loss & Target Guardrails
              </span>
              <span className="text-xs font-mono text-slate-600 font-bold">Calculated ATR: ${diagnostic.atrValue}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1:2 Risk Reward Ratio */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-700 block">Standard 1:2 Risk-Reward Setup</span>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 font-bold">Stop Loss (1.5x ATR):</span>
                  <span className="text-rose-600 font-bold">${diagnostic.suggestedStopLoss1to2}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 font-bold">Target 1 (3.0x ATR):</span>
                  <span className="text-emerald-700 font-bold">${diagnostic.suggestedTakeProfit1to2}</span>
                </div>
              </div>

              {/* 1:3 Risk Reward Ratio */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-amber-800 block">Extended 1:3 Risk-Reward Setup</span>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 font-bold">Stop Loss (1.5x ATR):</span>
                  <span className="text-rose-600 font-bold">${diagnostic.suggestedStopLoss1to3}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 font-bold">Target 2 (4.5x ATR):</span>
                  <span className="text-emerald-700 font-bold">${diagnostic.suggestedTakeProfit1to3}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
              💡 <span className="font-bold text-slate-900">AI Diagnostic:</span> {diagnostic.aiDiagnosticRationale}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
