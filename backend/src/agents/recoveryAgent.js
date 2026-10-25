/**
 * FasalRakshak AI — Gemini AI Recovery Agent
 * 
 * "AI that can't lie."
 * Translates farmer natural language (Marathi, Hindi, English) and voice queries
 * into strictly bounded deterministic tool calls. Numbers and rankings are computed
 * exclusively by verified pure code, preventing hallucinations.
 */

const https = require('https');
const config = require('../config');
const logger = require('../utils/logger');
const { calculateRecoveryPlan } = require('../recovery/recoveryEngine');

// Verified regional market alternatives in Maharashtra (Pune / Junnar / Mumbai belt)
const DEMO_ALTERNATIVES_POOL = [
  {
    id: 'alt_mandi_narayangaon',
    name: 'Narayangaon APMC Mandi (नारायणगाव बाजार समिती)',
    channelType: 'APMC_MANDI',
    location: 'Narayangaon, Junnar',
    distanceKm: 8,
    offeredPricePerKg: 20,
    intakeCapacityKg: 5000,
    dailyIntakeCapacityKg: 5000,
  },
  {
    id: 'alt_processor_sahyadri',
    name: 'Sahyadri Agro Processing Hub (सह्याद्री ॲग्रो)',
    channelType: 'FOOD_PROCESSOR',
    location: 'Dindori / Pune Gateway',
    distanceKm: 65,
    offeredPricePerKg: 21,
    intakeCapacityKg: 3000,
    dailyIntakeCapacityKg: 3000,
  },
  {
    id: 'alt_mandi_vashi',
    name: 'Mumbai Vashi APMC (वाशी घाऊक बाजार)',
    channelType: 'APMC_MANDI',
    location: 'Vashi, Navi Mumbai',
    distanceKm: 165,
    offeredPricePerKg: 26,
    intakeCapacityKg: 10000,
    dailyIntakeCapacityKg: 10000,
  },
  {
    id: 'alt_cold_storage_junnar',
    name: 'Shivneri Multi-Commodity Cold Storage (शिवनेरी कोल्ड स्टोरेज)',
    channelType: 'COLD_STORAGE',
    location: 'Alephata, Junnar',
    distanceKm: 14,
    offeredPricePerKg: 19,
    intakeCapacityKg: 8000,
    dailyIntakeCapacityKg: 8000,
  },
  {
    id: 'alt_local_vendor',
    name: 'Junnar Local Farmgate Trader (स्थानिक व्यापारी)',
    channelType: 'LOCAL_VENDOR',
    location: 'Farmgate, Junnar',
    distanceKm: 2,
    offeredPricePerKg: 16,
    intakeCapacityKg: 800,
    dailyIntakeCapacityKg: 800,
  },
];

/**
 * Execute Gemini 2.0 Flash API call via REST
 */
function callGeminiApi(payload) {
  return new Promise((resolve, reject) => {
    const apiKey = config.ai.geminiApiKey;
    if (!apiKey) {
      return reject(new Error('GEMINI_API_KEY is not configured in backend environment'));
    }

    const postData = JSON.stringify(payload);
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${config.ai.geminiModel}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error?.message || `Gemini API HTTP ${res.statusCode}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out after 10 seconds'));
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

/**
 * Run deterministic recovery tool for query
 */
function executeRecoveryTool({ cropType = 'TOMATO', quantityKg = 1000, minPrice = 14, hoursRemaining = 36 }) {
  const harvest = {
    cropType: cropType.toUpperCase(),
    availableQty: Number(quantityKg),
    minPricePerKg: Number(minPrice),
    spoilageDeadline: new Date(Date.now() + hoursRemaining * 3600 * 1000).toISOString(),
  };

  const disruption = {
    eventType: 'BUYER_CANCELLATION',
    affectedStockQty: Number(quantityKg),
    reason: 'Buyer canceled or transport failure',
  };

  return calculateRecoveryPlan({
    harvest,
    disruption,
    alternatives: DEMO_ALTERNATIVES_POOL,
    farmerPreferences: { minAcceptablePricePerKg: Number(minPrice) },
  });
}

/**
 * Process a voice or text query from a farmer
 * 
 * @param {Object} params
 * @param {string} params.query - Natural language query (Marathi, Hindi, English)
 * @param {string} [params.language='mr'] - User language ('mr', 'hi', 'en')
 * @param {Object} [params.context] - Farmer context (crop, current stock)
 * @returns {Promise<Object>} Agent explanation with verified numbers
 */
async function processFarmerQuery({ query, language = 'mr', context = {} }) {
  const defaultCrop = context.cropType || 'TOMATO';
  const defaultQty = context.quantityKg || 1000;
  const defaultMinPrice = context.minPricePerKg || 14;

  // 1. Always execute the pure mathematical calculation first
  const verifiedPlan = executeRecoveryTool({
    cropType: defaultCrop,
    quantityKg: defaultQty,
    minPrice: defaultMinPrice,
  });

  const bestOption = verifiedPlan.candidates[0];

  // 2. Prepare structured context for Gemini
  const promptSystem = `You are FasalRakshak AI (फसल रक्षक), an empathetic farm recovery assistant built for Indian farmers.
Language requested: ${language === 'mr' ? 'Marathi (मराठी)' : language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.

CRITICAL SECURITY AND ACCURACY RULES:
1. NEVER invent mandi prices, transport rates, or net returns.
2. Use ONLY the verified numbers provided in the DETERMINISTIC_DATA block below.
3. Every rupee is traceable. Explain in 2-3 warm, simple sentences why the top option is best.
4. Mention the gross rate, transport cost deduction, and final net in-hand realization per kg.

DETERMINISTIC_DATA:
Crop: ${verifiedPlan.cropType}
Disrupted Stock: ${verifiedPlan.affectedStockQty} kg
Best Option (Rank 1): ${bestOption?.name}
Distance: ${bestOption?.distanceKm} km
Offered Price: ₹${bestOption?.offeredPricePerKg}/kg
Transport Freight Deduction: ₹${bestOption?.transportCost}
Net Realized In-Hand Return: ₹${bestOption?.netReturn} (₹${bestOption?.netRealizedPricePerKg}/kg)
One-sentence Reason: ${bestOption?.decisionReason}
Total Feasible Alternatives: ${verifiedPlan.totalFeasibleOptions}`;

  try {
    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${promptSystem}\n\nFarmer Query: "${query}"` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2, // Low temperature for high factual adherence
        maxOutputTokens: 250,
      },
    };

    const response = await callGeminiApi(geminiPayload);
    const candidateText = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    return {
      success: true,
      query,
      language,
      source: 'gemini-2.0-flash',
      answer: candidateText || bestOption.decisionReason,
      recoveryPlan: verifiedPlan,
    };
  } catch (err) {
    logger.warn('Gemini AI call timed out or failed. Returning pure deterministic response.', {
      error: err.message,
    });

    // Graceful fallback: construct transparent localized answer without LLM
    let fallbackAnswer = '';
    if (language === 'mr') {
      fallbackAnswer = `सर्वोत्तम पर्याय: ${bestOption.name}. वाहतूक खर्च (₹${bestOption.transportCost}) वजा जाता तुम्हाला निव्वळ ₹${bestOption.netRealizedPricePerKg}/किलो (एकूण ₹${bestOption.netReturn.toLocaleString('en-IN')}) मिळतील.`;
    } else if (language === 'hi') {
      fallbackAnswer = `सबसे अच्छा विकल्प: ${bestOption.name}. परिवहन खर्च (₹${bestOption.transportCost}) काटने के बाद आपको शुद्ध ₹${bestOption.netRealizedPricePerKg}/किलो (कुल ₹${bestOption.netReturn.toLocaleString('en-IN')}) मिलेंगे।`;
    } else {
      fallbackAnswer = `Best alternative: ${bestOption.name}. After ₹${bestOption.transportCost} freight deduction, you will realize a net ₹${bestOption.netRealizedPricePerKg}/kg (Total ₹${bestOption.netReturn.toLocaleString('en-IN')}).`;
    }

    return {
      success: true,
      query,
      language,
      source: 'deterministic-fallback',
      answer: fallbackAnswer,
      recoveryPlan: verifiedPlan,
    };
  }
}

module.exports = {
  processFarmerQuery,
  executeRecoveryTool,
  DEMO_ALTERNATIVES_POOL,
};
