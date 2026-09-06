import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  Send, 
  User, 
  Calendar, 
  MessageSquare, 
  Bot, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Flame,
  Tag,
  CreditCard
} from 'lucide-react';
import { apiFetch } from '../utils/apiClient';

export default function LeadModal({ lead, onClose, onUpdateLead, onTriggerFollowUp }) {
  const [conversation, setConversation] = useState([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [manualNote, setManualNote] = useState(lead.notes || "");
  const [replyText, setReplyText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setLoadingConv(true);
    apiFetch(`/api/leads/${lead.id}/conversation`)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setConversation(data);
        } else {
          setConversation([
            { sender: "customer", text: lead.lastMessage || "Assalomu alaykum!", time: lead.lastMessageTime || "12:00" },
            { sender: "ai", text: `Assalomu alaykum! ${lead.interestProduct || 'Mahsulotimiz'} bo'yicha sizga qanday yordam bera olamiz?`, time: lead.lastMessageTime || "12:00" }
          ]);
        }
        setLoadingConv(false);
      })
      .catch(err => {
        setConversation([
          { sender: "customer", text: lead.lastMessage || "Assalomu alaykum!", time: lead.lastMessageTime || "12:00" },
          { sender: "ai", text: `Assalomu alaykum! ${lead.interestProduct || 'Mahsulotimiz'} bo'yicha sizga qanday yordam bera olamiz?`, time: lead.lastMessageTime || "12:00" }
        ]);
        setLoadingConv(false);
      });
  }, [lead]);

  if (!lead) return null;

  const handleSaveNotes = () => {
    setSavingNote(true);
    onUpdateLead(lead.id, { notes: manualNote });
    setTimeout(() => setSavingNote(false), 500);
  };

  const handleStatusChange = (newStatus) => {
    onUpdateLead(lead.id, { status: newStatus });
  };

  const handleManagerChange = (manager) => {
    onUpdateLead(lead.id, { assignedManager: manager });
  };

  const formatPrice = (num) => new Intl.NumberFormat('uz-UZ').format(num || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{lead.name}</h2>
                {lead.status === 'hot' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-red-400" />
                    HOT LEAD (Score: {lead.score})
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span>📞 {lead.phone || 'Kiritilmagan'}</span>
                <span>💬 {lead.username || 'Username yo\'q'}</span>
                <span className="text-indigo-400 font-semibold">{lead.channel}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Details Panel */}
          <div className="md:col-span-5 p-6 border-r border-slate-800/80 space-y-4 bg-slate-900/40">
            {/* Status Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                Pipeline Bosqichi (Lead Status)
              </label>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="new">Yangi (New)</option>
                <option value="contacted">Aloqada (Contacted)</option>
                <option value="interested">Qiziqmoqda (Interested)</option>
                <option value="hot">🔥 Hot Lead (Xaridga tayyor)</option>
                <option value="won">🎉 Yutildi (Sotuv yakunlandi)</option>
                <option value="lost">❌ Yo'qotildi (Lost)</option>
              </select>
            </div>

            {/* Product & Price */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Qiziqqan Mahsulot</div>
              <div className="text-sm font-bold text-white">{lead.interestProduct || "Ko'rsatilmagan"}</div>
              <div className="text-sm font-extrabold text-emerald-400">
                {formatPrice(lead.productPrice)} UZS
              </div>
            </div>

            {/* Assigned Manager */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                Biriktirilgan Menejer
              </label>
              <select
                value={lead.assignedManager || "Ali Valiyev"}
                onChange={(e) => handleManagerChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Ali Valiyev">Ali Valiyev (Katta Sotuvchi)</option>
                <option value="Nodira Karimova">Nodira Karimova (Menejer)</option>
                <option value="Taqsimlanmagan">Taqsimlanmagan</option>
              </select>
            </div>

            {/* Follow-up Quick Action */}
            <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
              <div className="text-xs font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Qayta Aloqa (Follow-up)</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Mijozga bir bosishda avtomatlashtirilgan eslatma yoki maxsus taklif jo'natish.
              </p>
              <button
                onClick={() => onTriggerFollowUp(lead.id)}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                Eslatma Jo'natish
              </button>
            </div>

            {/* Internal Notes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400">Ichki Eslatmalar (Notes)</label>
                <button
                  onClick={handleSaveNotes}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  {savingNote ? 'Saqlandi!' : 'Saqlash'}
                </button>
              </div>
              <textarea
                rows="3"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Mijoz haqida muhim eslatma..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Right Chat History Panel */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between h-[550px] bg-[#0c1220]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Suhbat Tarixi (AI & Mijoz)</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Oxirgi xabar: {lead.lastMessageTime}
                </span>
              </div>

              {/* Chat messages */}
              <div className="h-[380px] overflow-y-auto space-y-3 pr-2">
                {loadingConv ? (
                  <div className="text-center text-xs text-slate-500 py-12">
                    Xabarlar yuklanmoqda...
                  </div>
                ) : conversation.length === 0 ? (
                  <div className="text-center text-xs text-slate-500 py-12">
                    Xabarlar tarixi bo'sh
                  </div>
                ) : (
                  conversation.map((msg, idx) => {
                    const isUser = msg.sender === "customer";
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs ${
                            isUser
                              ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                              : 'bg-indigo-600 text-white rounded-tr-none'
                          }`}
                        >
                          <div className="text-[9px] opacity-70 mb-0.5 font-semibold">
                            {isUser ? lead.name : "AI Sotuvchi"}
                          </div>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 px-1">
                          {msg.time}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Manager Direct Reply info */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Mijoz bilan to'g'ridan-to'g'ri aloqa:</span>
              <a
                href={lead.username ? `https://t.me/${lead.username.replace('@', '')}` : `tel:${lead.phone}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-semibold flex items-center gap-1 transition-all"
              >
                <span>Telegram / Qo'ng'iroq qilish</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
