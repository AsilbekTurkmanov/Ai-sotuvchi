import { getDb } from './db.js';

function formatNumber(num) {
  return new Intl.NumberFormat('uz-UZ').format(num);
}

// O'zbek shevalari va og'zaki nutq so'zlarini standartlashtirish (Dialect Normalizer)
export function normalizeUzbekDialect(text) {
  if (!text) return "";
  let res = text.trim();
  const replacements = [
    { from: /\bqatta(siz|da)?\b/gi, to: "qayerda" },
    { from: /\bob ket(aman|amiz|ay)\b/gi, to: "olib ketaman" },
    { from: /\btushib berin(g)?\b/gi, to: "arzon qilib bering" },
    { from: /\bkelishtir(vorin|ing|ib berin)\b/gi, to: "chegirma qilib bering" },
    { from: /\bqancha bo'l(yapti|votti|otti)\b/gi, to: "narxi qancha" },
    { from: /\bnech pul\b/gi, to: "narxi qancha" },
    { from: /\bnecha pul\b/gi, to: "narxi qancha" },
    { from: /\bskolko\b/gi, to: "narxi qancha" },
    { from: /\bkarta nomer\b/gi, to: "karta raqam" },
    { from: /\bnomeringizni tashlang\b/gi, to: "telefon raqamingizni bering" },
    { from: /\bzvanit qilin(g)?\b/gi, to: "telefon qiling" },
    { from: /\brashrochka|rassrochka\b/gi, to: "bo'lib to'lash" },
    { from: /\bnasiyaga bormi\b/gi, to: "bo'lib to'lash bormi" },
    { from: /\bgarantiya\b/gi, to: "kafolat" },
    { from: /\bdastavka\b/gi, to: "yetkazib berish" },
    { from: /\boriginalmi\b/gi, to: "asl originalmi" },
    { from: /\bpadarka\b/gi, to: "sovg'a" },
    { from: /\bskidka\b/gi, to: "chegirma" },
    { from: /\baktsiya\b/gi, to: "aksiya" },
    { from: /\bnaxodka\b/gi, to: "arzon" },
    { from: /\byaxshisi qaysi\b/gi, to: "qaysi biri yaxshi" },
    { from: /\bsolish\b/gi, to: "solishtirish" },
    { from: /\bpochet\b/gi, to: "pochta" }
  ];

  for (const r of replacements) {
    res = res.replace(r.from, r.to);
  }
  return res;
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

/**
 * Universal Intelligent Rule-based NLP Engine (O'zbek tilida chuqur bilimlar va savdo mexanizmi)
 */
function generateIntelligentResponse(cleanText, rawText, products, faq, settings, guardrails, matchedProduct, intent) {
  const currency = settings.currency || 'UZS';
  const businessName = settings.businessName || 'AppleUz';
  const maxDiscount = guardrails.maxDiscountPercent ?? 5;

  // 1. BUYURTMA VA XARIDGA TAYYOR (PURCHASE READY / HOT LEAD)
  if (intent === "purchase_ready") {
    const prodName = matchedProduct ? matchedProduct.name : "tanlagan mahsulotingiz";
    const prodPrice = matchedProduct ? ` (${formatNumber(matchedProduct.price)} ${currency})` : "";
    return `Ajoyib va juda to'g'ri qaror! Siz uchun ${prodName}${prodPrice} modelini zaxiraga olib qo'ydik. 🎁\n\n` +
      `To'lovni Click, Payme yoki karta orqali amalga oshirishingiz mumkin.\n` +
      `Karta raqamimiz: 8600 **** **** 1234 (${businessName} rasmiy hisobi).\n\n` +
      `To'lov kvitansiyasini va yetkazib berish manzilini yuborsangiz, katta sotuv menejerimiz (@ali_sales / +998 90 123 45 67) zudlik bilan buyurtmangizni kuryerga topshiradi!`;
  }

  // 2. SHIKOYAT VA E'TIROZ (COMPLAINT / NEGATIVE)
  if (intent === "complaint_negative") {
    return `Keltirilgan noqulaylik yoki e'tirozingiz uchun chin dildan uzr so'raymiz! Biz uchun har bir mijozning fikri va mamnuniyati birinchi o'rinda turadi.\n\n` +
      `Ushbu masalani shaxsan va siz uchun eng qulay tarzda ijobiy hal qilish uchun bosh menejerimiz (@ali_sales / +998 90 123 45 67) hozir siz bilan to'g'ridan-to'g'ri bog'lanadi.`;
  }

  // 3. MENEJER YOKI OPERATOR BILAN GAPLASHISH
  if (intent === "manager_request") {
    return `Albatta! Sizni tajribali inson-sotuvchi menejerimizga ulayapman.\n\n` +
      `Menejerimiz: Ali Valiyev (@ali_sales / +998 90 123 45 67).\n` +
      `Menejerimiz hozir chatga qo'shiladi yoki telefon orqali siz bilan bog'lanadi. Yana qandaydir savollaringiz bo'lsa, yozib qoldirishingiz mumkin!`;
  }

  // 4. HAMMA MAHSULOTLAR / TO'LIQ KATALOG VA NARXLAR RO'YXATI
  if (
    intent === "catalog_inquiry" ||
    cleanText.includes("katalog") ||
    cleanText.includes("ro'yxat") ||
    cleanText.includes("royxat") ||
    cleanText.includes("barcha tovar") ||
    cleanText.includes("hamma tovar") ||
    cleanText.includes("barcha mahsulot") ||
    cleanText.includes("hamma mahsulot") ||
    cleanText.includes("qanday tovar") ||
    cleanText.includes("qanaqa mahsulotlar bor") ||
    cleanText.includes("nimalar bor") ||
    cleanText.includes("assortiment")
  ) {
    let list = products.map((p, idx) => 
      `${idx + 1}. 📱 **${p.name}**\n   • Narxi: ${formatNumber(p.price)} ${currency} (Eski narx: ${formatNumber(p.oldPrice)} ${currency})\n   • Muddatli to'lov: oyiga ${formatNumber(p.installmentMonthly || Math.round(p.price/12))} ${currency}dan\n   • Ranglar: ${p.colors?.join(', ') || 'Mavjud'}\n   • Zaxirada: ${p.stock} dona mavjud`
    ).join('\n\n');

    return `Bizning "${businessName}" do'konimizdagi rasmiy va original mahsulotlar katalogi:\n\n${list}\n\n` +
      `🚚 Barcha tovarlarga 1 yillik rasmiy kafolat va Toshkent bo'ylab bepul yetkazib berish xizmati mavjud.\n` +
      `Sizga aynan qaysi model ko'proq ma'qul bo'lyapti?`;
  }

  // 5. TAQQOSLASH (COMPARISONS: iPhone 15 Pro vs Pro Max, MacBook Air vs Pro, M2 vs M3, iOS vs Android)
  if (
    cleanText.includes("solishtir") ||
    cleanText.includes("farqi nima") ||
    cleanText.includes("farqi bormi") ||
    cleanText.includes("qaysi biri yaxshi") ||
    cleanText.includes("qaysi birini olsam") ||
    cleanText.includes("pro yoki pro max") ||
    cleanText.includes("m2 yoki m3") ||
    cleanText.includes("taqqosla")
  ) {
    if (cleanText.includes("max") || cleanText.includes("15 pro")) {
      return `iPhone 15 Pro va iPhone 15 Pro Max o'rtasidagi asosiy farqlar:\n\n` +
        `1. 📱 **Ekran va O'lcham:**\n` +
        `   • iPhone 15 Pro: 6.1 dyuymli ixcham, cho'ntakbop va bir qo'lda ishlatishga juda qulay.\n` +
        `   • iPhone 15 Pro Max: 6.7 dyuymli ulkan ekran — video tomosha qilish, o'yinlar va ish uchun ajoyib.\n\n` +
        `2. 📸 **Kamera Imkoniyati:**\n` +
        `   • 15 Pro: 3x optik zoom (telephoto).\n` +
        `   • 15 Pro Max: 5x optik tetraprisma zoom — uzoq masofadagi ob'ektlarni sifatini yo'qotmasdan suratga oladi.\n\n` +
        `3. 🔋 **Batareya quvvati:**\n` +
        `   • 15 Pro: 3274 mAh (1 kunga bemalol yetadi).\n` +
        `   • 15 Pro Max: 4422 mAh (eng uzoq ishlovchi iPhone batareyasi — 1.5-2 kungacha).\n\n` +
        `💡 **Tavsiyamiz:** Agar ixchamlik va yengillik muhim bo'lsa — **iPhone 15 Pro** (12 500 000 UZS), agar katta ekran, 5x zoom va eng kuchli batareya kerak bo'lsa — **iPhone 15 Pro Max** (14 200 000 UZS) tanlang!`;
    }

    if (cleanText.includes("macbook") || cleanText.includes("air") || cleanText.includes("pro") || cleanText.includes("m2") || cleanText.includes("m3")) {
      return `MacBook Air M2 va MacBook Air M3 / Pro modellari taqqoslashi:\n\n` +
        `• **MacBook Air M2 (13.6")**: 11 800 000 UZS — Yupqa, ventilyatorsiz jim ishlaydi, 18 soat batareya. Dasturlash, ofis, talabalar, dizayn va kundalik biznes uchun eng ideal va hamyonbop variant.\n` +
        `• **MacBook Air M3**: Yangi arxitektura, Ray Tracing grafikasi, 2 tagacha tashqi monitor ulash imkoniyati.\n` +
        `• **MacBook Pro (M2/M3 Pro/Max)**: Og'ir 3D render, 4K/8K video montaj va murakkab dasturiy ta'minot yaratish uchun faol sovutish tizimli flagman.\n\n` +
        `Siz noutbukdan qaysi sohada (dasturlash, dizayn, ofis yoki o'qish) foydalanmoqchisiz?`;
    }

    if (cleanText.includes("android") || cleanText.includes("samsung")) {
      return `iPhone va Android (Samsung) solishtirganda Apple qurilmalarining asosiy ustunliklari:\n\n` +
        `1. 🍏 **Ekotizim va qulaylik:** iPhone, MacBook, Apple Watch va AirPods bir-biri bilan bir zumda ulanadi va sinxron ishlaydi.\n` +
        `2. 🔒 **Xavfsizlik va Maxfiylik:** iOS tizimi viruslardan himoyalangan va 5-6 yil davomida uzluksiz yangilanadi.\n` +
        `3. 💎 **Qadrini saqlashi (Likvidlik):** 2-3 yildan keyin ham iPhoneni ikkilamchi bozorda qimmat narxda sotish yoki Trade-In qilish mumkin.\n` +
        `4. ⚡ **A17 Pro / M Series protsessorlar:** Ilg'or tezlik va barqarorlik.\n\n` +
        `Do'konimizda barcha modellar rasmiy kafolat bilan mavjud!`;
    }

    return `Taqqoslash bo'yicha maslahat:\n` +
      `• **Smartfonlar:** iPhone 15 Pro (ixcham, 120Hz) va 15 Pro Max (katta ekran, 5x zoom, kuchli batareya).\n` +
      `• **Noutbuklar:** MacBook Air M2/M3 (jim, yengil, 18 soat zaryad) dasturlash va ish uchun eng zo'r tanlov.\n` +
      `• **Aksessuarlar:** AirPods Pro 2 (shovqinni bekor qilish) va Apple Watch Series 9 (salomatlik va xabarlar).\n\n` +
      `Qaysi aniq modellarni bir-biri bilan solishtirib beraylik?`;
  }

  // 6. TEXNIK PARAMETRLAR VA XUSUSIYATLAR (SPECIFICATIONS)
  if (
    cleanText.includes("kamera") ||
    cleanText.includes("batareya") ||
    cleanText.includes("protsessor") ||
    cleanText.includes("ekran") ||
    cleanText.includes("hz") ||
    cleanText.includes("xotira") ||
    cleanText.includes("gb") ||
    cleanText.includes("ram") ||
    cleanText.includes("chip") ||
    cleanText.includes("suvga") ||
    cleanText.includes("ip68") ||
    cleanText.includes("zaryad") ||
    cleanText.includes("type-c") ||
    cleanText.includes("xususiyat") ||
    cleanText.includes("harakteristika")
  ) {
    if (matchedProduct) {
      return `📌 **${matchedProduct.name}** ning to'liq texnik xususiyatlari:\n\n` +
        `• **Protsessor:** ${matchedProduct.name.includes("iPhone") ? "Apple A17 Pro (3nm texprotsess, Ray Tracing o'yinlar uchun)" : matchedProduct.name.includes("MacBook") ? "Apple M2 chip (8-core CPU, 10-core GPU)" : "Apple S9 / H2 chip"}\n` +
        `• **Tavsif:** ${matchedProduct.description}\n` +
        `• **Xususiyatlari:** ${matchedProduct.features}\n` +
        `• **Mavjud ranglar:** ${matchedProduct.colors?.join(", ")}\n` +
        `• **Narxi:** ${formatNumber(matchedProduct.price)} ${currency}\n` +
        `• **Bo'lib to'lash:** oyiga ${formatNumber(matchedProduct.installmentMonthly || Math.round(matchedProduct.price/12))} ${currency}dan\n` +
        `• **Kafolat:** 1 yil to'liq rasmiy kafolat\n\n` +
        `Ushbu model bo'yicha yana qanday texnik savolingiz bor?`;
    }
  }

  // 7. BO'LIB TO'LASH VA NASIYA SAVDOLARI (INSTALLMENTS / NASIYA)
  if (
    intent === "installment_inquiry" ||
    cleanText.includes("nasiya") ||
    cleanText.includes("bo'lib to'lash") ||
    cleanText.includes("bolib tolash") ||
    cleanText.includes("rassrochka") ||
    cleanText.includes("oyiga") ||
    cleanText.includes("kredit") ||
    cleanText.includes("uzum") ||
    cleanText.includes("anorbank")
  ) {
    if (matchedProduct) {
      const monthly12 = formatNumber(matchedProduct.installmentMonthly || Math.round(matchedProduct.price / 12));
      const monthly6 = formatNumber(Math.round((matchedProduct.price * 1.08) / 6));
      const monthly3 = formatNumber(Math.round((matchedProduct.price * 1.04) / 3));

      return `Ha, albatta! **${matchedProduct.name}** uchun muddatli to'lov (nasiya) shartlari juda qulay:\n\n` +
        `💳 **To'lov rejalari (Boshlang'ich to'lovsiz — 0%):**\n` +
        `• 12 oyga: oyiga **${monthly12} ${currency}**\n` +
        `• 6 oyga: oyiga **${monthly6} ${currency}**\n` +
        `• 3 oyga: oyiga **${monthly3} ${currency}**\n\n` +
        `📋 **Kerakli hujjatlar:** Faqatgina Pasport (yoki ID karta) va 6 oy davomida tushum bo'lgan plastik karta kifoya!\n` +
        `🏦 Hamkorlarimiz: **Uzum Nasiya**, **Anorbank**, **Alif Nasiya** orqali 3 daqiqada onlayn tasdiqlanadi.\n\n` +
        `Rasmiylashtirishni boshlaymizmi?`;
    }

    return `Bizda barcha mahsulotlarni boshlang'ich to'lovsiz 3, 6 va 12 oylik qulay muddatli to'lovga (nasiya) olishingiz mumkin!\n\n` +
      `• Hamkorlar: **Uzum Nasiya**, **Anorbank**, **Alif Nasiya**\n` +
      `• Kerakli narsa: Faqat Pasport va plastik karta\n` +
      `• Tasdiqlash vaqti: 3-5 daqiqa ichida onlayn\n\n` +
      `Aynan qaysi modelni bo'lib to'lashga hisoblab beraylik? (iPhone 15 Pro, Pro Max, MacBook Air, Apple Watch, AirPods)`;
  }

  // 8. CHEGIRMA, SKIDKA VA SAVDOLASHISH (DISCOUNTS & NEGOTIATION)
  if (
    intent === "discount_inquiry" ||
    cleanText.includes("chegirma") ||
    cleanText.includes("skidka") ||
    cleanText.includes("tushib") ||
    cleanText.includes("arzon") ||
    cleanText.includes("kelishtir") ||
    cleanText.includes("oxirgi narx")
  ) {
    if (matchedProduct) {
      const discountAmount = Math.round(matchedProduct.price * (maxDiscount / 100));
      const finalPrice = matchedProduct.price - discountAmount;

      return `Bizning do'konda narxlar allaqachon eng maqbul ulgurji tarifda belgilangan. Lekin siz uchun maxsus:\n\n` +
        `🎁 **Maxsus taklifimiz:**\n` +
        `• ${matchedProduct.name} narxi: ~~${formatNumber(matchedProduct.price)}~~ ➡️ **${formatNumber(finalPrice)} ${currency}** (${maxDiscount}% maxsus chegirma!)\n` +
        `• Sovg'asiga: Original 20W USB-C tezkor adapter va himoya oynasi bepul qo'shib beriladi!\n` +
        `• Toshkent bo'ylab yetkazib berish — mutlaqo BEPUL.\n\n` +
        `Shu shartlar bilan siz uchun band qilib qo'yaylikmi?`;
    }

    return `Mijozlarimiz uchun bugun maxsus aksiyalarimiz va sovg'alarimiz mavjud!\n` +
      `Tanlangan har bir smartfon yoki noutbuk uchun ${maxDiscount}% gacha maxsus chegirma hamda qo'shimcha qimmatbaho aksessuarlar sovg'a qilinadi.\n` +
      `Siz aynan qaysi modelga chegirma olmoqchisiz?`;
  }

  // 8. YETKAZIB BERISH (DELIVERY)
  if (
    intent === "delivery_inquiry" ||
    cleanText.includes("yetkaz") ||
    cleanText.includes("dostavka") ||
    cleanText.includes("viloyat") ||
    cleanText.includes("samarqand") ||
    cleanText.includes("buxoro") ||
    cleanText.includes("andijon") ||
    cleanText.includes("farg'ona") ||
    cleanText.includes("namangan") ||
    cleanText.includes("qashqadaryo") ||
    cleanText.includes("surxondaryo") ||
    cleanText.includes("xorazm") ||
    cleanText.includes("navoiy") ||
    cleanText.includes("jizzax") ||
    cleanText.includes("sirdaryo") ||
    cleanText.includes("qoraqalpog'")
  ) {
    return `Yetkazib berish xizmati qoidalari:\n\n` +
      `🚀 **Toshkent shahri bo'yicha:**\n` +
      `• Buyurtma tasdiqlangach 2 soat ichida mutlaqo **BEPUL** yetkazib beramiz.\n\n` +
      `📦 **O'zbekistonning barcha viloyatlariga (Samarqand, Buxoro, Andijon, Farg'ona, Namangan, Qashqadaryo va boshqalar):**\n` +
      `• BTS pochta, Fargo yoki kuryerlik xizmati orqali **1 kunda** xavfsiz va sug'urtalangan holda yetkaziladi (Yetkazish narxi: 35 000 - 45 000 so'm).\n` +
      `• Mahsulotni qabul qilib olib, tekshirib keyin qabul qilasiz.\n\n` +
      `Siz qaysi shahar yoki tumanga buyurtma bermoqchisiz?`;
  }

  // 9. NARX SO'RASH (PRICE INQUIRY)
  if (intent === "price_inquiry" || cleanText.includes("narx") || cleanText.includes("qancha")) {
    if (matchedProduct) {
      const monthly = formatNumber(matchedProduct.installmentMonthly || Math.round(matchedProduct.price / 12));
      return `**${matchedProduct.name}** narxi hozirgi aksiyamiz doirasida:\n\n` +
        `💰 **Naqd / Karta narxi:** ${formatNumber(matchedProduct.price)} ${currency} (Eski narx: ${formatNumber(matchedProduct.oldPrice)} ${currency})\n` +
        `💳 **Muddatli to'lovga (12 oy):** oyiga ${monthly} ${currency}dan (boshlang'ich to'lovsiz)\n` +
        `🎨 **Mavjud ranglar:** ${matchedProduct.colors?.join(", ")}\n` +
        `📦 **Holati:** 100% Yangi, ochilmagan (Sealed), 1 yil rasmiy kafolat.\n` +
        `🚚 Toshkent bo'ylab 2 soatda yetkazib berish bepul!\n\n` +
        `Sizga qaysi rang varianti ko'proq yoqadi?`;
    }

    return `Bizda barcha ommabop Apple mahsulotlari eng maqbul narxlarda mavjud:\n` +
      `• iPhone 15 Pro 256GB — 12 500 000 UZS\n` +
      `• iPhone 15 Pro Max 256GB — 14 200 000 UZS\n` +
      `• MacBook Air M2 13.6" 8/256GB — 11 800 000 UZS\n` +
      `• AirPods Pro 2 (Type-C) — 2 450 000 UZS\n` +
      `• Apple Watch Series 9 45mm — 4 600 000 UZS\n\n` +
      `Sizni aynan qaysi model narxi qiziqtiryapti?`;
  }

  // 11. KAFOLAT, ORIGINAL VA ALMASHTIRISH (WARRANTY & AUTHENTICITY & TRADE-IN)
  if (
    intent === "warranty_inquiry" ||
    cleanText.includes("kafolat") ||
    cleanText.includes("original") ||
    cleanText.includes("garantiya") ||
    cleanText.includes("almashtir") ||
    cleanText.includes("trade-in") ||
    cleanText.includes("trade in") ||
    cleanText.includes("qaytarish")
  ) {
    return `Bizning kafolat va ishonchlilik kafolati:\n\n` +
      `1. 🛡️ **100% Original:** Faqat rasmiy zavod muhrlangan (sealed) xalqaro Apple qurilmalari sotiladi. IMEI kodi to'liq ro'yxatdan o'tgan.\n` +
      `2. 📄 **1 Yillik Rasmiy Kafolat:** Barcha qurilmalarga 1 yil rasmiy servis kafolat taloni beriladi.\n` +
      `3. 🔄 **14 Kunlik almashtirish:** Agar mahsulotda zavod nuqsoni aniqlansa, 14 kun ichida yangisiga almashtirib beriladi.\n` +
      `4. 🔄 **Trade-In Xizmati:** Eski iPhone modelingizni do'konga olib kelsangiz, uni bozor narxida hisoblab, yangisiga ustama to'lab almashtirib ketishingiz mumkin.\n\n` +
      `Qaysi qurilma bo'yicha kafolat haqida bilmoqchisiz?`;
  }

  // 12. DO'KON MANZILI VA ISH VAQTI (LOCATION & HOURS)
  if (
    intent === "location_inquiry" ||
    cleanText.includes("manzil") ||
    cleanText.includes("qayerda") ||
    cleanText.includes("dokon") ||
    cleanText.includes("joylashgan") ||
    cleanText.includes("ish vaqti") ||
    cleanText.includes("lokatsiya")
  ) {
    return `Do'konimiz ma'lumotlari:\n\n` +
      `📍 **Manzil:** ${settings.address || "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi, 15-uy"}\n` +
      `⏰ **Ish vaqtimiz:** ${settings.workingHours || "Dushanba - Yakshanba: 09:00 dan 21:00 gacha (dam olish kunlarisiz)"}\n` +
      `📞 **Aloqa:** ${settings.phone || "+998 90 123 45 67"}\n` +
      `💬 **Telegram:** @ali_sales\n\n` +
      `Kelishingizdan oldin mahsulotni siz uchun zaxiraga olib qo'yishimizni xohlaysizmi?`;
  }

  // 13. DASTURLASH, IT VA KASBLAR BO'YICHA MASLAHATLAR
  if (
    cleanText.includes("dasturlash") ||
    cleanText.includes("it noutbuk") ||
    cleanText.includes("dasturchi") ||
    cleanText.includes("frontend") ||
    cleanText.includes("backend") ||
    cleanText.includes("flutter") ||
    cleanText.includes("ios dasturlash") ||
    cleanText.includes("python") ||
    cleanText.includes("javascript") ||
    cleanText.includes("grafik dizayn") ||
    cleanText.includes("video montaj") ||
    cleanText.includes("noutbuk tanlash")
  ) {
    return `IT va Dasturlash sohalari uchun professional tavsiyalarimiz:\n\n` +
      `💻 **Dasturlash uchun eng zo'r noutbuklar:**\n` +
      `1. **MacBook Air M2 / M3 (13.6" yoki 15")**: Web (Frontend/Backend), Python, Data Science, Flutter va DevOps uchun ideal. Ventilyatorsiz 100% jim, 18 soatgacha quvvat saqlaydi va qizimaydi.\n` +
      `2. **MacBook Pro 14" / 16" (M2/M3 Pro)**: iOS Native dasturlash (Xcode simulatorlar), og'ir Docker konteynerlar, 3D modellashtirish (Blender) va 4K montaj uchun eng baquvvat flagman.\n\n` +
      `🎯 **Nega MacBook dasturchilar orasida 1-o'rinda?**\n` +
      `• UNIX asosidagi barqaror macOS tizimi\n` +
      `• Barcha dasturlash kutubxonalari va terminal qulayligi\n` +
      `• Dunyodagi eng yaxshi klaviatura va trekpad\n\n` +
      `Do'konimizda **MacBook Air M2 8/256GB** hozir atigi **11 800 000 UZS** yoki Uzum Nasiya orqali oyiga **1 180 000 UZS**dan mavjud!`;
  }

  // 14. SUN'IY INTELLEKT (AI), KELAJAK VA TEXNOLOGIYALAR
  if (
    cleanText.includes("sun'iy intellekt") ||
    cleanText.includes("ai nima") ||
    cleanText.includes("chatgpt") ||
    cleanText.includes("gemini") ||
    cleanText.includes("kelajak") ||
    cleanText.includes("texnologiya")
  ) {
    return `Sun'iy Intellekt (AI) — inson aqliy vazifalarini (matn yaratish, tahlil qilish, ovozli muloqot, qaror qabul qilish, tasvirlarni aniqlash) avtomatlashtiruvchi zamonaviy algoritmlar to'plamidir.\n\n` +
      `🚀 **Bugungi kunda AI imkoniyatlari:**\n` +
      `1. **Savdoni avtomatlashtirish:** Mijozlar savollariga 24/7 rejimida sekundiga javob berish (xuddi bizning tizimimiz kabi).\n` +
      `2. **Dasturlash va Ijod:** Kod yozish, tahlil qilish, dizayn va tarjimalar.\n` +
      `3. **Apple Intelligence:** Yangi iOS 18 va M seriyali chiplarda shaxsiy AI yordamchisi bevosita qurilmaning o'zida ishlaydi.\n\n` +
      `Sizni sun'iy intellektning aynan qaysi yo'nalishi yoki qurilmalardagi ishlashi qiziqtiryapti?`;
  }

  // 15. BIZNES, SOTUV VA DAROMADNI OSHIRISH
  if (
    cleanText.includes("biznes") ||
    cleanText.includes("sotuvni oshirish") ||
    cleanText.includes("daromad") ||
    cleanText.includes("mijoz jalb qilish") ||
    cleanText.includes("crm") ||
    cleanText.includes("savdo")
  ) {
    return `Biznesda sotuvlarni 2-3 barobar oshirishning oltin qoidalari:\n\n` +
      `1. ⚡ **Tezkor javob berish:** Mijoz xabar yozganidan keyin birinchi 1 daqiqa ichida javob berilsa, sotuv ehtimoli 391% ga oshadi.\n` +
      `2. 🔥 **Hot Leadlarni ajratish:** Xaridga tayyor mijozlarni darhol aniqlab, katta sotuvchiga yo'naltirish.\n` +
      `3. 🔄 **Follow-up (Qayta eslatish):** Narx so'rab javob yozmagan mijozlarning 40% dan ortig'i 2-3 kundan keyin eslatilganda xarid qiladi.\n` +
      `4. 🎯 **Barcha kanallarni birlashtirish:** Telegram, Instagram va Web chatlarni yagona CRM tizimida boshqarish.\n\n` +
      `Bizning AI Sotuvchi platformamiz aynan shu barcha jarayonlarni 100% avtomatlashtirib beradi!`;
  }

  // 16. FAQ CHECKING
  for (const f of faq) {
    const qClean = f.question.toLowerCase();
    if (cleanText.includes(qClean) || qClean.includes(cleanText)) {
      return `${f.answer}\n\nYana qanday savollaringiz bor? Sizga mamnuniyat bilan yordam beraman!`;
    }
  }

  // 17. SALOMLASHISH VA XUSHOMAD (GREETING)
  if (
    intent === "greeting" ||
    cleanText.includes("salom") ||
    cleanText.includes("assalom") ||
    cleanText.includes("qalesiz") ||
    cleanText.includes("yaxshimisiz") ||
    cleanText.includes("privet") ||
    cleanText.includes("tinchmisiz")
  ) {
    return `Assalomu alaykum! Xush kelibsiz! 😊\n\n` +
      `Men "${businessName}" do'konining universal AI savdo va texnologiya yordamchisiman.\n` +
      `Sizga bugun qaysi mahsulot (iPhone, MacBook, Apple Watch, AirPods), narxlar, bo'lib to'lash yoki texnik maslahat bo'yicha yordam bera olaman?`;
  }

  // 18. UNIVERSAL INTELLIGENT JAVOB (ANY GENERAL QUESTION / MATH / ADVICE / CONVERSATION)
  return `Savolingiz uchun tashakkur! 😊\n\n` +
    `Men universal intellektual AI maslahatchi sifatida har qanday texnologik, hayotiy yoki biznes mavzusidagi savollarga javob bera olaman.\n\n` +
    `Shuningdek, "${businessName}" do'konimizda barcha turdagi eng so'nggi Apple original mahsulotlari (iPhone 15 Pro / Max, MacBook Air M2/M3, AirPods, Apple Watch) eng hamyonbop narxlarda, 1 yil rasmiy kafolat va Uzum Nasiya orqali bo'lib to'lash shartlari bilan mavjud.\n\n` +
    `Sizga aynan qaysi mavzuda yoki qaysi qurilma bo'yicha batafsil ma'lumot beray?`;
}

export async function processCustomerMessage(messageText, conversationHistory = [], leadInfo = {}) {
  const db = getDb();
  const settings = db.settings || {};
  const products = (db.products || []).filter(p => p.active);
  const faq = db.faq || [];
  const guardrails = settings.guardrails || {};

  const normalized = normalizeUzbekDialect(messageText || "");
  const cleanText = normalized.toLowerCase().trim();

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
    } else if ((cleanText.includes("macbook") || cleanText.includes("m2") || cleanText.includes("m3") || cleanText.includes("noutbuk")) && pName.includes("macbook")) {
      matchedProduct = p;
      break;
    } else if ((cleanText.includes("airpods") || cleanText.includes("quloqchin") || cleanText.includes("naushnik")) && pName.includes("airpods")) {
      matchedProduct = p;
      break;
    } else if ((cleanText.includes("watch") || cleanText.includes("soat") || cleanText.includes("series 9")) && pName.includes("watch")) {
      matchedProduct = p;
      break;
    }
  }

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
    cleanText.includes("lohotron") ||
    cleanText.includes("yoqmadi") ||
    cleanText.includes("shikoyat") ||
    cleanText.includes("brak")
  ) {
    intent = "complaint_negative";
    sentiment = "negative";
    stage = "Lost";
    leadScore = Math.max(10, leadScore - 25);
    if (guardrails.autoHandoffOnNegative) {
      isHandoff = true;
      handoffReason = "Mijoz e'tiroz yoki norozilik bildirdi";
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
  // Delivery inquiry (Prioritize before general "qancha")
  else if (
    cleanText.includes("yetkaz") ||
    cleanText.includes("dostavka") ||
    cleanText.includes("viloyat") ||
    cleanText.includes("pochta") ||
    cleanText.includes("samarqand") ||
    cleanText.includes("buxoro") ||
    cleanText.includes("andijon") ||
    cleanText.includes("farg'ona") ||
    cleanText.includes("namangan")
  ) {
    intent = "delivery_inquiry";
    stage = "Consideration";
    leadScore = Math.max(60, leadScore + 10);
  }
  // Catalog / All products list
  else if (
    cleanText.includes("katalog") ||
    cleanText.includes("ro'yxat") ||
    cleanText.includes("royxat") ||
    cleanText.includes("barcha tovar") ||
    cleanText.includes("hamma tovar") ||
    cleanText.includes("barcha mahsulot") ||
    cleanText.includes("hamma mahsulot") ||
    cleanText.includes("qanday tovar") ||
    cleanText.includes("nimalar bor") ||
    cleanText.includes("assortiment")
  ) {
    intent = "catalog_inquiry";
    stage = "Interest";
    leadScore = Math.max(50, leadScore + 10);
  }
  // Comparison
  else if (
    cleanText.includes("solishtir") ||
    cleanText.includes("farqi nima") ||
    cleanText.includes("farqi bormi") ||
    cleanText.includes("qaysi biri yaxshi") ||
    cleanText.includes("qaysi birini olsam") ||
    cleanText.includes("pro yoki pro max") ||
    cleanText.includes("m2 yoki m3") ||
    cleanText.includes("taqqosla")
  ) {
    intent = "comparison";
    stage = "Consideration";
    leadScore = Math.max(65, leadScore + 15);
  }
  // Programming & IT Advice
  else if (
    cleanText.includes("dasturlash") ||
    cleanText.includes("it noutbuk") ||
    cleanText.includes("dasturchi") ||
    cleanText.includes("flutter") ||
    cleanText.includes("python") ||
    cleanText.includes("javascript") ||
    cleanText.includes("video montaj") ||
    cleanText.includes("noutbuk tanlash")
  ) {
    intent = "tech_advice";
    stage = "Consideration";
    leadScore = Math.max(60, leadScore + 10);
  }
  // AI & Tech Knowledge
  else if (
    cleanText.includes("sun'iy intellekt") ||
    cleanText.includes("ai nima") ||
    cleanText.includes("chatgpt") ||
    cleanText.includes("kelajak")
  ) {
    intent = "ai_knowledge";
    stage = "Awareness";
    leadScore = Math.max(40, leadScore);
  }
  // Business Advice
  else if (
    cleanText.includes("biznes") ||
    cleanText.includes("sotuvni oshirish") ||
    cleanText.includes("daromad") ||
    cleanText.includes("mijoz jalb qilish") ||
    cleanText.includes("crm")
  ) {
    intent = "business_advice";
    stage = "Awareness";
    leadScore = Math.max(50, leadScore + 10);
  }
  // Installment / Nasiya
  else if (
    cleanText.includes("bo'lib to'lash") ||
    cleanText.includes("bolib tolash") ||
    cleanText.includes("nasiya") ||
    cleanText.includes("rassrochka") ||
    cleanText.includes("oyiga") ||
    cleanText.includes("kredit") ||
    cleanText.includes("uzum") ||
    cleanText.includes("anorbank")
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
    cleanText.includes("kelishtir")
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
    cleanText.includes("nech pul")
  ) {
    intent = "price_inquiry";
    stage = "Interest";
    leadScore = Math.max(50, leadScore + 10);
  }
  // Warranty / Authenticity
  else if (
    cleanText.includes("original") ||
    cleanText.includes("kafolat") ||
    cleanText.includes("garantiya") ||
    cleanText.includes("trade-in")
  ) {
    intent = "warranty_inquiry";
    stage = "Consideration";
    leadScore = Math.max(55, leadScore + 5);
  }
  // Location
  else if (
    cleanText.includes("manzil") ||
    cleanText.includes("qayerda") ||
    cleanText.includes("dokon") ||
    cleanText.includes("ish vaqti")
  ) {
    intent = "location_inquiry";
    stage = "Consideration";
    leadScore = Math.max(65, leadScore + 10);
  }
  // Greetings
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
  // General knowledge / open topics
  else {
    intent = "general_knowledge";
    sentiment = "neutral";
  }

  // 3. Response Generation (via LLM API if configured, otherwise Universal Intelligent Engine)
  let responseText = "";
  let usedLLM = false;

  const aiProvider = settings.aiProvider || "builtin";
  const apiKey = settings.aiApiKey || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (aiProvider !== "builtin" && apiKey) {
    const productsSummary = products.map(p => 
      `- ${p.name}: Narxi ${formatNumber(p.price)} UZS (Eski narx: ${formatNumber(p.oldPrice)} UZS), Zaxirada: ${p.stock} ta, Ranglar: ${p.colors?.join(', ')}, Tavsif: ${p.description}, Oylik to'lov: ${formatNumber(p.installmentMonthly || Math.round(p.price/12))} UZS`
    ).join('\n');

    const systemPrompt = `Siz "${settings.businessName || 'AppleUz Store'}" do'konining aqlli, universal va yuqori intellektli AI Savdo Yordamchisisiz.
Siz nafaqat do'kon tovarlarini mukammal sotasiz, balki mijoz bergan HAR QANDAY savolga (texnologiya, solishtirish, dasturlash, biznes, mantiq, hayotiy maslahat, dunyoqarash) puxta, aniq, xushmuomala va professional tarzda o'zbek tilida javob berasiz!

MAHSULOTLAR:
${productsSummary}

QOIDALAR:
- Yetkazib berish: ${settings.deliveryInfo || "Toshkent bo'ylab bepul, viloyatlarga 1 kunda."}
- Bo'lib to'lash: ${settings.installmentInfo || "Uzum Nasiya va Anorbank orqali 3, 6, 12 oyga."}
- Kafolat: ${settings.warrantyInfo || "1 yil rasmiy kafolat."}
- Manzil va ish vaqti: ${settings.address || "Toshkent sh."}, ${settings.workingHours || "09:00 - 21:00"}
- Max ruxsat etilgan chegirma: ${guardrails.maxDiscountPercent || 5}%

${guardrails.systemPromptExtra ? `Qo'shimcha ko'rsatma: ${guardrails.systemPromptExtra}` : ''}`;

    if ((aiProvider === "openai" || settings.aiModel?.startsWith("gpt")) && apiKey) {
      try {
        responseText = await callOpenAiGpt4o(apiKey, settings.aiModel || "gpt-4o-mini", systemPrompt, conversationHistory, messageText);
        usedLLM = true;
      } catch (err) {
        console.warn("OpenAI API xatolik, universal dvigatelga o'tilmoqda:", err.message);
      }
    } else if (aiProvider === "gemini" && apiKey) {
      try {
        responseText = await callGeminiApi(apiKey, settings.aiModel || "gemini-1.5-flash", systemPrompt, conversationHistory, messageText);
        usedLLM = true;
      } catch (err) {
        console.warn("Gemini API xatolik, universal dvigatelga o'tilmoqda:", err.message);
      }
    }
  }

  // Fallback / Default to Universal Intelligent Response Generator
  if (!responseText) {
    responseText = generateIntelligentResponse(cleanText, messageText, products, faq, settings, guardrails, matchedProduct, intent);
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
