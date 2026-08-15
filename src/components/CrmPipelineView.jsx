import React, { useState } from 'react';
import { 
  KanbanSquare, 
  Plus, 
  Search, 
  Filter, 
  Flame, 
  Phone, 
  MessageSquare, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck,
  ChevronRight,
  ExternalLink,
  DollarSign
} from 'lucide-react';

const COLUMNS = [
  { id: 'new', title: 'Yangi Leadlar', color: 'border-slate-600 bg-slate-800/30 text-slate-300', dot: 'bg-slate-400' },
  { id: 'contacted', title: 'Aloqada (AI)', color: 'border-blue-500/40 bg-blue-500/5 text-blue-300', dot: 'bg-blue-400' },
  { id: 'interested', title: 'Qiziqmoqda (Warm)', color: 'border-amber-500/40 bg-amber-500/5 text-amber-300', dot: 'bg-amber-400' },
  { id: 'hot', title: '🔥 Hot Lead (Tayyor)', color: 'border-red-500/50 bg-red-500/10 text-red-300', dot: 'bg-red-400', isHot: true },
  { id: 'won', title: '🎉 Yutildi (Sotildi)', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300', dot: 'bg-emerald-400' },
  { id: 'lost', title: 'Yo\'qotildi', color: 'border-rose-950 bg-rose-950/20 text-rose-400', dot: 'bg-rose-600' },
];

export default function CrmPipelineView({ leads, onOpenLead, onUpdateLeadStatus, onAddNewLead }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    name: "",
    phone: "+998 ",
    username: "@",
    channel: "Telegram",
    interestProduct: "iPhone 15 Pro 256GB",
    productPrice: 12500000,
    status: "new",
    assignedManager: "Ali Valiyev",
    notes: ""
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchQuery)) ||
      (lead.username && lead.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.interestProduct && lead.interestProduct.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesChannel = selectedChannel === "all" || lead.channel.toLowerCase() === selectedChannel.toLowerCase();

    return matchesSearch && matchesChannel;
  });

  const handleCreateLead = (e) => {
    e.preventDefault();
    onAddNewLead(newLeadData);
    setShowAddModal(false);
    setNewLeadData({
      name: "",
      phone: "+998 ",
      username: "@",
      channel: "Telegram",
      interestProduct: "iPhone 15 Pro 256GB",
      productPrice: 12500000,
      status: "new",
      assignedManager: "Ali Valiyev",
      notes: ""
    });
  };

  const formatPrice = (num) => new Intl.NumberFormat('uz-UZ').format(num || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Mini-CRM
            </span>
            <h1 className="text-xl font-extrabold text-white">Savdo Pipeline (Kanban Doskasi)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Barcha kelib tushgan leadlarni bosqichlar bo'yicha boshqaring va sotuvga aylantiring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mijoz, telefon yoki mahsulot..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-52 transition-all"
            />
          </div>

          {/* Channel Filter */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Barcha kanallar</option>
            <option value="telegram">Telegram</option>
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
          </select>

          {/* Add Lead CTA */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Lead Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="flex md:grid md:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto snap-x snap-mandatory min-h-[550px] pb-6 scrollbar-thin">
        {COLUMNS.map((col) => {
          const colLeads = filteredLeads.filter(l => l.status === col.id);
          const colTotalSum = colLeads.reduce((s, l) => s + (l.productPrice || 0), 0);

          return (
            <div
              key={col.id}
              className={`rounded-2xl p-3 border flex flex-col min-h-[500px] min-w-[280px] md:min-w-0 snap-center ${col.color} backdrop-blur-md shrink-0 md:shrink`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dot} ${col.isHot ? 'animate-ping' : ''}`} />
                  <span className="text-xs font-bold text-slate-200 tracking-tight">{col.title}</span>
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                  {colLeads.length}
                </span>
              </div>

              {/* Column Total Sum if applicable */}
              {colTotalSum > 0 && (
                <div className="text-[10px] text-slate-400 mb-2 px-1 flex justify-between font-mono">
                  <span>Jami:</span>
                  <span className="font-bold text-slate-200">{formatPrice(colTotalSum)} UZS</span>
                </div>
              )}

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[620px] pr-1">
                {colLeads.length === 0 ? (
                  <div className="h-32 rounded-xl border border-dashed border-slate-700/60 flex items-center justify-center text-[11px] text-slate-500">
                    Leadlar yo'q
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => onOpenLead(lead)}
                      className={`glass-card rounded-xl p-3 cursor-pointer border transition-all duration-200 hover:scale-[1.02] hover:border-indigo-500/50 hover:shadow-lg ${
                        lead.status === 'hot' ? 'border-red-500/40 bg-red-950/10' : 'border-slate-700/60'
                      }`}
                    >
                      {/* Top row: Name & Badge */}
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <div className="font-bold text-xs text-white truncate max-w-[130px]">
                          {lead.name}
                        </div>
                        {lead.status === 'hot' ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 fill-red-400" />
                            {lead.score}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            {lead.channel}
                          </span>
                        )}
                      </div>

                      {/* Product & Price */}
                      <div className="text-[11px] font-medium text-indigo-300 truncate mb-1">
                        {lead.interestProduct || "Qiziqish bildirilmagan"}
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mb-2">
                        {formatPrice(lead.productPrice)} UZS
                      </div>

                      {/* Last message snippet */}
                      <div className="text-[10px] text-slate-400 line-clamp-2 bg-slate-900/50 p-1.5 rounded-lg border border-slate-800/80 mb-2 italic">
                        "{lead.lastMessage || 'Xabar yo\'q'}"
                      </div>

                      {/* Footer: Manager & Quick Stage Mover */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-[10px]">
                        <span className="text-slate-400 truncate max-w-[80px]">
                          👤 {lead.assignedManager || 'Ali'}
                        </span>
                        
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
                            className="bg-slate-900 text-slate-300 rounded px-1.5 py-0.5 border border-slate-700 text-[10px] focus:outline-none"
                          >
                            <option value="new">Yangi</option>
                            <option value="contacted">Aloqada</option>
                            <option value="interested">Qiziqmoqda</option>
                            <option value="hot">🔥 Hot</option>
                            <option value="won">🎉 Yutildi</option>
                            <option value="lost">Yo'qotildi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Yangi Lead Qo'shish</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Mijoz Ismi</label>
                <input
                  type="text"
                  required
                  value={newLeadData.name}
                  onChange={(e) => setNewLeadData({ ...newLeadData, name: e.target.value })}
                  placeholder="Masalan: Sardor Rahimov"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Telefon raqam</label>
                  <input
                    type="text"
                    value={newLeadData.phone}
                    onChange={(e) => setNewLeadData({ ...newLeadData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Telegram / Username</label>
                  <input
                    type="text"
                    value={newLeadData.username}
                    onChange={(e) => setNewLeadData({ ...newLeadData, username: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kanal</label>
                  <select
                    value={newLeadData.channel}
                    onChange={(e) => setNewLeadData({ ...newLeadData, channel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Telegram">Telegram</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Dastlabki Status</label>
                  <select
                    value={newLeadData.status}
                    onChange={(e) => setNewLeadData({ ...newLeadData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="new">Yangi</option>
                    <option value="contacted">Aloqada</option>
                    <option value="interested">Qiziqmoqda</option>
                    <option value="hot">🔥 Hot Lead</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Qiziqqan Mahsulot</label>
                <input
                  type="text"
                  value={newLeadData.interestProduct}
                  onChange={(e) => setNewLeadData({ ...newLeadData, interestProduct: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mahsulot Narxi (UZS)</label>
                <input
                  type="number"
                  value={newLeadData.productPrice}
                  onChange={(e) => setNewLeadData({ ...newLeadData, productPrice: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
