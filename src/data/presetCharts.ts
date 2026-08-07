import { MarketCategory, Timeframe } from '../types';

export interface PresetChart {
  id: string;
  titleBengali: string;
  titleEnglish: string;
  descriptionBengali: string;
  marketCategory: MarketCategory;
  timeframe: Timeframe;
  userPlan: string;
  // SVG placeholder or base64 data for visual representation
  svgPlaceholder: string;
  defaultTextData: string;
}

// Generate high quality inline SVG charts as Data URLs
const generateChartSvgDataUrl = (type: 'fomo_top' | 'head_shoulders' | 'bull_flag' | 'double_bottom') => {
  let paths = '';
  let labels = '';

  if (type === 'fomo_top') {
    paths = `
      <!-- Support line -->
      <line x1="20" y1="220" x2="380" y2="220" stroke="#334155" stroke-dasharray="4 4" stroke-width="1.5" />
      <text x="25" y="215" fill="#64748b" font-size="10">Support ($100)</text>

      <!-- Resistance line -->
      <line x1="20" y1="80" x2="380" y2="80" stroke="#f43f5e" stroke-dasharray="4 4" stroke-width="1.5" />
      <text x="25" y="75" fill="#f43f5e" font-size="10">Major Resistance ($150)</text>

      <!-- Green breakout candle going straight into resistance -->
      <rect x="50" y="180" width="12" height="35" fill="#10b981" />
      <line x1="56" y1="170" x2="56" y2="220" stroke="#10b981" stroke-width="1.5" />

      <rect x="80" y="150" width="12" height="35" fill="#10b981" />
      <line x1="86" y1="140" x2="86" y2="190" stroke="#10b981" stroke-width="1.5" />

      <rect x="110" y="110" width="12" height="45" fill="#10b981" />
      <line x1="116" y1="95" x2="116" y2="160" stroke="#10b981" stroke-width="1.5" />

      <!-- Massive Green Candle piercing resistance top -->
      <rect x="140" y="60" width="16" height="60" fill="#10b981" />
      <line x1="148" y1="45" x2="148" y2="125" stroke="#10b981" stroke-width="2" />

      <!-- High Risk Entry Warning Box -->
      <rect x="130" y="25" width="110" height="22" rx="4" fill="#f43f5e" fill-opacity="0.2" stroke="#f43f5e" />
      <text x="135" y="40" fill="#fecdd3" font-size="10" font-weight="bold">❌ FOMO Entry Here!</text>

      <!-- Massive Red Dump Candlesticks -->
      <rect x="170" y="65" width="14" height="75" fill="#ef4444" />
      <line x1="177" y1="55" x2="177" y2="145" stroke="#ef4444" stroke-width="2" />

      <rect x="200" y="130" width="14" height="65" fill="#ef4444" />
      <line x1="207" y1="120" x2="207" y2="200" stroke="#ef4444" stroke-width="2" />

      <rect x="230" y="180" width="14" height="50" fill="#ef4444" />
      <line x1="237" y1="170" x2="237" y2="235" stroke="#ef4444" stroke-width="2" />
    `;
  } else if (type === 'head_shoulders') {
    paths = `
      <!-- Neckline -->
      <line x1="30" y1="180" x2="350" y2="180" stroke="#f59e0b" stroke-width="2" />
      <text x="35" y="175" fill="#f59e0b" font-size="10" font-weight="bold">Neckline ($240)</text>

      <!-- Left Shoulder -->
      <polyline points="40,180 80,120 120,180" fill="none" stroke="#38bdf8" stroke-width="2" />
      <text x="65" y="110" fill="#38bdf8" font-size="10">Left Shoulder</text>

      <!-- Head -->
      <polyline points="120,180 180,60 240,180" fill="none" stroke="#f43f5e" stroke-width="2.5" />
      <text x="165" y="50" fill="#f43f5e" font-size="11" font-weight="bold">Head Peak</text>

      <!-- Right Shoulder -->
      <polyline points="240,180 280,130 310,180" fill="none" stroke="#38bdf8" stroke-width="2" />
      <text x="260" y="120" fill="#38bdf8" font-size="10">Right Shoulder</text>

      <!-- Breakdown Arrow -->
      <line x1="310" y1="180" x2="350" y2="240" stroke="#ef4444" stroke-width="3" marker-end="url(#arrow)" />
      <text x="320" y="220" fill="#ef4444" font-size="10" font-weight="bold">Breakdown Zone!</text>
    `;
  } else {
    // Bull Flag / Double Bottom
    paths = `
      <!-- Double Bottom W pattern -->
      <polyline points="30,80 80,220 130,140 180,220 230,80 350,50" fill="none" stroke="#10b981" stroke-width="3" />

      <circle cx="80" cy="220" r="6" fill="#10b981" />
      <text x="50" y="238" fill="#10b981" font-size="10">Bottom 1 ($85)</text>

      <circle cx="180" cy="220" r="6" fill="#10b981" />
      <text x="155" y="238" fill="#10b981" font-size="10">Bottom 2 ($85)</text>

      <!-- Neckline breakout -->
      <line x1="30" y1="140" x2="350" y2="140" stroke="#0ea5e9" stroke-dasharray="4 4" stroke-width="1.5" />
      <text x="240" y="132" fill="#0ea5e9" font-size="10" font-weight="bold">Safe Buy Entry ($105)</text>
    `;
  }

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260" style="background:#090d16;">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#090d16" />
      <rect width="100%" height="100%" fill="url(#grid)" />
      ${paths}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

export const PRESET_CHARTS: PresetChart[] = [
  {
    id: 'fomo_top_chase',
    titleBengali: 'রেজিস্ট্যান্সের শীর্ষে FOMO বাই এন্ট্রি (মারাত্মক ভুল)',
    titleEnglish: 'FOMO Buy Entry at Major Resistance Top',
    descriptionBengali: 'টানা ৪টি বিশাল সবুজ ক্যান্ডেল দেখে রেজিস্ট্যান্স লেভেলের ঠিক মাথায় ট্রেডার বাই নিয়ে ফেলেছে। খুব শীঘ্রই রিভার্সাল ডাম্পের ঝুঁকি।',
    marketCategory: 'Crypto',
    timeframe: '15m',
    userPlan: 'I saw 4 big green candles pumping hard, so I entered a 10x Long position near $150 thinking it would break out to $200. My stop loss is at $148.',
    svgPlaceholder: generateChartSvgDataUrl('fomo_top'),
    defaultTextData: 'FOMO Buy at Resistance Peak ($150)',
  },
  {
    id: 'head_shoulders_breakdown',
    titleBengali: 'হেড অ্যান্ড শোল্ডার নেকলাইন ব্রেকডাউন (বিয়ারিশ)',
    titleEnglish: 'Head & Shoulders Neckline Breakdown',
    descriptionBengali: 'চার্টে স্পষ্ট Head and Shoulders প্যাটার্ন তৈরি হয়েছে এবং নেকলাইন সাপোর্ট ($240) ভাঙার মুখে। ভুল করে বাই করলে বড় লস হতে পারে।',
    marketCategory: 'US Stocks',
    timeframe: '1h',
    userPlan: 'Price dropped to $240. I want to buy the dip expecting it to rebound to $280.',
    svgPlaceholder: generateChartSvgDataUrl('head_shoulders'),
    defaultTextData: 'Head & Shoulders Pattern at $240 Neckline',
  },
  {
    id: 'double_bottom_safe',
    titleBengali: 'ডাবল বটম রিভার্সাল (নিরাপদ বাই সেটআপ)',
    titleEnglish: 'Double Bottom (W Pattern) Reversal Setup',
    descriptionBengali: 'মূল্য $85 লেভেলে দুইবার সাপোর্ট নিয়ে সুন্দর W প্যাটার্ন তৈরি করেছে। $105 নেকলাইন পার হলে টেকনিক্যালি নিরাপদ বাই এন্ট্রি পাওয়া যায়।',
    marketCategory: 'Crypto',
    timeframe: '4h',
    userPlan: 'I am planning to buy at $106 after neckline confirmation with stop loss at $95.',
    svgPlaceholder: generateChartSvgDataUrl('double_bottom'),
    defaultTextData: 'Double Bottom Reversal Pattern at $85 Support',
  },
];
