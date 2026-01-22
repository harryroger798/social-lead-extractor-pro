// Comment Section Translations for VedicStarAstro
// This file contains translations for the blog comment system

import { Language } from "./translations";

type TranslationObject = Record<string, unknown>;

export function deepMergeComments(target: TranslationObject, source: TranslationObject): TranslationObject {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMergeComments(
        (result[key] as TranslationObject) || {},
        source[key] as TranslationObject
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export const commentTranslations: Record<Language, TranslationObject> = {
  en: {
    consultation: {
      topics: "Consultation Topics",
      whyChoose: "Why Choose VedicStarAstro?"
    },
    error: {
      pageNotFound: "Page Not Found",
      pageNotFoundDesc: "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.",
      goHome: "Go to Homepage",
      popularPages: "Popular Pages",
      needHelp: "Need help?",
      contactUs: "Contact our support team"
    },
    breadcrumb: {
      home: "Home",
      tools: "Tools",
      consultation: "Consultation",
      contact: "Contact",
      about: "About Us",
      blog: "Blog",
      astrologers: "Astrologers",
      dailyHoroscope: "Daily Horoscope",
      kundliCalculator: "Kundli Calculator",
      nakshatraFinder: "Nakshatra Finder",
      horoscopeMatching: "Horoscope Matching"
    },
    comments: {
      title: "Comments",
      leaveComment: "Leave a Comment",
      replyTo: "Reply to {name}",
      replyingTo: "Replying to {name}",
      cancel: "Cancel",
      nameLabel: "Name *",
      namePlaceholder: "Your name",
      emailLabel: "Email *",
      emailNotPublished: "(not published)",
      emailPlaceholder: "your@email.com",
      commentLabel: "Comment *",
      commentPlaceholder: "Share your thoughts...",
      charactersCount: "{count}/2000 characters",
      submitSuccess: "Thank you! Your comment has been submitted and is awaiting approval.",
      submitting: "Submitting...",
      postReply: "Post Reply",
      postComment: "Post Comment",
      loadingComments: "Loading comments...",
      noComments: "No comments yet. Be the first to share your thoughts!",
      reply: "Reply",
      justNow: "Just now",
      minuteAgo: "{count} minute ago",
      minutesAgo: "{count} minutes ago",
      hourAgo: "{count} hour ago",
      hoursAgo: "{count} hours ago",
      dayAgo: "{count} day ago",
      daysAgo: "{count} days ago"
    }
  },
  hi: {
    consultation: {
      topics: "परामर्श विषय",
      whyChoose: "VedicStarAstro क्यों चुनें?"
    },
    error: {
      pageNotFound: "पेज नहीं मिला",
      pageNotFoundDesc: "जिस पेज को आप ढूंढ रहे हैं वह हटा दिया गया हो सकता है, उसका नाम बदल दिया गया हो, या अस्थायी रूप से अनुपलब्ध हो।",
      goHome: "होमपेज पर जाएं",
      popularPages: "लोकप्रिय पेज",
      needHelp: "मदद चाहिए?",
      contactUs: "हमारी सहायता टीम से संपर्क करें"
    },
    breadcrumb: {
      home: "होम",
      tools: "टूल्स",
      consultation: "परामर्श",
      contact: "संपर्क",
      about: "हमारे बारे में",
      blog: "ब्लॉग",
      astrologers: "ज्योतिषी",
      dailyHoroscope: "दैनिक राशिफल",
      kundliCalculator: "कुंडली कैलकुलेटर",
      nakshatraFinder: "नक्षत्र खोजक",
      horoscopeMatching: "कुंडली मिलान"
    },
    comments: {
      title: "टिप्पणियाँ",
      leaveComment: "टिप्पणी छोड़ें",
      replyTo: "{name} को जवाब दें",
      replyingTo: "{name} को जवाब दे रहे हैं",
      cancel: "रद्द करें",
      nameLabel: "नाम *",
      namePlaceholder: "आपका नाम",
      emailLabel: "ईमेल *",
      emailNotPublished: "(प्रकाशित नहीं होगा)",
      emailPlaceholder: "your@email.com",
      commentLabel: "टिप्पणी *",
      commentPlaceholder: "अपने विचार साझा करें...",
      charactersCount: "{count}/2000 अक्षर",
      submitSuccess: "धन्यवाद! आपकी टिप्पणी सबमिट हो गई है और अनुमोदन की प्रतीक्षा में है।",
      submitting: "सबमिट हो रहा है...",
      postReply: "जवाब पोस्ट करें",
      postComment: "टिप्पणी पोस्ट करें",
      loadingComments: "टिप्पणियाँ लोड हो रही हैं...",
      noComments: "अभी तक कोई टिप्पणी नहीं। अपने विचार साझा करने वाले पहले व्यक्ति बनें!",
      reply: "जवाब दें",
      justNow: "अभी",
      minuteAgo: "{count} मिनट पहले",
      minutesAgo: "{count} मिनट पहले",
      hourAgo: "{count} घंटा पहले",
      hoursAgo: "{count} घंटे पहले",
      dayAgo: "{count} दिन पहले",
      daysAgo: "{count} दिन पहले"
    }
  },
  ta: {
    consultation: {
      topics: "ஆலோசனை தலைப்புகள்",
      whyChoose: "VedicStarAstro ஏன் தேர்வு செய்ய வேண்டும்?"
    },
    error: {
      pageNotFound: "பக்கம் கிடைக்கவில்லை",
      pageNotFoundDesc: "நீங்கள் தேடும் பக்கம் அகற்றப்பட்டிருக்கலாம், பெயர் மாற்றப்பட்டிருக்கலாம் அல்லது தற்காலிகமாக கிடைக்காமல் இருக்கலாம்.",
      goHome: "முகப்புப் பக்கத்திற்குச் செல்",
      popularPages: "பிரபலமான பக்கங்கள்",
      needHelp: "உதவி தேவையா?",
      contactUs: "எங்கள் ஆதரவு குழுவைத் தொடர்பு கொள்ளுங்கள்"
    },
    breadcrumb: {
      home: "முகப்பு",
      tools: "கருவிகள்",
      consultation: "ஆலோசனை",
      contact: "தொடர்பு",
      about: "எங்களைப் பற்றி",
      blog: "வலைப்பதிவு",
      astrologers: "ஜோதிடர்கள்",
      dailyHoroscope: "தினசரி ராசிபலன்",
      kundliCalculator: "குண்டலி கணிப்பான்",
      nakshatraFinder: "நட்சத்திர கண்டுபிடிப்பான்",
      horoscopeMatching: "ஜாதக பொருத்தம்"
    },
    comments: {
      title: "கருத்துகள்",
      leaveComment: "கருத்து தெரிவிக்கவும்",
      replyTo: "{name} க்கு பதில்",
      replyingTo: "{name} க்கு பதிலளிக்கிறது",
      cancel: "ரத்து செய்",
      nameLabel: "பெயர் *",
      namePlaceholder: "உங்கள் பெயர்",
      emailLabel: "மின்னஞ்சல் *",
      emailNotPublished: "(வெளியிடப்படாது)",
      emailPlaceholder: "your@email.com",
      commentLabel: "கருத்து *",
      commentPlaceholder: "உங்கள் எண்ணங்களைப் பகிரவும்...",
      charactersCount: "{count}/2000 எழுத்துகள்",
      submitSuccess: "நன்றி! உங்கள் கருத்து சமர்ப்பிக்கப்பட்டது மற்றும் அனுமதிக்காக காத்திருக்கிறது.",
      submitting: "சமர்ப்பிக்கிறது...",
      postReply: "பதில் இடுக",
      postComment: "கருத்து இடுக",
      loadingComments: "கருத்துகள் ஏற்றப்படுகின்றன...",
      noComments: "இன்னும் கருத்துகள் இல்லை. உங்கள் எண்ணங்களைப் பகிரும் முதல் நபராக இருங்கள்!",
      reply: "பதில்",
      justNow: "இப்போது",
      minuteAgo: "{count} நிமிடம் முன்",
      minutesAgo: "{count} நிமிடங்கள் முன்",
      hourAgo: "{count} மணி நேரம் முன்",
      hoursAgo: "{count} மணி நேரங்கள் முன்",
      dayAgo: "{count} நாள் முன்",
      daysAgo: "{count} நாட்கள் முன்"
    }
  },
  te: {
    consultation: {
      topics: "సంప్రదింపు అంశాలు",
      whyChoose: "VedicStarAstro ఎందుకు ఎంచుకోవాలి?"
    },
    error: {
      pageNotFound: "పేజీ కనుగొనబడలేదు",
      pageNotFoundDesc: "మీరు వెతుకుతున్న పేజీ తొలగించబడి ఉండవచ్చు, పేరు మార్చబడి ఉండవచ్చు లేదా తాత్కాలికంగా అందుబాటులో లేదు.",
      goHome: "హోమ్‌పేజీకి వెళ్ళండి",
      popularPages: "ప్రసిద్ధ పేజీలు",
      needHelp: "సహాయం కావాలా?",
      contactUs: "మా సపోర్ట్ టీమ్‌ను సంప్రదించండి"
    },
    breadcrumb: {
      home: "హోమ్",
      tools: "టూల్స్",
      consultation: "సంప్రదింపు",
      contact: "సంప్రదించండి",
      about: "మా గురించి",
      blog: "బ్లాగ్",
      astrologers: "జ్యోతిష్కులు",
      dailyHoroscope: "రోజువారీ రాశిఫలం",
      kundliCalculator: "కుండలి కాలిక్యులేటర్",
      nakshatraFinder: "నక్షత్ర ఫైండర్",
      horoscopeMatching: "జాతక పొందిక"
    },
    comments: {
      title: "వ్యాఖ్యలు",
      leaveComment: "వ్యాఖ్య రాయండి",
      replyTo: "{name} కు సమాధానం",
      replyingTo: "{name} కు సమాధానం ఇస్తున్నారు",
      cancel: "రద్దు చేయి",
      nameLabel: "పేరు *",
      namePlaceholder: "మీ పేరు",
      emailLabel: "ఇమెయిల్ *",
      emailNotPublished: "(ప్రచురించబడదు)",
      emailPlaceholder: "your@email.com",
      commentLabel: "వ్యాఖ్య *",
      commentPlaceholder: "మీ ఆలోచనలను పంచుకోండి...",
      charactersCount: "{count}/2000 అక్షరాలు",
      submitSuccess: "ధన్యవాదాలు! మీ వ్యాఖ్య సమర్పించబడింది మరియు ఆమోదం కోసం వేచి ఉంది.",
      submitting: "సమర్పిస్తోంది...",
      postReply: "సమాధానం పోస్ట్ చేయండి",
      postComment: "వ్యాఖ్య పోస్ట్ చేయండి",
      loadingComments: "వ్యాఖ్యలు లోడ్ అవుతున్నాయి...",
      noComments: "ఇంకా వ్యాఖ్యలు లేవు. మీ ఆలోచనలను పంచుకునే మొదటి వ్యక్తి అవ్వండి!",
      reply: "సమాధానం",
      justNow: "ఇప్పుడే",
      minuteAgo: "{count} నిమిషం క్రితం",
      minutesAgo: "{count} నిమిషాల క్రితం",
      hourAgo: "{count} గంట క్రితం",
      hoursAgo: "{count} గంటల క్రితం",
      dayAgo: "{count} రోజు క్రితం",
      daysAgo: "{count} రోజుల క్రితం"
    }
  },
  bn: {
    consultation: {
      topics: "পরামর্শের বিষয়",
      whyChoose: "VedicStarAstro কেন বেছে নেবেন?"
    },
    error: {
      pageNotFound: "পেজ পাওয়া যায়নি",
      pageNotFoundDesc: "আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়ে থাকতে পারে, নাম পরিবর্তন করা হয়েছে, অথবা সাময়িকভাবে অনুপলব্ধ।",
      goHome: "হোমপেজে যান",
      popularPages: "জনপ্রিয় পেজ",
      needHelp: "সাহায্য দরকার?",
      contactUs: "আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন"
    },
    breadcrumb: {
      home: "হোম",
      tools: "টুলস",
      consultation: "পরামর্শ",
      contact: "যোগাযোগ",
      about: "আমাদের সম্পর্কে",
      blog: "ব্লগ",
      astrologers: "জ্যোতিষীরা",
      dailyHoroscope: "দৈনিক রাশিফল",
      kundliCalculator: "কুণ্ডলি ক্যালকুলেটর",
      nakshatraFinder: "নক্ষত্র খোঁজক",
      horoscopeMatching: "কুণ্ডলি মিলান"
    },
    comments: {
      title: "মন্তব্য",
      leaveComment: "মন্তব্য করুন",
      replyTo: "{name} কে উত্তর দিন",
      replyingTo: "{name} কে উত্তর দিচ্ছেন",
      cancel: "বাতিল",
      nameLabel: "নাম *",
      namePlaceholder: "আপনার নাম",
      emailLabel: "ইমেইল *",
      emailNotPublished: "(প্রকাশিত হবে না)",
      emailPlaceholder: "your@email.com",
      commentLabel: "মন্তব্য *",
      commentPlaceholder: "আপনার মতামত শেয়ার করুন...",
      charactersCount: "{count}/2000 অক্ষর",
      submitSuccess: "ধন্যবাদ! আপনার মন্তব্য জমা দেওয়া হয়েছে এবং অনুমোদনের অপেক্ষায় রয়েছে।",
      submitting: "জমা দেওয়া হচ্ছে...",
      postReply: "উত্তর পোস্ট করুন",
      postComment: "মন্তব্য পোস্ট করুন",
      loadingComments: "মন্তব্য লোড হচ্ছে...",
      noComments: "এখনও কোনো মন্তব্য নেই। আপনার মতামত শেয়ার করার প্রথম ব্যক্তি হন!",
      reply: "উত্তর",
      justNow: "এইমাত্র",
      minuteAgo: "{count} মিনিট আগে",
      minutesAgo: "{count} মিনিট আগে",
      hourAgo: "{count} ঘন্টা আগে",
      hoursAgo: "{count} ঘন্টা আগে",
      dayAgo: "{count} দিন আগে",
      daysAgo: "{count} দিন আগে"
    }
  },
  mr: {
    consultation: {
      topics: "सल्लामसलत विषय",
      whyChoose: "VedicStarAstro का निवडावे?"
    },
    error: {
      pageNotFound: "पृष्ठ सापडले नाही",
      pageNotFoundDesc: "तुम्ही शोधत असलेले पृष्ठ काढले गेले असेल, त्याचे नाव बदलले गेले असेल किंवा तात्पुरते अनुपलब्ध असेल.",
      goHome: "मुख्यपृष्ठावर जा",
      popularPages: "लोकप्रिय पृष्ठे",
      needHelp: "मदत हवी आहे?",
      contactUs: "आमच्या सपोर्ट टीमशी संपर्क साधा"
    },
    breadcrumb: {
      home: "मुख्यपृष्ठ",
      tools: "साधने",
      consultation: "सल्लामसलत",
      contact: "संपर्क",
      about: "आमच्याबद्दल",
      blog: "ब्लॉग",
      astrologers: "ज्योतिषी",
      dailyHoroscope: "दैनिक राशीभविष्य",
      kundliCalculator: "कुंडली कॅल्क्युलेटर",
      nakshatraFinder: "नक्षत्र शोधक",
      horoscopeMatching: "कुंडली जुळवणी"
    },
    comments: {
      title: "टिप्पण्या",
      leaveComment: "टिप्पणी द्या",
      replyTo: "{name} ला उत्तर द्या",
      replyingTo: "{name} ला उत्तर देत आहात",
      cancel: "रद्द करा",
      nameLabel: "नाव *",
      namePlaceholder: "तुमचे नाव",
      emailLabel: "ईमेल *",
      emailNotPublished: "(प्रकाशित होणार नाही)",
      emailPlaceholder: "your@email.com",
      commentLabel: "टिप्पणी *",
      commentPlaceholder: "तुमचे विचार शेअर करा...",
      charactersCount: "{count}/2000 अक्षरे",
      submitSuccess: "धन्यवाद! तुमची टिप्पणी सबमिट झाली आहे आणि मंजुरीच्या प्रतीक्षेत आहे.",
      submitting: "सबमिट होत आहे...",
      postReply: "उत्तर पोस्ट करा",
      postComment: "टिप्पणी पोस्ट करा",
      loadingComments: "टिप्पण्या लोड होत आहेत...",
      noComments: "अजून टिप्पण्या नाहीत. तुमचे विचार शेअर करणारे पहिले व्हा!",
      reply: "उत्तर",
      justNow: "आत्ताच",
      minuteAgo: "{count} मिनिटापूर्वी",
      minutesAgo: "{count} मिनिटांपूर्वी",
      hourAgo: "{count} तासापूर्वी",
      hoursAgo: "{count} तासांपूर्वी",
      dayAgo: "{count} दिवसापूर्वी",
      daysAgo: "{count} दिवसांपूर्वी"
    }
  },
  gu: {
    consultation: {
      topics: "પરામર્શ વિષયો",
      whyChoose: "VedicStarAstro શા માટે પસંદ કરો?"
    },
    error: {
      pageNotFound: "પેજ મળ્યું નથી",
      pageNotFoundDesc: "તમે જે પેજ શોધી રહ્યા છો તે દૂર કરવામાં આવ્યું હોઈ શકે, નામ બદલાયું હોઈ શકે અથવા અસ્થાયી રૂપે અનુપલબ્ધ હોઈ શકે.",
      goHome: "હોમપેજ પર જાઓ",
      popularPages: "લોકપ્રિય પેજ",
      needHelp: "મદદ જોઈએ છે?",
      contactUs: "અમારી સપોર્ટ ટીમનો સંપર્ક કરો"
    },
    breadcrumb: {
      home: "હોમ",
      tools: "ટૂલ્સ",
      consultation: "પરામર્શ",
      contact: "સંપર્ક",
      about: "અમારા વિશે",
      blog: "બ્લોગ",
      astrologers: "જ્યોતિષીઓ",
      dailyHoroscope: "દૈનિક રાશિફળ",
      kundliCalculator: "કુંડળી કેલ્ક્યુલેટર",
      nakshatraFinder: "નક્ષત્ર શોધક",
      horoscopeMatching: "કુંડળી મેળાપ"
    },
    comments: {
      title: "ટિપ્પણીઓ",
      leaveComment: "ટિપ્પણી કરો",
      replyTo: "{name} ને જવાબ આપો",
      replyingTo: "{name} ને જવાબ આપી રહ્યા છો",
      cancel: "રદ કરો",
      nameLabel: "નામ *",
      namePlaceholder: "તમારું નામ",
      emailLabel: "ઈમેલ *",
      emailNotPublished: "(પ્રકાશિત થશે નહીં)",
      emailPlaceholder: "your@email.com",
      commentLabel: "ટિપ્પણી *",
      commentPlaceholder: "તમારા વિચારો શેર કરો...",
      charactersCount: "{count}/2000 અક્ષરો",
      submitSuccess: "આભાર! તમારી ટિપ્પણી સબમિટ થઈ ગઈ છે અને મંજૂરીની રાહ જોઈ રહી છે.",
      submitting: "સબમિટ થઈ રહ્યું છે...",
      postReply: "જવાબ પોસ્ટ કરો",
      postComment: "ટિપ્પણી પોસ્ટ કરો",
      loadingComments: "ટિપ્પણીઓ લોડ થઈ રહી છે...",
      noComments: "હજુ સુધી કોઈ ટિપ્પણીઓ નથી. તમારા વિચારો શેર કરનાર પ્રથમ બનો!",
      reply: "જવાબ",
      justNow: "હમણાં જ",
      minuteAgo: "{count} મિનિટ પહેલાં",
      minutesAgo: "{count} મિનિટ પહેલાં",
      hourAgo: "{count} કલાક પહેલાં",
      hoursAgo: "{count} કલાક પહેલાં",
      dayAgo: "{count} દિવસ પહેલાં",
      daysAgo: "{count} દિવસ પહેલાં"
    }
  },
  kn: {
    consultation: {
      topics: "ಸಮಾಲೋಚನೆ ವಿಷಯಗಳು",
      whyChoose: "VedicStarAstro ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು?"
    },
    error: {
      pageNotFound: "ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ",
      pageNotFoundDesc: "ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪುಟವನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿರಬಹುದು, ಹೆಸರು ಬದಲಾಯಿಸಲಾಗಿರಬಹುದು ಅಥವಾ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ.",
      goHome: "ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ",
      popularPages: "ಜನಪ್ರಿಯ ಪುಟಗಳು",
      needHelp: "ಸಹಾಯ ಬೇಕೇ?",
      contactUs: "ನಮ್ಮ ಬೆಂಬಲ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ"
    },
    breadcrumb: {
      home: "ಮುಖಪುಟ",
      tools: "ಉಪಕರಣಗಳು",
      consultation: "ಸಮಾಲೋಚನೆ",
      contact: "ಸಂಪರ್ಕ",
      about: "ನಮ್ಮ ಬಗ್ಗೆ",
      blog: "ಬ್ಲಾಗ್",
      astrologers: "ಜ್ಯೋತಿಷಿಗಳು",
      dailyHoroscope: "ದೈನಂದಿನ ರಾಶಿಫಲ",
      kundliCalculator: "ಕುಂಡಲಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
      nakshatraFinder: "ನಕ್ಷತ್ರ ಹುಡುಕುವಿಕೆ",
      horoscopeMatching: "ಜಾತಕ ಹೊಂದಾಣಿಕೆ"
    },
    comments: {
      title: "ಕಾಮೆಂಟ್‌ಗಳು",
      leaveComment: "ಕಾಮೆಂಟ್ ಬಿಡಿ",
      replyTo: "{name} ಗೆ ಉತ್ತರಿಸಿ",
      replyingTo: "{name} ಗೆ ಉತ್ತರಿಸುತ್ತಿದ್ದೀರಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      nameLabel: "ಹೆಸರು *",
      namePlaceholder: "ನಿಮ್ಮ ಹೆಸರು",
      emailLabel: "ಇಮೇಲ್ *",
      emailNotPublished: "(ಪ್ರಕಟಿಸಲಾಗುವುದಿಲ್ಲ)",
      emailPlaceholder: "your@email.com",
      commentLabel: "ಕಾಮೆಂಟ್ *",
      commentPlaceholder: "ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ...",
      charactersCount: "{count}/2000 ಅಕ್ಷರಗಳು",
      submitSuccess: "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಕಾಮೆಂಟ್ ಸಲ್ಲಿಸಲಾಗಿದೆ ಮತ್ತು ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ.",
      submitting: "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
      postReply: "ಉತ್ತರ ಪೋಸ್ಟ್ ಮಾಡಿ",
      postComment: "ಕಾಮೆಂಟ್ ಪೋಸ್ಟ್ ಮಾಡಿ",
      loadingComments: "ಕಾಮೆಂಟ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      noComments: "ಇನ್ನೂ ಕಾಮೆಂಟ್‌ಗಳಿಲ್ಲ. ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವ ಮೊದಲಿಗರಾಗಿ!",
      reply: "ಉತ್ತರ",
      justNow: "ಈಗಷ್ಟೇ",
      minuteAgo: "{count} ನಿಮಿಷದ ಹಿಂದೆ",
      minutesAgo: "{count} ನಿಮಿಷಗಳ ಹಿಂದೆ",
      hourAgo: "{count} ಗಂಟೆಯ ಹಿಂದೆ",
      hoursAgo: "{count} ಗಂಟೆಗಳ ಹಿಂದೆ",
      dayAgo: "{count} ದಿನದ ಹಿಂದೆ",
      daysAgo: "{count} ದಿನಗಳ ಹಿಂದೆ"
    }
  },
  ml: {
    consultation: {
      topics: "കൺസൾട്ടേഷൻ വിഷയങ്ങൾ",
      whyChoose: "VedicStarAstro എന്തുകൊണ്ട് തിരഞ്ഞെടുക്കണം?"
    },
    error: {
      pageNotFound: "പേജ് കണ്ടെത്തിയില്ല",
      pageNotFoundDesc: "നിങ്ങൾ തിരയുന്ന പേജ് നീക്കം ചെയ്തിരിക്കാം, പേര് മാറ്റിയിരിക്കാം അല്ലെങ്കിൽ താൽക്കാലികമായി ലഭ്യമല്ല.",
      goHome: "ഹോംപേജിലേക്ക് പോകുക",
      popularPages: "ജനപ്രിയ പേജുകൾ",
      needHelp: "സഹായം വേണോ?",
      contactUs: "ഞങ്ങളുടെ സപ്പോർട്ട് ടീമിനെ ബന്ധപ്പെടുക"
    },
    breadcrumb: {
      home: "ഹോം",
      tools: "ടൂളുകൾ",
      consultation: "കൺസൾട്ടേഷൻ",
      contact: "ബന്ധപ്പെടുക",
      about: "ഞങ്ങളെക്കുറിച്ച്",
      blog: "ബ്ലോഗ്",
      astrologers: "ജ്യോതിഷികൾ",
      dailyHoroscope: "ദൈനംദിന രാശിഫലം",
      kundliCalculator: "കുണ്ഡലി കാൽക്കുലേറ്റർ",
      nakshatraFinder: "നക്ഷത്ര കണ്ടെത്തൽ",
      horoscopeMatching: "ജാതക പൊരുത്തം"
    },
    comments: {
      title: "അഭിപ്രായങ്ങള്‍",
      leaveComment: "അഭിപ്രായം രേഖപ്പെടുത്തുക",
      replyTo: "{name} ന് മറുപടി നല്‍കുക",
      replyingTo: "{name} ന് മറുപടി നല്‍കുന്നു",
      cancel: "റദ്ദാക്കുക",
      nameLabel: "പേര് *",
      namePlaceholder: "നിങ്ങളുടെ പേര്",
      emailLabel: "ഇമെയില്‍ *",
      emailNotPublished: "(പ്രസിദ്ധീകരിക്കില്ല)",
      emailPlaceholder: "your@email.com",
      commentLabel: "അഭിപ്രായം *",
      commentPlaceholder: "നിങ്ങളുടെ ചിന്തകള്‍ പങ്കിടുക...",
      charactersCount: "{count}/2000 അക്ഷരങ്ങള്‍",
      submitSuccess: "നന്ദി! നിങ്ങളുടെ അഭിപ്രായം സമര്‍പ്പിച്ചു, അംഗീകാരത്തിനായി കാത്തിരിക്കുന്നു.",
      submitting: "സമര്‍പ്പിക്കുന്നു...",
      postReply: "മറുപടി പോസ്റ്റ് ചെയ്യുക",
      postComment: "അഭിപ്രായം പോസ്റ്റ് ചെയ്യുക",
      loadingComments: "അഭിപ്രായങ്ങള്‍ ലോഡ് ചെയ്യുന്നു...",
      noComments: "ഇതുവരെ അഭിപ്രായങ്ങളില്ല. നിങ്ങളുടെ ചിന്തകള്‍ പങ്കിടുന്ന ആദ്യത്തെയാളാകൂ!",
      reply: "മറുപടി",
      justNow: "ഇപ്പോള്‍",
      minuteAgo: "{count} മിനിറ്റ് മുമ്പ്",
      minutesAgo: "{count} മിനിറ്റ് മുമ്പ്",
      hourAgo: "{count} മണിക്കൂര്‍ മുമ്പ്",
      hoursAgo: "{count} മണിക്കൂര്‍ മുമ്പ്",
      dayAgo: "{count} ദിവസം മുമ്പ്",
      daysAgo: "{count} ദിവസം മുമ്പ്"
    }
  },
  pa: {
    consultation: {
      topics: "ਸਲਾਹ-ਮਸ਼ਵਰੇ ਦੇ ਵਿਸ਼ੇ",
      whyChoose: "VedicStarAstro ਕਿਉਂ ਚੁਣੋ?"
    },
    error: {
      pageNotFound: "ਪੰਨਾ ਨਹੀਂ ਮਿਲਿਆ",
      pageNotFoundDesc: "ਜੋ ਪੰਨਾ ਤੁਸੀਂ ਲੱਭ ਰਹੇ ਹੋ ਉਹ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੋ ਸਕਦਾ ਹੈ, ਨਾਮ ਬਦਲ ਦਿੱਤਾ ਗਿਆ ਹੋ ਸਕਦਾ ਹੈ, ਜਾਂ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
      goHome: "ਹੋਮਪੇਜ 'ਤੇ ਜਾਓ",
      popularPages: "ਪ੍ਰਸਿੱਧ ਪੰਨੇ",
      needHelp: "ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
      contactUs: "ਸਾਡੀ ਸਪੋਰਟ ਟੀਮ ਨਾਲ ਸੰਪਰਕ ਕਰੋ"
    },
    breadcrumb: {
      home: "ਹੋਮ",
      tools: "ਟੂਲਸ",
      consultation: "ਸਲਾਹ-ਮਸ਼ਵਰਾ",
      contact: "ਸੰਪਰਕ",
      about: "ਸਾਡੇ ਬਾਰੇ",
      blog: "ਬਲੌਗ",
      astrologers: "ਜੋਤਿਸ਼ੀ",
      dailyHoroscope: "ਰੋਜ਼ਾਨਾ ਰਾਸ਼ੀਫਲ",
      kundliCalculator: "ਕੁੰਡਲੀ ਕੈਲਕੁਲੇਟਰ",
      nakshatraFinder: "ਨਕਸ਼ੱਤਰ ਖੋਜਕ",
      horoscopeMatching: "ਕੁੰਡਲੀ ਮਿਲਾਨ"
    },
    comments: {
      title: "ਟਿੱਪਣੀਆਂ",
      leaveComment: "ਟਿੱਪਣੀ ਛੱਡੋ",
      replyTo: "{name} ਨੂੰ ਜਵਾਬ ਦਿਓ",
      replyingTo: "{name} ਨੂੰ ਜਵਾਬ ਦੇ ਰਹੇ ਹੋ",
      cancel: "ਰੱਦ ਕਰੋ",
      nameLabel: "ਨਾਮ *",
      namePlaceholder: "ਤੁਹਾਡਾ ਨਾਮ",
      emailLabel: "ਈਮੇਲ *",
      emailNotPublished: "(ਪ੍ਰਕਾਸ਼ਿਤ ਨਹੀਂ ਹੋਵੇਗਾ)",
      emailPlaceholder: "your@email.com",
      commentLabel: "ਟਿੱਪਣੀ *",
      commentPlaceholder: "ਆਪਣੇ ਵਿਚਾਰ ਸਾਂਝੇ ਕਰੋ...",
      charactersCount: "{count}/2000 ਅੱਖਰ",
      submitSuccess: "ਧੰਨਵਾਦ! ਤੁਹਾਡੀ ਟਿੱਪਣੀ ਜਮ੍ਹਾਂ ਹੋ ਗਈ ਹੈ ਅਤੇ ਮਨਜ਼ੂਰੀ ਦੀ ਉਡੀਕ ਵਿੱਚ ਹੈ।",
      submitting: "ਜਮ੍ਹਾਂ ਹੋ ਰਿਹਾ ਹੈ...",
      postReply: "ਜਵਾਬ ਪੋਸਟ ਕਰੋ",
      postComment: "ਟਿੱਪਣੀ ਪੋਸਟ ਕਰੋ",
      loadingComments: "ਟਿੱਪਣੀਆਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...",
      noComments: "ਅਜੇ ਕੋਈ ਟਿੱਪਣੀਆਂ ਨਹੀਂ। ਆਪਣੇ ਵਿਚਾਰ ਸਾਂਝੇ ਕਰਨ ਵਾਲੇ ਪਹਿਲੇ ਬਣੋ!",
      reply: "ਜਵਾਬ",
      justNow: "ਹੁਣੇ",
      minuteAgo: "{count} ਮਿੰਟ ਪਹਿਲਾਂ",
      minutesAgo: "{count} ਮਿੰਟ ਪਹਿਲਾਂ",
      hourAgo: "{count} ਘੰਟਾ ਪਹਿਲਾਂ",
      hoursAgo: "{count} ਘੰਟੇ ਪਹਿਲਾਂ",
      dayAgo: "{count} ਦਿਨ ਪਹਿਲਾਂ",
      daysAgo: "{count} ਦਿਨ ਪਹਿਲਾਂ"
    }
  }
};
