import fs from 'fs';
import path from 'path';
import { generateEdgeTTS } from '../backend/edgeTts.js';

const audioDirPublic = path.join(process.cwd(), 'public/audio');
const audioDirDocs = path.join(process.cwd(), 'docs/audio');

if (!fs.existsSync(audioDirPublic)) fs.mkdirSync(audioDirPublic, { recursive: true });
if (!fs.existsSync(audioDirDocs)) fs.mkdirSync(audioDirDocs, { recursive: true });

const speechMap = [
  {
    key: 'welcome',
    text: "Assalomu alaykum! AppleUz do'konining universal AI yordamchisiman. Siz bilan ChatGPT 4o studio ovozida yoki o'zingizning ovoz kloningizda gaplasha olaman. Qanday yordam bera olaman?"
  },
  {
    key: 'reply_price_15pro',
    text: "iPhone 15 Pro 256GB narxi hozirgi aksiyamiz doirasida 12 million 500 ming so'm. 12 oyga muddatli to'lovga oyiga 1 million 250 ming so'mdan to'lashingiz mumkin. Barcha ranglari mavjud va Toshkentda yetkazib berish bepul!"
  },
  {
    key: 'reply_compare',
    text: "iPhone 15 Pro va 15 Pro Max o'rtasidagi asosiy farqlar: 15 Pro ixcham 6.1 dyuymli ekran va 3x optik zoomga ega. 15 Pro Max esa 6.7 dyuymli ulkan ekran, 5x optik zoom va eng uzoq ishlovchi 4422 milliamper soatlik batareyaga ega. Ixchamlik ma'qul bo'lsa 15 Pro, katta ekran kerak bo'lsa 15 Pro Max tavsiya qilamiz!"
  },
  {
    key: 'reply_macbook',
    text: "Dasturlash va ofis ishlari uchun eng qulay noutbuk bu shubhasiz Apple MacBook Air M2. U jim ishlaydi, 18 soat zaryad saqlaydi va qizimaydi. Narxi 11 million 800 ming so'm yoki oyiga 1 million 180 ming so'mdan bo'lib to'lash mumkin!"
  },
  {
    key: 'reply_nasiya',
    text: "Bizda barcha mahsulotlarni Uzum Nasiya va Anorbank orqali boshlang'ich to'lovsiz, 12 oyga qulay bo'lib to'lashga xarid qilishingiz mumkin. Buning uchun faqat pasport va plastik karta kifoya. 3 daqiqada onlayn tasdiqlanadi!"
  },
  {
    key: 'reply_delivery',
    text: "Toshkent shahri bo'ylab 2 soat ichida mutlaqo bepul yetkazib beramiz! Viloyatlarga BTS pochta orqali 1 kunda 35 ming so'm evaziga xavfsiz yetkaziladi. Mahsulotni qabul qilib olib tekshirib olasiz!"
  },
  {
    key: 'reply_card',
    text: "Ajoyib qaror! Karta raqamimiz 8600 **** **** 1234. To'lov qilinganingizdan so'ng chekni yuborsangiz, katta sotuv menejerimiz zudlik bilan buyurtmangizni kuryerga topshiradi!"
  },
  {
    key: 'reply_warranty',
    text: "Barcha mahsulotlarimiz 100% original, yangi va qutisi muhrlangan. Barcha qurilmalarga 1 yillik rasmiy kafolat beriladi hamda 14 kun ichida almashtirish kafolatlangan!"
  },
  {
    key: 'reply_location',
    text: "Do'konimiz manzili: Toshkent shahri, Chilonzor tumani, Bunyodkor shoh ko'chasi 15-uy. Ish vaqtimiz har kuni 09:00 dan 21:00 gacha. Telefon raqamimiz: +998 90 123 45 67."
  },
  {
    key: 'reply_catalog',
    text: "Do'konimizdagi rasmiy tovarlar: iPhone 15 Pro 12 million 500 ming so'm, iPhone 15 Pro Max 14 million 200 ming so'm, MacBook Air M2 11 million 800 ming so'm, AirPods Pro 2 million 450 ming so'm, Apple Watch 4 million 600 ming so'm."
  },
  {
    key: 'reply_ai',
    text: "Sun'iy Intellekt inson aqliy vazifalarini avtomatlashtiruvchi zamonaviy texnologiya. Bizning AI Sotuvchi tizimimiz ham savdo va mijozlarga 24 soat xizmat ko'rsatish uchun sun'iy intellektga tayangan holda ishlaydi!"
  },
  {
    key: 'reply_business',
    text: "Biznesda sotuvni oshirishning asosiy siri: mijozga 1 daqiqada tezkor javob berish, xaridga tayyor Hot Leadlarni aniqlash va avtomatlashtirilgan eslatmalar yuborishdir. Bizning AI Sotuvchi tizimi aynan shu jarayonni to'liq avtomatlashtiradi!"
  }
];

const voices = [
  { voiceKey: 'madina', voiceName: 'uz-UZ-MadinaNeural' },
  { voiceKey: 'sardor', voiceName: 'uz-UZ-SardorNeural' }
];

async function generateAll() {
  console.log("🎙️ Barcha tabiiy inson ovozlari generatsiya qilinmoqda...");
  for (const item of speechMap) {
    for (const v of voices) {
      console.log(`Generating ${item.key}_${v.voiceKey}.mp3 ...`);
      const buf = await generateEdgeTTS(item.text, v.voiceKey, 0.92);
      if (buf && buf.byteLength > 500) {
        const filePublic = path.join(audioDirPublic, `${item.key}_${v.voiceKey}.mp3`);
        const fileDocs = path.join(audioDirDocs, `${item.key}_${v.voiceKey}.mp3`);
        fs.writeFileSync(filePublic, buf);
        fs.writeFileSync(fileDocs, buf);
        console.log(`✅ Saved ${item.key}_${v.voiceKey}.mp3 (${buf.byteLength} bytes)`);
      } else {
        console.warn(`❌ Failed for ${item.key}_${v.voiceKey}`);
      }
    }
  }
  console.log('🎉 BARCHA TABIIY OVOZLI MP3 FAYLLAR MUVAFFAQIYATLI GENERATSIYA BO\'LDI!');
}

generateAll();
