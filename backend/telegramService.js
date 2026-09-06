import { Telegraf } from 'telegraf';
import { getDb, saveDb } from './db.js';
import { processCustomerMessage } from './aiEngine.js';

let botInstance = null;
let isRunning = false;

export async function sendHotLeadNotification(lead, reason) {
  const db = getDb();
  const token = db.settings.telegramBotToken;
  const managerChatId = db.settings.telegramManagerChatId;

  if (!token || !managerChatId) return;

  try {
    const tempBot = botInstance || new Telegraf(token);
    const msg = `🔥 <b>YANGI HOT LEAD ANIQLANDI!</b>\n\n` +
      `👤 <b>Mijoz:</b> ${lead.name || "Noma'lum"} (${lead.username || "username yo'q"})\n` +
      `📞 <b>Telefon:</b> ${lead.phone || "Kiritilmagan"}\n` +
      `📦 <b>Mahsulot:</b> ${lead.interestProduct || "Ko'rsatilmagan"}\n` +
      `💰 <b>Qiymat:</b> ${new Intl.NumberFormat('uz-UZ').format(lead.productPrice || 0)} UZS\n` +
      `🎯 <b>Bosqich:</b> ${lead.stage || "Purchase"} (Score: ${lead.score}/100)\n` +
      `💬 <b>Sabab:</b> ${reason || "Xaridga tayyor"}\n\n` +
      `⚡ <i>Iltimos, zudlik bilan mijoz bilan bog'laning!</i>`;

    await tempBot.telegram.sendMessage(managerChatId, msg, { parse_mode: 'HTML' });
  } catch (err) {
    console.error("Managerga Hot Lead xabarini jo'natishda xatolik:", err.message);
  }
}

export async function startTelegramBot(token) {
  if (!token) return { success: false, message: "Bot tokeni kiritilmagan" };

  try {
    if (botInstance && isRunning) {
      try {
        botInstance.stop('RESTART');
      } catch (e) {
        console.warn("Eski bot to'xtatish:", e.message);
      }
      isRunning = false;
    }

    const bot = new Telegraf(token);

    // Bot tokenining haqiqiy va to'g'riligini Telegram API dan tekshirish
    const botInfo = await bot.telegram.getMe();
    console.log(`Telegram bot tasdiqlandi: @${botInfo.username}`);

    bot.catch((err, ctx) => {
      console.error(`Telegram bot xatosi [${ctx?.updateType}]:`, err.message);
    });

    bot.start(async (ctx) => {
      const db = getDb();
      const userName = ctx.from.first_name + (ctx.from.last_name ? ` ${ctx.from.last_name}` : '');
      const username = ctx.from.username ? `@${ctx.from.username}` : '';
      const chatId = String(ctx.chat.id);

      // check if lead exists or create
      let lead = db.leads.find(l => l.phone === chatId || l.username === username);
      if (!lead) {
        lead = {
          id: `lead-${Date.now()}`,
          name: userName,
          phone: chatId,
          username: username,
          channel: "Telegram",
          status: "new",
          score: 35,
          interestProduct: db.products[0]?.name || "iPhone 15 Pro",
          productPrice: db.products[0]?.price || 12500000,
          assignedManager: "Ali Valiyev",
          sentiment: "neutral",
          stage: "Awareness",
          intent: "greeting",
          lastMessageTime: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
          lastMessage: "/start",
          unread: true,
          followUpStatus: "pending",
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          notes: ""
        };
        db.leads.unshift(lead);
        db.conversations[lead.id] = [];
        saveDb(db);
      }

      const welcomeMsg = `Assalomu alaykum, ${ctx.from.first_name}! 👋\n` +
        `${db.settings.businessName} rasmiy AI sotuvchi yordamchisiga xush kelibsiz.\n\n` +
        `Sizga qaysi mahsulotimiz narxi, xususiyatlari yoki yetkazib berish shartlari qiziq?`;

      db.conversations[lead.id].push(
        { sender: "customer", text: "/start", time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) },
        { sender: "ai", text: welcomeMsg, time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) }
      );
      saveDb(db);

      await ctx.reply(welcomeMsg);
    });

    bot.on('text', async (ctx) => {
      const userText = ctx.message.text;
      const userName = ctx.from.first_name + (ctx.from.last_name ? ` ${ctx.from.last_name}` : '');
      const username = ctx.from.username ? `@${ctx.from.username}` : '';
      const chatId = String(ctx.chat.id);
      const db = getDb();

      // Find or create lead
      let lead = db.leads.find(l => l.phone === chatId || l.username === username);
      if (!lead) {
        lead = {
          id: `lead-${Date.now()}`,
          name: userName,
          phone: chatId,
          username: username,
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
          lastMessage: userText,
          unread: true,
          followUpStatus: "pending",
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          notes: ""
        };
        db.leads.unshift(lead);
        db.conversations[lead.id] = [];
      }

      const history = db.conversations[lead.id] || [];

      // AI Analysis & Response
      const aiResult = await processCustomerMessage(userText, history, lead);

      // Update lead
      lead.lastMessageTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      lead.lastMessage = userText;
      lead.sentiment = aiResult.sentiment;
      lead.stage = aiResult.stage;
      lead.score = aiResult.score;
      lead.intent = aiResult.intent;
      if (aiResult.status === "hot" || aiResult.isHandoff) {
        lead.status = "hot";
      } else if (aiResult.status) {
        lead.status = aiResult.status;
      }
      if (aiResult.matchedProduct) {
        lead.interestProduct = aiResult.matchedProduct;
        lead.productPrice = aiResult.productPrice;
      }

      // Add messages to history
      const timeNow = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      history.push({ sender: "customer", text: userText, time: timeNow, intent: aiResult.intent });
      history.push({ sender: "ai", text: aiResult.response, time: timeNow, isHandoff: aiResult.isHandoff });
      db.conversations[lead.id] = history;

      // Update analytics
      db.analytics.todayLeads = db.leads.length;
      db.analytics.todayAiHandled += 1;
      if (aiResult.isHandoff) {
        db.analytics.todayHandoffs += 1;
      }
      saveDb(db);

      // Send telegram reply
      await ctx.reply(aiResult.response);

      // If hot lead handoff, send alert to manager chat
      if (aiResult.isHandoff || aiResult.status === "hot") {
        sendHotLeadNotification(lead, aiResult.handoffReason);
      }
    });

    bot.launch().catch((err) => {
      console.error("Bot launch xatosi:", err.message);
      isRunning = false;
    });

    botInstance = bot;
    isRunning = true;
    const db = getDb();
    db.settings.botActive = true;
    saveDb(db);

    console.log(`Telegram bot muvaffaqiyatli ishga tushirildi (@${botInfo.username})`);
    return { success: true, message: `Bot (@${botInfo.username}) muvaffaqiyatli ishga tushirildi!` };
  } catch (err) {
    console.error("Telegram botni ishga tushirishda xatolik:", err.message);
    isRunning = false;
    const msg = err.description || err.message || "Telegram bilan bog'lanib bo'lmadi";
    return { success: false, message: "Telegram xatosi: " + msg };
  }
}

export function stopTelegramBot() {
  if (botInstance && isRunning) {
    try {
      botInstance.stop('STOP_REQUEST');
      isRunning = false;
      const db = getDb();
      db.settings.botActive = false;
      saveDb(db);
      return { success: true, message: "Bot to'xtatildi" };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
  return { success: true, message: "Bot allaqachon to'xtatilgan" };
}

export function getBotStatus() {
  return { isRunning };
}
