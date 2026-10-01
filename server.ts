/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

import { getGames, saveGame, likeGame, playGame, getResults, saveResult, shareGame, rateGame } from './server_db';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Gemini SDK lazily
let ai: GoogleGenAI | null = null;
function getGeminiSDK(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// Helper to generate dynamic mock analysis in case Gemini is offline or unconfigured
function generateMockAnalysis(nickname: string, gameTitle: string, keepItems: string[], discardItems: string[], isEnglish: boolean) {
  const aliasesId = [
    'Sang Penjaga Keseimbangan Semesta',
    'Duta Skena Jaksel Penuh Plot Twist',
    'Overthinker Profesional Kelas Premium',
    'Penganut Aliran YOLO Garis Keras',
    'Kolektor Barang Random Estetik',
    'Pakar Pilih-Pilih Makanan Nusantara',
    'Duta Anti-Red-Flag Indonesia'
  ];
  const aliasesEn = [
    'The Master of Universal Balance',
    'The Hipster Slang Slashing Guru',
    'Professional Overthinker (Premium Tier)',
    'Hardcore YOLO Practitioner',
    'Aesthetic Chaos Collector',
    'Nusantara Culinary Judge',
    'Anti-Red-Flag Ambassador'
  ];

  const thinkingStylesId = ['YOLO Abis', 'Overthinking Maksimal', 'Praktis nan Pelit', 'Santai Kayak di Pantai', 'Intelektual Senja'];
  const thinkingStylesEn = ['YOLO Mindset', 'Maximum Overthinking', 'Highly Practical', 'Chill & Laidback', 'Aesthetic Thinker'];

  const preferencesId = ['Gaya Hidup Estetik & Santai', 'Mencari Ketenangan Jiwa', 'Keamanan Dompet & Finansial', 'Kenikmatan Kuliner Instan'];
  const preferencesEn = ['Aesthetic & Chill Lifestyle', 'Inner Peace & Serenity', 'Wallet Protection Plan', 'Instant Culinary Joy'];

  const decisionTypesId = ['Spontan & Impulsif', 'Penuh Pertimbangan Matang', 'Instingtif Instan', 'Takut Rugi'];
  const decisionTypesEn = ['Spontaneous & Impulsive', 'Well-calculated Choice', 'Instant Instinctive', 'Fear of Missing Out'];

  const greenFlagsId = [
    'Sangat mandiri dalam memilih hal krusial',
    'Punya prinsip hidup yang kokoh tak tertandingi',
    'Selera humor tingkat tinggi di tongkrongan',
    'Bisa membedakan mana kebutuhan vs keinginan',
    'Pendengar setia curhatan galau temen'
  ];
  const greenFlagsEn = [
    'Highly independent in making choices',
    'Solid and unshakeable lifestyle principles',
    'Premium sense of humor in the group',
    'Knows how to separate needs from wants',
    'Loyal listener for friends late night talks'
  ];

  const redFlagsId = [
    'Hobi stalking akun sosmed mantan jam 2 pagi',
    'Belanja online keranjang penuh tapi gak dibayar',
    'Sering bilang OTW padahal baru bangun tidur',
    'Beli barang diskonan yang sebenernya ga butuh',
    'Paling anti diajak nongkrong kalo ga ada makanan gratis'
  ];
  const redFlagsEn = [
    'Loves stalking their ex at 2 AM',
    'Fills shopping carts but never checkouts',
    'Says "On My Way" when still in bed',
    'Buys discounted items they do not need',
    'Refuses to hang out unless there is free food'
  ];

  const traitNamesId = ['Kreatif', 'Praktis', 'Impulsif', 'Bucin', 'Skena/Jaksel'];
  const traitNamesEn = ['Creative', 'Practical', 'Impulsive', 'Romantic', 'Hipster'];

  // Select random elements
  const alias = isEnglish 
    ? aliasesEn[Math.floor(Math.random() * aliasesEn.length)]
    : aliasesId[Math.floor(Math.random() * aliasesId.length)];

  const thinkingStyle = isEnglish
    ? thinkingStylesEn[Math.floor(Math.random() * thinkingStylesEn.length)]
    : thinkingStylesId[Math.floor(Math.random() * thinkingStylesId.length)];

  const preference = isEnglish
    ? preferencesEn[Math.floor(Math.random() * preferencesEn.length)]
    : preferencesId[Math.floor(Math.random() * preferencesId.length)];

  const decisionType = isEnglish
    ? decisionTypesEn[Math.floor(Math.random() * decisionTypesEn.length)]
    : decisionTypesId[Math.floor(Math.random() * decisionTypesId.length)];

  const shuffle = (arr: string[]) => [...arr].sort(() => 0.5 - Math.random());
  const selectedGreen = shuffle(isEnglish ? greenFlagsEn : greenFlagsId).slice(0, 2);
  const selectedRed = shuffle(isEnglish ? redFlagsEn : redFlagsId).slice(0, 2);

  const traits = (isEnglish ? traitNamesEn : traitNamesId).map((name) => ({
    name,
    value: Math.floor(Math.random() * 50) + 45 // 45 to 94%
  }));

  let summary = '';
  if (isEnglish) {
    if (keepItems.length > 0 && discardItems.length > 0) {
      summary = `Based on your choices, keeping "${keepItems[0]}" while discarding "${discardItems[0]}" reveals your unique life balance. You prioritize what brings immediate value and let go of unnecessary clutter. You are dynamic, highly adaptable, and definitely have a solid sense of style!`;
    } else if (keepItems.length > 0) {
      summary = `Your decision to keep "${keepItems[0]}" shows you are a person of focus and dedication. You appreciate the finer things in life and do not compromise on your preferences. Truly a standout character in any crowd!`;
    } else {
      summary = `By discarding key items, you demonstrate a highly selective and minimal lifestyle. You don't let external trends dictate your peace of mind. A free-spirited explorer of life!`;
    }
  } else {
    if (keepItems.length > 0 && discardItems.length > 0) {
      summary = `Keputusanmu untuk memilih "${keepItems[0]}" dan membuang "${discardItems[0]}" membuktikan kelihaianmu dalam menyortir drama kehidupan. Kamu tahu persis kapan harus bertahan dan kapan harus merelakan. Sungguh karakter yang penuh plot twist dan asyik diajak nongkrong!`;
    } else if (keepItems.length > 0) {
      summary = `Pilihanmu untuk keep "${keepItems[0]}" membuktikan bahwa kamu berjiwa kokoh dan setia pada komitmen. Kamu tidak mudah goyah oleh rayuan diskon atau tren sesaat. Karakter utama sejati!`;
    } else {
      summary = `Dengan membuang barang-barang pilihan, kamu menunjukkan jiwa minimalis yang anti-ribet. Prinsip hidupmu adalah mengurangi beban pikiran agar bisa melangkah lebih enteng. Jiwa bebas yang tangguh!`;
    }
  }

  return {
    nickname,
    alias,
    summary,
    thinkingStyle,
    preference,
    decisionType,
    greenFlags: selectedGreen,
    redFlags: selectedRed,
    traits
  };
}

// API endpoint for AI personality summary
app.post('/api/analyze', async (req, res) => {
  const { nickname, gameTitle, gameDescription, decisions, language } = req.body;
  const isEnglish = language === 'en';
  const keepItems = decisions && Array.isArray(decisions)
    ? decisions.filter((d: any) => d.decision === 'keep').map((d: any) => d.itemName)
    : [];
  const discardItems = decisions && Array.isArray(decisions)
    ? decisions.filter((d: any) => d.decision === 'discard').map((d: any) => d.itemName)
    : [];

  try {
    if (!nickname || !decisions || !Array.isArray(decisions)) {
      return res.status(400).json({ error: 'Data tidak lengkap. Kirim nickname, gameTitle, dan decisions.' });
    }

    const sdk = getGeminiSDK();
    
    const prompt = isEnglish ? `
      The player named "${nickname}" has just completed the interactive "Keep or Discard" game titled "${gameTitle}" (${gameDescription}).
      
      Player decisions:
      - KEPT ITEMS (KEEP): [${keepItems.join(', ') || 'None'}]
      - DISCARDED ITEMS (DISCARD): [${discardItems.join(', ') || 'None'}]
      
      Your task is to analyze the choices above and generate a personality analysis that is highly humorous, entertaining, witty, and modern. Use modern, popular slang that is casual but respectful, funny roasts/sarcasm, playful green flags and red flags, a unique nickname, and trait percentage values. The language of the response must be English.
      
      Format the response MUST be pure JSON with the following schema:
      {
        "nickname": "${nickname}",
        "alias": "Unique humorous title (e.g. 'Coffee Shop Philosopher' or 'Chaos Collector')",
        "summary": "Concise personality analysis that is funny and entertaining based on their keep & discard choices (approx. 3-4 sentences). Use modern English internet slang/tone.",
        "thinkingStyle": "Their thinking style (e.g. 'YOLO Mindset', 'Maximum Overthinker', 'Practical & Cheap')",
        "preference": "Main preference or lifestyle theme based on these choices",
        "decisionType": "Decision-making style (e.g. 'Impulsive buyer', 'Fear of Missing Out', 'Chill and Relaxed')",
        "greenFlags": [
          "Fun Green Flag 1 (e.g., Saves money like a pro)",
          "Fun Green Flag 2"
        ],
        "redFlags": [
          "Fun Red Flag 1 (e.g., Constantly text back their ex)",
          "Fun Red Flag 2"
        ],
        "traits": [
          { "name": "Creative", "value": 75 },
          { "name": "Practical", "value": 60 },
          { "name": "Impulsive", "value": 45 },
          { "name": "Romantic", "value": 90 },
          { "name": "Hipster", "value": 30 }
        ]
      }
      
      Important: Provide varied trait percentage values between 0-100 logically matched to the player's choices. Make it extremely fun to read and perfect for sharing on Instagram Stories or Twitter/X. Return ONLY the JSON.
    ` : `
      Pemain bernama "${nickname}" baru saja menyelesaikan game interaktif "Pilih atau Buang" berjudul "${gameTitle}" (${gameDescription}).
      
      Pilihan keputusan pemain:
      - ITEM YANG DIPILIH (KEEP): [${keepItems.join(', ') || 'Tidak ada'}]
      - ITEM YANG DIBUANG (DISCARD): [${discardItems.join(', ') || 'Tidak ada'}]
      
      Tugas kamu adalah menganalisis pilihan di atas dan menghasilkan feedback kepribadian yang sangat humoris, menghibur, modern, dan bernuansa lokal Indonesia (menggunakan bahasa gaul populer yang santai tapi sopan, penuh sindiran lucu, green flag dan red flag versi bercanda, julukan unik, serta nilai persentase karakter).
      
      Format respon HARUS berupa JSON murni dengan skema berikut:
      {
        "nickname": "${nickname}",
        "alias": "Julukan unik humoris seperti 'Duta Skena Senopati' atau 'Chaos Collector'",
        "summary": "Analisis ringkas kepribadian yang lucu dan menghibur berdasarkan keep & discard mereka (sekitar 3-4 kalimat). Gunakan gaya bahasa anak muda Indonesia.",
        "thinkingStyle": "Gaya berpikir mereka (misal: 'YOLO Abis', 'Overthinking Maksimal', 'Praktis nan Pelit')",
        "preference": "Preferensi hidup atau gaya hidup utama mereka berdasarkan keputusan ini",
        "decisionType": "Tipe pengambilan keputusan (misal: 'Impulsif karena diskon', 'Takut Rugi', 'Santai kayak di pantai')",
        "greenFlags": [
          "Fun Green Flag 1 (misal: Hemat pangkal kaya)",
          "Fun Green Flag 2"
        ],
        "redFlags": [
          "Fun Red Flag 1 (misal: Hobi banget balikan sama mantan)",
          "Fun Red Flag 2"
        ],
        "traits": [
          { "name": "Kreatif", "value": 75 },
          { "name": "Praktis", "value": 60 },
          { "name": "Impulsif", "value": 45 },
          { "name": "Bucin", "value": 90 },
          { "name": "Skena/Jaksel", "value": 30 }
        ]
      }
      
      Penting: Berikan nilai traits (persentase) yang bervariasi antara 0-100 disesuaikan secara logis dengan keputusan keep/discard pemain. Jangan terlalu kaku, bikin sangat asyik dibaca dan pas buat di-share ke Instagram Story atau WhatsApp. Kembalikan HANYA JSON.
    `;

    // Use gemini-2.5-flash as default powerful model for text/JSON generation
    const response = await sdk.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    const resultData = JSON.parse(responseText.trim());
    return res.json(resultData);

  } catch (error: any) {
    console.warn(`[WARNING] Gemini API key is missing or service is offline: ${error.message}. Generating dynamic mock analysis...`);
    const fallbackResult = generateMockAnalysis(nickname, gameTitle, keepItems, discardItems, isEnglish);
    return res.json(fallbackResult);
  }
});

// Database API endpoints
app.get('/api/games', async (req, res) => {
  try {
    const games = await getGames();
    return res.json(games);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    await saveGame(req.body);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/games/:id/like', async (req, res) => {
  try {
    const { isLiking } = req.body;
    await likeGame(req.params.id, isLiking);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/games/:id/play', async (req, res) => {
  try {
    await playGame(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/games/:id/share', async (req, res) => {
  try {
    await shareGame(req.params.id);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/games/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    await rateGame(req.params.id, Number(rating));
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/results', async (req, res) => {
  try {
    const results = await getResults();
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/results', async (req, res) => {
  try {
    await saveResult(req.body);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Configure Vite or production static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

startServer();
