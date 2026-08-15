import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CandlestickVisionDoctor } from './components/CandlestickVisionDoctor';
import { MarketScanner } from './components/MarketScanner';
import { TradingJournalDoctor } from './components/TradingJournalDoctor';
import { CandlestickPatternGuide } from './components/CandlestickPatternGuide';
import { HighGrowthScanner } from './components/HighGrowthScanner';
import { AiScreener } from './components/AiScreener';
import { SmartMoneyTracker } from './components/SmartMoneyTracker';
import { PreTradeDiagnostic } from './components/PreTradeDiagnostic';
import { InnerCircleModal } from './components/InnerCircleModal';
import { AuthModal } from './components/AuthModal';
import { HudTargetSphere } from './components/HudTargetSphere';
import { SmartMoneyMatrixGrid } from './components/SmartMoneyMatrixGrid';
import { DragDropStrategyCanvas } from './components/DragDropStrategyCanvas';
import { PricingTable, SubscriptionTier } from './components/PricingTable';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { PresetChart } from './data/presetCharts';
import { Language, TRANSLATIONS } from './data/translations';
import { ShieldCheck, Activity, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // Exactly 30 days in milliseconds

export function App() {
  const [activeTab, setActiveTab] = useState<'hud' | 'canvas' | 'vision' | 'screener' | 'smartMoney' | 'scanner' | 'risk' | 'guide' | 'high-growth'>('hud');
  const [selectedPreset, setSelectedPreset] = useState<PresetChart | null>(null);
  const [language, setLanguage] = useState<Language>('en'); // Default to English

  // User Auth & Session state
  const [user, setUser] = useState<{ email: string; name?: string; provider?: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login'>('signup');

  // Subscription Tier Management with 30-Day Timer
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  const [freeSearchCount, setFreeSearchCount] = useState<number>(0);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [modalTriggerText, setModalTriggerText] = useState<string>('🔒 Premium Feature: This premium tool requires complete unrestricted access ($19.99/mo).');

  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  // Handle tier activation & set 30-day expiry
  const handleSelectTier = (tierId: SubscriptionTier) => {
    setSubscriptionTier(tierId);
    if (tierId !== 'free') {
      const now = Date.now();
      const expiry = now + ONE_MONTH_MS;
      setExpiresAt(expiry);
      setSecondsRemaining(Math.floor(ONE_MONTH_MS / 1000));
    } else {
      setExpiresAt(null);
      setSecondsRemaining(0);
    }
  };

  const handleOpenAuth = (mode: 'signup' | 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData: { email: string; provider: string; tier: SubscriptionTier; name?: string }) => {
    setUser({
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      provider: userData.provider,
    });
    if (userData.tier && userData.tier !== 'free') {
      handleSelectTier(userData.tier);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setSubscriptionTier('free');
    setExpiresAt(null);
    setSecondsRemaining(0);
  };

  const handleDeleteAccount = () => {
    setUser(null);
    setSubscriptionTier('free');
    setExpiresAt(null);
    setSecondsRemaining(0);
    setIsAuthModalOpen(false);
  };

  // Live second-by-second countdown timer for 1 month subscription
  useEffect(() => {
    if (!expiresAt || subscriptionTier === 'free') return;

    const interval = setInterval(() => {
      const diff = Math.floor((expiresAt - Date.now()) / 1000);
      if (diff <= 0) {
        setSubscriptionTier('free');
        setExpiresAt(null);
        setSecondsRemaining(0);
        clearInterval(interval);
      } else {
        setSecondsRemaining(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, subscriptionTier]);

  // Format seconds into "29d 23h 59m 50s"
  const formatTimeRemaining = (totalSec: number) => {
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  const handleSimulateExpiry = () => {
    setSubscriptionTier('free');
    setExpiresAt(null);
    setSecondsRemaining(0);
  };

  const handleSelectPreset = (preset: PresetChart) => {
    setSelectedPreset(preset);
  };

  const openPaywallModal = (customReason?: string) => {
    if (customReason) {
      setModalTriggerText(customReason);
    } else {
      setModalTriggerText('🔒 Premium Feature: Complete Access is required ($19.99/mo).');
    }
    setIsUpgradeModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 flex flex-col overflow-x-hidden">

      {/* Sci-Fi Futuristic Cyberpunk HUD Background System */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(#06b6d4 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        <div className="absolute top-0 left-1/4 -translate-y-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* App Header & Navigation */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSelectPreset={handleSelectPreset}
          language={language}
          setLanguage={setLanguage}
          subscriptionTier={subscriptionTier}
          user={user}
          onOpenAuth={handleOpenAuth}
          onSignOut={handleSignOut}
        />

        {/* Live Active Subscription Status & 30-Day Expiry Banner */}
        {subscriptionTier !== 'free' && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 border-b border-emerald-500/40 px-4 py-2 text-xs font-mono">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Active Plan: <span className="uppercase tracking-wider font-extrabold text-white">PREMIUM COMPLETE TIER</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  Expires in: <span className="text-white font-extrabold">{formatTimeRemaining(secondsRemaining)}</span> (Exactly 30 Days)
                </span>
              </div>

              <button
                onClick={handleSimulateExpiry}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-rose-400" />
                Simulate 30-Day Expiration (Reset Plan)
              </button>
            </div>
          </div>
        )}

        {/* Main Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Front-Screen Prominent Educational Compliance Disclaimer Banner */}
          <DisclaimerBanner />

          {/* Main Landing Page HUD Interface */}
          {activeTab === 'hud' && (
            <div className="space-y-12">
              {/* 1. Hero Showcase */}
              <section id="hud-hero">
                <HudTargetSphere
                  subscriptionTier={subscriptionTier}
                  onOpenUpgradeModal={(reason) => openPaywallModal(reason || "🔒 VIP Feature: Instant Telegram Alerts & Smart Money Flow require VIP Inner Circle ($69.99/mo).")}
                />
              </section>

              {/* 2. Fluid Smart Money Matrix Heat-Grid */}
              <section id="smart-money-matrix">
                <SmartMoneyMatrixGrid
                  subscriptionTier={subscriptionTier}
                  onOpenUpgradeModal={(reason) => openPaywallModal(reason || "🔒 Premium Feature: Dark Pool Smart Money Flow Matrix requires complete unrestricted access ($19.99/mo).")}
                />
              </section>

              {/* 3. Drag-and-Drop Strategy Builder Canvas */}
              <section id="strategy-canvas">
                <DragDropStrategyCanvas />
              </section>

              {/* 4. Tiered Pricing Table & SaaS Conversion Engine */}
              <section id="pricing-tiers">
                <PricingTable
                  subscriptionTier={subscriptionTier}
                  onSelectTier={handleSelectTier}
                  onOpenUpgradeModal={(reason) => openPaywallModal(reason)}
                />
              </section>
            </div>
          )}

          {activeTab === 'canvas' && (
            <div className="space-y-8">
              <DragDropStrategyCanvas />
              <PricingTable
                subscriptionTier={subscriptionTier}
                onSelectTier={handleSelectTier}
                onOpenUpgradeModal={(reason) => openPaywallModal(reason)}
              />
            </div>
          )}

          {activeTab === 'vision' && (
            <CandlestickVisionDoctor selectedPreset={selectedPreset} />
          )}

          {activeTab === 'screener' && (
            <AiScreener
              subscriptionTier={subscriptionTier}
              freeSearchCount={freeSearchCount}
              onIncrementSearchCount={() => setFreeSearchCount((prev) => prev + 1)}
              onOpenUpgradeModal={(reason) => openPaywallModal(reason || "🔒 Premium complete access ($19.99) required for Unlimited AI Searches.")}
            />
          )}

          {activeTab === 'smartMoney' && (
            <div className="space-y-8">
              <SmartMoneyMatrixGrid
                subscriptionTier={subscriptionTier}
                onOpenUpgradeModal={(reason) => openPaywallModal(reason || "🔒 Premium Feature: Live Dark Pool Whale Flow requires complete unrestricted access ($19.99/mo).")}
              />
              <SmartMoneyTracker
                isPremium={subscriptionTier === 'pro'}
                onOpenUpgradeModal={() => openPaywallModal("🔒 Premium Feature: Institutional Tracker requires complete unrestricted access ($19.99/mo).")}
              />
            </div>
          )}

          {activeTab === 'scanner' && (
            <MarketScanner />
          )}

          {activeTab === 'high-growth' && (
            <HighGrowthScanner
              subscriptionTier={subscriptionTier}
              onOpenUpgradeModal={(reason) => openPaywallModal(reason || "🔒 Unlock All 55 Stocks ($19.99/mo Premium Access)")}
            />
          )}

          {activeTab === 'risk' && (
            <div className="space-y-8">
              <PreTradeDiagnostic />
              <TradingJournalDoctor />
            </div>
          )}

          {activeTab === 'guide' && (
            <CandlestickPatternGuide />
          )}
        </main>

        {/* Inner Circle Paywall Modal */}
        <InnerCircleModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          onSimulateUpgrade={(tier) => handleSelectTier(tier)}
          featureTrigger={modalTriggerText}
          currentTier={subscriptionTier}
        />

        {/* User Authentication & Account Management Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialMode={authModalMode}
          currentUser={user}
          onDeleteAccount={handleDeleteAccount}
        />

        {/* Clean Footer with Disclaimer */}
        <footer className="bg-slate-900 border-t border-slate-800 py-6 text-slate-400 text-xs font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AI Trade Doctor v3.6 • Educational Market Analytics Engine</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse text-cyan-400" /> HUD Matrix Active
              </span>
              <span>•</span>
              <span>This platform is purely for market analytics, educational research, and AI data insights. We do not process trades or offer financial advice.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
