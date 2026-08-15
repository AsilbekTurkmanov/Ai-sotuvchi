import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  Check, 
  AlertTriangle, 
  Percent, 
  UserCheck,
  Bot,
  Key,
  Cpu,
  Globe
} from 'lucide-react';

export default function GuardrailsView({ settings, onUpdateSettings }) {
  const [aiProvider, setAiProvider] = useState(settings.aiProvider || "builtin");
  const [aiApiKey, setAiApiKey] = useState(settings.aiApiKey || "");
  const [aiModel, setAiModel] = useState(settings.aiModel || "gpt-4o-mini");
  const [showKey, setShowKey] = useState(false);

  const [guardrails, setGuardrails] = useState({
    maxDiscountPercent: settings.guardrails?.maxDiscountPercent ?? 5,
    allowNegotiation: settings.guardrails?.allowNegotiation ?? true,
    autoHandoffOnHot: settings.guardrails?.autoHandoffOnHot ?? true,
    autoHandoffOnNegative: settings.guardrails?.autoHandoffOnNegative ?? true,
    strictPriceOnly: settings.guardrails?.strictPriceOnly ?? true,
    systemPromptExtra: settings.guardrails?.systemPromptExtra || ""
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    onUpdateSettings({
      aiProvider,
      aiApiKey,
      aiModel,
      guardrails
    });
    setTimeout(() => setSaving(false), 500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            AI Engine & Guardrails
          </span>
          <h1 className="text-xl font-extrabold text-white">AI Model & Boshqaruv Qoidalari</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          ChatGPT 4o, Gemini yoki Built-in universal intellektual agentni ulang va savdo xavfsizlik chegaralarini boshqaring.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* 1. AI Provider & Model Selection Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Dvigateli & Agent Turi (LLM Model)</h3>
                <p className="text-xs text-slate-400">Har qanday umumiy savollarga va savdo ssenariylariga javob beruvchi model</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Universal Agent
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              onClick={() => { setAiProvider('builtin'); setAiModel('builtin-agent'); }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                aiProvider === 'builtin'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5 mb-1 text-slate-200">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Built-in Universal AI</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tashqi API kalitsiz ishlaydi. Barcha savdo va umumiy mantiqiy savollarga tezkor javob.
              </p>
            </div>

            <div
              onClick={() => { setAiProvider('openai'); setAiModel('gpt-4o-mini'); }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                aiProvider === 'openai'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5 mb-1 text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>OpenAI ChatGPT (GPT-4o)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                OpenAI GPT-4o / GPT-4o-mini orqali cheksiz umumiy bilim va ijodiy suhbat.
              </p>
            </div>

            <div
              onClick={() => { setAiProvider('gemini'); setAiModel('gemini-1.5-flash'); }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                aiProvider === 'gemini'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5 mb-1 text-slate-200">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span>Google Gemini Flash</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Google Gemini 1.5/2.0 yuqori tezlik va chuqur tahlil bilan ishlaydi.
              </p>
            </div>
          </div>

          {/* API Key Input if OpenAI or Gemini selected */}
          {aiProvider !== 'builtin' && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Model Nomi</label>
                  <input
                    type="text"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    placeholder={aiProvider === 'openai' ? 'gpt-4o-mini yoki gpt-4o' : 'gemini-1.5-flash'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>{aiProvider === 'openai' ? 'OpenAI API Key' : 'Gemini API Key'}</span>
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      {showKey ? 'Yashirish' : 'Ko\'rsatish'}
                    </button>
                  </label>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder={aiProvider === 'openai' ? 'sk-proj-...' : 'AIzaSy...'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Max Discount Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Maksimal Ruxsat Etilgan Chegirma</h3>
                <p className="text-xs text-slate-400">AI mijoz bilan savdolashganda eng ko'p bera oladigan chegirma foizi</p>
              </div>
            </div>
            <span className="text-xl font-black text-indigo-400">
              {guardrails.maxDiscountPercent}%
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={guardrails.maxDiscountPercent}
              onChange={(e) => setGuardrails({ ...guardrails, maxDiscountPercent: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Qat'iy chegirmasiz)</span>
              <span>5% (Standart tavsiya)</span>
              <span>10%</span>
              <span>20% (Maksimal)</span>
            </div>
          </div>
        </div>

        {/* Toggles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strict Price Only */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Qat'iy Narx Himoyasi</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                AI do'kon tovarlari bo'yicha faqat Knowledge Base narxlariga tayanadi.
              </p>
            </div>
            <input
              type="checkbox"
              checked={guardrails.strictPriceOnly}
              onChange={(e) => setGuardrails({ ...guardrails, strictPriceOnly: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer mt-1"
            />
          </div>

          {/* Auto Handoff on Hot Lead */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-red-400" />
                <span>Hot Lead'da Sotuvchiga Yo'naltirish</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Mijoz "Olaman / Karta raqam bering" degan paytda darhol sotuvchiga bildirishnoma jo'natish.
              </p>
            </div>
            <input
              type="checkbox"
              checked={guardrails.autoHandoffOnHot}
              onChange={(e) => setGuardrails({ ...guardrails, autoHandoffOnHot: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer mt-1"
            />
          </div>

          {/* Auto Handoff on Negative */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Norozilikda Insonni Chaqirish</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Mijoz norozi bo'lsa yoki janjallashsa, AI bahslashmasdan bosh menejerga o'tkazadi.
              </p>
            </div>
            <input
              type="checkbox"
              checked={guardrails.autoHandoffOnNegative}
              onChange={(e) => setGuardrails({ ...guardrails, autoHandoffOnNegative: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer mt-1"
            />
          </div>

          {/* Negotiation Toggle */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Savdolashish va Takliflar</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Mijoz "tushib bering" deganida sovg'a yoki kichik chegirma bilan savdoni yopishga urinish.
              </p>
            </div>
            <input
              type="checkbox"
              checked={guardrails.allowNegotiation}
              onChange={(e) => setGuardrails({ ...guardrails, allowNegotiation: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer mt-1"
            />
          </div>
        </div>

        {/* AI System Persona / Prompt Extra */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">AI Sotuvchi Tone of Voice & Xarakteri</h3>
          </div>
          <p className="text-xs text-slate-400">
            AI ga o'z biznesingizga xos qo'shimcha ko'rsatmalar bering.
          </p>

          <textarea
            rows="3"
            value={guardrails.systemPromptExtra}
            onChange={(e) => setGuardrails({ ...guardrails, systemPromptExtra: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            {saving ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{saving ? "Saqlandi!" : "Barcha Sozlamalarni Saqlash"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
