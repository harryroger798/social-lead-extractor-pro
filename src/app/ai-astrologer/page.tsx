"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Star,
  Moon,
  Sun,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Suggested questions will be generated inside the component using t() function

const astrologyResponses: Record<string, string> = {
  moon: `The Moon in Vedic astrology represents your mind, emotions, and inner self. Your Moon sign (Chandra Rashi) reveals how you process feelings, your instinctive reactions, and your emotional needs.

**Key aspects of Moon sign influence:**
- **Emotional Nature**: Your Moon sign determines your emotional responses and how you nurture yourself and others
- **Mental Patterns**: It governs your thought processes and subconscious mind
- **Mother & Home**: The Moon represents your relationship with your mother and your sense of home/security
- **Intuition**: A strong Moon enhances intuitive abilities and emotional intelligence

To know your specific Moon sign influence, I'd need your birth details. Would you like to use our free Moon Sign Calculator?`,

  saturn: `Saturn (Shani) transit is one of the most significant planetary movements in Vedic astrology. In 2026, Saturn continues its journey through Aquarius (Kumbha Rashi) before moving into Pisces.

**Saturn Transit 2026 Effects:**
- **Career**: Saturn rewards hard work and discipline. Expect recognition if you've been putting in consistent effort
- **Challenges**: Some signs may face obstacles that are actually opportunities for growth
- **Karma**: Saturn is the karmic planet - past actions will show their results
- **Health**: Pay attention to bones, joints, and chronic conditions

**Remedies for Saturn:**
- Donate black sesame seeds on Saturdays
- Recite Shani Mantra: "Om Sham Shanaishcharaya Namah"
- Help the elderly and disabled
- Wear blue sapphire (only after proper consultation)

Which zodiac sign would you like specific Saturn transit predictions for?`,

  mangal: `Mangal Dosha (also called Manglik Dosha or Kuja Dosha) occurs when Mars is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house from the Ascendant, Moon, or Venus.

**Effects of Mangal Dosha:**
- Delays in marriage
- Conflicts in married life
- Potential health issues for spouse
- Financial challenges in partnership

**Powerful Remedies for Mangal Dosha:**
1. **Kumbh Vivah**: Symbolic marriage to a banana tree, peepal tree, or silver/gold idol of Lord Vishnu
2. **Mangal Shanti Puja**: Performed on Tuesdays
3. **Hanuman Worship**: Recite Hanuman Chalisa daily
4. **Fasting**: Observe fast on Tuesdays
5. **Gemstone**: Wear red coral (Moonga) after consultation
6. **Charity**: Donate red items on Tuesdays

**Important**: Mangal Dosha effects reduce after age 28. Also, if both partners have Mangal Dosha, it gets cancelled!

Would you like to check if you have Mangal Dosha? Use our free Mangal Dosh Calculator.`,

  marriage: `Astrology provides valuable insights for marriage timing and compatibility. Here's what to consider:

**Best Times for Marriage in 2026:**
- Avoid marriage during Mercury Retrograde periods (March 14-April 7, July 17-Aug 11, Nov 9-29)
- Favorable months: February, May, November (check specific Muhurat)
- Jupiter's aspect on the 7th house brings blessings

**Marriage Compatibility Factors:**
1. **Guna Milan**: 36 points system matching Nakshatras
2. **Mangal Dosha**: Check both charts
3. **7th House Analysis**: Lord, planets, and aspects
4. **Venus Position**: Planet of love and marriage
5. **Dasha Period**: Both should have favorable Dashas

**Auspicious Muhurat Considerations:**
- Avoid Bhadra, Panchak, and inauspicious Tithis
- Moon should be waxing (Shukla Paksha preferred)
- Benefic planets should aspect the Lagna

For personalized marriage timing, I recommend consulting with our expert astrologers who can analyze your complete birth chart.`,

  rahu: `Rahu in the 7th house is a significant placement that affects partnerships, marriage, and business relationships.

**Effects of Rahu in 7th House:**
- **Unconventional Marriage**: Attraction to partners from different backgrounds, cultures, or age groups
- **Intense Desires**: Strong desire for partnership and recognition through spouse
- **Business Acumen**: Can bring success in partnerships and foreign collaborations
- **Challenges**: May face deception or misunderstandings in relationships

**Positive Manifestations:**
- Marriage to someone influential or from a different culture
- Success in international business partnerships
- Strong networking abilities
- Spouse may be career-oriented or unconventional

**Remedies for Rahu in 7th House:**
1. Worship Lord Ganesha regularly
2. Donate to orphanages on Saturdays
3. Keep a silver elephant at home
4. Recite Rahu Beej Mantra: "Om Bhram Bhreem Bhroum Sah Rahave Namah"
5. Avoid wearing blue sapphire without consultation

The effects vary based on the sign Rahu occupies and aspects from other planets. Would you like a detailed analysis?`,

  finance: `Astrology offers several ways to improve financial luck and prosperity. Here are key insights:

**Planets Governing Wealth:**
- **Jupiter (Guru)**: Overall prosperity and wisdom in money matters
- **Venus (Shukra)**: Luxury, comforts, and material gains
- **Mercury (Budh)**: Business acumen and trading success
- **2nd House**: Accumulated wealth and family assets
- **11th House**: Gains, income, and fulfillment of desires

**Astrological Remedies for Financial Growth:**

1. **Lakshmi Puja**: Perform on Fridays during Shukla Paksha
2. **Jupiter Remedies**: 
   - Wear yellow sapphire (Pukhraj) if Jupiter is weak
   - Donate yellow items on Thursdays
   - Respect teachers and elders

3. **Venus Remedies**:
   - Keep your surroundings clean and beautiful
   - Donate white items on Fridays
   - Wear diamond or white sapphire if suitable

4. **Vastu Tips**:
   - Keep North direction clutter-free (Kuber's direction)
   - Place a money plant in the Southeast
   - Ensure no leaking taps (prevents wealth drainage)

5. **Mantras for Wealth**:
   - Lakshmi Gayatri Mantra
   - Kuber Mantra: "Om Shreem Hreem Kleem Shreem Kleem Vitteshvaraya Namah"

For personalized financial astrology guidance, our experts can analyze your birth chart's wealth houses and planetary periods.`,

  default: `Thank you for your question! As your AI Astrologer, I'm here to help you understand the cosmic influences in your life.

**I can help you with:**
- Birth chart (Kundli) interpretation
- Planetary transits and their effects
- Dosha analysis and remedies
- Marriage compatibility
- Career and financial guidance
- Muhurat (auspicious timing)
- Gemstone recommendations

**Popular Topics:**
- Saturn Transit 2026 effects
- Mangal Dosha remedies
- Rahu-Ketu axis interpretation
- Dasha period predictions

Please ask me anything about Vedic astrology, and I'll provide detailed guidance based on ancient wisdom combined with modern understanding.

For personalized predictions based on your exact birth chart, I recommend using our free calculators or booking a consultation with our expert astrologers.`
};

// Parse markdown-style bold text (**text**) into React elements
function parseMarkdownLine(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;

  while ((match = boldRegex.exec(line)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    // Add the bold text
    parts.push(<strong key={match.index} className="font-semibold">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last match
  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line;
}

function getAstrologyResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes("moon") || lowerQuestion.includes("chandra") || lowerQuestion.includes("emotion")) {
    return astrologyResponses.moon;
  }
  if (lowerQuestion.includes("saturn") || lowerQuestion.includes("shani") || lowerQuestion.includes("career")) {
    return astrologyResponses.saturn;
  }
  if (lowerQuestion.includes("mangal") || lowerQuestion.includes("manglik") || lowerQuestion.includes("mars") || lowerQuestion.includes("kuja")) {
    return astrologyResponses.mangal;
  }
  if (lowerQuestion.includes("marriage") || lowerQuestion.includes("wedding") || lowerQuestion.includes("spouse") || lowerQuestion.includes("partner")) {
    return astrologyResponses.marriage;
  }
  if (lowerQuestion.includes("rahu") || lowerQuestion.includes("7th house") || lowerQuestion.includes("seventh house")) {
    return astrologyResponses.rahu;
  }
  if (lowerQuestion.includes("money") || lowerQuestion.includes("finance") || lowerQuestion.includes("wealth") || lowerQuestion.includes("financial")) {
    return astrologyResponses.finance;
  }
  
  return astrologyResponses.default;
}

export default function AIAstrologerPage() {
  const { t } = useLanguage();
  
  // Suggested questions using t() function
  const suggestedQuestions = [
    t('aiAstrologer.questions.moonSign', 'What does my Moon sign say about my emotions?'),
    t('aiAstrologer.questions.saturnTransit', 'How will Saturn transit affect my career in 2026?'),
    t('aiAstrologer.questions.mangalRemedies', 'What are the remedies for Mangal Dosha?'),
    t('aiAstrologer.questions.marriageTime', 'Is this a good time for marriage according to astrology?'),
    t('aiAstrologer.questions.rahu7thHouse', 'What does Rahu in the 7th house mean?'),
    t('aiAstrologer.questions.financialLuck', 'How can I improve my financial luck through astrology?'),
  ];
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Namaste! I am your AI Astrologer, here to guide you through the cosmic wisdom of Vedic astrology.

I can help you understand planetary influences, doshas, transits, and provide remedies based on ancient Jyotish Shastra principles.

**Ask me about:**
- Your Moon sign and emotional nature
- Saturn transit effects for 2026
- Mangal Dosha and marriage compatibility
- Career and financial astrology
- Remedies for planetary afflictions

How may I assist you on your spiritual journey today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Auto-scroll disabled - users can scroll manually

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      // Prepare conversation history for API (exclude welcome message)
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory,
        }),
      });

      const data = await response.json();

      let responseContent: string;
      if (data.success && data.message) {
        responseContent = data.message;
      } else {
        // Fallback to keyword-based response if API fails
        responseContent = getAstrologyResponse(currentInput);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback to keyword-based response on network error
      console.error("AI API error:", error);
      const fallbackResponse = getAstrologyResponse(currentInput);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="py-8 lg:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-purple-100 text-purple-800">{t('aiAstrologer.badge', 'AI-Powered')}</Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('aiAstrologer.title', 'AI Astrologer')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('aiAstrologer.subtitle', 'Get instant astrological guidance powered by ancient Vedic wisdom. Ask questions about your horoscope, planetary transits, doshas, and remedies.')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center border-purple-200 bg-purple-50/50">
            <CardContent className="pt-4 pb-4">
              <MessageCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">10M+</div>
              <div className="text-xs text-gray-600">{t('aiAstrologer.stats.questionsAnswered', 'Questions Answered')}</div>
            </CardContent>
          </Card>
          <Card className="text-center border-amber-200 bg-amber-50/50">
            <CardContent className="pt-4 pb-4">
              <Star className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700">4.8/5</div>
              <div className="text-xs text-gray-600">{t('aiAstrologer.stats.userRating', 'User Rating')}</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200 bg-green-50/50">
            <CardContent className="pt-4 pb-4">
              <Sparkles className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">24/7</div>
              <div className="text-xs text-gray-600">{t('aiAstrologer.stats.available', 'Available')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Container */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                                <CardTitle className="text-white">{t('aiAstrologer.chat.title', 'VedicStar AI Astrologer')}</CardTitle>
                                <CardDescription className="text-purple-100">
                                  {t('aiAstrologer.chat.poweredBy', 'Powered by Vedic Wisdom')}
                                </CardDescription>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-purple-100">{t('aiAstrologer.chat.online', 'Online')}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="h-[450px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50 via-white to-indigo-50"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === "user"
                        ? "bg-amber-500 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-none shadow-md"
                        : "bg-white shadow-md border border-purple-100 rounded-tl-none"
                    }`}
                  >
                    <div className={`text-sm leading-relaxed ${
                      message.role === "user" ? "" : "text-gray-700"
                    }`}>
                      {message.content.split('\n').map((line, i) => {
                        // Empty line = paragraph break
                        if (line.trim() === '') {
                          return <div key={i} className="h-2" />;
                        }
                        // Section headers (full line bold)
                        if (line.startsWith('**') && line.endsWith('**') && !line.includes(': ')) {
                          return <p key={i} className="font-bold text-purple-800 mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
                        }
                        // Bullet points
                        if (line.startsWith('- ')) {
                          return (
                            <div key={i} className="flex gap-2 ml-1 my-0.5">
                              <span className="text-purple-500">•</span>
                              <span>{parseMarkdownLine(line.slice(2))}</span>
                            </div>
                          );
                        }
                        // Numbered lists
                        if (line.match(/^\d+\.\s/)) {
                          const match = line.match(/^(\d+)\.\s(.*)$/);
                          if (match) {
                            return (
                              <div key={i} className="flex gap-2 ml-1 my-0.5">
                                <span className="text-purple-600 font-medium min-w-[1.25rem]">{match[1]}.</span>
                                <span>{parseMarkdownLine(match[2])}</span>
                              </div>
                            );
                          }
                        }
                        // Regular text with inline bold parsing
                        return <p key={i} className="my-0.5">{parseMarkdownLine(line)}</p>;
                      })}
                    </div>
                    <div
                      className={`text-xs mt-2 ${
                        message.role === "user" ? "text-amber-100" : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white shadow-sm border rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{t('aiAstrologer.chat.loading', 'Consulting the stars...')}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-indigo-50">
                <p className="text-sm font-medium text-purple-700 mb-3">{t('aiAstrologer.chat.suggestedQuestions', 'Suggested questions:')}</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-xs px-4 py-2 rounded-full bg-white text-purple-700 hover:bg-purple-100 hover:shadow-md transition-all duration-200 border border-purple-200 shadow-sm"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-3"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('aiAstrologer.chat.placeholder', 'Ask about your horoscope, transits, doshas...')}
                  className="flex-1 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
                    <Card className="border-purple-200">
                      <CardContent className="pt-6">
                        <Moon className="w-8 h-8 text-purple-600 mb-3" />
                        <h3 className="font-semibold mb-2">{t('aiAstrologer.features.planetaryAnalysis.title', 'Planetary Analysis')}</h3>
                        <p className="text-sm text-gray-600">
                          {t('aiAstrologer.features.planetaryAnalysis.description', 'Get insights about planetary positions, transits, and their effects on your life.')}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-amber-200">
                      <CardContent className="pt-6">
                        <Sun className="w-8 h-8 text-amber-600 mb-3" />
                        <h3 className="font-semibold mb-2">{t('aiAstrologer.features.doshaRemedies.title', 'Dosha Remedies')}</h3>
                        <p className="text-sm text-gray-600">
                          {t('aiAstrologer.features.doshaRemedies.description', 'Learn about doshas like Mangal, Kaal Sarp, Sade Sati and their powerful remedies.')}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200">
                      <CardContent className="pt-6">
                        <Star className="w-8 h-8 text-green-600 mb-3" />
                        <h3 className="font-semibold mb-2">{t('aiAstrologer.features.lifeGuidance.title', 'Life Guidance')}</h3>
                        <p className="text-sm text-gray-600">
                          {t('aiAstrologer.features.lifeGuidance.description', 'Receive guidance on career, relationships, health, and spiritual growth.')}
                        </p>
                      </CardContent>
                    </Card>
        </div>

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-500 text-center">
                    <strong>{t('aiAstrologer.disclaimer.note', 'Note')}:</strong> {t('aiAstrologer.disclaimer.text', 'AI Astrologer provides general guidance based on Vedic astrology principles. For personalized predictions based on your exact birth chart, please')}{" "}
                    <a href="/consultation" className="text-purple-600 hover:underline">
                      {t('aiAstrologer.disclaimer.consultLink', 'consult with our expert astrologers')}
                    </a>.
                  </p>
                </div>
      </div>
    </div>
  );
}
