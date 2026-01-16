import { NextRequest, NextResponse } from "next/server";
import { getAIResponse, ChatMessage } from "@/lib/ai/ai-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Get API keys from environment variables
    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!groqApiKey && !geminiApiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: "AI service is not configured. Please contact support." 
        },
        { status: 503 }
      );
    }

    // Parse conversation history
    const history: ChatMessage[] = Array.isArray(conversationHistory)
      ? conversationHistory.map((msg: { role: string; content: string }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
      : [];

    const response = await getAIResponse(
      message,
      history,
      groqApiKey,
      geminiApiKey
    );

    if (response.success) {
      return NextResponse.json({
        success: true,
        message: response.message,
        provider: response.provider,
      });
    } else {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
