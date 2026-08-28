/**
 * Edge Neural TTS — Tabiiy Inson Ovozi & Studio Sifat
 * msedge-tts kutubxonasi orqali Microsoft Edge Speech Service dan neural ovoz oladi.
 * O'zbek tilida uz-UZ-MadinaNeural (ayol) va uz-UZ-SardorNeural (erkak) ovozlari.
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Raqamlarni o'zbekcha so'z shakliga o'tkazish (Human Spoken Numbers)
function numberToUzbekWords(n) {
  if (n === 0) return 'nol';
  const ones = ['', 'bir', 'ikki', 'uch', 'to\'rt', 'besh', 'olti', 'yetti', 'sakkiz', 'to\'qqiz'];
  const tens = ['', 'o\'n', 'yigirma', 'o\'ttiz', 'qirq', 'ellik', 'oltmish', 'yetmish', 'sakson', 'to\'qson'];
  if (n < 10) return ones[n];
  if (n < 100) return (tens[Math.floor(n/10)] + ' ' + ones[n%10]).trim();
  if (n < 1000) return ((Math.floor(n/100) === 1 ? 'yuz' : ones[Math.floor(n/100)] + ' yuz') + ' ' + (n%100 ? numberToUzbekWords(n%100) : '')).trim();
  if (n < 1000000) return ((Math.floor(n/1000) === 1 ? 'ming' : numberToUzbekWords(Math.floor(n/1000)) + ' ming') + ' ' + (n%1000 ? numberToUzbekWords(n%1000) : '')).trim();
  if (n < 1000000000) return (numberToUzbekWords(Math.floor(n/1000000)) + ' million ' + (n%1000000 ? numberToUzbekWords(n%1000000) : '')).trim();
  return n.toString();
}

// Matnni tabiiy inson intonatsiyasi va to'g'ri talaffuz uchun tozalash
export function prepareTextForNeuralSpeech(text) {
  if (!text) return "";
  let res = text;

  // Raqamlarni o'zbekcha so'z shakliga o'tkazish
  res = res.replace(/(\d{1,3}(?:[\s,]\d{3})+|\d+)\s*(so'm|sum|UZS)?/gi, (match, numStr, currency) => {
    const cleanNum = parseInt(numStr.replace(/[\s,]/g, ''), 10);
    if (!isNaN(cleanNum) && cleanNum > 0 && cleanNum < 1000000000) {
      const words = numberToUzbekWords(cleanNum);
      return currency ? `${words} so'm` : words;
    }
    return match;
  });

  // Texnik va qisqartma so'zlarni jonli o'zbekcha talaffuzga o'tkazish
  res = res
    .replace(/\b256GB\b/gi, "ikki yuz ellik olti gigabayt")
    .replace(/\b128GB\b/gi, "yuz yigirma sakkiz gigabayt")
    .replace(/\b512GB\b/gi, "besh yuz ellik ikki gigabayt")
    .replace(/\b1TB\b/gi, "bir terabayt")
    .replace(/\bPro Max\b/gi, "pro maks")
    .replace(/\bPro\b/gi, "pro")
    .replace(/\biPhone\b/gi, "ayfon")
    .replace(/\bMacBook\b/gi, "makbuk")
    .replace(/\bAir\b/gi, "eyr")
    .replace(/\bM3\b/gi, "em uch")
    .replace(/\bM2\b/gi, "em ikki")
    .replace(/\bGB\b/gi, "gigabayt")
    .replace(/\bType-C\b/gi, "taypsi")
    .replace(/\bUSB-C\b/gi, "yu es bi si")
    .replace(/\b48MP\b/gi, "qirq sakkiz megapiksel")
    .replace(/\b120Hz\b/gi, "bir yuz yigirma gerts")
    .replace(/\b20W\b/gi, "yigirma vatt")
    .replace(/\bIP68\b/gi, "ay pi oltmish sakkiz")
    .replace(/\bIP54\b/gi, "ay pi ellik to'rt")
    .replace(/\bGPS\b/gi, "ji pi es")
    .replace(/\bANC\b/gi, "shovqinni bekor qilish")
    .replace(/\b1-kunlik\b/gi, "bir kunlik")
    .replace(/\b2-kunlik\b/gi, "ikki kunlik")
    .replace(/\b12 oyga\b/gi, "o'n ikki oyga")
    .replace(/\b24 soatda\b/gi, "yigirma to'rt soatda")
    .replace(/\b2 soatda\b/gi, "ikki soatda")
    .replace(/\b1 yil\b/gi, "bir yil")
    .replace(/\b5%\b/gi, "besh foiz")
    .replace(/\b0%\b/gi, "nol foiz")
    .replace(/[@#*_`~•]/g, ' ')
    .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Tabiiy pauzalar uchun tinish belgilarini tartibga solish
  res = res
    .replace(/\n+/g, '. ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*:\s*/g, ', ');

  return res;
}

// Mavjud Neural ovozlar
export const NEURAL_VOICES = {
  'madina': { name: 'uz-UZ-MadinaNeural', lang: 'uz-UZ', gender: 'female', label: 'Madina (Tabiiy O\'zbek ayol)' },
  'sardor': { name: 'uz-UZ-SardorNeural', lang: 'uz-UZ', gender: 'male', label: 'Sardor (Tabiiy O\'zbek erkak)' },
  'emel': { name: 'tr-TR-EmelNeural', lang: 'tr-TR', gender: 'female', label: 'Emel (Turkcha ayol)' },
  'ahmet': { name: 'tr-TR-AhmetNeural', lang: 'tr-TR', gender: 'male', label: 'Ahmet (Turkcha erkak)' },
  'svetlana': { name: 'ru-RU-SvetlanaNeural', lang: 'ru-RU', gender: 'female', label: 'Svetlana (Ruscha ayol)' },
  'dmitry': { name: 'ru-RU-DmitryNeural', lang: 'ru-RU', gender: 'male', label: 'Dmitry (Ruscha erkak)' }
};

const OPENAI_TO_EDGE_MAP = {
  'nova': 'madina',
  'shimmer': 'madina',
  'alloy': 'sardor',
  'onyx': 'sardor',
  'custom-clone': 'sardor'
};

/**
 * Edge Neural TTS orqali tabiiy inson ovozida MP3 generatsiya qilish
 */
export async function generateEdgeTTS(text, voiceKey = 'madina', speed = 0.92) {
  try {
    const cleanText = prepareTextForNeuralSpeech(text);
    if (!cleanText) return null;

    let voiceConfig = NEURAL_VOICES[voiceKey];
    if (!voiceConfig) {
      const edgeVoiceKey = OPENAI_TO_EDGE_MAP[voiceKey] || 'madina';
      voiceConfig = NEURAL_VOICES[edgeVoiceKey];
    }
    if (!voiceConfig) {
      voiceConfig = NEURAL_VOICES['madina'];
    }

    console.log(`🎙️ Edge Neural TTS: "${cleanText.slice(0, 50)}..." → ${voiceConfig.label} | speed=${speed}`);

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceConfig.name, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Tabiiy inson suhbat tezligi va balandligi
    const rate = Math.max(0.80, Math.min(1.15, speed || 0.92));
    const pitch = (voiceKey === 'onyx' || voiceKey === 'sardor') ? '-3Hz' : 
                  (voiceKey === 'nova' || voiceKey === 'madina') ? '+2Hz' : '+0Hz';

    const { audioStream } = tts.toStream(cleanText, { rate, pitch });

    return new Promise((resolve, reject) => {
      const chunks = [];
      
      audioStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      audioStream.on('end', () => {
        if (chunks.length > 0) {
          const buffer = Buffer.concat(chunks);
          console.log(`✅ Edge Neural TTS: ${voiceConfig.label} — ${buffer.byteLength} bayt audio yaratildi`);
          resolve(buffer);
        } else {
          console.warn('Edge TTS: Bo\'sh audio qaytdi');
          resolve(null);
        }
      });

      audioStream.on('error', (err) => {
        console.warn('Edge TTS stream xatolik:', err.message);
        resolve(null);
      });

      setTimeout(() => {
        resolve(chunks.length > 0 ? Buffer.concat(chunks) : null);
      }, 15000);
    });

  } catch (err) {
    console.warn('❌ Edge Neural TTS xatolik:', err.message);
    return null;
  }
}

export async function getAvailableVoices() {
  try {
    const tts = new MsEdgeTTS();
    const voices = await tts.getVoices();
    const filtered = voices.filter(v => 
      v.Locale?.startsWith('uz-') || 
      v.Locale?.startsWith('tr-') || 
      v.Locale?.startsWith('ru-')
    );
    return filtered;
  } catch (err) {
    console.warn('Edge TTS voices ro\'yxatini olishda xatolik:', err.message);
    return Object.values(NEURAL_VOICES);
  }
}
