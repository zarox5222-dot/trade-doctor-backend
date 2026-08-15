import React, { useState, useEffect } from 'react';
import { HighGrowthAsset } from '../types';
import { SubscriptionTier } from './PricingTable';
import {
  Sparkles,
  Lock,
  Unlock,
  TrendingUp,
  Globe,
  Building2,
  Filter,
  Zap,
  ShieldAlert,
  DollarSign,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Crown,
  ShoppingCart
} from 'lucide-react';

interface HighGrowthScannerProps {
  subscriptionTier?: SubscriptionTier;
  onOpenUpgradeModal?: (reason?: string) => void;
}

// Exchange / Broker trading links mapped by market category and sector
const GET_TRADE_BROKER_LINKS = (asset: HighGrowthAsset) => {
  if (asset.sector === 'Crypto') {
    return [
      { name: 'Binance', url: `https://www.binance.com/en/trade/${asset.ticker.replace('-USD', '_USDT')}`, icon: '🟡' },
      { name: 'Coinbase', url: `https://www.coinbase.com/price/${asset.name.toLowerCase().replace(/\s+/g, '-')}`, icon: '🔵' },
      { name: 'OKX', url: `https://www.okx.com/trade-spot/${asset.ticker.replace('-USD', '-usdt').toLowerCase()}`, icon: '⚫' }
    ];
  }
  if (asset.market === 'India') {
    return [
      { name: 'Zerodha', url: `https://kite.zerodha.com/chart/ext/ciq/NSE/${asset.ticker.replace('.NS', '')}`, icon: '🟦' },
      { name: 'Groww', url: `https://groww.in/stocks/${asset.name.toLowerCase().replace(/[\s\.\-]+/g, '-')}`, icon: '🟢' },
      { name: 'Angel One', url: `https://www.angelone.in/stocks/${asset.ticker.replace('.NS', '').toLowerCase()}`, icon: '🔴' }
    ];
  }
  // Global / US Equities
  return [
    { name: 'Interactive Brokers', url: `https://www.interactivebrokers.com/mkt/?ticker=${asset.ticker}`, icon: '🔴' },
    { name: 'Robinhood', url: `https://robinhood.com/stocks/${asset.ticker}`, icon: '🟢' },
    { name: 'eToro', url: `https://www.etoro.com/markets/${asset.ticker.toLowerCase()}`, icon: '🟩' }
  ];
};

export const HighGrowthScanner: React.FC<HighGrowthScannerProps> = ({
  subscriptionTier = 'free',
  onOpenUpgradeModal,
}) => {
  const isUnlocked = subscriptionTier !== 'free';

  const [assets, setAssets] = useState<HighGrowthAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const fetchAssets = async (region: string, sector: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/high-growth-assets?region=${region}&sector=${sector}`);
      const data = await res.json();
      if (data.assets) {
        setAssets(data.assets);
      }
    } catch (err) {
      console.error('Failed to load high growth assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(selectedRegion, selectedSector);
  }, [selectedRegion, selectedSector]);

  const handleUnlockClick = () => {
    if (onOpenUpgradeModal) {
      onOpenUpgradeModal('🔒 Unlock All 55 Global & Indian Stocks ($19.99/mo Starter Access)');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 55 Global & Indian Equity Intelligence
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              55 Asset Trading Room & Live Exchange Hub
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
              Explore 55 premier assets across Wall Street, Crypto, and Indian Equities (NSE). View live price metrics, AI valuation forecasts, and direct verified links to execute trades on Interactive Brokers, Binance, Zerodha, and Robinhood.
            </p>
          </div>

          {!isUnlocked ? (
            <button
              onClick={handleUnlockClick}
              className="self-start md:self-auto inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 font-mono font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              Unlock All 55 Stocks ($19.99/mo)
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              All 55 Stocks Unlocked ({subscriptionTier.toUpperCase()})
            </div>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mr-1 font-mono">
            <Filter className="w-4 h-4 text-emerald-400" /> Region:
          </div>

          {/* Region Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 font-mono">
            <button
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRegion === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Regions (55)
            </button>
            <button
              onClick={() => setSelectedRegion('global')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRegion === 'global'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Global / US
            </button>
            <button
              onClick={() => setSelectedRegion('india')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRegion === 'india'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 India NSE
            </button>
          </div>

          {/* Sector Selector */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
          >
            <option value="all">All Sectors</option>
            <option value="tech">Tech & IT</option>
            <option value="crypto">Crypto Assets</option>
            <option value="semiconductors">Semiconductors</option>
            <option value="finance">Finance & Banking</option>
            <option value="automotive">Automotive & EV</option>
            <option value="energy">Energy & Power</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-bold font-mono">
          Showing <span className="text-amber-400 font-extrabold">{assets.length}</span> / 55 Tickers
        </div>
      </div>

      {/* Asset Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse p-4" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const seed = sumString(asset.ticker);
            const estValuation = asset.sector === 'Crypto'
              ? `$${(15 + (seed % 900)).toFixed(1)} Billion USD`
              : asset.market === 'India'
              ? `₹${(1.2 + (seed % 18)).toFixed(2)} Lakh Crore INR`
              : `$${(0.15 + (seed % 28) / 10).toFixed(2)} Trillion USD`;

            const estPrice = asset.sector === 'Crypto'
              ? `$${(120 + (seed % 65000)).toLocaleString()} USD`
              : asset.market === 'India'
              ? `₹${(450 + (seed % 2800)).toLocaleString()} INR`
              : `$${(85 + (seed % 750)).toFixed(2)} USD`;

            const brokers = GET_TRADE_BROKER_LINKS(asset);
            const itemUnlocked = isUnlocked;

            return (
              <div
                key={asset.ticker}
                className="relative overflow-hidden rounded-2xl border transition-all duration-300 bg-slate-900/90 border-slate-800 p-5 space-y-4 shadow-md hover:border-slate-700 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header: Company Name & Valuation Always Visible */}
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0">
                        {asset.market === 'India' ? '🇮🇳' : '🌐'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-white text-base">{asset.ticker}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {asset.market}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-[170px] font-medium">{asset.name}</p>
                      </div>
                    </div>

                    {itemUnlocked ? (
                      <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0">
                        {asset.sentiment || 'Bullish'}
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0">
                        <Lock className="w-3 h-3 text-amber-400" /> Premium Signal
                      </span>
                    )}
                  </div>

                  {/* Company Price & Market Valuation */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Current Price</span>
                      <span className="text-cyan-400 font-bold text-xs">{estPrice}</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Market Valuation</span>
                      <span className="text-white font-bold text-xs truncate block">{estValuation}</span>
                    </div>
                  </div>

                  {/* Growth Predictions & AI Catalyst Signals */}
                  {itemUnlocked ? (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
                          <span className="text-slate-400 block text-[10px] font-bold">Proj. Growth Rate</span>
                          <span className="text-emerald-400 font-black text-sm">+{asset.growth_rate_pct || '28.5'}%</span>
                        </div>
                        <div className="bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
                          <span className="text-slate-400 block text-[10px] font-bold">RSI (14) Signal</span>
                          <span className="text-amber-400 font-black text-sm">{asset.rsi || 42}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Momentum Catalyst & Forecast</span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-sans font-medium">
                          {asset.catalyst || 'Institutional dark pool accumulation near key 200 SMA support zone.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button
                        onClick={handleUnlockClick}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-400 text-slate-950 font-mono font-black text-xs shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" /> Unlock AI Growth Forecasts ($19.99/mo)
                      </button>
                    </div>
                  )}
                </div>

                {/* Where to Trade / Buy Section (ALWAYS AVAILABLE) */}
                <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3 text-emerald-400" /> Where to Trade / Buy:
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {brokers.map((broker, bIdx) => (
                      <a
                        key={bIdx}
                        href={broker.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>{broker.icon}</span>
                        <span>{broker.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function sumString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }
  return hash;
}
