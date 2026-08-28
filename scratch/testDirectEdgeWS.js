import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

function generateDirectEdgeTTS(text, voice = "uz-UZ-MadinaNeural") {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4");
    const audioChunks = [];
    const reqId = uuidv4().replace(/-/g, "");

    ws.on('open', () => {
      // 1. Config
      const configMsg = "Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n" +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: { sentenceBoundaryEnabled: "false", wordBoundaryEnabled: "false" },
                outputFormat: "audio-24khz-48kbitrate-mono-mp3"
              }
            }
          }
        });
      ws.send(configMsg);

      // 2. SSML with natural pauses
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='uz-UZ'>` +
        `<voice name='${voice}'>` +
        `<prosody pitch='+0Hz' rate='-4%'>` +
        text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        `</prosody>` +
        `</voice></speak>`;

      const ssmlMsg = `X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;
      ws.send(ssmlMsg);
    });

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        // Binary message contains header: 2 bytes header length + header string + audio
        const headerLen = data.readUInt16BE(0);
        const headerStr = data.slice(2, 2 + headerLen).toString('utf-8');
        if (headerStr.includes("Path:audio")) {
          const audioBody = data.slice(2 + headerLen);
          audioChunks.push(audioBody);
        }
      } else {
        const textStr = data.toString('utf-8');
        if (textStr.includes("Path:turn.end")) {
          ws.close();
          const totalBuffer = Buffer.concat(audioChunks);
          resolve(totalBuffer);
        }
      }
    });

    ws.on('error', (err) => {
      reject(err);
    });

    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
      if (audioChunks.length > 0) resolve(Buffer.concat(audioChunks));
      else reject(new Error("Timeout"));
    }, 15000);
  });
}

async function run() {
  console.log("Testing direct Edge Neural TTS WebSocket...");
  try {
    const buf = await generateDirectEdgeTTS("Assalomu alaykum! AppleUz do'konining jonli inson ovozidagi AI maslahatchisiman. Sizga qanday yordam bera olaman?");
    console.log("Generated direct buffer length:", buf.byteLength);
    if (buf.byteLength > 1000) {
      fs.writeFileSync("scratch/test_direct_madina.mp3", buf);
      console.log("✅ Saved scratch/test_direct_madina.mp3! Direct Edge Neural TTS works 100%!");
    }
  } catch (e) {
    console.error("Direct Edge TTS error:", e);
  }
}

run();
