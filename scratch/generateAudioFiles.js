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
    key: 'reply_price',
    text: "Assalomu alaykum! Savolingiz uchun rahmat. AppleUz do'konimizda iPhone 15 Pro 256GB va MacBook modellariga 1 yillik rasmiy kafolat hamda Uzum Nasiya orqali 12 oylik muddatli to'lov mavjud. Qaysi rang va xotira varianti ma'qul?"
  },
  {
    key: 'reply_delivery',
    text: "Toshkent bo'ylab yetkazib berish 2 soatda BEPUL! Viloyatlarga BTS pochta orqali 1 kunda (35 000 so'm) yetkazib beramiz. Buyurtma rasmiylashtiraylikmi?"
  },
  {
    key: 'reply_card',
    text: "Albatta! Karta raqamimiz: 8600 **** **** 1234 (AppleUz Store). To'lov qilinganingizdan so'ng chekni yuborsangiz, darhol kurerni jo'natamiz!"
  }
];

const voices = [
  { voiceKey: 'madina', voiceName: 'uz-UZ-MadinaNeural' },
  { voiceKey: 'sardor', voiceName: 'uz-UZ-SardorNeural' }
];

async function generateAll() {
  for (const item of speechMap) {
    for (const v of voices) {
      console.log(`Generating ${item.key}_${v.voiceKey}.mp3 ...`);
      const buf = await generateEdgeTTS(item.text, v.voiceKey, 0.95);
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
  console.log('🎉 ALL AUDIO FILES GENERATED!');
}

generateAll();
