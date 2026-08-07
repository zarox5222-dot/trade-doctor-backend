import React from 'react';
import { Check, Zap, Crown, ShieldCheck, Sparkles, Lock, ArrowRight, X } from 'lucide-react';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'vip';

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

  const tiers = [
    {
      id: 'starter' as SubscriptionTier,
      name: 'Starter & AI Chat',
      price: billingCycle === 'monthly' ? '$19.99' : '$15.99',
      period: billingCycle === 'monthly' ? '/month' : '/month, billed annually',
      description: 'Unlocks unlimited photo chart analysis, unlimited AI chat, and all 55 Global & Indian stocks.',
      badge: 'Starter Access',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      buttonText: subscriptionTier === 'starter'
        ? `Starter Active Plan (${billingCycle === 'monthly' ? '$19.99' : '$15.99'}/mo)`
        : subscriptionTier === 'pro' || subscriptionTier === 'vip'
        ? 'Included in Pro/VIP'
        : `Get Starter (${billingCycle === 'monthly' ? '$19.99' : '$15.99'}/mo)`,
      buttonStyle: subscriptionTier === 'starter'
        ? 'bg-emerald-500 text-slate-950 font-black cursor-default'
        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md',
      highlighted: false,
      features: [
        { text: 'Unlimited Photo Chart Analysis & AI Diagnosis', included: true },
        { text: 'Unlimited Conversational AI Trading Chat', included: true },
        { text: 'Full Access to 55 Global & Indian Stocks', included: true },
        { text: 'Real-time Price & Market Valuation Data', included: true },
        { text: 'Basic Technical Pattern Indicators (RSI, Moving Avgs)', included: true },
        { text: '🔒 Risk Management & Position Sizing Calculator', included: false, note: 'Pro Tier' },
        { text: '🔒 Interactive Drag & Drop Strategy Canvas', included: false, note: 'Pro Tier' },
        { text: '🔒 Live Institutional Dark Pool Smart Money Flow Matrix', included: false, note: 'VIP Exclusive' },
        { text: '🔒 Real-time Telegram Bot Push Alerts on Whale Spikes', included: false, note: 'VIP Exclusive' },
      ],
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro Trader + Risk Suite',
      price: billingCycle === 'monthly' ? '$29.99' : '$23.99',
      period: billingCycle === 'monthly' ? '/month' : '/month, billed annually',
      description: 'Includes everything in Starter + full Risk Management suite, Position Sizer, and Strategy Builder.',
      badge: 'Most Popular for Active Traders',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
      buttonText: subscriptionTier === 'pro'
        ? `Pro Active Plan (${billingCycle === 'monthly' ? '$29.99' : '$23.99'}/mo)`
        : subscriptionTier === 'vip'
        ? 'Included in VIP'
        : `Upgrade to Pro (${billingCycle === 'monthly' ? '$29.99' : '$23.99'}/mo)`,
      buttonStyle: subscriptionTier === 'pro'
        ? 'bg-emerald-500 text-slate-950 font-black cursor-default'
        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.4)]',
      highlighted: false,
      features: [
        { text: 'Everything in Starter Plan +', included: true },
        { text: 'Advanced Risk Management & Position Sizing Calculator', included: true },
        { text: 'ATR Volatility Stop-Loss & Take-Profit Targets', included: true },
        { text: 'Interactive Drag-and-Drop Strategy Builder Canvas', included: true },
        { text: 'AI Pre-Trade Diagnostic & Mistake Blocker Engine', included: true },
        { text: 'Personal AI Trading Journal & Emotion Tracker', included: true },
        { text: '🔒 Live Institutional Dark Pool Smart Money Flow Matrix', included: false, note: 'VIP Exclusive' },
        { text: '🔒 Real-time Telegram Bot Push Alerts on Whale Spikes', included: false, note: 'VIP Exclusive' },
        { text: '🔒 1-Click AI Voice Market Briefings & Waveform Player', included: false, note: 'VIP Exclusive' },
      ],
    },
    {
      id: 'vip' as SubscriptionTier,
      name: 'Direct VIP Inner Circle',
      price: billingCycle === 'monthly' ? '$69.99' : '$55.99',
      period: billingCycle === 'monthly' ? '/month' : '/month, billed annually',
      description: 'COMPLETE UNRESTRICTED ACCESS. Absolutely nothing is left out! Dark pool flow, Telegram alerts & AI voice briefings.',
      badge: '🔥 UNLOCKS EVERYTHING COMPLETELY',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-black animate-pulse',
      buttonText: subscriptionTier === 'vip'
        ? `VIP Member Active (${billingCycle === 'monthly' ? '$69.99' : '$55.99'}/mo)`
        : `Direct VIP Access (${billingCycle === 'monthly' ? '$69.99' : '$55.99'}/mo)`,
      buttonStyle: subscriptionTier === 'vip'
        ? 'bg-emerald-500 text-slate-950 font-black cursor-default'
        : 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-black hover:scale-[1.02] shadow-[0_0_30px_rgba(245,158,11,0.5)]',
      highlighted: true,
      features: [
        { text: 'Everything in Pro Trader & Risk Suite Plan +', included: true },
        { text: 'Live Institutional Dark Pool Smart Money Flow Matrix', included: true },
        { text: 'Real-time Telegram Bot Push Notifications on Whale Spikes', included: true },
        { text: '1-Click AI Voice Briefing & Waveform Audio Player', included: true },
        { text: 'Full 55+ Global & Indian Market Price & Catalyst Signals', included: true },
        { text: 'Dedicated VIP Institutional Signals Group Access', included: true },
        { text: '100% Complete Access — Nothing Left Out!', included: true },
      ],
    },
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
          Choose Starter, Pro, or Direct VIP for 100% complete access. Monthly or Annual Billing Cycle.
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

      {/* 3-Tier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${
              tier.highlighted
                ? 'bg-slate-950/90 border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.25)] lg:-translate-y-2'
                : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 text-slate-950 text-[10px] font-mono font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-slate-950" /> 100% UNLOCKED
              </div>
            )}

            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold border ${tier.badgeColor}`}>
                  {tier.badge}
                </span>
                <h3 className="text-xl font-black text-white">{tier.name}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-4xl sm:text-5xl font-black text-white">{tier.price}</span>
                <span className="text-slate-400 font-bold text-xs">{tier.period}</span>
              </div>

              {/* Feature List */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs font-mono">
                {tier.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    {feat.included ? (
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.highlighted ? 'text-amber-400' : 'text-cyan-400'}`} />
                    ) : (
                      <X className="w-4 h-4 shrink-0 mt-0.5 text-slate-600" />
                    )}
                    <span className={`font-medium leading-snug ${feat.included ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                      {feat.text}
                      {feat.note && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold uppercase no-underline inline-block">
                          {feat.note}
                        </span>
                      )}
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
                    onSelectTier(tier.id);
                  } else if (onOpenUpgradeModal) {
                    onOpenUpgradeModal(`Activated ${tier.name}`);
                  }
                }}
                className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${tier.buttonStyle}`}
              >
                <span>{tier.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-slate-500 font-mono">
                Active for exactly 30 Days (1 Month). Auto-normalizes upon expiration.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
