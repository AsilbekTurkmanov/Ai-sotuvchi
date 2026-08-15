import React from 'react';
import { 
  Users, 
  Bot, 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  ArrowUpRight, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Sparkles
} from 'lucide-react';

export default function DashboardView({ dashboardData, onOpenLead, setActiveTab }) {
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Dashboard yuklanmoqda...
      </div>
    );
  }

  const metrics = dashboardData.metrics || {
    totalLeads: 24, hotLeads: 5, warmLeads: 11, wonLeads: 6, lostLeads: 2, totalWonRevenue: 75000000, conversionRate: "25.0", todayAiHandled: 42, todayHandoffs: 3, avgResponseTimeSec: 1.4
  };
  const funnel = dashboardData.funnel || [];
  const channelBreakdown = dashboardData.channelBreakdown || { telegram: 72, instagram: 18, webChat: 10 };
  const recentHotLeads = dashboardData.recentHotLeads || [];
  const topProducts = dashboardData.topProducts || [];

  const formatPrice = (num) => new Intl.NumberFormat('uz-UZ').format(num || 0);

  const kpis = [
    {
      title: "Jami Leadlar",
      value: metrics.totalLeads,
      sub: "Barcha kanallardan kelgan",
      icon: Users,
      color: "from-blue-600/20 to-indigo-600/20",
      border: "border-blue-500/30",
      iconColor: "text-blue-400"
    },
    {
      title: "AI Javob Bergan",
      value: `${metrics.todayAiHandled} ta`,
      sub: "O'rtacha tezlik: 1.2 soniya",
      icon: Bot,
      color: "from-indigo-600/20 to-purple-600/20",
      border: "border-indigo-500/30",
      iconColor: "text-indigo-400"
    },
    {
      title: "🔥 Hot Leads",
      value: metrics.hotLeads,
      sub: "Zudlik bilan aloqa kerak",
      icon: Flame,
      color: "from-red-600/20 to-orange-600/20",
      border: "border-red-500/40",
      iconColor: "text-red-400",
      badge: "Eng muhim",
      badgeGlow: true
    },
    {
      title: "Muvaffaqiyatli Sotuv",
      value: `${metrics.wonLeads} ta`,
      sub: `Konversiya: ${metrics.conversionRate}%`,
      icon: CheckCircle2,
      color: "from-emerald-600/20 to-teal-600/20",
      border: "border-emerald-500/30",
      iconColor: "text-emerald-400"
    },
    {
      title: "Jami Tushum",
      value: `${formatPrice(metrics.totalWonRevenue || metrics.todayRevenue)} UZS`,
      sub: "AI orqali yopilgan bitimlar",
      icon: TrendingUp,
      color: "from-amber-600/20 to-emerald-600/20",
      border: "border-amber-500/30",
      iconColor: "text-amber-400"
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Value Prop */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/70 border border-indigo-500/30 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Jonli Statistika
              </span>
              <span className="text-xs text-slate-400">Bugungi kun hisoboti</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              AI Sotuvchi Boshqaruv Markazi
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              AI bugun <b>{metrics.todayAiHandled} ta</b> mijoz bilan suhbatlashdi, <b>{metrics.hotLeads} ta</b> issiq xaridorni topdi va <b>{metrics.wonLeads} ta</b> sotuvga olib keldi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Chatni Sinash</span>
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium flex items-center gap-2 transition-all"
            >
              <span>CRM Kanbanga O'tish</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className={`glass-panel rounded-2xl p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border ${kpi.border} ${kpi.badgeGlow ? 'badge-glow-hot' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{kpi.title}</span>
                <div className={`p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 ${kpi.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-white tracking-tight mb-1">
                {kpi.value}
              </div>
              <div className="text-[11px] text-slate-400">
                {kpi.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Funnel / Konversiya Voronkasi */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Sotuv Konversiya Voronkasi (Funnel)
              </h2>
              <p className="text-xs text-slate-400">Birinchi xabardan to muvaffaqiyatli to'lovgacha</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              Konversiya: {metrics.conversionRate}%
            </span>
          </div>

          <div className="space-y-4">
            {funnel.map((item, idx) => {
              const bgGradients = [
                "from-blue-600 to-indigo-600",
                "from-indigo-600 to-purple-600",
                "from-purple-600 to-pink-600",
                "from-orange-500 to-red-500",
                "from-emerald-500 to-teal-500"
              ];
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{item.stage}</span>
                    <span className="font-bold text-white">
                      {item.count} ta <span className="text-slate-400 font-normal">({item.percent}%)</span>
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${bgGradients[idx % bgGradients.length]} transition-all duration-1000`}
                      style={{ width: `${Math.max(6, item.percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-4 text-center">
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="text-[11px] text-slate-400">Javobsiz Qolganlar</div>
              <div className="text-sm font-bold text-emerald-400">0 ta (0%)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="text-[11px] text-slate-400">O'rtacha Javob</div>
              <div className="text-sm font-bold text-indigo-300">1.2 soniya</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="text-[11px] text-slate-400">Sotuvchiga Topshirildi</div>
              <div className="text-sm font-bold text-red-400">{metrics.todayHandoffs || metrics.hotLeads} ta</div>
            </div>
          </div>
        </div>

        {/* Kanallar Taqsimoti (Channel Distribution) */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Muloqot Kanallari</h2>
            <p className="text-xs text-slate-400 mb-6">Mijozlar qayerdan yozmoqda</p>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    TG
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Telegram Bot & Chat</div>
                    <div className="text-[10px] text-slate-400">Asosiy savdo kanali</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{channelBreakdown.telegram}%</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">+18% o'sish</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                    IG
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Instagram Direct</div>
                    <div className="text-[10px] text-slate-400">Reklama oqimi</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{channelBreakdown.instagram}%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Faol</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    WA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">WhatsApp Business</div>
                    <div className="text-[10px] text-slate-400">To'g'ridan-to'g'ri</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{channelBreakdown.whatsapp}%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Faol</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('telegram')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <span>Bot sozlamalarini boshqarish</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hot Leads Real-time Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
              <Flame className="w-5 h-5 fill-red-400 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">🔥 Zudlik bilan bog'lanish kerak bo'lgan HOT LEADLAR</h2>
              <p className="text-xs text-slate-400">AI tomonidan aniqlangan va sotib olishga tayyor mijozlar</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('crm')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Barchasini ko'rish ({metrics.hotLeads}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Mijoz</th>
                <th className="pb-3 font-semibold">Kanal</th>
                <th className="pb-3 font-semibold">Mahsulot</th>
                <th className="pb-3 font-semibold">Qiymat</th>
                <th className="pb-3 font-semibold">Oxirgi xabar</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold text-right">Harakat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentHotLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-500">
                    Hozirda yangi hot leadlar yo'q
                  </td>
                </tr>
              ) : (
                recentHotLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pr-3">
                      <div className="font-bold text-white">{lead.name}</div>
                      <div className="text-[11px] text-slate-400">{lead.phone || lead.username}</div>
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                        {lead.channel}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 font-medium text-slate-200">
                      {lead.interestProduct}
                    </td>
                    <td className="py-3.5 pr-3 font-bold text-emerald-400">
                      {formatPrice(lead.productPrice)} UZS
                    </td>
                    <td className="py-3.5 pr-3 text-slate-300 max-w-xs truncate">
                      "{lead.lastMessage}"
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                        {lead.score}/100 🔥
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onOpenLead(lead)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:scale-105"
                      >
                        Bog'lanish
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
