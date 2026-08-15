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

  // Fetch all initial data
  const fetchData = async () => {
    try {
      const [dashRes, prodRes, faqRes, leadRes, setRes, fuRes, botRes] = await Promise.all([
        fetch('/api/dashboard').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/faq').then(r => r.json()),
        fetch('/api/leads').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/follow-ups').then(r => r.json()),
        fetch('/api/telegram/status').then(r => r.json())
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
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const updated = await res.json();
    setSettings(updated);
    fetchData();
  };

  // Follow-up Trigger
  const handleTriggerFollowUp = async (leadId, templateId) => {
    const res = await fetch('/api/follow-ups/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, templateId })
    });
    const data = await res.json();
    fetchData();
    return data;
  };

  // Telegram Bot Operations
  const handleStartBot = async (token, managerChatId) => {
    const res = await fetch('/api/telegram/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, managerChatId })
    });
    const data = await res.json();
    fetchData();
    return data;
  };

  const handleStopBot = async () => {
    const res = await fetch('/api/telegram/stop', { method: 'POST' });
    const data = await res.json();
    fetchData();
    return data;
  };

  const handleTestAlert = async () => {
    await fetch('/api/telegram/test-alert', { method: 'POST' });
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
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hotCount={hotCount}
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
    </div>
  );
}
