/**
 * Edge Neural TTS — Bepul, Tabiiy Inson Ovozi
 * msedge-tts kutubxonasi orqali Microsoft Edge Speech Service dan neural ovoz oladi.
 * O'zbek tilida uz-UZ-MadinaNeural (ayol) va uz-UZ-SardorNeural (erkak) ovozlari mavjud.
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Mavjud Neural ovozlar (tabiiy, inson ovoziga yaqin)
export const NEURAL_VOICES = {
  // O'zbek tilidagi neural ovozlar
  'madina': { name: 'uz-UZ-MadinaNeural', lang: 'uz-UZ', gender: 'female', label: 'Madina (O\'zbek ayol)' },
  'sardor': { name: 'uz-UZ-SardorNeural', lang: 'uz-UZ', gender: 'male', label: 'Sardor (O\'zbek erkak)' },
  // Turk tilidagi neural ovozlar (O'zbekchaga juda yaqin talaffuz)
  'emel': { name: 'tr-TR-EmelNeural', lang: 'tr-TR', gender: 'female', label: 'Emel (Turkcha ayol)' },
  'ahmet': { name: 'tr-TR-AhmetNeural', lang: 'tr-TR', gender: 'male', label: 'Ahmet (Turkcha erkak)' },
  // Rus tilidagi neural ovozlar
  'svetlana': { name: 'ru-RU-SvetlanaNeural', lang: 'ru-RU', gender: 'female', label: 'Svetlana (Ruscha ayol)' },
  'dmitry': { name: 'ru-RU-DmitryNeural', lang: 'ru-RU', gender: 'male', label: 'Dmitry (Ruscha erkak)' },
};

// OpenAI voice -> Edge Neural voice mapping (fallback sifatida)
const OPENAI_TO_EDGE_MAP = {
  'nova': 'madina',
  'shimmer': 'madina',
  'alloy': 'sardor',
  'onyx': 'sardor',
  'custom-clone': 'sardor'
};

/**
 * Edge Neural TTS orqali audio generatsiya qilish
 * @param {string} text - Gapiriladigan matn
 * @param {string} voiceKey - Voice ID (madina, sardor, nova, onyx, va h.k.)
 * @param {number} speed - Tezlik (0.7 - 1.3), default 0.95
 * @returns {Promise<Buffer|null>} MP3 audio buffer yoki null
 */
export async function generateEdgeTTS(text, voiceKey = 'madina', speed = 0.95) {
  try {
    // Agar to'g'ridan-to'g'ri edge voice key berilgan bo'lsa
    let voiceConfig = NEURAL_VOICES[voiceKey];
    
    // Agar OpenAI voice ID berilgan bo'lsa, map qilish
    if (!voiceConfig) {
      const edgeVoiceKey = OPENAI_TO_EDGE_MAP[voiceKey] || 'madina';
      voiceConfig = NEURAL_VOICES[edgeVoiceKey];
    }
    
    if (!voiceConfig) {
      voiceConfig = NEURAL_VOICES['madina'];
    }

    console.log(`🎙️ Edge Neural TTS: "${text.slice(0, 50)}..." → ${voiceConfig.label} | speed=${speed}`);

    // MsEdgeTTS instance yaratish
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceConfig.name, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Tezlik va pitch sozlash
    const rate = speed;  // 0.5 - 2.0
    const pitch = voiceKey === 'onyx' || voiceKey === 'sardor' ? '-5Hz' : 
                  voiceKey === 'nova' || voiceKey === 'madina' ? '+3Hz' : '+0Hz';

    // Stream orqali audio olish va bufferga yig'ish
    const { audioStream } = tts.toStream(text, { rate, pitch });

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

      // 15 soniyadan keyin timeout
      setTimeout(() => {
        resolve(chunks.length > 0 ? Buffer.concat(chunks) : null);
      }, 15000);
    });

  } catch (err) {
    console.warn('❌ Edge Neural TTS xatolik:', err.message);
    return null;
  }
}

/**
 * Mavjud Edge Neural ovozlar ro'yxatini olish
 */
export async function getAvailableVoices() {
  try {
    const tts = new MsEdgeTTS();
    const voices = await tts.getVoices();
    // Faqat O'zbek, Turk va Rus tilidagilarni filtrlash
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
