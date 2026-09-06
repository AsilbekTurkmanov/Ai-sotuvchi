import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import AiSimulatorView from './components/AiSimulatorView';
import CrmPipelineView from './components/CrmPipelineView';
import KnowledgeBaseView from './components/KnowledgeBaseView';
import FollowUpView from './components/FollowUpView';
import GuardrailsView from './components/GuardrailsView';
import TelegramHubView from './components/TelegramHubView';
import LeadModal from './components/LeadModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [faq, setFaq] = useState([]);
  const [leads, setLeads] = useState([]);
  const [settings, setSettings] = useState({});
  const [followUpTemplates, setFollowUpTemplates] = useState([]);
  const [botStatus, setBotStatus] = useState({ isRunning: false });
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Safe fetch helper for static hosting compatibility (GitHub Pages fallback)
  const safeFetch = async (url, fallbackData) => {
    try {
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        return await res.json();
      }
      return fallbackData;
    } catch (e) {
      return fallbackData;
    }
  };

  // Fetch all initial data
  const fetchData = async () => {
    try {
      const defaultDashboard = {
        metrics: { totalLeads: 24, hotLeads: 5, warmLeads: 11, wonLeads: 6, lostLeads: 2, totalWonRevenue: 75000000, conversionRate: "25.0", todayAiHandled: 42, todayHandoffs: 3, avgResponseTimeSec: 1.4 },
        funnel: [
          { stage: "Jami murojaatlar", count: 36, percent: 100 },
          { stage: "AI javob bergan", count: 34, percent: 94 },
          { stage: "Qiziqish (Warm)", count: 22, percent: 61 },
          { stage: "Xaridga tayyor (Hot)", count: 11, percent: 30 },
          { stage: "Muvaffaqiyatli sotuv (Won)", count: 6, percent: 25 }
        ],
        channelBreakdown: { telegram: 72, instagram: 18, webChat: 10 },
        recentHotLeads: [
          { id: "lead-1", name: "Javohir Ergashev", phone: "+998 90 987 65 43", interestProduct: "iPhone 15 Pro 256GB", score: 92, status: "hot", lastMessage: "Karta raqam bering, hozir to'lov qilaman" }
        ],
        topProducts: []
      };

      const defaultProducts = [
        { id: "prod-1", name: "iPhone 15 Pro 256GB", category: "Smartfonlar", price: 12500000, oldPrice: 13200000, colors: ["Black Titanium", "Natural Titanium"], stock: 14, installmentMonthly: 1250000, description: "A17 Pro chip, Titanium korpus, 48MP kamera.", features: "6.1\" Super Retina OLED 120Hz", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80", active: true },
        { id: "prod-2", name: "iPhone 15 Pro Max 256GB", category: "Smartfonlar", price: 14200000, oldPrice: 14900000, colors: ["Natural Titanium", "White Titanium"], stock: 8, installmentMonthly: 1420000, description: "A17 Pro, 5x telephoto, Titanium.", features: "6.7\" Super Retina OLED 120Hz", imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80", active: true },
        { id: "prod-3", name: "MacBook Air M3 13\" 8/256GB", category: "Noutbuklar", price: 13800000, oldPrice: 14500000, colors: ["Midnight", "Starlight", "Space Gray"], stock: 6, installmentMonthly: 1380000, description: "M3 chip, 18 soat batareya, yupqa korpus.", features: "13.6\" Liquid Retina", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80", active: true }
      ];

      const defaultFaq = [
        { id: "faq-1", question: "Dostavka boramiz?", answer: "Toshkent bo'ylab 2 soatda yetkazib berish BEPUL. Viloyatlarga 1 kunda yetkazamiz." },
        { id: "faq-2", question: "Bo'lib to'lash shartlari qanday?", answer: "Uzum Nasiya va Anorbank orqali 3, 6, 12 oylik muddatli to'lov (boshlang'ich to'lovsiz)." }
      ];

      const defaultLeads = [
        { id: "lead-1", name: "Javohir Ergashev", phone: "+998 90 987 65 43", channel: "Telegram", status: "hot", score: 92, interestProduct: "iPhone 15 Pro 256GB", productPrice: 12500000, assignedManager: "Ali Valiyev", sentiment: "positive", stage: "Intent", intent: "ready_to_buy", lastMessageTime: "19:42", lastMessage: "Karta raqam bering, hozir to'lov qilaman", unread: false, followUpStatus: "completed" },
        { id: "lead-2", name: "Sardor Azimov", phone: "+998 91 123 45 67", channel: "Telegram", status: "interested", score: 68, interestProduct: "MacBook Air M3", productPrice: 13800000, assignedManager: "Ali Valiyev", sentiment: "neutral", stage: "Consideration", intent: "price_inquiry", lastMessageTime: "18:15", lastMessage: "Uzum nasiyaga oyiga qancha bo'ladi?", unread: false, followUpStatus: "pending" }
      ];

      const defaultSettings = {
        businessName: "AppleUz Store", phone: "+998 90 123 45 67", currency: "UZS",
        address: "Toshkent sh., Chilonzor tumani", workingHours: "09:00 - 21:00",
        deliveryInfo: "Toshkentda 2 soatda BEPUL", paymentMethods: "Click, Payme, Uzum Nasiya",
        guardrails: { maxDiscountPercent: 5, allowNegotiation: true, autoHandoffOnHot: true }
      };

      const defaultFollowUps = [
        { id: "fu-1", name: "24 soatlik eslatma", delayHours: 24, channel: "all", condition: "Javob bermagan", text: "Salom! Tanlagan mahsulotingizni saqlab qo'ydik. Savollaringiz bormi?", active: true }
      ];

      const [dashRes, prodRes, faqRes, leadRes, setRes, fuRes, botRes] = await Promise.all([
        safeFetch('/api/dashboard', defaultDashboard),
        safeFetch('/api/products', defaultProducts),
        safeFetch('/api/faq', defaultFaq),
        safeFetch('/api/leads', defaultLeads),
        safeFetch('/api/settings', defaultSettings),
        safeFetch('/api/follow-ups', defaultFollowUps),
        safeFetch('/api/telegram/status', { isRunning: false })
      ]);

      setDashboardData(dashRes);
      setProducts(prodRes);
      setFaq(faqRes);
      setLeads(leadRes);
      setSettings(setRes);
      setFollowUpTemplates(fuRes);
      setBotStatus(botRes);
      setLoading(false);
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // 8s auto refresh for live sync
    return () => clearInterval(interval);
  }, []);

  // Lead CRUD handlers
  const handleAddNewLead = async (newLead) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Lead qo'shishda xatolik:", err);
    }
  };

  const handleUpdateLead = async (id, patch) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (res.ok) {
        fetchData();
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead(prev => ({ ...prev, ...patch }));
        }
      }
    } catch (err) {
      console.error("Lead yangilashda xatolik:", err);
    }
  };

  // Product CRUD
  const handleAddProduct = async (product) => {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    fetchData();
  };

  const handleDeleteProduct = async (id) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // FAQ CRUD
  const handleAddFaq = async (item) => {
    await fetch('/api/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    fetchData();
  };

  const handleDeleteFaq = async (id) => {
    await fetch(`/api/faq/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // Settings & Guardrails Update
  const handleUpdateSettings = async (patch) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const updated = await res.json();
        setSettings(updated);
      } else {
        setSettings(prev => ({ ...prev, ...patch }));
      }
      fetchData();
    } catch (err) {
      console.warn("Sozlamalarni serverga saqlashda ogohlantirish:", err);
      setSettings(prev => ({ ...prev, ...patch }));
    }
  };

  // Follow-up Trigger
  const handleTriggerFollowUp = async (leadId, templateId) => {
    try {
      const res = await fetch('/api/follow-ups/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, templateId })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        fetchData();
        return data;
      }
      throw new Error("Server javob bermadi");
    } catch (err) {
      console.error("Follow-up xatosi:", err);
      return { success: false, message: err.message };
    }
  };

  // Telegram Bot Operations
  const handleStartBot = async (token, managerChatId) => {
    const res = await fetch('/api/telegram/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, managerChatId })
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      throw new Error("Backend server (Node.js) ishlamayapti! Telegram bot ishlashi uchun terminal orqali 'npm run dev' buyrug'ini ishga tushiring.");
    }
    const data = await res.json();
    fetchData();
    return data;
  };

  const handleStopBot = async () => {
    const res = await fetch('/api/telegram/stop', { method: 'POST' });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      throw new Error("Backend server (Node.js) ishlamayapti!");
    }
    const data = await res.json();
    fetchData();
    return data;
  };

  const handleTestAlert = async () => {
    const res = await fetch('/api/telegram/test-alert', { method: 'POST' });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      throw new Error("Backend server (Node.js) ishlamayapti!");
    }
    return await res.json();
  };

  const hotCount = leads.filter(l => l.status === 'hot').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        botStatus={botStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={hotCount}
        onTestAlert={handleTestAlert}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hotCount={hotCount}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Content View Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-3 text-slate-400">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm font-medium">Tizim ishga tushmoqda...</div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  dashboardData={dashboardData}
                  onOpenLead={(lead) => setSelectedLead(lead)}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'simulator' && (
                <AiSimulatorView
                  onLeadUpdated={fetchData}
                  onOpenCrmLead={(lead) => setSelectedLead(lead)}
                />
              )}

              {activeTab === 'crm' && (
                <CrmPipelineView
                  leads={leads}
                  onOpenLead={(lead) => setSelectedLead(lead)}
                  onUpdateLeadStatus={(id, status) => handleUpdateLead(id, { status })}
                  onAddNewLead={handleAddNewLead}
                />
              )}

              {activeTab === 'knowledge' && (
                <KnowledgeBaseView
                  products={products}
                  faq={faq}
                  settings={settings}
                  onAddProduct={handleAddProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onAddFaq={handleAddFaq}
                  onDeleteFaq={handleDeleteFaq}
                  onUpdateSettings={handleUpdateSettings}
                />
              )}

              {activeTab === 'followup' && (
                <FollowUpView
                  followUpTemplates={followUpTemplates}
                  leads={leads}
                  onTriggerFollowUp={handleTriggerFollowUp}
                  onUpdateTemplate={() => {}}
                />
              )}

              {activeTab === 'guardrails' && (
                <GuardrailsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                />
              )}

              {activeTab === 'telegram' && (
                <TelegramHubView
                  settings={settings}
                  botStatus={botStatus}
                  onStartBot={handleStartBot}
                  onStopBot={handleStopBot}
                  onTestAlert={handleTestAlert}
                  onUpdateSettings={handleUpdateSettings}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Lead Detail Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
          onTriggerFollowUp={(leadId) => handleTriggerFollowUp(leadId, 'fu-1')}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Smartphones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 z-30 px-3 flex items-center justify-around pb-safe">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-500/20' : ''}`}>
            <span className="text-base">📊</span>
          </div>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${
            activeTab === 'simulator' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'simulator' ? 'bg-indigo-500/20' : ''}`}>
            <span className="text-base">🤖</span>
          </div>
          <span>AI Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${
            activeTab === 'crm' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'crm' ? 'bg-indigo-500/20' : ''}`}>
            <span className="text-base">🎯</span>
          </div>
          <span>CRM</span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${
            activeTab === 'knowledge' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'knowledge' ? 'bg-indigo-500/20' : ''}`}>
            <span className="text-base">📚</span>
          </div>
          <span>Katalog</span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all ${
            activeTab === 'telegram' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'telegram' ? 'bg-indigo-500/20' : ''}`}>
            <span className="text-base">📲</span>
          </div>
          <span>Bot</span>
        </button>
      </div>
    </div>
  );
}
