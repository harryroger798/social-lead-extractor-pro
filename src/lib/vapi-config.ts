// VAPI AI Configuration for Voice Astrologer
// Documentation: https://docs.vapi.ai

export const VAPI_CONFIG = {
  // Public key for client-side VAPI SDK
  // This is safe to expose in the browser
  publicKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "",
  
  // Assistant configuration for Vedic Astrology
  assistantConfig: {
    name: "VedicStar AI Astrologer",
    model: {
      provider: "openai",
      model: "gpt-4-turbo",
      temperature: 0.7,
      systemPrompt: `You are an expert Vedic astrologer with deep knowledge of Jyotish Shastra. 
You provide guidance based on ancient Vedic wisdom combined with modern understanding.
You can discuss:
- Birth charts (Kundli) and planetary positions
- Doshas and their remedies (Mangal Dosha, Kaal Sarp Dosha, etc.)
- Dasha periods and their effects
- Marriage compatibility and timing
- Career and financial astrology
- Planetary transits and their impacts
- Gemstone recommendations
- Mantras and spiritual remedies

Always be respectful, compassionate, and provide practical guidance.
When asked about specific predictions, remind users that astrology provides guidance, not certainties.
Encourage users to use the free tools on VedicStarAstro for detailed chart analysis.`,
    },
    voice: {
      provider: "11labs",
      voiceId: "pNInz6obpgDQGcFmaJgB", // Adam - calm, professional voice
    },
    firstMessage: "Namaste! I am your AI Astrologer from VedicStarAstro. How may I guide you today with the wisdom of Vedic astrology?",
    firstMessageHindi: "नमस्ते! मैं वेदिकस्टार एस्ट्रो से आपका AI ज्योतिषी हूं। वैदिक ज्योतिष के ज्ञान से आज मैं आपकी कैसे मदद कर सकता हूं?",
  },
  
  // Supported languages for voice
  supportedLanguages: [
    { code: "en-US", name: "English", nativeName: "English" },
    { code: "hi-IN", name: "Hindi", nativeName: "हिंदी" },
    { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
    { code: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
    { code: "bn-IN", name: "Bengali", nativeName: "বাংলা" },
  ],
  
  // Daily limits for free users
  freeTierLimits: {
    minutesPerDay: 5,
    maxCallDuration: 300, // 5 minutes in seconds
  },
};

// Helper to check if VAPI is configured
export const isVapiConfigured = (): boolean => {
  return !!VAPI_CONFIG.publicKey && VAPI_CONFIG.publicKey !== "";
};

// Get language-specific first message
export const getFirstMessage = (languageCode: string): string => {
  if (languageCode.startsWith("hi")) {
    return VAPI_CONFIG.assistantConfig.firstMessageHindi;
  }
  return VAPI_CONFIG.assistantConfig.firstMessage;
};
