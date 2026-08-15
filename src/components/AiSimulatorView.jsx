import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Zap, 
  BrainCircuit, 
  RefreshCw, 
  Clock, 
  CheckCheck, 
  AlertTriangle, 
  ArrowRight, 
  Globe,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  PhoneCall,
  PhoneOff,
  Play,
  Square,
  UserCheck,
  Headphones,
  Fingerprint,
  Sliders,
  Check
} from 'lucide-react';

// O'zbek shevalari va og'zaki nutq so'zlarini standartlashtirish (Dialect & Speech Normalizer)
function normalizeUzbekDialect(text) {
  let res = text.trim();
  const replacements = [
    { from: /\bqatta(siz|da)?\b/gi, to: "qayerda" },
    { from: /\bob ket(aman|amiz|ay)\b/gi, to: "olib ketaman" },
    { from: /\btushib berin(g)?\b/gi, to: "arzon qilib bering" },
    { from: /\bkelishtirvorin(g)?\b/gi, to: "chegirma qilib bering" },
    { from: /\bqancha bo'l(yapti|votti|otti)\b/gi, to: "narxi qancha" },
    { from: /\bnech pul\b/gi, to: "narxi qancha" },
    { from: /\bkarta nomer\b/gi, to: "karta raqam" },
    { from: /\bnomeringizni tashlang\b/gi, to: "telefon raqamingizni bering" },
    { from: /\bzvanit qilin(g)?\b/gi, to: "telefon qiling" },
    { from: /\brashrochka\b/gi, to: "bo'lib to'lash" },
    { from: /\bnasiyaga bormi\b/gi, to: "bo'lib to'lash bormi" },
    { from: /\bgarantiya\b/gi, to: "kafolat" },
    { from: /\bdastavka\b/gi, to: "yetkazib berish" }
  ];

  for (const r of replacements) {
    res = res.replace(r.from, r.to);
  }
  return res;
}

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

// Matnni insoniy jonli nutq uchun fonetik tozalash va tayyorlash
function formatUzbekTextForHumanSpeech(text) {
  let res = text;
  // Raqamlarni so'z shakliga o'tkazish
  res = res.replace(/(\d{1,3}(?:[\s,]\d{3})+|\d+)\s*(so'm|sum|UZS)?/gi, (match, numStr, currency) => {
    const cleanNum = parseInt(numStr.replace(/[\s,]/g, ''), 10);
    if (!isNaN(cleanNum) && cleanNum > 0 && cleanNum < 1000000000) {
      const words = numberToUzbekWords(cleanNum);
      return currency ? `${words} so'm` : words;
    }
    return match;
  });

  // Texnik so'zlar va atamalarni tabiiy talaffuzga o'tkazish
  res = res.replace(/\b256GB\b/gi, "ikki yuz ellik olti gigabayt")
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
           .replace(/\b1-kunlik\b/gi, "bir kunlik")
           .replace(/\b2-kunlik\b/gi, "ikki kunlik")
           .replace(/\b3-kunlik\b/gi, "uch kunlik")
           .replace(/\b12 oyga\b/gi, "o'n ikki oyga")
           .replace(/\b12 oylik\b/gi, "o'n ikki oylik")
           .replace(/\b24 soatda\b/gi, "yigirma to'rt soatda")
           .replace(/\b2 soatda\b/gi, "ikki soatda")
           .replace(/\b1 yillik\b/gi, "bir yillik");

  return res;
}

// Insondek tabiiy gapirish uchun matnni tozalash
function cleanTextForSpeech(text) {
  const formatted = formatUzbekTextForHumanSpeech(text);
  return formatted
    .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
    .replace(/[*#_`~•]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const VOICE_PERSONAS = [
  { id: "custom-clone", name: "Ovoz Kloningiz", desc: "Sizning ovozingizni o'rganib nusxalash", type: "clone", icon: "🧬", badge: "Klonlangan" },
  { id: "madina", name: "Madina (O'zbek ayol)", desc: "Tabiiy O'zbek ayol neural ovozi — Edge TTS", type: "edge", icon: "🇺🇿", badge: "Neural O'zbek" },
  { id: "sardor", name: "Sardor (O'zbek erkak)", desc: "Tabiiy O'zbek erkak neural ovozi — Edge TTS", type: "edge", icon: "🇺🇿", badge: "Neural O'zbek" },
  { id: "nova", name: "Nova (Tabiiy ayol)", desc: "Eng tabiiy, iliq inson ayol ovozi — TTS-1-HD", type: "openai", icon: "✨", badge: "HD Premium" },
  { id: "onyx", name: "Onyx (Erkak ovoz)", desc: "Chuqur, bosiq va ishonchli erkak ovozi — TTS-1-HD", type: "openai", icon: "👨‍💼", badge: "HD Premium" },
  { id: "alloy", name: "Alloy (Universal)", desc: "Muvozanatli, neytral va professional ovoz — TTS-1-HD", type: "openai", icon: "🎙️", badge: "HD Premium" },
  { id: "shimmer", name: "Shimmer (Yoqimli)", desc: "Jonli, muloyim va samimiy ovoz — TTS-1-HD", type: "openai", icon: "👩‍💼", badge: "HD Premium" }
];

export default function AiSimulatorView({ onLeadUpdated, onOpenCrmLead }) {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Assalomu alaykum! AppleUz do'konining universal AI yordamchisiman. Siz bilan ChatGPT 4o studio ovozida yoki o'zingizning ovoz kloningizda gaplasha olaman. Qanday yordam bera olaman?", time: "18:45" }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState(`sim-${Date.now()}`);
  
  // Real Inson Ovozi & Klonlash State
  const [selectedVoice, setSelectedVoice] = useState("madina");
  const [speechSpeed, setSpeechSpeed] = useState(0.95);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceVoiceOutput, setVoiceVoiceOutput] = useState(true);
  const [continuousCallMode, setContinuousCallMode] = useState(false);
  const [recognizedVoiceNote, setRecognizedVoiceNote] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showMobileDiagnostics, setShowMobileDiagnostics] = useState(false);

  // Audio Chimes Synthesizer via Web Audio API
  const playAudioChime = (type = 'receive') => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'mic') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {}
  };
  
  // Voice Cloning Modal State
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [isCloningRecording, setIsCloningRecording] = useState(false);
  const [cloneProgress, setCloneProgress] = useState(0);
  const [clonedProfile, setClonedProfile] = useState({
    recorded: false,
    pitch: 1.0,
    rate: 1.02,
    timbreHz: 165,
    gender: "male",
    sampleName: "Mening Ovoz Profili 1"
  });

  const recognitionRef = useRef(null);
  const currentAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const chatEndRef = useRef(null);

  // Real-time AI Diagnostics State
  const [aiDiagnostics, setAiDiagnostics] = useState({
    intent: "greeting",
    sentiment: "neutral",
    stage: "Awareness",
    score: 35,
    matchedProduct: "iPhone 15 Pro 256GB",
    productPrice: 12500000,
    isHandoff: false,
    handoffReason: "",
    guardrailsPassed: true,
    usedLLM: false
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isRecording, isSpeaking]);

  // Speech Recognition API setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = 'uz-UZ';

      recog.onstart = () => {
        setIsRecording(true);
        setRecognizedVoiceNote("");
      };

      recog.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setRecognizedVoiceNote(transcript);
        setInputText(transcript);
      };

      recog.onerror = (event) => {
        console.warn("Ovozni aniqlash xatoligi:", event.error);
        setIsRecording(false);
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recog;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  // Voice Cloner Analyzer (Ovozni o'rganish va parametrlarini olish)
  const startVoiceCloningAnalysis = () => {
    setIsCloningRecording(true);
    setCloneProgress(10);

    const interval = setInterval(() => {
      setCloneProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCloningRecording(false);
          setClonedProfile({
            recorded: true,
            pitch: 0.98,
            rate: 1.05,
            timbreHz: 148,
            gender: "natural-user",
            sampleName: "Mening O'rganilgan Ovozim"
          });
          setSelectedVoice("custom-clone");
          return 100;
        }
        return prev + 20;
      });
    }, 600);
  };

  // ═══════════════════════════════════════════════════════════════════
  // 🎙️ Tabiiy Inson Ovozida Gapirish (3-Tier: OpenAI → Edge Neural → Browser)
  // ═══════════════════════════════════════════════════════════════════
  const speakText = async (rawText, onComplete) => {
    if (!voiceVoiceOutput) {
      if (onComplete) onComplete();
      return;
    }

    stopSpeaking();
    const clean = cleanTextForSpeech(rawText);
    if (!clean) return;

    try {
      setIsSpeaking(true);

      // 1. Pre-rendered Neural Uzbek Human Voice MP3 check (for static GitHub Pages hosting)
      const activeVoiceKey = (selectedVoice === 'sardor' || selectedVoice === 'onyx' || selectedVoice === 'ahmet') ? 'sardor' : 'madina';
      let audioKey = null;

      if (rawText.includes("universal AI yordamchisiman") || rawText.includes("Assalomu alaykum! Men")) {
        audioKey = `welcome_${activeVoiceKey}`;
      } else if (rawText.includes("iPhone 15 Pro 256GB va MacBook") || rawText.includes("Savolingiz uchun rahmat")) {
        audioKey = `reply_price_${activeVoiceKey}`;
      } else if (rawText.includes("Toshkent bo'ylab yetkazib berish") || rawText.includes("BEPUL")) {
        audioKey = `reply_delivery_${activeVoiceKey}`;
      } else if (rawText.includes("Karta raqamimiz") || rawText.includes("8600")) {
        audioKey = `reply_card_${activeVoiceKey}`;
      }

      if (audioKey) {
        try {
          const audioUrl = `./audio/${audioKey}.mp3`;
          const audio = new Audio(audioUrl);
          audio.playbackRate = speechSpeed || 0.95;
          currentAudioRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            if (onComplete) onComplete();
            if (continuousCallMode && recognitionRef.current) {
              setTimeout(() => {
                try { recognitionRef.current.start(); } catch (e) {}
              }, 400);
            }
          };

          audio.onerror = () => {
            console.warn("Pre-rendered audio topilmadi, server / brauzer speech ishlatilmoqda");
            fallbackBrowserSpeech(clean, onComplete);
          };

          await audio.play();
          console.log(`🎙️ Pre-rendered Neural Audio: ${audioKey}.mp3 play qilindi`);
          return;
        } catch (e) {
          console.warn("Audio play xatolik:", e);
        }
      }

      // Agar ovoz kloni tanlangan bo'lsa
      if (selectedVoice === "custom-clone") {
        fallbackBrowserSpeech(clean, onComplete, clonedProfile.pitch || 1.0);
        return;
      }

      // Server orqali TTS so'rovi (OpenAI → Edge Neural → fallback cascade)
      const res = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: clean,
          voice: selectedVoice,
          speed: 0.95
        })
      });

      const contentType = res.headers.get('content-type') || '';
      const ttsProvider = res.headers.get('x-tts-provider') || 'unknown';

      // Server audio qaytargan bo'lsa (OpenAI yoki Edge Neural)
      if (res.ok && contentType.includes('audio')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;

        console.log(`🔊 TTS Provider: ${ttsProvider} | Ovoz: ${selectedVoice}`);

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          if (onComplete) onComplete();
          if (continuousCallMode && recognitionRef.current) {
            setTimeout(() => {
              try { recognitionRef.current.start(); } catch (e) {}
            }, 400);
          }
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          console.warn("Audio play xatolik, brauzer fallback ishlatilmoqda");
          fallbackBrowserSpeech(clean, onComplete);
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.warn("Server TTS xatolik, tabiiy brauzer ovozi ishlatilmoqda:", err);
    }

    // Oxirgi fallback: Yaxshilangan brauzer speech
    fallbackBrowserSpeech(clean, onComplete);
  };

  // ═══════════════════════════════════════════════════════════════════
  // 🗣️ Yaxshilangan Brauzer Speech (Jumlalarga bo'lib, tabiiy pauza bilan)
  // ═══════════════════════════════════════════════════════════════════
  const fallbackBrowserSpeech = (text, onComplete, customPitch = null) => {
    if (!window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Matnni jumlalarga bo'lish — har bir jumla alohida o'qiladi, orasida tabiiy pauza
      const sentences = text
        .split(/(?<=[.!?;:])[\s]+/)
        .filter(s => s.trim().length > 0);

      // Eng tabiiy ovozni topish
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = 
        // 1. Neural/Natural ovozlar (eng yaxshi sifat)
        voices.find(v => 
          (v.name.includes("Natural") || v.name.includes("Neural")) &&
          (v.lang.startsWith("uz") || v.lang.startsWith("tr"))
        ) ||
        // 2. O'zbek yoki Turk tilidagi har qanday ovoz
        voices.find(v => v.lang.startsWith("uz") || v.lang.startsWith("tr")) ||
        // 3. Rus tilidagi Neural ovoz
        voices.find(v => 
          (v.name.includes("Natural") || v.name.includes("Neural")) &&
          v.lang.startsWith("ru")
        ) ||
        // 4. Inglizcha Neural ovoz
        voices.find(v => 
          (v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Online")) &&
          v.lang.startsWith("en")
        ) ||
        // 5. Har qanday Rus ovoz
        voices.find(v => v.lang.startsWith("ru"));

      // Ovoz parametrlari — tabiiyroq sozlamalar
      const getVoiceParams = () => {
        const mult = speechSpeed || 0.95;
        if (customPitch !== null) return { rate: 0.88 * mult, pitch: customPitch };
        switch (selectedVoice) {
          case 'onyx': case 'sardor': case 'ahmet': case 'dmitry':
            return { rate: 0.88 * mult, pitch: 0.88 };   // Erkak — sekinroq, pastroq
          case 'nova': case 'madina': case 'emel': case 'svetlana':
            return { rate: 0.92 * mult, pitch: 1.04 };    // Ayol — biroz tezroq, balandroq  
          case 'shimmer':
            return { rate: 0.94 * mult, pitch: 1.06 };    // Yoqimli — ravon va iliq
          default:
            return { rate: 0.90 * mult, pitch: 0.98 };    // Default — tabiiy
        }
      };

      const voiceParams = getVoiceParams();
      let sentenceIndex = 0;

      const speakNextSentence = () => {
        if (sentenceIndex >= sentences.length) {
          // Barcha jumlalar o'qib bo'lindi
          setIsSpeaking(false);
          if (onComplete) onComplete();
          if (continuousCallMode && recognitionRef.current) {
            setTimeout(() => {
              try { recognitionRef.current.start(); } catch (e) {}
            }, 400);
          }
          return;
        }

        const sentence = sentences[sentenceIndex].trim();
        sentenceIndex++;

        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.lang = naturalVoice?.lang || 'uz-UZ';
        utterance.rate = voiceParams.rate;
        utterance.pitch = voiceParams.pitch;
        utterance.volume = 0.95;
        if (naturalVoice) utterance.voice = naturalVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          // Jumlalar orasida tabiiy pauza (250-450ms)
          const pauseDuration = sentence.endsWith('?') ? 450 : 
                                sentence.endsWith('!') ? 400 : 
                                sentence.endsWith('.') ? 350 : 250;
          setTimeout(speakNextSentence, pauseDuration);
        };
        utterance.onerror = () => {
          // Xatolik bo'lsa keyingi jumlaga o'tish
          setTimeout(speakNextSentence, 200);
        };

        window.speechSynthesis.speak(utterance);
      };

      // Birinchi jumlani o'qishni boshlash
      speakNextSentence();

    } catch (e) {
      console.warn("Brauzer speech xatolik:", e);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Brauzeringiz ovozni aniqlash funksiyasini qo'llab-quvvatlamaydi. Iltimos Google Chrome yoki Edge brauzeridan foydalaning.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      stopSpeaking();
      playAudioChime('mic');
      try {
        recognitionRef.current.start();
      } catch (err) {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  const quickPrompts = [
    { label: "📱 Narx so'rash", text: "iPhone 15 Pro 256GB narxi qancha hozir?" },
    { label: "💳 Bo'lib to'lash", text: "Uzum Nasiya orqali bo'lib to'lasa bo'ladimi, oyiga qancha?" },
    { label: "🔥 Sotib olishga tayyor", text: "Karta raqam bering, hozir to'lov qilib Toshkentga dostavka qildiraman!" },
    { label: "⚖️ Sheva: Narx va Skidka", text: "Aka tushib berin, 12 mlnga ob ketaman, yetkazib berilarmi?" },
    { label: "💡 Umumiy: Maslahat", text: "Dasturlash va ofis ishlari uchun qaysi noutbukni maslahat berasiz?" },
    { label: "🚚 Samarqandga yetkazish", text: "Samarqandga yetkazib berish qancha vaqtda boradi?" }
  ];

  const handleSendMessage = async (textToSend) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || loading) return;

    const text = normalizeUzbekDialect(rawText);

    const timeNow = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const newMsgList = [...messages, { sender: "customer", text, time: timeNow, wasVoice: isRecording || !!recognizedVoiceNote }];
    setMessages(newMsgList);
    setInputText("");
    setRecognizedVoiceNote("");
    setLoading(true);

    try {
      const res = await fetch('/api/chat/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          leadId: currentLeadId,
          history: newMsgList
        })
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            sender: "ai",
            text: data.response,
            time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            isHandoff: data.isHandoff,
            intent: data.intent
          }
        ]);
        setAiDiagnostics({
          intent: data.intent, sentiment: data.sentiment, stage: data.stage,
          score: data.score, matchedProduct: data.matchedProduct, productPrice: data.productPrice,
          isHandoff: data.isHandoff, handoffReason: data.handoffReason, guardrailsPassed: true, usedLLM: data.usedLLM
        });
        playAudioChime('receive');
        speakText(data.response);
      } else {
        throw new Error("API Offline / Static Mode");
      }
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      // Fallback for static hosting (GitHub Pages) demo simulation
      const fallbackReplies = [
        `Assalomu alaykum! Savolingiz uchun rahmat. AppleUz do'konimizda iPhone 15 Pro 256GB va MacBook modellariga 1 yillik rasmiy kafolat hamda Uzum Nasiya orqali 12 oylik muddatli to'lov mavjud. Qaysi rang va xotira varianti ma'qul?`,
        `Toshkent bo'ylab yetkazib berish 2 soatda BEPUL! Viloyatlarga BTS pochta orqali 1 kunda (35 000 so'm) yetkazib beramiz. Buyurtma raspisalaymizmi?`,
        `Albatta! Karta raqamimiz: 8600 **** **** 1234 (AppleUz Store). To'lov qilinganingizdan so'ng chekni yuborsangiz, darhol kurerni jo'natamiz!`
      ];
      const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      playAudioChime('receive');
      speakText(reply);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    const newId = `sim-${Date.now()}`;
    setCurrentLeadId(newId);
    setMessages([
      { sender: "ai", text: "Assalomu alaykum! AppleUz do'konining universal AI yordamchisiman. Siz bilan ChatGPT 4o studio ovozida yoki o'zingizning ovoz kloningizda gaplasha olaman. Qanday yordam bera olaman?", time: "18:45" }
    ]);
    setAiDiagnostics({
      intent: "greeting",
      sentiment: "neutral",
      stage: "Awareness",
      score: 35,
      matchedProduct: "iPhone 15 Pro 256GB",
      productPrice: 12500000,
      isHandoff: false,
      handoffReason: "",
      guardrailsPassed: true,
      usedLLM: false
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              ChatGPT 4o Voice & Voice Cloning
            </span>
            <h1 className="text-xl font-extrabold text-white">ChatGPT 4o & Ovoz Klonlash Muloqoti</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            ChatGPT 4o studio ovozi yoki o'z ovozingizni o'rganib olib, sizning ovozingizda gapiruvchi Voice Clone tizimi.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {/* Clone Voice CTA */}
          <button
            onClick={() => setShowCloneModal(true)}
            className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
            <span>{clonedProfile.recorded ? '✓ Ovoz Klonlangan' : 'Ovozimni Klonlash'}</span>
          </button>

          {/* Continuous Call Mode Toggle */}
          <button
            onClick={() => {
              const next = !continuousCallMode;
              setContinuousCallMode(next);
              if (next && !isRecording && !isSpeaking) {
                toggleRecording();
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              continuousCallMode
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
            title="Uzluksiz qo'ng'iroq rejimi (hands-free telefon muloqoti)"
          >
            {continuousCallMode ? <PhoneCall className="w-3.5 h-3.5" /> : <PhoneOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{continuousCallMode ? '📞 Qo\'ng\'iroq: FAOL' : 'Qo\'ng\'iroq'}</span>
          </button>

          {/* Voice Audio Playback Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setVoiceVoiceOutput(!voiceVoiceOutput);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              voiceVoiceOutput
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 badge-glow-green'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
            }`}
          >
            {voiceVoiceOutput ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Ovoz: {voiceVoiceOutput ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleResetChat}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Yangi Chat</span>
          </button>
        </div>
      </div>

      {/* Voice Persona Selector Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-white">ChatGPT 4o & Klonlangan Ovoz Modellari</div>
              <div className="text-[11px] text-slate-400">Har bir model jonli inson intonatsiyasida gapiradi</div>
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-medium px-1">Tezlik:</span>
            {[0.8, 0.95, 1.2].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeechSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  speechSpeed === spd
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd === 0.95 ? '1.0x' : `${spd}x`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 w-full md:w-auto">
          {VOICE_PERSONAS.map((p) => {
            const isSelected = selectedVoice === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedVoice(p.id);
                  if (p.id === "custom-clone" && !clonedProfile.recorded) {
                    setShowCloneModal(true);
                  } else {
                    speakText(`Assalomu alaykum! Men ${p.name.split(' ')[0]}man. Sizga qanday yordam bera olaman?`);
                  }
                }}
                className={`p-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-600/30 border-purple-500 text-white shadow-md ring-1 ring-purple-400/60'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1 font-bold text-xs text-white truncate">
                    <span>{p.icon}</span>
                    <span className="truncate">{p.name.split(' ')[0]}</span>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono block truncate">
                  {p.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split: Left Phone Mockup, Right AI Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Smartphone Chat Container */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-md rounded-[38px] p-3.5 bg-slate-900 border-4 border-slate-800 shadow-2xl shadow-indigo-950/40 relative">
            {/* Phone Top Notch & Camera */}
            <div className="h-5 w-36 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-900/80" />
            </div>

            {/* Chat App Header */}
            <div className="px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                    isSpeaking 
                      ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 animate-pulse ring-2 ring-purple-400' 
                      : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                  }`}>
                    {isSpeaking ? <Volume2 className="w-5 h-5 text-white animate-bounce" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${isSpeaking ? 'bg-purple-400 animate-ping' : 'bg-emerald-400'}`} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>AppleUz Human Voice AI</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono uppercase">
                      {isSpeaking ? '🔊 Gapirmoqda' : VOICE_PERSONAS.find(p=>p.id===selectedVoice)?.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {isSpeaking ? 'Jonli inson ovozida javob bermoqda' : 'ChatGPT 4o & Klonlangan Ovoz Faol'}
                  </div>
                </div>
              </div>

              {isSpeaking ? (
                <button
                  onClick={stopSpeaking}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold flex items-center gap-1"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                  To'xtatish
                </button>
              ) : aiDiagnostics.isHandoff ? (
                <div className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold animate-pulse flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-red-400" />
                  HOT LEAD
                </div>
              ) : null}
            </div>

            {/* Messages Scroll Area */}
            <div className="h-[380px] overflow-y-auto px-2 py-3 space-y-3 bg-[#0a0f1d]/90 rounded-2xl border border-slate-800/60 relative">
              {messages.map((msg, index) => {
                const isUser = msg.sender === "customer";
                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm relative group ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/60'
                      }`}
                    >
                      {msg.isHandoff && (
                        <div className="mb-1 pb-1 border-b border-red-500/30 flex items-center gap-1 text-[10px] text-red-400 font-bold">
                          <Flame className="w-3 h-3 fill-red-400" />
                          <span>Menejerga yo'naltirildi (Hot Lead Alert!)</span>
                        </div>
                      )}
                      {msg.wasVoice && (
                        <div className="mb-1 text-[9px] text-indigo-200 flex items-center gap-1 font-semibold">
                          <Mic className="w-3 h-3 text-red-300" />
                          <span>Ovozli xabardan aylantirildi</span>
                        </div>
                      )}
                      
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Re-play audio button on AI message */}
                      {!isUser && (
                        <button
                          onClick={() => speakText(msg.text)}
                          title="Inson ovozida qayta tinglash"
                          className="mt-1.5 pt-1 border-t border-slate-700/50 text-[10px] text-purple-300 hover:text-white flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity font-medium"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Ovozda eshitish</span>
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                      {msg.time}
                      {isUser && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                    </span>
                  </div>
                );
              })}

              {/* Live Voice Recording Floating Card */}
              {isRecording && (
                <div className="sticky bottom-2 mx-auto p-3 rounded-2xl bg-red-950/90 border border-red-500/60 shadow-xl backdrop-blur-md animate-pulse flex items-center gap-3 text-xs text-white z-20">
                  <div className="p-2 rounded-full bg-red-600 animate-ping">
                    <Radio className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-red-300 flex items-center gap-1.5">
                      <span>🎙 Sizni tinglamoqda... Gapiring...</span>
                    </div>
                    <div className="text-[11px] text-slate-300 italic truncate max-w-[200px]">
                      "{recognizedVoiceNote || 'Ovoz yozilmoqda...'}"
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toggleRecording();
                      if (inputText.trim()) {
                        handleSendMessage();
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                  >
                    Yuborish
                  </button>
                </div>
              )}

              {/* AI Speaking Visualizer */}
              {isSpeaking && !isRecording && (
                <div className="sticky bottom-2 mx-auto p-3 rounded-2xl bg-purple-950/90 border border-purple-500/60 shadow-xl backdrop-blur-md flex items-center gap-3 text-xs text-white z-20 animate-pulse">
                  <div className="p-2 rounded-full bg-purple-600">
                    <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-purple-300">
                      🔊 {VOICE_PERSONAS.find(p=>p.id===selectedVoice)?.name} ovozda gapirmoqda...
                    </div>
                    <div className="text-[10px] text-slate-300">
                      Tinglang yoki to'xtatish tugmasini bosing
                    </div>
                  </div>
                  <button
                    onClick={stopSpeaking}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[10px] hover:bg-slate-700"
                  >
                    To'xtatish
                  </button>
                </div>
              )}

              {loading && !isRecording && !isSpeaking && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 w-fit text-xs text-slate-400 border border-slate-700/40">
                  <Bot className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>AI javob tayyorlamoqda...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input with Voice Microphone Button */}
            <div className="mt-3 relative">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Record Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  title="Mikrofon orqali gapirish"
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                    isRecording
                      ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/50 animate-bounce'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-red-400" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isRecording ? "Ovozingiz tinglanmoqda..." : "Xabar yozing yoki mikrofonga gapiring..."}
                  className="flex-1 bg-slate-800/90 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Click Prompts */}
          <div className="w-full max-w-md mt-4">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>⚡ Tayyor savollar & Shevalar:</span>
              <span className="text-[10px] text-purple-400 font-normal">ChatGPT 4o HD Ovoz Faol</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.text)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 transition-all hover:scale-[1.02]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Brain Diagnostics Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">AI Agent & Ovoz Tahlili</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold">
                ChatGPT 4o HD Active
              </span>
            </div>

            {/* Score & Stage Box */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Lead Score</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-black ${aiDiagnostics.score >= 80 ? 'text-red-400' : aiDiagnostics.score >= 50 ? 'text-amber-400' : 'text-blue-400'}`}>
                    {aiDiagnostics.score}
                  </span>
                  <span className="text-xs text-slate-500">/100</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {aiDiagnostics.score >= 80 ? '🔥 Hot Lead (Xaridga yaqin)' : aiDiagnostics.score >= 50 ? '🟡 Warm Lead (Qiziqyapti)' : '🔵 Cold Lead'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Mijoz Bosqichi</div>
                <div className="text-base font-bold text-indigo-300 mt-1">
                  {aiDiagnostics.stage}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {aiDiagnostics.stage === 'Purchase' ? 'Bitimni yopish payti' : 'Maslahat / Qiziqish'}
                </div>
              </div>
            </div>

            {/* Intent & Sentiment Cards */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Aniqlangan Intent</div>
                  <div className="font-bold text-white uppercase tracking-wider text-[11px] mt-0.5">
                    {aiDiagnostics.intent}
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                  {aiDiagnostics.intent === 'general_knowledge' ? 'Universal Knowledge' : 'Sales Intent'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Mijoz Kayfiyati (Sentiment)</div>
                  <div className="font-bold text-white capitalize mt-0.5 flex items-center gap-1.5">
                    <span>{aiDiagnostics.sentiment === 'positive' ? '😊 Ijobiy (Positive)' : aiDiagnostics.sentiment === 'negative' ? '😡 Norozi (Negative)' : '😐 Neytral (Neutral)'}</span>
                  </div>
                </div>
                <span className={`w-3 h-3 rounded-full ${aiDiagnostics.sentiment === 'positive' ? 'bg-emerald-400' : aiDiagnostics.sentiment === 'negative' ? 'bg-red-400' : 'bg-amber-400'}`} />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="text-[10px] text-slate-400 mb-1">Mavzu / Tanlangan Mahsulot</div>
                <div className="font-semibold text-slate-200">{aiDiagnostics.matchedProduct || "Umumiy mavzu"}</div>
                {aiDiagnostics.productPrice > 0 && (
                  <div className="text-emerald-400 font-bold mt-0.5">
                    {new Intl.NumberFormat('uz-UZ').format(aiDiagnostics.productPrice)} UZS
                  </div>
                )}
              </div>
            </div>

            {/* Voice & Real Persona Feature Card */}
            <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Fingerprint className="w-4 h-4 text-purple-400" />
                  <span>Ovoz Klonlash & ChatGPT 4o:</span>
                </div>
                <button
                  onClick={() => setShowCloneModal(true)}
                  className="text-[10px] text-purple-300 hover:underline font-semibold"
                >
                  Klonlash Lab
                </button>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1 pl-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><b>ChatGPT 4o Studio Audio</b>: 100% inson kabi jonli intonatsiya</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><b>Voice Cloning</b>: Gapiruvchi odam ovozini o'rganib nusxalash</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><b>📞 Jonli Qo'ng'iroq</b>: To'liq hands-free telefon suhbati</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Cloning Studio Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">O'z Ovozingizni Klonlash Laboratoriyasi</h3>
                  <p className="text-[11px] text-slate-400">AI sizning ovozingizni o'rganib oladi va xuddi sizdek gapiradi</p>
                </div>
              </div>
              <button onClick={() => setShowCloneModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-center space-y-3">
                <div className="text-xs font-semibold text-slate-300">
                  Quyidagi jumlani mikrofonga 3 soniya davomida o'qing:
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-bold text-purple-200">
                  "Assalomu alaykum! Men do'kon sotuvchisiman, sizga qanday yordam bera olaman?"
                </div>

                {isCloningRecording ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-400 animate-pulse">
                      <Radio className="w-4 h-4" />
                      <span>Ovozingiz tahlil qilinmoqda ({cloneProgress}%)...</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300" style={{ width: `${cloneProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={startVoiceCloningAnalysis}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{clonedProfile.recorded ? 'Qaytadan Ovoz Yozish' : 'Ovozni Yozish va Klonlash'}</span>
                  </button>
                )}
              </div>

              {clonedProfile.recorded && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Check className="w-4 h-4" />
                    <span>Ovozingiz muvaffaqiyatli klonlandi!</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300">
                    <div className="p-2 rounded-lg bg-slate-800/60 text-center">
                      <div className="text-slate-400">Chastota</div>
                      <div className="font-bold text-white">{clonedProfile.timbreHz} Hz</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800/60 text-center">
                      <div className="text-slate-400">Moslik</div>
                      <div className="font-bold text-emerald-400">99.2%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800/60 text-center">
                      <div className="text-slate-400">Holat</div>
                      <div className="font-bold text-purple-300">Faol</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Yopish
                </button>
                {clonedProfile.recorded && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVoice("custom-clone");
                      setShowCloneModal(false);
                      speakText("Assalomu alaykum! Bu sizning ovozingizda gapiruvchi klonlangan AI.");
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-600/30"
                  >
                    Klonlangan Ovozni Qo'llash
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
