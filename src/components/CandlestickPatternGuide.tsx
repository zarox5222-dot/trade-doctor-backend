import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PatternItem {
  id: string;
  nameBengali: string;
  nameEnglish: string;
  category: 'Reversal' | 'Continuation' | 'Chart Formation';
  type: 'Bullish' | 'Bearish' | 'Neutral';
  descriptionBengali: string;
  keyConfirmationBengali: string;
  commonMistakeBengali: string;
}

const PATTERNS: PatternItem[] = [
  {
    id: 'bullish_engulfing',
    nameBengali: 'বুলিশ এনগালফিং (Bullish Engulfing)',
    nameEnglish: 'Bullish Engulfing',
    category: 'Reversal',
    type: 'Bullish',
    descriptionBengali: 'একটি ছোট লাল ক্যান্ডেলকে পরবর্তী একটি বড় সবুজ ক্যান্ডেল পুরোপুরি ঢেকে ফেলে। এটি ডাউনট্রেন্ড শেষে শক্তিশালী মার্কেট রিভার্সাল বা বাইয়ারদের প্রবেশের সংকেত দেয়।',
    keyConfirmationBengali: 'অবশ্যই গুরুত্বপূর্ণ সাপোর্ট লেভেল বা ডিমান্ড জোনে তৈরি হতে হবে। ভলিউম বৃদ্ধি পাওয়া একটি গুরুত্বপূর্ণ কনফার্মেশন।',
    commonMistakeBengali: 'রেজিস্ট্যান্সের মাথায় এনগালফিং দেখে বাই করা মারাত্মক ভুল। শুধু বটম বা সাপোর্টে থাকলে কার্যকরী।',
  },
  {
    id: 'bearish_engulfing',
    nameBengali: 'বিয়ারিশ এনগালফিং (Bearish Engulfing)',
    nameEnglish: 'Bearish Engulfing',
    category: 'Reversal',
    type: 'Bearish',
    descriptionBengali: 'একটি ছোট সবুজ ক্যান্ডেলকে পরবর্তী একটি বড় লাল ক্যান্ডেল সম্পূর্ণ গ্রাস বা ঢেকে ফেলে। এটি আপট্রেন্ড শেষে সেলারদের শক্তিশালী নিয়ন্ত্রণের সংকেত দেয়।',
    keyConfirmationBengali: 'মেজর রেজিস্ট্যান্স বা সাপ্লাই জোনে তৈরি হতে হবে।',
    commonMistakeBengali: 'ডাউনট্রেন্ডের একদম নিচে এটি দেখে শর্ট করলে ট্র্যাপে পড়ার আশঙ্কা থাকে।',
  },
  {
    id: 'hammer_candlestick',
    nameBengali: 'হ্যামার ক্যান্ডেলস্টিক (Hammer)',
    nameEnglish: 'Hammer Candlestick',
    category: 'Reversal',
    type: 'Bullish',
    descriptionBengali: 'ছোট বডি এবং নিচে দীর্ঘ শ্যাডো/উইক (বডির অন্তত ২ গুণ)। নির্দেশ করে যে দাম অনেক নিচে নামলেও সেলারদের হটিয়ে বাইয়াররা দাম আবার উপরে তুলে এনেছে।',
    keyConfirmationBengali: 'পরবর্তী ক্যান্ডেলটি সবুজ হয়ে হ্যামারের উঁচুকে অতিক্রম করতে হবে।',
    commonMistakeBengali: 'কনফার্মেশন ক্যান্ডেল না দেখেই তাড়াহুড়ো করে এন্ট্রি নেওয়া।',
  },
  {
    id: 'shooting_star',
    nameBengali: 'শুটিং স্টার (Shooting Star)',
    nameEnglish: 'Shooting Star',
    category: 'Reversal',
    type: 'Bearish',
    descriptionBengali: 'ছোট বডি এবং উপরে দীর্ঘ উইক/শ্যাডো। আপট্রেন্ডের শিখরে এটি তৈরি হলে বিয়ারিশ রিভার্সালের সংকেত দেয়।',
    keyConfirmationBengali: 'পরবর্তী ক্যান্ডেলটি বিয়ারিশ (লাল) ক্যান্ডেল হতে হবে।',
    commonMistakeBengali: 'মার্কেটের মাঝখানে এটিকে পাত্তা দেওয়া; এটি শুধুমাত্র রেজিস্ট্যান্সের চুড়ায় কার্যকর।',
  },
  {
    id: 'head_shoulders',
    nameBengali: 'হেড অ্যান্ড শোল্ডার (Head and Shoulders)',
    nameEnglish: 'Head & Shoulders Formation',
    category: 'Chart Formation',
    type: 'Bearish',
    descriptionBengali: 'তিনটি শিখর তৈরি হয়—মাঝেরটি সবচেয়ে উঁচুতে (Head) এবং দুইপাশের দুটি সমান উচ্চতায় (Shoulders)। নেকলাইন ভাঙলে বড় ধরণের পতন ঘটতে পারে।',
    keyConfirmationBengali: 'নেকলাইন (Neckline) সাপোর্ট লেভেল রিটেস্ট বা ভলিউমসহ ব্রেকডাউন।',
    commonMistakeBengali: 'নেকলাইন ব্রেক হওয়ার আগেই বাই অর্ডার ধরে রাখা।',
  },
  {
    id: 'double_bottom',
    nameBengali: 'ডাবল বটম বা ডাব্লু প্যাটার্ন (Double Bottom W)',
    nameEnglish: 'Double Bottom (W Pattern)',
    category: 'Chart Formation',
    type: 'Bullish',
    descriptionBengali: 'একই সাপোর্ট লেভেলে পর পর দুইটি সর্বনিম্ন বিন্দু স্পর্শ করে W এর মতো রূপ নেয়। এটি একটি ক্লাসিক বুলিশ ট্রেন্ড রিভার্সাল প্যাটার্ন।',
    keyConfirmationBengali: 'মাঝখানের পিক বা নেকলাইন ব্রেকআউট হওয়া পর্যন্ত অপেক্ষা করা।',
    commonMistakeBengali: 'দ্বিতীয় বটম স্পর্শ করার সাথে সাথে কনফার্মেশন ছাড়াই জাম্প করা।',
  },
];

export const CandlestickPatternGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Bullish' | 'Bearish'>('All');

  const filteredPatterns = PATTERNS.filter((p) => {
    const matchesSearch =
      p.nameBengali.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || p.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              ক্যান্ডেলস্টিক ও টেকনিক্যাল প্যাটার্ন ডিকশনারি
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              ক্যান্ডেলস্টিকের ধরণ জানুন এবং ভুল ট্রেড থেকে নিজেকে রক্ষা করুন
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {(['All', 'Bullish', 'Bearish'] as const).map((flt) => (
              <button
                key={flt}
                onClick={() => setSelectedFilter(flt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  selectedFilter === flt
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {flt === 'All' ? 'সবগুলো' : flt === 'Bullish' ? '🟢 বুলিশ' : '🔴 বিয়ারিশ'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="প্যাটার্ন খুঁজুন (যেমন: Engulfing, Hammer, Head and Shoulders)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium shadow-inner"
          />
        </div>
      </div>

      {/* Pattern Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPatterns.map((pattern) => (
          <div key={pattern.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">{pattern.nameBengali}</h3>
                <span className="text-[11px] text-slate-500 font-mono font-bold">{pattern.nameEnglish}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                pattern.type === 'Bullish'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {pattern.type}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {pattern.descriptionBengali}
            </p>

            <div className="space-y-2 text-xs">
              <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-800 block mb-0.5">কী কনফার্মেশন:</span>
                  <span className="text-slate-700 font-medium">{pattern.keyConfirmationBengali}</span>
                </div>
              </div>

              <div className="bg-rose-50/80 border border-rose-200 p-3 rounded-2xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-800 block mb-0.5">সবচেয়ে সাধারণ ভুল:</span>
                  <span className="text-slate-700 font-medium">{pattern.commonMistakeBengali}</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Top Trading Rules Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          পেশাদার ট্রেডারদের সুবর্ণ নিয়মাবলী (Golden Rules for Trading Success)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-emerald-700 block">১. স্টপ লস ছাড়া কখনই ট্রেড নয়</span>
            <p className="text-slate-600 leading-relaxed font-medium">
              স্টপ লস আপনার ট্রেডিং লাইফ ইনস্যুরেন্স। যেকোনো টেকনিক্যালি সঠিক ট্রেডেও হঠাৎ বাজে নিউজ প্রাইজ ক্র্যাশ ঘটাতে পারে।
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-amber-800 block">২. FOMO বাই এড়িয়ে চলুন</span>
            <p className="text-slate-600 leading-relaxed font-medium">
              টানা ৪-৫টি সবুজ ক্যান্ডেল উঠে যাওয়ার পর বাই করবেন না। দাম সবসময় পুলব্যাক করে সাপোর্টে আসে, তখন রিটেস্টে বাই নিন।
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-cyan-700 block">৩. রিভেঞ্জ ট্রেডিং পরিহার করুন</span>
            <p className="text-slate-600 leading-relaxed font-medium">
              একটি ট্রেড লস হলে তৎক্ষণাৎ বড় লিভারেজ নিয়ে লস উসুলের চেষ্টা করবেন না। মাথা ঠাণ্ডা রেখে আবার ভালো সেটআপ খুঁজুন।
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
