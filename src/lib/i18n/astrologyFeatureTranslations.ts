// Astrology Feature Translations for VedicStarAstro
// This file contains translations for Lal Kitab, Numerology, Tarot, Vastu, Chinese Astrology,
// KP System, Prashna Kundli, Baby Names, Gemstones, and Palmistry

import { Language } from "./translations";

type TranslationObject = Record<string, unknown>;

export const astrologyFeatureTranslations: Record<Language, TranslationObject> = {
  en: {
    // Lal Kitab
    lalKitab: {
      badge: "Lal Kitab",
      title: "Lal Kitab Kundli",
      subtitle: "Discover your destiny through the ancient wisdom of Lal Kitab with unique remedies and predictions.",
      enterDetails: "Enter Birth Details",
      enterDetailsDesc: "Generate your Lal Kitab chart",
      generating: "Generating...",
      generate: "Generate Lal Kitab Chart",
      chart: "Chart",
      debts: "Debts (Rinas)",
      predictions: "Predictions",
      remedies: "Remedies",
      chartTitle: "Lal Kitab Chart",
      chartDesc: "Your planetary positions in Lal Kitab format",
      house: "House",
      planet: "Planet",
      pakkaGhar: "Pakka Ghar",
      debtsTitle: "Karmic Debts (Rinas)",
      debtsDesc: "Debts from past lives affecting your current life",
      debtType: "Debt Type",
      severity: "Severity",
      indication: "Indication",
      remedy: "Remedy",
      predictionsTitle: "Lal Kitab Predictions",
      predictionsDesc: "Predictions based on your planetary positions",
      remediesTitle: "Lal Kitab Remedies",
      remediesDesc: "Simple and effective remedies for planetary afflictions",
      aboutTitle: "About Lal Kitab",
      aboutText1: "Lal Kitab is a set of five Urdu language books on Hindu astrology and palmistry, written in the 19th century. The books are based on the Samudrika Shastra.",
      aboutText2: "Unlike traditional Vedic astrology, Lal Kitab uses a fixed house system where Aries is always the first house. It emphasizes simple, affordable remedies.",
      aboutText3: "The system identifies eight types of karmic debts (Rinas) that affect one's life and provides specific remedies to mitigate their effects."
    },
    // Numerology
    numerology: {
      badge: "Numerology",
      title: "Numerology Calculator",
      subtitle: "Discover the hidden meaning of numbers in your life through Pythagorean numerology.",
      enterDetails: "Enter Your Details",
      enterDetailsDesc: "Calculate your numerology profile",
      fullName: "Full Name (as on birth certificate)",
      calculating: "Calculating...",
      calculate: "Calculate My Numbers",
      coreNumbers: "Core Numbers",
      characteristics: "Characteristics",
      lucky: "Lucky Attributes",
      compatibility: "Compatibility",
      lifePath: "Life Path Number",
      lifePathDesc: "Your life's purpose and journey",
      destiny: "Destiny Number",
      destinyDesc: "Your life's goals and achievements",
      soul: "Soul Urge Number",
      soulDesc: "Your inner desires and motivations",
      personality: "Personality Number",
      personalityDesc: "How others perceive you",
      maturity: "Maturity Number",
      maturityDesc: "Your true self emerging with age",
      personalYear: "Personal Year",
      personalYearDesc: "Theme of your current year",
      masterNumber: "Master Number",
      strengths: "Strengths",
      challenges: "Challenges",
      careers: "Ideal Careers",
      luckyNumbers: "Lucky Numbers",
      luckyColors: "Lucky Colors",
      luckyDays: "Lucky Days",
      compatibleWith: "Compatible With",
      aboutTitle: "About Numerology",
      aboutText1: "Numerology is the study of numbers and their influence on human life. The Pythagorean system assigns numerical values to letters.",
      aboutText2: "Your Life Path number is calculated from your birth date and reveals your life's purpose. Your Destiny number comes from your full name.",
      aboutText3: "Master Numbers (11, 22, 33) carry special significance and are not reduced to single digits."
    },
    // Tarot
    tarot: {
      badge: "Tarot Reading",
      title: "Tarot Card Reading",
      subtitle: "Discover insights about your life through the ancient wisdom of Tarot.",
      daily: "Daily",
      love: "Love",
      career: "Career",
      yesNo: "Yes/No",
      dailyTitle: "Daily Tarot Card",
      dailyDesc: "Draw a single card for guidance on your day ahead",
      loveTitle: "Love & Relationship Reading",
      loveDesc: "A three-card spread for insights into your love life",
      careerTitle: "Career & Finance Reading",
      careerDesc: "A three-card spread for career guidance",
      yesNoTitle: "Yes or No Reading",
      yesNoDesc: "Think of a yes/no question, then draw a card",
      reversed: "Reversed",
      reversedMeaning: "Reversed Meaning",
      uprightMeaning: "Upright Meaning",
      clickToDraw: "Click below to draw your daily card",
      thinkQuestion: "Think of your question...",
      drawing: "Drawing...",
      drawCard: "Draw Card",
      drawCards: "Draw Cards",
      drawAgain: "Draw Again",
      askAgain: "Ask Again",
      getAnswer: "Get Answer",
      confidence: "Confidence",
      aboutTitle: "About Tarot Reading",
      aboutText1: "Tarot is a form of divination using 78 cards divided into Major and Minor Arcana.",
      aboutText2: "Each card has imagery, symbolism, and story. Reversed cards modify meanings.",
      aboutText3: "Tarot is a tool for reflection and guidance, not definitive answers."
    },
    // Vastu
    vastu: {
      badge: "Vastu Shastra",
      title: "Vastu Shastra Guide",
      subtitle: "Ancient Indian science of architecture for harmony and positive energy.",
      directions: "Directions",
      rooms: "Rooms",
      remedies: "Remedies",
      office: "Office",
      directionsTitle: "Eight Directions in Vastu",
      directionsDesc: "Each direction is governed by a deity and element",
      deity: "Deity",
      colors: "Colors",
      roomsTitle: "Room-wise Vastu Tips",
      roomsDesc: "Ideal placement and tips for each room",
      idealDirections: "Ideal Directions",
      avoidDirections: "Avoid Directions",
      tips: "Vastu Tips",
      remediesTitle: "Vastu Remedies",
      remediesDesc: "Solutions for common Vastu defects",
      officeTitle: "Office & Business Vastu",
      officeDesc: "Vastu tips for workplace success",
      officeDos: "Do's for Office",
      officeDonts: "Don'ts for Office",
      aboutTitle: "About Vastu Shastra",
      aboutText1: "Vastu Shastra is ancient Indian science of architecture dating back 5,000 years.",
      aboutText2: "Based on five elements and eight directions for positive energy flow.",
      aboutText3: "Simple remedies can help balance energy in modern spaces."
    },
    // Chinese Astrology
    chinese: {
      badge: "Chinese Astrology",
      title: "Chinese Zodiac",
      subtitle: "Discover your Chinese zodiac animal and what 2026 holds for you.",
      enterYear: "Enter Birth Year",
      enterYearDesc: "Find your Chinese zodiac sign",
      birthYear: "Birth Year",
      yearHint: "Enter your birth year (1900-2100)",
      calculating: "Calculating...",
      findZodiac: "Find My Zodiac",
      quickRef: "Quick Reference",
      noResult: "Enter your birth year",
      noResultDesc: "Discover your Chinese zodiac animal and personality traits.",
      yearsLabel: "Years",
      overview: "Overview",
      compatibility: "Love",
      career: "Career",
      "2026": "2026",
      characteristics: "Characteristics",
      strengths: "Strengths",
      weaknesses: "Weaknesses",
      luckyThings: "Lucky Things",
      bestMatches: "Best Matches",
      leastCompatible: "Least Compatible",
      careerPaths: "Ideal Career Paths",
      healthAdvice: "Health Advice",
      prediction2026: "Year of the Snake 2026 Prediction",
      predictionFor: "Prediction for",
      aboutTitle: "About Chinese Astrology",
      aboutText1: "Chinese astrology is based on a 12-year cycle with animal signs.",
      aboutText2: "Your sign is determined by birth year according to lunar calendar.",
      aboutText3: "2026 is the Year of the Snake, favoring careful planning."
    },
    // KP System
    kp: {
      badge: "KP System",
      title: "Krishnamurti Paddhati (KP) System",
      subtitle: "Advanced stellar astrology with sub-lord theory for precise predictions.",
      enterDetails: "Enter Birth Details",
      enterDetailsDesc: "Generate your KP chart with sub-lords",
      calculating: "Calculating...",
      generateChart: "Generate KP Chart",
      noResult: "Enter birth details",
      noResultDesc: "The KP System uses sub-lords for precise predictions.",
      whatIsKP: "What is KP System?",
      cusps: "Cusps",
      planets: "Planets",
      significators: "Significators",
      cuspTable: "Cusp Table (Bhava Chalit)",
      cuspTableDesc: "House cusps with their sub-lords",
      house: "House",
      sign: "Sign",
      degree: "Degree",
      nakshatra: "Nakshatra",
      subLord: "Sub-Lord",
      planet: "Planet",
      planetTable: "Planetary Positions",
      planetTableDesc: "Planets with nakshatra and sub-lords",
      houseSignificators: "House Significators",
      selectHouse: "Select a house to see its significators",
      significations: "Significations",
      significatorPlanets: "Significator Planets",
      cuspSubLord: "Cusp Sub-Lord Analysis",
      rulesTitle: "KP System Rules",
      basicRules: "Basic Rules",
      timingRules: "Timing Rules",
      aboutTitle: "About KP System",
      aboutText1: "KP System was developed by Prof. K.S. Krishnamurti in the 1960s.",
      aboutText2: "The key innovation is sub-lords determining results.",
      aboutText3: "Effective for specific questions and timing events."
    },
    // Prashna Kundli
    prashna: {
      badge: "Prashna Kundli",
      title: "Prashna Kundli - Horary Astrology",
      subtitle: "Get answers based on planetary positions at this exact moment.",
      askQuestion: "Ask Your Question",
      askQuestionDesc: "Answer based on current planetary positions",
      currentTime: "Current Time",
      category: "Question Category",
      yourQuestion: "Your Question",
      questionPlaceholder: "Type your question here...",
      questionTip: "Ask a clear yes/no question for best results",
      analyzing: "Analyzing Planets...",
      getAnswer: "Get Answer",
      noResult: "Ask a Question",
      noResultDesc: "Prashna Kundli provides answers based on current planetary positions.",
      howItWorks: "How It Works",
      chartDetails: "Prashna Chart Details",
      time: "Time",
      ascendant: "Ascendant",
      moonSign: "Moon Sign",
      timing: "Timing",
      interpretation: "Interpretation",
      advice: "Advice",
      favorable: "Favorable Planets",
      unfavorable: "Challenging Planets",
      confidence: "Confidence",
      yes: "YES - Favorable",
      no: "NO - Unfavorable",
      maybe: "MAYBE - Mixed",
      askAnother: "Ask Another Question",
      aboutTitle: "About Prashna Kundli",
      aboutText1: "Prashna Kundli provides answers based on the moment a question is asked.",
      aboutText2: "The ascendant represents the querent, other houses provide information.",
      aboutText3: "Ask one clear question at a time for best results."
    },
    // Baby Names
    babyNames: {
      badge: "Baby Names",
      title: "Nakshatra-Based Baby Names",
      subtitle: "Find the perfect name based on birth Nakshatra.",
      enterDetails: "Enter Birth Details",
      enterDetailsDesc: "Find names based on baby's Nakshatra",
      finding: "Finding Names...",
      findNames: "Find Baby Names",
      noResult: "Enter birth details",
      noResultDesc: "Get personalized name suggestions based on Vedic traditions.",
      startingLetters: "Starting Letters",
      luckyColor: "Lucky Color",
      luckyNumber: "Lucky Number",
      traits: "Traits",
      searchPlaceholder: "Search names...",
      all: "All",
      boy: "Boy",
      girl: "Girl",
      numerology: "Numerology",
      noNamesFound: "No names found matching your criteria",
      nakshatraReference: "Nakshatra Reference Guide",
      nakshatraReferenceDesc: "All 27 Nakshatras and their starting letters",
      aboutTitle: "About Nakshatra-Based Naming",
      aboutText1: "Names are chosen based on birth Nakshatra in Vedic tradition.",
      aboutText2: "The Nakshatra is determined by Moon's position at birth.",
      aboutText3: "Use this as a guide while honoring personal preferences."
    },
    // Gemstones
    gemstones: {
      badge: "Gemstone Recommendations",
      title: "Astrological Gemstones",
      subtitle: "Discover the perfect gemstone based on your birth chart.",
      findGemstone: "Find Your Gemstone",
      findGemstoneDesc: "Get personalized gemstone recommendations",
      finding: "Finding...",
      getRecommendation: "Get Recommendation",
      noResult: "Enter your birth date",
      noResultDesc: "Get personalized gemstone recommendations.",
      yourSign: "Your Sign",
      primary: "Primary Recommendation",
      secondary: "Secondary Recommendations",
      benefits: "Benefits",
      howToWear: "How to Wear",
      mantra: "Mantra",
      alternatives: "Alternatives",
      forYou: "For You",
      allGems: "All Gems",
      guide: "Guide",
      guideTitle: "Gemstone Wearing Guide",
      beforeWearing: "Before Wearing a Gemstone",
      purification: "Purification Process",
      cautions: "Important Cautions",
      aboutTitle: "About Astrological Gemstones"
    },
    // Palmistry
    palmistry: {
      badge: "Palmistry Guide",
      title: "Palm Reading Guide",
      subtitle: "Learn the ancient art of palmistry.",
      lines: "Lines",
      mounts: "Mounts",
      fingers: "Fingers",
      shapes: "Hand Shapes",
      majorLines: "Major Palm Lines",
      selectLine: "Select a line to learn more",
      selectLinePrompt: "Select a line",
      selectLineDesc: "Click on a palm line to see its meaning.",
      location: "Location",
      meaning: "Meaning",
      variations: "Variations & Interpretations",
      palmMounts: "Palm Mounts",
      selectMount: "Select a mount to learn more",
      selectMountPrompt: "Select a mount",
      selectMountDesc: "Click on a palm mount to see its meaning.",
      represents: "Represents",
      wellDeveloped: "Well Developed",
      underdeveloped: "Underdeveloped",
      individualFingers: "Individual Finger Meanings",
      howToIdentify: "How to Identify Your Hand Shape",
      aboutTitle: "About Palmistry",
      aboutText1: "Palmistry interprets lines, shapes, and mounts on the palm.",
      aboutText2: "In Vedic tradition, palmistry is Hasta Samudrika Shastra.",
      aboutText3: "Use as a tool for self-reflection, not absolute prediction."
    },
    // Common
    common: {
      birthDate: "Birth Date",
      birthTime: "Birth Time",
      birthPlace: "Birth Place",
      calculate: "Calculate",
      generate: "Generate",
      loading: "Loading...",
      error: "An error occurred",
      tryAgain: "Try Again",
      learnMore: "Learn More"
    },
    // Navigation
    navAstrology: {
      lalKitab: "Lal Kitab",
      lalKitabDesc: "Ancient remedial astrology system",
      numerology: "Numerology",
      numerologyDesc: "Discover your life path numbers",
      tarot: "Tarot Reading",
      tarotDesc: "Daily, love, career card readings",
      vastu: "Vastu Shastra",
      vastuDesc: "Home and office Vastu tips",
      chinese: "Chinese Astrology",
      chineseDesc: "Your Chinese zodiac sign",
      kpSystem: "KP System",
      kpSystemDesc: "Krishnamurti Paddhati astrology",
      prashna: "Prashna Kundli",
      prashnaDesc: "Question-based horary astrology",
      babyNames: "Baby Names",
      babyNamesDesc: "Nakshatra-based name suggestions",
      gemstones: "Gemstones",
      gemstonesDesc: "Astrological gemstone guide",
      palmistry: "Palmistry",
      palmistryDesc: "Palm reading guide"
    }
  },
  hi: {
    lalKitab: {
      badge: "लाल किताब",
      title: "लाल किताब कुंडली",
      subtitle: "लाल किताब की प्राचीन बुद्धि के माध्यम से अपने भाग्य की खोज करें।",
      enterDetails: "जन्म विवरण दर्ज करें",
      generate: "लाल किताब चार्ट बनाएं",
      chart: "चार्ट",
      debts: "ऋण",
      predictions: "भविष्यवाणियां",
      remedies: "उपाय",
      aboutTitle: "लाल किताब के बारे में"
    },
    numerology: {
      badge: "अंक ज्योतिष",
      title: "अंक ज्योतिष कैलकुलेटर",
      subtitle: "पाइथागोरियन अंक ज्योतिष के माध्यम से संख्याओं का छिपा अर्थ खोजें।",
      calculate: "मेरे नंबर गणना करें",
      lifePath: "जीवन पथ संख्या",
      destiny: "भाग्य संख्या",
      soul: "आत्मा संख्या",
      personality: "व्यक्तित्व संख्या"
    },
    tarot: {
      badge: "टैरो रीडिंग",
      title: "टैरो कार्ड रीडिंग",
      subtitle: "टैरो की प्राचीन बुद्धि के माध्यम से अपने जीवन के बारे में जानकारी प्राप्त करें।",
      daily: "दैनिक",
      love: "प्रेम",
      career: "करियर",
      yesNo: "हां/नहीं"
    },
    vastu: {
      badge: "वास्तु शास्त्र",
      title: "वास्तु शास्त्र गाइड",
      subtitle: "सामंजस्य और सकारात्मक ऊर्जा के लिए प्राचीन भारतीय वास्तुकला विज्ञान।",
      directions: "दिशाएं",
      rooms: "कमरे",
      remedies: "उपाय",
      office: "कार्यालय"
    },
    chinese: {
      badge: "चीनी ज्योतिष",
      title: "चीनी राशि",
      subtitle: "अपने चीनी राशि पशु और 2026 की भविष्यवाणी जानें।",
      findZodiac: "मेरी राशि खोजें"
    },
    kp: {
      badge: "केपी प्रणाली",
      title: "कृष्णमूर्ति पद्धति (केपी) प्रणाली",
      subtitle: "सटीक भविष्यवाणियों के लिए उन्नत नक्षत्र ज्योतिष।",
      generateChart: "केपी चार्ट बनाएं"
    },
    prashna: {
      badge: "प्रश्न कुंडली",
      title: "प्रश्न कुंडली - होरेरी ज्योतिष",
      subtitle: "इस समय ग्रहों की स्थिति के आधार पर उत्तर प्राप्त करें।",
      getAnswer: "उत्तर प्राप्त करें"
    },
    babyNames: {
      badge: "शिशु नाम",
      title: "नक्षत्र-आधारित शिशु नाम",
      subtitle: "जन्म नक्षत्र के आधार पर सही नाम खोजें।",
      findNames: "शिशु नाम खोजें"
    },
    gemstones: {
      badge: "रत्न सिफारिशें",
      title: "ज्योतिषीय रत्न",
      subtitle: "अपनी जन्म कुंडली के आधार पर सही रत्न खोजें।",
      getRecommendation: "सिफारिश प्राप्त करें"
    },
    palmistry: {
      badge: "हस्तरेखा गाइड",
      title: "हस्तरेखा पढ़ने की गाइड",
      subtitle: "हस्तरेखा विज्ञान की प्राचीन कला सीखें।",
      lines: "रेखाएं",
      mounts: "पर्वत",
      fingers: "उंगलियां",
      shapes: "हाथ के आकार"
    },
    navAstrology: {
      lalKitab: "लाल किताब",
      lalKitabDesc: "प्राचीन उपचारात्मक ज्योतिष प्रणाली",
      numerology: "अंक ज्योतिष",
      numerologyDesc: "अपने जीवन पथ संख्या खोजें",
      tarot: "टैरो रीडिंग",
      tarotDesc: "दैनिक, प्रेम, करियर कार्ड रीडिंग",
      vastu: "वास्तु शास्त्र",
      vastuDesc: "घर और कार्यालय वास्तु टिप्स",
      chinese: "चीनी ज्योतिष",
      chineseDesc: "आपकी चीनी राशि",
      kpSystem: "केपी प्रणाली",
      kpSystemDesc: "कृष्णमूर्ति पद्धति ज्योतिष",
      prashna: "प्रश्न कुंडली",
      prashnaDesc: "प्रश्न-आधारित होरेरी ज्योतिष",
      babyNames: "शिशु नाम",
      babyNamesDesc: "नक्षत्र-आधारित नाम सुझाव",
      gemstones: "रत्न",
      gemstonesDesc: "ज्योतिषीय रत्न गाइड",
      palmistry: "हस्तरेखा",
      palmistryDesc: "हस्तरेखा पढ़ने की गाइड"
    }
  },
  ta: {
    lalKitab: {
      badge: "லால் கிதாப்",
      title: "லால் கிதாப் குண்டலி",
      subtitle: "லால் கிதாப்பின் பண்டைய ஞானத்தின் மூலம் உங்கள் விதியைக் கண்டறியுங்கள்।"
    },
    numerology: {
      badge: "எண் கணிதம்",
      title: "எண் கணித கால்குலேட்டர்",
      subtitle: "பைதாகரியன் எண் கணிதத்தின் மூலம் எண்களின் மறைந்த அர்த்தத்தைக் கண்டறியுங்கள்।"
    },
    tarot: {
      badge: "டாரட் வாசிப்பு",
      title: "டாரட் கார்டு வாசிப்பு",
      subtitle: "டாரட்டின் பண்டைய ஞானத்தின் மூலம் உங்கள் வாழ்க்கையைப் பற்றிய நுண்ணறிவுகளைக் கண்டறியுங்கள்।"
    },
    vastu: {
      badge: "வாஸ்து சாஸ்திரம்",
      title: "வாஸ்து சாஸ்திர வழிகாட்டி",
      subtitle: "நல்லிணக்கம் மற்றும் நேர்மறை ஆற்றலுக்கான பண்டைய இந்திய கட்டிடக்கலை அறிவியல்।"
    },
    chinese: {
      badge: "சீன ஜோதிடம்",
      title: "சீன ராசி",
      subtitle: "உங்கள் சீன ராசி விலங்கு மற்றும் 2026 கணிப்புகளைக் கண்டறியுங்கள்।"
    },
    kp: {
      badge: "கேபி முறை",
      title: "கிருஷ்ணமூர்த்தி பத்ததி (கேபி) முறை",
      subtitle: "துல்லியமான கணிப்புகளுக்கான மேம்பட்ட நட்சத்திர ஜோதிடம்।"
    },
    prashna: {
      badge: "பிரஷ்ன குண்டலி",
      title: "பிரஷ்ன குண்டலி - ஹோரேரி ஜோதிடம்",
      subtitle: "இந்த நேரத்தில் கிரக நிலைகளின் அடிப்படையில் பதில்களைப் பெறுங்கள்।"
    },
    babyNames: {
      badge: "குழந்தை பெயர்கள்",
      title: "நட்சத்திர அடிப்படையிலான குழந்தை பெயர்கள்",
      subtitle: "பிறப்பு நட்சத்திரத்தின் அடிப்படையில் சரியான பெயரைக் கண்டறியுங்கள்।"
    },
    gemstones: {
      badge: "ரத்தின பரிந்துரைகள்",
      title: "ஜோதிட ரத்தினங்கள்",
      subtitle: "உங்கள் ஜாதகத்தின் அடிப்படையில் சரியான ரத்தினத்தைக் கண்டறியுங்கள்।"
    },
    palmistry: {
      badge: "கைரேகை வழிகாட்டி",
      title: "கைரேகை படிக்கும் வழிகாட்டி",
      subtitle: "கைரேகை சாஸ்திரத்தின் பண்டைய கலையைக் கற்றுக்கொள்ளுங்கள்।"
    },
    navAstrology: {
      lalKitab: "லால் கிதாப்",
      numerology: "எண் கணிதம்",
      tarot: "டாரட் வாசிப்பு",
      vastu: "வாஸ்து சாஸ்திரம்",
      chinese: "சீன ஜோதிடம்",
      kpSystem: "கேபி முறை",
      prashna: "பிரஷ்ன குண்டலி",
      babyNames: "குழந்தை பெயர்கள்",
      gemstones: "ரத்தினங்கள்",
      palmistry: "கைரேகை"
    }
  },
  te: {
    lalKitab: {
      badge: "లాల్ కితాబ్",
      title: "లాల్ కితాబ్ కుండలి",
      subtitle: "లాల్ కితాబ్ యొక్క ప్రాచీన జ్ఞానం ద్వారా మీ విధిని కనుగొనండి।"
    },
    numerology: {
      badge: "సంఖ్యా శాస్త్రం",
      title: "సంఖ్యా శాస్త్ర కాలిక్యులేటర్",
      subtitle: "పైథాగరియన్ సంఖ్యా శాస్త్రం ద్వారా సంఖ్యల దాచిన అర్థాన్ని కనుగొనండి।"
    },
    tarot: {
      badge: "టారో రీడింగ్",
      title: "టారో కార్డ్ రీడింగ్",
      subtitle: "టారో యొక్క ప్రాచీన జ్ఞానం ద్వారా మీ జీవితం గురించి అంతర్దృష్టులను కనుగొనండి।"
    },
    vastu: {
      badge: "వాస్తు శాస్త్రం",
      title: "వాస్తు శాస్త్ర గైడ్",
      subtitle: "సామరస్యం మరియు సానుకూల శక్తి కోసం ప్రాచీన భారతీయ వాస్తుకళా శాస్త్రం।"
    },
    chinese: {
      badge: "చైనీస్ జ్యోతిషం",
      title: "చైనీస్ రాశి",
      subtitle: "మీ చైనీస్ రాశి జంతువు మరియు 2026 అంచనాలను కనుగొనండి।"
    },
    kp: {
      badge: "కేపీ సిస్టమ్",
      title: "కృష్ణమూర్తి పద్ధతి (కేపీ) సిస్టమ్",
      subtitle: "ఖచ్చితమైన అంచనాల కోసం అధునాతన నక్షత్ర జ్యోతిషం।"
    },
    prashna: {
      badge: "ప్రశ్న కుండలి",
      title: "ప్రశ్న కుండలి - హోరరీ జ్యోతిషం",
      subtitle: "ఈ సమయంలో గ్రహ స్థానాల ఆధారంగా సమాధానాలు పొందండి।"
    },
    babyNames: {
      badge: "శిశువు పేర్లు",
      title: "నక్షత్ర ఆధారిత శిశువు పేర్లు",
      subtitle: "జన్మ నక్షత్రం ఆధారంగా సరైన పేరును కనుగొనండి।"
    },
    gemstones: {
      badge: "రత్న సిఫార్సులు",
      title: "జ్యోతిష రత్నాలు",
      subtitle: "మీ జన్మ కుండలి ఆధారంగా సరైన రత్నాన్ని కనుగొనండి।"
    },
    palmistry: {
      badge: "హస్తరేఖ గైడ్",
      title: "హస్తరేఖ చదివే గైడ్",
      subtitle: "హస్తరేఖ శాస్త్రం యొక్క ప్రాచీన కళను నేర్చుకోండి।"
    },
    navAstrology: {
      lalKitab: "లాల్ కితాబ్",
      numerology: "సంఖ్యా శాస్త్రం",
      tarot: "టారో రీడింగ్",
      vastu: "వాస్తు శాస్త్రం",
      chinese: "చైనీస్ జ్యోతిషం",
      kpSystem: "కేపీ సిస్టమ్",
      prashna: "ప్రశ్న కుండలి",
      babyNames: "శిశువు పేర్లు",
      gemstones: "రత్నాలు",
      palmistry: "హస్తరేఖ"
    }
  },
  bn: {
    lalKitab: {
      badge: "লাল কিতাব",
      title: "লাল কিতাব কুণ্ডলী",
      subtitle: "লাল কিতাবের প্রাচীন জ্ঞানের মাধ্যমে আপনার ভাগ্য আবিষ্কার করুন।"
    },
    numerology: {
      badge: "সংখ্যাতত্ত্ব",
      title: "সংখ্যাতত্ত্ব ক্যালকুলেটর",
      subtitle: "পাইথাগোরিয়ান সংখ্যাতত্ত্বের মাধ্যমে সংখ্যার লুকানো অর্থ আবিষ্কার করুন।"
    },
    tarot: {
      badge: "ট্যারো রিডিং",
      title: "ট্যারো কার্ড রিডিং",
      subtitle: "ট্যারোর প্রাচীন জ্ঞানের মাধ্যমে আপনার জীবন সম্পর্কে অন্তর্দৃষ্টি আবিষ্কার করুন।"
    },
    vastu: {
      badge: "বাস্তু শাস্ত্র",
      title: "বাস্তু শাস্ত্র গাইড",
      subtitle: "সামঞ্জস্য এবং ইতিবাচক শক্তির জন্য প্রাচীন ভারতীয় স্থাপত্য বিজ্ঞান।"
    },
    chinese: {
      badge: "চীনা জ্যোতিষ",
      title: "চীনা রাশি",
      subtitle: "আপনার চীনা রাশি প্রাণী এবং 2026 ভবিষ্যদ্বাণী আবিষ্কার করুন।"
    },
    kp: {
      badge: "কেপি সিস্টেম",
      title: "কৃষ্ণমূর্তি পদ্ধতি (কেপি) সিস্টেম",
      subtitle: "সুনির্দিষ্ট ভবিষ্যদ্বাণীর জন্য উন্নত নক্ষত্র জ্যোতিষ।"
    },
    prashna: {
      badge: "প্রশ্ন কুণ্ডলী",
      title: "প্রশ্ন কুণ্ডলী - হোরারি জ্যোতিষ",
      subtitle: "এই মুহূর্তে গ্রহের অবস্থানের উপর ভিত্তি করে উত্তর পান।"
    },
    babyNames: {
      badge: "শিশুর নাম",
      title: "নক্ষত্র-ভিত্তিক শিশুর নাম",
      subtitle: "জন্ম নক্ষত্রের উপর ভিত্তি করে সঠিক নাম খুঁজুন।"
    },
    gemstones: {
      badge: "রত্ন সুপারিশ",
      title: "জ্যোতিষ রত্ন",
      subtitle: "আপনার জন্ম কুণ্ডলীর উপর ভিত্তি করে সঠিক রত্ন খুঁজুন।"
    },
    palmistry: {
      badge: "হস্তরেখা গাইড",
      title: "হস্তরেখা পড়ার গাইড",
      subtitle: "হস্তরেখা বিদ্যার প্রাচীন শিল্প শিখুন।"
    },
    navAstrology: {
      lalKitab: "লাল কিতাব",
      numerology: "সংখ্যাতত্ত্ব",
      tarot: "ট্যারো রিডিং",
      vastu: "বাস্তু শাস্ত্র",
      chinese: "চীনা জ্যোতিষ",
      kpSystem: "কেপি সিস্টেম",
      prashna: "প্রশ্ন কুণ্ডলী",
      babyNames: "শিশুর নাম",
      gemstones: "রত্ন",
      palmistry: "হস্তরেখা"
    }
  },
  mr: {
    lalKitab: {
      badge: "लाल किताब",
      title: "लाल किताब कुंडली",
      subtitle: "लाल किताबच्या प्राचीन ज्ञानाद्वारे आपले नशीब शोधा।"
    },
    numerology: {
      badge: "अंकशास्त्र",
      title: "अंकशास्त्र कॅल्क्युलेटर",
      subtitle: "पायथागोरियन अंकशास्त्राद्वारे संख्यांचा लपलेला अर्थ शोधा।"
    },
    tarot: {
      badge: "टॅरो वाचन",
      title: "टॅरो कार्ड वाचन",
      subtitle: "टॅरोच्या प्राचीन ज्ञानाद्वारे आपल्या जीवनाबद्दल अंतर्दृष्टी शोधा।"
    },
    vastu: {
      badge: "वास्तु शास्त्र",
      title: "वास्तु शास्त्र मार्गदर्शक",
      subtitle: "सुसंवाद आणि सकारात्मक ऊर्जेसाठी प्राचीन भारतीय वास्तुकला विज्ञान।"
    },
    chinese: {
      badge: "चीनी ज्योतिष",
      title: "चीनी राशी",
      subtitle: "आपले चीनी राशी प्राणी आणि 2026 भविष्यवाणी शोधा।"
    },
    kp: {
      badge: "केपी प्रणाली",
      title: "कृष्णमूर्ती पद्धती (केपी) प्रणाली",
      subtitle: "अचूक भविष्यवाणीसाठी प्रगत नक्षत्र ज्योतिष।"
    },
    prashna: {
      badge: "प्रश्न कुंडली",
      title: "प्रश्न कुंडली - होररी ज्योतिष",
      subtitle: "या क्षणी ग्रहांच्या स्थितीवर आधारित उत्तरे मिळवा।"
    },
    babyNames: {
      badge: "बाळाची नावे",
      title: "नक्षत्र-आधारित बाळाची नावे",
      subtitle: "जन्म नक्षत्रावर आधारित योग्य नाव शोधा।"
    },
    gemstones: {
      badge: "रत्न शिफारसी",
      title: "ज्योतिष रत्ने",
      subtitle: "आपल्या जन्म कुंडलीवर आधारित योग्य रत्न शोधा।"
    },
    palmistry: {
      badge: "हस्तरेखा मार्गदर्शक",
      title: "हस्तरेखा वाचन मार्गदर्शक",
      subtitle: "हस्तरेखा शास्त्राची प्राचीन कला शिका।"
    },
    navAstrology: {
      lalKitab: "लाल किताब",
      numerology: "अंकशास्त्र",
      tarot: "टॅरो वाचन",
      vastu: "वास्तु शास्त्र",
      chinese: "चीनी ज्योतिष",
      kpSystem: "केपी प्रणाली",
      prashna: "प्रश्न कुंडली",
      babyNames: "बाळाची नावे",
      gemstones: "रत्ने",
      palmistry: "हस्तरेखा"
    }
  },
  gu: {
    lalKitab: {
      badge: "લાલ કિતાબ",
      title: "લાલ કિતાબ કુંડળી",
      subtitle: "લાલ કિતાબની પ્રાચીન જ્ઞાન દ્વારા તમારું ભાગ્ય શોધો।"
    },
    numerology: {
      badge: "અંકશાસ્ત્ર",
      title: "અંકશાસ્ત્ર કેલ્ક્યુલેટર",
      subtitle: "પાયથાગોરિયન અંકશાસ્ત્ર દ્વારા સંખ્યાઓનો છુપાયેલો અર્થ શોધો।"
    },
    tarot: {
      badge: "ટેરો રીડિંગ",
      title: "ટેરો કાર્ડ રીડિંગ",
      subtitle: "ટેરોની પ્રાચીન જ્ઞાન દ્વારા તમારા જીવન વિશે આંતરદૃષ્ટિ શોધો।"
    },
    vastu: {
      badge: "વાસ્તુ શાસ્ત્ર",
      title: "વાસ્તુ શાસ્ત્ર માર્ગદર્શિકા",
      subtitle: "સુમેળ અને સકારાત્મક ઊર્જા માટે પ્રાચીન ભારતીય સ્થાપત્ય વિજ્ઞાન।"
    },
    chinese: {
      badge: "ચાઇનીઝ જ્યોતિષ",
      title: "ચાઇનીઝ રાશિ",
      subtitle: "તમારું ચાઇનીઝ રાશિ પ્રાણી અને 2026 આગાહી શોધો।"
    },
    kp: {
      badge: "કેપી સિસ્ટમ",
      title: "કૃષ્ણમૂર્તિ પદ્ધતિ (કેપી) સિસ્ટમ",
      subtitle: "ચોક્કસ આગાહીઓ માટે અદ્યતન નક્ષત્ર જ્યોતિષ।"
    },
    prashna: {
      badge: "પ્રશ્ન કુંડળી",
      title: "પ્રશ્ન કુંડળી - હોરરી જ્યોતિષ",
      subtitle: "આ સમયે ગ્રહોની સ્થિતિના આધારે જવાબો મેળવો।"
    },
    babyNames: {
      badge: "બાળકના નામ",
      title: "નક્ષત્ર-આધારિત બાળકના નામ",
      subtitle: "જન્મ નક્ષત્રના આધારે યોગ્ય નામ શોધો।"
    },
    gemstones: {
      badge: "રત્ન ભલામણો",
      title: "જ્યોતિષ રત્નો",
      subtitle: "તમારી જન્મ કુંડળીના આધારે યોગ્ય રત્ન શોધો।"
    },
    palmistry: {
      badge: "હસ્તરેખા માર્ગદર્શિકા",
      title: "હસ્તરેખા વાંચન માર્ગદર્શિકા",
      subtitle: "હસ્તરેખા શાસ્ત્રની પ્રાચીન કળા શીખો।"
    },
    navAstrology: {
      lalKitab: "લાલ કિતાબ",
      numerology: "અંકશાસ્ત્ર",
      tarot: "ટેરો રીડિંગ",
      vastu: "વાસ્તુ શાસ્ત્ર",
      chinese: "ચાઇનીઝ જ્યોતિષ",
      kpSystem: "કેપી સિસ્ટમ",
      prashna: "પ્રશ્ન કુંડળી",
      babyNames: "બાળકના નામ",
      gemstones: "રત્નો",
      palmistry: "હસ્તરેખા"
    }
  },
  kn: {
    lalKitab: {
      badge: "ಲಾಲ್ ಕಿತಾಬ್",
      title: "ಲಾಲ್ ಕಿತಾಬ್ ಕುಂಡಲಿ",
      subtitle: "ಲಾಲ್ ಕಿತಾಬ್‌ನ ಪ್ರಾಚೀನ ಜ್ಞಾನದ ಮೂಲಕ ನಿಮ್ಮ ಭವಿಷ್ಯವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ।"
    },
    numerology: {
      badge: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ",
      title: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
      subtitle: "ಪೈಥಾಗೊರಿಯನ್ ಸಂಖ್ಯಾಶಾಸ್ತ್ರದ ಮೂಲಕ ಸಂಖ್ಯೆಗಳ ಮರೆಮಾಚಿದ ಅರ್ಥವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ।"
    },
    tarot: {
      badge: "ಟ್ಯಾರೋ ಓದುವಿಕೆ",
      title: "ಟ್ಯಾರೋ ಕಾರ್ಡ್ ಓದುವಿಕೆ",
      subtitle: "ಟ್ಯಾರೋದ ಪ್ರಾಚೀನ ಜ್ಞಾನದ ಮೂಲಕ ನಿಮ್ಮ ಜೀವನದ ಬಗ್ಗೆ ಒಳನೋಟಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ।"
    },
    vastu: {
      badge: "ವಾಸ್ತು ಶಾಸ್ತ್ರ",
      title: "ವಾಸ್ತು ಶಾಸ್ತ್ರ ಮಾರ್ಗದರ್ಶಿ",
      subtitle: "ಸಾಮರಸ್ಯ ಮತ್ತು ಧನಾತ್ಮಕ ಶಕ್ತಿಗಾಗಿ ಪ್ರಾಚೀನ ಭಾರತೀಯ ವಾಸ್ತುಶಿಲ್ಪ ವಿಜ್ಞಾನ।"
    },
    chinese: {
      badge: "ಚೀನೀ ಜ್ಯೋತಿಷ್ಯ",
      title: "ಚೀನೀ ರಾಶಿ",
      subtitle: "ನಿಮ್ಮ ಚೀನೀ ರಾಶಿ ಪ್ರಾಣಿ ಮತ್ತು 2026 ಭವಿಷ್ಯವಾಣಿಯನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ।"
    },
    kp: {
      badge: "ಕೆಪಿ ವ್ಯವಸ್ಥೆ",
      title: "ಕೃಷ್ಣಮೂರ್ತಿ ಪದ್ಧತಿ (ಕೆಪಿ) ವ್ಯವಸ್ಥೆ",
      subtitle: "ನಿಖರ ಭವಿಷ್ಯವಾಣಿಗಳಿಗಾಗಿ ಸುಧಾರಿತ ನಕ್ಷತ್ರ ಜ್ಯೋತಿಷ್ಯ।"
    },
    prashna: {
      badge: "ಪ್ರಶ್ನ ಕುಂಡಲಿ",
      title: "ಪ್ರಶ್ನ ಕುಂಡಲಿ - ಹೊರೇರಿ ಜ್ಯೋತಿಷ್ಯ",
      subtitle: "ಈ ಸಮಯದಲ್ಲಿ ಗ್ರಹಗಳ ಸ್ಥಾನಗಳ ಆಧಾರದ ಮೇಲೆ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ।"
    },
    babyNames: {
      badge: "ಮಗುವಿನ ಹೆಸರುಗಳು",
      title: "ನಕ್ಷತ್ರ-ಆಧಾರಿತ ಮಗುವಿನ ಹೆಸರುಗಳು",
      subtitle: "ಜನ್ಮ ನಕ್ಷತ್ರದ ಆಧಾರದ ಮೇಲೆ ಸರಿಯಾದ ಹೆಸರನ್ನು ಹುಡುಕಿ।"
    },
    gemstones: {
      badge: "ರತ್ನ ಶಿಫಾರಸುಗಳು",
      title: "ಜ್ಯೋತಿಷ್ಯ ರತ್ನಗಳು",
      subtitle: "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಆಧಾರದ ಮೇಲೆ ಸರಿಯಾದ ರತ್ನವನ್ನು ಹುಡುಕಿ।"
    },
    palmistry: {
      badge: "ಹಸ್ತರೇಖಾ ಮಾರ್ಗದರ್ಶಿ",
      title: "ಹಸ್ತರೇಖಾ ಓದುವ ಮಾರ್ಗದರ್ಶಿ",
      subtitle: "ಹಸ್ತರೇಖಾ ಶಾಸ್ತ್ರದ ಪ್ರಾಚೀನ ಕಲೆಯನ್ನು ಕಲಿಯಿರಿ।"
    },
    navAstrology: {
      lalKitab: "ಲಾಲ್ ಕಿತಾಬ್",
      numerology: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ",
      tarot: "ಟ್ಯಾರೋ ಓದುವಿಕೆ",
      vastu: "ವಾಸ್ತು ಶಾಸ್ತ್ರ",
      chinese: "ಚೀನೀ ಜ್ಯೋತಿಷ್ಯ",
      kpSystem: "ಕೆಪಿ ವ್ಯವಸ್ಥೆ",
      prashna: "ಪ್ರಶ್ನ ಕುಂಡಲಿ",
      babyNames: "ಮಗುವಿನ ಹೆಸರುಗಳು",
      gemstones: "ರತ್ನಗಳು",
      palmistry: "ಹಸ್ತರೇಖಾ"
    }
  },
  ml: {
    lalKitab: {
      badge: "ലാൽ കിതാബ്",
      title: "ലാൽ കിതാബ് കുണ്ഡലി",
      subtitle: "ലാൽ കിതാബിന്റെ പുരാതന ജ്ഞാനത്തിലൂടെ നിങ്ങളുടെ വിധി കണ്ടെത്തുക।"
    },
    numerology: {
      badge: "സംഖ്യാശാസ്ത്രം",
      title: "സംഖ്യാശാസ്ത്ര കാൽക്കുലേറ്റർ",
      subtitle: "പൈതഗോറിയൻ സംഖ്യാശാസ്ത്രത്തിലൂടെ സംഖ്യകളുടെ മറഞ്ഞിരിക്കുന്ന അർത്ഥം കണ്ടെത്തുക।"
    },
    tarot: {
      badge: "ടാരോ വായന",
      title: "ടാരോ കാർഡ് വായന",
      subtitle: "ടാരോയുടെ പുരാതന ജ്ഞാനത്തിലൂടെ നിങ്ങളുടെ ജീവിതത്തെക്കുറിച്ചുള്ള ഉൾക്കാഴ്ചകൾ കണ്ടെത്തുക।"
    },
    vastu: {
      badge: "വാസ്തു ശാസ്ത്രം",
      title: "വാസ്തു ശാസ്ത്ര ഗൈഡ്",
      subtitle: "ഐക്യത്തിനും പോസിറ്റീവ് ഊർജ്ജത്തിനുമുള്ള പുരാതന ഇന്ത്യൻ വാസ്തുവിദ്യാ ശാസ്ത്രം।"
    },
    chinese: {
      badge: "ചൈനീസ് ജ്യോതിഷം",
      title: "ചൈനീസ് രാശി",
      subtitle: "നിങ്ങളുടെ ചൈനീസ് രാശി മൃഗവും 2026 പ്രവചനവും കണ്ടെത്തുക।"
    },
    kp: {
      badge: "കെപി സിസ്റ്റം",
      title: "കൃഷ്ണമൂർത്തി പദ്ധതി (കെപി) സിസ്റ്റം",
      subtitle: "കൃത്യമായ പ്രവചനങ്ങൾക്കുള്ള വിപുലമായ നക്ഷത്ര ജ്യോതിഷം।"
    },
    prashna: {
      badge: "പ്രശ്ന കുണ്ഡലി",
      title: "പ്രശ്ന കുണ്ഡലി - ഹൊറേരി ജ്യോതിഷം",
      subtitle: "ഈ സമയത്തെ ഗ്രഹസ്ഥാനങ്ങളുടെ അടിസ്ഥാനത്തിൽ ഉത്തരങ്ങൾ നേടുക।"
    },
    babyNames: {
      badge: "കുഞ്ഞിന്റെ പേരുകൾ",
      title: "നക്ഷത്ര അടിസ്ഥാനമാക്കിയ കുഞ്ഞിന്റെ പേരുകൾ",
      subtitle: "ജനന നക്ഷത്രത്തിന്റെ അടിസ്ഥാനത്തിൽ ശരിയായ പേര് കണ്ടെത്തുക।"
    },
    gemstones: {
      badge: "രത്ന ശുപാർശകൾ",
      title: "ജ്യോതിഷ രത്നങ്ങൾ",
      subtitle: "നിങ്ങളുടെ ജനന കുണ്ഡലിയുടെ അടിസ്ഥാനത്തിൽ ശരിയായ രത്നം കണ്ടെത്തുക।"
    },
    palmistry: {
      badge: "ഹസ്തരേഖാ ഗൈഡ്",
      title: "ഹസ്തരേഖാ വായന ഗൈഡ്",
      subtitle: "ഹസ്തരേഖാ ശാസ്ത്രത്തിന്റെ പുരാതന കല പഠിക്കുക।"
    },
    navAstrology: {
      lalKitab: "ലാൽ കിതാബ്",
      numerology: "സംഖ്യാശാസ്ത്രം",
      tarot: "ടാരോ വായന",
      vastu: "വാസ്തു ശാസ്ത്രം",
      chinese: "ചൈനീസ് ജ്യോതിഷം",
      kpSystem: "കെപി സിസ്റ്റം",
      prashna: "പ്രശ്ന കുണ്ഡലി",
      babyNames: "കുഞ്ഞിന്റെ പേരുകൾ",
      gemstones: "രത്നങ്ങൾ",
      palmistry: "ഹസ്തരേഖാ"
    }
  },
  pa: {
    lalKitab: {
      badge: "ਲਾਲ ਕਿਤਾਬ",
      title: "ਲਾਲ ਕਿਤਾਬ ਕੁੰਡਲੀ",
      subtitle: "ਲਾਲ ਕਿਤਾਬ ਦੀ ਪ੍ਰਾਚੀਨ ਸਿਆਣਪ ਰਾਹੀਂ ਆਪਣੀ ਕਿਸਮਤ ਖੋਜੋ।"
    },
    numerology: {
      badge: "ਅੰਕ ਵਿਗਿਆਨ",
      title: "ਅੰਕ ਵਿਗਿਆਨ ਕੈਲਕੁਲੇਟਰ",
      subtitle: "ਪਾਇਥਾਗੋਰੀਅਨ ਅੰਕ ਵਿਗਿਆਨ ਰਾਹੀਂ ਅੰਕਾਂ ਦਾ ਲੁਕਿਆ ਅਰਥ ਖੋਜੋ।"
    },
    tarot: {
      badge: "ਟੈਰੋ ਰੀਡਿੰਗ",
      title: "ਟੈਰੋ ਕਾਰਡ ਰੀਡਿੰਗ",
      subtitle: "ਟੈਰੋ ਦੀ ਪ੍ਰਾਚੀਨ ਸਿਆਣਪ ਰਾਹੀਂ ਆਪਣੀ ਜ਼ਿੰਦਗੀ ਬਾਰੇ ਸੂਝ ਖੋਜੋ।"
    },
    vastu: {
      badge: "ਵਾਸਤੂ ਸ਼ਾਸਤਰ",
      title: "ਵਾਸਤੂ ਸ਼ਾਸਤਰ ਗਾਈਡ",
      subtitle: "ਸਦਭਾਵਨਾ ਅਤੇ ਸਕਾਰਾਤਮਕ ਊਰਜਾ ਲਈ ਪ੍ਰਾਚੀਨ ਭਾਰਤੀ ਆਰਕੀਟੈਕਚਰ ਵਿਗਿਆਨ।"
    },
    chinese: {
      badge: "ਚੀਨੀ ਜੋਤਿਸ਼",
      title: "ਚੀਨੀ ਰਾਸ਼ੀ",
      subtitle: "ਆਪਣਾ ਚੀਨੀ ਰਾਸ਼ੀ ਜਾਨਵਰ ਅਤੇ 2026 ਭਵਿੱਖਬਾਣੀ ਖੋਜੋ।"
    },
    kp: {
      badge: "ਕੇਪੀ ਸਿਸਟਮ",
      title: "ਕ੍ਰਿਸ਼ਨਾਮੂਰਤੀ ਪੱਧਤੀ (ਕੇਪੀ) ਸਿਸਟਮ",
      subtitle: "ਸਹੀ ਭਵਿੱਖਬਾਣੀਆਂ ਲਈ ਉੱਨਤ ਨਕਸ਼ਤਰ ਜੋਤਿਸ਼।"
    },
    prashna: {
      badge: "ਪ੍ਰਸ਼ਨ ਕੁੰਡਲੀ",
      title: "ਪ੍ਰਸ਼ਨ ਕੁੰਡਲੀ - ਹੋਰੇਰੀ ਜੋਤਿਸ਼",
      subtitle: "ਇਸ ਸਮੇਂ ਗ੍ਰਹਿਆਂ ਦੀਆਂ ਸਥਿਤੀਆਂ ਦੇ ਆਧਾਰ 'ਤੇ ਜਵਾਬ ਪ੍ਰਾਪਤ ਕਰੋ।"
    },
    babyNames: {
      badge: "ਬੱਚੇ ਦੇ ਨਾਮ",
      title: "ਨਕਸ਼ਤਰ-ਅਧਾਰਿਤ ਬੱਚੇ ਦੇ ਨਾਮ",
      subtitle: "ਜਨਮ ਨਕਸ਼ਤਰ ਦੇ ਆਧਾਰ 'ਤੇ ਸਹੀ ਨਾਮ ਲੱਭੋ।"
    },
    gemstones: {
      badge: "ਰਤਨ ਸਿਫਾਰਸ਼ਾਂ",
      title: "ਜੋਤਿਸ਼ ਰਤਨ",
      subtitle: "ਆਪਣੀ ਜਨਮ ਕੁੰਡਲੀ ਦੇ ਆਧਾਰ 'ਤੇ ਸਹੀ ਰਤਨ ਲੱਭੋ।"
    },
    palmistry: {
      badge: "ਹੱਥ ਰੇਖਾ ਗਾਈਡ",
      title: "ਹੱਥ ਰੇਖਾ ਪੜ੍ਹਨ ਦੀ ਗਾਈਡ",
      subtitle: "ਹੱਥ ਰੇਖਾ ਵਿਗਿਆਨ ਦੀ ਪ੍ਰਾਚੀਨ ਕਲਾ ਸਿੱਖੋ।"
    },
    navAstrology: {
      lalKitab: "ਲਾਲ ਕਿਤਾਬ",
      numerology: "ਅੰਕ ਵਿਗਿਆਨ",
      tarot: "ਟੈਰੋ ਰੀਡਿੰਗ",
      vastu: "ਵਾਸਤੂ ਸ਼ਾਸਤਰ",
      chinese: "ਚੀਨੀ ਜੋਤਿਸ਼",
      kpSystem: "ਕੇਪੀ ਸਿਸਟਮ",
      prashna: "ਪ੍ਰਸ਼ਨ ਕੁੰਡਲੀ",
      babyNames: "ਬੱਚੇ ਦੇ ਨਾਮ",
      gemstones: "ਰਤਨ",
      palmistry: "ਹੱਥ ਰੇਖਾ"
    }
  }
};

// Deep merge function to combine translation objects
export function deepMergeAstrology(target: TranslationObject, source: TranslationObject): TranslationObject {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMergeAstrology(
        (result[key] as TranslationObject) || {},
        source[key] as TranslationObject
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
