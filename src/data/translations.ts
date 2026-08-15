export type Language = 'en';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appTitle: 'AI Trade & Chart Doctor',
    tagline: 'Detect candlestick mistakes, pinpoint danger zones, and trade safely with Gemini AI Vision',
    visionTab: '📸 Vision Chart Doctor',
    screenerTab: '⚡ AI Natural Screener',
    smartMoneyTab: '🐋 Smart Money & Whale Tracker',
    scannerTab: '📊 Live Technical Scanner',
    growthTab: '🔥 55+ High-Growth Assets',
    riskTab: '🛡️ Risk & Position Calculator',
    guideTab: '📖 Candlestick Pattern Guide',
    sampleChartsLabel: 'Preset Sample Charts:',
    uploadChart: 'Upload Chart Image',
    presetCharts: 'Or select a preset chart sample',
    marketCategory: 'Market Category',
    timeframe: 'Timeframe',
    capital: 'Account Capital ($USD)',
    riskTolerance: 'Risk Per Trade (%)',
    plannedTrade: 'Your Planned Action or Thoughts',
    analyzeButton: '🩺 Diagnose Chart Mistakes Now',
    analyzing: 'Google Gemini Scanning Chart...',
    verdictTitle: 'Diagnostic Verdict Report',
    dangerZone: 'Danger Zone Analysis',
    safeZone: 'Recommended Safe Entry Zone',
    suggestedLevels: 'Suggested Technical Levels',
    stepByStepCorrection: 'Step-by-step Trade Correction Plan',
    disclaimerText: 'For educational purposes only. Not financial advice. Always manage your risk.',
    unlockPaywall: 'Unlock 55+ Pro Signals ($19.99/mo)',
    selectLanguage: 'Language',
    liveTickerTitle: 'Live Market Dynamic Stream:',
  },
};
