import React, { useState } from 'react';
import { 
  Clock, 
  Send, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  Play,
  RotateCcw
} from 'lucide-react';

export default function FollowUpView({ followUpTemplates, leads, onTriggerFollowUp, onUpdateTemplate }) {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || "");
  const [triggerStatus, setTriggerStatus] = useState(null);

  const handleTestTrigger = async (templateId) => {
    if (!selectedLeadId) {
      alert("Iltimos, avval test uchun leadni tanlang");
      return;
    }
    const result = await onTriggerFollowUp(selectedLeadId, templateId);
    setTriggerStatus({
      templateId,
      message: result?.message || "Follow-up muvaffaqiyatli jo'natildi!",
      text: result?.text
    });
    setTimeout(() => setTriggerStatus(null), 6000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              Automation Engine
            </span>
            <h1 className="text-xl font-extrabold text-white">Qayta Aloqa (Follow-up Automation)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Narx so'rab yo'qolib qolgan yoki javobsiz qolgan mijozlarga belgilangan vaqtda avtomatik xabarlar yuborish tizimi.
          </p>
        </div>

        {/* Lead selector for testing */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <span className="text-slate-400">Sinov uchun mijoz:</span>
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-medium focus:outline-none"
          >
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.interestProduct})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drip Sequence Visual Flow */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>3 Bosqichli Smart Follow-up Ketma-ketligi</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            * Agar mijoz javob yozsa, keyingi eslatmalar avtomatik bekor qilinadi.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {followUpTemplates.map((tpl, index) => {
            const isTriggered = triggerStatus?.templateId === tpl.id;
            return (
              <div
                key={tpl.id}
                className="glass-card rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Step badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-[11px] border border-indigo-500/30">
                    Bosqich {index + 1} ({tpl.delayHours} soatdan so'ng)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div>
                  <h3 className="font-bold text-xs text-white mb-1.5">{tpl.name}</h3>
                  <div className="text-[10px] text-slate-400 mb-3 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <b>Shart:</b> {tpl.condition}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed">
                    "{tpl.text}"
                  </div>
                </div>

                <div>
                  {isTriggered && (
                    <div className="mb-3 p-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30 font-medium">
                      ✓ {triggerStatus.message}
                    </div>
                  )}

                  <button
                    onClick={() => handleTestTrigger(tpl.id)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Sinov tariqasida jo'natish</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anti-Spam & Smart Safeguards Box */}
      <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white mb-0.5">Avtomatik To'xtash</div>
            <p className="text-slate-400 text-[11px]">Mijoz har qanday javob yozishi bilan navbatdagi drip xabarlar to'xtatiladi.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white mb-0.5">Tungi Vaqt Himoyasi</div>
            <p className="text-slate-400 text-[11px]">Soat 21:00 dan 09:00 gacha mijozga noqulaylik tug'dirmaslik uchun xabarlar jo'natilmaydi.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white mb-0.5">Dinamik Qiymatlar</div>
            <p className="text-slate-400 text-[11px]">Mahsulot nomi va muddatli to'lov narxi har bir mijoz uchun alohida moslanadi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
