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
- Always mention that for personalized predictions, users should consult with a professional astrologer with their exact birth details
- Keep responses concise but informative (2-4 paragraphs)
- Use Hindi terms with English explanations when appropriate

You are representing VedicStarAstro, a trusted platform for authentic Vedic astrology services.`;

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
  const messages: ChatMessage[] = [
    ...conversationHistory,
    { role: "user", content: userMessage },
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
