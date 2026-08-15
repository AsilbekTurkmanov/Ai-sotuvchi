import React from 'react';
import { Bot, Bell, ShieldCheck, Zap, Sparkles, Send } from 'lucide-react';

export default function Navbar({ botStatus, activeTab, setActiveTab, unreadCount, onTestAlert }) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">AI Sotuvchi</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                SaaS MVP 1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Avtonom Savdo & CRM Tizimi</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Bot Status Badge */}
        <button
          onClick={() => setActiveTab('telegram')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            botStatus.isRunning
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 badge-glow-green hover:bg-emerald-500/20'
              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${botStatus.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span>Telegram Bot: {botStatus.isRunning ? 'FAOL (Online)' : 'To\'xtatilgan'}</span>
        </button>

        {/* Quick Simulator CTA */}
        <button
          onClick={() => setActiveTab('simulator')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Sinov Chat</span>
        </button>

        {/* Manager Profile & Quick Hot Lead Test */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-300">
            AV
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-slate-200">Ali Valiyev</div>
            <div className="text-[10px] text-slate-400">Katta Sotuvchi (Menejer)</div>
          </div>
        </div>
      </div>
    </header>
  );
}
