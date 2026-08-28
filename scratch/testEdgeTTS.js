import { generateEdgeTTS } from '../backend/edgeTts.js';

async function testTTS() {
  console.log("Testing Edge Neural TTS with Madina...");
  const buf = await generateEdgeTTS("Assalomu alaykum! AppleUz do'koniga xush kelibsiz. Bugun sizga qanday yordam bera olaman?", "madina", 0.95);
  console.log("Result buffer length:", buf ? buf.byteLength : 0);
  if (buf && buf.byteLength > 1000) {
    console.log("✅ Edge Neural TTS works perfectly!");
  } else {
    console.log("❌ Failed to generate TTS");
  }
}

testTTS();
