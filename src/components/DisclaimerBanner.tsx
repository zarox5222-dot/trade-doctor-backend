import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-8 transition-all">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-200 font-mono">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/50 shrink-0 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                MANDATORY EDUCATIONAL & COMPLIANCE NOTICE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                Analytics Only
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
              This platform is purely for market analytics, educational research, and AI data insights. We do not process trades or offer financial advice.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-[11px] font-bold text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
          Educational System v3.6
        </div>
      </div>
    </div>
  );
};
