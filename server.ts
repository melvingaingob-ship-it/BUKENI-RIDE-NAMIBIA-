import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { COUNTRIES } from "./src/config.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.warn("Gemini client initialization failed:", err);
    }
  }
  return aiClient;
}

// Country Configuration Endpoint
app.get("/api/config", (req, res) => {
  res.json({
    status: "ok",
    countries: COUNTRIES,
    service: "BUKENIRIDE Multi-Country Testing Engine",
  });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "BukeniRide Multi-Country Core API (Namibia & Zambia)",
    time: new Date().toISOString(),
    supportedCountries: Object.keys(COUNTRIES),
  });
});

// Helper to determine country from request or phone prefix
function resolveCountry(countryParam?: string, phone?: string): 'NAMIBIA' | 'ZAMBIA' {
  if (countryParam && (countryParam.toUpperCase() === 'NAMIBIA' || countryParam.toUpperCase() === 'NA')) {
    return 'NAMIBIA';
  }
  if (countryParam && (countryParam.toUpperCase() === 'ZAMBIA' || countryParam.toUpperCase() === 'ZM')) {
    return 'ZAMBIA';
  }
  if (phone) {
    const clean = phone.trim();
    if (clean.startsWith('+264') || clean.startsWith('264')) return 'NAMIBIA';
    if (clean.startsWith('+260') || clean.startsWith('260')) return 'ZAMBIA';
  }
  return 'NAMIBIA';
}

// SMS Booking NLP Interpreter (Supports Multi-country: Namibia & Zambia)
app.post("/api/sms-interpret", async (req, res) => {
  const { smsText, senderPhone, country: requestedCountry, language } = req.body;
  if (!smsText) {
    return res.status(400).json({ error: "SMS message body is required" });
  }

  const countryKey = resolveCountry(requestedCountry, senderPhone);
  const countryConf = COUNTRIES[countryKey];
  const cleanPhone = senderPhone || (countryKey === 'NAMIBIA' ? "+264812345678" : "+260977123456");

  // Determine landmarks based on country
  const landmarkList = countryKey === 'NAMIBIA'
    ? "Maerua Mall, The Grove Mall of Namibia, Hosea Kutako Int. Airport (WDH), Independence Avenue CBD, Wernhil Park, University of Namibia (UNAM), Katutura Soweto Market, Klein Windhoek, Eros Airport, Walvis Bay, Swakopmund"
    : "East Park Mall, Arcades Shopping Mall, Kenneth Kaunda Int. Airport (KKIA), Cairo Road, Manda Hill, Woodlands Stadium, Levy Junction, University of Zambia (UNZA), Kabulonga, Chilenje Market";

  // Attempt to parse with Gemini if key is provided
  const ai = getGeminiClient();
  let parsedResult = null;

  if (ai) {
    try {
      const prompt = `You are the Africa's Talking SMS Ride Booking Engine for BukeniRide in ${countryConf.name} (Operating in ${countryConf.capital}).
The message was received on shortcode: ${countryConf.shortcode}.
Supported local languages for ${countryConf.name}: ${countryConf.languages.join(", ")} (English, ${countryKey === 'NAMIBIA' ? 'Afrikaans' : 'Bemba, Nyanja'}).

Extract the pickup location, destination, and ride type from this user SMS message:
"${smsText}"

Known hubs/landmarks in ${countryConf.name}:
${landmarkList}

Respond ONLY with valid JSON with keys:
{
  "pickup": "name of pickup point",
  "destination": "name of dropoff point",
  "rideTier": "Bukeni Go" | "Bukeni Comfort" | "Bukeni Boda" | "Bukeni Van",
  "detectedLanguage": "${countryConf.languages.join('" | "')}",
  "confidence": 0.0 to 1.0,
  "summaryReason": "one sentence explaining parsing"
}`;

      const geminiRes = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (geminiRes.text) {
        parsedResult = JSON.parse(geminiRes.text.trim());
      }
    } catch (error) {
      console.warn("Gemini parsing error, utilizing smart multi-country regex engine:", error);
    }
  }

  // Robust fallback multi-country NLP parser
  if (!parsedResult || !parsedResult.pickup || !parsedResult.destination) {
    const textLower = smsText.toLowerCase();
    let pickup = countryKey === 'NAMIBIA' ? "Maerua Mall, Windhoek" : "Lusaka CBD (Cairo Rd)";
    let destination = countryKey === 'NAMIBIA' ? "The Grove Mall of Namibia" : "East Park Mall";
    let rideTier = "Bukeni Go";

    if (textLower.includes("boda") || textLower.includes("bike") || textLower.includes("motorfiets")) {
      rideTier = "Bukeni Boda";
    } else if (textLower.includes("comfort") || textLower.includes("vip") || textLower.includes("executive")) {
      rideTier = "Bukeni Comfort";
    } else if (textLower.includes("van") || textLower.includes("cargo") || textLower.includes("bakkie") || textLower.includes("kombi")) {
      rideTier = "Bukeni Van";
    }

    // Check Afrikaans patterns: "van X na Y"
    if (textLower.includes(" na ") && textLower.includes("van ")) {
      const afMatch = textLower.match(/van\s+(.+?)\s+na\s+(.+)/i);
      if (afMatch) {
        pickup = afMatch[1].replace(/^(rit|boek|kar|taxi)\s*/i, "").trim();
        destination = afMatch[2].replace(/\s*(asseblief|nou|comfort|go|van)$/i, "").trim();
      }
    } else {
      // Check common English patterns: "from X to Y" or "X to Y"
      const toMatch = textLower.match(/(?:from\s+)?(.+?)\s+(?:to|2)\s+(.+)/i);
      if (toMatch) {
        pickup = toMatch[1].replace(/^(ride|book|bukeni|cab|taxi|ndifuna|ndefwaya)\s*/i, "").trim();
        destination = toMatch[2].replace(/\s*(comfort|boda|go|van|please|now)$/i, "").trim();
      }
    }

    if (textLower.includes("airport") || textLower.includes("wdh") || textLower.includes("hosea")) {
      if (countryKey === 'NAMIBIA') {
        destination = "Hosea Kutako Int. Airport (WDH)";
        pickup = "Independence Avenue CBD";
      } else {
        destination = "Kenneth Kaunda Int. Airport (KKIA)";
        pickup = "East Park Mall";
      }
    }

    parsedResult = {
      pickup: pickup.charAt(0).toUpperCase() + pickup.slice(1),
      destination: destination.charAt(0).toUpperCase() + destination.slice(1),
      rideTier,
      detectedLanguage: (language || countryConf.languages[0]),
      confidence: 0.89,
      summaryReason: `Extracted via BukeniRide ${countryConf.name} Location Engine`,
    };
  }

  // Calculate simulated distance & fare in local currency
  const baseDistanceKm = Math.floor(Math.random() * 12) + 4; // 4 to 15 km
  const rates: Record<string, { base: number; perKm: number; min: number }> = countryKey === 'NAMIBIA'
    ? {
        "Bukeni Boda": { base: 20, perKm: 5.5, min: 25 },
        "Bukeni Go": { base: 35, perKm: 9.5, min: 50 },
        "Bukeni Comfort": { base: 65, perKm: 13.5, min: 90 },
        "Bukeni Van": { base: 95, perKm: 17.0, min: 130 },
      }
    : {
        "Bukeni Boda": { base: 15, perKm: 4.5, min: 20 },
        "Bukeni Go": { base: 30, perKm: 8.5, min: 45 },
        "Bukeni Comfort": { base: 55, perKm: 12.0, min: 75 },
        "Bukeni Van": { base: 80, perKm: 15.0, min: 110 },
      };

  const tierRate = rates[parsedResult.rideTier] || rates["Bukeni Go"];
  const rawFare = tierRate.base + baseDistanceKm * tierRate.perKm;
  const fareLocal = Math.round(Math.max(tierRate.min, rawFare));
  const vatRate = countryKey === 'NAMIBIA' ? 0.15 : 0.16; // 15% NAMRA or 16% ZRA
  const vatAmount = +(fareLocal * vatRate).toFixed(2);
  const vatLabel = countryKey === 'NAMIBIA' ? "15% NAMRA VAT" : "16% ZRA VAT";

  const bookingRef = `BK-${countryConf.code}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Formulate automated SMS reply respecting language & country config
  let replySms = "";
  if (parsedResult.detectedLanguage === 'af') {
    replySms = `[${countryConf.sender_id}] Rit Bevestig! Verw: ${bookingRef}. Optel: ${parsedResult.pickup}. Bestemming: ${parsedResult.destination}. Klas: ${parsedResult.rideTier}. Geskatte Tarief: ${countryConf.currency} ${fareLocal} (insluitend ${vatLabel}). Bestuurder soek nou. Volg lewendig: bukeni.${countryConf.google_maps_region}/t/${bookingRef}`;
  } else if (parsedResult.detectedLanguage === 'bem') {
    replySms = `[${countryConf.sender_id}] Motoka Yasuminishiwa! Ref: ${bookingRef}. Ukusenda: ${parsedResult.pickup}. Ukuya: ${parsedResult.destination}. Umutengo: ${countryConf.currency} ${fareLocal} (pamo na ${vatLabel}). Dereba aleisa. Linki: bukeni.${countryConf.google_maps_region}/t/${bookingRef}`;
  } else if (parsedResult.detectedLanguage === 'nya') {
    replySms = `[${countryConf.sender_id}] Galimoto Yapezeka! Ref: ${bookingRef}. Kuchoka: ${parsedResult.pickup}. Kupita: ${parsedResult.destination}. Mtengo: ${countryConf.currency} ${fareLocal} (kuphatikiza ${vatLabel}). Dilaivala akubwera. Link: bukeni.${countryConf.google_maps_region}/t/${bookingRef}`;
  } else {
    replySms = `[${countryConf.sender_id}] Booking Confirmed! Ref: ${bookingRef}. Pickup: ${parsedResult.pickup}. Destination: ${parsedResult.destination}. Tier: ${parsedResult.rideTier}. Est. Fare: ${countryConf.currency} ${fareLocal} (incl. ${vatLabel}). Shortcode: ${countryConf.shortcode}. Live link: bukeni.${countryConf.google_maps_region}/t/${bookingRef}`;
  }

  res.json({
    success: true,
    country: countryKey,
    countryCode: countryConf.code,
    currency: countryConf.currency,
    shortcode: countryConf.shortcode,
    senderId: countryConf.sender_id,
    smsProvider: countryConf.sms_provider,
    smsCost: countryConf.sms_cost,
    bookingRef,
    senderPhone: cleanPhone,
    parsed: parsedResult,
    distanceKm: baseDistanceKm,
    fareLocal,
    fareZMW: fareLocal, // mapped for backward compatibility
    vatAmount,
    vatLabel,
    replySms,
  });
});

// Africa's Talking SMS Dispatch Testing Simulation Endpoint
app.post("/api/sms-dispatch-test", (req, res) => {
  const { recipientPhone, messageText, country: requestedCountry, network } = req.body;
  const countryKey = resolveCountry(requestedCountry, recipientPhone);

  // Namibia SMS testing explicitly removed as requested
  if (countryKey === 'NAMIBIA') {
    return res.status(200).json({
      success: false,
      removed: true,
      country: 'NAMIBIA',
      message: "Namibia testing for SMS has been removed. Africa's Talking SMS automated dispatch is exclusively configured for Zambia (+260) with shortcode 23445.",
      suggestedCountry: 'ZAMBIA',
    });
  }

  const countryConf = COUNTRIES[countryKey];

  const matchedNetwork = network || countryConf.networks[0];
  const messageId = `AT-MSG-${countryConf.code}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Simulated Africa's Talking API response
  res.json({
    success: true,
    provider: "africastalking",
    country: countryKey,
    countryCode: countryConf.code,
    shortcode: countryConf.shortcode,
    senderId: countryConf.sender_id,
    network: matchedNetwork,
    recipient: recipientPhone,
    messageId,
    cost: `${countryConf.currency} ${countryConf.sms_cost}`,
    status: "Success",
    statusCode: 101, // Africa's Talking standard success code
    timestamp: new Date().toISOString(),
    rawGatewayResponse: {
      SMSMessageData: {
        Message: `Sent to 1/1 Total Cost: ${countryConf.currency} ${countryConf.sms_cost}`,
        Recipients: [
          {
            number: recipientPhone,
            cost: `${countryConf.currency} ${countryConf.sms_cost}`,
            status: "Success",
            statusCode: 101,
            messageId,
          },
        ],
      },
    },
  });
});

// Review Sentiment & Safety Analysis with Gemini
app.post("/api/review-analysis", async (req, res) => {
  const { reviewText, stars, driverName, rideRef, country } = req.body;
  const ai = getGeminiClient();

  if (ai && reviewText) {
    try {
      const prompt = `You are a Safety & Compliance AI Officer for BukeniRide in ${country || 'Southern Africa'}.
Analyze this ride review:
"${reviewText}"
Rating: ${stars}/5 stars.

Evaluate:
1. Sentiment (Positive, Neutral, Warning, Critical)
2. Safety concerns (Speeding, Harassment, Vehicle Condition, Route Deviation, None)
3. Actionable recommendation for admin team.

Respond with pure JSON:
{
  "sentiment": "Positive" | "Neutral" | "Warning" | "Critical",
  "safetyFlag": boolean,
  "safetyTags": ["tag1", "tag2"],
  "adminRecommendation": "actionable advice",
  "riskScore": 1 to 10
}`;

      const geminiRes = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      if (geminiRes.text) {
        return res.json({ success: true, analysis: JSON.parse(geminiRes.text.trim()) });
      }
    } catch (err) {
      console.warn("Gemini review analysis failed, using fallback:", err);
    }
  }

  // Fallback heuristic analysis
  const lower = (reviewText || "").toLowerCase();
  const hasSafetyIssue =
    stars <= 2 ||
    lower.includes("fast") ||
    lower.includes("speed") ||
    lower.includes("reckless") ||
    lower.includes("rude") ||
    lower.includes("brake") ||
    lower.includes("smell") ||
    lower.includes("overcharged");

  res.json({
    success: true,
    analysis: {
      sentiment: stars >= 4 ? "Positive" : stars === 3 ? "Neutral" : "Warning",
      safetyFlag: hasSafetyIssue,
      safetyTags: hasSafetyIssue ? ["Requires Safety Audit", "Driver Follow-up"] : ["Satisfied Passenger"],
      adminRecommendation: hasSafetyIssue
        ? "Flag driver profile for telematics check & review ride GPS logs."
        : "Standard feedback recorded into driver loyalty score.",
      riskScore: hasSafetyIssue ? 7 : 2,
    },
  });
});

// 3PL Logistics Modular API Sandbox
app.post("/api/v1/logistics/dispatch", (req, res) => {
  const { apiKey, packageDetails, pickupAddress, deliveryAddress, serviceType, country } = req.body;
  if (!apiKey) {
    return res.status(401).json({ error: "Missing x-api-key header or body parameter" });
  }

  const countryKey = resolveCountry(country);
  const countryConf = COUNTRIES[countryKey];
  const waybill = `BK-LOG-${countryConf.code}-` + Math.floor(1000000 + Math.random() * 9000000);
  const estimatedCost = serviceType === "Express Van" ? 180 : 85;
  const vatRate = countryKey === 'NAMIBIA' ? 0.15 : 0.16;
  const vat = +(estimatedCost * vatRate).toFixed(2);

  res.json({
    status: "DISPATCH_ACCEPTED",
    waybillNumber: waybill,
    assignedCourier: {
      name: countryKey === 'NAMIBIA' ? "Kavango Ndalila" : "Chanda Mwewa",
      phone: countryKey === 'NAMIBIA' ? "+264 81 452 9901" : "+260 97 452 1198",
      vehiclePlate: countryKey === 'NAMIBIA' ? "N 92-314 W" : "ALB 8920 ZM",
      vehicleType: serviceType || "Bukeni Cargo Van",
      rating: 4.94,
    },
    etaMinutes: 14,
    billing: {
      currency: countryConf.currency,
      subtotal: estimatedCost,
      vatPercent: Math.round(vatRate * 100),
      vatAmount: vat,
      total: estimatedCost + vat,
    },
    trackingWebhook: `https://api.bukeniride.${countryConf.google_maps_region}/webhooks/status/${waybill}`,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BukeniRide Multi-Country server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
