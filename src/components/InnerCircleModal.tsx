import React, { useState } from 'react';
import { Sparkles, Crown, CheckCircle2, ShieldCheck, Zap, X, Lock, ArrowRight, Star } from 'lucide-react';
import { SubscriptionTier } from './PricingTable';

interface InnerCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateUpgrade: (tier: SubscriptionTier) => void;
  featureTrigger?: string;
  currentTier?: SubscriptionTier;
}

export const InnerCircleModal: React.FC<InnerCircleModalProps> = ({
  isOpen,
  onClose,
  onSimulateUpgrade,
  featureTrigger,
  currentTier = 'free',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('vip');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'starter' as SubscriptionTier,
      name: 'Starter & Chat',
      price: '$19.99',
      period: '/mo',
      badge: 'Basic Access',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      description: 'Unlocks all 55 Global & Indian stocks, unlimited photo chart AI diagnosis & trading chat.',
      highlights: ['55 High-Growth Stocks Unlocked', 'Unlimited Photo Chart Diagnosis', 'Real-Time Price & Valuations'],
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Pro Trader',
      price: '$29.99',
      period: '/mo',
      badge: 'Most Popular',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
      description: 'Includes everything in $19.99 Starter + full Risk Management suite & Strategy Canvas.',
      highlights: ['Everything in $19.99 Starter', 'Risk Calculator & Position Sizer', 'Drag & Drop Strategy Canvas', 'Unlimited Natural Language AI Screener'],
    },
    {
      id: 'vip' as SubscriptionTier,
      name: 'VIP Inner Circle',
      price: '$69.99',
      period: '/mo',
      badge: '🔥 Complete Unlock',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-black',
      description: 'COMPLETE UNRESTRICTED ACCESS to all features including Dark Pool Matrix, Telegram Alerts & Audio Briefings.',
      highlights: ['100% Unlocked Access to Everything', 'Dark Pool Smart Money Matrix', 'Real-Time Telegram Push Alerts', '1-Click AI Voice Briefings'],
    },
  ];

  const activePlanObj = plans.find((p) => p.id === selectedPlan) || plans[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] my-8">

        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 space-y-6">

          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-amber-400" /> Choose Your Plan & Unlock Access
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Select Your Preferred Upgrade Plan
            </h2>
            <p className="text-amber-400 font-mono text-xs sm:text-sm font-bold bg-amber-950/60 p-3 rounded-2xl border border-amber-800/60">
              {featureTrigger || "Select $19.99 Starter, $29.99 Pro, or $69.99 VIP to activate instant plan access for 30 days."}
            </p>
          </div>

          {/* Plan Selector Grid (3 Options) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-mono font-black uppercase tracking-wider">
                      Selected
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                    <h3 className="text-sm font-black text-white">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 font-mono">
                      <span className="text-2xl font-black text-white">{plan.price}</span>
                      <span className="text-slate-400 font-bold text-[10px]">{plan.period}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <span className="block text-slate-300 font-bold mb-1">Includes:</span>
                    <ul className="space-y-1">
                      {plan.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Selection Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-slate-900 p-4 rounded-2xl border border-amber-500/40 gap-3">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase font-bold block">Selected Plan: {activePlanObj.name}</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">{activePlanObj.price}</span>
                <span className="text-slate-400 font-bold text-xs">{activePlanObj.period} (30 Days Access)</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Valid for Exactly 1 Month
            </span>
          </div>

          {/* Call To Action Button */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onSimulateUpgrade(selectedPlan);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-mono font-black text-sm sm:text-base shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.01] transition-all cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>Activate {activePlanObj.name} ({activePlanObj.price}/mo)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>30-Day Instant Plan Access • All Premium Sections Unlocked according to Tier</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
