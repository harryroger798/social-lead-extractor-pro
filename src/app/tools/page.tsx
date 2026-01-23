"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Star,
  Moon,
  Sun,
  Heart,
  Users,
  Sparkles,
  Clock,
  TrendingUp,
  Compass,
  Zap,
  Calendar,
  Target,
  Gem,
  Hash,
  Grid3X3,
  Circle,
  Crown,
  Type,
} from "lucide-react";

const toolsTranslations = {
  en: {
    pageTitle: "Free Astrology Tools",
    pageSubtitle: "Explore our comprehensive collection of Vedic astrology calculators and tools",
    freeBadge: "Free",
    tools: {
      kundliCalculator: {
        title: "Kundli Calculator",
        description: "Generate your complete birth chart with planetary positions, houses, and doshas",
      },
      nakshatraFinder: {
        title: "Nakshatra Finder",
        description: "Discover your lunar constellation and its significance",
      },
      horoscopeMatching: {
        title: "Horoscope Matching",
        description: "Check marriage compatibility with detailed Guna Milan analysis",
      },
      moonSignCalculator: {
        title: "Moon Sign Calculator",
        description: "Find your Vedic Moon sign (Chandra Rashi)",
      },
      sunSignCalculator: {
        title: "Sun Sign Calculator",
        description: "Discover your Western zodiac Sun sign",
      },
      ascendantCalculator: {
        title: "Ascendant Calculator",
        description: "Calculate your rising sign (Lagna)",
      },
      loveCalculator: {
        title: "Love Compatibility",
        description: "Check zodiac compatibility with your partner",
      },
      dashaCalculator: {
        title: "Dasha Calculator",
        description: "Calculate Vimshottari Dasha planetary periods",
      },
      navamsaChart: {
        title: "Navamsa Chart",
        description: "Generate D-9 and other divisional charts",
      },
      yogaCalculator: {
        title: "Yoga Calculator",
        description: "Detect Raj Yoga, Dhana Yoga and other planetary combinations",
      },
      muhurtaCalculator: {
        title: "Muhurta Calculator",
        description: "Find auspicious timing for important events",
      },
      transitCalculator: {
        title: "Transit Analysis",
        description: "Analyze current planetary transits (Gochar)",
      },
      mangalDoshCalculator: {
        title: "Mangal Dosh Calculator",
        description: "Check Manglik Dosha in your birth chart",
      },
      sadeSatiCalculator: {
        title: "Sade Sati Calculator",
        description: "Check your Sade Sati status and phase",
      },
      numerologyCalculator: {
        title: "Numerology Calculator",
        description: "Calculate your Life Path and Destiny Numbers",
      },
      yantraRecommendations: {
        title: "Yantra Recommendations",
        description: "Find the right sacred Yantras for spiritual growth",
      },
      rudrakshaRecommendations: {
        title: "Rudraksha Recommendations",
        description: "Discover the ideal Rudraksha beads for you",
      },
      ishtaDevataCalculator: {
        title: "Ishta Devata Calculator",
        description: "Find your personal deity based on birth chart",
      },
      naamRashiCalculator: {
        title: "Naam Rashi Calculator",
        description: "Find your zodiac sign based on your name",
      },
    },
  },
  hi: {
    pageTitle: "मुफ्त ज्योतिष उपकरण",
    pageSubtitle: "वैदिक ज्योतिष कैलकुलेटर और उपकरणों का हमारा व्यापक संग्रह देखें",
    freeBadge: "मुफ्त",
    tools: {
      kundliCalculator: {
        title: "कुंडली कैलकुलेटर",
        description: "ग्रहों की स्थिति, भावों और दोषों के साथ अपनी पूर्ण जन्म कुंडली बनाएं",
      },
      nakshatraFinder: {
        title: "नक्षत्र खोजक",
        description: "अपने चंद्र नक्षत्र और उसके महत्व को जानें",
      },
      horoscopeMatching: {
        title: "कुंडली मिलान",
        description: "विस्तृत गुण मिलान विश्लेषण के साथ विवाह संगतता जांचें",
      },
      moonSignCalculator: {
        title: "चंद्र राशि कैलकुलेटर",
        description: "अपनी वैदिक चंद्र राशि जानें",
      },
      sunSignCalculator: {
        title: "सूर्य राशि कैलकुलेटर",
        description: "अपनी पश्चिमी राशि जानें",
      },
      ascendantCalculator: {
        title: "लग्न कैलकुलेटर",
        description: "अपना उदय लग्न जानें",
      },
      loveCalculator: {
        title: "प्रेम संगतता",
        description: "अपने साथी के साथ राशि संगतता जांचें",
      },
      dashaCalculator: {
        title: "दशा कैलकुलेटर",
        description: "विंशोत्तरी दशा ग्रह काल की गणना करें",
      },
      navamsaChart: {
        title: "नवांश चार्ट",
        description: "D-9 और अन्य विभागीय चार्ट बनाएं",
      },
      yogaCalculator: {
        title: "योग कैलकुलेटर",
        description: "राज योग, धन योग और अन्य ग्रह संयोजन खोजें",
      },
      muhurtaCalculator: {
        title: "मुहूर्त कैलकुलेटर",
        description: "महत्वपूर्ण कार्यों के लिए शुभ समय खोजें",
      },
      transitCalculator: {
        title: "गोचर विश्लेषण",
        description: "वर्तमान ग्रह गोचर का विश्लेषण करें",
      },
      mangalDoshCalculator: {
        title: "मंगल दोष कैलकुलेटर",
        description: "अपनी जन्म कुंडली में मांगलिक दोष जांचें",
      },
      sadeSatiCalculator: {
        title: "साढ़े साती कैलकुलेटर",
        description: "अपनी साढ़े साती स्थिति और चरण जांचें",
      },
      numerologyCalculator: {
        title: "अंक ज्योतिष कैलकुलेटर",
        description: "अपना जीवन पथ और भाग्य अंक जानें",
      },
      yantraRecommendations: {
        title: "यंत्र सिफारिशें",
        description: "आध्यात्मिक विकास के लिए सही यंत्र खोजें",
      },
      rudrakshaRecommendations: {
        title: "रुद्राक्ष सिफारिशें",
        description: "आपके लिए आदर्श रुद्राक्ष मोती खोजें",
      },
      ishtaDevataCalculator: {
        title: "इष्ट देवता कैलकुलेटर",
        description: "जन्म कुंडली के आधार पर अपने व्यक्तिगत देवता खोजें",
      },
      naamRashiCalculator: {
        title: "नाम राशि कैलकुलेटर",
        description: "अपने नाम के आधार पर अपनी राशि जानें",
      },
    },
  },
  ta: {
    pageTitle: "இலவச ஜோதிட கருவிகள்",
    pageSubtitle: "வேத ஜோதிட கால்குலேட்டர்கள் மற்றும் கருவிகளின் எங்கள் விரிவான தொகுப்பை ஆராயுங்கள்",
    freeBadge: "இலவசம்",
    tools: {
      kundliCalculator: {
        title: "ஜாதக கால்குலேட்டர்",
        description: "கிரக நிலைகள், வீடுகள் மற்றும் தோஷங்களுடன் உங்கள் முழு ஜாதகத்தை உருவாக்குங்கள்",
      },
      nakshatraFinder: {
        title: "நட்சத்திர கண்டுபிடிப்பான்",
        description: "உங்கள் சந்திர நட்சத்திரத்தையும் அதன் முக்கியத்துவத்தையும் கண்டறியுங்கள்",
      },
      horoscopeMatching: {
        title: "ஜாதக பொருத்தம்",
        description: "விரிவான குண மிலான் பகுப்பாய்வுடன் திருமண பொருத்தத்தை சரிபார்க்கவும்",
      },
      moonSignCalculator: {
        title: "சந்திர ராசி கால்குலேட்டர்",
        description: "உங்கள் வேத சந்திர ராசியைக் கண்டறியுங்கள்",
      },
      sunSignCalculator: {
        title: "சூரிய ராசி கால்குலேட்டர்",
        description: "உங்கள் மேற்கத்திய ராசியைக் கண்டறியுங்கள்",
      },
      ascendantCalculator: {
        title: "லக்னம் கால்குலேட்டர்",
        description: "உங்கள் உதய லக்னத்தைக் கணக்கிடுங்கள்",
      },
      loveCalculator: {
        title: "காதல் பொருத்தம்",
        description: "உங்கள் துணையுடன் ராசி பொருத்தத்தை சரிபார்க்கவும்",
      },
      dashaCalculator: {
        title: "தசா கால்குலேட்டர்",
        description: "விம்சோத்தரி தசா கிரக காலங்களைக் கணக்கிடுங்கள்",
      },
      navamsaChart: {
        title: "நவாம்ச சார்ட்",
        description: "D-9 மற்றும் பிற பிரிவு சார்ட்களை உருவாக்குங்கள்",
      },
      yogaCalculator: {
        title: "யோக கால்குலேட்டர்",
        description: "ராஜ யோகம், தன யோகம் மற்றும் பிற கிரக சேர்க்கைகளைக் கண்டறியுங்கள்",
      },
      muhurtaCalculator: {
        title: "முகூர்த்த கால்குலேட்டர்",
        description: "முக்கிய நிகழ்வுகளுக்கு சுப நேரத்தைக் கண்டறியுங்கள்",
      },
      transitCalculator: {
        title: "கோசார பகுப்பாய்வு",
        description: "தற்போதைய கிரக கோசாரங்களை பகுப்பாய்வு செய்யுங்கள்",
      },
      mangalDoshCalculator: {
        title: "செவ்வாய் தோஷ கால்குலேட்டர்",
        description: "உங்கள் ஜாதகத்தில் செவ்வாய் தோஷத்தை சரிபார்க்கவும்",
      },
      sadeSatiCalculator: {
        title: "சாடே சாதி கால்குலேட்டர்",
        description: "உங்கள் சாடே சாதி நிலை மற்றும் கட்டத்தை சரிபார்க்கவும்",
      },
      numerologyCalculator: {
        title: "எண் ஜோதிட கால்குலேட்டர்",
        description: "உங்கள் வாழ்க்கை பாதை மற்றும் விதி எண்களைக் கணக்கிடுங்கள்",
      },
      yantraRecommendations: {
        title: "யந்திர பரிந்துரைகள்",
        description: "ஆன்மீக வளர்ச்சிக்கு சரியான யந்திரங்களைக் கண்டறியுங்கள்",
      },
      rudrakshaRecommendations: {
        title: "ருத்ராக்ஷ பரிந்துரைகள்",
        description: "உங்களுக்கான சிறந்த ருத்ராக்ஷ மணிகளைக் கண்டறியுங்கள்",
      },
      ishtaDevataCalculator: {
        title: "இஷ்ட தேவதா கால்குலேட்டர்",
        description: "ஜாதகத்தின் அடிப்படையில் உங்கள் தனிப்பட்ட தெய்வத்தைக் கண்டறியுங்கள்",
      },
      naamRashiCalculator: {
        title: "நாம ராசி கால்குலேட்டர்",
        description: "உங்கள் பெயரின் அடிப்படையில் உங்கள் ராசியைக் கண்டறியுங்கள்",
      },
    },
  },
  te: {
    pageTitle: "ఉచిత జ్యోతిష్య సాధనాలు",
    pageSubtitle: "వేద జ్యోతిష్య కాల్క్యులేటర్లు మరియు సాధనాల మా సమగ్ర సేకరణను అన్వేషించండి",
    freeBadge: "ఉచితం",
    tools: {
      kundliCalculator: {
        title: "కుండలి కాల్క్యులేటర్",
        description: "గ్రహ స్థానాలు, భావాలు మరియు దోషాలతో మీ పూర్తి జన్మ కుండలిని రూపొందించండి",
      },
      nakshatraFinder: {
        title: "నక్షత్ర అన్వేషకం",
        description: "మీ చంద్ర నక్షత్రాన్ని మరియు దాని ప్రాముఖ్యతను కనుగొనండి",
      },
      horoscopeMatching: {
        title: "జాతక మ్యాచింగ్",
        description: "వివరమైన గుణ మిలాన్ విశ్లేషణతో వివాహ అనుకూలతను తనిఖీ చేయండి",
      },
      moonSignCalculator: {
        title: "చంద్ర రాశి కాల్క్యులేటర్",
        description: "మీ వేద చంద్ర రాశిని కనుగొనండి",
      },
      sunSignCalculator: {
        title: "సూర్య రాశి కాల్క్యులేటర్",
        description: "మీ పాశ్చాత్య రాశిని కనుగొనండి",
      },
      ascendantCalculator: {
        title: "లగ్న కాల్క్యులేటర్",
        description: "మీ ఉదయ లగ్నాన్ని లెక్కించండి",
      },
      loveCalculator: {
        title: "ప్రేమ అనుకూలత",
        description: "మీ భాగస్వామితో రాశి అనుకూలతను తనిఖీ చేయండి",
      },
      dashaCalculator: {
        title: "దశా కాల్క్యులేటర్",
        description: "విమ్శోత్తరి దశా గ్రహ కాలాలను లెక్కించండి",
      },
      navamsaChart: {
        title: "నవాంశ చార్ట్",
        description: "D-9 మరియు ఇతర విభాగ చార్ట్‌లను రూపొందించండి",
      },
      yogaCalculator: {
        title: "యోగ కాల్క్యులేటర్",
        description: "రాజ యోగం, ధన యోగం మరియు ఇతర గ్రహ కలయికలను గుర్తించండి",
      },
      muhurtaCalculator: {
        title: "ముహూర్త కాల్క్యులేటర్",
        description: "ముఖ్యమైన సంఘటనలకు శుభ సమయాన్ని కనుగొనండి",
      },
      transitCalculator: {
        title: "గోచార విశ్లేషణ",
        description: "ప్రస్తుత గ్రహ గోచారాలను విశ్లేషించండి",
      },
      mangalDoshCalculator: {
        title: "మంగళ దోష కాల్క్యులేటర్",
        description: "మీ జన్మ కుండలిలో మాంగళిక దోషాన్ని తనిఖీ చేయండి",
      },
      sadeSatiCalculator: {
        title: "సాడే సాతి కాల్క్యులేటర్",
        description: "మీ సాడే సాతి స్థితి మరియు దశను తనిఖీ చేయండి",
      },
      numerologyCalculator: {
        title: "న్యూమరాలజీ కాల్క్యులేటర్",
        description: "మీ జీవిత మార్గం మరియు విధి సంఖ్యలను లెక్కించండి",
      },
      yantraRecommendations: {
        title: "యంత్ర సిఫార్సులు",
        description: "ఆధ్యాత్మిక వృద్ధికి సరైన యంత్రాలను కనుగొనండి",
      },
      rudrakshaRecommendations: {
        title: "రుద్రాక్ష సిఫార్సులు",
        description: "మీకు అనువైన రుద్రాక్ష పూసలను కనుగొనండి",
      },
      ishtaDevataCalculator: {
        title: "ఇష్ట దేవత కాల్క్యులేటర్",
        description: "జన్మ కుండలి ఆధారంగా మీ వ్యక్తిగత దేవతను కనుగొనండి",
      },
      naamRashiCalculator: {
        title: "నామ రాశి కాల్క్యులేటర్",
        description: "మీ పేరు ఆధారంగా మీ రాశిని కనుగొనండి",
      },
    },
  },
  bn: {
    pageTitle: "বিনামূল্যে জ্যোতিষ সরঞ্জাম",
    pageSubtitle: "বৈদিক জ্যোতিষ ক্যালকুলেটর এবং সরঞ্জামগুলির আমাদের ব্যাপক সংগ্রহ অন্বেষণ করুন",
    freeBadge: "বিনামূল্যে",
    tools: {
      kundliCalculator: {
        title: "কুণ্ডলী ক্যালকুলেটর",
        description: "গ্রহের অবস্থান, ভাব এবং দোষ সহ আপনার সম্পূর্ণ জন্ম কুণ্ডলী তৈরি করুন",
      },
      nakshatraFinder: {
        title: "নক্ষত্র অনুসন্ধানকারী",
        description: "আপনার চন্দ্র নক্ষত্র এবং এর তাৎপর্য আবিষ্কার করুন",
      },
      horoscopeMatching: {
        title: "কুণ্ডলী মিলান",
        description: "বিস্তারিত গুণ মিলান বিশ্লেষণ সহ বিবাহ সামঞ্জস্য পরীক্ষা করুন",
      },
      moonSignCalculator: {
        title: "চন্দ্র রাশি ক্যালকুলেটর",
        description: "আপনার বৈদিক চন্দ্র রাশি খুঁজুন",
      },
      sunSignCalculator: {
        title: "সূর্য রাশি ক্যালকুলেটর",
        description: "আপনার পশ্চিমা রাশি আবিষ্কার করুন",
      },
      ascendantCalculator: {
        title: "লগ্ন ক্যালকুলেটর",
        description: "আপনার উদয় লগ্ন গণনা করুন",
      },
      loveCalculator: {
        title: "প্রেম সামঞ্জস্য",
        description: "আপনার সঙ্গীর সাথে রাশি সামঞ্জস্য পরীক্ষা করুন",
      },
      dashaCalculator: {
        title: "দশা ক্যালকুলেটর",
        description: "বিংশোত্তরী দশা গ্রহ কাল গণনা করুন",
      },
      navamsaChart: {
        title: "নবাংশ চার্ট",
        description: "D-9 এবং অন্যান্য বিভাগীয় চার্ট তৈরি করুন",
      },
      yogaCalculator: {
        title: "যোগ ক্যালকুলেটর",
        description: "রাজ যোগ, ধন যোগ এবং অন্যান্য গ্রহ সংযোগ সনাক্ত করুন",
      },
      muhurtaCalculator: {
        title: "মুহূর্ত ক্যালকুলেটর",
        description: "গুরুত্বপূর্ণ ঘটনার জন্য শুভ সময় খুঁজুন",
      },
      transitCalculator: {
        title: "গোচর বিশ্লেষণ",
        description: "বর্তমান গ্রহ গোচর বিশ্লেষণ করুন",
      },
      mangalDoshCalculator: {
        title: "মঙ্গল দোষ ক্যালকুলেটর",
        description: "আপনার জন্ম কুণ্ডলীতে মাঙ্গলিক দোষ পরীক্ষা করুন",
      },
      sadeSatiCalculator: {
        title: "সাড়ে সাতি ক্যালকুলেটর",
        description: "আপনার সাড়ে সাতি অবস্থা এবং পর্যায় পরীক্ষা করুন",
      },
      numerologyCalculator: {
        title: "সংখ্যাতত্ত্ব ক্যালকুলেটর",
        description: "আপনার জীবন পথ এবং ভাগ্য সংখ্যা গণনা করুন",
      },
      yantraRecommendations: {
        title: "যন্ত্র সুপারিশ",
        description: "আধ্যাত্মিক বৃদ্ধির জন্য সঠিক যন্ত্র খুঁজুন",
      },
      rudrakshaRecommendations: {
        title: "রুদ্রাক্ষ সুপারিশ",
        description: "আপনার জন্য আদর্শ রুদ্রাক্ষ মালা খুঁজুন",
      },
      ishtaDevataCalculator: {
        title: "ইষ্ট দেবতা ক্যালকুলেটর",
        description: "জন্ম কুণ্ডলীর উপর ভিত্তি করে আপনার ব্যক্তিগত দেবতা খুঁজুন",
      },
      naamRashiCalculator: {
        title: "নাম রাশি ক্যালকুলেটর",
        description: "আপনার নামের উপর ভিত্তি করে আপনার রাশি খুঁজুন",
      },
    },
  },
  mr: {
    pageTitle: "मोफत ज्योतिष साधने",
    pageSubtitle: "वैदिक ज्योतिष कॅल्क्युलेटर आणि साधनांचा आमचा व्यापक संग्रह एक्सप्लोर करा",
    freeBadge: "मोफत",
    tools: {
      kundliCalculator: {
        title: "कुंडली कॅल्क्युलेटर",
        description: "ग्रहांची स्थिती, भाव आणि दोषांसह तुमची संपूर्ण जन्म कुंडली तयार करा",
      },
      nakshatraFinder: {
        title: "नक्षत्र शोधक",
        description: "तुमचे चंद्र नक्षत्र आणि त्याचे महत्त्व शोधा",
      },
      horoscopeMatching: {
        title: "कुंडली जुळवणी",
        description: "तपशीलवार गुण मिलान विश्लेषणासह विवाह सुसंगतता तपासा",
      },
      moonSignCalculator: {
        title: "चंद्र राशी कॅल्क्युलेटर",
        description: "तुमची वैदिक चंद्र राशी शोधा",
      },
      sunSignCalculator: {
        title: "सूर्य राशी कॅल्क्युलेटर",
        description: "तुमची पाश्चात्य राशी शोधा",
      },
      ascendantCalculator: {
        title: "लग्न कॅल्क्युलेटर",
        description: "तुमचे उदय लग्न मोजा",
      },
      loveCalculator: {
        title: "प्रेम सुसंगतता",
        description: "तुमच्या जोडीदारासह राशी सुसंगतता तपासा",
      },
      dashaCalculator: {
        title: "दशा कॅल्क्युलेटर",
        description: "विंशोत्तरी दशा ग्रह काळ मोजा",
      },
      navamsaChart: {
        title: "नवांश चार्ट",
        description: "D-9 आणि इतर विभागीय चार्ट तयार करा",
      },
      yogaCalculator: {
        title: "योग कॅल्क्युलेटर",
        description: "राज योग, धन योग आणि इतर ग्रह संयोग शोधा",
      },
      muhurtaCalculator: {
        title: "मुहूर्त कॅल्क्युलेटर",
        description: "महत्त्वाच्या कार्यक्रमांसाठी शुभ वेळ शोधा",
      },
      transitCalculator: {
        title: "गोचर विश्लेषण",
        description: "सध्याच्या ग्रह गोचरांचे विश्लेषण करा",
      },
      mangalDoshCalculator: {
        title: "मंगळ दोष कॅल्क्युलेटर",
        description: "तुमच्या जन्म कुंडलीत मांगलिक दोष तपासा",
      },
      sadeSatiCalculator: {
        title: "साडेसाती कॅल्क्युलेटर",
        description: "तुमची साडेसाती स्थिती आणि टप्पा तपासा",
      },
      numerologyCalculator: {
        title: "अंकशास्त्र कॅल्क्युलेटर",
        description: "तुमचा जीवन मार्ग आणि भाग्य अंक मोजा",
      },
      yantraRecommendations: {
        title: "यंत्र शिफारसी",
        description: "आध्यात्मिक वाढीसाठी योग्य यंत्रे शोधा",
      },
      rudrakshaRecommendations: {
        title: "रुद्राक्ष शिफारसी",
        description: "तुमच्यासाठी आदर्श रुद्राक्ष माळा शोधा",
      },
      ishtaDevataCalculator: {
        title: "इष्ट देवता कॅल्क्युलेटर",
        description: "जन्म कुंडलीवर आधारित तुमचे वैयक्तिक देवता शोधा",
      },
      naamRashiCalculator: {
        title: "नाम राशी कॅल्क्युलेटर",
        description: "तुमच्या नावावर आधारित तुमची राशी शोधा",
      },
    },
  },
  gu: {
    pageTitle: "મફત જ્યોતિષ સાધનો",
    pageSubtitle: "વૈદિક જ્યોતિષ કેલ્ક્યુલેટર અને સાધનોનો અમારો વ્યાપક સંગ્રહ અન્વેષણ કરો",
    freeBadge: "મફત",
    tools: {
      kundliCalculator: {
        title: "કુંડળી કેલ્ક્યુલેટર",
        description: "ગ્રહોની સ્થિતિ, ભાવો અને દોષો સાથે તમારી સંપૂર્ણ જન્મ કુંડળી બનાવો",
      },
      nakshatraFinder: {
        title: "નક્ષત્ર શોધક",
        description: "તમારા ચંદ્ર નક્ષત્ર અને તેના મહત્વને શોધો",
      },
      horoscopeMatching: {
        title: "કુંડળી મેળાપ",
        description: "વિગતવાર ગુણ મિલાન વિશ્લેષણ સાથે લગ્ન સુસંગતતા તપાસો",
      },
      moonSignCalculator: {
        title: "ચંદ્ર રાશિ કેલ્ક્યુલેટર",
        description: "તમારી વૈદિક ચંદ્ર રાશિ શોધો",
      },
      sunSignCalculator: {
        title: "સૂર્ય રાશિ કેલ્ક્યુલેટર",
        description: "તમારી પશ્ચિમી રાશિ શોધો",
      },
      ascendantCalculator: {
        title: "લગ્ન કેલ્ક્યુલેટર",
        description: "તમારું ઉદય લગ્ન ગણો",
      },
      loveCalculator: {
        title: "પ્રેમ સુસંગતતા",
        description: "તમારા સાથી સાથે રાશિ સુસંગતતા તપાસો",
      },
      dashaCalculator: {
        title: "દશા કેલ્ક્યુલેટર",
        description: "વિંશોત્તરી દશા ગ્રહ કાળ ગણો",
      },
      navamsaChart: {
        title: "નવાંશ ચાર્ટ",
        description: "D-9 અને અન્ય વિભાગીય ચાર્ટ બનાવો",
      },
      yogaCalculator: {
        title: "યોગ કેલ્ક્યુલેટર",
        description: "રાજ યોગ, ધન યોગ અને અન્ય ગ્રહ સંયોગો શોધો",
      },
      muhurtaCalculator: {
        title: "મુહૂર્ત કેલ્ક્યુલેટર",
        description: "મહત્વપૂર્ણ ઘટનાઓ માટે શુભ સમય શોધો",
      },
      transitCalculator: {
        title: "ગોચર વિશ્લેષણ",
        description: "વર્તમાન ગ્રહ ગોચરનું વિશ્લેષણ કરો",
      },
      mangalDoshCalculator: {
        title: "મંગળ દોષ કેલ્ક્યુલેટર",
        description: "તમારી જન્મ કુંડળીમાં માંગલિક દોષ તપાસો",
      },
      sadeSatiCalculator: {
        title: "સાડા સાતી કેલ્ક્યુલેટર",
        description: "તમારી સાડા સાતી સ્થિતિ અને તબક્કો તપાસો",
      },
      numerologyCalculator: {
        title: "અંકશાસ્ત્ર કેલ્ક્યુલેટર",
        description: "તમારો જીવન માર્ગ અને ભાગ્ય અંક ગણો",
      },
      yantraRecommendations: {
        title: "યંત્ર ભલામણો",
        description: "આધ્યાત્મિક વિકાસ માટે યોગ્ય યંત્રો શોધો",
      },
      rudrakshaRecommendations: {
        title: "રુદ્રાક્ષ ભલામણો",
        description: "તમારા માટે આદર્શ રુદ્રાક્ષ માળા શોધો",
      },
      ishtaDevataCalculator: {
        title: "ઇષ્ટ દેવતા કેલ્ક્યુલેટર",
        description: "જન્મ કુંડળી પર આધારિત તમારા વ્યક્તિગત દેવતા શોધો",
      },
      naamRashiCalculator: {
        title: "નામ રાશિ કેલ્ક્યુલેટર",
        description: "તમારા નામ પર આધારિત તમારી રાશિ શોધો",
      },
    },
  },
  kn: {
    pageTitle: "ಉಚಿತ ಜ್ಯೋತಿಷ್ಯ ಸಾಧನಗಳು",
    pageSubtitle: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು ಮತ್ತು ಸಾಧನಗಳ ನಮ್ಮ ಸಮಗ್ರ ಸಂಗ್ರಹವನ್ನು ಅನ್ವೇಷಿಸಿ",
    freeBadge: "ಉಚಿತ",
    tools: {
      kundliCalculator: {
        title: "ಕುಂಡಲಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ಗ್ರಹ ಸ್ಥಾನಗಳು, ಭಾವಗಳು ಮತ್ತು ದೋಷಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ",
      },
      nakshatraFinder: {
        title: "ನಕ್ಷತ್ರ ಹುಡುಕುವವರು",
        description: "ನಿಮ್ಮ ಚಂದ್ರ ನಕ್ಷತ್ರ ಮತ್ತು ಅದರ ಮಹತ್ವವನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ",
      },
      horoscopeMatching: {
        title: "ಜಾತಕ ಹೊಂದಾಣಿಕೆ",
        description: "ವಿವರವಾದ ಗುಣ ಮಿಲಾನ್ ವಿಶ್ಲೇಷಣೆಯೊಂದಿಗೆ ವಿವಾಹ ಹೊಂದಾಣಿಕೆಯನ್ನು ಪರಿಶೀಲಿಸಿ",
      },
      moonSignCalculator: {
        title: "ಚಂದ್ರ ರಾಶಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ನಿಮ್ಮ ವೈದಿಕ ಚಂದ್ರ ರಾಶಿಯನ್ನು ಹುಡುಕಿ",
      },
      sunSignCalculator: {
        title: "ಸೂರ್ಯ ರಾಶಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ನಿಮ್ಮ ಪಾಶ್ಚಾತ್ಯ ರಾಶಿಯನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ",
      },
      ascendantCalculator: {
        title: "ಲಗ್ನ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ನಿಮ್ಮ ಉದಯ ಲಗ್ನವನ್ನು ಲೆಕ್ಕಹಾಕಿ",
      },
      loveCalculator: {
        title: "ಪ್ರೀತಿ ಹೊಂದಾಣಿಕೆ",
        description: "ನಿಮ್ಮ ಸಂಗಾತಿಯೊಂದಿಗೆ ರಾಶಿ ಹೊಂದಾಣಿಕೆಯನ್ನು ಪರಿಶೀಲಿಸಿ",
      },
      dashaCalculator: {
        title: "ದಶಾ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ವಿಂಶೋತ್ತರಿ ದಶಾ ಗ್ರಹ ಅವಧಿಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ",
      },
      navamsaChart: {
        title: "ನವಾಂಶ ಚಾರ್ಟ್",
        description: "D-9 ಮತ್ತು ಇತರ ವಿಭಾಗ ಚಾರ್ಟ್‌ಗಳನ್ನು ರಚಿಸಿ",
      },
      yogaCalculator: {
        title: "ಯೋಗ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ರಾಜ ಯೋಗ, ಧನ ಯೋಗ ಮತ್ತು ಇತರ ಗ್ರಹ ಸಂಯೋಜನೆಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ",
      },
      muhurtaCalculator: {
        title: "ಮುಹೂರ್ತ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ಪ್ರಮುಖ ಘಟನೆಗಳಿಗೆ ಶುಭ ಸಮಯವನ್ನು ಹುಡುಕಿ",
      },
      transitCalculator: {
        title: "ಗೋಚಾರ ವಿಶ್ಲೇಷಣೆ",
        description: "ಪ್ರಸ್ತುತ ಗ್ರಹ ಗೋಚಾರಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
      },
      mangalDoshCalculator: {
        title: "ಮಂಗಳ ದೋಷ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಮಾಂಗಲಿಕ ದೋಷವನ್ನು ಪರಿಶೀಲಿಸಿ",
      },
      sadeSatiCalculator: {
        title: "ಸಾಡೆ ಸಾತಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ನಿಮ್ಮ ಸಾಡೆ ಸಾತಿ ಸ್ಥಿತಿ ಮತ್ತು ಹಂತವನ್ನು ಪರಿಶೀಲಿಸಿ",
      },
      numerologyCalculator: {
        title: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ನಿಮ್ಮ ಜೀವನ ಮಾರ್ಗ ಮತ್ತು ಭಾಗ್ಯ ಸಂಖ್ಯೆಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ",
      },
      yantraRecommendations: {
        title: "ಯಂತ್ರ ಶಿಫಾರಸುಗಳು",
        description: "ಆಧ್ಯಾತ್ಮಿಕ ಬೆಳವಣಿಗೆಗೆ ಸರಿಯಾದ ಯಂತ್ರಗಳನ್ನು ಹುಡುಕಿ",
      },
      rudrakshaRecommendations: {
        title: "ರುದ್ರಾಕ್ಷ ಶಿಫಾರಸುಗಳು",
        description: "ನಿಮಗೆ ಸೂಕ್ತವಾದ ರುದ್ರಾಕ್ಷ ಮಣಿಗಳನ್ನು ಹುಡುಕಿ",
      },
      ishtaDevataCalculator: {
        title: "ಇಷ್ಟ ದೇವತಾ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ದೇವತೆಯನ್ನು ಹುಡುಕಿ",
      },
      naamRashiCalculator: {
        title: "ನಾಮ ರಾಶಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        description: "ನಿಮ್ಮ ಹೆಸರಿನ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ರಾಶಿಯನ್ನು ಹುಡುಕಿ",
      },
    },
  },
  ml: {
    pageTitle: "സൗജന്യ ജ്യോതിഷ ഉപകരണങ്ങള്‍",
    pageSubtitle: "വേദ ജ്യോതിഷ കാല്‍ക്കുലേറ്ററുകളുടെയും ഉപകരണങ്ങളുടെയും ഞങ്ങളുടെ സമഗ്ര ശേഖരം പര്യവേക്ഷണം ചെയ്യുക",
    freeBadge: "സൗജന്യം",
    tools: {
      kundliCalculator: {
        title: "കുണ്ഡലി കാല്‍ക്കുലേറ്റര്‍",
        description: "ഗ്രഹ സ്ഥാനങ്ങള്‍, ഭാവങ്ങള്‍, ദോഷങ്ങള്‍ എന്നിവയോടെ നിങ്ങളുടെ പൂര്‍ണ്ണ ജനന കുണ്ഡലി സൃഷ്ടിക്കുക",
      },
      nakshatraFinder: {
        title: "നക്ഷത്ര കണ്ടെത്തല്‍",
        description: "നിങ്ങളുടെ ചന്ദ്ര നക്ഷത്രവും അതിന്റെ പ്രാധാന്യവും കണ്ടെത്തുക",
      },
      horoscopeMatching: {
        title: "ജാതക പൊരുത്തം",
        description: "വിശദമായ ഗുണ മിലാന്‍ വിശകലനത്തോടെ വിവാഹ പൊരുത്തം പരിശോധിക്കുക",
      },
      moonSignCalculator: {
        title: "ചന്ദ്ര രാശി കാല്‍ക്കുലേറ്റര്‍",
        description: "നിങ്ങളുടെ വേദ ചന്ദ്ര രാശി കണ്ടെത്തുക",
      },
      sunSignCalculator: {
        title: "സൂര്യ രാശി കാല്‍ക്കുലേറ്റര്‍",
        description: "നിങ്ങളുടെ പാശ്ചാത്യ രാശി കണ്ടെത്തുക",
      },
      ascendantCalculator: {
        title: "ലഗ്നം കാല്‍ക്കുലേറ്റര്‍",
        description: "നിങ്ങളുടെ ഉദയ ലഗ്നം കണക്കാക്കുക",
      },
      loveCalculator: {
        title: "പ്രണയ പൊരുത്തം",
        description: "നിങ്ങളുടെ പങ്കാളിയുമായുള്ള രാശി പൊരുത്തം പരിശോധിക്കുക",
      },
      dashaCalculator: {
        title: "ദശാ കാല്‍ക്കുലേറ്റര്‍",
        description: "വിംശോത്തരി ദശാ ഗ്രഹ കാലഘട്ടങ്ങള്‍ കണക്കാക്കുക",
      },
      navamsaChart: {
        title: "നവാംശ ചാര്‍ട്ട്",
        description: "D-9 ഉം മറ്റ് വിഭാഗ ചാര്‍ട്ടുകളും സൃഷ്ടിക്കുക",
      },
      yogaCalculator: {
        title: "യോഗ കാല്‍ക്കുലേറ്റര്‍",
        description: "രാജ യോഗം, ധന യോഗം, മറ്റ് ഗ്രഹ സംയോജനങ്ങള്‍ കണ്ടെത്തുക",
      },
      muhurtaCalculator: {
        title: "മുഹൂര്‍ത്ത കാല്‍ക്കുലേറ്റര്‍",
        description: "പ്രധാന സംഭവങ്ങള്‍ക്ക് ശുഭ സമയം കണ്ടെത്തുക",
      },
      transitCalculator: {
        title: "ഗോചര വിശകലനം",
        description: "നിലവിലെ ഗ്രഹ ഗോചരങ്ങള്‍ വിശകലനം ചെയ്യുക",
      },
      mangalDoshCalculator: {
        title: "മംഗള ദോഷ കാല്‍ക്കുലേറ്റര്‍",
        description: "നിങ്ങളുടെ ജനന കുണ്ഡലിയില്‍ മാംഗലിക ദോഷം പരിശോധിക്കുക",
      },
      sadeSatiCalculator: {
        title: "സാഡെ സാതി കാല്‍ക്കുലേറ്റര്‍",
        description: "നിങ്ങളുടെ സാഡെ സാതി നില ഘട്ടം പരിശോധിക്കുക",
      },
      numerologyCalculator: {
        title: "സംഖ്യാശാസ്ത്ര കാല്‍ക്കുലേറ്റര്‍",
        description: "നിങ്ങളുടെ ജീവിത പാതയും വിധി സംഖ്യകളും കണക്കാക്കുക",
      },
      yantraRecommendations: {
        title: "യന്ത്ര ശുപാര്‍ശകള്‍",
        description: "ആത്മീയ വളര്‍ച്ചയ്ക്ക് ശരിയായ യന്ത്രങ്ങള്‍ കണ്ടെത്തുക",
      },
      rudrakshaRecommendations: {
        title: "രുദ്രാക്ഷ ശുപാര്‍ശകള്‍",
        description: "നിങ്ങള്‍ക്ക് അനുയോജ്യമായ രുദ്രാക്ഷ മണികള്‍ കണ്ടെത്തുക",
      },
      ishtaDevataCalculator: {
        title: "ഇഷ്ട ദേവത കാല്‍ക്കുലേറ്റര്‍",
        description: "ജനന കുണ്ഡലിയുടെ അടിസ്ഥാനത്തില്‍ നിങ്ങളുടെ വ്യക്തിഗത ദേവതയെ കണ്ടെത്തുക",
      },
      naamRashiCalculator: {
        title: "നാമ രാശി കാല്‍ക്കുലേറ്റര്‍",
        description: "നിങ്ങളുടെ പേരിന്റെ അടിസ്ഥാനത്തില്‍ നിങ്ങളുടെ രാശി കണ്ടെത്തുക",
      },
    },
  },
  pa: {
    pageTitle: "ਮੁਫ਼ਤ ਜੋਤਿਸ਼ ਸਾਧਨ",
    pageSubtitle: "ਵੈਦਿਕ ਜੋਤਿਸ਼ ਕੈਲਕੁਲੇਟਰਾਂ ਅਤੇ ਸਾਧਨਾਂ ਦਾ ਸਾਡਾ ਵਿਆਪਕ ਸੰਗ੍ਰਹਿ ਖੋਜੋ",
    freeBadge: "ਮੁਫ਼ਤ",
    tools: {
      kundliCalculator: {
        title: "ਕੁੰਡਲੀ ਕੈਲਕੁਲੇਟਰ",
        description: "ਗ੍ਰਹਿਆਂ ਦੀ ਸਥਿਤੀ, ਭਾਵਾਂ ਅਤੇ ਦੋਸ਼ਾਂ ਨਾਲ ਆਪਣੀ ਪੂਰੀ ਜਨਮ ਕੁੰਡਲੀ ਬਣਾਓ",
      },
      nakshatraFinder: {
        title: "ਨਕਸ਼ੱਤਰ ਖੋਜੀ",
        description: "ਆਪਣੇ ਚੰਦਰ ਨਕਸ਼ੱਤਰ ਅਤੇ ਇਸਦੀ ਮਹੱਤਤਾ ਖੋਜੋ",
      },
      horoscopeMatching: {
        title: "ਕੁੰਡਲੀ ਮਿਲਾਨ",
        description: "ਵਿਸਤ੍ਰਿਤ ਗੁਣ ਮਿਲਾਨ ਵਿਸ਼ਲੇਸ਼ਣ ਨਾਲ ਵਿਆਹ ਅਨੁਕੂਲਤਾ ਜਾਂਚੋ",
      },
      moonSignCalculator: {
        title: "ਚੰਦਰ ਰਾਸ਼ੀ ਕੈਲਕੁਲੇਟਰ",
        description: "ਆਪਣੀ ਵੈਦਿਕ ਚੰਦਰ ਰਾਸ਼ੀ ਲੱਭੋ",
      },
      sunSignCalculator: {
        title: "ਸੂਰਜ ਰਾਸ਼ੀ ਕੈਲਕੁਲੇਟਰ",
        description: "ਆਪਣੀ ਪੱਛਮੀ ਰਾਸ਼ੀ ਖੋਜੋ",
      },
      ascendantCalculator: {
        title: "ਲਗਨ ਕੈਲਕੁਲੇਟਰ",
        description: "ਆਪਣਾ ਉਦੈ ਲਗਨ ਗਿਣੋ",
      },
      loveCalculator: {
        title: "ਪਿਆਰ ਅਨੁਕੂਲਤਾ",
        description: "ਆਪਣੇ ਸਾਥੀ ਨਾਲ ਰਾਸ਼ੀ ਅਨੁਕੂਲਤਾ ਜਾਂਚੋ",
      },
      dashaCalculator: {
        title: "ਦਸ਼ਾ ਕੈਲਕੁਲੇਟਰ",
        description: "ਵਿੰਸ਼ੋਤਰੀ ਦਸ਼ਾ ਗ੍ਰਹਿ ਕਾਲ ਗਿਣੋ",
      },
      navamsaChart: {
        title: "ਨਵਾਂਸ਼ ਚਾਰਟ",
        description: "D-9 ਅਤੇ ਹੋਰ ਵਿਭਾਗੀ ਚਾਰਟ ਬਣਾਓ",
      },
      yogaCalculator: {
        title: "ਯੋਗ ਕੈਲਕੁਲੇਟਰ",
        description: "ਰਾਜ ਯੋਗ, ਧਨ ਯੋਗ ਅਤੇ ਹੋਰ ਗ੍ਰਹਿ ਸੰਯੋਗ ਖੋਜੋ",
      },
      muhurtaCalculator: {
        title: "ਮੁਹੂਰਤ ਕੈਲਕੁਲੇਟਰ",
        description: "ਮਹੱਤਵਪੂਰਨ ਸਮਾਗਮਾਂ ਲਈ ਸ਼ੁਭ ਸਮਾਂ ਲੱਭੋ",
      },
      transitCalculator: {
        title: "ਗੋਚਰ ਵਿਸ਼ਲੇਸ਼ਣ",
        description: "ਮੌਜੂਦਾ ਗ੍ਰਹਿ ਗੋਚਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
      },
      mangalDoshCalculator: {
        title: "ਮੰਗਲ ਦੋਸ਼ ਕੈਲਕੁਲੇਟਰ",
        description: "ਆਪਣੀ ਜਨਮ ਕੁੰਡਲੀ ਵਿੱਚ ਮਾਂਗਲਿਕ ਦੋਸ਼ ਜਾਂਚੋ",
      },
      sadeSatiCalculator: {
        title: "ਸਾੜ੍ਹੇ ਸਾਤੀ ਕੈਲਕੁਲੇਟਰ",
        description: "ਆਪਣੀ ਸਾੜ੍ਹੇ ਸਾਤੀ ਸਥਿਤੀ ਅਤੇ ਪੜਾਅ ਜਾਂਚੋ",
      },
      numerologyCalculator: {
        title: "ਅੰਕ ਵਿਗਿਆਨ ਕੈਲਕੁਲੇਟਰ",
        description: "ਆਪਣਾ ਜੀਵਨ ਮਾਰਗ ਅਤੇ ਕਿਸਮਤ ਅੰਕ ਗਿਣੋ",
      },
      yantraRecommendations: {
        title: "ਯੰਤਰ ਸਿਫਾਰਸ਼ਾਂ",
        description: "ਅਧਿਆਤਮਿਕ ਵਿਕਾਸ ਲਈ ਸਹੀ ਯੰਤਰ ਲੱਭੋ",
      },
      rudrakshaRecommendations: {
        title: "ਰੁਦਰਾਕਸ਼ ਸਿਫਾਰਸ਼ਾਂ",
        description: "ਤੁਹਾਡੇ ਲਈ ਆਦਰਸ਼ ਰੁਦਰਾਕਸ਼ ਮਣਕੇ ਲੱਭੋ",
      },
      ishtaDevataCalculator: {
        title: "ਇਸ਼ਟ ਦੇਵਤਾ ਕੈਲਕੁਲੇਟਰ",
        description: "ਜਨਮ ਕੁੰਡਲੀ ਦੇ ਆਧਾਰ 'ਤੇ ਆਪਣੇ ਨਿੱਜੀ ਦੇਵਤਾ ਲੱਭੋ",
      },
      naamRashiCalculator: {
        title: "ਨਾਮ ਰਾਸ਼ੀ ਕੈਲਕੁਲੇਟਰ",
        description: "ਆਪਣੇ ਨਾਮ ਦੇ ਆਧਾਰ 'ਤੇ ਆਪਣੀ ਰਾਸ਼ੀ ਲੱਭੋ",
      },
    },
  },
};

const tools = [
  { key: "kundliCalculator", href: "/tools/kundli-calculator", icon: Calculator, color: "from-amber-500 to-orange-600" },
  { key: "nakshatraFinder", href: "/tools/nakshatra-finder", icon: Star, color: "from-purple-500 to-indigo-600" },
  { key: "horoscopeMatching", href: "/tools/horoscope-matching", icon: Users, color: "from-pink-500 to-rose-600" },
  { key: "moonSignCalculator", href: "/tools/moon-sign-calculator", icon: Moon, color: "from-blue-500 to-cyan-600" },
  { key: "sunSignCalculator", href: "/tools/sun-sign-calculator", icon: Sun, color: "from-yellow-500 to-amber-600" },
  { key: "ascendantCalculator", href: "/tools/ascendant-calculator", icon: Compass, color: "from-teal-500 to-emerald-600" },
  { key: "loveCalculator", href: "/tools/love-calculator", icon: Heart, color: "from-red-500 to-pink-600" },
  { key: "dashaCalculator", href: "/tools/dasha-calculator", icon: Clock, color: "from-indigo-500 to-purple-600" },
  { key: "navamsaChart", href: "/tools/navamsa-chart", icon: Target, color: "from-cyan-500 to-blue-600" },
  { key: "yogaCalculator", href: "/tools/yoga-calculator", icon: Sparkles, color: "from-emerald-500 to-teal-600" },
  { key: "muhurtaCalculator", href: "/tools/muhurta-calculator", icon: Calendar, color: "from-orange-500 to-red-600" },
  { key: "transitCalculator", href: "/tools/transit-calculator", icon: TrendingUp, color: "from-violet-500 to-purple-600" },
  { key: "mangalDoshCalculator", href: "/tools/mangal-dosh-calculator", icon: Zap, color: "from-rose-500 to-red-600" },
  { key: "sadeSatiCalculator", href: "/tools/sade-sati-calculator", icon: Gem, color: "from-slate-500 to-gray-600" },
  { key: "numerologyCalculator", href: "/tools/numerology-calculator", icon: Hash, color: "from-fuchsia-500 to-pink-600" },
  { key: "yantraRecommendations", href: "/tools/yantra-recommendations", icon: Grid3X3, color: "from-amber-600 to-yellow-500" },
  { key: "rudrakshaRecommendations", href: "/tools/rudraksha-recommendations", icon: Circle, color: "from-orange-700 to-amber-600" },
  { key: "ishtaDevataCalculator", href: "/tools/ishta-devata-calculator", icon: Crown, color: "from-yellow-500 to-amber-600" },
  { key: "naamRashiCalculator", href: "/tools/naam-rashi-calculator", icon: Type, color: "from-sky-500 to-blue-600" },
];

type Language = keyof typeof toolsTranslations;

export default function ToolsPage() {
  const { language } = useLanguage();
  const lang = (language in toolsTranslations ? language : "en") as Language;
  const t = toolsTranslations[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="bg-amber-100 text-amber-800 mb-4">
            {t.freeBadge}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t.pageTitle}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.pageSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const toolTranslation = t.tools[tool.key as keyof typeof t.tools];
            
            return (
              <Link key={tool.key} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-gray-100 group">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                      {toolTranslation.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {toolTranslation.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Service Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Free Vedic Astrology Tools",
            description: "Comprehensive collection of free Vedic astrology calculators and tools",
            url: "https://vedicstarastro.com/tools",
            numberOfItems: 19,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Kundli Calculator",
                  url: "https://vedicstarastro.com/tools/kundli-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 2,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Nakshatra Finder",
                  url: "https://vedicstarastro.com/tools/nakshatra-finder",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 3,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Horoscope Matching",
                  url: "https://vedicstarastro.com/tools/horoscope-matching",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 4,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Moon Sign Calculator",
                  url: "https://vedicstarastro.com/tools/moon-sign-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 5,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Sun Sign Calculator",
                  url: "https://vedicstarastro.com/tools/sun-sign-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 6,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Ascendant Calculator",
                  url: "https://vedicstarastro.com/tools/ascendant-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 7,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Love Compatibility Calculator",
                  url: "https://vedicstarastro.com/tools/love-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 8,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Dasha Calculator",
                  url: "https://vedicstarastro.com/tools/dasha-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 9,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Navamsa Chart Generator",
                  url: "https://vedicstarastro.com/tools/navamsa-chart",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 10,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Yoga Calculator",
                  url: "https://vedicstarastro.com/tools/yoga-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 11,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Muhurta Calculator",
                  url: "https://vedicstarastro.com/tools/muhurta-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 12,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Transit Calculator",
                  url: "https://vedicstarastro.com/tools/transit-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 13,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Mangal Dosh Calculator",
                  url: "https://vedicstarastro.com/tools/mangal-dosh-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 14,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Sade Sati Calculator",
                  url: "https://vedicstarastro.com/tools/sade-sati-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 15,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Numerology Calculator",
                  url: "https://vedicstarastro.com/tools/numerology-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 16,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Yantra Recommendations",
                  url: "https://vedicstarastro.com/tools/yantra-recommendations",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 17,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Rudraksha Recommendations",
                  url: "https://vedicstarastro.com/tools/rudraksha-recommendations",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 18,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Ishta Devata Calculator",
                  url: "https://vedicstarastro.com/tools/ishta-devata-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
              {
                "@type": "ListItem",
                position: 19,
                item: {
                  "@type": "SoftwareApplication",
                  name: "Naam Rashi Calculator",
                  url: "https://vedicstarastro.com/tools/naam-rashi-calculator",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "Web",
                  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
                },
              },
            ],
          }),
        }}
      />

      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://vedicstarastro.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Free Astrology Tools",
                item: "https://vedicstarastro.com/tools",
              },
            ],
          }),
        }}
      />
    </div>
  );
}
