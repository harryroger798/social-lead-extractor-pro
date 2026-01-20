// New Feature Translations for VedicStarAstro
// This file contains translations for the 10 new features added to the platform

import { Language } from "./translations";

type TranslationObject = Record<string, unknown>;

export const newFeatureTranslations: Record<Language, TranslationObject> = {
  en: {
    nav: {
      aiFeatures: "AI & Pro",
      aiAstrologerPro: "AI Astrologer Pro",
      aiAstrologerProDesc: "Context-aware AI with birth chart",
      voiceAstrologer: "Voice AI Astrologer",
      voiceAstrologerDesc: "Talk to AI astrologer by voice",
      aiChartInterpretation: "AI Chart Interpretation",
      aiChartInterpretationDesc: "Detailed AI analysis of your chart",
      habitTracker: "Habit Tracker",
      habitTrackerDesc: "Track habits with astro timing",
      lifeTimeline: "Life Timeline",
      lifeTimelineDesc: "Predicted life events based on Dasha",
      blockchainKundli: "Blockchain Kundli",
      blockchainKundliDesc: "Verified tamper-proof certificate",
      financialAstrology: "Financial Astrology",
      financialAstrologyDesc: "Wealth timing predictions",
      planetaryTracker: "Planetary Tracker",
      planetaryTrackerDesc: "Live planetary positions & transits",
      personalizedHoroscope: "Personalized Horoscope",
      personalizedHoroscopeDesc: "AI-generated based on your chart"
    },
    share: {
      generating: "Generating image...",
      download: "Download",
      copied: "Copied!",
      copyImage: "Copy Image",
      share: "Share",
      shareNative: "Share",
      instagramInstructions: "Image copied! Open Instagram and paste to share.",
      authenticVedicAstrology: "Authentic Vedic Astrology",
      luckyNumber: "Lucky Number",
      luckyColor: "Lucky Color",
      loveCompatibility: "Love Compatibility",
      birthChart: "Birth Chart",
      ascendant: "Ascendant",
      moonSign: "Moon Sign",
      sunSign: "Sun Sign",
      nakshatra: "Nakshatra",
      transit: "Transit",
      in: "in",
      effect: { favorable: "Favorable", challenging: "Challenging", mixed: "Mixed" }
    },
    dualZodiac: {
      title: "Your Zodiac Signs",
      subtitle: "Both Vedic (Sidereal) and Western (Tropical) systems",
      vedic: "Vedic",
      western: "Western",
      explanation: "Vedic uses actual star positions (Sidereal). Western uses seasonal positions (Tropical). The ~24° difference is called Ayanamsha."
    },
    planetaryTracker: {
      badge: "Live Cosmic Updates",
      title: "Real-Time Planetary Tracker",
      subtitle: "Track live planetary positions, upcoming transits, and cosmic events.",
      lastUpdated: "Last updated",
      refresh: "Refresh",
      currentPositions: "Current Planetary Positions",
      currentPositionsDesc: "Live positions of all Navagrahas",
      retrograde: "Retrograde",
      speed: { fast: "Fast", normal: "Normal", slow: "Slow" },
      activeAlerts: "Active Alerts",
      saturnInPisces: "Saturn in Pisces",
      sadeSatiActive: "Sade Sati active for Pisces, Aries, Aquarius Moon signs",
      jupiterInTaurus: "Jupiter in Taurus",
      jupiterBlessings: "Favorable for Taurus, Cancer, Virgo, Capricorn, Pisces",
      todayMoon: "Today's Moon",
      waxingMoon: "Waxing Moon",
      goodFor: "Good for",
      communication: "communication, learning, short travels",
      upcomingTransits: "Upcoming Transits",
      upcomingTransitsDesc: "Important planetary movements in the coming weeks",
      favorable: "Favorable",
      challenging: "Challenging",
      neutral: "Neutral",
      personalizedAlerts: "Get Personalized Alerts",
      personalizedAlertsDesc: "Generate your Kundli to receive transit alerts specific to your birth chart",
      generateKundli: "Generate Kundli",
      generateFreeKundli: "Generate Free Kundli",
      learnMore: "Learn More About Transits",
      learnMoreDesc: "Understand how planetary movements affect your life",
      saturnTransit2026: "Saturn Transit 2026",
      jupiterTransit2026: "Jupiter Transit 2026",
      mercuryRetrograde2026: "Mercury Retrograde 2026"
    },
    lifeTimeline: {
      badge: "Dasha-Based Predictions",
      title: "Life Event Timeline",
      subtitle: "Discover your predicted life events based on Vimshottari Dasha system.",
      enterDetails: "Enter Your Birth Details",
      enterDetailsDesc: "Generate your personalized life timeline",
      calculating: "Calculating your timeline...",
      generateTimeline: "Generate My Timeline",
      dashaOverview: "Your Dasha Overview",
      dashaOverviewDesc: "Current and upcoming planetary periods",
      newCalculation: "New Calculation",
      mahadasha: "Mahadasha",
      current: "Current",
      years: "years",
      progress: "Progress",
      predictedEvents: "Predicted Life Events",
      predictedEventsDesc: "Based on your Dasha periods and planetary positions",
      period: "Period",
      probability: "Probability",
      disclaimer: "Important Disclaimer",
      disclaimerText: "These predictions are based on Vedic astrology principles and should be used for guidance only.",
      consultExpert: "Consult Expert",
      shareTimeline: "Share Your Timeline",
      shareTimelineDesc: "Share your life predictions with friends and family"
    },
    personalizedHoroscope: {
      badge: "AI-Powered Predictions",
      title: "Personalized Daily Horoscope",
      subtitle: "Get your daily horoscope based on your exact birth chart, not just your sun sign.",
      enterDetails: "Enter Your Birth Details",
      enterDetailsDesc: "Get horoscope based on your exact birth chart",
      generating: "Generating your personalized horoscope...",
      generate: "Generate My Horoscope",
      whyPersonalized: "Why Personalized?",
      whyPersonalizedDesc: "Unlike generic horoscopes, we analyze your complete birth chart.",
      todayHoroscope: "Today's Horoscope",
      refresh: "Refresh",
      moonSign: "Moon Sign",
      ascendant: "Ascendant",
      transits: "Active Transits",
      luckyNumber: "Lucky Number",
      luckyColor: "Lucky Color",
      luckyTime: "Lucky Time",
      mantra: "Today's Mantra",
      todayAdvice: "Today's Advice",
      wantMore: "Want More Insights?",
      viewLifeTimeline: "View Life Timeline",
      consultAstrologer: "Consult Astrologer",
      general: "General",
      career: "Career",
      love: "Love",
      health: "Health",
      finance: "Finance"
    },
    voiceAstrologer: {
      badge: "Voice AI Consultation",
      title: "Voice AI Astrologer",
      subtitle: "Talk to our AI Astrologer in your preferred language.",
      callInterface: "Voice Call Interface",
      readyToCall: "Ready to Call",
      connecting: "Connecting...",
      inCall: "In Call",
      callEnded: "Call Ended",
      duration: "Duration",
      limitReached: "You have reached your daily limit. Please try again tomorrow.",
      dailyLimit: "Daily Free Minutes",
      minutesRemaining: "minutes remaining",
      limitNote: "Free users get 5 minutes per day.",
      newCall: "Start New Call",
      sampleQuestions: "Sample Questions",
      howItWorks: "How It Works",
      step1: "Select your preferred language",
      step2: "Click the call button to connect",
      step3: "Speak naturally and ask your questions",
      step4: "Receive personalized astrological guidance",
      features: "Features",
      feature1: "Natural voice conversation",
      feature2: "Multiple Indian languages",
      feature3: "Vedic astrology expertise",
      feature4: "24/7 availability",
      feature5: "Instant responses",
      preferText: "Prefer text-based chat?",
      goToChat: "Go to AI Chat",
      selectLanguage: "Select Language",
      startCall: "Start Call",
      endCall: "End Call",
      mute: "Mute",
      unmute: "Unmute",
      speaker: "Speaker",
      httpsRequired: "Voice calls require a secure connection (HTTPS). Please access this site via HTTPS to use the Voice AI Astrologer.",
      microphoneDenied: "Microphone access was denied. Please allow microphone access in your browser settings and try again.",
      connectionError: "Connection error. Please try again later.",
      startError: "Failed to start call. Please check your microphone permissions and try again.",
      englishNote: "For best results, please speak in English. Hindi and other languages may have pronunciation variations."
    },
    home: {
      voiceAiBadge: "NEW - Voice AI Feature",
      voiceAiTitle: "Talk to Our AI Astrologer",
      voiceAiDesc: "Get instant Vedic astrology guidance through natural voice conversation. Ask about your birth chart, career, relationships, and more!",
      tryVoiceAi: "Try Voice AI Now",
      voiceAiFree: "5 Free Minutes Daily"
    },
    blockchainKundli: {
      badge: "Verified & Immutable",
      title: "Blockchain Kundli Certificate",
      subtitle: "Get a cryptographically verified, tamper-proof Kundli certificate stored on IPFS.",
      feature1Title: "Tamper-Proof",
      feature1Desc: "Cryptographic hash ensures your Kundli cannot be altered",
      feature2Title: "Permanently Stored",
      feature2Desc: "Stored on IPFS - accessible forever from anywhere",
      feature3Title: "Verifiable",
      feature3Desc: "Anyone can verify authenticity using the certificate ID",
      feature4Title: "Free & Unlimited",
      feature4Desc: "Generate as many certificates as you need at no cost",
      enterDetails: "Enter Your Birth Details",
      enterDetailsDesc: "Generate your verified Kundli certificate",
      generating: "Generating Certificate...",
      generate: "Generate Blockchain Certificate",
      processingSteps: "Processing...",
      step1: "Calculating birth chart...",
      step2: "Generating cryptographic hash...",
      step3: "Uploading to IPFS...",
      success: "Certificate Generated Successfully!",
      successDesc: "Your Kundli is now permanently stored and verifiable",
      certificateDetails: "Certificate Details",
      certificateId: "Certificate ID",
      cryptoHash: "Cryptographic Hash",
      ipfsHash: "IPFS Hash",
      timestamp: "Timestamp",
      chartSummary: "Chart Summary",
      birthDetails: "Birth Details",
      name: "Name",
      date: "Date",
      time: "Time",
      place: "Place",
      downloadCertificate: "Download Certificate",
      shareCertificate: "Share Certificate",
      viewOnIPFS: "View on IPFS",
      generateAnother: "Generate Another",
      howToVerify: "How to Verify",
      verifyInstructions: "Anyone can verify the authenticity using the Certificate ID or IPFS hash.",
      viewFullKundli: "View Full Kundli",
      consultAstrologer: "Consult Astrologer"
    },
    habitTracker: {
      badge: "Astrology-Powered Habits",
      title: "Cosmic Habit Tracker",
      subtitle: "Build better habits aligned with planetary energies.",
      todayProgress: "Today's Progress",
      totalStreak: "Total Streak Days",
      todayEnergy: "Today's Energy",
      day: "Day",
      energyLevel: "Energy",
      energy: { high: "High", medium: "Medium", low: "Low" },
      myHabits: "My Habits",
      addHabit: "Add Habit",
      habitName: "Habit name...",
      add: "Add",
      weeklyGuide: "Weekly Planetary Guide",
      weeklyGuideDesc: "Best activities for each day based on ruling planet",
      today: "Today",
      bestFor: "Best for",
      todayRecommendation: "Today's Recommendation",
      bestActivities: "Best Activities Today",
      avoidToday: "Avoid Today",
      learnMore: "Want to learn more about planetary influences?",
      viewPlanetaryTracker: "View Planetary Tracker",
      getKundli: "Get Your Kundli"
    },
    financialAstrology: {
      badge: "Wealth & Prosperity",
      title: "Financial Astrology",
      subtitle: "Discover your wealth potential based on your Vedic birth chart.",
      enterDetails: "Enter Your Birth Details",
      enterDetailsDesc: "Get personalized financial predictions",
      analyzing: "Analyzing Your Chart...",
      analyze: "Analyze My Financial Potential",
      newAnalysis: "New Analysis",
      wealthYogas: "Wealth Yogas in Your Chart",
      wealthYogasDesc: "Special planetary combinations that indicate wealth potential",
      strength: { strong: "Strong", moderate: "Moderate", weak: "Weak" },
      notPresent: "Not Present",
      quarterlyForecast: "2026 Quarterly Financial Forecast",
      trend: { up: "Upward", down: "Downward", stable: "Stable" },
      opportunities: "Opportunities",
      cautions: "Cautions",
      investmentGuide: "Personalized Investment Guide",
      investmentGuideDesc: "Best investment options based on your planetary positions",
      suitability: { excellent: "Excellent", good: "Good", moderate: "Moderate", avoid: "Avoid" },
      timing: "Timing",
      disclaimer: "Important Disclaimer",
      disclaimerText: "Financial astrology provides guidance and should not be considered as financial advice.",
      consultAstrologer: "Consult Expert Astrologer",
      viewLifeTimeline: "View Life Timeline"
    },
    aiChartInterpretation: {
      badge: "AI-Powered Analysis",
      title: "AI Chart Interpretation",
      subtitle: "Get a comprehensive AI-powered analysis of your Vedic birth chart.",
      enterDetails: "Enter Your Birth Details",
      enterDetailsDesc: "Our AI will analyze your complete birth chart",
      analyzing: "AI is Analyzing Your Chart...",
      analyze: "Get AI Interpretation",
      analyzingSteps: "Our AI is analyzing your birth chart...",
      step1: "Calculating planetary positions...",
      step2: "Analyzing house placements...",
      step3: "Generating personalized insights...",
      resultsFor: "Chart Analysis for",
      generatedBy: "Generated by VedicStarAstro AI",
      download: "Download",
      newAnalysis: "New Analysis",
      tab: { personality: "Personality", career: "Career", relationships: "Relationships", finance: "Finance", health: "Health", spiritual: "Spiritual" },
      strengths: "Strengths",
      challenges: "Challenges",
      suitableFields: "Suitable Career Fields",
      careerAdvice: "Career Advice",
      loveStyle: "Your Love Style",
      bestCompatibility: "Best Compatibility",
      wealthPotential: "Wealth Potential",
      financialAdvice: "Financial Advice",
      healthVulnerabilities: "Areas to Watch",
      healthRemedies: "Recommended Remedies",
      spiritualPath: "Your Spiritual Path",
      recommendedPractices: "Recommended Practices",
      wantMore: "Want more detailed analysis?",
      askAI: "Ask AI Astrologer",
      consultExpert: "Consult Expert"
    },
    aiAstrologerPro: {
      badge: "Enhanced AI",
      title: "AI Astrologer Pro",
      subtitle: "Get personalized astrological guidance powered by your birth chart.",
      birthDetails: "Birth Details",
      birthDetailsDesc: "Enter for personalized readings",
      loading: "Loading...",
      updateChart: "Update Chart",
      loadChart: "Load My Chart",
      chartLoaded: "Chart Loaded",
      quickTopics: "Quick Topics",
      preferVoice: "Prefer Voice?",
      voiceDesc: "Talk to our AI Astrologer using voice",
      tryVoice: "Try Voice AI",
      chatTitle: "AI Astrologer Pro",
      personalizedMode: "Personalized Mode Active",
      generalMode: "General Mode",
      enhanced: "Enhanced",
      askQuestion: "Ask your question...",
      otherOptions: "Looking for other options?",
      basicChat: "Basic AI Chat",
      chartInterpretation: "Chart Interpretation",
      humanExpert: "Talk to Human Expert",
      welcomePersonalized: "Namaste",
      welcomeWithChart: "I have analyzed your birth chart and I'm ready to provide personalized guidance.",
      yourChart: "Your Chart Summary",
      currentDasha: "Current Dasha",
      askAnything: "Ask me anything about your career, relationships, health, or spiritual path.",
      welcomeGeneral: "Namaste! I am your Enhanced AI Astrologer.",
      proFeatures: "Pro Features",
      feature1: "Personalized readings based on your birth chart",
      feature2: "Context-aware responses considering your Dasha period",
      feature3: "Detailed remedies tailored to your planetary positions",
      feature4: "Quick topic selection for focused guidance",
      enterBirthDetails: "Enter your birth details above for personalized guidance.",
      quickCareer: "What does my chart say about my career?",
      quickLove: "Tell me about my love life",
      quickFinance: "How can I improve my finances?",
      quickHealth: "What should I know about my health?",
      quickSpiritual: "Guide me on my spiritual path"
    }
  },
  hi: {
    nav: {
      aiFeatures: "AI और प्रो",
      aiAstrologerPro: "AI ज्योतिषी प्रो",
      aiAstrologerProDesc: "जन्म कुंडली के साथ संदर्भ-जागरूक AI",
      voiceAstrologer: "वॉइस AI ज्योतिषी",
      voiceAstrologerDesc: "आवाज से AI ज्योतिषी से बात करें",
      aiChartInterpretation: "AI चार्ट व्याख्या",
      aiChartInterpretationDesc: "आपके चार्ट का विस्तृत AI विश्लेषण",
      habitTracker: "आदत ट्रैकर",
      habitTrackerDesc: "ज्योतिष समय के साथ आदतें ट्रैक करें",
      lifeTimeline: "जीवन समयरेखा",
      lifeTimelineDesc: "दशा पर आधारित भविष्यवाणी की घटनाएं",
      blockchainKundli: "ब्लॉकचेन कुंडली",
      blockchainKundliDesc: "सत्यापित छेड़छाड़-प्रूफ प्रमाणपत्र",
      financialAstrology: "वित्तीय ज्योतिष",
      financialAstrologyDesc: "धन समय की भविष्यवाणियां",
      planetaryTracker: "ग्रह ट्रैकर",
      planetaryTrackerDesc: "लाइव ग्रह स्थितियां और गोचर",
      personalizedHoroscope: "व्यक्तिगत राशिफल",
      personalizedHoroscopeDesc: "आपके चार्ट पर आधारित AI-जनित"
    },
    share: {
      generating: "छवि बना रहे हैं...",
      download: "डाउनलोड",
      copied: "कॉपी हो गया!",
      copyImage: "छवि कॉपी करें",
      share: "शेयर करें",
      shareNative: "शेयर करें",
      instagramInstructions: "छवि कॉपी हो गई! Instagram खोलें और शेयर करने के लिए पेस्ट करें।",
      authenticVedicAstrology: "प्रामाणिक वैदिक ज्योतिष",
      luckyNumber: "भाग्यशाली अंक",
      luckyColor: "भाग्यशाली रंग",
      loveCompatibility: "प्रेम अनुकूलता",
      birthChart: "जन्म कुंडली",
      ascendant: "लग्न",
      moonSign: "चंद्र राशि",
      sunSign: "सूर्य राशि",
      nakshatra: "नक्षत्र",
      transit: "गोचर",
      in: "में",
      effect: { favorable: "अनुकूल", challenging: "चुनौतीपूर्ण", mixed: "मिश्रित" }
    },
    dualZodiac: {
      title: "आपकी राशियां",
      subtitle: "वैदिक (सायन) और पश्चिमी (निरयन) दोनों प्रणालियां",
      vedic: "वैदिक",
      western: "पश्चिमी",
      explanation: "वैदिक वास्तविक तारा स्थितियों का उपयोग करता है (सायन)। पश्चिमी मौसमी स्थितियों का उपयोग करता है (निरयन)। ~24° का अंतर अयनांश कहलाता है।"
    },
    planetaryTracker: {
      badge: "लाइव ब्रह्मांडीय अपडेट",
      title: "रीयल-टाइम ग्रह ट्रैकर",
      subtitle: "लाइव ग्रह स्थितियों, आगामी गोचर और ब्रह्मांडीय घटनाओं को ट्रैक करें।",
      lastUpdated: "अंतिम अपडेट",
      refresh: "रिफ्रेश",
      currentPositions: "वर्तमान ग्रह स्थितियां",
      currentPositionsDesc: "सभी नवग्रहों की लाइव स्थितियां",
      retrograde: "वक्री",
      speed: { fast: "तेज़", normal: "सामान्य", slow: "धीमी" },
      activeAlerts: "सक्रिय अलर्ट",
      saturnInPisces: "मीन में शनि",
      sadeSatiActive: "मीन, मेष, कुंभ चंद्र राशियों के लिए साढ़े साती सक्रिय",
      jupiterInTaurus: "वृषभ में बृहस्पति",
      jupiterBlessings: "वृषभ, कर्क, कन्या, मकर, मीन के लिए अनुकूल",
      todayMoon: "आज का चंद्रमा",
      waxingMoon: "शुक्ल पक्ष",
      goodFor: "के लिए अच्छा",
      communication: "संचार, सीखना, छोटी यात्राएं",
      upcomingTransits: "आगामी गोचर",
      upcomingTransitsDesc: "आने वाले हफ्तों में महत्वपूर्ण ग्रह गतिविधियां",
      favorable: "अनुकूल",
      challenging: "चुनौतीपूर्ण",
      neutral: "तटस्थ",
      personalizedAlerts: "व्यक्तिगत अलर्ट प्राप्त करें",
      personalizedAlertsDesc: "अपनी जन्म कुंडली के अनुसार गोचर अलर्ट प्राप्त करने के लिए कुंडली बनाएं",
      generateKundli: "कुंडली बनाएं",
      generateFreeKundli: "मुफ्त कुंडली बनाएं",
      learnMore: "गोचर के बारे में और जानें",
      learnMoreDesc: "समझें कि ग्रह गतिविधियां आपके जीवन को कैसे प्रभावित करती हैं",
      saturnTransit2026: "शनि गोचर 2026",
      jupiterTransit2026: "बृहस्पति गोचर 2026",
      mercuryRetrograde2026: "बुध वक्री 2026"
    },
    lifeTimeline: {
      badge: "दशा-आधारित भविष्यवाणियां",
      title: "जीवन घटना समयरेखा",
      subtitle: "विमशोत्तरी दशा प्रणाली के आधार पर अपनी भविष्यवाणी की गई जीवन घटनाओं की खोज करें।",
      enterDetails: "अपना जन्म विवरण दर्ज करें",
      enterDetailsDesc: "अपनी व्यक्तिगत जीवन समयरेखा बनाएं",
      calculating: "आपकी समयरेखा की गणना हो रही है...",
      generateTimeline: "मेरी समयरेखा बनाएं",
      dashaOverview: "आपका दशा अवलोकन",
      dashaOverviewDesc: "वर्तमान और आगामी ग्रह अवधियां",
      newCalculation: "नई गणना",
      mahadasha: "महादशा",
      current: "वर्तमान",
      years: "वर्ष",
      progress: "प्रगति",
      predictedEvents: "भविष्यवाणी की गई जीवन घटनाएं",
      predictedEventsDesc: "आपकी दशा अवधियों और ग्रह स्थितियों के आधार पर",
      period: "अवधि",
      probability: "संभावना",
      disclaimer: "महत्वपूर्ण अस्वीकरण",
      disclaimerText: "ये भविष्यवाणियां वैदिक ज्योतिष सिद्धांतों पर आधारित हैं और केवल मार्गदर्शन के लिए उपयोग की जानी चाहिए।",
      consultExpert: "विशेषज्ञ से परामर्श",
      shareTimeline: "अपनी समयरेखा साझा करें",
      shareTimelineDesc: "अपनी जीवन भविष्यवाणियां मित्रों और परिवार के साथ साझा करें"
    },
    personalizedHoroscope: {
      badge: "AI-संचालित भविष्यवाणियां",
      title: "व्यक्तिगत दैनिक राशिफल",
      subtitle: "अपनी सटीक जन्म कुंडली के आधार पर अपना दैनिक राशिफल प्राप्त करें।",
      enterDetails: "अपना जन्म विवरण दर्ज करें",
      enterDetailsDesc: "अपनी सटीक जन्म कुंडली के आधार पर राशिफल प्राप्त करें",
      generating: "आपका व्यक्तिगत राशिफल बना रहे हैं...",
      generate: "मेरा राशिफल बनाएं",
      whyPersonalized: "व्यक्तिगत क्यों?",
      whyPersonalizedDesc: "सामान्य राशिफल के विपरीत, हम आपकी पूरी जन्म कुंडली का विश्लेषण करते हैं।",
      todayHoroscope: "आज का राशिफल",
      refresh: "रिफ्रेश",
      moonSign: "चंद्र राशि",
      ascendant: "लग्न",
      transits: "सक्रिय गोचर",
      luckyNumber: "भाग्यशाली अंक",
      luckyColor: "भाग्यशाली रंग",
      luckyTime: "भाग्यशाली समय",
      mantra: "आज का मंत्र",
      todayAdvice: "आज की सलाह",
      wantMore: "और अधिक जानकारी चाहिए?",
      viewLifeTimeline: "जीवन समयरेखा देखें",
      consultAstrologer: "ज्योतिषी से परामर्श",
      general: "सामान्य",
      career: "करियर",
      love: "प्रेम",
      health: "स्वास्थ्य",
      finance: "वित्त"
    },
    voiceAstrologer: {
      badge: "वॉयस AI परामर्श",
      title: "वॉयस AI ज्योतिषी",
      subtitle: "अपनी पसंदीदा भाषा में हमारे AI ज्योतिषी से बात करें।",
      callInterface: "वॉयस कॉल इंटरफेस",
      readyToCall: "कॉल के लिए तैयार",
      connecting: "कनेक्ट हो रहा है...",
      inCall: "कॉल में",
      callEnded: "कॉल समाप्त",
      duration: "अवधि",
      limitReached: "आपने अपनी दैनिक सीमा पूरी कर ली है। कृपया कल फिर प्रयास करें।",
      dailyLimit: "दैनिक मुफ्त मिनट",
      minutesRemaining: "मिनट शेष",
      limitNote: "मुफ्त उपयोगकर्ताओं को प्रतिदिन 5 मिनट मिलते हैं।",
      newCall: "नई कॉल शुरू करें",
      sampleQuestions: "नमूना प्रश्न",
      howItWorks: "यह कैसे काम करता है",
      step1: "अपनी पसंदीदा भाषा चुनें",
      step2: "कनेक्ट करने के लिए कॉल बटन पर क्लिक करें",
      step3: "स्वाभाविक रूप से बोलें और अपने प्रश्न पूछें",
      step4: "व्यक्तिगत ज्योतिषीय मार्गदर्शन प्राप्त करें",
      features: "विशेषताएं",
      feature1: "प्राकृतिक वॉयस वार्तालाप",
      feature2: "कई भारतीय भाषाएं",
      feature3: "वैदिक ज्योतिष विशेषज्ञता",
      feature4: "24/7 उपलब्धता",
      feature5: "तत्काल प्रतिक्रियाएं",
      preferText: "टेक्स्ट-आधारित चैट पसंद करते हैं?",
      goToChat: "AI चैट पर जाएं",
      selectLanguage: "भाषा चुनें",
      startCall: "कॉल शुरू करें",
      endCall: "कॉल समाप्त करें",
      mute: "म्यूट",
      unmute: "अनम्यूट",
      speaker: "स्पीकर",
      httpsRequired: "वॉयस कॉल के लिए सुरक्षित कनेक्शन (HTTPS) आवश्यक है। कृपया वॉयस AI ज्योतिषी का उपयोग करने के लिए HTTPS के माध्यम से इस साइट तक पहुंचें।",
      microphoneDenied: "माइक्रोफोन एक्सेस अस्वीकार कर दी गई। कृपया अपनी ब्राउज़र सेटिंग्स में माइक्रोफोन एक्सेस की अनुमति दें और पुनः प्रयास करें।",
      connectionError: "कनेक्शन त्रुटि। कृपया बाद में पुनः प्रयास करें।",
      startError: "कॉल शुरू करने में विफल। कृपया अपनी माइक्रोफोन अनुमतियां जांचें और पुनः प्रयास करें।",
      englishNote: "सर्वोत्तम परिणामों के लिए, कृपया अंग्रेजी में बोलें। हिंदी और अन्य भाषाओं में उच्चारण भिन्नताएं हो सकती हैं।"
    },
    home: {
      voiceAiBadge: "नया - वॉयस AI फीचर",
      voiceAiTitle: "हमारे AI ज्योतिषी से बात करें",
      voiceAiDesc: "प्राकृतिक वॉयस वार्तालाप के माध्यम से तत्काल वैदिक ज्योतिष मार्गदर्शन प्राप्त करें। अपनी जन्म कुंडली, करियर, रिश्तों और अधिक के बारे में पूछें!",
      tryVoiceAi: "वॉयस AI आज़माएं",
      voiceAiFree: "प्रतिदिन 5 मुफ्त मिनट"
    },
    blockchainKundli: {
      badge: "सत्यापित और अपरिवर्तनीय",
      title: "ब्लॉकचेन कुंडली प्रमाणपत्र",
      subtitle: "IPFS पर स्थायी रूप से संग्रहीत क्रिप्टोग्राफिक रूप से सत्यापित कुंडली प्रमाणपत्र प्राप्त करें।",
      feature1Title: "छेड़छाड़-रोधी",
      feature1Desc: "क्रिप्टोग्राफिक हैश सुनिश्चित करता है कि आपकी कुंडली बदली नहीं जा सकती",
      feature2Title: "स्थायी रूप से संग्रहीत",
      feature2Desc: "IPFS पर संग्रहीत - कहीं से भी हमेशा के लिए सुलभ",
      feature3Title: "सत्यापन योग्य",
      feature3Desc: "कोई भी प्रमाणपत्र ID का उपयोग करके प्रामाणिकता सत्यापित कर सकता है",
      feature4Title: "मुफ्त और असीमित",
      feature4Desc: "बिना किसी लागत के जितने चाहें उतने प्रमाणपत्र बनाएं",
      enterDetails: "अपना जन्म विवरण दर्ज करें",
      enterDetailsDesc: "अपना सत्यापित कुंडली प्रमाणपत्र बनाएं",
      generating: "प्रमाणपत्र बना रहे हैं...",
      generate: "ब्लॉकचेन प्रमाणपत्र बनाएं",
      processingSteps: "प्रोसेसिंग...",
      step1: "जन्म कुंडली की गणना हो रही है...",
      step2: "क्रिप्टोग्राफिक हैश बना रहे हैं...",
      step3: "IPFS पर अपलोड हो रहा है...",
      success: "प्रमाणपत्र सफलतापूर्वक बनाया गया!",
      successDesc: "आपकी कुंडली अब स्थायी रूप से संग्रहीत और सत्यापन योग्य है",
      certificateDetails: "प्रमाणपत्र विवरण",
      certificateId: "प्रमाणपत्र ID",
      cryptoHash: "क्रिप्टोग्राफिक हैश",
      ipfsHash: "IPFS हैश",
      timestamp: "टाइमस्टैम्प",
      chartSummary: "कुंडली सारांश",
      birthDetails: "जन्म विवरण",
      name: "नाम",
      date: "तारीख",
      time: "समय",
      place: "स्थान",
      downloadCertificate: "प्रमाणपत्र डाउनलोड करें",
      shareCertificate: "प्रमाणपत्र साझा करें",
      viewOnIPFS: "IPFS पर देखें",
      generateAnother: "एक और बनाएं",
      howToVerify: "सत्यापन कैसे करें",
      verifyInstructions: "कोई भी प्रमाणपत्र ID या IPFS हैश का उपयोग करके प्रामाणिकता सत्यापित कर सकता है।",
      viewFullKundli: "पूर्ण कुंडली देखें",
      consultAstrologer: "ज्योतिषी से परामर्श"
    },
    habitTracker: {
      badge: "ज्योतिष-संचालित आदतें",
      title: "कॉस्मिक हैबिट ट्रैकर",
      subtitle: "ग्रहों की ऊर्जाओं के अनुरूप बेहतर आदतें बनाएं।",
      todayProgress: "आज की प्रगति",
      totalStreak: "कुल स्ट्रीक दिन",
      todayEnergy: "आज की ऊर्जा",
      day: "दिन",
      energyLevel: "ऊर्जा",
      energy: { high: "उच्च", medium: "मध्यम", low: "निम्न" },
      myHabits: "मेरी आदतें",
      addHabit: "आदत जोड़ें",
      habitName: "आदत का नाम...",
      add: "जोड़ें",
      weeklyGuide: "साप्ताहिक ग्रह गाइड",
      weeklyGuideDesc: "शासक ग्रह के आधार पर प्रत्येक दिन के लिए सर्वोत्तम गतिविधियां",
      today: "आज",
      bestFor: "के लिए सर्वोत्तम",
      todayRecommendation: "आज की सिफारिश",
      bestActivities: "आज की सर्वोत्तम गतिविधियां",
      avoidToday: "आज से बचें",
      learnMore: "ग्रह प्रभावों के बारे में और जानना चाहते हैं?",
      viewPlanetaryTracker: "ग्रह ट्रैकर देखें",
      getKundli: "अपनी कुंडली प्राप्त करें"
    },
    financialAstrology: {
      badge: "धन और समृद्धि",
      title: "वित्तीय ज्योतिष",
      subtitle: "अपनी वैदिक जन्म कुंडली के आधार पर अपनी धन क्षमता की खोज करें।",
      enterDetails: "अपना जन्म विवरण दर्ज करें",
      enterDetailsDesc: "व्यक्तिगत वित्तीय भविष्यवाणियां प्राप्त करें",
      analyzing: "आपकी कुंडली का विश्लेषण हो रहा है...",
      analyze: "मेरी वित्तीय क्षमता का विश्लेषण करें",
      newAnalysis: "नया विश्लेषण",
      wealthYogas: "आपकी कुंडली में धन योग",
      wealthYogasDesc: "विशेष ग्रह संयोजन जो धन क्षमता दर्शाते हैं",
      strength: { strong: "मजबूत", moderate: "मध्यम", weak: "कमजोर" },
      notPresent: "मौजूद नहीं",
      quarterlyForecast: "2026 तिमाही वित्तीय पूर्वानुमान",
      trend: { up: "ऊपर की ओर", down: "नीचे की ओर", stable: "स्थिर" },
      opportunities: "अवसर",
      cautions: "सावधानियां",
      investmentGuide: "व्यक्तिगत निवेश गाइड",
      investmentGuideDesc: "आपकी ग्रह स्थितियों के आधार पर सर्वोत्तम निवेश विकल्प",
      suitability: { excellent: "उत्कृष्ट", good: "अच्छा", moderate: "मध्यम", avoid: "बचें" },
      timing: "समय",
      disclaimer: "महत्वपूर्ण अस्वीकरण",
      disclaimerText: "वित्तीय ज्योतिष मार्गदर्शन प्रदान करता है और इसे वित्तीय सलाह नहीं माना जाना चाहिए।",
      consultAstrologer: "विशेषज्ञ ज्योतिषी से परामर्श",
      viewLifeTimeline: "जीवन समयरेखा देखें"
    },
    aiChartInterpretation: {
      badge: "AI-संचालित विश्लेषण",
      title: "AI चार्ट व्याख्या",
      subtitle: "अपनी वैदिक जन्म कुंडली का व्यापक AI-संचालित विश्लेषण प्राप्त करें।",
      enterDetails: "अपना जन्म विवरण दर्ज करें",
      enterDetailsDesc: "हमारा AI आपकी पूरी जन्म कुंडली का विश्लेषण करेगा",
      analyzing: "AI आपकी कुंडली का विश्लेषण कर रहा है...",
      analyze: "AI व्याख्या प्राप्त करें",
      analyzingSteps: "हमारा AI आपकी जन्म कुंडली का विश्लेषण कर रहा है...",
      step1: "ग्रह स्थितियों की गणना हो रही है...",
      step2: "भाव स्थानों का विश्लेषण हो रहा है...",
      step3: "व्यक्तिगत अंतर्दृष्टि बना रहे हैं...",
      resultsFor: "के लिए कुंडली विश्लेषण",
      generatedBy: "VedicStarAstro AI द्वारा निर्मित",
      download: "डाउनलोड",
      newAnalysis: "नया विश्लेषण",
      tab: { personality: "व्यक्तित्व", career: "करियर", relationships: "रिश्ते", finance: "वित्त", health: "स्वास्थ्य", spiritual: "आध्यात्मिक" },
      strengths: "शक्तियां",
      challenges: "चुनौतियां",
      suitableFields: "उपयुक्त करियर क्षेत्र",
      careerAdvice: "करियर सलाह",
      loveStyle: "आपकी प्रेम शैली",
      bestCompatibility: "सर्वोत्तम अनुकूलता",
      wealthPotential: "धन क्षमता",
      financialAdvice: "वित्तीय सलाह",
      healthVulnerabilities: "ध्यान देने योग्य क्षेत्र",
      healthRemedies: "अनुशंसित उपाय",
      spiritualPath: "आपका आध्यात्मिक मार्ग",
      recommendedPractices: "अनुशंसित अभ्यास",
      wantMore: "और विस्तृत विश्लेषण चाहिए?",
      askAI: "AI ज्योतिषी से पूछें",
      consultExpert: "विशेषज्ञ से परामर्श"
    },
    aiAstrologerPro: {
      badge: "उन्नत AI",
      title: "AI ज्योतिषी प्रो",
      subtitle: "अपनी जन्म कुंडली द्वारा संचालित व्यक्तिगत ज्योतिषीय मार्गदर्शन प्राप्त करें।",
      birthDetails: "जन्म विवरण",
      birthDetailsDesc: "व्यक्तिगत रीडिंग के लिए दर्ज करें",
      loading: "लोड हो रहा है...",
      updateChart: "चार्ट अपडेट करें",
      loadChart: "मेरा चार्ट लोड करें",
      chartLoaded: "चार्ट लोड हो गया",
      quickTopics: "त्वरित विषय",
      preferVoice: "वॉयस पसंद करते हैं?",
      voiceDesc: "वॉयस का उपयोग करके हमारे AI ज्योतिषी से बात करें",
      tryVoice: "वॉयस AI आज़माएं",
      chatTitle: "AI ज्योतिषी प्रो",
      personalizedMode: "व्यक्तिगत मोड सक्रिय",
      generalMode: "सामान्य मोड",
      enhanced: "उन्नत",
      askQuestion: "अपना प्रश्न पूछें...",
      otherOptions: "अन्य विकल्प खोज रहे हैं?",
      basicChat: "बेसिक AI चैट",
      chartInterpretation: "चार्ट व्याख्या",
      humanExpert: "मानव विशेषज्ञ से बात करें",
      welcomePersonalized: "नमस्ते",
      welcomeWithChart: "मैंने आपकी जन्म कुंडली का विश्लेषण किया है और व्यक्तिगत मार्गदर्शन देने के लिए तैयार हूं।",
      yourChart: "आपकी कुंडली सारांश",
      currentDasha: "वर्तमान दशा",
      askAnything: "अपने करियर, रिश्तों, स्वास्थ्य या आध्यात्मिक मार्ग के बारे में कुछ भी पूछें।",
      welcomeGeneral: "नमस्ते! मैं आपका उन्नत AI ज्योतिषी हूं।",
      proFeatures: "प्रो विशेषताएं",
      feature1: "आपकी जन्म कुंडली के आधार पर व्यक्तिगत रीडिंग",
      feature2: "आपकी दशा अवधि को ध्यान में रखते हुए संदर्भ-जागरूक प्रतिक्रियाएं",
      feature3: "आपकी ग्रह स्थितियों के अनुसार विस्तृत उपाय",
      feature4: "केंद्रित मार्गदर्शन के लिए त्वरित विषय चयन",
      enterBirthDetails: "व्यक्तिगत मार्गदर्शन के लिए ऊपर अपना जन्म विवरण दर्ज करें।",
      quickCareer: "मेरी कुंडली मेरे करियर के बारे में क्या कहती है?",
      quickLove: "मेरे प्रेम जीवन के बारे में बताएं",
      quickFinance: "मैं अपनी वित्तीय स्थिति कैसे सुधार सकता हूं?",
      quickHealth: "मुझे अपने स्वास्थ्य के बारे में क्या जानना चाहिए?",
      quickSpiritual: "मेरे आध्यात्मिक मार्ग पर मार्गदर्शन करें"
    }
  },
  ta: {
    nav: {
      aiFeatures: "AI & ப்ரோ",
      aiAstrologerPro: "AI ஜோதிடர் ப்ரோ",
      aiAstrologerProDesc: "ஜாதகத்துடன் சூழல்-விழிப்புணர்வு AI",
      voiceAstrologer: "குரல் AI ஜோதிடர்",
      voiceAstrologerDesc: "குரல் மூலம் AI ஜோதிடருடன் பேசுங்கள்",
      aiChartInterpretation: "AI சார்ட் விளக்கம்",
      aiChartInterpretationDesc: "உங்கள் சார்ட்டின் விரிவான AI பகுப்பாய்வு",
      habitTracker: "பழக்க கண்காணிப்பான்",
      habitTrackerDesc: "ஜோதிட நேரத்துடன் பழக்கங்களைக் கண்காணிக்கவும்",
      lifeTimeline: "வாழ்க்கை காலவரிசை",
      lifeTimelineDesc: "தசா அடிப்படையிலான கணிக்கப்பட்ட நிகழ்வுகள்",
      blockchainKundli: "பிளாக்செயின் குண்டலி",
      blockchainKundliDesc: "சரிபார்க்கப்பட்ட மாற்ற-ஆதார சான்றிதழ்",
      financialAstrology: "நிதி ஜோதிடம்",
      financialAstrologyDesc: "செல்வ நேர கணிப்புகள்",
      planetaryTracker: "கிரக கண்காணிப்பான்",
      planetaryTrackerDesc: "நேரடி கிரக நிலைகள் & கோசாரங்கள்",
      personalizedHoroscope: "தனிப்பயனாக்கப்பட்ட ராசிபலன்",
      personalizedHoroscopeDesc: "உங்கள் சார்ட்டின் அடிப்படையில் AI-உருவாக்கப்பட்டது"
    },
    share: {
      generating: "படம் உருவாக்குகிறது...",
      download: "பதிவிறக்கம்",
      copied: "நகலெடுக்கப்பட்டது!",
      copyImage: "படத்தை நகலெடு",
      share: "பகிர்",
      authenticVedicAstrology: "உண்மையான வேத ஜோதிடம்",
      luckyNumber: "அதிர்ஷ்ட எண்",
      luckyColor: "அதிர்ஷ்ட நிறம்"
    },
    dualZodiac: {
      title: "உங்கள் ராசிகள்",
      subtitle: "வேத (சித்தாந்த) மற்றும் மேற்கத்திய (வெப்பமண்டல) இரண்டு முறைகளும்",
      vedic: "வேத",
      western: "மேற்கத்திய",
      explanation: "வேத உண்மையான நட்சத்திர நிலைகளைப் பயன்படுத்துகிறது (சித்தாந்த). மேற்கத்திய பருவகால நிலைகளைப் பயன்படுத்துகிறது (வெப்பமண்டல). ~24° வேறுபாடு அயனாம்சம் என்று அழைக்கப்படுகிறது."
    },
    planetaryTracker: {
      badge: "நேரடி அண்ட புதுப்பிப்புகள்",
      title: "நிகழ்நேர கிரக கண்காணிப்பான்",
      subtitle: "நேரடி கிரக நிலைகள், வரவிருக்கும் கோசாரங்கள் மற்றும் அண்ட நிகழ்வுகளைக் கண்காணிக்கவும்।"
    },
    lifeTimeline: {
      badge: "தசா அடிப்படையிலான கணிப்புகள்",
      title: "வாழ்க்கை நிகழ்வு காலவரிசை",
      subtitle: "விம்சோத்தரி தசா முறையின் அடிப்படையில் உங்கள் கணிக்கப்பட்ட வாழ்க்கை நிகழ்வுகளைக் கண்டறியுங்கள்।"
    },
    personalizedHoroscope: {
      badge: "AI-இயக்கப்படும் கணிப்புகள்",
      title: "தனிப்பயனாக்கப்பட்ட தினசரி ஜாதகம்",
      subtitle: "உங்கள் சரியான ஜாதகத்தின் அடிப்படையில் உங்கள் தினசரி ஜாதகத்தைப் பெறுங்கள்।"
    },
    voiceAstrologer: {
      badge: "குரல் AI ஆலோசனை",
      title: "குரல் AI ஜோதிடர்",
      subtitle: "உங்கள் விருப்பமான மொழியில் எங்கள் AI ஜோதிடரிடம் பேசுங்கள்।"
    },
    blockchainKundli: {
      badge: "சரிபார்க்கப்பட்ட & மாறாத",
      title: "பிளாக்செயின் குண்டலி சான்றிதழ்",
      subtitle: "IPFS இல் நிரந்தரமாக சேமிக்கப்பட்ட கிரிப்டோகிராஃபிக் முறையில் சரிபார்க்கப்பட்ட குண்டலி சான்றிதழைப் பெறுங்கள்।"
    },
    habitTracker: {
      badge: "ஜோதிட-இயக்கப்படும் பழக்கங்கள்",
      title: "அண்ட பழக்க கண்காணிப்பான்",
      subtitle: "கிரக ஆற்றல்களுடன் இணைந்த சிறந்த பழக்கங்களை உருவாக்குங்கள்।"
    },
    financialAstrology: {
      badge: "செல்வம் & செழிப்பு",
      title: "நிதி ஜோதிடம்",
      subtitle: "உங்கள் வேத ஜாதகத்தின் அடிப்படையில் உங்கள் செல்வ திறனைக் கண்டறியுங்கள்।"
    },
    aiChartInterpretation: {
      badge: "AI-இயக்கப்படும் பகுப்பாய்வு",
      title: "AI விளக்கப்படம் விளக்கம்",
      subtitle: "உங்கள் வேத ஜாதகத்தின் விரிவான AI-இயக்கப்படும் பகுப்பாய்வைப் பெறுங்கள்।"
    },
    aiAstrologerPro: {
      badge: "மேம்படுத்தப்பட்ட AI",
      title: "AI ஜோதிடர் ப்ரோ",
      subtitle: "உங்கள் ஜாதகத்தால் இயக்கப்படும் தனிப்பயனாக்கப்பட்ட ஜோதிட வழிகாட்டுதலைப் பெறுங்கள்।"
    },
    home: {
      voiceAiBadge: "புதியது - குரல் AI அம்சம்",
      voiceAiTitle: "எங்கள் AI ஜோதிடரிடம் பேசுங்கள்",
      voiceAiDesc: "இயற்கையான குரல் உரையாடல் மூலம் உடனடி வேத ஜோதிட வழிகாட்டுதலைப் பெறுங்கள். உங்கள் ஜாதகம், தொழில், உறவுகள் மற்றும் பலவற்றைப் பற்றி கேளுங்கள்!",
      tryVoiceAi: "குரல் AI-ஐ இப்போது முயற்சிக்கவும்",
      voiceAiFree: "தினமும் 5 இலவச நிமிடங்கள்"
    }
  },
  te: {
    nav: {
      aiFeatures: "AI & ప్రో",
      aiAstrologerPro: "AI జ్యోతిష్కుడు ప్రో",
      aiAstrologerProDesc: "జాతకంతో సందర్భ-అవగాహన AI",
      voiceAstrologer: "వాయిస్ AI జ్యోతిష్కుడు",
      voiceAstrologerDesc: "వాయిస్ ద్వారా AI జ్యోతిష్కుడితో మాట్లాడండి",
      aiChartInterpretation: "AI చార్ట్ వివరణ",
      aiChartInterpretationDesc: "మీ చార్ట్ యొక్క వివరమైన AI విశ్లేషణ",
      habitTracker: "అలవాటు ట్రాకర్",
      habitTrackerDesc: "జ్యోతిష సమయంతో అలవాట్లను ట్రాక్ చేయండి",
      lifeTimeline: "జీవిత టైమ్‌లైన్",
      lifeTimelineDesc: "దశ ఆధారిత అంచనా సంఘటనలు",
      blockchainKundli: "బ్లాక్‌చెయిన్ కుండలి",
      blockchainKundliDesc: "ధృవీకరించబడిన మార్పు-రుజువు ధృవపత్రం",
      financialAstrology: "ఆర్థిక జ్యోతిషం",
      financialAstrologyDesc: "సంపద సమయ అంచనాలు",
      planetaryTracker: "గ్రహ ట్రాకర్",
      planetaryTrackerDesc: "లైవ్ గ్రహ స్థానాలు & గోచారాలు",
      personalizedHoroscope: "వ్యక్తిగతీకరించిన రాశిఫలం",
      personalizedHoroscopeDesc: "మీ చార్ట్ ఆధారంగా AI-రూపొందించబడింది"
    },
    share: {
      generating: "చిత్రం సృష్టిస్తోంది...",
      download: "డౌన్‌లోడ్",
      copied: "కాపీ చేయబడింది!",
      copyImage: "చిత్రాన్ని కాపీ చేయండి",
      share: "షేర్ చేయండి",
      authenticVedicAstrology: "ప్రామాణిక వేద జ్యోతిషం",
      luckyNumber: "అదృష్ట సంఖ్య",
      luckyColor: "అదృష్ట రంగు"
    },
    dualZodiac: {
      title: "మీ రాశులు",
      subtitle: "వేద (సిద్ధాంత) మరియు పాశ్చాత్య (ఉష్ణమండల) రెండు వ్యవస్థలు",
      vedic: "వేద",
      western: "పాశ్చాత్య",
      explanation: "వేద వాస్తవ నక్షత్ర స్థానాలను ఉపయోగిస్తుంది (సిద్ధాంత). పాశ్చాత్య కాలానుగుణ స్థానాలను ఉపయోగిస్తుంది (ఉష్ణమండల). ~24° వ్యత్యాసాన్ని అయనాంశ అంటారు."
    },
    planetaryTracker: {
      badge: "లైవ్ విశ్వ నవీకరణలు",
      title: "రియల్-టైమ్ గ్రహ ట్రాకర్",
      subtitle: "లైవ్ గ్రహ స్థానాలు, రాబోయే గోచారాలు మరియు విశ్వ సంఘటనలను ట్రాక్ చేయండి।"
    },
    lifeTimeline: {
      badge: "దశ ఆధారిత అంచనాలు",
      title: "జీవిత సంఘటన టైమ్‌లైన్",
      subtitle: "విమ్శోత్తరి దశ వ్యవస్థ ఆధారంగా మీ అంచనా వేసిన జీవిత సంఘటనలను కనుగొనండి।"
    },
    personalizedHoroscope: {
      badge: "AI-ఆధారిత అంచనాలు",
      title: "వ్యక్తిగతీకరించిన రోజువారీ జాతకం",
      subtitle: "మీ ఖచ్చితమైన జన్మ చార్ట్ ఆధారంగా మీ రోజువారీ జాతకాన్ని పొందండి।"
    },
    voiceAstrologer: {
      badge: "వాయిస్ AI సంప్రదింపు",
      title: "వాయిస్ AI జ్యోతిష్కుడు",
      subtitle: "మీ ఇష్టమైన భాషలో మా AI జ్యోతిష్కుడితో మాట్లాడండి।"
    },
    blockchainKundli: {
      badge: "ధృవీకరించబడిన & మార్పులేని",
      title: "బ్లాక్‌చెయిన్ కుండలి సర్టిఫికేట్",
      subtitle: "IPFS లో శాశ్వతంగా నిల్వ చేయబడిన క్రిప్టోగ్రాఫిక్‌గా ధృవీకరించబడిన కుండలి సర్టిఫికేట్ పొందండి।"
    },
    habitTracker: {
      badge: "జ్యోతిష్య-ఆధారిత అలవాట్లు",
      title: "కాస్మిక్ హ్యాబిట్ ట్రాకర్",
      subtitle: "గ్రహ శక్తులతో అనుసంధానమైన మెరుగైన అలవాట్లను నిర్మించండి।"
    },
    financialAstrology: {
      badge: "సంపద & శ్రేయస్సు",
      title: "ఆర్థిక జ్యోతిషం",
      subtitle: "మీ వేద జన్మ చార్ట్ ఆధారంగా మీ సంపద సామర్థ్యాన్ని కనుగొనండి।"
    },
    aiChartInterpretation: {
      badge: "AI-ఆధారిత విశ్లేషణ",
      title: "AI చార్ట్ వివరణ",
      subtitle: "మీ వేద జన్మ చార్ట్ యొక్క సమగ్ర AI-ఆధారిత విశ్లేషణ పొందండి।"
    },
    aiAstrologerPro: {
      badge: "మెరుగైన AI",
      title: "AI జ్యోతిష్కుడు ప్రో",
      subtitle: "మీ జన్మ చార్ట్ ద్వారా శక్తివంతమైన వ్యక్తిగతీకరించిన జ్యోతిష్య మార్గదర్శకత్వం పొందండి।"
    },
    home: {
      voiceAiBadge: "కొత్త - వాయిస్ AI ఫీచర్",
      voiceAiTitle: "మా AI జ్యోతిష్కుడితో మాట్లాడండి",
      voiceAiDesc: "సహజ వాయిస్ సంభాషణ ద్వారా తక్షణ వేద జ్యోతిష్య మార్గదర్శకత్వం పొందండి. మీ జన్మ చార్ట్, కెరీర్, సంబంధాలు మరియు మరిన్ని గురించి అడగండి!",
      tryVoiceAi: "వాయిస్ AI ఇప్పుడు ప్రయత్నించండి",
      voiceAiFree: "రోజూ 5 ఉచిత నిమిషాలు"
    }
  },
  bn: {
    nav: {
      aiFeatures: "AI এবং প্রো",
      aiAstrologerPro: "AI জ্যোতিষী প্রো",
      aiAstrologerProDesc: "জন্ম কুণ্ডলীর সাথে প্রসঙ্গ-সচেতন AI",
      voiceAstrologer: "ভয়েস AI জ্যোতিষী",
      voiceAstrologerDesc: "ভয়েসের মাধ্যমে AI জ্যোতিষীর সাথে কথা বলুন",
      aiChartInterpretation: "AI চার্ট ব্যাখ্যা",
      aiChartInterpretationDesc: "আপনার চার্টের বিস্তারিত AI বিশ্লেষণ",
      habitTracker: "অভ্যাস ট্র্যাকার",
      habitTrackerDesc: "জ্যোতিষ সময়ের সাথে অভ্যাস ট্র্যাক করুন",
      lifeTimeline: "জীবন টাইমলাইন",
      lifeTimelineDesc: "দশা ভিত্তিক পূর্বাভাসিত ঘটনা",
      blockchainKundli: "ব্লকচেইন কুণ্ডলী",
      blockchainKundliDesc: "যাচাইকৃত টেম্পার-প্রুফ সার্টিফিকেট",
      financialAstrology: "আর্থিক জ্যোতিষ",
      financialAstrologyDesc: "সম্পদ সময় পূর্বাভাস",
      planetaryTracker: "গ্রহ ট্র্যাকার",
      planetaryTrackerDesc: "লাইভ গ্রহের অবস্থান এবং গোচর",
      personalizedHoroscope: "ব্যক্তিগতকৃত রাশিফল",
      personalizedHoroscopeDesc: "আপনার চার্টের উপর ভিত্তি করে AI-উৎপন্ন"
    },
    share: {
      generating: "ছবি তৈরি হচ্ছে...",
      download: "ডাউনলোড",
      copied: "কপি হয়েছে!",
      copyImage: "ছবি কপি করুন",
      share: "শেয়ার করুন",
      authenticVedicAstrology: "প্রামাণিক বৈদিক জ্যোতিষ",
      luckyNumber: "ভাগ্যবান সংখ্যা",
      luckyColor: "ভাগ্যবান রঙ"
    },
    dualZodiac: {
      title: "আপনার রাশিচক্র",
      subtitle: "বৈদিক (সায়ন) এবং পাশ্চাত্য (ক্রান্তীয়) উভয় পদ্ধতি",
      vedic: "বৈদিক",
      western: "পাশ্চাত্য",
      explanation: "বৈদিক প্রকৃত তারার অবস্থান ব্যবহার করে (সায়ন)। পাশ্চাত্য ঋতুগত অবস্থান ব্যবহার করে (ক্রান্তীয়)। ~24° পার্থক্যকে অয়নাংশ বলা হয়।"
    },
    planetaryTracker: {
      badge: "লাইভ মহাজাগতিক আপডেট",
      title: "রিয়েল-টাইম গ্রহ ট্র্যাকার",
      subtitle: "লাইভ গ্রহের অবস্থান, আসন্ন গোচর এবং মহাজাগতিক ঘটনা ট্র্যাক করুন।"
    },
    lifeTimeline: {
      badge: "দশা-ভিত্তিক ভবিষ্যদ্বাণী",
      title: "জীবন ঘটনা টাইমলাইন",
      subtitle: "বিমশোত্তরী দশা পদ্ধতির উপর ভিত্তি করে আপনার পূর্বাভাসিত জীবন ঘটনাগুলি আবিষ্কার করুন।"
    },
    personalizedHoroscope: {
      badge: "AI-চালিত ভবিষ্যদ্বাণী",
      title: "ব্যক্তিগতকৃত দৈনিক রাশিফল",
      subtitle: "আপনার সঠিক জন্ম কুণ্ডলীর উপর ভিত্তি করে আপনার দৈনিক রাশিফল পান।"
    },
    voiceAstrologer: {
      badge: "ভয়েস AI পরামর্শ",
      title: "ভয়েস AI জ্যোতিষী",
      subtitle: "আপনার পছন্দের ভাষায় আমাদের AI জ্যোতিষীর সাথে কথা বলুন।"
    },
    blockchainKundli: {
      badge: "যাচাইকৃত ও অপরিবর্তনীয়",
      title: "ব্লকচেইন কুণ্ডলী সার্টিফিকেট",
      subtitle: "IPFS-এ স্থায়ীভাবে সংরক্ষিত ক্রিপ্টোগ্রাফিকভাবে যাচাইকৃত কুণ্ডলী সার্টিফিকেট পান।"
    },
    habitTracker: {
      badge: "জ্যোতিষ-চালিত অভ্যাস",
      title: "কসমিক হ্যাবিট ট্র্যাকার",
      subtitle: "গ্রহের শক্তির সাথে সামঞ্জস্যপূর্ণ উন্নত অভ্যাস তৈরি করুন।"
    },
    financialAstrology: {
      badge: "সম্পদ ও সমৃদ্ধি",
      title: "আর্থিক জ্যোতিষ",
      subtitle: "আপনার বৈদিক জন্ম কুণ্ডলীর উপর ভিত্তি করে আপনার সম্পদ সম্ভাবনা আবিষ্কার করুন।"
    },
    aiChartInterpretation: {
      badge: "AI-চালিত বিশ্লেষণ",
      title: "AI চার্ট ব্যাখ্যা",
      subtitle: "আপনার বৈদিক জন্ম কুণ্ডলীর ব্যাপক AI-চালিত বিশ্লেষণ পান।"
    },
    aiAstrologerPro: {
      badge: "উন্নত AI",
      title: "AI জ্যোতিষী প্রো",
      subtitle: "আপনার জন্ম কুণ্ডলী দ্বারা চালিত ব্যক্তিগতকৃত জ্যোতিষ নির্দেশনা পান।"
    },
    home: {
      voiceAiBadge: "নতুন - ভয়েস AI ফিচার",
      voiceAiTitle: "আমাদের AI জ্যোতিষীর সাথে কথা বলুন",
      voiceAiDesc: "প্রাকৃতিক ভয়েস কথোপকথনের মাধ্যমে তাৎক্ষণিক বৈদিক জ্যোতিষ নির্দেশনা পান। আপনার জন্ম কুণ্ডলী, ক্যারিয়ার, সম্পর্ক এবং আরও অনেক কিছু সম্পর্কে জিজ্ঞাসা করুন!",
      tryVoiceAi: "এখনই ভয়েস AI চেষ্টা করুন",
      voiceAiFree: "প্রতিদিন ৫ মিনিট বিনামূল্যে"
    }
  },
  mr: {
    nav: {
      aiFeatures: "AI आणि प्रो",
      aiAstrologerPro: "AI ज्योतिषी प्रो",
      aiAstrologerProDesc: "जन्म कुंडलीसह संदर्भ-जागरूक AI",
      voiceAstrologer: "व्हॉइस AI ज्योतिषी",
      voiceAstrologerDesc: "आवाजाने AI ज्योतिषीशी बोला",
      aiChartInterpretation: "AI चार्ट व्याख्या",
      aiChartInterpretationDesc: "तुमच्या चार्टचे तपशीलवार AI विश्लेषण",
      habitTracker: "सवय ट्रॅकर",
      habitTrackerDesc: "ज्योतिष वेळेसह सवयी ट्रॅक करा",
      lifeTimeline: "जीवन टाइमलाइन",
      lifeTimelineDesc: "दशा आधारित अंदाजित घटना",
      blockchainKundli: "ब्लॉकचेन कुंडली",
      blockchainKundliDesc: "सत्यापित छेडछाड-प्रूफ प्रमाणपत्र",
      financialAstrology: "आर्थिक ज्योतिष",
      financialAstrologyDesc: "संपत्ती वेळ अंदाज",
      planetaryTracker: "ग्रह ट्रॅकर",
      planetaryTrackerDesc: "लाइव्ह ग्रह स्थिती आणि गोचर",
      personalizedHoroscope: "वैयक्तिकृत राशिभविष्य",
      personalizedHoroscopeDesc: "तुमच्या चार्टवर आधारित AI-निर्मित"
    },
    share: {
      generating: "प्रतिमा तयार करत आहे...",
      download: "डाउनलोड",
      copied: "कॉपी झाले!",
      copyImage: "प्रतिमा कॉपी करा",
      share: "शेअर करा",
      authenticVedicAstrology: "प्रामाणिक वैदिक ज्योतिष",
      luckyNumber: "भाग्यशाली अंक",
      luckyColor: "भाग्यशाली रंग"
    },
    dualZodiac: {
      title: "तुमच्या राशी",
      subtitle: "वैदिक (सायन) आणि पाश्चात्य (उष्णकटिबंधीय) दोन्ही प्रणाली",
      vedic: "वैदिक",
      western: "पाश्चात्य",
      explanation: "वैदिक वास्तविक तारा स्थिती वापरते (सायन). पाश्चात्य ऋतूनुसार स्थिती वापरते (उष्णकटिबंधीय). ~24° फरकाला अयनांश म्हणतात."
    },
    planetaryTracker: {
      badge: "लाइव्ह वैश्विक अपडेट्स",
      title: "रिअल-टाइम ग्रह ट्रॅकर",
      subtitle: "लाइव्ह ग्रह स्थिती, आगामी गोचर आणि वैश्विक घटनांचा मागोवा घ्या।"
    },
    lifeTimeline: {
      badge: "दशा-आधारित भविष्यवाण्या",
      title: "जीवन घटना टाइमलाइन",
      subtitle: "विमशोत्तरी दशा प्रणालीवर आधारित तुमच्या अंदाजित जीवन घटना शोधा।"
    },
    personalizedHoroscope: {
      badge: "AI-चालित भविष्यवाण्या",
      title: "वैयक्तिकृत दैनिक राशिभविष्य",
      subtitle: "तुमच्या अचूक जन्म कुंडलीवर आधारित तुमचे दैनिक राशिभविष्य मिळवा।"
    },
    voiceAstrologer: {
      badge: "व्हॉइस AI सल्लामसलत",
      title: "व्हॉइस AI ज्योतिषी",
      subtitle: "तुमच्या आवडत्या भाषेत आमच्या AI ज्योतिषीशी बोला।"
    },
    blockchainKundli: {
      badge: "सत्यापित आणि अपरिवर्तनीय",
      title: "ब्लॉकचेन कुंडली प्रमाणपत्र",
      subtitle: "IPFS वर कायमस्वरूपी संग्रहित क्रिप्टोग्राफिकरित्या सत्यापित कुंडली प्रमाणपत्र मिळवा।"
    },
    habitTracker: {
      badge: "ज्योतिष-चालित सवयी",
      title: "कॉस्मिक हॅबिट ट्रॅकर",
      subtitle: "ग्रहांच्या ऊर्जेशी जुळवून घेतलेल्या चांगल्या सवयी तयार करा।"
    },
    financialAstrology: {
      badge: "संपत्ती आणि समृद्धी",
      title: "आर्थिक ज्योतिष",
      subtitle: "तुमच्या वैदिक जन्म कुंडलीवर आधारित तुमची संपत्ती क्षमता शोधा।"
    },
    aiChartInterpretation: {
      badge: "AI-चालित विश्लेषण",
      title: "AI चार्ट व्याख्या",
      subtitle: "तुमच्या वैदिक जन्म कुंडलीचे सर्वसमावेशक AI-चालित विश्लेषण मिळवा।"
    },
    aiAstrologerPro: {
      badge: "वर्धित AI",
      title: "AI ज्योतिषी प्रो",
      subtitle: "तुमच्या जन्म कुंडलीद्वारे चालित वैयक्तिकृत ज्योतिषीय मार्गदर्शन मिळवा।"
    },
    home: {
      voiceAiBadge: "नवीन - व्हॉइस AI वैशिष्ट्य",
      voiceAiTitle: "आमच्या AI ज्योतिषीशी बोला",
      voiceAiDesc: "नैसर्गिक आवाज संभाषणाद्वारे त्वरित वैदिक ज्योतिष मार्गदर्शन मिळवा. तुमची जन्म कुंडली, करिअर, नातेसंबंध आणि बरेच काही विचारा!",
      tryVoiceAi: "आता व्हॉइस AI वापरून पहा",
      voiceAiFree: "दररोज 5 मोफत मिनिटे"
    }
  },
  gu: {
    nav: {
      aiFeatures: "AI અને પ્રો",
      aiAstrologerPro: "AI જ્યોતિષી પ્રો",
      aiAstrologerProDesc: "જન્મ કુંડળી સાથે સંદર્ભ-જાગૃત AI",
      voiceAstrologer: "વૉઇસ AI જ્યોતિષી",
      voiceAstrologerDesc: "અવાજ દ્વારા AI જ્યોતિષી સાથે વાત કરો",
      aiChartInterpretation: "AI ચાર્ટ અર્થઘટન",
      aiChartInterpretationDesc: "તમારા ચાર્ટનું વિગતવાર AI વિશ્લેષણ",
      habitTracker: "આદત ટ્રેકર",
      habitTrackerDesc: "જ્યોતિષ સમય સાથે આદતો ટ્રેક કરો",
      lifeTimeline: "જીવન સમયરેખા",
      lifeTimelineDesc: "દશા આધારિત અનુમાનિત ઘટનાઓ",
      blockchainKundli: "બ્લોકચેન કુંડળી",
      blockchainKundliDesc: "ચકાસાયેલ છેડછાડ-પ્રૂફ પ્રમાણપત્ર",
      financialAstrology: "નાણાકીય જ્યોતિષ",
      financialAstrologyDesc: "સંપત્તિ સમય આગાહીઓ",
      planetaryTracker: "ગ્રહ ટ્રેકર",
      planetaryTrackerDesc: "લાઇવ ગ્રહ સ્થિતિઓ અને ગોચર",
      personalizedHoroscope: "વ્યક્તિગત રાશિફળ",
      personalizedHoroscopeDesc: "તમારા ચાર્ટ પર આધારિત AI-જનરેટેડ"
    },
    share: {
      generating: "છબી બનાવી રહ્યા છીએ...",
      download: "ડાઉનલોડ",
      copied: "કૉપિ થઈ ગયું!",
      copyImage: "છબી કૉપિ કરો",
      share: "શેર કરો",
      authenticVedicAstrology: "પ્રામાણિક વૈદિક જ્યોતિષ",
      luckyNumber: "ભાગ્યશાળી અંક",
      luckyColor: "ભાગ્યશાળી રંગ"
    },
    dualZodiac: {
      title: "તમારી રાશિઓ",
      subtitle: "વૈદિક (સાયન) અને પશ્ચિમી (ઉષ્ણકટિબંધીય) બંને પ્રણાલીઓ",
      vedic: "વૈદિક",
      western: "પશ્ચિમી",
      explanation: "વૈદિક વાસ્તવિક તારાની સ્થિતિઓનો ઉપયોગ કરે છે (સાયન). પશ્ચિમી ઋતુ આધારિત સ્થિતિઓનો ઉપયોગ કરે છે (ઉષ્ણકટિબંધીય). ~24° તફાવતને અયનાંશ કહેવાય છે."
    },
    planetaryTracker: {
      badge: "લાઇવ કોસ્મિક અપડેટ્સ",
      title: "રીઅલ-ટાઇમ ગ્રહ ટ્રેકર",
      subtitle: "લાઇવ ગ્રહ સ્થિતિઓ, આગામી ગોચર અને કોસ્મિક ઘટનાઓને ટ્રેક કરો।"
    },
    lifeTimeline: {
      badge: "દશા-આધારિત આગાહીઓ",
      title: "જીવન ઘટના સમયરેખા",
      subtitle: "વિમશોત્તરી દશા પ્રણાલી પર આધારિત તમારી અનુમાનિત જીવન ઘટનાઓ શોધો।"
    },
    personalizedHoroscope: {
      badge: "AI-સંચાલિત આગાહીઓ",
      title: "વ્યક્તિગત દૈનિક રાશિફળ",
      subtitle: "તમારી ચોક્કસ જન્મ કુંડળી પર આધારિત તમારું દૈનિક રાશિફળ મેળવો।"
    },
    voiceAstrologer: {
      badge: "વૉઇસ AI પરામર્શ",
      title: "વૉઇસ AI જ્યોતિષી",
      subtitle: "તમારી પસંદગીની ભાષામાં અમારા AI જ્યોતિષી સાથે વાત કરો।"
    },
    blockchainKundli: {
      badge: "ચકાસાયેલ અને અપરિવર્તનીય",
      title: "બ્લોકચેન કુંડળી પ્રમાણપત્ર",
      subtitle: "IPFS પર કાયમી રીતે સંગ્રહિત ક્રિપ્ટોગ્રાફિક રીતે ચકાસાયેલ કુંડળી પ્રમાણપત્ર મેળવો।"
    },
    habitTracker: {
      badge: "જ્યોતિષ-સંચાલિત આદતો",
      title: "કોસ્મિક હેબિટ ટ્રેકર",
      subtitle: "ગ્રહોની ઊર્જાઓ સાથે સંરેખિત સારી આદતો બનાવો।"
    },
    financialAstrology: {
      badge: "સંપત્તિ અને સમૃદ્ધિ",
      title: "નાણાકીય જ્યોતિષ",
      subtitle: "તમારી વૈદિક જન્મ કુંડળી પર આધારિત તમારી સંપત્તિ ક્ષમતા શોધો।"
    },
    aiChartInterpretation: {
      badge: "AI-સંચાલિત વિશ્લેષણ",
      title: "AI ચાર્ટ અર્થઘટન",
      subtitle: "તમારી વૈદિક જન્મ કુંડળીનું વ્યાપક AI-સંચાલિત વિશ્લેષણ મેળવો।"
    },
    aiAstrologerPro: {
      badge: "ઉન્નત AI",
      title: "AI જ્યોતિષી પ્રો",
      subtitle: "તમારી જન્મ કુંડળી દ્વારા સંચાલિત વ્યક્તિગત જ્યોતિષીય માર્ગદર્શન મેળવો।"
    },
    home: {
      voiceAiBadge: "નવું - વૉઇસ AI ફીચર",
      voiceAiTitle: "અમારા AI જ્યોતિષી સાથે વાત કરો",
      voiceAiDesc: "કુદરતી અવાજ વાર્તાલાપ દ્વારા તાત્કાલિક વૈદિક જ્યોતિષ માર્ગદર્શન મેળવો. તમારી જન્મ કુંડળી, કારકિર્દી, સંબંધો અને વધુ વિશે પૂછો!",
      tryVoiceAi: "હવે વૉઇસ AI અજમાવો",
      voiceAiFree: "દરરોજ 5 મફત મિનિટ"
    }
  },
  kn: {
    nav: {
      aiFeatures: "AI ಮತ್ತು ಪ್ರೊ",
      aiAstrologerPro: "AI ಜ್ಯೋತಿಷಿ ಪ್ರೊ",
      aiAstrologerProDesc: "ಜನ್ಮ ಕುಂಡಲಿಯೊಂದಿಗೆ ಸಂದರ್ಭ-ಅರಿವಿನ AI",
      voiceAstrologer: "ವಾಯ್ಸ್ AI ಜ್ಯೋತಿಷಿ",
      voiceAstrologerDesc: "ಧ್ವನಿಯ ಮೂಲಕ AI ಜ್ಯೋತಿಷಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ",
      aiChartInterpretation: "AI ಚಾರ್ಟ್ ವ್ಯಾಖ್ಯಾನ",
      aiChartInterpretationDesc: "ನಿಮ್ಮ ಚಾರ್ಟ್‌ನ ವಿವರವಾದ AI ವಿಶ್ಲೇಷಣೆ",
      habitTracker: "ಅಭ್ಯಾಸ ಟ್ರ್ಯಾಕರ್",
      habitTrackerDesc: "ಜ್ಯೋತಿಷ್ಯ ಸಮಯದೊಂದಿಗೆ ಅಭ್ಯಾಸಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
      lifeTimeline: "ಜೀವನ ಟೈಮ್‌ಲೈನ್",
      lifeTimelineDesc: "ದಶಾ ಆಧಾರಿತ ಊಹಿಸಿದ ಘಟನೆಗಳು",
      blockchainKundli: "ಬ್ಲಾಕ್‌ಚೈನ್ ಕುಂಡಲಿ",
      blockchainKundliDesc: "ಪರಿಶೀಲಿಸಿದ ಟ್ಯಾಂಪರ್-ಪ್ರೂಫ್ ಪ್ರಮಾಣಪತ್ರ",
      financialAstrology: "ಆರ್ಥಿಕ ಜ್ಯೋತಿಷ್ಯ",
      financialAstrologyDesc: "ಸಂಪತ್ತು ಸಮಯ ಭವಿಷ್ಯವಾಣಿಗಳು",
      planetaryTracker: "ಗ್ರಹ ಟ್ರ್ಯಾಕರ್",
      planetaryTrackerDesc: "ಲೈವ್ ಗ್ರಹ ಸ್ಥಾನಗಳು ಮತ್ತು ಗೋಚಾರಗಳು",
      personalizedHoroscope: "ವೈಯಕ್ತಿಕ ರಾಶಿಫಲ",
      personalizedHoroscopeDesc: "ನಿಮ್ಮ ಚಾರ್ಟ್ ಆಧಾರದ ಮೇಲೆ AI-ರಚಿತ"
    },
    share: {
      generating: "ಚಿತ್ರ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
      download: "ಡೌನ್‌ಲೋಡ್",
      copied: "ನಕಲಿಸಲಾಗಿದೆ!",
      copyImage: "ಚಿತ್ರವನ್ನು ನಕಲಿಸಿ",
      share: "ಹಂಚಿಕೊಳ್ಳಿ",
      authenticVedicAstrology: "ಅಧಿಕೃತ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ",
      luckyNumber: "ಅದೃಷ್ಟ ಸಂಖ್ಯೆ",
      luckyColor: "ಅದೃಷ್ಟ ಬಣ್ಣ"
    },
    dualZodiac: {
      title: "ನಿಮ್ಮ ರಾಶಿಗಳು",
      subtitle: "ವೈದಿಕ (ಸಾಯನ) ಮತ್ತು ಪಾಶ್ಚಾತ್ಯ (ಉಷ್ಣವಲಯ) ಎರಡೂ ವ್ಯವಸ್ಥೆಗಳು",
      vedic: "ವೈದಿಕ",
      western: "ಪಾಶ್ಚಾತ್ಯ",
      explanation: "ವೈದಿಕ ನಿಜವಾದ ನಕ್ಷತ್ರ ಸ್ಥಾನಗಳನ್ನು ಬಳಸುತ್ತದೆ (ಸಾಯನ). ಪಾಶ್ಚಾತ್ಯ ಋತುಮಾನದ ಸ್ಥಾನಗಳನ್ನು ಬಳಸುತ್ತದೆ (ಉಷ್ಣವಲಯ). ~24° ವ್ಯತ್ಯಾಸವನ್ನು ಅಯನಾಂಶ ಎಂದು ಕರೆಯಲಾಗುತ್ತದೆ."
    },
    planetaryTracker: {
      badge: "ಲೈವ್ ಕಾಸ್ಮಿಕ್ ನವೀಕರಣಗಳು",
      title: "ರಿಯಲ್-ಟೈಮ್ ಗ್ರಹ ಟ್ರ್ಯಾಕರ್",
      subtitle: "ಲೈವ್ ಗ್ರಹ ಸ್ಥಾನಗಳು, ಮುಂಬರುವ ಗೋಚಾರಗಳು ಮತ್ತು ಕಾಸ್ಮಿಕ್ ಘಟನೆಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ।"
    },
    lifeTimeline: {
      badge: "ದಶಾ-ಆಧಾರಿತ ಭವಿಷ್ಯವಾಣಿಗಳು",
      title: "ಜೀವನ ಘಟನೆ ಟೈಮ್‌ಲೈನ್",
      subtitle: "ವಿಮ್ಶೋತ್ತರಿ ದಶಾ ವ್ಯವಸ್ಥೆಯ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಊಹಿಸಿದ ಜೀವನ ಘಟನೆಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ।"
    },
    personalizedHoroscope: {
      badge: "AI-ಚಾಲಿತ ಭವಿಷ್ಯವಾಣಿಗಳು",
      title: "ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ದೈನಂದಿನ ರಾಶಿಫಲ",
      subtitle: "ನಿಮ್ಮ ನಿಖರವಾದ ಜನ್ಮ ಕುಂಡಲಿಯ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ದೈನಂದಿನ ರಾಶಿಫಲವನ್ನು ಪಡೆಯಿರಿ।"
    },
    voiceAstrologer: {
      badge: "ವಾಯ್ಸ್ AI ಸಮಾಲೋಚನೆ",
      title: "ವಾಯ್ಸ್ AI ಜ್ಯೋತಿಷಿ",
      subtitle: "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯಲ್ಲಿ ನಮ್ಮ AI ಜ್ಯೋತಿಷಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ।"
    },
    blockchainKundli: {
      badge: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಮತ್ತು ಬದಲಾಯಿಸಲಾಗದ",
      title: "ಬ್ಲಾಕ್‌ಚೈನ್ ಕುಂಡಲಿ ಪ್ರಮಾಣಪತ್ರ",
      subtitle: "IPFS ನಲ್ಲಿ ಶಾಶ್ವತವಾಗಿ ಸಂಗ್ರಹಿಸಲಾದ ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಆಗಿ ಪರಿಶೀಲಿಸಿದ ಕುಂಡಲಿ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಪಡೆಯಿರಿ।"
    },
    habitTracker: {
      badge: "ಜ್ಯೋತಿಷ್ಯ-ಚಾಲಿತ ಅಭ್ಯಾಸಗಳು",
      title: "ಕಾಸ್ಮಿಕ್ ಹ್ಯಾಬಿಟ್ ಟ್ರ್ಯಾಕರ್",
      subtitle: "ಗ್ರಹಗಳ ಶಕ್ತಿಗಳೊಂದಿಗೆ ಹೊಂದಿಕೊಂಡ ಉತ್ತಮ ಅಭ್ಯಾಸಗಳನ್ನು ನಿರ್ಮಿಸಿ।"
    },
    financialAstrology: {
      badge: "ಸಂಪತ್ತು ಮತ್ತು ಸಮೃದ್ಧಿ",
      title: "ಆರ್ಥಿಕ ಜ್ಯೋತಿಷ್ಯ",
      subtitle: "ನಿಮ್ಮ ವೈದಿಕ ಜನ್ಮ ಕುಂಡಲಿಯ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಸಂಪತ್ತಿನ ಸಾಮರ್ಥ್ಯವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ।"
    },
    aiChartInterpretation: {
      badge: "AI-ಚಾಲಿತ ವಿಶ್ಲೇಷಣೆ",
      title: "AI ಚಾರ್ಟ್ ವ್ಯಾಖ್ಯಾನ",
      subtitle: "ನಿಮ್ಮ ವೈದಿಕ ಜನ್ಮ ಕುಂಡಲಿಯ ಸಮಗ್ರ AI-ಚಾಲಿತ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಪಡೆಯಿರಿ।"
    },
    aiAstrologerPro: {
      badge: "ವರ್ಧಿತ AI",
      title: "AI ಜ್ಯೋತಿಷಿ ಪ್ರೊ",
      subtitle: "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಿಂದ ಚಾಲಿತವಾದ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನವನ್ನು ಪಡೆಯಿರಿ।"
    },
    home: {
      voiceAiBadge: "ಹೊಸದು - ವಾಯ್ಸ್ AI ವೈಶಿಷ್ಟ್ಯ",
      voiceAiTitle: "ನಮ್ಮ AI ಜ್ಯೋತಿಷಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ",
      voiceAiDesc: "ನೈಸರ್ಗಿಕ ಧ್ವನಿ ಸಂಭಾಷಣೆಯ ಮೂಲಕ ತಕ್ಷಣದ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ. ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ವೃತ್ತಿ, ಸಂಬಂಧಗಳು ಮತ್ತು ಹೆಚ್ಚಿನವುಗಳ ಬಗ್ಗೆ ಕೇಳಿ!",
      tryVoiceAi: "ಈಗ ವಾಯ್ಸ್ AI ಪ್ರಯತ್ನಿಸಿ",
      voiceAiFree: "ಪ್ರತಿದಿನ 5 ಉಚಿತ ನಿಮಿಷಗಳು"
    }
  },
  ml: {
    nav: {
      aiFeatures: "AI & പ്രോ",
      aiAstrologerPro: "AI ജ്യോതിഷി പ്രോ",
      aiAstrologerProDesc: "ജനന കുണ്ഡലിയുമായി സന്ദർഭ-ബോധമുള്ള AI",
      voiceAstrologer: "വോയ്സ് AI ജ്യോതിഷി",
      voiceAstrologerDesc: "ശബ്ദത്തിലൂടെ AI ജ്യോതിഷിയുമായി സംസാരിക്കുക",
      aiChartInterpretation: "AI ചാർട്ട് വ്യാഖ്യാനം",
      aiChartInterpretationDesc: "നിങ്ങളുടെ ചാർട്ടിന്റെ വിശദമായ AI വിശകലനം",
      habitTracker: "ശീല ട്രാക്കർ",
      habitTrackerDesc: "ജ്യോതിഷ സമയത്തോടെ ശീലങ്ങൾ ട്രാക്ക് ചെയ്യുക",
      lifeTimeline: "ജീവിത ടൈംലൈൻ",
      lifeTimelineDesc: "ദശ അടിസ്ഥാനമാക്കിയ പ്രവചിച്ച സംഭവങ്ങൾ",
      blockchainKundli: "ബ്ലോക്ക്ചെയിൻ കുണ്ഡലി",
      blockchainKundliDesc: "പരിശോധിച്ച ടാമ്പർ-പ്രൂഫ് സർട്ടിഫിക്കറ്റ്",
      financialAstrology: "സാമ്പത്തിക ജ്യോതിഷം",
      financialAstrologyDesc: "സമ്പത്ത് സമയ പ്രവചനങ്ങൾ",
      planetaryTracker: "ഗ്രഹ ട്രാക്കർ",
      planetaryTrackerDesc: "ലൈവ് ഗ്രഹ സ്ഥാനങ്ങളും ഗോചരങ്ങളും",
      personalizedHoroscope: "വ്യക്തിഗതമാക്കിയ രാശിഫലം",
      personalizedHoroscopeDesc: "നിങ്ങളുടെ ചാർട്ടിനെ അടിസ്ഥാനമാക്കി AI-ജനറേറ്റഡ്"
    },
    share: {
      generating: "ചിത്രം സൃഷ്ടിക്കുന്നു...",
      download: "ഡൗൺലോഡ്",
      copied: "പകർത്തി!",
      copyImage: "ചിത്രം പകർത്തുക",
      share: "പങ്കിടുക",
      authenticVedicAstrology: "ആധികാരിക വേദ ജ്യോതിഷം",
      luckyNumber: "ഭാഗ്യ സംഖ്യ",
      luckyColor: "ഭാഗ്യ നിറം"
    },
    dualZodiac: {
      title: "നിങ്ങളുടെ രാശികൾ",
      subtitle: "വേദ (സായന) പാശ്ചാത്യ (ഉഷ്ണമേഖല) രണ്ട് സിസ്റ്റങ്ങളും",
      vedic: "വേദ",
      western: "പാശ്ചാത്യ",
      explanation: "വേദ യഥാർത്ഥ നക്ഷത്ര സ്ഥാനങ്ങൾ ഉപയോഗിക്കുന്നു (സായന). പാശ്ചാത്യ ഋതുപരമായ സ്ഥാനങ്ങൾ ഉപയോഗിക്കുന്നു (ഉഷ്ണമേഖല). ~24° വ്യത്യാസത്തെ അയനാംശം എന്ന് വിളിക്കുന്നു."
    },
    planetaryTracker: {
      badge: "ലൈവ് കോസ്മിക് അപ്‌ഡേറ്റുകൾ",
      title: "റിയൽ-ടൈം ഗ്രഹ ട്രാക്കർ",
      subtitle: "ലൈവ് ഗ്രഹ സ്ഥാനങ്ങൾ, വരാനിരിക്കുന്ന ഗോചരങ്ങൾ, കോസ്മിക് ഇവന്റുകൾ എന്നിവ ട്രാക്ക് ചെയ്യുക।"
    },
    lifeTimeline: {
      badge: "ദശ അടിസ്ഥാനമാക്കിയ പ്രവചനങ്ങൾ",
      title: "ജീവിത സംഭവ ടൈംലൈൻ",
      subtitle: "വിംശോത്തരി ദശ സിസ്റ്റത്തെ അടിസ്ഥാനമാക്കി നിങ്ങളുടെ പ്രവചിച്ച ജീവിത സംഭവങ്ങൾ കണ്ടെത്തുക।"
    },
    personalizedHoroscope: {
      badge: "AI-പവർഡ് പ്രവചനങ്ങൾ",
      title: "വ്യക്തിഗതമാക്കിയ ദൈനംദിന ജാതകം",
      subtitle: "നിങ്ങളുടെ കൃത്യമായ ജനന ചാർട്ടിനെ അടിസ്ഥാനമാക്കി നിങ്ങളുടെ ദൈനംദിന ജാതകം നേടുക।"
    },
    voiceAstrologer: {
      badge: "വോയ്‌സ് AI കൺസൾട്ടേഷൻ",
      title: "വോയ്‌സ് AI ജ്യോതിഷി",
      subtitle: "നിങ്ങളുടെ ഇഷ്ടപ്പെട്ട ഭാഷയിൽ ഞങ്ങളുടെ AI ജ്യോതിഷിയോട് സംസാരിക്കുക।"
    },
    blockchainKundli: {
      badge: "പരിശോധിച്ചതും മാറ്റമില്ലാത്തതും",
      title: "ബ്ലോക്ക്‌ചെയിൻ കുണ്ഡലി സർട്ടിഫിക്കറ്റ്",
      subtitle: "IPFS-ൽ ശാശ്വതമായി സംഭരിച്ച ക്രിപ്‌റ്റോഗ്രാഫിക്കായി പരിശോധിച്ച കുണ്ഡലി സർട്ടിഫിക്കറ്റ് നേടുക।"
    },
    habitTracker: {
      badge: "ജ്യോതിഷ-പവർഡ് ശീലങ്ങൾ",
      title: "കോസ്മിക് ഹാബിറ്റ് ട്രാക്കർ",
      subtitle: "ഗ്രഹ ഊർജ്ജങ്ങളുമായി യോജിച്ച മികച്ച ശീലങ്ങൾ നിർമ്മിക്കുക।"
    },
    financialAstrology: {
      badge: "സമ്പത്തും സമൃദ്ധിയും",
      title: "സാമ്പത്തിക ജ്യോതിഷം",
      subtitle: "നിങ്ങളുടെ വേദ ജനന ചാർട്ടിനെ അടിസ്ഥാനമാക്കി നിങ്ങളുടെ സമ്പത്ത് സാധ്യത കണ്ടെത്തുക।"
    },
    aiChartInterpretation: {
      badge: "AI-പവർഡ് വിശകലനം",
      title: "AI ചാർട്ട് വ്യാഖ്യാനം",
      subtitle: "നിങ്ങളുടെ വേദ ജനന ചാർട്ടിന്റെ സമഗ്രമായ AI-പവർഡ് വിശകലനം നേടുക।"
    },
    aiAstrologerPro: {
      badge: "മെച്ചപ്പെടുത്തിയ AI",
      title: "AI ജ്യോതിഷി പ്രോ",
      subtitle: "നിങ്ങളുടെ ജനന ചാർട്ട് ഉപയോഗിച്ച് പവർ ചെയ്ത വ്യക്തിഗതമാക്കിയ ജ്യോതിഷ മാർഗ്ഗനിർദ്ദേശം നേടുക।"
    },
    home: {
      voiceAiBadge: "പുതിയത് - വോയ്സ് AI ഫീച്ചർ",
      voiceAiTitle: "ഞങ്ങളുടെ AI ജ്യോതിഷിയോട് സംസാരിക്കുക",
      voiceAiDesc: "സ്വാഭാവിക ശബ്ദ സംഭാഷണത്തിലൂടെ തൽക്ഷണ വേദ ജ്യോതിഷ മാർഗ്ഗനിർദ്ദേശം നേടുക. നിങ്ങളുടെ ജനന ചാർട്ട്, കരിയർ, ബന്ധങ്ങൾ എന്നിവയെക്കുറിച്ചും മറ്റും ചോദിക്കുക!",
      tryVoiceAi: "ഇപ്പോൾ വോയ്സ് AI പരീക്ഷിക്കുക",
      voiceAiFree: "ദിവസവും 5 സൗജന്യ മിനിറ്റ്"
    }
  },
  pa: {
    nav: {
      aiFeatures: "AI ਅਤੇ ਪ੍ਰੋ",
      aiAstrologerPro: "AI ਜੋਤਿਸ਼ੀ ਪ੍ਰੋ",
      aiAstrologerProDesc: "ਜਨਮ ਕੁੰਡਲੀ ਨਾਲ ਸੰਦਰਭ-ਜਾਗਰੂਕ AI",
      voiceAstrologer: "ਵੌਇਸ AI ਜੋਤਿਸ਼ੀ",
      voiceAstrologerDesc: "ਆਵਾਜ਼ ਰਾਹੀਂ AI ਜੋਤਿਸ਼ੀ ਨਾਲ ਗੱਲ ਕਰੋ",
      aiChartInterpretation: "AI ਚਾਰਟ ਵਿਆਖਿਆ",
      aiChartInterpretationDesc: "ਤੁਹਾਡੇ ਚਾਰਟ ਦਾ ਵਿਸਤ੍ਰਿਤ AI ਵਿਸ਼ਲੇਸ਼ਣ",
      habitTracker: "ਆਦਤ ਟ੍ਰੈਕਰ",
      habitTrackerDesc: "ਜੋਤਿਸ਼ ਸਮੇਂ ਨਾਲ ਆਦਤਾਂ ਟ੍ਰੈਕ ਕਰੋ",
      lifeTimeline: "ਜੀਵਨ ਟਾਈਮਲਾਈਨ",
      lifeTimelineDesc: "ਦਸ਼ਾ ਅਧਾਰਿਤ ਅਨੁਮਾਨਿਤ ਘਟਨਾਵਾਂ",
      blockchainKundli: "ਬਲਾਕਚੇਨ ਕੁੰਡਲੀ",
      blockchainKundliDesc: "ਪ੍ਰਮਾਣਿਤ ਛੇੜਛਾੜ-ਪ੍ਰੂਫ ਸਰਟੀਫਿਕੇਟ",
      financialAstrology: "ਵਿੱਤੀ ਜੋਤਿਸ਼",
      financialAstrologyDesc: "ਦੌਲਤ ਸਮੇਂ ਦੀਆਂ ਭਵਿੱਖਬਾਣੀਆਂ",
      planetaryTracker: "ਗ੍ਰਹਿ ਟ੍ਰੈਕਰ",
      planetaryTrackerDesc: "ਲਾਈਵ ਗ੍ਰਹਿ ਸਥਿਤੀਆਂ ਅਤੇ ਗੋਚਰ",
      personalizedHoroscope: "ਵਿਅਕਤੀਗਤ ਰਾਸ਼ੀਫਲ",
      personalizedHoroscopeDesc: "ਤੁਹਾਡੇ ਚਾਰਟ ਦੇ ਅਧਾਰ ਤੇ AI-ਜਨਰੇਟਿਡ"
    },
    share: {
      generating: "ਤਸਵੀਰ ਬਣਾ ਰਿਹਾ ਹੈ...",
      download: "ਡਾਊਨਲੋਡ",
      copied: "ਕਾਪੀ ਹੋ ਗਿਆ!",
      copyImage: "ਤਸਵੀਰ ਕਾਪੀ ਕਰੋ",
      share: "ਸਾਂਝਾ ਕਰੋ",
      authenticVedicAstrology: "ਪ੍ਰਮਾਣਿਕ ਵੈਦਿਕ ਜੋਤਿਸ਼",
      luckyNumber: "ਭਾਗਸ਼ਾਲੀ ਅੰਕ",
      luckyColor: "ਭਾਗਸ਼ਾਲੀ ਰੰਗ"
    },
    dualZodiac: {
      title: "ਤੁਹਾਡੀਆਂ ਰਾਸ਼ੀਆਂ",
      subtitle: "ਵੈਦਿਕ (ਸਾਯਨ) ਅਤੇ ਪੱਛਮੀ (ਉਸ਼ਣਕਟਿਬੰਧੀ) ਦੋਵੇਂ ਪ੍ਰਣਾਲੀਆਂ",
      vedic: "ਵੈਦਿਕ",
      western: "ਪੱਛਮੀ",
      explanation: "ਵੈਦਿਕ ਅਸਲ ਤਾਰਿਆਂ ਦੀਆਂ ਸਥਿਤੀਆਂ ਵਰਤਦਾ ਹੈ (ਸਾਯਨ)। ਪੱਛਮੀ ਮੌਸਮੀ ਸਥਿਤੀਆਂ ਵਰਤਦਾ ਹੈ (ਉਸ਼ਣਕਟਿਬੰਧੀ)। ~24° ਫਰਕ ਨੂੰ ਅਯਨਾਂਸ਼ ਕਿਹਾ ਜਾਂਦਾ ਹੈ।"
    },
    planetaryTracker: {
      badge: "ਲਾਈਵ ਬ੍ਰਹਿਮੰਡੀ ਅੱਪਡੇਟ",
      title: "ਰੀਅਲ-ਟਾਈਮ ਗ੍ਰਹਿ ਟ੍ਰੈਕਰ",
      subtitle: "ਲਾਈਵ ਗ੍ਰਹਿ ਸਥਿਤੀਆਂ, ਆਉਣ ਵਾਲੇ ਗੋਚਰ ਅਤੇ ਬ੍ਰਹਿਮੰਡੀ ਘਟਨਾਵਾਂ ਨੂੰ ਟ੍ਰੈਕ ਕਰੋ।"
    },
    lifeTimeline: {
      badge: "ਦਸ਼ਾ-ਅਧਾਰਿਤ ਭਵਿੱਖਬਾਣੀਆਂ",
      title: "ਜੀਵਨ ਘਟਨਾ ਟਾਈਮਲਾਈਨ",
      subtitle: "ਵਿਮਸ਼ੋਤਰੀ ਦਸ਼ਾ ਪ੍ਰਣਾਲੀ ਦੇ ਅਧਾਰ ਤੇ ਆਪਣੀਆਂ ਅਨੁਮਾਨਿਤ ਜੀਵਨ ਘਟਨਾਵਾਂ ਖੋਜੋ।"
    },
    personalizedHoroscope: {
      badge: "AI-ਸੰਚਾਲਿਤ ਭਵਿੱਖਬਾਣੀਆਂ",
      title: "ਵਿਅਕਤੀਗਤ ਰੋਜ਼ਾਨਾ ਰਾਸ਼ੀਫਲ",
      subtitle: "ਆਪਣੀ ਸਹੀ ਜਨਮ ਕੁੰਡਲੀ ਦੇ ਅਧਾਰ ਤੇ ਆਪਣਾ ਰੋਜ਼ਾਨਾ ਰਾਸ਼ੀਫਲ ਪ੍ਰਾਪਤ ਕਰੋ।"
    },
    voiceAstrologer: {
      badge: "ਵੌਇਸ AI ਸਲਾਹ",
      title: "ਵੌਇਸ AI ਜੋਤਿਸ਼ੀ",
      subtitle: "ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਵਿੱਚ ਸਾਡੇ AI ਜੋਤਿਸ਼ੀ ਨਾਲ ਗੱਲ ਕਰੋ।"
    },
    blockchainKundli: {
      badge: "ਪ੍ਰਮਾਣਿਤ ਅਤੇ ਅਟੱਲ",
      title: "ਬਲਾਕਚੇਨ ਕੁੰਡਲੀ ਸਰਟੀਫਿਕੇਟ",
      subtitle: "IPFS ਤੇ ਸਥਾਈ ਤੌਰ ਤੇ ਸਟੋਰ ਕੀਤਾ ਕ੍ਰਿਪਟੋਗ੍ਰਾਫਿਕ ਤੌਰ ਤੇ ਪ੍ਰਮਾਣਿਤ ਕੁੰਡਲੀ ਸਰਟੀਫਿਕੇਟ ਪ੍ਰਾਪਤ ਕਰੋ।"
    },
    habitTracker: {
      badge: "ਜੋਤਿਸ਼-ਸੰਚਾਲਿਤ ਆਦਤਾਂ",
      title: "ਕੌਸਮਿਕ ਹੈਬਿਟ ਟ੍ਰੈਕਰ",
      subtitle: "ਗ੍ਰਹਿਆਂ ਦੀਆਂ ਊਰਜਾਵਾਂ ਨਾਲ ਮੇਲ ਖਾਂਦੀਆਂ ਬਿਹਤਰ ਆਦਤਾਂ ਬਣਾਓ।"
    },
    financialAstrology: {
      badge: "ਦੌਲਤ ਅਤੇ ਖੁਸ਼ਹਾਲੀ",
      title: "ਵਿੱਤੀ ਜੋਤਿਸ਼",
      subtitle: "ਆਪਣੀ ਵੈਦਿਕ ਜਨਮ ਕੁੰਡਲੀ ਦੇ ਅਧਾਰ ਤੇ ਆਪਣੀ ਦੌਲਤ ਸਮਰੱਥਾ ਖੋਜੋ।"
    },
    aiChartInterpretation: {
      badge: "AI-ਸੰਚਾਲਿਤ ਵਿਸ਼ਲੇਸ਼ਣ",
      title: "AI ਚਾਰਟ ਵਿਆਖਿਆ",
      subtitle: "ਆਪਣੀ ਵੈਦਿਕ ਜਨਮ ਕੁੰਡਲੀ ਦਾ ਵਿਆਪਕ AI-ਸੰਚਾਲਿਤ ਵਿਸ਼ਲੇਸ਼ਣ ਪ੍ਰਾਪਤ ਕਰੋ।"
    },
    aiAstrologerPro: {
      badge: "ਵਧੀਆ AI",
      title: "AI ਜੋਤਿਸ਼ੀ ਪ੍ਰੋ",
      subtitle: "ਆਪਣੀ ਜਨਮ ਕੁੰਡਲੀ ਦੁਆਰਾ ਸੰਚਾਲਿਤ ਵਿਅਕਤੀਗਤ ਜੋਤਿਸ਼ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਾਪਤ ਕਰੋ।"
    },
    home: {
      voiceAiBadge: "ਨਵਾਂ - ਵੌਇਸ AI ਫੀਚਰ",
      voiceAiTitle: "ਸਾਡੇ AI ਜੋਤਿਸ਼ੀ ਨਾਲ ਗੱਲ ਕਰੋ",
      voiceAiDesc: "ਕੁਦਰਤੀ ਆਵਾਜ਼ ਗੱਲਬਾਤ ਰਾਹੀਂ ਤੁਰੰਤ ਵੈਦਿਕ ਜੋਤਿਸ਼ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਾਪਤ ਕਰੋ। ਆਪਣੀ ਜਨਮ ਕੁੰਡਲੀ, ਕੈਰੀਅਰ, ਰਿਸ਼ਤੇ ਅਤੇ ਹੋਰ ਬਾਰੇ ਪੁੱਛੋ!",
      tryVoiceAi: "ਹੁਣੇ ਵੌਇਸ AI ਅਜ਼ਮਾਓ",
      voiceAiFree: "ਰੋਜ਼ਾਨਾ 5 ਮੁਫ਼ਤ ਮਿੰਟ"
    }
  }
};

// Deep merge function to combine translation objects
export function deepMerge(target: TranslationObject, source: TranslationObject): TranslationObject {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (result[key] as TranslationObject) || {},
        source[key] as TranslationObject
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
