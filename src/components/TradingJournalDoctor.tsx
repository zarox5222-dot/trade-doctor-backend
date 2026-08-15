import React, { useState, useEffect, useCallback } from 'react';
import { TradeRiskDiagnosis } from '../types';
import {
  ShieldAlert,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const TradingJournalDoctor: React.FC = () => {
  const [accountBalance, setAccountBalance] = useState<number>(1000);
  const [riskPercentPerTrade, setRiskPercentPerTrade] = useState<number>(2);
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [stopLossPrice, setStopLossPrice] = useState<number>(95);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(115);
  const [leverage, setLeverage] = useState<number>(1);
  const [tradeDirection, setTradeDirection] = useState<'Long / Buy' | 'Short / Sell'>('Long / Buy');

  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<TradeRiskDiagnosis | null>(null);

  const computeRisk = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze-trade-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountBalance,
          riskPercentPerTrade,
          entryPrice,
          stopLossPrice,
          takeProfitPrice,
          leverage,
          tradeDirection,
        }),
      });

      if (!res.ok) {
        throw new Error('Error calculating risk.');
      }

      const data: TradeRiskDiagnosis = await res.json();
      setDiagnosis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [accountBalance, riskPercentPerTrade, entryPrice, stopLossPrice, takeProfitPrice, leverage, tradeDirection]);

  useEffect(() => {
    computeRisk();
  }, [computeRisk]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Title */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Risk Management & Position Sizing Calculator (Risk Doctor)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Calculate exact dollar risk, position sizing, and risk-to-reward ratio to prevent account liquidation.
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Total Account Balance ($)
            </label>
            <input
              type="number"
              min={10}
              value={accountBalance}
              onChange={(e) => setAccountBalance(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-amber-600" /> Risk Target (%)
            </label>
            <input
              type="number"
              min={0.5}
              max={100}
              step={0.5}
              value={riskPercentPerTrade}
              onChange={(e) => setRiskPercentPerTrade(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-600" /> Trade Direction
            </label>
            <select
              value={tradeDirection}
              onChange={(e) => setTradeDirection(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-bold shadow-inner"
            >
              <option value="Long / Buy">Long / Buy</option>
              <option value="Short / Sell">Short / Sell</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Entry Price ($)
            </label>
            <input
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-bold shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Stop Loss Price ($)
            </label>
            <input
              type="number"
              step="any"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono text-rose-600 font-bold shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Take Profit Price ($)
            </label>
            <input
              type="number"
              step="any"
              value={takeProfitPrice}
              onChange={(e) => setTakeProfitPrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono text-emerald-700 font-bold shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Leverage
            </label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-bold shadow-inner"
            >
              <option value={1}>1x (Spot / No Leverage)</option>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
              <option value={5}>5x</option>
              <option value={10}>10x (High Risk)</option>
              <option value={20}>20x (Extreme Risk)</option>
              <option value={50}>50x (Danger / Gambling)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Results Display */}
      {diagnosis && !isLoading && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-slate-900">Calculated Position Size & Risk Diagnosis</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              diagnosis.isRiskSafe
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {diagnosis.isRiskSafe ? '✅ Safe Risk Ratio' : '⚠️ High Risk / Uncontrolled Trade'}
            </span>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Max Dollar Risk</span>
              <div className="text-xl font-mono font-bold text-rose-600">${diagnosis.dollarAmountAtRisk}</div>
              <span className="text-[10px] text-slate-500 font-medium">{riskPercentPerTrade}% of Capital</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Recommended Position Size</span>
              <div className="text-xl font-mono font-bold text-emerald-700">${diagnosis.maxPositionSize}</div>
              <span className="text-[10px] text-slate-500 font-medium">{diagnosis.maxContractsOrCoins} Coins/Lots</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Estimated Target Profit</span>
              <div className="text-xl font-mono font-bold text-teal-700">+${diagnosis.potentialProfit}</div>
              <span className="text-[10px] text-slate-500 font-medium">If Take Profit Hit</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Risk-to-Reward Ratio</span>
              <div className="text-xl font-mono font-bold text-cyan-700">1:{diagnosis.riskRewardRatio}</div>
              <span className="text-[10px] text-slate-500 font-medium">{diagnosis.riskRewardRatio >= 2 ? 'Excellent (1:2+)' : 'Aim for at least 1:2'}</span>
            </div>

          </div>

          {/* Warnings List */}
          {diagnosis.warningsEnglish && diagnosis.warningsEnglish.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Trading Risk Warnings:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                {diagnosis.warningsEnglish.map((warn, wIdx) => (
                  <li key={wIdx} className="leading-relaxed">
                    {warn}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-emerald-800 uppercase tracking-wider block">
              🛡️ Trade Doctor Discipline Advice:
            </span>
            <ul className="space-y-1.5 text-slate-700 font-medium">
              {diagnosis.recommendations.map((rec, rIdx) => (
                <li key={rIdx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
};
