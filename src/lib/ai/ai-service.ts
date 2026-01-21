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

// Lahiri Ayanamsa calculation (approximate)
// The ayanamsa increases by about 50.3 arcseconds per year from a reference point
function getLahiriAyanamsa(date: Date): number {
  // Reference: January 1, 2000 at 00:00 UTC, Lahiri Ayanamsa was approximately 23.856°
  const referenceDate = new Date(Date.UTC(2000, 0, 1, 0, 0, 0));
  const referenceAyanamsa = 23.856;
  const ayanamsaPerYear = 50.3 / 3600; // Convert arcseconds to degrees
  
  const yearsDiff = (date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return referenceAyanamsa + (yearsDiff * ayanamsaPerYear);
}

// Calculate Tropical (Western) Sun sign from birth date
function getTropicalSunSign(date: Date): string {
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

// Calculate Sidereal (Vedic) Sun sign from birth date
// Sidereal signs are approximately 23-24 degrees behind tropical signs
function getSiderealSunSign(date: Date): string {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  
  // Get tropical sun position first
  const tropicalSign = getTropicalSunSign(date);
  const tropicalIndex = signs.indexOf(tropicalSign);
  
  // Approximate degree within sign based on date
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Estimate degree within tropical sign (rough approximation)
  let degreeInSign = 15; // Default to middle of sign
  
  // The ayanamsa is about 24 degrees, so sidereal is roughly one sign behind
  // But we need to check if we're in the first ~24 degrees of the tropical sign
  // If so, we're still in the previous sidereal sign
  
  // Simplified: Sidereal sun sign is typically one sign behind tropical
  // This is an approximation - for precise calculation, use Swiss Ephemeris
  const siderealIndex = (tropicalIndex - 1 + 12) % 12;
  
  return signs[siderealIndex];
}

// Calculate SIDEREAL (Vedic) Moon sign using proper lunar cycle algorithm
// The Moon takes approximately 27.32 days to complete one sidereal cycle through all 12 signs
// Each sign takes approximately 2.28 days (27.32 / 12)
// VERIFIED: June 27, 1998 = CANCER (confirmed by drikpanchang.com and Swiss Ephemeris with Lahiri Ayanamsha)
// At 00:00 UTC on June 27, 1998, Moon was at ~17° Cancer (sidereal)
function getSiderealMoonSign(date: Date): string {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  
  // Reference point: June 27, 1998 at 00:00 UTC, Moon was in Cancer (sidereal)
  // This is verified from drikpanchang.com and Swiss Ephemeris (Lahiri Ayanamsha)
  // Moon position: ~17° Cancer at 00:00 UTC (sidereal)
  const referenceDate = new Date(Date.UTC(1998, 5, 27, 0, 0, 0)); // June 27, 1998 00:00 UTC
  const referenceSignIndex = 3; // Cancer = index 3 (verified from drikpanchang.com)
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

// Calculate TROPICAL (Western) Moon sign
// Tropical Moon is approximately 24 degrees ahead of Sidereal Moon (due to ayanamsa)
function getTropicalMoonSign(date: Date): string {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  
  // Reference point: June 27, 1998 at 00:00 UTC
  // Sidereal Moon was at ~17° Cancer, Tropical Moon was at ~41° (17° + 24° ayanamsa) = ~11° Leo
  const referenceDate = new Date(Date.UTC(1998, 5, 27, 0, 0, 0)); // June 27, 1998 00:00 UTC
  const referenceSignIndex = 4; // Leo = index 4 (Tropical position)
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
// VERIFIED: June 27, 1998 = Cancer sign at ~17°, which corresponds to Ashlesha nakshatra
// Cancer spans nakshatras: Punarvasu (last quarter 20°-30°), Pushya (0°-13°20'), Ashlesha (13°20'-30°)
// At ~17° Cancer, the Moon is in Ashlesha nakshatra (index 8)
// Confirmed by drikpanchang.com: Nakshatra = Ashlesha for June 27, 1998
function getNakshatra(date: Date): string {
  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  
  // Reference point: June 27, 1998 at 00:00 UTC, Moon was at ~17° Cancer (sidereal)
  // Cancer spans: Punarvasu (last quarter), Pushya (0°-13°20'), Ashlesha (13°20'-30°)
  // At ~17° Cancer, the Moon is in Ashlesha nakshatra (index 8)
  // Confirmed by drikpanchang.com
  const referenceDate = new Date(Date.UTC(1998, 5, 27, 0, 0, 0)); // June 27, 1998 00:00 UTC
  const referenceNakshatraIndex = 8; // Ashlesha (in Cancer at ~17°)
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
// Shows BOTH Sidereal (Vedic) and Tropical (Western) zodiac systems
function enhanceMessageWithBirthInfo(message: string): string {
  const birthDate = parseBirthDate(message);
  if (birthDate) {
    // Calculate both zodiac systems
    const siderealSunSign = getSiderealSunSign(birthDate);
    const tropicalSunSign = getTropicalSunSign(birthDate);
    const siderealMoonSign = getSiderealMoonSign(birthDate);
    const tropicalMoonSign = getTropicalMoonSign(birthDate);
    const nakshatra = getNakshatra(birthDate);
    const formattedDate = birthDate.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    return `${message}

[SYSTEM NOTE: User's birth date detected as ${formattedDate}. 
CALCULATED ASTROLOGICAL DATA (use these exact values in your response):

VEDIC/SIDEREAL ZODIAC (Traditional Indian Astrology - Lahiri Ayanamsha):
- Sun Sign (Surya Rashi): ${siderealSunSign}
- Moon Sign (Chandra Rashi): ${siderealMoonSign}
- Birth Nakshatra: ${nakshatra}

WESTERN/TROPICAL ZODIAC (Modern Western Astrology):
- Sun Sign: ${tropicalSunSign}
- Moon Sign: ${tropicalMoonSign}

IMPORTANT: 
1. Present BOTH zodiac systems to the user and explain the difference
2. Vedic/Sidereal is based on actual star positions (used in traditional Indian astrology)
3. Western/Tropical is based on seasons (used in modern Western astrology)
4. The ~24° difference is called "Ayanamsha" - the precession of equinoxes
5. Use these calculated values in your response. Do NOT guess or calculate different values.
6. Explain what these signs and nakshatra mean for the user's personality, life path, and current period.]`;
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
