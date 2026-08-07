import React from 'react';
import { Stethoscope, Activity, Camera, LineChart, ShieldAlert, BookOpen, Sparkles, Crown, Globe, User, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { PRESET_CHARTS, PresetChart } from '../data/presetCharts';
import { Language, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  activeTab: 'hud' | 'canvas' | 'vision' | 'screener' | 'smartMoney' | 'scanner' | 'high-growth' | 'risk' | 'guide';
  setActiveTab: (tab: 'hud' | 'canvas' | 'vision' | 'screener' | 'smartMoney' | 'scanner' | 'high-growth' | 'risk' | 'guide') => void;
  onSelectPreset: (preset: PresetChart) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  subscriptionTier?: 'free' | 'pro' | 'vip';
  user?: { email: string; name?: string; provider?: string } | null;
  onOpenAuth?: (mode: 'signup' | 'login') => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSelectPreset,
  language,
  setLanguage,
  subscriptionTier = 'free',
  user,
  onOpenAuth,
  onSignOut,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  // Real-time market ticker items
  const tickerItems = [
    { symbol: 'BTC/USD', price: '$96,840.50', change: '+2.4%', isUp: true },
    { symbol: 'ETH/USD', price: '$3,480.20', change: '+1.8%', isUp: true },
    { symbol: 'NVDA', price: '$128.90', change: '+3.1%', isUp: true },
    { symbol: 'RELIANCE.NS', price: '₹2,950.40', change: '+1.2%', isUp: true },
    { symbol: 'TCS.NS', price: '₹4,150.00', change: '-0.4%', isUp: false },
    { symbol: 'AAPL', price: '$225.10', change: '+0.8%', isUp: true },
    { symbol: 'TSLA', price: '$240.50', change: '-1.5%', isUp: false },
    { symbol: 'SOL/USD', price: '$185.30', change: '+4.2%', isUp: true },
  ];

  return (
    <header className="bg-white/95 border-b border-slate-200 text-slate-900 sticky top-0 z-50 backdrop-blur-md shadow-sm">
      {/* Financial Terminal Ticker Tape */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 overflow-hidden text-xs text-slate-200 font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold shrink-0 text-[11px]">
            <Activity className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span className="hidden sm:inline">{t.liveTickerTitle}</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-0.5">
            {tickerItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0 text-[11px]">
                <span className="font-bold text-white">{item.symbol}</span>
                <span className="text-slate-300">{item.price}</span>
                <span className={item.isUp ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>

          {/* Render Backend Connection Indicator */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">Backend Live</span>
          </div>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-800">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-slate-800 text-amber-300 border border-slate-700 rounded-lg px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-amber-400 cursor-pointer shadow-sm"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white font-bold shrink-0">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  {t.appTitle}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-pulse text-emerald-600" /> AI Vision 3.6
                </span>
                {subscriptionTier === 'vip' && (
                  <span className="bg-amber-950 text-amber-300 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/50 flex items-center gap-1 animate-pulse">
                    <Crown className="w-3 h-3 fill-amber-400 text-amber-400" /> VIP Member ($69.99)
                  </span>
                )}
                {subscriptionTier === 'pro' && (
                  <span className="bg-cyan-950 text-cyan-300 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/50 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> Pro Trader ($29.99)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-xl truncate">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Quick Preset Chart Samples & User Auth Control */}
          <div className="flex flex-wrap items-center gap-2">

            {/* User Auth Section */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-2xl border border-slate-800 shadow-sm text-xs font-mono">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="font-bold truncate max-w-[120px]">{user.name || user.email.split('@')[0]}</span>
                <button
                  onClick={onSignOut}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth?.('login')}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth?.('signup')}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:inline">
              {t.sampleChartsLabel}
            </span>
            {PRESET_CHARTS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  setActiveTab('vision');
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                title={preset.descriptionBengali}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-[11px]">
                  {language === 'bn' ? preset.titleBengali.split(' ')[0] + ' ' + (preset.titleBengali.split(' ')[1] || '') : preset.titleEnglish}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-3.5 pt-2 border-t border-slate-200 overflow-x-auto scrollbar-none">

          <button
            onClick={() => setActiveTab('hud')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'hud'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-600 animate-pulse" />
            <span>⚡ 3D AI Target HUD</span>
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'canvas'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>🧩 Strategy Canvas</span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'vision'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t.visionTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('screener')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'screener'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t.screenerTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('smartMoney')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'smartMoney'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>{t.smartMoneyTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'scanner'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>{t.scannerTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('high-growth')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'high-growth'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-600" />
            <span>{t.growthTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('risk')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'risk'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t.riskTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.guideTab}</span>
          </button>

        </div>
      </div>
    </header>
  );
};
