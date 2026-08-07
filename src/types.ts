export type MarketCategory = 'Crypto' | 'US Stocks' | 'Forex' | 'Indian / Asian Equity' | 'Futures & Commodities';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';
export type TradeVerdict = 'DANGEROUS_MISTAKE' | 'HIGH_RISK_WARNING' | 'NEUTRAL_WAIT' | 'VALID_SETUP_BUY' | 'VALID_SETUP_SELL';

export interface ChartVisionInput {
  imageMimeType: string;
  imageBase64: string;
  marketCategory: MarketCategory;
  timeframe: Timeframe;
  userTradePlan?: string;
  capitalAmount?: number;
  riskTolerancePercent?: number;
}

export interface TradeLevel {
  levelName: string;
  priceLevel: string;
  description: string;
}

export interface MistakePoint {
  title: string;
  description: string;
  severity: 'Critical' | 'Moderate' | 'Minor';
  category: 'FOMO/Chasing' | 'Bad Stop Loss' | 'Over-Leverage' | 'Ignoring Resistance' | 'Counter-Trend';
}

export interface ChartVisionAnalysis {
  verdict: TradeVerdict;
  overallScore: number; // 0 to 100 health score of the trade setup
  headlineBengali: string;
  headlineEnglish: string;
  detectedPattern: string[];
  trendDirection: 'Bullish' | 'Bearish' | 'Sideways / Consolidation' | 'Volatile Breakdown';

  // Specific requested diagnostics:
  mistakesFound: MistakePoint[];
  dangerZoneDescription: string;
  safeZoneDescription: string;

  // Specific levels:
  suggestedEntryPrice: string;
  suggestedStopLoss: string;
  takeProfitTarget1: string;
  takeProfitTarget2: string;
  riskRewardRatio: string;

  // Money & position sizing advice:
  suggestedMaxRiskAmount: string;
  suggestedPositionSize: string;
  recommendedLeverage: string;

  bengaliSummary: string;
  stepByStepCorrection: string[];
  analyzedAt: string;
}

export interface CandleDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi?: number | null;
  macd?: number | null;
  macdSignal?: number | null;
  sma20?: number | null;
  sma50?: number | null;
  sma200?: number | null;
  ema20?: number | null;
}

export interface TickerAnalysisResult {
  ticker: string;
  currentPrice: number;
  priceChange24h: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: 'High' | 'Medium' | 'Low';
  rationaleBengali: string;
  rationaleEnglish: string;
  supportLevel: number;
  resistanceLevel: number;
  rsiValue: number;
  macdState: string;
  trendStatus: string;
  history: CandleDataPoint[];
  suggestedStopLoss: number;
  suggestedTakeProfit: number;
  source: string;
}

export interface TradeRiskInput {
  accountBalance: number;
  riskPercentPerTrade: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  leverage: number;
  tradeDirection: 'Long / Buy' | 'Short / Sell';
}

export interface TradeRiskDiagnosis {
  dollarAmountAtRisk: number;
  maxPositionSize: number;
  maxContractsOrCoins: number;
  potentialProfit: number;
  riskRewardRatio: number;
  isRiskSafe: boolean;
  warningsBengali: string[];
  recommendations: string[];
}

export interface HighGrowthAsset {
  ticker: string;
  name: string;
  market: 'Global' | 'India';
  sector: string;
  is_locked: boolean;
  growth_rate_pct?: number | null;
  rsi?: number | null;
  sentiment?: string;
  trend_confidence?: string;
  catalyst?: string;
  ui_metadata?: {
    icon_class?: string;
    badge_color?: string;
    theme_glow_color?: string;
    chart_gradient_stops?: string[];
  };
  premium_gate_overlay?: {
    text: string;
    live_data_text: string;
    price_usd: number;
    blur_style: string;
    call_to_action_class: string;
  };
}

export interface SmartMoneyFlowItem {
  ticker: string;
  name: string;
  sector: string;
  market: 'Global' | 'India';
  currentPrice: number;
  priceChange24h: number;
  volumeMultiplier: number; // e.g. 3.2x relative to 20-day MA
  activityType: 'Smart Money Accumulation' | 'Institutional Distribution' | 'Whale Buying Surge' | 'Heavy Block Trade';
  heatmapIntensity: 'Extreme' | 'High' | 'Moderate';
  zScore: number;
  rsi: number;
  aiExplanation: string;
  is_locked?: boolean;
}

export interface AiScreenerMatch {
  ticker: string;
  name: string;
  sector: string;
  market: 'Global' | 'India';
  price: number;
  rsi: number;
  volumeMultiplier: number;
  change24h: number;
  aiSummary: string;
  matchScore: number;
}

export interface AiScreenerResponse {
  query: string;
  parsedFilters: {
    sector?: string;
    rsiMax?: number;
    rsiMin?: number;
    minVolumeMultiplier?: number;
    momentum?: string;
  };
  results: AiScreenerMatch[];
  totalMatches: number;
  disclaimer: string;
  freeLimitReached?: boolean;
}

export interface TradeDiagnosticRequest {
  ticker: string;
  entryPrice: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  capital?: number;
  timeframe?: string;
}

export interface TradeDiagnosticResult {
  ticker: string;
  tradeHealthScore: number; // 0 to 100
  isHighRiskWarning: boolean;
  warningMessage: string;
  warningCategory: 'Resistance Proximity' | 'Severe Volatility' | 'Negative Risk-Reward' | 'Overbought FOMO' | 'Safe Setup';
  atrValue: number;
  suggestedStopLoss1to2: number;
  suggestedTakeProfit1to2: number;
  suggestedStopLoss1to3: number;
  suggestedTakeProfit1to3: number;
  riskRewardRatio: number;
  smartMoneySpikeDetected: boolean;
  rsiValue: number;
  macdStatus: string;
  aiDiagnosticRationale: string;
  disclaimer: string;
}

export interface MarketGapsTrends {
  ticker: string;
  recent_gaps: Array<{
    index_position: number;
    gap_type: string;
    gap_percentage: number;
    previous_close: number;
    current_open: number;
  }>;
  macro_trend: string;
  breakout_detected: boolean;
  breakout_direction: string | null;
  disclaimer: string;
}
