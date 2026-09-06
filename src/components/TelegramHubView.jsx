import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  Power, 
  PowerOff, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Flame,
  Server,
  Globe,
  RefreshCw
} from 'lucide-react';
import { pingBackend } from '../utils/apiClient';

export default function TelegramHubView({ 
  settings, 
  botStatus, 
  backendUrl, 
  onUpdateBackendUrl, 
  onStartBot, 
  onStopBot, 
  onTestAlert, 
  onUpdateSettings 
}) {
  const [botToken, setBotToken] = useState(settings.telegramBotToken || "");
  const [managerChatId, setManagerChatId] = useState(settings.telegramManagerChatId || "");
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [inputBackendUrl, setInputBackendUrl] = useState(backendUrl || "");
  const [pinging, setPinging] = useState(false);
  const [serverStatusMsg, setServerStatusMsg] = useState(null);

  useEffect(() => {
    setInputBackendUrl(backendUrl || "");
  }, [backendUrl]);

  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

  const handleTestServerPing = async () => {
    setPinging(true);
    setServerStatusMsg(null);
    const res = await pingBackend(inputBackendUrl);
    if (res.ok) {
      setServerStatusMsg({ success: true, text: "Server faol va muvaffaqiyatli javob berdi! (200 OK)" });
    } else {
      setServerStatusMsg({ success: false, text: "Serverga ulanib bo'lmadi: " + (res.message || "Xatolik") });
    }
    setPinging(false);
  };

  const handleSaveBackend = () => {
    if (onUpdateBackendUrl) {
      onUpdateBackendUrl(inputBackendUrl);
      setServerStatusMsg({ success: true, text: "Backend URL manzili saqlandi va ulandi!" });
    }
  };

  const handleToggleBot = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      if (botStatus.isRunning) {
        const res = await onStopBot();
        setActionMessage({ success: true, text: "Bot to'xtatildi." });
      } else {
        if (!botToken.trim()) {
          setActionMessage({ success: false, text: "Iltimos, avval @BotFather dan olingan bot tokenini kiriting." });
          setLoading(false);
          return;
        }
        const res = await onStartBot(botToken, managerChatId);
        if (res && res.success) {
          setActionMessage({ success: true, text: res.message || "Bot muvaffaqiyatli ishga tushirildi!" });
        } else {
          setActionMessage({ success: false, text: (res && res.message) || "Botni ishga tushirib bo'lmadi." });
        }
      }
    } catch (err) {
      let msg = err.message || "Noma'lum xatolik";
      if (msg.includes("Unexpected token") || msg.includes("is not valid JSON") || msg.includes("Failed to fetch")) {
        msg = "Backend server (Node.js) ishga tushmagan! Telegram bot ishlashi uchun kompyuteringizda terminal orqali 'npm run dev' buyrug'ini ishga tushirishingiz yoki Cloud Server ulashingiz lozim.";
      }
      setActionMessage({ success: false, text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestAlert = async () => {
    setLoading(true);
    try {
      await onTestAlert();
      setActionMessage({ success: true, text: "Test Hot Lead bildirishnomasi Telegram orqali yuborildi!" });
    } catch (err) {
      let msg = err.message || "";
      if (msg.includes("Unexpected token") || msg.includes("is not valid JSON") || msg.includes("Failed to fetch")) {
        msg = "Backend server (Node.js) ishga tushmagan!";
      }
      setActionMessage({ success: false, text: "Xabar jo'natishda xatolik: " + msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            Real Gateway
          </span>
          <h1 className="text-xl font-extrabold text-white">Telegram Bot Integratsiyasi</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          O'z do'koningiz Telegram botini bir zumda ulang. AI barcha mijozlar bilan muloqot qiladi va Hot Leadlar haqida sizga xabar beradi.
        </p>
      </div>

      {/* Backend Server Gateway Box */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Backend Server Ulanishi (API Gateway)
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  backendUrl 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : (isGitHubPages ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30')
                }`}>
                  {backendUrl ? 'Cloud / Custom URL' : (isGitHubPages ? 'GitHub Pages (Statik)' : 'Lokal (/api)')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isGitHubPages && !backendUrl
                  ? "GitHub Pages statik bo'lgani uchun, bot 24/7 ishlashi maqsadida bepul Cloud Backend (Render) havolasini biriktiring."
                  : "Telegram Bot va AI savdo tizimini boshqaruvchi server manzili."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputBackendUrl}
              onChange={(e) => setInputBackendUrl(e.target.value)}
              placeholder="Masalan: https://ai-sotuvchi-backend.onrender.com"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTestServerPing}
              disabled={pinging}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Tekshirish</span>
            </button>

            <button
              type="button"
              onClick={handleSaveBackend}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Saqlash & Ulash
            </button>
          </div>
        </div>

        {serverStatusMsg && (
          <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
            serverStatusMsg.success 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {serverStatusMsg.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{serverStatusMsg.text}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>🚀 24/7 Bepul Cloud Server:</span>
            <a
              href="https://render.com/deploy?repo=https://github.com/AsilbekTurkmanov/Ai-sotuvchi"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              Render.com da bepul yaratish <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="text-slate-500 text-[11px]">
            Lokal kompyuterdan tunnel: <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono">npm run tunnel</code>
          </div>
        </div>
      </div>

      {/* Main Bot Status & Control Box */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
              botStatus.isRunning
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 badge-glow-green'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Telegram Savdo Boti
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  botStatus.isRunning
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {botStatus.isRunning ? 'FAOL (Online)' : 'O\'CHIRILGAN'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {botStatus.isRunning
                  ? 'Bot mijozlar xabarlarini real vaqtda qabul qilib, AI orqali javob qaytarmoqda.'
                  : 'Bot to\'xtatilgan. Ishga tushirish uchun quyidagi tugmani bosing.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleBot}
            disabled={loading}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-105 ${
              botStatus.isRunning
                ? 'bg-red-600/80 hover:bg-red-600 text-white shadow-red-600/20 border border-red-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 border border-emerald-500/40'
            }`}
          >
            {botStatus.isRunning ? (
              <>
                <PowerOff className="w-4 h-4" />
                <span>Botni To'xtatish</span>
              </>
            ) : (
              <>
                <Power className="w-4 h-4" />
                <span>Botni Ishga Tushirish</span>
              </>
            )}
          </button>
        </div>

        {/* Credentials Form */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Telegram Bot Token (HTTP API)
              </span>
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                @BotFather dan token olish <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Masalan: 7123456789:AAFxYzabc..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-red-400" />
                Sotuvchi / Rahbar Telegram Chat ID (Hot Lead bildirishnomalari uchun)
              </span>
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                @userinfobot orqali ID bilish <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="text"
              value={managerChatId}
              onChange={(e) => setManagerChatId(e.target.value)}
              placeholder="Masalan: 123456789 yoki -100123456789 (Guruh ID)"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={handleSendTestAlert}
              disabled={loading || !botToken}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>Test: Hot Lead Alert Yuborish</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onUpdateSettings({ telegramBotToken: botToken, telegramManagerChatId: managerChatId });
                setActionMessage({ success: true, text: "Token va Chat ID muvaffaqiyatli saqlandi!" });
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Sozlamalarni Saqlash
            </button>
          </div>

          {actionMessage && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              actionMessage.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {actionMessage.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{actionMessage.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Setup Guide Step-by-Step */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <span>Telegram Botni 3 Qadamda Ulash Qo'llanmasi</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
            <div className="font-bold text-indigo-300">1. @BotFather ga o'ting</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Telegramda <b>@BotFather</b> ga <code>/newbot</code> deb yozing va yangi bot yaratib, HTTP API tokenini nusxalab oling.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
            <div className="font-bold text-indigo-300">2. Tokenni kiriting</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Olingan tokenni yuqoridagi maydonga joylang va <b>"Botni Ishga Tushirish"</b> tugmasini bosing.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
            <div className="font-bold text-indigo-300">3. Hot Lead Alert oling</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Har safar mijoz xaridga tayyor bo'lganida yoki to'lov so'raganida, AI darhol sizning shaxsiy Telegramingizga ogohlantirish yuboradi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
