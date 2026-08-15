import { getDb } from './db.js';

function formatNumber(num) {
  return new Intl.NumberFormat('uz-UZ').format(num);
}

// Call OpenAI GPT-4o / GPT-4o-mini
async function callOpenAiGpt4o(apiKey, model, systemPrompt, conversationHistory, userMessage) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map(m => ({
      role: m.sender === "customer" ? "user" : "assistant",
      content: m.text
    })),
    { role: "user", content: userMessage }
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 800
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API xatolik (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || "";
}

// Call Google Gemini API
async function callGeminiApi(apiKey, model, systemPrompt, conversationHistory, userMessage) {
  const geminiModel = model || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

  const contents = [
    { role: "user", parts: [{ text: `System Instructions:\n${systemPrompt}` }] },
    ...conversationHistory.map(m => ({
      role: m.sender === "customer" ? "user" : "model",
      parts: [{ text: m.text }]
    })),
    { role: "user", parts: [{ text: userMessage }] }
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API xatolik (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.candidates[0]?.content?.parts[0]?.text || "";
}

export async function processCustomerMessage(messageText, conversationHistory = [], leadInfo = {}) {
  const db = getDb();
  const settings = db.settings;
  const products = db.products.filter(p => p.active);
  const faq = db.faq;
  const guardrails = settings.guardrails || {};

  const cleanText = messageText.toLowerCase().trim();

  // 1. Identify Product if mentioned
  let matchedProduct = null;
  for (const p of products) {
    const pName = p.name.toLowerCase();
    if (cleanText.includes(pName)) {
      matchedProduct = p;
      break;
    }
    if (cleanText.includes("15 pro max") && pName.includes("15 pro max")) {
      matchedProduct = p;
      break;
    } else if (cleanText.includes("15 pro") && !cleanText.includes("max") && pName.includes("15 pro") && !pName.includes("max")) {
      matchedProduct = p;
      break;
    } else if ((cleanText.includes("macbook") || cleanText.includes("m2")) && pName.includes("macbook")) {
      matchedProduct = p;
      break;
    } else if (cleanText.includes("airpods") && pName.includes("airpods")) {
      matchedProduct = p;
      break;
    } else if ((cleanText.includes("watch") || cleanText.includes("soat")) && pName.includes("watch")) {
      matchedProduct = p;
      break;
    }
  }

  // Matched product from current message is prioritized

  // 2. Detect Intent, Sentiment & Lead Score
  let intent = "general_inquiry";
  let sentiment = "neutral";
  let stage = "Interest";
  let leadScore = leadInfo.score || 40;
  let isHandoff = false;
  let handoffReason = "";

  // Negative / complaint detection
  if (
    cleanText.includes("yomon") ||
    cleanText.includes("aldov") ||
    cleanText.includes("qimmat ekan") ||
    cleanText.includes("bevafo") ||
    cleanText.includes("sharmandalik") ||
    cleanText.includes("lohotron") ||
    cleanText.includes("yoqmadi") ||
    cleanText.includes("og'riq")
  ) {
    intent = "complaint_negative";
    sentiment = "negative";
    stage = "Lost";
    leadScore = Math.max(10, leadScore - 25);
    if (guardrails.autoHandoffOnNegative) {
      isHandoff = true;
      handoffReason = "Mijoz norozilik bildirdi yoki e'tiroz qildi";
    }
  }
  // Purchase Ready (Hot Lead)
  else if (
    cleanText.includes("olaman") ||
    cleanText.includes("karta") ||
    cleanText.includes("raqam bering") ||
    cleanText.includes("to'lov qil") ||
    cleanText.includes("buyurtma") ||
    cleanText.includes("olib ketaman") ||
    cleanText.includes("dostavka qiling") ||
    cleanText.includes("zakaz") ||
    cleanText.includes("tashlang")
  ) {
    intent = "purchase_ready";
    sentiment = "positive";
    stage = "Purchase";
    leadScore = 95;
    if (guardrails.autoHandoffOnHot) {
      isHandoff = true;
      handoffReason = "Mijoz xaridga 100% tayyor (to'lov / buyurtma)";
    }
  }
  // Operator / Manager request
  else if (
    cleanText.includes("operator") ||
    cleanText.includes("sotuvchi") ||
    cleanText.includes("odam bilan") ||
    cleanText.includes("menejer") ||
    cleanText.includes("admin") ||
    cleanText.includes("telefon qiling")
  ) {
    intent = "manager_request";
    sentiment = "neutral";
    stage = "Consideration";
    leadScore = Math.max(70, leadScore + 15);
    isHandoff = true;
    handoffReason = "Mijoz inson-operator bilan muloqot qilishni so'radi";
  }
  // Installment / Nasiya
  else if (
    cleanText.includes("bo'lib to'lash") ||
    cleanText.includes("bolib tolash") ||
    cleanText.includes("nasiya") ||
    cleanText.includes("rassrochka") ||
    cleanText.includes("oyiga") ||
    cleanText.includes("kredit") ||
    cleanText.includes("uzum nasiya")
  ) {
    intent = "installment_inquiry";
    stage = "Consideration";
    leadScore = Math.max(65, leadScore + 15);
  }
  // Discount / Skidka
  else if (
    cleanText.includes("skidka") ||
    cleanText.includes("chegirma") ||
    cleanText.includes("arzon") ||
    cleanText.includes("tushib") ||
    cleanText.includes("kelishtir") ||
    cleanText.includes("narxini tushiring")
  ) {
    intent = "discount_inquiry";
    stage = "Consideration";
    leadScore = Math.max(60, leadScore + 10);
  }
  // Price inquiry
  else if (
    cleanText.includes("narxi") ||
    cleanText.includes("narx") ||
    cleanText.includes("qancha") ||
    cleanText.includes("necha pul") ||
    cleanText.includes("skolko") ||
    cleanText.includes("nech pul")
  ) {
    intent = "price_inquiry";
    stage = "Interest";
    leadScore = Math.max(50, leadScore + 10);
  }
  // Delivery inquiry
  else if (
    cleanText.includes("yetkazib") ||
    cleanText.includes("dostavka") ||
    cleanText.includes("viloyat") ||
    cleanText.includes("toshkent ichida") ||
    cleanText.includes("pochta")
  ) {
    intent = "delivery_inquiry";
    stage = "Consideration";
    leadScore = Math.max(60, leadScore + 10);
  }
  // Authenticity / Warranty
  else if (
    cleanText.includes("original") ||
    cleanText.includes("kafolat") ||
    cleanText.includes("garantiya") ||
    cleanText.includes("halol") ||
    cleanText.includes("ishonchli")
  ) {
    intent = "warranty_inquiry";
    stage = "Consideration";
    leadScore = Math.max(55, leadScore + 5);
  }
  // Location / working hours
  else if (
    cleanText.includes("manzil") ||
    cleanText.includes("qayerda") ||
    cleanText.includes("dokon") ||
    cleanText.includes("lokatsiya") ||
    cleanText.includes("ish vaqti")
  ) {
    intent = "location_inquiry";
    stage = "Consideration";
    leadScore = Math.max(65, leadScore + 10);
  }
  // Greetings / Casual
  else if (
    cleanText.includes("salom") ||
    cleanText.includes("assalom") ||
    cleanText.includes("qalesiz") ||
    cleanText.includes("privet") ||
    cleanText.includes("yaxshimisiz")
  ) {
    intent = "greeting";
    stage = "Awareness";
    leadScore = Math.max(30, leadScore);
  }
  // General knowledge questions
  else {
    intent = "general_knowledge";
    sentiment = "neutral";
  }

  // 3. Response Generation (via GPT-4o / Gemini API or Enhanced Built-in Agent)
  let responseText = "";

  const aiProvider = settings.aiProvider || "builtin";
  const apiKey = settings.aiApiKey || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  // Build Comprehensive System Prompt for General Knowledge + Sales Agent
  const productsSummary = products.map(p => 
    `- ${p.name}: Narxi ${formatNumber(p.price)} UZS (Eski narx: ${formatNumber(p.oldPrice)} UZS), Zaxirada: ${p.stock} ta, Ranglar: ${p.colors?.join(', ')}, Tavsif: ${p.description}, Oylik to'lov: ${formatNumber(p.installmentMonthly || Math.round(p.price/12))} UZS`
  ).join('\n');

  const faqSummary = faq.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

  const systemPrompt = `Siz "${settings.businessName || 'AppleUz Store'}" do'konining aqlli, universal va yuqori intellektli AI Savdo Yordamchisi va Maslahatchisisiz.
Siz nafaqat do'kon tovarlarini sotasiz, balki mijoz bergan HAR QANDAY umumiy savollarga (texnologiya, solishtirish, dasturlash, hayotiy maslahat, dunyoqarash, hisob-kitob, barcha mavzular) ham to'liq, chuqur, xushmuomala va professional tarzda o'zbek tilida javob bera olasiz!

DO'KON MA'LUMOTLARI VA MAHSULOTLAR:
${productsSummary}

DO'KON QOIDALARI:
- Yetkazib berish: ${settings.deliveryInfo || "Toshkent bo'ylab bepul, viloyatlarga 1 kunda."}
- Bo'lib to'lash: ${settings.installmentInfo || "Uzum Nasiya va Anorbank orqali 3, 6, 12 oyga."}
- Kafolat: ${settings.warrantyInfo || "1 yil rasmiy kafolat."}
- Manzil va ish vaqti: ${settings.address || "Toshkent sh."}, ${settings.workingHours || "09:00 - 21:00"}
- Ruxsat etilgan max chegirma: ${guardrails.maxDiscountPercent || 5}%

SAVOLLARGA JAVOB QOIDALARI:
1. Agar mijoz umumiy mavzuda (masalan: telefon qanday tanlash kerak, sun'iy intellekt nima, texnologiya solishtirish, har qanday savol) so'rasa, unga to'liq va aqlli javob bering, so'ngra muloyimlik bilan kerak bo'lsa do'konimiz xizmatini ham taklif qiling.
2. Agar mijoz do'kon mahsuloti narxi yoki shartlarini so'rasa, faqat yuqoridagi rasmiy ma'lumotlarga tayaning va o'zingizdan narx to'qimang.
3. Agar mijoz xarid qilishga tayyor bo'lsa ("olaman", "karta raqam bering"), darhol xaridni tasdiqlab, katta sotuv menejeri (@ali_sales / +998 90 123 45 67) hozir bog'lanishini ayting.
4. Javoblaringiz samimiy, zamonaviy o'zbek tilida (lotin alifbosida), chiroyli va tushunarli bo'lsin.
${guardrails.systemPromptExtra ? `Qo'shimcha ko'rsatma: ${guardrails.systemPromptExtra}` : ''}`;

  let usedLLM = false;

  // Try calling real OpenAI GPT-4o if configured
  if ((aiProvider === "openai" || settings.aiModel?.startsWith("gpt")) && apiKey) {
    try {
      responseText = await callOpenAiGpt4o(apiKey, settings.aiModel || "gpt-4o-mini", systemPrompt, conversationHistory, messageText);
      usedLLM = true;
    } catch (err) {
      console.warn("OpenAI API call failed, falling back to built-in agent:", err.message);
    }
  } 
  // Try calling Google Gemini if configured
  else if (aiProvider === "gemini" && apiKey) {
    try {
      responseText = await callGeminiApi(apiKey, settings.aiModel || "gemini-1.5-flash", systemPrompt, conversationHistory, messageText);
      usedLLM = true;
    } catch (err) {
      console.warn("Gemini API call failed, falling back to built-in agent:", err.message);
    }
  }

  // Fallback to Rich Built-in Universal AI Sales Agent if LLM was not used or failed
  if (!responseText) {
    if (intent === "purchase_ready") {
      const prodName = matchedProduct ? matchedProduct.name : "tanlangan mahsulot";
      responseText = `Ajoyib qaror! Siz uchun ${prodName} modelini zaxiraga olib qo'ydik. 🎁\n\nTo'lov rekvizitlarini jo'natish va yetkazib berish manzilini aniqlashtirish uchun hozir katta sotuv menejerimiz (@ali_sales / +998 90 123 45 67) sizga to'g'ridan-to'g'ri bog'lanadi. 1 daqiqa kuting!`;
    } else if (intent === "complaint_negative") {
      responseText = `Keltirilgan noqulaylik uchun uzr so'raymiz! Biz uchun har bir mijoz fikri juda muhim. Sizga shaxsan yordam berish va masalani ijobiy hal qilish uchun bosh menejerimiz hozir siz bilan bog'lanadi.`;
    } else if (intent === "manager_request") {
      responseText = `Albatta! Sizni tajribali sotuv menejerimizga ulayapman. Menejerimiz tez orada ushbu chatda sizga javob yozadi yoki telefon orqali aloqaga chiqadi.`;
    } else if (intent === "price_inquiry") {
      if (matchedProduct) {
        const pPrice = formatNumber(matchedProduct.price);
        const colors = matchedProduct.colors?.join(", ") || "mavjud ranglar";
        responseText = `Assalomu alaykum! ${matchedProduct.name} narxi ${pPrice} ${settings.currency || 'UZS'}. Hozirda aksiya doirasida quyidagi ranglari mavjud: ${colors}.\n\nToshkent bo'ylab yetkazib berish mutlaqo bepul! Sizga qaysi rang ko'proq yoqadi?`;
      } else {
        responseText = `Assalomu alaykum! Bizda barcha ommabop Apple mahsulotlari eng maqbul narxlarda mavjud. Aynan qaysi model narxi bilan qiziqyapsiz?`;
      }
    } else if (intent === "installment_inquiry") {
      if (matchedProduct) {
        const monthly = formatNumber(matchedProduct.installmentMonthly || Math.round(matchedProduct.price / 12));
        responseText = `Ha, albatta! ${matchedProduct.name} uchun Uzum Nasiya va Anorbank orqali boshlang'ich to'lovsiz, 12 oyga oyiga bor-yo'g'i ${monthly} ${settings.currency || 'UZS'}dan bo'lib to'lashingiz mumkin.\n\nRasmiylashtirish uchun faqat pasport va plastik karta kifoya. Sizga bo'lib to'lashni rasmiylashtirishga yordam beraylikmi?`;
      } else {
        responseText = `Bizda barcha mahsulotlarni Uzum Nasiya va Anorbank orqali boshlang'ich to'lovsiz 3, 6 yoki 12 oyga qulay bo'lib to'lashga xarid qilishingiz mumkin. Qaysi mahsulotni tanlamoqchisiz?`;
      }
    } else if (intent === "discount_inquiry") {
      const maxDiscount = guardrails.maxDiscountPercent || 5;
      if (matchedProduct) {
        const discountAmount = Math.round(matchedProduct.price * (maxDiscount / 100));
        const discountedPrice = matchedProduct.price - discountAmount;
        responseText = `Bizda narxlar allaqachon eng maqbul ulgurji narxlarda belgilangan. Lekin siz uchun maxsus ${maxDiscount}% chegirma bilan ${formatNumber(discountedPrice)} ${settings.currency || 'UZS'}ga rasmiylashtirib berishimiz mumkin! + Sovg'asiga 20W adapter qo'shib beramiz. Buyurtma qilasizmi?`;
      } else {
        responseText = `Mijozlarimiz uchun bugun maxsus aksiyalarimiz va sovg'alarimiz mavjud! Qaysi mahsulotni tanlasangiz, sizga eng qulay shartlarni taqdim etamiz.`;
      }
    } else if (intent === "delivery_inquiry") {
      responseText = `${settings.deliveryInfo || "Toshkent bo'yicha 2 soatda bepul yetkazib beramiz."}\n\nBuyurtmangizni bugun qabul qilsak, bir necha soat ichida eshigingiz oldida bo'ladi! Qaysi manzilga yetkazib beraylik?`;
    } else if (intent === "warranty_inquiry") {
      responseText = `${settings.warrantyInfo || "1 yil rasmiy kafolat beriladi."} Biz faqat 100% yangi va qutisi ochilmagan (sealed) original qurilmalarni sotamiz. Shuningdek ${settings.returnPolicy || "14 kun ichida almashtirish mumkin."}\n\nQaysi modelni tanladingiz?`;
    } else if (intent === "location_inquiry") {
      responseText = `Bizning do'konimiz manzili: ${settings.address || "Toshkent sh."}.\nIsh vaqtimiz: ${settings.workingHours || "09:00 - 21:00"}.\nTelefon: ${settings.phone || "+998 90 123 45 67"}.\n\nKelishingizdan oldin mahsulotni zaxiraga olib qo'yishimizni xohlaysizmi?`;
    } else if (intent === "greeting") {
      responseText = `Assalomu alaykum! ${settings.businessName || 'AppleUz'} universal AI maslahatchisi va sotuvchisiman. Sizga bugun qanday savol, texnologik maslahat yoki mahsulot tanlashda yordam berishim mumkin?`;
    } else {
      // General Knowledge / FAQ Matching / Intelligent General Advice
      const matchedFaq = faq.find(f => cleanText.includes(f.question.toLowerCase().slice(0, 8)));
      if (matchedFaq) {
        responseText = `${matchedFaq.answer}\n\nYana qanday savollaringiz bor? Sizga mamnuniyat bilan yordam beraman!`;
      } else if (cleanText.includes("solishtir") || cleanText.includes("qaysi biri") || cleanText.includes("farqi nima")) {
        responseText = `Juda o'rinli savol! Tanlov qilishda sizning asosiy ehtiyojingiz muhim:\n` +
          `• Agar sizga ixchamlik, qulaylik va eng so'nggi titan dizayn kerak bo'lsa — iPhone 15 Pro (6.1 dyuym) ajoyib.\n` +
          `• Agar katta ekran, kuchli 5x optik zoom va eng uzoq ishlovchi batareya kerak bo'lsa — iPhone 15 Pro Max (6.7 dyuym) tavsiya etiladi.\n` +
          `• Dasturlash, dizayn yoki ofis ishlari uchun esa jim va yengil MacBook Air M2 eng maqbul variant.\n\n` +
          `Siz ushbu qurilmadan ko'proq qaysi maqsadda foydalanmoqchisiz?`;
      } else if (cleanText.includes("tavsiya") || cleanText.includes("maslahat") || cleanText.includes("qanday tanlasam")) {
        responseText = `Mamnuniyat bilan maslahat beraman! To'g'ri qurilma tanlash uchun quyidagilarga e'tibor bering:\n` +
          `1. Byudjet va to'lov usuli (Naqd yoki Uzum Nasiya orqali bo'lib to'lash)\n` +
          `2. Asosiy maqsad: Suratga olish, o'yinlar, kundalik ishlar yoki biznes\n` +
          `3. Xotira hajmi: Kamida 256GB tavsiya etiladi (video va ilovalar uchun yetarli)\n\n` +
          `Sizni aynan qaysi toifadagi qurilma ko'proq qiziqtiryapti?`;
      } else if (cleanText.includes("dasturlash") || cleanText.includes("kasb") || cleanText.includes("it") || cleanText.includes("sun'iy intellekt") || cleanText.includes("ai")) {
        responseText = `IT va zamonaviy texnologiyalar sohasida bugungi kunda eng talabgir yo'nalishlar:\n` +
          `1. Sun'iy Intellekt va Machine Learning (AI Engineering)\n` +
          `2. Web va Mobile Dasturlash (Full-Stack, Flutter, React)\n` +
          `3. Kiberxavfsizlik va DevOps\n` +
          `4. Data Analytics va Biznes Tahlil\n\n` +
          `Dasturlash va IT ishlari uchun eng qulay noutbuk bu shubhasiz Apple MacBook Air / Pro (M2/M3 chip). Do'konimizda ushbu modellarni eng qulay bo'lib to'lash shartlari bilan xarid qilishingiz mumkin! Qiziqasizmi?`;
      } else if (cleanText.includes("biznes") || cleanText.includes("sotuv") || cleanText.includes("daromad")) {
        responseText = `Biznesni rivojlantirish va sotuvlarni oshirishning eng muhim qoidalari:\n` +
          `1. Mijozlar xabarlariga 0 soniyada tezkor va professional javob qaytarish (AI Sotuvchi yordamida).\n` +
          `2. Issiq xaridorlarni (Hot Leads) aniqlab, darhol sotuvchiga yo'naltirish.\n` +
          `3. Yo'qolib qolgan mijozlarga avtomatlashtirilgan eslatmalar (Follow-up) yuborish.\n\n` +
          `Bizning tizimimiz aynan shu jarayonlarni 100% avtomatlashtirib beradi. Siz qaysi sohada biznes yuritasiz?`;
      } else {
        responseText = `Savolingiz uchun tashakkur! Men universal AI agent sifatida har qanday mavzudagi savollarga (texnologiya, dasturlash, biznes, solishtirish, maslahatlar) to'liq javob bera olaman.\n\n` +
          `Shuningdek, do'konimiz mahsulotlari (smartfon, noutbuk, aksessuarlar), bo'lib to'lash yoki yetkazib berish bo'yicha ham yordam berishim mumkin. Sizga qanday qo'shimcha ma'lumot kerak? 😊`;
      }
    }
  }

  // Determine overall lead category (Hot, Warm, Cold, Lost)
  let status = "contacted";
  if (leadScore >= 80) {
    status = "hot";
  } else if (leadScore >= 60) {
    status = "interested";
  } else if (sentiment === "negative" || leadScore <= 20) {
    status = "lost";
  }

  return {
    response: responseText,
    intent,
    sentiment,
    stage,
    score: leadScore,
    status,
    matchedProduct: matchedProduct ? matchedProduct.name : (leadInfo.interestProduct || ""),
    productPrice: matchedProduct ? matchedProduct.price : (leadInfo.productPrice || 0),
    isHandoff,
    handoffReason,
    usedLLM
  };
}
