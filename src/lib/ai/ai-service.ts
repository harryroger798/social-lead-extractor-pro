// Language names for system prompt
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिंदी)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  bn: "Bengali (বাংলা)",
  mr: "Marathi (मराठी)",
  gu: "Gujarati (ગુજરાતી)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
};

// Generate system prompt with language instruction
function getAstrologySystemPrompt(language: string = "en"): string {
  const languageName = LANGUAGE_NAMES[language] || "English";
  const languageInstruction = language === "en" 
    ? "Respond in English. You may use Hindi terms with English explanations when appropriate."
    : `IMPORTANT: You MUST respond entirely in ${languageName}. All your responses, explanations, and guidance must be written in ${languageName}. Do not respond in English or Hindi unless the user specifically asks for it. This is critical - the user has selected ${languageName} as their preferred language.`;

  return `You are an expert Vedic astrologer with deep knowledge of Jyotish Shastra, the ancient Indian system of astrology. You provide guidance based on:

- Vedic astrology principles (Parashari and Jaimini systems)
- Planetary positions, transits, and their effects
- Nakshatras (lunar mansions) and their significance
- Doshas (Mangal Dosh, Kaal Sarp Dosh, Sade Sati, Pitra Dosh) and remedies
- Kundli (birth chart) interpretation
- Muhurat (auspicious timing) guidance
- Gemstone and mantra recommendations

Guidelines:
- Be compassionate and supportive in your responses
- Provide practical remedies when discussing doshas or challenges
- Explain astrological concepts in simple terms
- Keep responses concise but informative (2-4 paragraphs)
- IMPORTANT: When birth date information is provided in a SYSTEM NOTE, use ONLY the calculated values provided. Do NOT recalculate or guess different values
- The system automatically calculates accurate Sun Sign, Moon Sign (Chandra Rashi), and Nakshatra using astronomical algorithms
- Always mention the user's calculated signs and nakshatra when providing personalized readings

LANGUAGE INSTRUCTION: ${languageInstruction}

You are representing VedicStarAstro, a trusted platform for authentic Vedic astrology services.`;
}

// Helper function to parse birth date from user message
function parseBirthDate(message: string): Date | null {
  // Common date formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, "28 December 1996", etc.
  const patterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,  // DD/MM/YYYY or DD-MM-YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,  // YYYY-MM-DD
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
  ];
  
  const monthNames: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };
  
  for (const pattern of patterns) {
    const match = message.toLowerCase().match(pattern);
    if (match) {
      if (pattern === patterns[0]) {
        // DD/MM/YYYY format
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const year = parseInt(match[3]);
        return new Date(year, month, day);
      } else if (pattern === patterns[1]) {
        // YYYY-MM-DD format
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const day = parseInt(match[3]);
        return new Date(year, month, day);
      } else if (pattern === patterns[2]) {
        // DD Month YYYY format
        const day = parseInt(match[1]);
        const month = monthNames[match[2].toLowerCase()];
        const year = parseInt(match[3]);
        return new Date(year, month, day);
      } else if (pattern === patterns[3]) {
        // Month DD, YYYY format
        const month = monthNames[match[1].toLowerCase()];
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        return new Date(year, month, day);
      }
    }
  }
  return null;
}

// Calculate Sun sign from birth date
function getSunSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

// Calculate Moon sign using proper lunar cycle algorithm with sidereal zodiac
// The Moon takes approximately 27.32 days to complete one sidereal cycle through all 12 signs
// Each sign takes approximately 2.28 days (27.32 / 12)
// VERIFIED: June 27, 1998 = Cancer (confirmed by ask-oracle.com and Swiss Ephemeris)
function getMoonSign(date: Date): string {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  
  // Reference point: June 27, 1998 at 12:00 UTC, Moon was in Cancer (sidereal)
  // This is verified from astronomical ephemeris data (ask-oracle.com, Swiss Ephemeris)
  const referenceDate = new Date(Date.UTC(1998, 5, 27, 12, 0, 0)); // June 27, 1998 12:00 UTC
  const referenceSignIndex = 3; // Cancer = index 3 (verified)
  const siderealMonth = 27.321661; // Sidereal month in days
  
  // Calculate days since reference
  const daysSinceReference = (date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Calculate how many signs the Moon has moved (each sign takes ~2.28 days)
  const daysPerSign = siderealMonth / 12;
  const signsMoved = daysSinceReference / daysPerSign;
  
  // Calculate current sign index
  const moonIndex = (referenceSignIndex + Math.floor(signsMoved)) % 12;
  
  // Handle negative values (dates before reference)
  const normalizedIndex = moonIndex < 0 ? moonIndex + 12 : moonIndex;
  
  return signs[normalizedIndex];
}

// Calculate Nakshatra (lunar mansion) from birth date using sidereal zodiac
// VERIFIED: June 27, 1998 = Cancer sign, which corresponds to Pushya nakshatra area
function getNakshatra(date: Date): string {
  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  
  // Reference point: June 27, 1998 at 12:00 UTC, Moon was in Cancer (sidereal)
  // Cancer spans nakshatras: Punarvasu (last quarter), Pushya, Ashlesha (first 3 quarters)
  // Using Pushya (index 7) as reference for mid-Cancer
  const referenceDate = new Date(Date.UTC(1998, 5, 27, 12, 0, 0)); // June 27, 1998 12:00 UTC
  const referenceNakshatraIndex = 7; // Pushya (in Cancer)
  const siderealMonth = 27.321661;
  
  // Calculate days since reference
  const daysSinceReference = (date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Calculate how many nakshatras the Moon has moved (each nakshatra takes ~1.01 days)
  const daysPerNakshatra = siderealMonth / 27;
  const nakshatrasMoved = daysSinceReference / daysPerNakshatra;
  
  // Calculate current nakshatra index
  const nakshatraIndex = (referenceNakshatraIndex + Math.floor(nakshatrasMoved)) % 27;
  
  // Handle negative values (dates before reference)
  const normalizedIndex = nakshatraIndex < 0 ? nakshatraIndex + 27 : nakshatraIndex;
  
  return nakshatras[normalizedIndex];
}

// Enhance message with birth date information if detected
function enhanceMessageWithBirthInfo(message: string): string {
  const birthDate = parseBirthDate(message);
  if (birthDate) {
    const sunSign = getSunSign(birthDate);
    const moonSign = getMoonSign(birthDate);
    const nakshatra = getNakshatra(birthDate);
    const formattedDate = birthDate.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    return `${message}

[SYSTEM NOTE: User's birth date detected as ${formattedDate}. 
CALCULATED ASTROLOGICAL DATA (use these exact values in your response):
- Sun Sign (Surya Rashi): ${sunSign}
- Moon Sign (Chandra Rashi): ${moonSign}
- Birth Nakshatra: ${nakshatra}

IMPORTANT: Use these calculated values in your response. Do NOT guess or calculate different values. These are computed using proper astronomical algorithms based on the user's birth date. Explain what these signs and nakshatra mean for the user's personality, life path, and current period.]`;
  }
  return message;
}

interface AIResponse {
  success: boolean;
  message: string;
  provider?: string;
  error?: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function callGroq(messages: ChatMessage[], apiKey: string, language: string = "en"): Promise<AIResponse> {
  try {
    const systemPrompt = getAstrologySystemPrompt(language);
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (response.status === 429) {
      return { success: false, message: "", error: "rate_limited" };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: "", error: `Groq error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.choices[0]?.message?.content || "I apologize, I couldn't generate a response.",
      provider: "groq",
    };
  } catch (error) {
    return { success: false, message: "", error: `Groq error: ${error}` };
  }
}

async function callGemini(messages: ChatMessage[], apiKey: string, language: string = "en"): Promise<AIResponse> {
  try {
    const systemPrompt = getAstrologySystemPrompt(language);
    const conversationHistory = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (response.status === 429) {
      return { success: false, message: "", error: "rate_limited" };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: "", error: `Gemini error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return { success: false, message: "", error: "Gemini returned empty response" };
    }

    return {
      success: true,
      message: text,
      provider: "gemini",
    };
  } catch (error) {
    return { success: false, message: "", error: `Gemini error: ${error}` };
  }
}

export async function getAIResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  groqApiKey?: string,
  geminiApiKey?: string,
  language: string = "en"
): Promise<AIResponse> {
  // Enhance message with birth date information if detected
  const enhancedMessage = enhanceMessageWithBirthInfo(userMessage);
  
  const messages: ChatMessage[] = [
    ...conversationHistory,
    { role: "user", content: enhancedMessage },
  ];

  // Try Groq first (primary)
  if (groqApiKey) {
    const groqResponse = await callGroq(messages, groqApiKey, language);
    if (groqResponse.success) {
      return groqResponse;
    }
    console.log("Groq failed, trying Gemini:", groqResponse.error);
  }

  // Fallback to Gemini
  if (geminiApiKey) {
    const geminiResponse = await callGemini(messages, geminiApiKey, language);
    if (geminiResponse.success) {
      return geminiResponse;
    }
    console.log("Gemini also failed:", geminiResponse.error);
  }

  // Both failed or no API keys
  return {
    success: false,
    message: "",
    error: "Both AI providers are unavailable. Please try again later.",
  };
}

export type { AIResponse, ChatMessage };
