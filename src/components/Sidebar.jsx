import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  KanbanSquare, 
  BookOpen, 
  Clock, 
  ShieldAlert, 
  Send, 
  Settings,
  Flame,
  Users
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, hotCount = 0 }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Analitika', icon: LayoutDashboard },
    { id: 'simulator', label: 'AI Sotuvchi Chat', icon: MessageSquareCode, badge: 'Live' },
    { id: 'crm', label: 'Mini-CRM Pipeline', icon: KanbanSquare, hotBadge: hotCount },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'followup', label: 'Follow-up Drip', icon: Clock },
    { id: 'guardrails', label: 'AI Guardrails & Qoidalar', icon: ShieldAlert },
    { id: 'telegram', label: 'Telegram Integratsiya', icon: Send },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0c1222]/90 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Asosiy Boshqaruv
          </div>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}

                  {item.hotBadge > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                      <Flame className="w-3 h-3 text-red-400 fill-red-400" />
                      {item.hotBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* USP / Positioning Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/40 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">💡</span>
            <span className="text-xs font-bold text-indigo-300">Asosiy USP:</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            "Yangi mijoz qidirmang. Mavjud leadlarni yo'qotmang va ulardan ko'proq sotuv qiling."
          </p>
        </div>
      </div>

      {/* System info / Footer */}
      <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col gap-1 px-2">
        <div className="flex items-center justify-between">
          <span>AI Engine</span>
          <span className="text-emerald-400 font-semibold">Active (GPT/NLP)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tizim holati</span>
          <span className="text-indigo-400 font-semibold">100% Barqaror</span>
        </div>
      </div>
    </aside>
  );
}
