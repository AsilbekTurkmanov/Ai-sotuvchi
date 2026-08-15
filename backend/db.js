import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  settings: {
    businessName: "AppleUz Store",
    currency: "UZS",
    phone: "+998 90 123 45 67",
    address: "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi, 15-uy",
    workingHours: "Dushanba - Yakshanba: 09:00 - 21:00",
    deliveryInfo: "Toshkent bo'ylab 2 soatda yetkazib berish bepul. Viloyatlarga BTS pochta orqali 1 kunda (35 000 so'm).",
    paymentMethods: "Click, Payme, Uzum Nasiya, Naqd, Terminal",
    installmentInfo: "Uzum Nasiya va Anorbank orqali 3, 6, 12 oylik muddatli to'lov (boshlang'ich to'lovsiz).",
    warrantyInfo: "Barcha original mahsulotlarga 1 yillik rasmiy kafolat beriladi.",
    returnPolicy: "14 kun ichida qadoq buzilmagan bo'lsa qaytarish yoki almashtirish mumkin.",
    telegramBotToken: "",
    telegramManagerChatId: "",
    botActive: false,
    aiProvider: "builtin", // "builtin", "openai", "gemini"
    aiApiKey: "",
    aiModel: "gpt-4o-mini",
    guardrails: {
      maxDiscountPercent: 5,
      allowNegotiation: true,
      autoHandoffOnHot: true,
      autoHandoffOnNegative: true,
      strictPriceOnly: true,
      systemPromptExtra: "Siz AppleUz do'konining eng professional, xushmuomala va sotuvga yo'naltirilgan AI sotuvchisisiz. Har doim o'zbek tilida tabiiy, samimiy va lo'nda javob bering. Mijoz savoliga aniq javob berib, xaridga undovchi savol bilan tugating."
    }
  },
  products: [
    {
      id: "prod-1",
      name: "iPhone 15 Pro 256GB",
      category: "Smartfonlar",
      price: 12500000,
      oldPrice: 13200000,
      colors: ["Black Titanium", "Natural Titanium", "Blue Titanium", "White Titanium"],
      stock: 14,
      installmentMonthly: 1250000,
      description: "A17 Pro chip, Titanium korpus, 48MP asosiy kamera, Action button, USB-C 3.0.",
      features: "Ekran: 6.1\" Super Retina XDR OLED 120Hz, Batareya: 3274 mAh, Kafolat: 1 yil.",
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      active: true
    },
    {
      id: "prod-2",
      name: "iPhone 15 Pro Max 256GB",
      category: "Smartfonlar",
      price: 14200000,
      oldPrice: 14900000,
      colors: ["Natural Titanium", "Black Titanium", "White Titanium"],
      stock: 8,
      installmentMonthly: 1420000,
      description: "6.7 dyuymli ulkan ekran, 5x optik zoom, titan korpus, eng kuchli batareya.",
      features: "Ekran: 6.7\" 120Hz, A17 Pro, 5x Telephoto kamera, Batareya: 4422 mAh.",
      imageUrl: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=600&auto=format&fit=crop&q=80",
      active: true
    },
    {
      id: "prod-3",
      name: "MacBook Air M2 13.6\" 8/256GB",
      category: "Noutbuklar",
      price: 11800000,
      oldPrice: 12500000,
      colors: ["Midnight", "Space Gray", "Starlight", "Silver"],
      stock: 5,
      installmentMonthly: 1180000,
      description: "Ultra yupqa dizayn, Apple M2 chip, 18 soatgacha batareya, jim ventilyatorsiz tizim.",
      features: "13.6\" Liquid Retina, M2 8-core CPU, MagSafe zaryadlash, Og'irligi: 1.24 kg.",
      imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80",
      active: true
    },
    {
      id: "prod-4",
      name: "AirPods Pro 2 (USB-C)",
      category: "Aksessuarlar",
      price: 2450000,
      oldPrice: 2800000,
      colors: ["White"],
      stock: 22,
      installmentMonthly: 245000,
      description: "2 barobar kuchliroq faol shovqin bekor qilish (ANC), Moslashuvchan audio, USB-C keys.",
      features: "H2 chip, 6 soat batareya (keys bilan 30 soat), Suv va changdan himoya IP54.",
      imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
      active: true
    },
    {
      id: "prod-5",
      name: "Apple Watch Series 9 45mm GPS",
      category: "Aqlli soatlar",
      price: 4600000,
      oldPrice: 4900000,
      colors: ["Midnight", "Starlight", "Silver", "(PRODUCT)RED"],
      stock: 9,
      installmentMonthly: 460000,
      description: "S9 SiP chip, Double Tap yangi imo-ishora boshqaruvi, 2000 nit yorqin ekran.",
      features: "Yurak urishi, EKG, Qon kislorodi, Uyqu monitoringi, 18 soat ishlash.",
      imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
      active: true
    }
  ],
  faq: [
    {
      id: "faq-1",
      question: "Mahsulotlar originalmi va kafolat bormi?",
      answer: "Ha, biz faqat 100% original, yangi va muhrlangan (sealed) Apple mahsulotlarini sotamiz. Barcha qurilmalarga 1 yillik rasmiy kafolat beriladi."
    },
    {
      id: "faq-2",
      question: "Yetkazib berish xizmati qanday ishlaydi?",
      answer: "Toshkent shahri bo'ylab buyurtma berilganidan keyin 2 soat ichida mutlaqo bepul yetkazib beramiz. O'zbekistonning barcha viloyatlariga esa BTS pochta orqali 1 ish kunida yetkaziladi."
    },
    {
      id: "faq-3",
      question: "Bo'lib to'lash (nasiya) shartlari qanday?",
      answer: "Uzum Nasiya va Anorbank orqali 3 oydan 12 oygacha boshlang'ich to'lovsiz bo'lib to'lash mumkin. Buning uchun faqat pasport va plastik karta talab qilinadi."
    },
    {
      id: "faq-4",
      question: "Eski telefonimni Trade-In qilsam bo'ladimi?",
      answer: "Albatta! Do'konimizda Trade-In xizmati mavjud. Eski iPhone telefoningizni olib kelsangiz, mutaxassisimiz narxlab beradi va farqini to'lab yangisiga almashtirishingiz mumkin."
    }
  ],
  leads: [
    {
      id: "lead-1",
      name: "Jasur Rahimov",
      phone: "+998 93 456 78 90",
      username: "@jasur_r",
      channel: "Telegram",
      status: "hot",
      score: 95,
      interestProduct: "iPhone 15 Pro 256GB",
      productPrice: 12500000,
      assignedManager: "Ali Valiyev",
      sentiment: "positive",
      stage: "Purchase",
      intent: "purchase_ready",
      lastMessageTime: "17:42",
      lastMessage: "Karta raqam bering, hozir to'lov qilib Toshkent bo'yicha dostavka qildiraman.",
      unread: false,
      followUpStatus: "completed",
      createdAt: "2026-08-15 15:30",
      notes: "Natural Titanium rangini tanladi. To'lovni Click orqali qilmoqchi."
    },
    {
      id: "lead-2",
      name: "Malika Karimova",
      phone: "+998 90 876 54 32",
      username: "@malika_k",
      channel: "Instagram",
      status: "interested",
      score: 72,
      interestProduct: "MacBook Air M2",
      productPrice: 11800000,
      assignedManager: "Nodira Karimova",
      sentiment: "neutral",
      stage: "Consideration",
      intent: "installment_inquiry",
      lastMessageTime: "16:20",
      lastMessage: "Uzum Nasiya orqali 12 oyga oyiga qanchadan tushadi?",
      unread: false,
      followUpStatus: "scheduled",
      createdAt: "2026-08-15 14:10",
      notes: "Dasturlash uchun olmoqchi, Midnight rangi qiziqtiryapti."
    },
    {
      id: "lead-3",
      name: "Sardor Azimov",
      phone: "+998 97 111 22 33",
      username: "@sardor_dev",
      channel: "Telegram",
      status: "contacted",
      score: 45,
      interestProduct: "AirPods Pro 2",
      productPrice: 2450000,
      assignedManager: "Ali Valiyev",
      sentiment: "neutral",
      stage: "Interest",
      intent: "price_inquiry",
      lastMessageTime: "14:05",
      lastMessage: "AirPods Pro 2 narxi qancha hozir aksiya bormi?",
      unread: false,
      followUpStatus: "pending",
      createdAt: "2026-08-15 12:00",
      notes: ""
    },
    {
      id: "lead-4",
      name: "Bobur Mirzayev",
      phone: "+998 91 999 88 77",
      username: "@bobur_m",
      channel: "Telegram",
      status: "won",
      score: 100,
      interestProduct: "iPhone 15 Pro Max 256GB",
      productPrice: 14200000,
      assignedManager: "Ali Valiyev",
      sentiment: "positive",
      stage: "Closed",
      intent: "payment_done",
      lastMessageTime: "11:30",
      lastMessage: "To'lov o'tdi, kuryerni kutyapman. Rahmat!",
      unread: false,
      followUpStatus: "none",
      createdAt: "2026-08-15 09:15",
      notes: "Sotuv muvaffaqiyatli yakunlandi. Kuryer jo'natildi."
    },
    {
      id: "lead-5",
      name: "Dilshod Olimov",
      phone: "+998 94 333 44 55",
      username: "@dilshod_o",
      channel: "WhatsApp",
      status: "new",
      score: 30,
      interestProduct: "Apple Watch Series 9",
      productPrice: 4600000,
      assignedManager: "Taqsimlanmagan",
      sentiment: "neutral",
      stage: "Awareness",
      intent: "general_inquiry",
      lastMessageTime: "17:10",
      lastMessage: "Assalomu alaykum, soatlar bormi?",
      unread: true,
      followUpStatus: "none",
      createdAt: "2026-08-15 17:10",
      notes: ""
    },
    {
      id: "lead-6",
      name: "Shahnoza Yuldasheva",
      phone: "+998 99 555 66 77",
      username: "@shahnoza_yu",
      channel: "Instagram",
      status: "lost",
      score: 15,
      interestProduct: "iPhone 15 Pro 256GB",
      productPrice: 12500000,
      assignedManager: "Nodira Karimova",
      sentiment: "negative",
      stage: "Lost",
      intent: "price_complaint",
      lastMessageTime: "Kecha 18:00",
      lastMessage: "Boshqa joyda 12 mlnga ko'rdim, sizda qimmat ekan.",
      unread: false,
      followUpStatus: "cancelled",
      createdAt: "2026-08-14 16:30",
      notes: "Narx qimmatligini aytdi, qiziqish yo'qoldi."
    }
  ],
  conversations: {
    "lead-1": [
      { sender: "customer", text: "Assalomu alaykum! iPhone 15 Pro 256GB bormi?", time: "17:35", intent: "stock_inquiry" },
      { sender: "ai", text: "Vaalaykum assalom! Ha, iPhone 15 Pro 256GB hozirda sotuvda mavjud. Narxi 12 500 000 so'm (aksiyada). Bizda Black Titanium va Natural Titanium ranglari bor. Sizga qaysi rang ko'proq ma'qul?", time: "17:35" },
      { sender: "customer", text: "Natural Titanium zo'r ekan. Toshkent ichida yetkazib berish bormi?", time: "17:37", intent: "delivery_inquiry" },
      { sender: "ai", text: "Albatta! Toshkent shahri bo'ylab buyurtma berilganidan so'ng 2 soat ichida bepul yetkazib beramiz. 1 yillik rasmiy kafolat va original chek beriladi.", time: "17:37" },
      { sender: "customer", text: "Karta raqam bering, hozir to'lov qilib Toshkent bo'yicha dostavka qildiraman.", time: "17:42", intent: "purchase_ready" },
      { sender: "ai", text: "Ajoyib tanlov! Siz uchun Natural Titanium 256GB modelini zaxiraga oldik. Hozir sizga to'lov rekvizitlarini jo'natish va yetkazish manzilini aniqlashtirish uchun katta sotuv menejerimiz Ali Valiyev (@ali_sales) bog'lanadi. 1 daqiqa kuting!", time: "17:42", isHandoff: true }
    ]
  },
  followUpTemplates: [
    {
      id: "fu-1",
      name: "1-kun: Yumshoq eslatma (Soft reminder)",
      delayHours: 24,
      channel: "all",
      condition: "narx so'ragan, ammo 24 soat javob bermagan mijozlar",
      text: "Salom! Kecha {product_name} haqida ma'lumot so'ragandingiz. Mahsulotimiz siz uchun qiziqmi? Hozirda zaxirada sanoqli qoldi, sizga bir dona ajratib qo'yaylikmi? 😊",
      active: true
    },
    {
      id: "fu-2",
      name: "2-kun: Bo'lib to'lash va Afzallik taklifi",
      delayHours: 48,
      channel: "all",
      condition: "hali ham javob bermagan mijozlar",
      text: "Assalomu alaykum! {product_name} xaridi haqida o'ylab ko'rdingizmi? Agar naqd to'lash noqulay bo'lsa, Uzum Nasiya orqali boshlang'ich to'lovsiz, oyiga {installment_price} so'mdan 12 oyga bo'lib to'lash imkoniyati bor. Rasmiylashtirishga yordam beraylikmi?",
      active: true
    },
    {
      id: "fu-3",
      name: "3-kun: Maxsus sovg'a yoki Chegirma taklifi",
      delayHours: 72,
      channel: "all",
      condition: "so'nggi imkoniyat follow-up",
      text: "Salom! Bugun {product_name} xarid qilsangiz, do'konimizdan sovg'a sifatida original 20W tezkor zaryadlash adapteri va himoya oynasini bepul qo'shib beramiz! Buyurtmani tasdiqlaymizmi? 🎁",
      active: true
    }
  ],
  analytics: {
    todayLeads: 48,
    todayAiHandled: 45,
    todayHandoffs: 14,
    todaySalesCount: 8,
    todayRevenue: 84500000,
    conversionRate: 16.6,
    avgResponseTimeSec: 1.2,
    channelBreakdown: {
      telegram: 62,
      instagram: 28,
      whatsapp: 10
    },
    funnel: [
      { stage: "Yozgan mijozlar", count: 240, percent: 100 },
      { stage: "AI bilan muloqot", count: 228, percent: 95 },
      { stage: "Qiziqish bildirgan (Warm)", count: 96, percent: 40 },
      { stage: "Xaridga tayyor (Hot)", count: 38, percent: 15.8 },
      { stage: "Sotuv yakunlandi (Won)", count: 21, percent: 8.75 }
    ]
  }
};

let memoryData = null;

export function getDb() {
  if (!memoryData) {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        memoryData = JSON.parse(raw);
      } catch (err) {
        console.error("DB faylini o'qishda xatolik, default yuklanmoqda:", err);
        memoryData = JSON.parse(JSON.stringify(defaultData));
      }
    } else {
      memoryData = JSON.parse(JSON.stringify(defaultData));
      saveDb(memoryData);
    }
  }
  return memoryData;
}

export function saveDb(data) {
  memoryData = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("DB saqlashda xatolik:", err);
  }
}
