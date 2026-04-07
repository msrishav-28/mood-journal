import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

const INSIGHTS = [
  {
    type: 'proactive',
    icon: Sparkles,
    title: 'Pattern Noticed',
    message: "You've used \"overwhelmed\" 4 times this week — up from once last week. Your longest entries happen on Thursdays.",
    color: 'bg-surface border-canvas-alt text-text-main',
    iconBg: 'bg-canvas-alt',
    iconColor: 'text-text-main'
  },
  {
    type: 'positive',
    icon: TrendingUp,
    title: 'Mood Improvement',
    message: "3 of your 5 calm entries this month were recorded before 9 AM.",
    color: 'bg-[var(--color-emo-calm-bg)] border-transparent text-[var(--color-emo-calm-txt)]',
    iconBg: 'bg-white',
    iconColor: 'text-[var(--color-emo-calm-txt)]'
  }
];

export default function Insights() {
  return (
    <div className="flex flex-col h-full bg-canvas text-text-main font-sans pt-4 gap-8 pb-10">
      <header>
        <h1 className="font-serif text-3xl font-medium text-text-main mb-2">Insights</h1>
        <p className="text-text-muted">AI-powered reflections on your week.</p>
      </header>

      {/* The Mood Arc Graph */}
      <section className="bg-surface rounded-3xl p-6 border border-canvas-alt shadow-soft">
        <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-6">Mood arc · Apr 1–7</div>
        <div className="w-full mt-2">
          <svg width="100%" viewBox="0 0 310 75" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
            <defs>
              <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--color-emo-calm)" stop-opacity=".18"/>
                <stop offset="100%" stop-color="var(--color-emo-calm)" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path d="M22,38 C55,36 66,54 88,54 C110,54 132,14 154,12 C176,12 198,10 220,16 C242,16 264,34 286,58 L286,75 L22,75 Z" fill="url(#mg)"/>
            <path d="M22,38 C55,36 66,54 88,54 C110,54 132,14 154,12 C176,12 198,10 220,16 C242,16 264,34 286,58" stroke="var(--color-emo-calm)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="22" cy="38" r="4" fill="var(--color-emo-grat)" className="hover:r-[6px] transition-all cursor-pointer"/>
            <circle cx="88" cy="54" r="4" fill="var(--color-emo-frust)" className="hover:r-[6px] transition-all cursor-pointer"/>
            <circle cx="154" cy="12" r="4" fill="var(--color-emo-calm)" className="hover:r-[6px] transition-all cursor-pointer"/>
            <circle cx="220" cy="16" r="5" fill="var(--color-emo-joy)" className="hover:r-[6px] transition-all cursor-pointer"/>
            <circle cx="286" cy="58" r="4" fill="var(--color-emo-anx)" className="hover:r-[6px] transition-all cursor-pointer"/>
            
            <text x="22" y="72" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)" className="font-sans uppercase">Tue</text>
            <text x="88" y="72" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)" className="font-sans uppercase">Thu</text>
            <text x="154" y="72" textAnchor="middle" fontSize="9" fill="var(--color-text-main)" className="font-sans uppercase font-bold">Fri</text>
            <text x="220" y="72" textAnchor="middle" fontSize="9" fill="var(--color-text-main)" className="font-sans uppercase font-bold">Sat</text>
            <text x="286" y="72" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)" className="font-sans uppercase">Mon</text>
          </svg>
        </div>
      </section>

      <section>
        <h2 className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-4">AI Noticed</h2>
        <div className="flex flex-col gap-4">
          {INSIGHTS.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-3xl border shadow-sm ${insight.color} relative overflow-hidden`}
              >
                <div className="flex gap-4 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${insight.iconBg} ${insight.iconColor}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                    <p className="text-xs leading-relaxed opacity-90">{insight.message}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="bg-surface rounded-3xl p-6 border border-canvas-alt shadow-soft">
        <h3 className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-5">This week's emotions</h3>
        
        <div className="flex items-center gap-4 mb-4 text-xs font-medium">
          <div className="w-16 text-right text-text-muted">Calm</div>
          <div className="flex-1 h-1.5 bg-canvas rounded-full overflow-hidden">
             <div className="h-full bg-[var(--color-emo-calm)] rounded-full" style={{ width: '45%' }}></div>
          </div>
          <div className="w-8 text-text-muted">45%</div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-xs font-medium">
          <div className="w-16 text-right text-text-muted">Anxious</div>
          <div className="flex-1 h-1.5 bg-canvas rounded-full overflow-hidden">
             <div className="h-full bg-[var(--color-emo-anx)] rounded-full" style={{ width: '20%' }}></div>
          </div>
          <div className="w-8 text-text-muted">20%</div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-xs font-medium">
          <div className="w-16 text-right text-text-muted">Joy</div>
          <div className="flex-1 h-1.5 bg-canvas rounded-full overflow-hidden">
             <div className="h-full bg-[var(--color-emo-joy)] rounded-full" style={{ width: '18%' }}></div>
          </div>
          <div className="w-8 text-text-muted">18%</div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="w-16 text-right text-text-muted">Grateful</div>
          <div className="flex-1 h-1.5 bg-canvas rounded-full overflow-hidden">
             <div className="h-full bg-[var(--color-emo-grat)] rounded-full" style={{ width: '12%' }}></div>
          </div>
          <div className="w-8 text-text-muted">12%</div>
        </div>
      </section>
      
    </div>
  );
}
