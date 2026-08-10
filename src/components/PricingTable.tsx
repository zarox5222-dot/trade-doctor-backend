import React from 'react';
import { Check, Zap, Crown, ShieldCheck, Sparkles, Lock, ArrowRight, X } from 'lucide-react';

export type SubscriptionTier = 'free' | 'pro';

interface PricingTableProps {
  subscriptionTier?: SubscriptionTier;
  onSelectTier?: (tierId: SubscriptionTier) => void;
  onOpenUpgradeModal?: (featureName?: string) => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  subscriptionTier = 'free',
  onSelectTier,
  onOpenUpgradeModal,
}) => {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');

  const price = billingCycle === 'monthly' ? '$19.99' : '$15.99';
  const period = billingCycle === 'monthly' ? '/month' : '/month, billed annually';

  const isUpgraded = subscriptionTier === 'pro';

  const features = [
    { text: 'Unlimited Photo Chart Analysis & AI Diagnosis', included: true },
    { text: 'Unlimited Conversational AI Trading Chat', included: true },
    { text: 'Full Access to All 55 Global & Indian Stocks', included: true },
    { text: 'Real-time Price & Market Valuation Data', included: true },
    { text: 'Risk Management & Position Sizing Calculator', included: true },
    { text: 'Interactive Drag & Drop Strategy Builder Canvas', included: true },
    { text: 'Live Institutional Dark Pool Smart Money Flow Matrix', included: true },
    { text: 'Real-time Telegram Bot Push Alerts on Whale Spikes', included: true },
    { text: '1-Click AI Voice Market Briefings & Waveform Player', included: true },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Table Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Crown className="w-4 h-4 text-amber-400 fill-amber-400" /> Subscription Plans & Full Access Levels
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Select Your Preferred Trading Plan
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-medium">
          Get 100% complete, unrestricted access to all Trade Doctor tools. Monthly or Annual Billing Cycle.
        </p>

        {/* Professional Monthly vs Annual Toggle */}
        <div className="inline-flex items-center gap-2.5 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl mx-auto">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-cyan-600 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-cyan-600 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Annually</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-mono font-black uppercase">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Single Tier Layout - High Impact & Premium Card */}
      <div className="max-w-xl mx-auto items-stretch">
        <div className="relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl bg-slate-950/95 border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.25)]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 text-slate-950 text-[10px] font-mono font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 fill-slate-950" /> 100% COMPLETE UNRESTRICTED ACCESS
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 mt-2">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold border bg-amber-500/20 text-amber-300 border-amber-500/60 font-black animate-pulse">
                🔥 UNLOCK EVERYTHING COMPLETELY
              </span>
              <h3 className="text-2xl font-black text-white">Trade Doctor Premium</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Absolutely nothing is left out! Get complete dark pool smart money flow, strategy builder, candlestick vision diagnostic scanning, automated Telegram bot alerts, and 1-click briefings.
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-4xl sm:text-5xl font-black text-white">{price}</span>
              <span className="text-slate-400 font-bold text-xs">{period}</span>
            </div>

            {/* Feature List */}
            <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs font-mono">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span className="font-medium leading-snug text-slate-200">
                    {feat.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => {
                if (onSelectTier) {
                  onSelectTier(isUpgraded ? 'free' : 'pro');
                } else if (onOpenUpgradeModal) {
                  onOpenUpgradeModal(`Activated Premium`);
                }
              }}
              className={`w-full py-4 px-4 rounded-2xl text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isUpgraded
                  ? 'bg-emerald-500 text-slate-950 font-black cursor-default'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-black hover:scale-[1.02] shadow-[0_0_30px_rgba(245,158,11,0.5)]'
              }`}
            >
              <span>{isUpgraded ? `Complete Access Active (${price}${period})` : `Unlock Premium Access for ${price}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-slate-500 font-mono">
              Active for exactly 30 Days (1 Month). Click to instantly upgrade and activate your Premium license.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
