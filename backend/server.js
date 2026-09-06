import express from 'express';
import cors from 'cors';
import { getDb, saveDb } from './db.js';
import { processCustomerMessage } from './aiEngine.js';
import { startTelegramBot, stopTelegramBot, getBotStatus, sendHotLeadNotification } from './telegramService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Dashboard & Analytics ---
app.get('/api/dashboard', (req, res) => {
  const db = getDb();
  
  // Calculate dynamic stats from leads
  const totalLeads = db.leads.length;
  const hotLeads = db.leads.filter(l => l.status === 'hot').length;
  const warmLeads = db.leads.filter(l => l.status === 'interested').length;
  const wonLeads = db.leads.filter(l => l.status === 'won').length;
  const lostLeads = db.leads.filter(l => l.status === 'lost').length;
  const contactedLeads = db.leads.filter(l => l.status === 'contacted' || l.status === 'new').length;

  const totalWonRevenue = db.leads
    .filter(l => l.status === 'won')
    .reduce((sum, l) => sum + (l.productPrice || 0), 0);

  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

  res.json({
    metrics: {
      totalLeads,
      hotLeads,
      warmLeads,
      wonLeads,
      lostLeads,
      contactedLeads,
      totalWonRevenue,
      todayRevenue: db.analytics.todayRevenue,
      conversionRate,
      todayAiHandled: db.analytics.todayAiHandled,
      todayHandoffs: db.analytics.todayHandoffs,
      avgResponseTimeSec: db.analytics.avgResponseTimeSec
    },
    funnel: [
      { stage: "Jami murojaatlar", count: totalLeads + 12, percent: 100 },
      { stage: "AI javob bergan", count: totalLeads + 8, percent: 94 },
      { stage: "Qiziqish (Warm)", count: warmLeads + hotLeads + wonLeads, percent: Math.round(((warmLeads + hotLeads + wonLeads) / Math.max(1, totalLeads)) * 100) },
      { stage: "Xaridga tayyor (Hot)", count: hotLeads + wonLeads, percent: Math.round(((hotLeads + wonLeads) / Math.max(1, totalLeads)) * 100) },
      { stage: "Muvaffaqiyatli sotuv (Won)", count: wonLeads, percent: Number(conversionRate) }
    ],
    channelBreakdown: db.analytics.channelBreakdown,
    recentHotLeads: db.leads.filter(l => l.status === 'hot').slice(0, 5),
    topProducts: db.products.slice(0, 4)
  });
});

// --- Products Knowledge Base ---
app.get('/api/products', (req, res) => {
  const db = getDb();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = getDb();
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: req.body.name || "Yangi mahsulot",
    category: req.body.category || "Umumiy",
    price: Number(req.body.price) || 0,
    oldPrice: Number(req.body.oldPrice) || 0,
    colors: req.body.colors ? (Array.isArray(req.body.colors) ? req.body.colors : req.body.colors.split(',').map(s => s.trim())) : ["Qora", "Oq"],
    stock: Number(req.body.stock) || 10,
    installmentMonthly: Number(req.body.installmentMonthly) || Math.round((req.body.price || 0) / 12),
    description: req.body.description || "",
    features: req.body.features || "",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    active: req.body.active !== undefined ? req.body.active : true
  };
  db.products.unshift(newProduct);
  saveDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = getDb();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Mahsulot topilmadi" });

  db.products[index] = {
    ...db.products[index],
    ...req.body,
    colors: Array.isArray(req.body.colors) ? req.body.colors : (req.body.colors ? req.body.colors.split(',').map(s => s.trim()) : db.products[index].colors)
  };
  saveDb(db);
  res.json(db.products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const db = getDb();
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, message: "Mahsulot o'chirildi" });
});

// --- FAQ Knowledge Base ---
app.get('/api/faq', (req, res) => {
  const db = getDb();
  res.json(db.faq);
});

app.post('/api/faq', (req, res) => {
  const db = getDb();
  const newFaq = {
    id: `faq-${Date.now()}`,
    question: req.body.question,
    answer: req.body.answer
  };
  db.faq.push(newFaq);
  saveDb(db);
  res.status(201).json(newFaq);
});

app.put('/api/faq/:id', (req, res) => {
  const db = getDb();
  const index = db.faq.findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "FAQ topilmadi" });
  db.faq[index] = { ...db.faq[index], ...req.body };
  saveDb(db);
  res.json(db.faq[index]);
});

app.delete('/api/faq/:id', (req, res) => {
  const db = getDb();
  db.faq = db.faq.filter(f => f.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, message: "FAQ o'chirildi" });
});

// --- Leads & CRM ---
app.get('/api/leads', (req, res) => {
  const db = getDb();
  res.json(db.leads);
});

app.post('/api/leads', (req, res) => {
  const db = getDb();
  const newLead = {
    id: `lead-${Date.now()}`,
    name: req.body.name || "Yangi Mijoz",
    phone: req.body.phone || "+998",
    username: req.body.username || "",
    channel: req.body.channel || "Telegram",
    status: req.body.status || "new",
    score: Number(req.body.score) || 30,
    interestProduct: req.body.interestProduct || (db.products[0]?.name || ""),
    productPrice: Number(req.body.productPrice) || (db.products[0]?.price || 0),
    assignedManager: req.body.assignedManager || "Ali Valiyev",
    sentiment: req.body.sentiment || "neutral",
    stage: req.body.stage || "Awareness",
    intent: req.body.intent || "general_inquiry",
    lastMessageTime: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    lastMessage: req.body.lastMessage || "Yangi mijoz ro'yxatga olindi",
    unread: false,
    followUpStatus: "pending",
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    notes: req.body.notes || ""
  };
  db.leads.unshift(newLead);
  db.conversations[newLead.id] = [
    { sender: "customer", text: newLead.lastMessage, time: newLead.lastMessageTime }
  ];
  saveDb(db);
  res.status(201).json(newLead);
});

app.put('/api/leads/:id', (req, res) => {
  const db = getDb();
  const index = db.leads.findIndex(l => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Lead topilmadi" });

  const oldStatus = db.leads[index].status;
  db.leads[index] = { ...db.leads[index], ...req.body };

  // If moved to Won, track in revenue
  if (oldStatus !== 'won' && req.body.status === 'won') {
    db.analytics.todaySalesCount += 1;
  }
  saveDb(db);
  res.json(db.leads[index]);
});

app.delete('/api/leads/:id', (req, res) => {
  const db = getDb();
  db.leads = db.leads.filter(l => l.id !== req.params.id);
  delete db.conversations[req.params.id];
  saveDb(db);
  res.json({ success: true, message: "Lead o'chirildi" });
});

app.get('/api/leads/:id/conversation', (req, res) => {
  const db = getDb();
  const conv = db.conversations[req.params.id] || [];
  res.json(conv);
});

// --- AI Chat Simulator / Playground ---
app.post('/api/chat/simulate', async (req, res) => {
  const { message, leadId, history = [] } = req.body;
  const db = getDb();

  let lead = db.leads.find(l => l.id === leadId);
  if (!lead) {
    lead = {
      id: leadId || `lead-sim-${Date.now()}`,
      name: "Jonli Sinovchi (Mijoz)",
      phone: "+998 90 000 00 00",
      username: "@test_user",
      channel: "Telegram",
      status: "contacted",
      score: 40,
      interestProduct: "",
      productPrice: 0,
      assignedManager: "Ali Valiyev",
      sentiment: "neutral",
      stage: "Interest",
      intent: "general_inquiry",
      lastMessageTime: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      lastMessage: message,
      unread: false,
      followUpStatus: "pending",
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: "Simulyatordan yaratildi"
    };
    db.leads.unshift(lead);
  }

  const aiResult = await processCustomerMessage(message, history, lead);

  // Update lead
  lead.lastMessage = message;
  lead.lastMessageTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  lead.score = aiResult.score;
  lead.sentiment = aiResult.sentiment;
  lead.stage = aiResult.stage;
  lead.intent = aiResult.intent;
  if (aiResult.isHandoff || aiResult.status === "hot") {
    lead.status = "hot";
  } else if (aiResult.status) {
    lead.status = aiResult.status;
  }
  if (aiResult.matchedProduct) {
    lead.interestProduct = aiResult.matchedProduct;
    lead.productPrice = aiResult.productPrice;
  }

  // Update conversation
  const timeNow = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  if (!db.conversations[lead.id]) db.conversations[lead.id] = [];
  db.conversations[lead.id].push(
    { sender: "customer", text: message, time: timeNow, intent: aiResult.intent },
    { sender: "ai", text: aiResult.response, time: timeNow, isHandoff: aiResult.isHandoff }
  );

  db.analytics.todayAiHandled += 1;
  saveDb(db);

  if (aiResult.isHandoff) {
    sendHotLeadNotification(lead, aiResult.handoffReason);
  }

  res.json({
    ...aiResult,
    leadId: lead.id,
    lead
  });
});

// --- Follow-up Engine ---
app.get('/api/follow-ups', (req, res) => {
  const db = getDb();
  res.json(db.followUpTemplates);
});

app.post('/api/follow-ups', (req, res) => {
  const db = getDb();
  const newTemplate = {
    id: `fu-${Date.now()}`,
    name: req.body.name || "Yangi eslatma shabloni",
    delayHours: Number(req.body.delayHours) || 24,
    channel: req.body.channel || "all",
    condition: req.body.condition || "24 soat javob bermagan",
    text: req.body.text || "Salom! Mahsulotimiz sizni hali ham qiziqtiryaptimi?",
    active: req.body.active !== undefined ? req.body.active : true
  };
  db.followUpTemplates.push(newTemplate);
  saveDb(db);
  res.status(201).json(newTemplate);
});

app.put('/api/follow-ups/:id', (req, res) => {
  const db = getDb();
  const index = db.followUpTemplates.findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Shablon topilmadi" });
  db.followUpTemplates[index] = { ...db.followUpTemplates[index], ...req.body };
  saveDb(db);
  res.json(db.followUpTemplates[index]);
});

app.post('/api/follow-ups/trigger', (req, res) => {
  const db = getDb();
  const { leadId, templateId } = req.body;
  const lead = db.leads.find(l => l.id === leadId);
  const template = db.followUpTemplates.find(t => t.id === templateId) || db.followUpTemplates[0];

  if (!lead) return res.status(404).json({ error: "Lead topilmadi" });

  let text = template.text
    .replace('{product_name}', lead.interestProduct || 'tanlangan mahsulot')
    .replace('{installment_price}', new Intl.NumberFormat('uz-UZ').format(Math.round((lead.productPrice || 12000000) / 12)));

  const timeNow = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  if (!db.conversations[lead.id]) db.conversations[lead.id] = [];
  db.conversations[lead.id].push({ sender: "ai", text: `[Avtomatik Follow-up]: ${text}`, time: timeNow });
  lead.followUpStatus = "completed";
  lead.lastMessage = `[Follow-up]: ${text.slice(0, 30)}...`;
  lead.lastMessageTime = timeNow;

  saveDb(db);
  res.json({ success: true, message: "Follow-up xabari jo'natildi", text, lead });
});

// --- Settings & Guardrails ---
app.get('/api/settings', (req, res) => {
  const db = getDb();
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  const db = getDb();
  db.settings = { ...db.settings, ...req.body };
  saveDb(db);
  res.json(db.settings);
});

// --- Telegram Bot Controls ---
app.get('/api/telegram/status', (req, res) => {
  const status = getBotStatus();
  const db = getDb();
  res.json({ isRunning: status.isRunning, botActive: db.settings.botActive, tokenConfigured: !!db.settings.telegramBotToken });
});

app.post('/api/telegram/start', async (req, res) => {
  const db = getDb();
  const token = req.body.token || db.settings.telegramBotToken;
  if (!token) return res.status(400).json({ error: "Bot tokeni mavjud emas" });

  db.settings.telegramBotToken = token;
  if (req.body.managerChatId) {
    db.settings.telegramManagerChatId = req.body.managerChatId;
  }
  saveDb(db);

  const result = await startTelegramBot(token);
  res.json(result);
});

app.post('/api/telegram/stop', (req, res) => {
  const result = stopTelegramBot();
  res.json(result);
});

app.post('/api/telegram/test-alert', async (req, res) => {
  const db = getDb();
  const sampleLead = db.leads.find(l => l.status === 'hot') || db.leads[0];
  await sendHotLeadNotification(sampleLead, "Test: Mijoz hozir to'lov qilmoqchi!");
  res.json({ success: true, message: "Test bildirishnomasi jo'natildi" });
});

// --- Ultra-Realistic Human TTS (3-Tier Cascade: OpenAI → Edge Neural → Browser) ---
app.post('/api/tts/speak', async (req, res) => {
  const { text, voice = 'nova', speed = 0.95 } = req.body;
  const db = getDb();
  const apiKey = db.settings.aiApiKey || process.env.OPENAI_API_KEY;

  if (!text) return res.status(400).json({ error: "Matn kiritilmadi" });

  const clean = text
    .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
    .replace(/[*#_`~•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // ══════════════════════════════════════════════════════════════
  // 🥇 1-BOSQICH: OpenAI TTS-1-HD (Premium sifat, API key kerak)
  // ══════════════════════════════════════════════════════════════
  if (apiKey && (apiKey.startsWith('sk-') || db.settings.aiProvider === 'openai')) {
    try {
      const openAiRes = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "tts-1-hd",
          input: clean,
          voice: voice,
          speed: Math.max(0.85, Math.min(1.15, speed)),
          response_format: "mp3"
        })
      });

      if (openAiRes.ok) {
        const arrayBuf = await openAiRes.arrayBuffer();
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': arrayBuf.byteLength,
          'Cache-Control': 'no-cache',
          'X-TTS-Provider': 'openai-tts-1-hd'
        });
        console.log(`✅ OpenAI TTS-1-HD: "${clean.slice(0, 40)}..." — ${voice} ovozida audio yaratildi`);
        return res.send(Buffer.from(arrayBuf));
      } else {
        const errText = await openAiRes.text();
        console.warn(`⚠️ OpenAI TTS-HD xatolik (HTTP ${openAiRes.status}):`, errText);
      }
    } catch (err) {
      console.warn("⚠️ OpenAI TTS-HD xatolik:", err.message);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // 🥈 2-BOSQICH: Edge Neural TTS (Bepul, Tabiiy O'zbek ovozi)
  // ══════════════════════════════════════════════════════════════
  try {
    const { generateEdgeTTS } = await import('./edgeTts.js');
    const audioBuffer = await generateEdgeTTS(clean, voice, speed);
    
    if (audioBuffer && audioBuffer.byteLength > 100) {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength,
        'Cache-Control': 'no-cache',
        'X-TTS-Provider': 'edge-neural-tts'
      });
      return res.send(audioBuffer);
    }
  } catch (err) {
    console.warn("⚠️ Edge Neural TTS xatolik:", err.message);
  }

  // ══════════════════════════════════════════════════════════════
  // 🥉 3-BOSQICH: Client-side neural fallback
  // ══════════════════════════════════════════════════════════════
  console.log("ℹ️ Server TTS ishlamadi, brauzer neural speech fallback ishlatilmoqda");
  res.json({
    useClientNeural: true,
    text: clean,
    voicePersona: voice
  });
});

// --- Neural TTS ovozlar ro'yxati ---
app.get('/api/tts/voices', async (req, res) => {
  try {
    const { getAvailableVoices, NEURAL_VOICES } = await import('./edgeTts.js');
    const edgeVoices = await getAvailableVoices();
    res.json({
      edgeVoices: edgeVoices.slice(0, 30),
      builtInVoices: NEURAL_VOICES
    });
  } catch (err) {
    res.json({ edgeVoices: [], builtInVoices: {}, error: err.message });
  }
});

// --- Edge TTS test endpoint ---
app.post('/api/tts/test-edge', async (req, res) => {
  const { text = "Assalomu alaykum! Bu tabiiy neural ovoz sinovi.", voice = 'madina' } = req.body;
  try {
    const { generateEdgeTTS } = await import('./edgeTts.js');
    const audioBuffer = await generateEdgeTTS(text, voice, 0.95);
    
    if (audioBuffer && audioBuffer.byteLength > 100) {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength,
        'Cache-Control': 'no-cache'
      });
      return res.send(audioBuffer);
    }
    res.status(500).json({ error: "Audio generatsiya qilinmadi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const docsPath = path.join(__dirname, '../docs');
const distPath = path.join(__dirname, '../dist');
const staticPath = fs.existsSync(docsPath) ? docsPath : distPath;

if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.get('{*path}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticPath, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

app.listen(PORT, () => {
  console.log(`AI Sotuvchi Backend server http://localhost:${PORT} da ishga tushdi`);
});

