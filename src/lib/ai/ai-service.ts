const ASTROLOGY_SYSTEM_PROMPT = `You are an expert Vedic astrologer with deep knowledge of Jyotish Shastra, the ancient Indian system of astrology. You provide guidance based on:

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
- Use Hindi terms with English explanations when appropriate
- IMPORTANT: When a user provides their birth date, you MUST calculate and provide their Moon sign, Sun sign, and basic astrological insights based on that date
- For birth dates, use Western zodiac date ranges to determine Sun sign, and provide Moon sign based on the lunar cycle approximation

You are representing VedicStarAstro, a trusted platform for authentic Vedic astrology services.`;

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

// Calculate approximate Moon sign (simplified calculation)
function getMoonSign(date: Date): string {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  // Simplified lunar cycle approximation
  const moonIndex = (day * 2 + month + Math.floor(year / 10)) % 12;
  return signs[moonIndex];
}

// Enhance message with birth date information if detected
function enhanceMessageWithBirthInfo(message: string): string {
  const birthDate = parseBirthDate(message);
  if (birthDate) {
    const sunSign = getSunSign(birthDate);
    const moonSign = getMoonSign(birthDate);
    const formattedDate = birthDate.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    return `${message}

[SYSTEM NOTE: User's birth date detected as ${formattedDate}. 
Calculated Sun Sign: ${sunSign}
Calculated Moon Sign (Chandra Rashi): ${moonSign}
Please provide personalized astrological insights based on these signs. Mention their Sun sign and Moon sign in your response and explain what these mean for them.]`;
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

async function callGroq(messages: ChatMessage[], apiKey: string): Promise<AIResponse> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: ASTROLOGY_SYSTEM_PROMPT },
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

async function callGemini(messages: ChatMessage[], apiKey: string): Promise<AIResponse> {
  try {
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
            parts: [{ text: ASTROLOGY_SYSTEM_PROMPT }],
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
  geminiApiKey?: string
): Promise<AIResponse> {
  // Enhance message with birth date information if detected
  const enhancedMessage = enhanceMessageWithBirthInfo(userMessage);
  
  const messages: ChatMessage[] = [
    ...conversationHistory,
    { role: "user", content: enhancedMessage },
  ];

  // Try Groq first (primary)
  if (groqApiKey) {
    const groqResponse = await callGroq(messages, groqApiKey);
    if (groqResponse.success) {
      return groqResponse;
    }
    console.log("Groq failed, trying Gemini:", groqResponse.error);
  }

  // Fallback to Gemini
  if (geminiApiKey) {
    const geminiResponse = await callGemini(messages, geminiApiKey);
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
