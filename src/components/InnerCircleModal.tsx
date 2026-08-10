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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] my-8">

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
              Activate Complete Premium Access
            </h2>
            <p className="text-amber-400 font-mono text-xs sm:text-sm font-bold bg-amber-950/60 p-3 rounded-2xl border border-amber-800/60 leading-relaxed">
              {featureTrigger || "Activate instant complete premium access for 30 days."}
            </p>
          </div>

          {/* Active Selection Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-slate-900 p-5 rounded-2xl border border-amber-500/40 gap-3">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase font-bold block">Premium License: Complete Access</span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-black text-amber-400">$19.99</span>
                <span className="text-slate-400 font-bold text-xs">/month (30 Days Complete Access)</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Valid for Exactly 1 Month
            </span>
          </div>

          {/* Highlights */}
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <p className="font-bold text-white">Your Premium Membership Includes:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Unlimited Vision Diagnostic scans</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Smart Money Dark Pool grid</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Interactive Strategy Canvas</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Unlimited Conversational Searches</span>
              </li>
            </ul>
          </div>

          {/* Call To Action Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                onSimulateUpgrade('pro');
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-mono font-black text-sm sm:text-base shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.01] transition-all cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>Activate Premium Access ($19.99/mo)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>30-Day Instant Plan Access • All Premium Sections Unlocked</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
