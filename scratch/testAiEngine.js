import { processCustomerMessage } from '../backend/aiEngine.js';

async function runTests() {
  const testQuestions = [
    { label: "1. Narx so'rash", query: "iPhone 15 Pro 256GB narxi qancha hozir?" },
    { label: "2. Solishtirish (15 Pro vs Pro Max)", query: "iPhone 15 Pro va 15 Pro Max farqi nima, qaysi birini olsam yaxshi?" },
    { label: "3. Bo'lib to'lash (Nasiya)", query: "Uzum Nasiya orqali bo'lib to'lasa bo'ladimi, oyiga qancha?" },
    { label: "4. Sheva va Chegirma", query: "Aka tushib berin, 12 mlnga ob ketaman, yetkazib berilarmi?" },
    { label: "5. Hot Lead / To'lov qilish", query: "Karta raqam bering, hozir to'lov qilib Toshkentga dostavka qildiraman!" },
    { label: "6. Dasturlash uchun noutbuk", query: "Dasturlash va ofis ishlari uchun qaysi MacBookni maslahat berasiz?" },
    { label: "7. Sun'iy Intellekt haqida", query: "Sun'iy intellekt nima va u qanday ishlaydi?" },
    { label: "8. Biznes va Sotuv maslahati", query: "Biznesda sotuvni qanday oshirish mumkin?" },
    { label: "9. Samarqandga yetkazib berish", query: "Samarqandga yetkazib berish qancha vaqtda boradi?" },
    { label: "10. Manzil va ish vaqti", query: "Do'koningiz qayerda joylashgan, ish vaqti qanaqa?" },
    { label: "11. Barcha katalog", query: "Do'koningizdagi barcha tovarlar narxlari ro'yxatini bering" },
    { label: "12. Salomlashish", query: "Assalomu alaykum, qalesiz?" }
  ];

  console.log("==================================================");
  console.log("🚀 AI SOTUVCHI INTELLEKTUAL TEST SINOVLARI BOSHLANDI");
  console.log("==================================================\n");

  let passed = 0;

  for (const t of testQuestions) {
    console.log(`\n--------------------------------------------------`);
    console.log(`[TEST]: ${t.label}`);
    console.log(`[SAVOL]: "${t.query}"`);
    
    const res = await processCustomerMessage(t.query);
    
    console.log(`[INTENT]: ${res.intent} | [SCORE]: ${res.score} | [STAGE]: ${res.stage} | [HOT]: ${res.isHandoff ? '🔥 YES' : 'NO'}`);
    console.log(`[JAVOB]:\n${res.response}`);

    if (res.response && res.response.length > 30) {
      passed++;
      console.log(`✅ TEST MUVAFFAQIYATLI O'TDI`);
    } else {
      console.error(`❌ TESTDA XATOLIK: Javob yetarli emas`);
    }
  }

  console.log(`\n==================================================`);
  console.log(`🎉 BARCHA TESTLAR YAKUNLANDI: ${passed}/${testQuestions.length} O'TDI!`);
  console.log(`==================================================`);
}

runTests();
