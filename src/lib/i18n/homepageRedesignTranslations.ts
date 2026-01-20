// Homepage Redesign Translations for VedicStarAstro
// This file contains translations for the redesigned homepage with viral features

import { Language } from "./translations";

type TranslationObject = Record<string, unknown>;

export const homepageRedesignTranslations: Record<Language, TranslationObject> = {
  en: {
    homeRedesign: {
      // New Hero Section - Single Powerful Hook
      heroMainTitle: "Discover What {year} Has in Store for You",
      heroSubtitle: "Enter your birth details and get your personalized cosmic profile in 60 seconds",
      heroFormTitle: "Get Your Free Cosmic Reading",
      
      // Birth Form Fields
      birthDate: "Birth Date",
      birthTime: "Birth Time",
      birthPlace: "Birth Place",
      selectDate: "Select date",
      selectTime: "Select time",
      enterCity: "Enter city name",
      generateProfile: "Generate My Cosmic Profile",
      generating: "Generating...",
      
      // Cosmic Profile Card (Viral Element)
      cosmicProfileTitle: "Your Cosmic Profile",
      cosmicDna: "Your Cosmic DNA",
      shareCosmicDna: "Share Your Cosmic DNA",
      predictionYear: "Your {year} Prediction",
      downloadCard: "Download Card",
      shareOnSocial: "Share on Social",
      copyLink: "Copy Link",
      linkCopied: "Link Copied!",
      scanToView: "Scan to view full reading",
      
      // Life Journeys (Simplified Navigation)
      lifeJourneys: "Life Journeys",
      loveJourney: "Love & Relationships",
      loveJourneyDesc: "Find your perfect match and relationship insights",
      careerJourney: "Career & Wealth",
      careerJourneyDesc: "Unlock your professional potential and financial growth",
      dailyJourney: "Daily Guidance",
      dailyJourneyDesc: "Get daily cosmic insights and auspicious timings",
      deepDiveJourney: "Deep Dive",
      deepDiveJourneyDesc: "Advanced tools for serious astrology enthusiasts",
      exploreMore: "Explore More",
      
      // Today's Cosmic Energy Section
      todayEnergy: "Today's Cosmic Energy",
      todayEnergyDesc: "Personalized daily insights based on planetary positions",
      energyScore: "Energy Score",
      luckyHours: "Lucky Hours",
      todayMood: "Today's Mood",
      planetaryInfluence: "Planetary Influence",
      enterBirthDetails: "Enter your birth details above to see personalized energy",
      
      // AI Astrologer Hub
      askTheStars: "Ask the Stars",
      aiHubTitle: "Your Personal AI Astrologer",
      aiHubDesc: "Get instant answers to any astrology question",
      askAnything: "Ask anything about your future...",
      popularQuestions: "Popular Questions",
      questionCareer: "What does my chart say about my career?",
      questionLove: "When will I find love?",
      questionFinance: "How can I improve my finances?",
      questionHealth: "What should I know about my health?",
      
      // Gamification & Social Proof
      liveNow: "Live Now",
      peopleChecking: "people checking their charts",
      trending: "Trending",
      trendingTopic: "Saturn Transit affecting Capricorns today",
      cosmicScore: "Cosmic Score",
      dailyStreak: "Daily Streak",
      days: "days",
      unlockBadge: "Unlock your first badge!",
      
      // Viral Compatibility Check
      compatibilityCheck: "Compatibility Check",
      compatibilityDesc: "See your cosmic compatibility with anyone",
      yourBirthday: "Your Birthday",
      theirBirthday: "Their Birthday",
      checkCompatibility: "Check Compatibility",
      
      // Visual Elements
      starfieldTitle: "Explore the Cosmos",
      particleEffect: "Cosmic particles",
      
      // Stats with Animation
      liveStats: "Live Statistics",
      chartsToday: "Charts generated today",
      activeUsers: "Active users now",
      questionsAnswered: "Questions answered",
      
      // Call to Action
      startJourney: "Start Your Cosmic Journey",
      freeForever: "Free Forever",
      noCardRequired: "No credit card required",
      instantResults: "Instant results"
    }
  },
  hi: {
    homeRedesign: {
      // New Hero Section - Single Powerful Hook
      heroMainTitle: "जानें {year} आपके लिए क्या लेकर आया है",
      heroSubtitle: "अपना जन्म विवरण दर्ज करें और 60 सेकंड में अपनी व्यक्तिगत ब्रह्मांडीय प्रोफाइल प्राप्त करें",
      heroFormTitle: "अपना मुफ्त ब्रह्मांडीय पठन प्राप्त करें",
      
      // Birth Form Fields
      birthDate: "जन्म तिथि",
      birthTime: "जन्म समय",
      birthPlace: "जन्म स्थान",
      selectDate: "तिथि चुनें",
      selectTime: "समय चुनें",
      enterCity: "शहर का नाम दर्ज करें",
      generateProfile: "मेरी ब्रह्मांडीय प्रोफाइल बनाएं",
      generating: "बना रहे हैं...",
      
      // Cosmic Profile Card (Viral Element)
      cosmicProfileTitle: "आपकी ब्रह्मांडीय प्रोफाइल",
      cosmicDna: "आपका ब्रह्मांडीय DNA",
      shareCosmicDna: "अपना ब्रह्मांडीय DNA साझा करें",
      predictionYear: "आपकी {year} भविष्यवाणी",
      downloadCard: "कार्ड डाउनलोड करें",
      shareOnSocial: "सोशल पर साझा करें",
      copyLink: "लिंक कॉपी करें",
      linkCopied: "लिंक कॉपी हो गया!",
      scanToView: "पूर्ण पठन देखने के लिए स्कैन करें",
      
      // Life Journeys (Simplified Navigation)
      lifeJourneys: "जीवन यात्राएं",
      loveJourney: "प्रेम और संबंध",
      loveJourneyDesc: "अपना आदर्श साथी और संबंध अंतर्दृष्टि खोजें",
      careerJourney: "करियर और धन",
      careerJourneyDesc: "अपनी पेशेवर क्षमता और वित्तीय विकास को अनलॉक करें",
      dailyJourney: "दैनिक मार्गदर्शन",
      dailyJourneyDesc: "दैनिक ब्रह्मांडीय अंतर्दृष्टि और शुभ समय प्राप्त करें",
      deepDiveJourney: "गहन अध्ययन",
      deepDiveJourneyDesc: "गंभीर ज्योतिष उत्साही लोगों के लिए उन्नत उपकरण",
      exploreMore: "और जानें",
      
      // Today's Cosmic Energy Section
      todayEnergy: "आज की ब्रह्मांडीय ऊर्जा",
      todayEnergyDesc: "ग्रहों की स्थिति के आधार पर व्यक्तिगत दैनिक अंतर्दृष्टि",
      energyScore: "ऊर्जा स्कोर",
      luckyHours: "भाग्यशाली घंटे",
      todayMood: "आज का मूड",
      planetaryInfluence: "ग्रहों का प्रभाव",
      enterBirthDetails: "व्यक्तिगत ऊर्जा देखने के लिए ऊपर अपना जन्म विवरण दर्ज करें",
      
      // AI Astrologer Hub
      askTheStars: "तारों से पूछें",
      aiHubTitle: "आपका व्यक्तिगत AI ज्योतिषी",
      aiHubDesc: "किसी भी ज्योतिष प्रश्न का तुरंत उत्तर पाएं",
      askAnything: "अपने भविष्य के बारे में कुछ भी पूछें...",
      popularQuestions: "लोकप्रिय प्रश्न",
      questionCareer: "मेरी कुंडली मेरे करियर के बारे में क्या कहती है?",
      questionLove: "मुझे प्यार कब मिलेगा?",
      questionFinance: "मैं अपनी वित्तीय स्थिति कैसे सुधार सकता हूं?",
      questionHealth: "मुझे अपने स्वास्थ्य के बारे में क्या जानना चाहिए?",
      
      // Gamification & Social Proof
      liveNow: "अभी लाइव",
      peopleChecking: "लोग अपनी कुंडली देख रहे हैं",
      trending: "ट्रेंडिंग",
      trendingTopic: "शनि गोचर आज मकर राशि को प्रभावित कर रहा है",
      cosmicScore: "ब्रह्मांडीय स्कोर",
      dailyStreak: "दैनिक स्ट्रीक",
      days: "दिन",
      unlockBadge: "अपना पहला बैज अनलॉक करें!",
      
      // Viral Compatibility Check
      compatibilityCheck: "अनुकूलता जांच",
      compatibilityDesc: "किसी के साथ भी अपनी ब्रह्मांडीय अनुकूलता देखें",
      yourBirthday: "आपका जन्मदिन",
      theirBirthday: "उनका जन्मदिन",
      checkCompatibility: "अनुकूलता जांचें",
      
      // Visual Elements
      starfieldTitle: "ब्रह्मांड का अन्वेषण करें",
      particleEffect: "ब्रह्मांडीय कण",
      
      // Stats with Animation
      liveStats: "लाइव आंकड़े",
      chartsToday: "आज बनाई गई कुंडलियां",
      activeUsers: "अभी सक्रिय उपयोगकर्ता",
      questionsAnswered: "उत्तर दिए गए प्रश्न",
      
      // Call to Action
      startJourney: "अपनी ब्रह्मांडीय यात्रा शुरू करें",
      freeForever: "हमेशा मुफ्त",
      noCardRequired: "क्रेडिट कार्ड की आवश्यकता नहीं",
      instantResults: "तुरंत परिणाम"
    }
  },
  ta: {
    homeRedesign: {
      // New Hero Section - Single Powerful Hook
      heroMainTitle: "{year} உங்களுக்கு என்ன வைத்திருக்கிறது என்பதைக் கண்டறியுங்கள்",
      heroSubtitle: "உங்கள் பிறப்பு விவரங்களை உள்ளிட்டு 60 வினாடிகளில் உங்கள் தனிப்பயனாக்கப்பட்ட அண்ட சுயவிவரத்தைப் பெறுங்கள்",
      heroFormTitle: "உங்கள் இலவச அண்ட வாசிப்பைப் பெறுங்கள்",
      
      // Birth Form Fields
      birthDate: "பிறந்த தேதி",
      birthTime: "பிறந்த நேரம்",
      birthPlace: "பிறந்த இடம்",
      selectDate: "தேதியைத் தேர்ந்தெடுக்கவும்",
      selectTime: "நேரத்தைத் தேர்ந்தெடுக்கவும்",
      enterCity: "நகரத்தின் பெயரை உள்ளிடவும்",
      generateProfile: "எனது அண்ட சுயவிவரத்தை உருவாக்கு",
      generating: "உருவாக்குகிறது...",
      
      // Cosmic Profile Card (Viral Element)
      cosmicProfileTitle: "உங்கள் அண்ட சுயவிவரம்",
      cosmicDna: "உங்கள் அண்ட DNA",
      shareCosmicDna: "உங்கள் அண்ட DNA-ஐ பகிரவும்",
      predictionYear: "உங்கள் {year} கணிப்பு",
      downloadCard: "அட்டையைப் பதிவிறக்கவும்",
      shareOnSocial: "சமூக வலைத்தளத்தில் பகிரவும்",
      copyLink: "இணைப்பை நகலெடுக்கவும்",
      linkCopied: "இணைப்பு நகலெடுக்கப்பட்டது!",
      scanToView: "முழு வாசிப்பைக் காண ஸ்கேன் செய்யவும்",
      
      // Life Journeys (Simplified Navigation)
      lifeJourneys: "வாழ்க்கை பயணங்கள்",
      loveJourney: "காதல் & உறவுகள்",
      loveJourneyDesc: "உங்கள் சரியான துணையையும் உறவு நுண்ணறிவுகளையும் கண்டறியுங்கள்",
      careerJourney: "தொழில் & செல்வம்",
      careerJourneyDesc: "உங்கள் தொழில்முறை திறனையும் நிதி வளர்ச்சியையும் திறக்கவும்",
      dailyJourney: "தினசரி வழிகாட்டுதல்",
      dailyJourneyDesc: "தினசரி அண்ட நுண்ணறிவுகளையும் நல்ல நேரங்களையும் பெறுங்கள்",
      deepDiveJourney: "ஆழமான ஆய்வு",
      deepDiveJourneyDesc: "தீவிர ஜோதிட ஆர்வலர்களுக்கான மேம்பட்ட கருவிகள்",
      exploreMore: "மேலும் ஆராயுங்கள்",
      
      // Today's Cosmic Energy Section
      todayEnergy: "இன்றைய அண்ட ஆற்றல்",
      todayEnergyDesc: "கிரக நிலைகளின் அடிப்படையில் தனிப்பயனாக்கப்பட்ட தினசரி நுண்ணறிவுகள்",
      energyScore: "ஆற்றல் மதிப்பெண்",
      luckyHours: "அதிர்ஷ்ட நேரங்கள்",
      todayMood: "இன்றைய மனநிலை",
      planetaryInfluence: "கிரக தாக்கம்",
      enterBirthDetails: "தனிப்பயனாக்கப்பட்ட ஆற்றலைக் காண மேலே உங்கள் பிறப்பு விவரங்களை உள்ளிடவும்",
      
      // AI Astrologer Hub
      askTheStars: "நட்சத்திரங்களிடம் கேளுங்கள்",
      aiHubTitle: "உங்கள் தனிப்பட்ட AI ஜோதிடர்",
      aiHubDesc: "எந்த ஜோதிட கேள்விக்கும் உடனடி பதில்களைப் பெறுங்கள்",
      askAnything: "உங்கள் எதிர்காலத்தைப் பற்றி எதையும் கேளுங்கள்...",
      popularQuestions: "பிரபலமான கேள்விகள்",
      questionCareer: "என் ஜாதகம் என் தொழில் பற்றி என்ன சொல்கிறது?",
      questionLove: "நான் எப்போது காதலைக் கண்டுபிடிப்பேன்?",
      questionFinance: "என் நிதி நிலையை எப்படி மேம்படுத்துவது?",
      questionHealth: "என் ஆரோக்கியத்தைப் பற்றி நான் என்ன தெரிந்து கொள்ள வேண்டும்?",
      
      // Gamification & Social Proof
      liveNow: "இப்போது நேரலை",
      peopleChecking: "பேர் தங்கள் ஜாதகங்களைப் பார்க்கிறார்கள்",
      trending: "டிரெண்டிங்",
      trendingTopic: "சனி கோசாரம் இன்று மகர ராசியை பாதிக்கிறது",
      cosmicScore: "அண்ட மதிப்பெண்",
      dailyStreak: "தினசரி தொடர்",
      days: "நாட்கள்",
      unlockBadge: "உங்கள் முதல் பேட்ஜைத் திறக்கவும்!",
      
      // Viral Compatibility Check
      compatibilityCheck: "பொருத்த சோதனை",
      compatibilityDesc: "யாருடனும் உங்கள் அண்ட பொருத்தத்தைப் பாருங்கள்",
      yourBirthday: "உங்கள் பிறந்தநாள்",
      theirBirthday: "அவர்களின் பிறந்தநாள்",
      checkCompatibility: "பொருத்தத்தைச் சரிபார்க்கவும்",
      
      // Visual Elements
      starfieldTitle: "அண்டத்தை ஆராயுங்கள்",
      particleEffect: "அண்ட துகள்கள்",
      
      // Stats with Animation
      liveStats: "நேரடி புள்ளிவிவரங்கள்",
      chartsToday: "இன்று உருவாக்கப்பட்ட ஜாதகங்கள்",
      activeUsers: "இப்போது செயலில் உள்ள பயனர்கள்",
      questionsAnswered: "பதிலளிக்கப்பட்ட கேள்விகள்",
      
      // Call to Action
      startJourney: "உங்கள் அண்ட பயணத்தைத் தொடங்குங்கள்",
      freeForever: "எப்போதும் இலவசம்",
      noCardRequired: "கிரெடிட் கார்டு தேவையில்லை",
      instantResults: "உடனடி முடிவுகள்"
    }
  },
  te: {
    homeRedesign: {
      // New Hero Section - Single Powerful Hook
      heroMainTitle: "{year} మీ కోసం ఏమి దాచిపెట్టిందో తెలుసుకోండి",
      heroSubtitle: "మీ జన్మ వివరాలను నమోదు చేసి 60 సెకన్లలో మీ వ్యక్తిగత విశ్వ ప్రొఫైల్‌ను పొందండి",
      heroFormTitle: "మీ ఉచిత విశ్వ పఠనాన్ని పొందండి",
      
      // Birth Form Fields
      birthDate: "జన్మ తేదీ",
      birthTime: "జన్మ సమయం",
      birthPlace: "జన్మ స్థలం",
      selectDate: "తేదీని ఎంచుకోండి",
      selectTime: "సమయాన్ని ఎంచుకోండి",
      enterCity: "నగరం పేరు నమోదు చేయండి",
      generateProfile: "నా విశ్వ ప్రొఫైల్‌ను రూపొందించు",
      generating: "రూపొందిస్తోంది...",
      
      // Cosmic Profile Card (Viral Element)
      cosmicProfileTitle: "మీ విశ్వ ప్రొఫైల్",
      cosmicDna: "మీ విశ్వ DNA",
      shareCosmicDna: "మీ విశ్వ DNA ను షేర్ చేయండి",
      predictionYear: "మీ {year} అంచనా",
      downloadCard: "కార్డ్ డౌన్‌లోడ్ చేయండి",
      shareOnSocial: "సోషల్‌లో షేర్ చేయండి",
      copyLink: "లింక్ కాపీ చేయండి",
      linkCopied: "లింక్ కాపీ అయింది!",
      scanToView: "పూర్తి పఠనాన్ని చూడటానికి స్కాన్ చేయండి",
      
      // Life Journeys (Simplified Navigation)
      lifeJourneys: "జీవిత ప్రయాణాలు",
      loveJourney: "ప్రేమ & సంబంధాలు",
      loveJourneyDesc: "మీ సరైన జోడీని మరియు సంబంధ అంతర్దృష్టులను కనుగొనండి",
      careerJourney: "కెరీర్ & సంపద",
      careerJourneyDesc: "మీ వృత్తిపరమైన సామర్థ్యాన్ని మరియు ఆర్థిక వృద్ధిని అన్‌లాక్ చేయండి",
      dailyJourney: "రోజువారీ మార్గదర్శకత్వం",
      dailyJourneyDesc: "రోజువారీ విశ్వ అంతర్దృష్టులు మరియు శుభ సమయాలను పొందండి",
      deepDiveJourney: "లోతైన అధ్యయనం",
      deepDiveJourneyDesc: "తీవ్రమైన జ్యోతిష్య ఔత్సాహికుల కోసం అధునాతన సాధనాలు",
      exploreMore: "మరింత అన్వేషించండి",
      
      // Today's Cosmic Energy Section
      todayEnergy: "నేటి విశ్వ శక్తి",
      todayEnergyDesc: "గ్రహ స్థానాల ఆధారంగా వ్యక్తిగత రోజువారీ అంతర్దృష్టులు",
      energyScore: "శక్తి స్కోర్",
      luckyHours: "అదృష్ట గంటలు",
      todayMood: "నేటి మూడ్",
      planetaryInfluence: "గ్రహ ప్రభావం",
      enterBirthDetails: "వ్యక్తిగత శక్తిని చూడటానికి పైన మీ జన్మ వివరాలను నమోదు చేయండి",
      
      // AI Astrologer Hub
      askTheStars: "నక్షత్రాలను అడగండి",
      aiHubTitle: "మీ వ్యక్తిగత AI జ్యోతిష్కుడు",
      aiHubDesc: "ఏదైనా జ్యోతిష్య ప్రశ్నకు తక్షణ సమాధానాలు పొందండి",
      askAnything: "మీ భవిష్యత్తు గురించి ఏదైనా అడగండి...",
      popularQuestions: "ప్రసిద్ధ ప్రశ్నలు",
      questionCareer: "నా జాతకం నా కెరీర్ గురించి ఏమి చెబుతుంది?",
      questionLove: "నాకు ప్రేమ ఎప్పుడు దొరుకుతుంది?",
      questionFinance: "నా ఆర్థిక పరిస్థితిని ఎలా మెరుగుపరచుకోవాలి?",
      questionHealth: "నా ఆరోగ్యం గురించి నేను ఏమి తెలుసుకోవాలి?",
      
      // Gamification & Social Proof
      liveNow: "ఇప్పుడు లైవ్",
      peopleChecking: "మంది తమ జాతకాలను చూస్తున్నారు",
      trending: "ట్రెండింగ్",
      trendingTopic: "శని గోచారం ఈరోజు మకర రాశిని ప్రభావితం చేస్తోంది",
      cosmicScore: "విశ్వ స్కోర్",
      dailyStreak: "రోజువారీ స్ట్రీక్",
      days: "రోజులు",
      unlockBadge: "మీ మొదటి బ్యాడ్జ్‌ను అన్‌లాక్ చేయండి!",
      
      // Viral Compatibility Check
      compatibilityCheck: "అనుకూలత తనిఖీ",
      compatibilityDesc: "ఎవరితోనైనా మీ విశ్వ అనుకూలతను చూడండి",
      yourBirthday: "మీ పుట్టినరోజు",
      theirBirthday: "వారి పుట్టినరోజు",
      checkCompatibility: "అనుకూలతను తనిఖీ చేయండి",
      
      // Visual Elements
      starfieldTitle: "విశ్వాన్ని అన్వేషించండి",
      particleEffect: "విశ్వ కణాలు",
      
      // Stats with Animation
      liveStats: "లైవ్ గణాంకాలు",
      chartsToday: "ఈరోజు రూపొందించిన జాతకాలు",
      activeUsers: "ఇప్పుడు యాక్టివ్ యూజర్లు",
      questionsAnswered: "సమాధానమిచ్చిన ప్రశ్నలు",
      
      // Call to Action
      startJourney: "మీ విశ్వ ప్రయాణాన్ని ప్రారంభించండి",
      freeForever: "ఎప్పటికీ ఉచితం",
      noCardRequired: "క్రెడిట్ కార్డ్ అవసరం లేదు",
      instantResults: "తక్షణ ఫలితాలు"
    }
  },
  bn: {
    homeRedesign: {
      // New Hero Section - Single Powerful Hook
      heroMainTitle: "{year} আপনার জন্য কী নিয়ে এসেছে তা জানুন",
      heroSubtitle: "আপনার জন্ম বিবরণ দিন এবং 60 সেকেন্ডে আপনার ব্যক্তিগত মহাজাগতিক প্রোফাইল পান",
      heroFormTitle: "আপনার বিনামূল্যে মহাজাগতিক পাঠ পান",
      
      // Birth Form Fields
      birthDate: "জন্ম তারিখ",
      birthTime: "জন্ম সময়",
      birthPlace: "জন্মস্থান",
      selectDate: "তারিখ নির্বাচন করুন",
      selectTime: "সময় নির্বাচন করুন",
      enterCity: "শহরের নাম লিখুন",
      generateProfile: "আমার মহাজাগতিক প্রোফাইল তৈরি করুন",
      generating: "তৈরি হচ্ছে...",
      
      // Cosmic Profile Card (Viral Element)
      cosmicProfileTitle: "আপনার মহাজাগতিক প্রোফাইল",
      cosmicDna: "আপনার মহাজাগতিক DNA",
      shareCosmicDna: "আপনার মহাজাগতিক DNA শেয়ার করুন",
      predictionYear: "আপনার {year} ভবিষ্যদ্বাণী",
      downloadCard: "কার্ড ডাউনলোড করুন",
      shareOnSocial: "সোশ্যালে শেয়ার করুন",
      copyLink: "লিংক কপি করুন",
      linkCopied: "লিংক কপি হয়েছে!",
      scanToView: "সম্পূর্ণ পাঠ দেখতে স্ক্যান করুন",
      
      // Life Journeys (Simplified Navigation)
      lifeJourneys: "জীবন যাত্রা",
      loveJourney: "প্রেম ও সম্পর্ক",
      loveJourneyDesc: "আপনার আদর্শ সঙ্গী এবং সম্পর্কের অন্তর্দৃষ্টি খুঁজুন",
      careerJourney: "ক্যারিয়ার ও সম্পদ",
      careerJourneyDesc: "আপনার পেশাদার সম্ভাবনা এবং আর্থিক বৃদ্ধি আনলক করুন",
      dailyJourney: "দৈনিক নির্দেশনা",
      dailyJourneyDesc: "দৈনিক মহাজাগতিক অন্তর্দৃষ্টি এবং শুভ সময় পান",
      deepDiveJourney: "গভীর অধ্যয়ন",
      deepDiveJourneyDesc: "গুরুতর জ্যোতিষ উত্সাহীদের জন্য উন্নত সরঞ্জাম",
      exploreMore: "আরও অন্বেষণ করুন",
      
      // Today's Cosmic Energy Section
      todayEnergy: "আজকের মহাজাগতিক শক্তি",
      todayEnergyDesc: "গ্রহের অবস্থানের উপর ভিত্তি করে ব্যক্তিগত দৈনিক অন্তর্দৃষ্টি",
      energyScore: "শক্তি স্কোর",
      luckyHours: "ভাগ্যবান ঘন্টা",
      todayMood: "আজকের মেজাজ",
      planetaryInfluence: "গ্রহের প্রভাব",
      enterBirthDetails: "ব্যক্তিগত শক্তি দেখতে উপরে আপনার জন্ম বিবরণ দিন",
      
      // AI Astrologer Hub
      askTheStars: "তারাদের জিজ্ঞাসা করুন",
      aiHubTitle: "আপনার ব্যক্তিগত AI জ্যোতিষী",
      aiHubDesc: "যেকোনো জ্যোতিষ প্রশ্নের তাৎক্ষণিক উত্তর পান",
      askAnything: "আপনার ভবিষ্যত সম্পর্কে কিছু জিজ্ঞাসা করুন...",
      popularQuestions: "জনপ্রিয় প্রশ্ন",
      questionCareer: "আমার জন্মকুণ্ডলী আমার ক্যারিয়ার সম্পর্কে কী বলে?",
      questionLove: "আমি কখন প্রেম পাব?",
      questionFinance: "আমি কীভাবে আমার আর্থিক অবস্থা উন্নত করতে পারি?",
      questionHealth: "আমার স্বাস্থ্য সম্পর্কে আমার কী জানা উচিত?",
      
      // Gamification & Social Proof
      liveNow: "এখন লাইভ",
      peopleChecking: "জন তাদের জন্মকুণ্ডলী দেখছেন",
      trending: "ট্রেন্ডিং",
      trendingTopic: "শনি গোচর আজ মকর রাশিকে প্রভাবিত করছে",
      cosmicScore: "মহাজাগতিক স্কোর",
      dailyStreak: "দৈনিক স্ট্রিক",
      days: "দিন",
      unlockBadge: "আপনার প্রথম ব্যাজ আনলক করুন!",
      
      // Viral Compatibility Check
      compatibilityCheck: "সামঞ্জস্য পরীক্ষা",
      compatibilityDesc: "যেকোনো ব্যক্তির সাথে আপনার মহাজাগতিক সামঞ্জস্য দেখুন",
      yourBirthday: "আপনার জন্মদিন",
      theirBirthday: "তাদের জন্মদিন",
      checkCompatibility: "সামঞ্জস্য পরীক্ষা করুন",
      
      // Visual Elements
      starfieldTitle: "মহাবিশ্ব অন্বেষণ করুন",
      particleEffect: "মহাজাগতিক কণা",
      
      // Stats with Animation
      liveStats: "লাইভ পরিসংখ্যান",
      chartsToday: "আজ তৈরি জন্মকুণ্ডলী",
      activeUsers: "এখন সক্রিয় ব্যবহারকারী",
      questionsAnswered: "উত্তর দেওয়া প্রশ্ন",
      
      // Call to Action
      startJourney: "আপনার মহাজাগতিক যাত্রা শুরু করুন",
      freeForever: "চিরকাল বিনামূল্যে",
      noCardRequired: "ক্রেডিট কার্ডের প্রয়োজন নেই",
      instantResults: "তাৎক্ষণিক ফলাফল"
    }
  },
  mr: {
    homeRedesign: {
      // New Hero Section - Single Powerful Hook
      heroMainTitle: "{year} तुमच्यासाठी काय घेऊन आले आहे ते जाणून घ्या",
      heroSubtitle: "तुमचे जन्म तपशील प्रविष्ट करा आणि 60 सेकंदात तुमचे वैयक्तिक वैश्विक प्रोफाइल मिळवा",
      heroFormTitle: "तुमचे मोफत वैश्विक वाचन मिळवा",
      
      // Birth Form Fields
      birthDate: "जन्म तारीख",
      birthTime: "जन्म वेळ",
      birthPlace: "जन्मस्थान",
      selectDate: "तारीख निवडा",
      selectTime: "वेळ निवडा",
      enterCity: "शहराचे नाव प्रविष्ट करा",
      generateProfile: "माझे वैश्विक प्रोफाइल तयार करा",
      generating: "तयार करत आहे...",
      
      // Cosmic Profile Card (Viral Element)
      cosmicProfileTitle: "तुमचे वैश्विक प्रोफाइल",
      cosmicDna: "तुमचा वैश्विक DNA",
      shareCosmicDna: "तुमचा वैश्विक DNA शेअर करा",
      predictionYear: "तुमचे {year} भविष्य",
      downloadCard: "कार्ड डाउनलोड करा",
      shareOnSocial: "सोशलवर शेअर करा",
      copyLink: "लिंक कॉपी करा",
      linkCopied: "लिंक कॉपी झाली!",
      scanToView: "संपूर्ण वाचन पाहण्यासाठी स्कॅन करा",
      
      // Life Journeys (Simplified Navigation)
      lifeJourneys: "जीवन प्रवास",
      loveJourney: "प्रेम आणि नातेसंबंध",
      loveJourneyDesc: "तुमचा योग्य जोडीदार आणि नातेसंबंध अंतर्दृष्टी शोधा",
      careerJourney: "करिअर आणि संपत्ती",
      careerJourneyDesc: "तुमची व्यावसायिक क्षमता आणि आर्थिक वाढ अनलॉक करा",
      dailyJourney: "दैनिक मार्गदर्शन",
      dailyJourneyDesc: "दैनिक वैश्विक अंतर्दृष्टी आणि शुभ वेळा मिळवा",
      deepDiveJourney: "सखोल अभ्यास",
      deepDiveJourneyDesc: "गंभीर ज्योतिष उत्साही लोकांसाठी प्रगत साधने",
      exploreMore: "अधिक शोधा",
      
      // Today's Cosmic Energy Section
      todayEnergy: "आजची वैश्विक ऊर्जा",
      todayEnergyDesc: "ग्रहांच्या स्थानांवर आधारित वैयक्तिक दैनिक अंतर्दृष्टी",
      energyScore: "ऊर्जा स्कोअर",
      luckyHours: "भाग्यशाली तास",
      todayMood: "आजचा मूड",
      planetaryInfluence: "ग्रहांचा प्रभाव",
      enterBirthDetails: "वैयक्तिक ऊर्जा पाहण्यासाठी वर तुमचे जन्म तपशील प्रविष्ट करा",
      
      // AI Astrologer Hub
      askTheStars: "ताऱ्यांना विचारा",
      aiHubTitle: "तुमचा वैयक्तिक AI ज्योतिषी",
      aiHubDesc: "कोणत्याही ज्योतिष प्रश्नाचे त्वरित उत्तर मिळवा",
      askAnything: "तुमच्या भविष्याबद्दल काहीही विचारा...",
      popularQuestions: "लोकप्रिय प्रश्न",
      questionCareer: "माझी कुंडली माझ्या करिअरबद्दल काय सांगते?",
      questionLove: "मला प्रेम कधी मिळेल?",
      questionFinance: "मी माझी आर्थिक स्थिती कशी सुधारू शकतो?",
      questionHealth: "माझ्या आरोग्याबद्दल मला काय माहित असले पाहिजे?",
      
      // Gamification & Social Proof
      liveNow: "आता लाइव्ह",
      peopleChecking: "लोक त्यांच्या कुंडल्या पाहत आहेत",
      trending: "ट्रेंडिंग",
      trendingTopic: "शनि गोचर आज मकर राशीवर परिणाम करत आहे",
      cosmicScore: "वैश्विक स्कोअर",
      dailyStreak: "दैनिक स्ट्रीक",
      days: "दिवस",
      unlockBadge: "तुमचा पहिला बॅज अनलॉक करा!",
      
      // Viral Compatibility Check
      compatibilityCheck: "सुसंगतता तपासणी",
      compatibilityDesc: "कोणाशीही तुमची वैश्विक सुसंगतता पहा",
      yourBirthday: "तुमचा वाढदिवस",
      theirBirthday: "त्यांचा वाढदिवस",
      checkCompatibility: "सुसंगतता तपासा",
      
      // Visual Elements
      starfieldTitle: "विश्व शोधा",
      particleEffect: "वैश्विक कण",
      
      // Stats with Animation
      liveStats: "लाइव्ह आकडेवारी",
      chartsToday: "आज तयार केलेल्या कुंडल्या",
      activeUsers: "आता सक्रिय वापरकर्ते",
      questionsAnswered: "उत्तर दिलेले प्रश्न",
      
      // Call to Action
      startJourney: "तुमचा वैश्विक प्रवास सुरू करा",
      freeForever: "कायमचे मोफत",
      noCardRequired: "क्रेडिट कार्डची आवश्यकता नाही",
      instantResults: "त्वरित परिणाम"
    }
  },
  gu: {
    homeRedesign: {
      // New Hero Section - Single Powerful Hook
      heroMainTitle: "{year} તમારા માટે શું લાવ્યું છે તે જાણો",
      heroSubtitle: "તમારી જન્મ વિગતો દાખલ કરો અને 60 સેકન્ડમાં તમારી વ્યક્તિગત બ્રહ્માંડીય પ્રોફાઇલ મેળવો",
      heroFormTitle: "તમારું મફત બ્રહ્માંડીય વાંચન મેળવો",
      
      // Birth Form Fields
      birthDate: "જન્મ તારીખ",
      birthTime: "જન્મ સમય",
      birthPlace: "જન્મ સ્થળ",
      selectDate: "તારીખ પસંદ કરો",
      selectTime: "સમય પસંદ કરો",
      enterCity: "શહેરનું નામ દાખલ કરો",
      generateProfile: "મારી બ્રહ્માંડીય પ્રોફાઇલ બનાવો",
      generating: "બનાવી રહ્યા છીએ...",
      
      // Cosmic Profile Card (Viral Element)
      cosmicProfileTitle: "તમારી બ્રહ્માંડીય પ્રોફાઇલ",
      cosmicDna: "તમારો બ્રહ્માંડીય DNA",
      shareCosmicDna: "તમારો બ્રહ્માંડીય DNA શેર કરો",
      predictionYear: "તમારી {year} આગાહી",
      downloadCard: "કાર્ડ ડાઉનલોડ કરો",
      shareOnSocial: "સોશિયલ પર શેર કરો",
      copyLink: "લિંક કોપી કરો",
      linkCopied: "લિંક કોપી થઈ!",
      scanToView: "સંપૂર્ણ વાંચન જોવા સ્કેન કરો",
      
      // Life Journeys (Simplified Navigation)
      lifeJourneys: "જીવન યાત્રાઓ",
      loveJourney: "પ્રેમ અને સંબંધો",
      loveJourneyDesc: "તમારા યોગ્ય સાથી અને સંબંધ આંતરદૃષ્ટિ શોધો",
      careerJourney: "કારકિર્દી અને સંપત્તિ",
      careerJourneyDesc: "તમારી વ્યાવસાયિક ક્ષમતા અને નાણાકીય વૃદ્ધિ અનલૉક કરો",
      dailyJourney: "દૈનિક માર્ગદર્શન",
      dailyJourneyDesc: "દૈનિક બ્રહ્માંડીય આંતરદૃષ્ટિ અને શુભ સમય મેળવો",
      deepDiveJourney: "ઊંડો અભ્યાસ",
      deepDiveJourneyDesc: "ગંભીર જ્યોતિષ ઉત્સાહીઓ માટે અદ્યતન સાધનો",
      exploreMore: "વધુ શોધો",
      
      // Today's Cosmic Energy Section
      todayEnergy: "આજની બ્રહ્માંડીય ઊર્જા",
      todayEnergyDesc: "ગ્રહોની સ્થિતિના આધારે વ્યક્તિગત દૈનિક આંતરદૃષ્ટિ",
      energyScore: "ઊર્જા સ્કોર",
      luckyHours: "નસીબદાર કલાકો",
      todayMood: "આજનો મૂડ",
      planetaryInfluence: "ગ્રહોનો પ્રભાવ",
      enterBirthDetails: "વ્યક્તિગત ઊર્જા જોવા ઉપર તમારી જન્મ વિગતો દાખલ કરો",
      
      // AI Astrologer Hub
      askTheStars: "તારાઓને પૂછો",
      aiHubTitle: "તમારા વ્યક્તિગત AI જ્યોતિષી",
      aiHubDesc: "કોઈપણ જ્યોતિષ પ્રશ્નના તાત્કાલિક જવાબો મેળવો",
      askAnything: "તમારા ભવિષ્ય વિશે કંઈપણ પૂછો...",
      popularQuestions: "લોકપ્રિય પ્રશ્નો",
      questionCareer: "મારી કુંડળી મારી કારકિર્દી વિશે શું કહે છે?",
      questionLove: "મને પ્રેમ ક્યારે મળશે?",
      questionFinance: "હું મારી નાણાકીય સ્થિતિ કેવી રીતે સુધારી શકું?",
      questionHealth: "મારા સ્વાસ્થ્ય વિશે મારે શું જાણવું જોઈએ?",
      
      // Gamification & Social Proof
      liveNow: "હમણાં લાઇવ",
      peopleChecking: "લોકો તેમની કુંડળીઓ જોઈ રહ્યા છે",
      trending: "ટ્રેન્ડિંગ",
      trendingTopic: "શનિ ગોચર આજે મકર રાશિને અસર કરી રહ્યો છે",
      cosmicScore: "બ્રહ્માંડીય સ્કોર",
      dailyStreak: "દૈનિક સ્ટ્રીક",
      days: "દિવસો",
      unlockBadge: "તમારો પહેલો બેજ અનલૉક કરો!",
      
      // Viral Compatibility Check
      compatibilityCheck: "સુસંગતતા તપાસ",
      compatibilityDesc: "કોઈની સાથે પણ તમારી બ્રહ્માંડીય સુસંગતતા જુઓ",
      yourBirthday: "તમારો જન્મદિવસ",
      theirBirthday: "તેમનો જન્મદિવસ",
      checkCompatibility: "સુસંગતતા તપાસો",
      
      // Visual Elements
      starfieldTitle: "બ્રહ્માંડ શોધો",
      particleEffect: "બ્રહ્માંડીય કણો",
      
      // Stats with Animation
      liveStats: "લાઇવ આંકડા",
      chartsToday: "આજે બનાવેલી કુંડળીઓ",
      activeUsers: "હમણાં સક્રિય વપરાશકર્તાઓ",
      questionsAnswered: "જવાબ આપેલા પ્રશ્નો",
      
      // Call to Action
      startJourney: "તમારી બ્રહ્માંડીય યાત્રા શરૂ કરો",
      freeForever: "હંમેશા મફત",
      noCardRequired: "ક્રેડિટ કાર્ડની જરૂર નથી",
      instantResults: "તાત્કાલિક પરિણામો"
    }
  },
  kn: {
    homeRedesign: {
      // New Hero Section - Single Powerful Hook
      heroMainTitle: "{year} ನಿಮಗಾಗಿ ಏನು ತಂದಿದೆ ಎಂದು ತಿಳಿಯಿರಿ",
      heroSubtitle: "ನಿಮ್ಮ ಜನ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಮತ್ತು 60 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿಶ್ವ ಪ್ರೊಫೈಲ್ ಪಡೆಯಿರಿ",
      heroFormTitle: "ನಿಮ್ಮ ಉಚಿತ ವಿಶ್ವ ಓದುವಿಕೆ ಪಡೆಯಿರಿ",
      
      // Birth Form Fields
      birthDate: "ಜನ್ಮ ದಿನಾಂಕ",
      birthTime: "ಜನ್ಮ ಸಮಯ",
      birthPlace: "ಜನ್ಮ ಸ್ಥಳ",
      selectDate: "ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ",
      selectTime: "ಸಮಯ ಆಯ್ಕೆಮಾಡಿ",
      enterCity: "ನಗರದ ಹೆಸರು ನಮೂದಿಸಿ",
      generateProfile: "ನನ್ನ ವಿಶ್ವ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ",
      generating: "ರಚಿಸಲಾಗುತ್ತಿದೆ...",
      
      // Cosmic Profile Card (Viral Element)
      cosmicProfileTitle: "ನಿಮ್ಮ ವಿಶ್ವ ಪ್ರೊಫೈಲ್",
      cosmicDna: "ನಿಮ್ಮ ವಿಶ್ವ DNA",
      shareCosmicDna: "ನಿಮ್ಮ ವಿಶ್ವ DNA ಹಂಚಿಕೊಳ್ಳಿ",
      predictionYear: "ನಿಮ್ಮ {year} ಭವಿಷ್ಯ",
      downloadCard: "ಕಾರ್ಡ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
      shareOnSocial: "ಸೋಶಿಯಲ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",
      copyLink: "ಲಿಂಕ್ ನಕಲಿಸಿ",
      linkCopied: "ಲಿಂಕ್ ನಕಲಾಗಿದೆ!",
      scanToView: "ಸಂಪೂರ್ಣ ಓದುವಿಕೆ ನೋಡಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
      
      // Life Journeys (Simplified Navigation)
      lifeJourneys: "ಜೀವನ ಪ್ರಯಾಣಗಳು",
      loveJourney: "ಪ್ರೀತಿ ಮತ್ತು ಸಂಬಂಧಗಳು",
      loveJourneyDesc: "ನಿಮ್ಮ ಸರಿಯಾದ ಜೋಡಿ ಮತ್ತು ಸಂಬಂಧ ಒಳನೋಟಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ",
      careerJourney: "ವೃತ್ತಿ ಮತ್ತು ಸಂಪತ್ತು",
      careerJourneyDesc: "ನಿಮ್ಮ ವೃತ್ತಿಪರ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಆರ್ಥಿಕ ಬೆಳವಣಿಗೆಯನ್ನು ಅನ್‌ಲಾಕ್ ಮಾಡಿ",
      dailyJourney: "ದೈನಂದಿನ ಮಾರ್ಗದರ್ಶನ",
      dailyJourneyDesc: "ದೈನಂದಿನ ವಿಶ್ವ ಒಳನೋಟಗಳು ಮತ್ತು ಶುಭ ಸಮಯಗಳನ್ನು ಪಡೆಯಿರಿ",
      deepDiveJourney: "ಆಳವಾದ ಅಧ್ಯಯನ",
      deepDiveJourneyDesc: "ಗಂಭೀರ ಜ್ಯೋತಿಷ್ಯ ಉತ್ಸಾಹಿಗಳಿಗೆ ಸುಧಾರಿತ ಸಾಧನಗಳು",
      exploreMore: "ಇನ್ನಷ್ಟು ಅನ್ವೇಷಿಸಿ",
      
      // Today's Cosmic Energy Section
      todayEnergy: "ಇಂದಿನ ವಿಶ್ವ ಶಕ್ತಿ",
      todayEnergyDesc: "ಗ್ರಹ ಸ್ಥಾನಗಳ ಆಧಾರದ ಮೇಲೆ ವೈಯಕ್ತಿಕ ದೈನಂದಿನ ಒಳನೋಟಗಳು",
      energyScore: "ಶಕ್ತಿ ಸ್ಕೋರ್",
      luckyHours: "ಅದೃಷ್ಟದ ಗಂಟೆಗಳು",
      todayMood: "ಇಂದಿನ ಮೂಡ್",
      planetaryInfluence: "ಗ್ರಹಗಳ ಪ್ರಭಾವ",
      enterBirthDetails: "ವೈಯಕ್ತಿಕ ಶಕ್ತಿ ನೋಡಲು ಮೇಲೆ ನಿಮ್ಮ ಜನ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ",
      
      // AI Astrologer Hub
      askTheStars: "ನಕ್ಷತ್ರಗಳನ್ನು ಕೇಳಿ",
      aiHubTitle: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ AI ಜ್ಯೋತಿಷಿ",
      aiHubDesc: "ಯಾವುದೇ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಗೆ ತಕ್ಷಣ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ",
      askAnything: "ನಿಮ್ಮ ಭವಿಷ್ಯದ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ...",
      popularQuestions: "ಜನಪ್ರಿಯ ಪ್ರಶ್ನೆಗಳು",
      questionCareer: "ನನ್ನ ಜಾತಕ ನನ್ನ ವೃತ್ತಿಯ ಬಗ್ಗೆ ಏನು ಹೇಳುತ್ತದೆ?",
      questionLove: "ನನಗೆ ಪ್ರೀತಿ ಯಾವಾಗ ಸಿಗುತ್ತದೆ?",
      questionFinance: "ನನ್ನ ಆರ್ಥಿಕ ಸ್ಥಿತಿಯನ್ನು ಹೇಗೆ ಸುಧಾರಿಸಬಹುದು?",
      questionHealth: "ನನ್ನ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ನಾನು ಏನು ತಿಳಿದುಕೊಳ್ಳಬೇಕು?",
      
      // Gamification & Social Proof
      liveNow: "ಈಗ ಲೈವ್",
      peopleChecking: "ಜನರು ತಮ್ಮ ಜಾತಕಗಳನ್ನು ನೋಡುತ್ತಿದ್ದಾರೆ",
      trending: "ಟ್ರೆಂಡಿಂಗ್",
      trendingTopic: "ಶನಿ ಗೋಚಾರ ಇಂದು ಮಕರ ರಾಶಿಯನ್ನು ಪ್ರಭಾವಿಸುತ್ತಿದೆ",
      cosmicScore: "ವಿಶ್ವ ಸ್ಕೋರ್",
      dailyStreak: "ದೈನಂದಿನ ಸ್ಟ್ರೀಕ್",
      days: "ದಿನಗಳು",
      unlockBadge: "ನಿಮ್ಮ ಮೊದಲ ಬ್ಯಾಡ್ಜ್ ಅನ್‌ಲಾಕ್ ಮಾಡಿ!",
      
      // Viral Compatibility Check
      compatibilityCheck: "ಹೊಂದಾಣಿಕೆ ಪರಿಶೀಲನೆ",
      compatibilityDesc: "ಯಾರೊಂದಿಗಾದರೂ ನಿಮ್ಮ ವಿಶ್ವ ಹೊಂದಾಣಿಕೆ ನೋಡಿ",
      yourBirthday: "ನಿಮ್ಮ ಹುಟ್ಟುಹಬ್ಬ",
      theirBirthday: "ಅವರ ಹುಟ್ಟುಹಬ್ಬ",
      checkCompatibility: "ಹೊಂದಾಣಿಕೆ ಪರಿಶೀಲಿಸಿ",
      
      // Visual Elements
      starfieldTitle: "ವಿಶ್ವವನ್ನು ಅನ್ವೇಷಿಸಿ",
      particleEffect: "ವಿಶ್ವ ಕಣಗಳು",
      
      // Stats with Animation
      liveStats: "ಲೈವ್ ಅಂಕಿಅಂಶಗಳು",
      chartsToday: "ಇಂದು ರಚಿಸಿದ ಜಾತಕಗಳು",
      activeUsers: "ಈಗ ಸಕ್ರಿಯ ಬಳಕೆದಾರರು",
      questionsAnswered: "ಉತ್ತರಿಸಿದ ಪ್ರಶ್ನೆಗಳು",
      
      // Call to Action
      startJourney: "ನಿಮ್ಮ ವಿಶ್ವ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ",
      freeForever: "ಶಾಶ್ವತವಾಗಿ ಉಚಿತ",
      noCardRequired: "ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ",
      instantResults: "ತಕ್ಷಣ ಫಲಿತಾಂಶಗಳು"
    }
  },
  ml: {
    homeRedesign: {
      // New Hero Section - Single Powerful Hook
      heroMainTitle: "{year} നിങ്ങൾക്കായി എന്താണ് കരുതിവച്ചിരിക്കുന്നതെന്ന് കണ്ടെത്തുക",
      heroSubtitle: "നിങ്ങളുടെ ജനന വിവരങ്ങൾ നൽകി 60 സെക്കൻഡിൽ നിങ്ങളുടെ വ്യക്തിഗത പ്രപഞ്ച പ്രൊഫൈൽ നേടുക",
      heroFormTitle: "നിങ്ങളുടെ സൗജന്യ പ്രപഞ്ച വായന നേടുക",
      
      // Birth Form Fields
      birthDate: "ജനന തീയതി",
      birthTime: "ജനന സമയം",
      birthPlace: "ജനന സ്ഥലം",
      selectDate: "തീയതി തിരഞ്ഞെടുക്കുക",
      selectTime: "സമയം തിരഞ്ഞെടുക്കുക",
      enterCity: "നഗരത്തിന്റെ പേര് നൽകുക",
      generateProfile: "എന്റെ പ്രപഞ്ച പ്രൊഫൈൽ സൃഷ്ടിക്കുക",
      generating: "സൃഷ്ടിക്കുന്നു...",
      
      // Cosmic Profile Card (Viral Element)
      cosmicProfileTitle: "നിങ്ങളുടെ പ്രപഞ്ച പ്രൊഫൈൽ",
      cosmicDna: "നിങ്ങളുടെ പ്രപഞ്ച DNA",
      shareCosmicDna: "നിങ്ങളുടെ പ്രപഞ്ച DNA പങ്കിടുക",
      predictionYear: "നിങ്ങളുടെ {year} പ്രവചനം",
      downloadCard: "കാർഡ് ഡൗൺലോഡ് ചെയ്യുക",
      shareOnSocial: "സോഷ്യലിൽ പങ്കിടുക",
      copyLink: "ലിങ്ക് പകർത്തുക",
      linkCopied: "ലിങ്ക് പകർത്തി!",
      scanToView: "പൂർണ്ണ വായന കാണാൻ സ്കാൻ ചെയ്യുക",
      
      // Life Journeys (Simplified Navigation)
      lifeJourneys: "ജീവിത യാത്രകൾ",
      loveJourney: "പ്രണയവും ബന്ധങ്ങളും",
      loveJourneyDesc: "നിങ്ങളുടെ അനുയോജ്യമായ പങ്കാളിയെയും ബന്ധ ഉൾക്കാഴ്ചകളും കണ്ടെത്തുക",
      careerJourney: "കരിയറും സമ്പത്തും",
      careerJourneyDesc: "നിങ്ങളുടെ പ്രൊഫഷണൽ കഴിവും സാമ്പത്തിക വളർച്ചയും അൺലോക്ക് ചെയ്യുക",
      dailyJourney: "ദൈനംദിന മാർഗ്ഗനിർദ്ദേശം",
      dailyJourneyDesc: "ദൈനംദിന പ്രപഞ്ച ഉൾക്കാഴ്ചകളും ശുഭ സമയങ്ങളും നേടുക",
      deepDiveJourney: "ആഴത്തിലുള്ള പഠനം",
      deepDiveJourneyDesc: "ഗൗരവമുള്ള ജ്യോതിഷ ആരാധകർക്കുള്ള വിപുലമായ ഉപകരണങ്ങൾ",
      exploreMore: "കൂടുതൽ പര്യവേക്ഷണം ചെയ്യുക",
      
      // Today's Cosmic Energy Section
      todayEnergy: "ഇന്നത്തെ പ്രപഞ്ച ഊർജ്ജം",
      todayEnergyDesc: "ഗ്രഹ സ്ഥാനങ്ങളെ അടിസ്ഥാനമാക്കിയുള്ള വ്യക്തിഗത ദൈനംദിന ഉൾക്കാഴ്ചകൾ",
      energyScore: "ഊർജ്ജ സ്കോർ",
      luckyHours: "ഭാഗ്യ മണിക്കൂറുകൾ",
      todayMood: "ഇന്നത്തെ മൂഡ്",
      planetaryInfluence: "ഗ്രഹ സ്വാധീനം",
      enterBirthDetails: "വ്യക്തിഗത ഊർജ്ജം കാണാൻ മുകളിൽ നിങ്ങളുടെ ജനന വിവരങ്ങൾ നൽകുക",
      
      // AI Astrologer Hub
      askTheStars: "നക്ഷത്രങ്ങളോട് ചോദിക്കുക",
      aiHubTitle: "നിങ്ങളുടെ വ്യക്തിഗത AI ജ്യോതിഷി",
      aiHubDesc: "ഏതെങ്കിലും ജ്യോതിഷ ചോദ്യത്തിന് തൽക്ഷണ ഉത്തരങ്ങൾ നേടുക",
      askAnything: "നിങ്ങളുടെ ഭാവിയെക്കുറിച്ച് എന്തും ചോദിക്കുക...",
      popularQuestions: "ജനപ്രിയ ചോദ്യങ്ങൾ",
      questionCareer: "എന്റെ ജാതകം എന്റെ കരിയറിനെക്കുറിച്ച് എന്താണ് പറയുന്നത്?",
      questionLove: "എനിക്ക് പ്രണയം എപ്പോൾ കിട്ടും?",
      questionFinance: "എന്റെ സാമ്പത്തിക സ്ഥിതി എങ്ങനെ മെച്ചപ്പെടുത്താം?",
      questionHealth: "എന്റെ ആരോഗ്യത്തെക്കുറിച്ച് ഞാൻ എന്താണ് അറിയേണ്ടത്?",
      
      // Gamification & Social Proof
      liveNow: "ഇപ്പോൾ ലൈവ്",
      peopleChecking: "പേർ അവരുടെ ജാതകങ്ങൾ പരിശോധിക്കുന്നു",
      trending: "ട്രെൻഡിംഗ്",
      trendingTopic: "ശനി ഗോചരം ഇന്ന് മകരം രാശിയെ ബാധിക്കുന്നു",
      cosmicScore: "പ്രപഞ്ച സ്കോർ",
      dailyStreak: "ദൈനംദിന സ്ട്രീക്ക്",
      days: "ദിവസങ്ങൾ",
      unlockBadge: "നിങ്ങളുടെ ആദ്യ ബാഡ്ജ് അൺലോക്ക് ചെയ്യുക!",
      
      // Viral Compatibility Check
      compatibilityCheck: "അനുയോജ്യത പരിശോധന",
      compatibilityDesc: "ആരുമായും നിങ്ങളുടെ പ്രപഞ്ച അനുയോജ്യത കാണുക",
      yourBirthday: "നിങ്ങളുടെ ജന്മദിനം",
      theirBirthday: "അവരുടെ ജന്മദിനം",
      checkCompatibility: "അനുയോജ്യത പരിശോധിക്കുക",
      
      // Visual Elements
      starfieldTitle: "പ്രപഞ്ചം പര്യവേക്ഷണം ചെയ്യുക",
      particleEffect: "പ്രപഞ്ച കണങ്ങൾ",
      
      // Stats with Animation
      liveStats: "ലൈവ് സ്ഥിതിവിവരക്കണക്കുകൾ",
      chartsToday: "ഇന്ന് സൃഷ്ടിച്ച ജാതകങ്ങൾ",
      activeUsers: "ഇപ്പോൾ സജീവ ഉപയോക്താക്കൾ",
      questionsAnswered: "ഉത്തരം നൽകിയ ചോദ്യങ്ങൾ",
      
      // Call to Action
      startJourney: "നിങ്ങളുടെ പ്രപഞ്ച യാത്ര ആരംഭിക്കുക",
      freeForever: "എന്നേക്കും സൗജന്യം",
      noCardRequired: "ക്രെഡിറ്റ് കാർഡ് ആവശ്യമില്ല",
      instantResults: "തൽക്ഷണ ഫലങ്ങൾ"
    }
  },
  pa: {
    homeRedesign: {
      // New Hero Section - Single Powerful Hook
      heroMainTitle: "{year} ਤੁਹਾਡੇ ਲਈ ਕੀ ਲੈ ਕੇ ਆਇਆ ਹੈ ਜਾਣੋ",
      heroSubtitle: "ਆਪਣੇ ਜਨਮ ਵੇਰਵੇ ਦਰਜ ਕਰੋ ਅਤੇ 60 ਸਕਿੰਟਾਂ ਵਿੱਚ ਆਪਣੀ ਨਿੱਜੀ ਬ੍ਰਹਿਮੰਡੀ ਪ੍ਰੋਫਾਈਲ ਪ੍ਰਾਪਤ ਕਰੋ",
      heroFormTitle: "ਆਪਣੀ ਮੁਫ਼ਤ ਬ੍ਰਹਿਮੰਡੀ ਰੀਡਿੰਗ ਪ੍ਰਾਪਤ ਕਰੋ",
      
      // Birth Form Fields
      birthDate: "ਜਨਮ ਮਿਤੀ",
      birthTime: "ਜਨਮ ਸਮਾਂ",
      birthPlace: "ਜਨਮ ਸਥਾਨ",
      selectDate: "ਮਿਤੀ ਚੁਣੋ",
      selectTime: "ਸਮਾਂ ਚੁਣੋ",
      enterCity: "ਸ਼ਹਿਰ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ",
      generateProfile: "ਮੇਰੀ ਬ੍ਰਹਿਮੰਡੀ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ",
      generating: "ਬਣਾ ਰਹੇ ਹਾਂ...",
      
      // Cosmic Profile Card (Viral Element)
      cosmicProfileTitle: "ਤੁਹਾਡੀ ਬ੍ਰਹਿਮੰਡੀ ਪ੍ਰੋਫਾਈਲ",
      cosmicDna: "ਤੁਹਾਡਾ ਬ੍ਰਹਿਮੰਡੀ DNA",
      shareCosmicDna: "ਆਪਣਾ ਬ੍ਰਹਿਮੰਡੀ DNA ਸਾਂਝਾ ਕਰੋ",
      predictionYear: "ਤੁਹਾਡੀ {year} ਭਵਿੱਖਬਾਣੀ",
      downloadCard: "ਕਾਰਡ ਡਾਊਨਲੋਡ ਕਰੋ",
      shareOnSocial: "ਸੋਸ਼ਲ 'ਤੇ ਸਾਂਝਾ ਕਰੋ",
      copyLink: "ਲਿੰਕ ਕਾਪੀ ਕਰੋ",
      linkCopied: "ਲਿੰਕ ਕਾਪੀ ਹੋ ਗਈ!",
      scanToView: "ਪੂਰੀ ਰੀਡਿੰਗ ਦੇਖਣ ਲਈ ਸਕੈਨ ਕਰੋ",
      
      // Life Journeys (Simplified Navigation)
      lifeJourneys: "ਜੀਵਨ ਯਾਤਰਾਵਾਂ",
      loveJourney: "ਪਿਆਰ ਅਤੇ ਰਿਸ਼ਤੇ",
      loveJourneyDesc: "ਆਪਣਾ ਸਹੀ ਸਾਥੀ ਅਤੇ ਰਿਸ਼ਤੇ ਦੀ ਸੂਝ ਲੱਭੋ",
      careerJourney: "ਕਰੀਅਰ ਅਤੇ ਦੌਲਤ",
      careerJourneyDesc: "ਆਪਣੀ ਪੇਸ਼ੇਵਰ ਸਮਰੱਥਾ ਅਤੇ ਵਿੱਤੀ ਵਿਕਾਸ ਨੂੰ ਅਨਲੌਕ ਕਰੋ",
      dailyJourney: "ਰੋਜ਼ਾਨਾ ਮਾਰਗਦਰਸ਼ਨ",
      dailyJourneyDesc: "ਰੋਜ਼ਾਨਾ ਬ੍ਰਹਿਮੰਡੀ ਸੂਝ ਅਤੇ ਸ਼ੁਭ ਸਮੇਂ ਪ੍ਰਾਪਤ ਕਰੋ",
      deepDiveJourney: "ਡੂੰਘਾ ਅਧਿਐਨ",
      deepDiveJourneyDesc: "ਗੰਭੀਰ ਜੋਤਿਸ਼ ਉਤਸ਼ਾਹੀਆਂ ਲਈ ਉੱਨਤ ਸਾਧਨ",
      exploreMore: "ਹੋਰ ਖੋਜੋ",
      
      // Today's Cosmic Energy Section
      todayEnergy: "ਅੱਜ ਦੀ ਬ੍ਰਹਿਮੰਡੀ ਊਰਜਾ",
      todayEnergyDesc: "ਗ੍ਰਹਿਆਂ ਦੀਆਂ ਸਥਿਤੀਆਂ ਦੇ ਆਧਾਰ 'ਤੇ ਨਿੱਜੀ ਰੋਜ਼ਾਨਾ ਸੂਝ",
      energyScore: "ਊਰਜਾ ਸਕੋਰ",
      luckyHours: "ਖੁਸ਼ਕਿਸਮਤ ਘੰਟੇ",
      todayMood: "ਅੱਜ ਦਾ ਮੂਡ",
      planetaryInfluence: "ਗ੍ਰਹਿਆਂ ਦਾ ਪ੍ਰਭਾਵ",
      enterBirthDetails: "ਨਿੱਜੀ ਊਰਜਾ ਦੇਖਣ ਲਈ ਉੱਪਰ ਆਪਣੇ ਜਨਮ ਵੇਰਵੇ ਦਰਜ ਕਰੋ",
      
      // AI Astrologer Hub
      askTheStars: "ਤਾਰਿਆਂ ਨੂੰ ਪੁੱਛੋ",
      aiHubTitle: "ਤੁਹਾਡਾ ਨਿੱਜੀ AI ਜੋਤਿਸ਼ੀ",
      aiHubDesc: "ਕਿਸੇ ਵੀ ਜੋਤਿਸ਼ ਸਵਾਲ ਦਾ ਤੁਰੰਤ ਜਵਾਬ ਪ੍ਰਾਪਤ ਕਰੋ",
      askAnything: "ਆਪਣੇ ਭਵਿੱਖ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ...",
      popularQuestions: "ਪ੍ਰਸਿੱਧ ਸਵਾਲ",
      questionCareer: "ਮੇਰੀ ਕੁੰਡਲੀ ਮੇਰੇ ਕਰੀਅਰ ਬਾਰੇ ਕੀ ਕਹਿੰਦੀ ਹੈ?",
      questionLove: "ਮੈਨੂੰ ਪਿਆਰ ਕਦੋਂ ਮਿਲੇਗਾ?",
      questionFinance: "ਮੈਂ ਆਪਣੀ ਵਿੱਤੀ ਸਥਿਤੀ ਕਿਵੇਂ ਸੁਧਾਰ ਸਕਦਾ ਹਾਂ?",
      questionHealth: "ਮੈਨੂੰ ਆਪਣੀ ਸਿਹਤ ਬਾਰੇ ਕੀ ਪਤਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ?",
      
      // Gamification & Social Proof
      liveNow: "ਹੁਣੇ ਲਾਈਵ",
      peopleChecking: "ਲੋਕ ਆਪਣੀਆਂ ਕੁੰਡਲੀਆਂ ਦੇਖ ਰਹੇ ਹਨ",
      trending: "ਟ੍ਰੈਂਡਿੰਗ",
      trendingTopic: "ਸ਼ਨੀ ਗੋਚਰ ਅੱਜ ਮਕਰ ਰਾਸ਼ੀ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰ ਰਿਹਾ ਹੈ",
      cosmicScore: "ਬ੍ਰਹਿਮੰਡੀ ਸਕੋਰ",
      dailyStreak: "ਰੋਜ਼ਾਨਾ ਸਟ੍ਰੀਕ",
      days: "ਦਿਨ",
      unlockBadge: "ਆਪਣਾ ਪਹਿਲਾ ਬੈਜ ਅਨਲੌਕ ਕਰੋ!",
      
      // Viral Compatibility Check
      compatibilityCheck: "ਅਨੁਕੂਲਤਾ ਜਾਂਚ",
      compatibilityDesc: "ਕਿਸੇ ਨਾਲ ਵੀ ਆਪਣੀ ਬ੍ਰਹਿਮੰਡੀ ਅਨੁਕੂਲਤਾ ਦੇਖੋ",
      yourBirthday: "ਤੁਹਾਡਾ ਜਨਮਦਿਨ",
      theirBirthday: "ਉਨ੍ਹਾਂ ਦਾ ਜਨਮਦਿਨ",
      checkCompatibility: "ਅਨੁਕੂਲਤਾ ਜਾਂਚੋ",
      
      // Visual Elements
      starfieldTitle: "ਬ੍ਰਹਿਮੰਡ ਦੀ ਖੋਜ ਕਰੋ",
      particleEffect: "ਬ੍ਰਹਿਮੰਡੀ ਕਣ",
      
      // Stats with Animation
      liveStats: "ਲਾਈਵ ਅੰਕੜੇ",
      chartsToday: "ਅੱਜ ਬਣਾਈਆਂ ਕੁੰਡਲੀਆਂ",
      activeUsers: "ਹੁਣੇ ਸਰਗਰਮ ਉਪਭੋਗਤਾ",
      questionsAnswered: "ਜਵਾਬ ਦਿੱਤੇ ਸਵਾਲ",
      
      // Call to Action
      startJourney: "ਆਪਣੀ ਬ੍ਰਹਿਮੰਡੀ ਯਾਤਰਾ ਸ਼ੁਰੂ ਕਰੋ",
      freeForever: "ਹਮੇਸ਼ਾ ਮੁਫ਼ਤ",
      noCardRequired: "ਕ੍ਰੈਡਿਟ ਕਾਰਡ ਦੀ ਲੋੜ ਨਹੀਂ",
      instantResults: "ਤੁਰੰਤ ਨਤੀਜੇ"
    }
  }
};

// Deep merge function to combine translation objects
export function deepMergeHomepage(target: TranslationObject, source: TranslationObject): TranslationObject {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMergeHomepage(
        (result[key] as TranslationObject) || {},
        source[key] as TranslationObject
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
