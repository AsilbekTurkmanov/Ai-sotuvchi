import React from 'react';
import { Bot, Bell, ShieldCheck, Zap, Sparkles, Send, Menu, X } from 'lucide-react';

export default function Navbar({ botStatus, activeTab, setActiveTab, unreadCount, isMobileMenuOpen, setIsMobileMenuOpen }) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-all"
          aria-label="Menyu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 shrink-0">
            <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="font-bold text-base md:text-lg text-white tracking-tight leading-none">AI Sotuvchi</span>
              <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-1.5 md:px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                SaaS 1.0
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">Avtonom Savdo & CRM Tizimi</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Live Bot Status Badge */}
        <button
          onClick={() => setActiveTab('telegram')}
          className={`flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-xl border text-[11px] md:text-xs font-medium transition-all ${
            botStatus.isRunning
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${botStatus.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="hidden sm:inline">Telegram Bot:</span>
          <span>{botStatus.isRunning ? 'FAOL' : 'To\'xtatilgan'}</span>
        </button>

        {/* Quick Simulator CTA */}
        <button
          onClick={() => setActiveTab('simulator')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] md:text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">AI Sinov Chat</span>
        </button>

        {/* Manager Profile */}
        <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
            AV
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className="font-semibold text-slate-200">Ali Valiyev</div>
            <div className="text-[10px] text-slate-400">Katta Sotuvchi</div>
          </div>
        </div>
      </div>
    </header>
  );
}
