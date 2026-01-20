// Astrologers Page Translations for VedicStarAstro
// This file contains translations for the astrologers page in all 10 languages

import { Language } from "./translations";

type TranslationObject = Record<string, unknown>;

export const astrologersTranslations: Record<Language, TranslationObject> = {
  en: {
    about: {
      // Astrologer Experience
      exp35: "35+ years",
      exp20: "20+ years",
      exp16: "16+ years",
      exp15: "15+ years",
      exp12: "12+ years",
      exp10: "10+ years",
      
      // Astrologer Locations
      locationBengaluru: "Bengaluru",
      locationJaipur: "Jaipur",
      locationKolkata: "Kolkata (WB)",
      locationMumbai: "Mumbai",
      locationNewDelhi: "New Delhi",
      locationBareilly: "Bareilly (UP)",
      
      // Astrologer Specializations
      specAstroVastuPoojaGems: "Astro, Vastu, Pooja & Gems",
      specAstroPoojaGems: "Astro, Pooja & Gems",
      specAstroVastuPooja: "Astro, Vastu & Pooja",
      specVastuPooja: "Vastu & Pooja",
      
      // Astrologer Bios
      bioShridhar: "A renowned Vedic astrologer with 35 years of experience in Astrology, Vastu, Pooja, and Gemstone consultation. Based in Bengaluru, Acharya Shridhar has dedicated his life to making authentic Jyotish accessible to the modern world.",
      bioMadhav: "With 20 years of experience in Astrology, Pooja, and Gemstone consultation, Madhav Sharma brings deep expertise to traditional astrological practice from Jaipur.",
      bioRajKumar: "An expert in Astrology, Vastu, and Pooja with 16 years of experience, Raj Kumar Shastri has helped thousands from Kolkata overcome challenging planetary periods.",
      bioBanwari: "A specialist in Vastu Shastra and Pooja rituals with 15 years of experience, Banwari Dadich provides guidance on home and office Vastu from Bengaluru.",
      bioNemichand: "With 12 years of experience in Vastu and Pooja, Nemichand Shastri offers expert consultation for harmonious living spaces from Bengaluru.",
      bioVinod: "Vinod Shastri brings 10 years of expertise in Vastu and Pooja services, helping clients in Mumbai create positive energy in their homes and workplaces.",
      bioBajarangbali: "Based in New Delhi, Bajarangbali Dubey has 12 years of experience in Vastu Shastra and Pooja rituals, providing remedies for various life challenges.",
      bioPankaj: "Pankaj Shastri from Bareilly has 12 years of experience in Vastu and Pooja, offering traditional remedies and guidance for a prosperous life.",
      
      // Roles
      founderRole: "Founder & Chief Astrologer",
      seniorRole: "Senior Astrologer",
      remediesRole: "Remedies Specialist",
    },
    astrologers: {
      badge: "Our Experts",
      title: "Meet Our Verified Astrologers",
      subtitle: "Our team of expert Vedic astrologers brings decades of experience in Jyotish Shastra. Each astrologer is verified and follows traditional methodologies for accurate predictions.",
      
      // Stats
      expertAstrologers: "Expert Astrologers",
      consultationsDone: "Consultations Done",
      averageRating: "Average Rating",
      yearsAvgExperience: "Years Avg Experience",
      
      // Card Labels
      available: "Available",
      busy: "Busy",
      experience: "Experience",
      consultations: "consultations",
      perSession: "/session",
      
      // Buttons
      call: "Call",
      videoCall: "Video Call",
      chat: "Chat",
      bookViaWhatsApp: "Book via WhatsApp",
      
      // Why Choose Section
      whyChooseTitle: "Why Choose Our Astrologers?",
      verifiedExperts: "Verified Experts",
      verifiedExpertsDesc: "All astrologers undergo rigorous verification and testing before joining our platform.",
      traditionalTraining: "Traditional Training",
      traditionalTrainingDesc: "Trained in classical Vedic texts and traditional Gurukul systems.",
      provenTrackRecord: "Proven Track Record",
      provenTrackRecordDesc: "Thousands of satisfied clients with consistently high ratings.",
      multipleLanguages: "Multiple Languages",
      multipleLanguagesDesc: "Consultations available in Hindi, English, and regional languages.",
      
      // CTA Section
      readyForConsultation: "Ready for Your Consultation?",
      bookSessionDesc: "Book a session with our expert astrologers and get personalized guidance.",
      bookConsultation: "Book Consultation",
      tryFreeKundli: "Try Free Kundli First",
      
      // Specializations
      astrology: "Astrology",
      vastuShastra: "Vastu Shastra",
      pooja: "Pooja",
      gemstones: "Gemstones",
      remedies: "Remedies",
      muhurta: "Muhurta",
      homeRemedies: "Home Remedies",
      kundliAnalysis: "Kundli Analysis",
      grihaPravesh: "Griha Pravesh",
      marriageMatching: "Marriage Matching",
      remedialMeasures: "Remedial Measures"
    }
  },
  hi: {
    about: {
      // Astrologer Experience
      exp35: "35+ वर्ष",
      exp20: "20+ वर्ष",
      exp16: "16+ वर्ष",
      exp15: "15+ वर्ष",
      exp12: "12+ वर्ष",
      exp10: "10+ वर्ष",
      
      // Astrologer Locations
      locationBengaluru: "बेंगलुरु",
      locationJaipur: "जयपुर",
      locationKolkata: "कोलकाता (पश्चिम बंगाल)",
      locationMumbai: "मुंबई",
      locationNewDelhi: "नई दिल्ली",
      locationBareilly: "बरेली (उत्तर प्रदेश)",
      
      // Astrologer Specializations
      specAstroVastuPoojaGems: "ज्योतिष, वास्तु, पूजा और रत्न",
      specAstroPoojaGems: "ज्योतिष, पूजा और रत्न",
      specAstroVastuPooja: "ज्योतिष, वास्तु और पूजा",
      specVastuPooja: "वास्तु और पूजा",
      
      // Astrologer Bios
      bioShridhar: "ज्योतिष, वास्तु, पूजा और रत्न परामर्श में 35 वर्षों के अनुभव के साथ एक प्रसिद्ध वैदिक ज्योतिषी। बेंगलुरु में स्थित, आचार्य श्रीधर ने प्रामाणिक ज्योतिष को आधुनिक दुनिया के लिए सुलभ बनाने के लिए अपना जीवन समर्पित किया है।",
      bioMadhav: "ज्योतिष, पूजा और रत्न परामर्श में 20 वर्षों के अनुभव के साथ, माधव शर्मा जयपुर से पारंपरिक ज्योतिषीय अभ्यास में गहरी विशेषज्ञता लाते हैं।",
      bioRajKumar: "16 वर्षों के अनुभव के साथ ज्योतिष, वास्तु और पूजा में विशेषज्ञ, राज कुमार शास्त्री ने कोलकाता से हजारों लोगों को चुनौतीपूर्ण ग्रह काल से उबरने में मदद की है।",
      bioBanwari: "15 वर्षों के अनुभव के साथ वास्तु शास्त्र और पूजा अनुष्ठानों में विशेषज्ञ, बनवारी दादीच बेंगलुरु से घर और कार्यालय वास्तु पर मार्गदर्शन प्रदान करते हैं।",
      bioNemichand: "वास्तु और पूजा में 12 वर्षों के अनुभव के साथ, नेमीचंद शास्त्री बेंगलुरु से सामंजस्यपूर्ण रहने की जगहों के लिए विशेषज्ञ परामर्श प्रदान करते हैं।",
      bioVinod: "विनोद शास्त्री वास्तु और पूजा सेवाओं में 10 वर्षों की विशेषज्ञता लाते हैं, मुंबई में ग्राहकों को उनके घरों और कार्यस्थलों में सकारात्मक ऊर्जा बनाने में मदद करते हैं।",
      bioBajarangbali: "नई दिल्ली में स्थित, बजरंगबली दुबे के पास वास्तु शास्त्र और पूजा अनुष्ठानों में 12 वर्षों का अनुभव है, जो विभिन्न जीवन चुनौतियों के लिए उपाय प्रदान करते हैं।",
      bioPankaj: "बरेली के पंकज शास्त्री के पास वास्तु और पूजा में 12 वर्षों का अनुभव है, जो समृद्ध जीवन के लिए पारंपरिक उपाय और मार्गदर्शन प्रदान करते हैं।",
      
      // Roles
      founderRole: "संस्थापक और मुख्य ज्योतिषी",
      seniorRole: "वरिष्ठ ज्योतिषी",
      remediesRole: "उपाय विशेषज्ञ",
    },
    astrologers: {
      badge: "हमारे विशेषज्ञ",
      title: "हमारे प्रमाणित ज्योतिषियों से मिलें",
      subtitle: "हमारी विशेषज्ञ वैदिक ज्योतिषियों की टीम ज्योतिष शास्त्र में दशकों का अनुभव लाती है। प्रत्येक ज्योतिषी प्रमाणित है और सटीक भविष्यवाणियों के लिए पारंपरिक पद्धतियों का पालन करता है।",
      
      // Stats
      expertAstrologers: "विशेषज्ञ ज्योतिषी",
      consultationsDone: "परामर्श पूर्ण",
      averageRating: "औसत रेटिंग",
      yearsAvgExperience: "वर्ष औसत अनुभव",
      
      // Card Labels
      available: "उपलब्ध",
      busy: "व्यस्त",
      experience: "अनुभव",
      consultations: "परामर्श",
      perSession: "/सत्र",
      
      // Buttons
      call: "कॉल",
      videoCall: "वीडियो कॉल",
      chat: "चैट",
      bookViaWhatsApp: "व्हाट्सएप से बुक करें",
      
      // Why Choose Section
      whyChooseTitle: "हमारे ज्योतिषियों को क्यों चुनें?",
      verifiedExperts: "प्रमाणित विशेषज्ञ",
      verifiedExpertsDesc: "सभी ज्योतिषी हमारे प्लेटफॉर्म पर शामिल होने से पहले कठोर सत्यापन और परीक्षण से गुजरते हैं।",
      traditionalTraining: "पारंपरिक प्रशिक्षण",
      traditionalTrainingDesc: "शास्त्रीय वैदिक ग्रंथों और पारंपरिक गुरुकुल प्रणालियों में प्रशिक्षित।",
      provenTrackRecord: "सिद्ध ट्रैक रिकॉर्ड",
      provenTrackRecordDesc: "लगातार उच्च रेटिंग के साथ हजारों संतुष्ट ग्राहक।",
      multipleLanguages: "कई भाषाएं",
      multipleLanguagesDesc: "हिंदी, अंग्रेजी और क्षेत्रीय भाषाओं में परामर्श उपलब्ध।",
      
      // CTA Section
      readyForConsultation: "अपने परामर्श के लिए तैयार हैं?",
      bookSessionDesc: "हमारे विशेषज्ञ ज्योतिषियों के साथ सत्र बुक करें और व्यक्तिगत मार्गदर्शन प्राप्त करें।",
      bookConsultation: "परामर्श बुक करें",
      tryFreeKundli: "पहले मुफ्त कुंडली आज़माएं",
      
      // Specializations
      astrology: "ज्योतिष",
      vastuShastra: "वास्तु शास्त्र",
      pooja: "पूजा",
      gemstones: "रत्न",
      remedies: "उपाय",
      muhurta: "मुहूर्त",
      homeRemedies: "घरेलू उपाय",
      kundliAnalysis: "कुंडली विश्लेषण",
      grihaPravesh: "गृह प्रवेश",
      marriageMatching: "विवाह मिलान",
      remedialMeasures: "उपचारात्मक उपाय"
    }
  },
  ta: {
    about: {
      // Astrologer Experience
      exp35: "35+ ஆண்டுகள்",
      exp20: "20+ ஆண்டுகள்",
      exp16: "16+ ஆண்டுகள்",
      exp15: "15+ ஆண்டுகள்",
      exp12: "12+ ஆண்டுகள்",
      exp10: "10+ ஆண்டுகள்",
      
      // Astrologer Locations
      locationBengaluru: "பெங்களூரு",
      locationJaipur: "ஜெய்ப்பூர்",
      locationKolkata: "கொல்கத்தா (மேற்கு வங்காளம்)",
      locationMumbai: "மும்பை",
      locationNewDelhi: "புது தில்லி",
      locationBareilly: "பரேலி (உத்தரப் பிரதேசம்)",
      
      // Astrologer Specializations
      specAstroVastuPoojaGems: "ஜோதிடம், வாஸ்து, பூஜை & ரத்தினங்கள்",
      specAstroPoojaGems: "ஜோதிடம், பூஜை & ரத்தினங்கள்",
      specAstroVastuPooja: "ஜோதிடம், வாஸ்து & பூஜை",
      specVastuPooja: "வாஸ்து & பூஜை",
      
      // Astrologer Bios
      bioShridhar: "ஜோதிடம், வாஸ்து, பூஜை மற்றும் ரத்தின ஆலோசனையில் 35 ஆண்டுகள் அனுபவம் கொண்ட புகழ்பெற்ற வேத ஜோதிடர். பெங்களூருவை தளமாகக் கொண்ட ஆச்சார்ய ஸ்ரீதர் உண்மையான ஜோதிஷத்தை நவீன உலகிற்கு அணுகக்கூடியதாக மாற்ற தனது வாழ்க்கையை அர்ப்பணித்துள்ளார்.",
      bioMadhav: "ஜோதிடம், பூஜை மற்றும் ரத்தின ஆலோசனையில் 20 ஆண்டுகள் அனுபவத்துடன், மாதவ் சர்மா ஜெய்ப்பூரிலிருந்து பாரம்பரிய ஜோதிட நடைமுறையில் ஆழமான நிபுணத்துவத்தை கொண்டுவருகிறார்.",
      bioRajKumar: "16 ஆண்டுகள் அனுபவத்துடன் ஜோதிடம், வாஸ்து மற்றும் பூஜையில் நிபுணர், ராஜ் குமார் சாஸ்திரி கொல்கத்தாவிலிருந்து ஆயிரக்கணக்கானோருக்கு சவாலான கிரக காலங்களை கடக்க உதவியுள்ளார்.",
      bioBanwari: "15 ஆண்டுகள் அனுபவத்துடன் வாஸ்து சாஸ்திரம் மற்றும் பூஜை சடங்குகளில் நிபுணர், பன்வாரி தாதிச் பெங்களூருவிலிருந்து வீடு மற்றும் அலுவலக வாஸ்து குறித்த வழிகாட்டுதல் வழங்குகிறார்.",
      bioNemichand: "வாஸ்து மற்றும் பூஜையில் 12 ஆண்டுகள் அனுபவத்துடன், நேமிசந்த் சாஸ்திரி பெங்களூருவிலிருந்து இணக்கமான வாழ்விடங்களுக்கு நிபுணர் ஆலோசனை வழங்குகிறார்.",
      bioVinod: "விநோத் சாஸ்திரி வாஸ்து மற்றும் பூஜை சேவைகளில் 10 ஆண்டுகள் நிபுணத்துவத்தை கொண்டுவருகிறார், மும்பையில் வாடிக்கையாளர்களுக்கு அவர்களின் வீடுகள் மற்றும் பணியிடங்களில் நேர்மறை ஆற்றலை உருவாக்க உதவுகிறார்.",
      bioBajarangbali: "புது தில்லியை தளமாகக் கொண்ட பஜரங்கபலி துபே வாஸ்து சாஸ்திரம் மற்றும் பூஜை சடங்குகளில் 12 ஆண்டுகள் அனுபவம் கொண்டவர், பல்வேறு வாழ்க்கை சவால்களுக்கு பரிகாரங்கள் வழங்குகிறார்.",
      bioPankaj: "பரேலியைச் சேர்ந்த பங்கஜ் சாஸ்திரி வாஸ்து மற்றும் பூஜையில் 12 ஆண்டுகள் அனுபவம் கொண்டவர், செழிப்பான வாழ்க்கைக்கு பாரம்பரிய பரிகாரங்கள் மற்றும் வழிகாட்டுதல் வழங்குகிறார்.",
      
      // Roles
      founderRole: "நிறுவனர் & தலைமை ஜோதிடர்",
      seniorRole: "மூத்த ஜோதிடர்",
      remediesRole: "பரிகார நிபுணர்",
    },
    astrologers: {
      badge: "எங்கள் நிபுணர்கள்",
      title: "எங்கள் சரிபார்க்கப்பட்ட ஜோதிடர்களை சந்தியுங்கள்",
      subtitle: "எங்கள் நிபுணர் வேத ஜோதிடர்கள் குழு ஜோதிஷ சாஸ்திரத்தில் பல தசாப்தங்கள் அனுபவத்தை கொண்டுவருகிறது. ஒவ்வொரு ஜோதிடரும் சரிபார்க்கப்பட்டவர் மற்றும் துல்லியமான கணிப்புகளுக்கு பாரம்பரிய முறைகளை பின்பற்றுகிறார்.",
      
      // Stats
      expertAstrologers: "நிபுணர் ஜோதிடர்கள்",
      consultationsDone: "ஆலோசனைகள் முடிந்தது",
      averageRating: "சராசரி மதிப்பீடு",
      yearsAvgExperience: "ஆண்டுகள் சராசரி அனுபவம்",
      
      // Card Labels
      available: "கிடைக்கும்",
      busy: "பிஸி",
      experience: "அனுபவம்",
      consultations: "ஆலோசனைகள்",
      perSession: "/அமர்வு",
      
      // Buttons
      call: "அழைப்பு",
      videoCall: "வீடியோ அழைப்பு",
      chat: "அரட்டை",
      bookViaWhatsApp: "வாட்ஸ்அப் மூலம் முன்பதிவு செய்யுங்கள்",
      
      // Why Choose Section
      whyChooseTitle: "எங்கள் ஜோதிடர்களை ஏன் தேர்வு செய்ய வேண்டும்?",
      verifiedExperts: "சரிபார்க்கப்பட்ட நிபுணர்கள்",
      verifiedExpertsDesc: "அனைத்து ஜோதிடர்களும் எங்கள் தளத்தில் சேருவதற்கு முன் கடுமையான சரிபார்ப்பு மற்றும் சோதனைக்கு உட்படுகிறார்கள்.",
      traditionalTraining: "பாரம்பரிய பயிற்சி",
      traditionalTrainingDesc: "கிளாசிக்கல் வேத நூல்கள் மற்றும் பாரம்பரிய குருகுல அமைப்புகளில் பயிற்சி பெற்றவர்கள்.",
      provenTrackRecord: "நிரூபிக்கப்பட்ட சாதனை",
      provenTrackRecordDesc: "தொடர்ந்து உயர் மதிப்பீடுகளுடன் ஆயிரக்கணக்கான திருப்தியான வாடிக்கையாளர்கள்.",
      multipleLanguages: "பல மொழிகள்",
      multipleLanguagesDesc: "இந்தி, ஆங்கிலம் மற்றும் பிராந்திய மொழிகளில் ஆலோசனைகள் கிடைக்கும்.",
      
      // CTA Section
      readyForConsultation: "உங்கள் ஆலோசனைக்கு தயாரா?",
      bookSessionDesc: "எங்கள் நிபுணர் ஜோதிடர்களுடன் அமர்வை முன்பதிவு செய்து தனிப்பயனாக்கப்பட்ட வழிகாட்டுதலைப் பெறுங்கள்.",
      bookConsultation: "ஆலோசனை முன்பதிவு",
      tryFreeKundli: "முதலில் இலவச குண்டலி முயற்சிக்கவும்",
      
      // Specializations
      astrology: "ஜோதிடம்",
      vastuShastra: "வாஸ்து சாஸ்திரம்",
      pooja: "பூஜை",
      gemstones: "ரத்தினங்கள்",
      remedies: "பரிகாரங்கள்",
      muhurta: "முகூர்த்தம்",
      homeRemedies: "வீட்டு வைத்தியம்",
      kundliAnalysis: "குண்டலி பகுப்பாய்வு",
      grihaPravesh: "கிரஹ பிரவேஷ்",
      marriageMatching: "திருமண பொருத்தம்",
      remedialMeasures: "பரிகார நடவடிக்கைகள்"
    }
  },
  te: {
    about: {
      // Astrologer Experience
      exp35: "35+ సంవత్సరాలు",
      exp20: "20+ సంవత్సరాలు",
      exp16: "16+ సంవత్సరాలు",
      exp15: "15+ సంవత్సరాలు",
      exp12: "12+ సంవత్సరాలు",
      exp10: "10+ సంవత్సరాలు",
      
      // Astrologer Locations
      locationBengaluru: "బెంగళూరు",
      locationJaipur: "జైపూర్",
      locationKolkata: "కోల్‌కతా (పశ్చిమ బెంగాల్)",
      locationMumbai: "ముంబై",
      locationNewDelhi: "న్యూ ఢిల్లీ",
      locationBareilly: "బరేలీ (ఉత్తర ప్రదేశ్)",
      
      // Astrologer Specializations
      specAstroVastuPoojaGems: "జ్యోతిషం, వాస్తు, పూజ & రత్నాలు",
      specAstroPoojaGems: "జ్యోతిషం, పూజ & రత్నాలు",
      specAstroVastuPooja: "జ్యోతిషం, వాస్తు & పూజ",
      specVastuPooja: "వాస్తు & పూజ",
      
      // Astrologer Bios
      bioShridhar: "జ్యోతిషం, వాస్తు, పూజ మరియు రత్న సంప్రదింపులో 35 సంవత్సరాల అనుభవం ఉన్న ప్రసిద్ధ వేద జ్యోతిష్కుడు. బెంగళూరులో ఉన్న ఆచార్య శ్రీధర్ అసలైన జ్యోతిష్‌ను ఆధునిక ప్రపంచానికి అందుబాటులోకి తీసుకురావడానికి తన జీవితాన్ని అంకితం చేశారు.",
      bioMadhav: "జ్యోతిషం, పూజ మరియు రత్న సంప్రదింపులో 20 సంవత్సరాల అనుభవంతో, మాధవ్ శర్మ జైపూర్ నుండి సాంప్రదాయ జ్యోతిష అభ్యాసంలో లోతైన నైపుణ్యాన్ని తీసుకువస్తారు.",
      bioRajKumar: "16 సంవత్సరాల అనుభవంతో జ్యోతిషం, వాస్తు మరియు పూజలో నిపుణుడు, రాజ్ కుమార్ శాస్త్రి కోల్‌కతా నుండి వేలాది మందికి సవాలుతో కూడిన గ్రహ కాలాలను అధిగమించడంలో సహాయం చేశారు.",
      bioBanwari: "15 సంవత్సరాల అనుభవంతో వాస్తు శాస్త్రం మరియు పూజ ఆచారాలలో నిపుణుడు, బన్వారీ దాదిచ్ బెంగళూరు నుండి ఇల్లు మరియు కార్యాలయ వాస్తుపై మార్గదర్శకత్వం అందిస్తారు.",
      bioNemichand: "వాస్తు మరియు పూజలో 12 సంవత్సరాల అనుభవంతో, నేమిచంద్ శాస్త్రి బెంగళూరు నుండి సామరస్యపూర్వక నివాస స్థలాల కోసం నిపుణ సంప్రదింపులు అందిస్తారు.",
      bioVinod: "వినోద్ శాస్త్రి వాస్తు మరియు పూజ సేవలలో 10 సంవత్సరాల నైపుణ్యాన్ని తీసుకువస్తారు, ముంబైలో క్లయింట్లకు వారి ఇళ్ళు మరియు కార్యస్థలాలలో సానుకూల శక్తిని సృష్టించడంలో సహాయం చేస్తారు.",
      bioBajarangbali: "న్యూ ఢిల్లీలో ఉన్న బజరంగ్‌బలి దుబే వాస్తు శాస్త్రం మరియు పూజ ఆచారాలలో 12 సంవత్సరాల అనుభవం కలిగి ఉన్నారు, వివిధ జీవిత సవాళ్లకు పరిహారాలు అందిస్తారు.",
      bioPankaj: "బరేలీకి చెందిన పంకజ్ శాస్త్రి వాస్తు మరియు పూజలో 12 సంవత్సరాల అనుభవం కలిగి ఉన్నారు, సంపన్న జీవితం కోసం సాంప్రదాయ పరిహారాలు మరియు మార్గదర్శకత్వం అందిస్తారు.",
      
      // Roles
      founderRole: "వ్యవస్థాపకుడు & ప్రధాన జ్యోతిష్కుడు",
      seniorRole: "సీనియర్ జ్యోతిష్కుడు",
      remediesRole: "పరిహారాల నిపుణుడు",
    },
    astrologers: {
      badge: "మా నిపుణులు",
      title: "మా ధృవీకరించబడిన జ్యోతిష్కులను కలవండి",
      subtitle: "మా నిపుణుల వేద జ్యోతిష్కుల బృందం జ్యోతిష శాస్త్రంలో దశాబ్దాల అనుభవాన్ని తీసుకువస్తుంది. ప్రతి జ్యోతిష్కుడు ధృవీకరించబడ్డాడు మరియు ఖచ్చితమైన అంచనాల కోసం సాంప్రదాయ పద్ధతులను అనుసరిస్తాడు.",
      
      // Stats
      expertAstrologers: "నిపుణ జ్యోతిష్కులు",
      consultationsDone: "సంప్రదింపులు పూర్తయ్యాయి",
      averageRating: "సగటు రేటింగ్",
      yearsAvgExperience: "సంవత్సరాల సగటు అనుభవం",
      
      // Card Labels
      available: "అందుబాటులో ఉంది",
      busy: "బిజీ",
      experience: "అనుభవం",
      consultations: "సంప్రదింపులు",
      perSession: "/సెషన్",
      
      // Buttons
      call: "కాల్",
      videoCall: "వీడియో కాల్",
      chat: "చాట్",
      bookViaWhatsApp: "వాట్సాప్ ద్వారా బుక్ చేయండి",
      
      // Why Choose Section
      whyChooseTitle: "మా జ్యోతిష్కులను ఎందుకు ఎంచుకోవాలి?",
      verifiedExperts: "ధృవీకరించబడిన నిపుణులు",
      verifiedExpertsDesc: "అన్ని జ్యోతిష్కులు మా ప్లాట్‌ఫారమ్‌లో చేరడానికి ముందు కఠినమైన ధృవీకరణ మరియు పరీక్షకు లోనవుతారు.",
      traditionalTraining: "సాంప్రదాయ శిక్షణ",
      traditionalTrainingDesc: "క్లాసికల్ వేద గ్రంథాలు మరియు సాంప్రదాయ గురుకుల వ్యవస్థలలో శిక్షణ పొందారు.",
      provenTrackRecord: "నిరూపితమైన ట్రాక్ రికార్డ్",
      provenTrackRecordDesc: "స్థిరంగా అధిక రేటింగ్‌లతో వేలాది సంతృప్తి చెందిన క్లయింట్లు.",
      multipleLanguages: "బహుళ భాషలు",
      multipleLanguagesDesc: "హిందీ, ఆంగ్లం మరియు ప్రాంతీయ భాషలలో సంప్రదింపులు అందుబాటులో ఉన్నాయి.",
      
      // CTA Section
      readyForConsultation: "మీ సంప్రదింపుకు సిద్ధంగా ఉన్నారా?",
      bookSessionDesc: "మా నిపుణ జ్యోతిష్కులతో సెషన్ బుక్ చేసి వ్యక్తిగతీకరించిన మార్గదర్శకత్వం పొందండి.",
      bookConsultation: "సంప్రదింపు బుక్ చేయండి",
      tryFreeKundli: "ముందుగా ఉచిత కుండలి ప్రయత్నించండి",
      
      // Specializations
      astrology: "జ్యోతిషం",
      vastuShastra: "వాస్తు శాస్త్రం",
      pooja: "పూజ",
      gemstones: "రత్నాలు",
      remedies: "పరిహారాలు",
      muhurta: "ముహూర్తం",
      homeRemedies: "ఇంటి నివారణలు",
      kundliAnalysis: "కుండలి విశ్లేషణ",
      grihaPravesh: "గృహ ప్రవేశం",
      marriageMatching: "వివాహ సరిపోలిక",
      remedialMeasures: "పరిహార చర్యలు"
    }
  },
  bn: {
    about: {
      // Astrologer Experience
      exp35: "35+ বছর",
      exp20: "20+ বছর",
      exp16: "16+ বছর",
      exp15: "15+ বছর",
      exp12: "12+ বছর",
      exp10: "10+ বছর",
      
      // Astrologer Locations
      locationBengaluru: "বেঙ্গালুরু",
      locationJaipur: "জয়পুর",
      locationKolkata: "কলকাতা (পশ্চিমবঙ্গ)",
      locationMumbai: "মুম্বাই",
      locationNewDelhi: "নতুন দিল্লি",
      locationBareilly: "বরেলি (উত্তর প্রদেশ)",
      
      // Astrologer Specializations
      specAstroVastuPoojaGems: "জ্যোতিষ, বাস্তু, পূজা ও রত্ন",
      specAstroPoojaGems: "জ্যোতিষ, পূজা ও রত্ন",
      specAstroVastuPooja: "জ্যোতিষ, বাস্তু ও পূজা",
      specVastuPooja: "বাস্তু ও পূজা",
      
      // Astrologer Bios
      bioShridhar: "জ্যোতিষ, বাস্তু, পূজা এবং রত্ন পরামর্শে 35 বছরের অভিজ্ঞতা সহ একজন বিখ্যাত বৈদিক জ্যোতিষী। বেঙ্গালুরুতে অবস্থিত, আচার্য শ্রীধর প্রামাণিক জ্যোতিষকে আধুনিক বিশ্বের কাছে সুলভ করতে তাঁর জীবন উৎসর্গ করেছেন।",
      bioMadhav: "জ্যোতিষ, পূজা এবং রত্ন পরামর্শে 20 বছরের অভিজ্ঞতা সহ, মাধব শর্মা জয়পুর থেকে ঐতিহ্যবাহী জ্যোতিষ অনুশীলনে গভীর দক্ষতা নিয়ে আসেন।",
      bioRajKumar: "16 বছরের অভিজ্ঞতা সহ জ্যোতিষ, বাস্তু এবং পূজায় বিশেষজ্ঞ, রাজ কুমার শাস্ত্রী কলকাতা থেকে হাজার হাজার মানুষকে চ্যালেঞ্জিং গ্রহ কাল অতিক্রম করতে সাহায্য করেছেন।",
      bioBanwari: "15 বছরের অভিজ্ঞতা সহ বাস্তু শাস্ত্র এবং পূজা আচারে বিশেষজ্ঞ, বনওয়ারি দাদিচ বেঙ্গালুরু থেকে বাড়ি এবং অফিস বাস্তু সম্পর্কে নির্দেশনা প্রদান করেন।",
      bioNemichand: "বাস্তু এবং পূজায় 12 বছরের অভিজ্ঞতা সহ, নেমিচাঁদ শাস্ত্রী বেঙ্গালুরু থেকে সুসংগত বাসস্থানের জন্য বিশেষজ্ঞ পরামর্শ প্রদান করেন।",
      bioVinod: "বিনোদ শাস্ত্রী বাস্তু এবং পূজা সেবায় 10 বছরের দক্ষতা নিয়ে আসেন, মুম্বাইয়ে ক্লায়েন্টদের তাদের বাড়ি এবং কর্মস্থলে ইতিবাচক শক্তি তৈরি করতে সাহায্য করেন।",
      bioBajarangbali: "নতুন দিল্লিতে অবস্থিত, বজরংবলি দুবে বাস্তু শাস্ত্র এবং পূজা আচারে 12 বছরের অভিজ্ঞতা রয়েছে, বিভিন্ন জীবন চ্যালেঞ্জের জন্য প্রতিকার প্রদান করেন।",
      bioPankaj: "বরেলির পঙ্কজ শাস্ত্রী বাস্তু এবং পূজায় 12 বছরের অভিজ্ঞতা রয়েছে, সমৃদ্ধ জীবনের জন্য ঐতিহ্যবাহী প্রতিকার এবং নির্দেশনা প্রদান করেন।",
      
      // Roles
      founderRole: "প্রতিষ্ঠাতা ও প্রধান জ্যোতিষী",
      seniorRole: "সিনিয়র জ্যোতিষী",
      remediesRole: "প্রতিকার বিশেষজ্ঞ",
    },
    astrologers: {
      badge: "আমাদের বিশেষজ্ঞরা",
      title: "আমাদের যাচাইকৃত জ্যোতিষীদের সাথে দেখা করুন",
      subtitle: "আমাদের বিশেষজ্ঞ বৈদিক জ্যোতিষীদের দল জ্যোতিষ শাস্ত্রে কয়েক দশকের অভিজ্ঞতা নিয়ে আসে। প্রতিটি জ্যোতিষী যাচাইকৃত এবং সঠিক ভবিষ্যদ্বাণীর জন্য ঐতিহ্যবাহী পদ্ধতি অনুসরণ করে।",
      
      // Stats
      expertAstrologers: "বিশেষজ্ঞ জ্যোতিষী",
      consultationsDone: "পরামর্শ সম্পন্ন",
      averageRating: "গড় রেটিং",
      yearsAvgExperience: "বছর গড় অভিজ্ঞতা",
      
      // Card Labels
      available: "উপলব্ধ",
      busy: "ব্যস্ত",
      experience: "অভিজ্ঞতা",
      consultations: "পরামর্শ",
      perSession: "/সেশন",
      
      // Buttons
      call: "কল",
      videoCall: "ভিডিও কল",
      chat: "চ্যাট",
      bookViaWhatsApp: "হোয়াটসঅ্যাপে বুক করুন",
      
      // Why Choose Section
      whyChooseTitle: "আমাদের জ্যোতিষীদের কেন বেছে নেবেন?",
      verifiedExperts: "যাচাইকৃত বিশেষজ্ঞ",
      verifiedExpertsDesc: "সমস্ত জ্যোতিষী আমাদের প্ল্যাটফর্মে যোগদানের আগে কঠোর যাচাইকরণ এবং পরীক্ষার মধ্য দিয়ে যান।",
      traditionalTraining: "ঐতিহ্যবাহী প্রশিক্ষণ",
      traditionalTrainingDesc: "ক্লাসিক্যাল বৈদিক গ্রন্থ এবং ঐতিহ্যবাহী গুরুকুল পদ্ধতিতে প্রশিক্ষিত।",
      provenTrackRecord: "প্রমাণিত ট্র্যাক রেকর্ড",
      provenTrackRecordDesc: "ধারাবাহিকভাবে উচ্চ রেটিং সহ হাজার হাজার সন্তুষ্ট ক্লায়েন্ট।",
      multipleLanguages: "একাধিক ভাষা",
      multipleLanguagesDesc: "হিন্দি, ইংরেজি এবং আঞ্চলিক ভাষায় পরামর্শ উপলব্ধ।",
      
      // CTA Section
      readyForConsultation: "আপনার পরামর্শের জন্য প্রস্তুত?",
      bookSessionDesc: "আমাদের বিশেষজ্ঞ জ্যোতিষীদের সাথে সেশন বুক করুন এবং ব্যক্তিগত নির্দেশনা পান।",
      bookConsultation: "পরামর্শ বুক করুন",
      tryFreeKundli: "প্রথমে বিনামূল্যে কুণ্ডলি চেষ্টা করুন",
      
      // Specializations
      astrology: "জ্যোতিষ",
      vastuShastra: "বাস্তু শাস্ত্র",
      pooja: "পূজা",
      gemstones: "রত্ন",
      remedies: "প্রতিকার",
      muhurta: "মুহূর্ত",
      homeRemedies: "ঘরোয়া প্রতিকার",
      kundliAnalysis: "কুণ্ডলি বিশ্লেষণ",
      grihaPravesh: "গৃহ প্রবেশ",
      marriageMatching: "বিবাহ মিলন",
      remedialMeasures: "প্রতিকারমূলক ব্যবস্থা"
    }
  },
  mr: {
    about: {
      // Astrologer Experience
      exp35: "35+ वर्षे",
      exp20: "20+ वर्षे",
      exp16: "16+ वर्षे",
      exp15: "15+ वर्षे",
      exp12: "12+ वर्षे",
      exp10: "10+ वर्षे",
      
      // Astrologer Locations
      locationBengaluru: "बेंगळुरू",
      locationJaipur: "जयपूर",
      locationKolkata: "कोलकाता (पश्चिम बंगाल)",
      locationMumbai: "मुंबई",
      locationNewDelhi: "नवी दिल्ली",
      locationBareilly: "बरेली (उत्तर प्रदेश)",
      
      // Astrologer Specializations
      specAstroVastuPoojaGems: "ज्योतिष, वास्तू, पूजा आणि रत्न",
      specAstroPoojaGems: "ज्योतिष, पूजा आणि रत्न",
      specAstroVastuPooja: "ज्योतिष, वास्तू आणि पूजा",
      specVastuPooja: "वास्तू आणि पूजा",
      
      // Astrologer Bios
      bioShridhar: "ज्योतिष, वास्तू, पूजा आणि रत्न सल्लामसलतीमध्ये 35 वर्षांचा अनुभव असलेले प्रसिद्ध वैदिक ज्योतिषी. बेंगळुरूमध्ये स्थित, आचार्य श्रीधर यांनी प्रामाणिक ज्योतिष आधुनिक जगासाठी सुलभ करण्यासाठी आपले जीवन समर्पित केले आहे.",
      bioMadhav: "ज्योतिष, पूजा आणि रत्न सल्लामसलतीमध्ये 20 वर्षांच्या अनुभवासह, माधव शर्मा जयपूरहून पारंपारिक ज्योतिष अभ्यासात खोल कौशल्य आणतात.",
      bioRajKumar: "16 वर्षांच्या अनुभवासह ज्योतिष, वास्तू आणि पूजेतील तज्ञ, राज कुमार शास्त्री यांनी कोलकाता येथून हजारो लोकांना आव्हानात्मक ग्रह काळातून बाहेर पडण्यास मदत केली आहे.",
      bioBanwari: "15 वर्षांच्या अनुभवासह वास्तू शास्त्र आणि पूजा विधींमधील तज्ञ, बनवारी दादीच बेंगळुरूहून घर आणि कार्यालय वास्तूबद्दल मार्गदर्शन प्रदान करतात.",
      bioNemichand: "वास्तू आणि पूजेमध्ये 12 वर्षांच्या अनुभवासह, नेमीचंद शास्त्री बेंगळुरूहून सुसंवादी राहण्याच्या जागांसाठी तज्ञ सल्लामसलत प्रदान करतात.",
      bioVinod: "विनोद शास्त्री वास्तू आणि पूजा सेवांमध्ये 10 वर्षांचे कौशल्य आणतात, मुंबईतील ग्राहकांना त्यांच्या घरांमध्ये आणि कार्यस्थळांमध्ये सकारात्मक ऊर्जा निर्माण करण्यात मदत करतात.",
      bioBajarangbali: "नवी दिल्लीत स्थित, बजरंगबली दुबे यांना वास्तू शास्त्र आणि पूजा विधींमध्ये 12 वर्षांचा अनुभव आहे, विविध जीवन आव्हानांसाठी उपाय प्रदान करतात.",
      bioPankaj: "बरेलीचे पंकज शास्त्री यांना वास्तू आणि पूजेमध्ये 12 वर्षांचा अनुभव आहे, समृद्ध जीवनासाठी पारंपारिक उपाय आणि मार्गदर्शन प्रदान करतात.",
      
      // Roles
      founderRole: "संस्थापक आणि मुख्य ज्योतिषी",
      seniorRole: "वरिष्ठ ज्योतिषी",
      remediesRole: "उपाय तज्ञ",
    },
    astrologers: {
      badge: "आमचे तज्ञ",
      title: "आमच्या प्रमाणित ज्योतिषींना भेटा",
      subtitle: "आमच्या तज्ञ वैदिक ज्योतिषींची टीम ज्योतिष शास्त्रात दशकांचा अनुभव आणते. प्रत्येक ज्योतिषी प्रमाणित आहे आणि अचूक भविष्यवाणीसाठी पारंपारिक पद्धतींचे पालन करतो.",
      
      // Stats
      expertAstrologers: "तज्ञ ज्योतिषी",
      consultationsDone: "सल्लामसलत पूर्ण",
      averageRating: "सरासरी रेटिंग",
      yearsAvgExperience: "वर्षे सरासरी अनुभव",
      
      // Card Labels
      available: "उपलब्ध",
      busy: "व्यस्त",
      experience: "अनुभव",
      consultations: "सल्लामसलत",
      perSession: "/सत्र",
      
      // Buttons
      call: "कॉल",
      videoCall: "व्हिडिओ कॉल",
      chat: "चॅट",
      bookViaWhatsApp: "व्हॉट्सअॅपवर बुक करा",
      
      // Why Choose Section
      whyChooseTitle: "आमच्या ज्योतिषींना का निवडावे?",
      verifiedExperts: "प्रमाणित तज्ञ",
      verifiedExpertsDesc: "सर्व ज्योतिषी आमच्या प्लॅटफॉर्मवर सामील होण्यापूर्वी कठोर पडताळणी आणि चाचणीतून जातात.",
      traditionalTraining: "पारंपारिक प्रशिक्षण",
      traditionalTrainingDesc: "शास्त्रीय वैदिक ग्रंथ आणि पारंपारिक गुरुकुल प्रणालींमध्ये प्रशिक्षित.",
      provenTrackRecord: "सिद्ध ट्रॅक रेकॉर्ड",
      provenTrackRecordDesc: "सातत्याने उच्च रेटिंगसह हजारो समाधानी ग्राहक.",
      multipleLanguages: "अनेक भाषा",
      multipleLanguagesDesc: "हिंदी, इंग्रजी आणि प्रादेशिक भाषांमध्ये सल्लामसलत उपलब्ध.",
      
      // CTA Section
      readyForConsultation: "तुमच्या सल्लामसलतीसाठी तयार आहात?",
      bookSessionDesc: "आमच्या तज्ञ ज्योतिषींसोबत सत्र बुक करा आणि वैयक्तिक मार्गदर्शन मिळवा.",
      bookConsultation: "सल्लामसलत बुक करा",
      tryFreeKundli: "प्रथम मोफत कुंडली वापरून पहा",
      
      // Specializations
      astrology: "ज्योतिष",
      vastuShastra: "वास्तू शास्त्र",
      pooja: "पूजा",
      gemstones: "रत्ने",
      remedies: "उपाय",
      muhurta: "मुहूर्त",
      homeRemedies: "घरगुती उपाय",
      kundliAnalysis: "कुंडली विश्लेषण",
      grihaPravesh: "गृह प्रवेश",
      marriageMatching: "विवाह जुळवणी",
      remedialMeasures: "उपचारात्मक उपाय"
    }
  },
  gu: {
    about: {
      // Astrologer Experience
      exp35: "35+ વર્ષ",
      exp20: "20+ વર્ષ",
      exp16: "16+ વર્ષ",
      exp15: "15+ વર્ષ",
      exp12: "12+ વર્ષ",
      exp10: "10+ વર્ષ",
      
      // Astrologer Locations
      locationBengaluru: "બેંગલુરુ",
      locationJaipur: "જયપુર",
      locationKolkata: "કોલકાતા (પશ્ચિમ બંગાળ)",
      locationMumbai: "મુંબઈ",
      locationNewDelhi: "નવી દિલ્હી",
      locationBareilly: "બરેલી (ઉત્તર પ્રદેશ)",
      
      // Astrologer Specializations
      specAstroVastuPoojaGems: "જ્યોતિષ, વાસ્તુ, પૂજા અને રત્ન",
      specAstroPoojaGems: "જ્યોતિષ, પૂજા અને રત્ન",
      specAstroVastuPooja: "જ્યોતિષ, વાસ્તુ અને પૂજા",
      specVastuPooja: "વાસ્તુ અને પૂજા",
      
      // Astrologer Bios
      bioShridhar: "જ્યોતિષ, વાસ્તુ, પૂજા અને રત્ન પરામર્શમાં 35 વર્ષના અનુભવ સાથે પ્રસિદ્ધ વૈદિક જ્યોતિષી. બેંગલુરુમાં સ્થિત, આચાર્ય શ્રીધરે પ્રામાણિક જ્યોતિષને આધુનિક વિશ્વ માટે સુલભ બનાવવા માટે પોતાનું જીવન સમર્પિત કર્યું છે.",
      bioMadhav: "જ્યોતિષ, પૂજા અને રત્ન પરામર્શમાં 20 વર્ષના અનુભવ સાથે, માધવ શર્મા જયપુરથી પરંપરાગત જ્યોતિષ અભ્યાસમાં ઊંડી કુશળતા લાવે છે.",
      bioRajKumar: "16 વર્ષના અનુભવ સાથે જ્યોતિષ, વાસ્તુ અને પૂજામાં નિષ્ણાત, રાજ કુમાર શાસ્ત્રીએ કોલકાતાથી હજારો લોકોને પડકારજનક ગ્રહ કાળમાંથી બહાર આવવામાં મદદ કરી છે.",
      bioBanwari: "15 વર્ષના અનુભવ સાથે વાસ્તુ શાસ્ત્ર અને પૂજા વિધિઓમાં નિષ્ણાત, બનવારી દાદીચ બેંગલુરુથી ઘર અને ઓફિસ વાસ્તુ વિશે માર્ગદર્શન પ્રદાન કરે છે.",
      bioNemichand: "વાસ્તુ અને પૂજામાં 12 વર્ષના અનુભવ સાથે, નેમીચંદ શાસ્ત્રી બેંગલુરુથી સુમેળભર્યા રહેવાની જગ્યાઓ માટે નિષ્ણાત પરામર્શ પ્રદાન કરે છે.",
      bioVinod: "વિનોદ શાસ્ત્રી વાસ્તુ અને પૂજા સેવાઓમાં 10 વર્ષની કુશળતા લાવે છે, મુંબઈમાં ગ્રાહકોને તેમના ઘરો અને કાર્યસ્થળોમાં સકારાત્મક ઊર્જા બનાવવામાં મદદ કરે છે.",
      bioBajarangbali: "નવી દિલ્હીમાં સ્થિત, બજરંગબલી દુબેને વાસ્તુ શાસ્ત્ર અને પૂજા વિધિઓમાં 12 વર્ષનો અનુભવ છે, વિવિધ જીવન પડકારો માટે ઉપાયો પ્રદાન કરે છે.",
      bioPankaj: "બરેલીના પંકજ શાસ્ત્રીને વાસ્તુ અને પૂજામાં 12 વર્ષનો અનુભવ છે, સમૃદ્ધ જીવન માટે પરંપરાગત ઉપાયો અને માર્ગદર્શન પ્રદાન કરે છે.",
      
      // Roles
      founderRole: "સ્થાપક અને મુખ્ય જ્યોતિષી",
      seniorRole: "વરિષ્ઠ જ્યોતિષી",
      remediesRole: "ઉપાય નિષ્ણાત",
    },
    astrologers: {
      badge: "અમારા નિષ્ણાતો",
      title: "અમારા ચકાસાયેલા જ્યોતિષીઓને મળો",
      subtitle: "અમારી નિષ્ણાત વૈદિક જ્યોતિષીઓની ટીમ જ્યોતિષ શાસ્ત્રમાં દાયકાઓનો અનુભવ લાવે છે. દરેક જ્યોતિષી ચકાસાયેલ છે અને સચોટ આગાહીઓ માટે પરંપરાગત પદ્ધતિઓનું પાલન કરે છે.",
      
      // Stats
      expertAstrologers: "નિષ્ણાત જ્યોતિષીઓ",
      consultationsDone: "પરામર્શ પૂર્ણ",
      averageRating: "સરેરાશ રેટિંગ",
      yearsAvgExperience: "વર્ષો સરેરાશ અનુભવ",
      
      // Card Labels
      available: "ઉપલબ્ધ",
      busy: "વ્યસ્ત",
      experience: "અનુભવ",
      consultations: "પરામર્શ",
      perSession: "/સત્ર",
      
      // Buttons
      call: "કૉલ",
      videoCall: "વિડિયો કૉલ",
      chat: "ચેટ",
      bookViaWhatsApp: "વોટ્સએપ પર બુક કરો",
      
      // Why Choose Section
      whyChooseTitle: "અમારા જ્યોતિષીઓને શા માટે પસંદ કરવા?",
      verifiedExperts: "ચકાસાયેલ નિષ્ણાતો",
      verifiedExpertsDesc: "બધા જ્યોતિષીઓ અમારા પ્લેટફોર્મમાં જોડાતા પહેલા કડક ચકાસણી અને પરીક્ષણમાંથી પસાર થાય છે.",
      traditionalTraining: "પરંપરાગત તાલીમ",
      traditionalTrainingDesc: "શાસ્ત્રીય વૈદિક ગ્રંથો અને પરંપરાગત ગુરુકુલ પ્રણાલીઓમાં તાલીમ પામેલા.",
      provenTrackRecord: "સાબિત ટ્રેક રેકોર્ડ",
      provenTrackRecordDesc: "સતત ઉચ્ચ રેટિંગ સાથે હજારો સંતુષ્ટ ગ્રાહકો.",
      multipleLanguages: "બહુવિધ ભાષાઓ",
      multipleLanguagesDesc: "હિન્દી, અંગ્રેજી અને પ્રાદેશિક ભાષાઓમાં પરામર્શ ઉપલબ્ધ.",
      
      // CTA Section
      readyForConsultation: "તમારા પરામર્શ માટે તૈયાર છો?",
      bookSessionDesc: "અમારા નિષ્ણાત જ્યોતિષીઓ સાથે સત્ર બુક કરો અને વ્યક્તિગત માર્ગદર્શન મેળવો.",
      bookConsultation: "પરામર્શ બુક કરો",
      tryFreeKundli: "પહેલા મફત કુંડળી અજમાવો",
      
      // Specializations
      astrology: "જ્યોતિષ",
      vastuShastra: "વાસ્તુ શાસ્ત્ર",
      pooja: "પૂજા",
      gemstones: "રત્નો",
      remedies: "ઉપાયો",
      muhurta: "મુહૂર્ત",
      homeRemedies: "ઘરેલુ ઉપાયો",
      kundliAnalysis: "કુંડળી વિશ્લેષણ",
      grihaPravesh: "ગૃહ પ્રવેશ",
      marriageMatching: "લગ્ન મેળાપ",
      remedialMeasures: "ઉપચારાત્મક પગલાં"
    }
  },
  kn: {
    about: {
      // Astrologer Experience
      exp35: "35+ ವರ್ಷಗಳು",
      exp20: "20+ ವರ್ಷಗಳು",
      exp16: "16+ ವರ್ಷಗಳು",
      exp15: "15+ ವರ್ಷಗಳು",
      exp12: "12+ ವರ್ಷಗಳು",
      exp10: "10+ ವರ್ಷಗಳು",
      
      // Astrologer Locations
      locationBengaluru: "ಬೆಂಗಳೂರು",
      locationJaipur: "ಜೈಪುರ",
      locationKolkata: "ಕೋಲ್ಕತಾ (ಪಶ್ಚಿಮ ಬಂಗಾಳ)",
      locationMumbai: "ಮುಂಬೈ",
      locationNewDelhi: "ನವದೆಹಲಿ",
      locationBareilly: "ಬರೇಲಿ (ಉತ್ತರ ಪ್ರದೇಶ)",
      
      // Astrologer Specializations
      specAstroVastuPoojaGems: "ಜ್ಯೋತಿಷ, ವಾಸ್ತು, ಪೂಜೆ ಮತ್ತು ರತ್ನಗಳು",
      specAstroPoojaGems: "ಜ್ಯೋತಿಷ, ಪೂಜೆ ಮತ್ತು ರತ್ನಗಳು",
      specAstroVastuPooja: "ಜ್ಯೋತಿಷ, ವಾಸ್ತು ಮತ್ತು ಪೂಜೆ",
      specVastuPooja: "ವಾಸ್ತು ಮತ್ತು ಪೂಜೆ",
      
      // Astrologer Bios
      bioShridhar: "ಜ್ಯೋತಿಷ, ವಾಸ್ತು, ಪೂಜೆ ಮತ್ತು ರತ್ನ ಸಮಾಲೋಚನೆಯಲ್ಲಿ 35 ವರ್ಷಗಳ ಅನುಭವ ಹೊಂದಿರುವ ಪ್ರಸಿದ್ಧ ವೈದಿಕ ಜ್ಯೋತಿಷಿ. ಬೆಂಗಳೂರಿನಲ್ಲಿ ನೆಲೆಸಿರುವ ಆಚಾರ್ಯ ಶ್ರೀಧರ್ ಅವರು ಅಧಿಕೃತ ಜ್ಯೋತಿಷವನ್ನು ಆಧುನಿಕ ಜಗತ್ತಿಗೆ ಲಭ್ಯವಾಗುವಂತೆ ಮಾಡಲು ತಮ್ಮ ಜೀವನವನ್ನು ಮುಡಿಪಾಗಿಟ್ಟಿದ್ದಾರೆ.",
      bioMadhav: "ಜ್ಯೋತಿಷ, ಪೂಜೆ ಮತ್ತು ರತ್ನ ಸಮಾಲೋಚನೆಯಲ್ಲಿ 20 ವರ್ಷಗಳ ಅನುಭವದೊಂದಿಗೆ, ಮಾಧವ್ ಶರ್ಮಾ ಜೈಪುರದಿಂದ ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಯೋತಿಷ ಅಭ್ಯಾಸದಲ್ಲಿ ಆಳವಾದ ಪರಿಣತಿಯನ್ನು ತರುತ್ತಾರೆ.",
      bioRajKumar: "16 ವರ್ಷಗಳ ಅನುಭವದೊಂದಿಗೆ ಜ್ಯೋತಿಷ, ವಾಸ್ತು ಮತ್ತು ಪೂಜೆಯಲ್ಲಿ ತಜ್ಞ, ರಾಜ್ ಕುಮಾರ್ ಶಾಸ್ತ್ರಿ ಕೋಲ್ಕತಾದಿಂದ ಸಾವಿರಾರು ಜನರಿಗೆ ಸವಾಲಿನ ಗ್ರಹ ಅವಧಿಗಳನ್ನು ಜಯಿಸಲು ಸಹಾಯ ಮಾಡಿದ್ದಾರೆ.",
      bioBanwari: "15 ವರ್ಷಗಳ ಅನುಭವದೊಂದಿಗೆ ವಾಸ್ತು ಶಾಸ್ತ್ರ ಮತ್ತು ಪೂಜಾ ವಿಧಿಗಳಲ್ಲಿ ತಜ್ಞ, ಬನ್ವಾರಿ ದಾದಿಚ್ ಬೆಂಗಳೂರಿನಿಂದ ಮನೆ ಮತ್ತು ಕಚೇರಿ ವಾಸ್ತುವಿನ ಬಗ್ಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತಾರೆ.",
      bioNemichand: "ವಾಸ್ತು ಮತ್ತು ಪೂಜೆಯಲ್ಲಿ 12 ವರ್ಷಗಳ ಅನುಭವದೊಂದಿಗೆ, ನೇಮಿಚಂದ್ ಶಾಸ್ತ್ರಿ ಬೆಂಗಳೂರಿನಿಂದ ಸಾಮರಸ್ಯದ ವಾಸಸ್ಥಳಗಳಿಗಾಗಿ ತಜ್ಞ ಸಮಾಲೋಚನೆ ನೀಡುತ್ತಾರೆ.",
      bioVinod: "ವಿನೋದ್ ಶಾಸ್ತ್ರಿ ವಾಸ್ತು ಮತ್ತು ಪೂಜಾ ಸೇವೆಗಳಲ್ಲಿ 10 ವರ್ಷಗಳ ಪರಿಣತಿಯನ್ನು ತರುತ್ತಾರೆ, ಮುಂಬೈನಲ್ಲಿ ಗ್ರಾಹಕರಿಗೆ ಅವರ ಮನೆಗಳು ಮತ್ತು ಕೆಲಸದ ಸ್ಥಳಗಳಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿಯನ್ನು ಸೃಷ್ಟಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತಾರೆ.",
      bioBajarangbali: "ನವದೆಹಲಿಯಲ್ಲಿ ನೆಲೆಸಿರುವ ಬಜರಂಗ್‌ಬಲಿ ದುಬೆ ಅವರಿಗೆ ವಾಸ್ತು ಶಾಸ್ತ್ರ ಮತ್ತು ಪೂಜಾ ವಿಧಿಗಳಲ್ಲಿ 12 ವರ್ಷಗಳ ಅನುಭವವಿದೆ, ವಿವಿಧ ಜೀವನ ಸವಾಲುಗಳಿಗೆ ಪರಿಹಾರಗಳನ್ನು ನೀಡುತ್ತಾರೆ.",
      bioPankaj: "ಬರೇಲಿಯ ಪಂಕಜ್ ಶಾಸ್ತ್ರಿ ಅವರಿಗೆ ವಾಸ್ತು ಮತ್ತು ಪೂಜೆಯಲ್ಲಿ 12 ವರ್ಷಗಳ ಅನುಭವವಿದೆ, ಸಮೃದ್ಧ ಜೀವನಕ್ಕಾಗಿ ಸಾಂಪ್ರದಾಯಿಕ ಪರಿಹಾರಗಳು ಮತ್ತು ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತಾರೆ.",
      
      // Roles
      founderRole: "ಸಂಸ್ಥಾಪಕ ಮತ್ತು ಮುಖ್ಯ ಜ್ಯೋತಿಷಿ",
      seniorRole: "ಹಿರಿಯ ಜ್ಯೋತಿಷಿ",
      remediesRole: "ಪರಿಹಾರ ತಜ್ಞ",
    },
    astrologers: {
      badge: "ನಮ್ಮ ತಜ್ಞರು",
      title: "ನಮ್ಮ ಪರಿಶೀಲಿಸಿದ ಜ್ಯೋತಿಷಿಗಳನ್ನು ಭೇಟಿ ಮಾಡಿ",
      subtitle: "ನಮ್ಮ ತಜ್ಞ ವೈದಿಕ ಜ್ಯೋತಿಷಿಗಳ ತಂಡವು ಜ್ಯೋತಿಷ ಶಾಸ್ತ್ರದಲ್ಲಿ ದಶಕಗಳ ಅನುಭವವನ್ನು ತರುತ್ತದೆ. ಪ್ರತಿ ಜ್ಯೋತಿಷಿಯು ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿದ್ದಾರೆ ಮತ್ತು ನಿಖರವಾದ ಭವಿಷ್ಯವಾಣಿಗಳಿಗಾಗಿ ಸಾಂಪ್ರದಾಯಿಕ ವಿಧಾನಗಳನ್ನು ಅನುಸರಿಸುತ್ತಾರೆ.",
      
      // Stats
      expertAstrologers: "ತಜ್ಞ ಜ್ಯೋತಿಷಿಗಳು",
      consultationsDone: "ಸಮಾಲೋಚನೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ",
      averageRating: "ಸರಾಸರಿ ರೇಟಿಂಗ್",
      yearsAvgExperience: "ವರ್ಷಗಳ ಸರಾಸರಿ ಅನುಭವ",
      
      // Card Labels
      available: "ಲಭ್ಯವಿದೆ",
      busy: "ಬ್ಯುಸಿ",
      experience: "ಅನುಭವ",
      consultations: "ಸಮಾಲೋಚನೆಗಳು",
      perSession: "/ಅವಧಿ",
      
      // Buttons
      call: "ಕರೆ",
      videoCall: "ವೀಡಿಯೊ ಕರೆ",
      chat: "ಚಾಟ್",
      bookViaWhatsApp: "ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಬುಕ್ ಮಾಡಿ",
      
      // Why Choose Section
      whyChooseTitle: "ನಮ್ಮ ಜ್ಯೋತಿಷಿಗಳನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು?",
      verifiedExperts: "ಪರಿಶೀಲಿಸಿದ ತಜ್ಞರು",
      verifiedExpertsDesc: "ಎಲ್ಲಾ ಜ್ಯೋತಿಷಿಗಳು ನಮ್ಮ ವೇದಿಕೆಗೆ ಸೇರುವ ಮೊದಲು ಕಠಿಣ ಪರಿಶೀಲನೆ ಮತ್ತು ಪರೀಕ್ಷೆಗೆ ಒಳಗಾಗುತ್ತಾರೆ.",
      traditionalTraining: "ಸಾಂಪ್ರದಾಯಿಕ ತರಬೇತಿ",
      traditionalTrainingDesc: "ಶಾಸ್ತ್ರೀಯ ವೈದಿಕ ಗ್ರಂಥಗಳು ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಗುರುಕುಲ ವ್ಯವಸ್ಥೆಗಳಲ್ಲಿ ತರಬೇತಿ ಪಡೆದವರು.",
      provenTrackRecord: "ಸಾಬೀತಾದ ಟ್ರ್ಯಾಕ್ ರೆಕಾರ್ಡ್",
      provenTrackRecordDesc: "ಸ್ಥಿರವಾಗಿ ಹೆಚ್ಚಿನ ರೇಟಿಂಗ್‌ಗಳೊಂದಿಗೆ ಸಾವಿರಾರು ತೃಪ್ತ ಗ್ರಾಹಕರು.",
      multipleLanguages: "ಬಹು ಭಾಷೆಗಳು",
      multipleLanguagesDesc: "ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಲ್ಲಿ ಸಮಾಲೋಚನೆಗಳು ಲಭ್ಯವಿದೆ.",
      
      // CTA Section
      readyForConsultation: "ನಿಮ್ಮ ಸಮಾಲೋಚನೆಗೆ ಸಿದ್ಧರಾಗಿದ್ದೀರಾ?",
      bookSessionDesc: "ನಮ್ಮ ತಜ್ಞ ಜ್ಯೋತಿಷಿಗಳೊಂದಿಗೆ ಅವಧಿಯನ್ನು ಬುಕ್ ಮಾಡಿ ಮತ್ತು ವೈಯಕ್ತಿಕ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.",
      bookConsultation: "ಸಮಾಲೋಚನೆ ಬುಕ್ ಮಾಡಿ",
      tryFreeKundli: "ಮೊದಲು ಉಚಿತ ಕುಂಡಲಿ ಪ್ರಯತ್ನಿಸಿ",
      
      // Specializations
      astrology: "ಜ್ಯೋತಿಷ",
      vastuShastra: "ವಾಸ್ತು ಶಾಸ್ತ್ರ",
      pooja: "ಪೂಜೆ",
      gemstones: "ರತ್ನಗಳು",
      remedies: "ಪರಿಹಾರಗಳು",
      muhurta: "ಮುಹೂರ್ತ",
      homeRemedies: "ಮನೆ ಪರಿಹಾರಗಳು",
      kundliAnalysis: "ಕುಂಡಲಿ ವಿಶ್ಲೇಷಣೆ",
      grihaPravesh: "ಗೃಹ ಪ್ರವೇಶ",
      marriageMatching: "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ",
      remedialMeasures: "ಪರಿಹಾರ ಕ್ರಮಗಳು"
    }
  },
  ml: {
    about: {
      // Astrologer Experience
      exp35: "35+ വർഷം",
      exp20: "20+ വർഷം",
      exp16: "16+ വർഷം",
      exp15: "15+ വർഷം",
      exp12: "12+ വർഷം",
      exp10: "10+ വർഷം",
      
      // Astrologer Locations
      locationBengaluru: "ബെംഗളൂരു",
      locationJaipur: "ജയ്പൂർ",
      locationKolkata: "കൊൽക്കത്ത (പശ്ചിമ ബംഗാൾ)",
      locationMumbai: "മുംബൈ",
      locationNewDelhi: "ന്യൂ ഡൽഹി",
      locationBareilly: "ബറേലി (ഉത്തർ പ്രദേശ്)",
      
      // Astrologer Specializations
      specAstroVastuPoojaGems: "ജ്യോതിഷം, വാസ്തു, പൂജ & രത്നങ്ങൾ",
      specAstroPoojaGems: "ജ്യോതിഷം, പൂജ & രത്നങ്ങൾ",
      specAstroVastuPooja: "ജ്യോതിഷം, വാസ്തു & പൂജ",
      specVastuPooja: "വാസ്തു & പൂജ",
      
      // Astrologer Bios
      bioShridhar: "ജ്യോതിഷം, വാസ്തു, പൂജ, രത്ന കൺസൾട്ടേഷൻ എന്നിവയിൽ 35 വർഷത്തെ അനുഭവമുള്ള പ്രശസ്ത വൈദിക ജ്യോതിഷി. ബെംഗളൂരു ആസ്ഥാനമായി പ്രവർത്തിക്കുന്ന ആചാര്യ ശ്രീധർ ആധികാരിക ജ്യോതിഷത്തെ ആധുനിക ലോകത്തിന് ലഭ്യമാക്കാൻ തന്റെ ജീവിതം സമർപ്പിച്ചു.",
      bioMadhav: "ജ്യോതിഷം, പൂജ, രത്ന കൺസൾട്ടേഷൻ എന്നിവയിൽ 20 വർഷത്തെ അനുഭവത്തോടെ, മാധവ് ശർമ്മ ജയ്പൂരിൽ നിന്ന് പരമ്പരാഗത ജ്യോതിഷ പരിശീലനത്തിൽ ആഴത്തിലുള്ള വൈദഗ്ധ്യം കൊണ്ടുവരുന്നു.",
      bioRajKumar: "16 വർഷത്തെ അനുഭവത്തോടെ ജ്യോതിഷം, വാസ്തു, പൂജ എന്നിവയിൽ വിദഗ്ധൻ, രാജ് കുമാർ ശാസ്ത്രി കൊൽക്കത്തയിൽ നിന്ന് ആയിരക്കണക്കിന് ആളുകളെ വെല്ലുവിളി നിറഞ്ഞ ഗ്രഹ കാലഘട്ടങ്ങളെ മറികടക്കാൻ സഹായിച്ചു.",
      bioBanwari: "15 വർഷത്തെ അനുഭവത്തോടെ വാസ്തു ശാസ്ത്രത്തിലും പൂജാ ചടങ്ങുകളിലും വിദഗ്ധൻ, ബൻവാരി ദാദിച്ച് ബെംഗളൂരുവിൽ നിന്ന് വീടും ഓഫീസും വാസ്തുവിനെക്കുറിച്ച് മാർഗ്ഗനിർദ്ദേശം നൽകുന്നു.",
      bioNemichand: "വാസ്തുവിലും പൂജയിലും 12 വർഷത്തെ അനുഭവത്തോടെ, നേമിചന്ദ് ശാസ്ത്രി ബെംഗളൂരുവിൽ നിന്ന് സമന്വയ ജീവിത ഇടങ്ങൾക്കായി വിദഗ്ധ കൺസൾട്ടേഷൻ നൽകുന്നു.",
      bioVinod: "വിനോദ് ശാസ്ത്രി വാസ്തുവിലും പൂജാ സേവനങ്ങളിലും 10 വർഷത്തെ വൈദഗ്ധ്യം കൊണ്ടുവരുന്നു, മുംബൈയിലെ ക്ലയന്റുകളെ അവരുടെ വീടുകളിലും ജോലിസ്ഥലങ്ങളിലും പോസിറ്റീവ് ഊർജ്ജം സൃഷ്ടിക്കാൻ സഹായിക്കുന്നു.",
      bioBajarangbali: "ന്യൂ ഡൽഹി ആസ്ഥാനമായി പ്രവർത്തിക്കുന്ന ബജ്‌രംഗ്ബലി ദുബെയ്ക്ക് വാസ്തു ശാസ്ത്രത്തിലും പൂജാ ചടങ്ങുകളിലും 12 വർഷത്തെ അനുഭവമുണ്ട്, വിവിധ ജീവിത വെല്ലുവിളികൾക്ക് പരിഹാരങ്ങൾ നൽകുന്നു.",
      bioPankaj: "ബറേലിയിൽ നിന്നുള്ള പങ്കജ് ശാസ്ത്രിക്ക് വാസ്തുവിലും പൂജയിലും 12 വർഷത്തെ അനുഭവമുണ്ട്, സമൃദ്ധമായ ജീവിതത്തിനായി പരമ്പരാഗത പരിഹാരങ്ങളും മാർഗ്ഗനിർദ്ദേശവും നൽകുന്നു.",
      
      // Roles
      founderRole: "സ്ഥാപകനും മുഖ്യ ജ്യോതിഷിയും",
      seniorRole: "സീനിയർ ജ്യോതിഷി",
      remediesRole: "പരിഹാര വിദഗ്ധൻ",
    },
    astrologers: {
      badge: "ഞങ്ങളുടെ വിദഗ്ധർ",
      title: "ഞങ്ങളുടെ പരിശോധിച്ച ജ്യോതിഷികളെ കാണുക",
      subtitle: "ഞങ്ങളുടെ വിദഗ്ധ വൈദിക ജ്യോതിഷികളുടെ ടീം ജ്യോതിഷ ശാസ്ത്രത്തിൽ പതിറ്റാണ്ടുകളുടെ അനുഭവം കൊണ്ടുവരുന്നു. ഓരോ ജ്യോതിഷിയും പരിശോധിക്കപ്പെട്ടവരാണ് കൂടാതെ കൃത്യമായ പ്രവചനങ്ങൾക്കായി പരമ്പരാഗത രീതികൾ പിന്തുടരുന്നു.",
      
      // Stats
      expertAstrologers: "വിദഗ്ധ ജ്യോതിഷികൾ",
      consultationsDone: "കൺസൾട്ടേഷനുകൾ പൂർത്തിയായി",
      averageRating: "ശരാശരി റേറ്റിംഗ്",
      yearsAvgExperience: "വർഷങ്ങൾ ശരാശരി അനുഭവം",
      
      // Card Labels
      available: "ലഭ്യമാണ്",
      busy: "തിരക്കിലാണ്",
      experience: "അനുഭവം",
      consultations: "കൺസൾട്ടേഷനുകൾ",
      perSession: "/സെഷൻ",
      
      // Buttons
      call: "കോൾ",
      videoCall: "വീഡിയോ കോൾ",
      chat: "ചാറ്റ്",
      bookViaWhatsApp: "വാട്ട്സ്ആപ്പിൽ ബുക്ക് ചെയ്യുക",
      
      // Why Choose Section
      whyChooseTitle: "ഞങ്ങളുടെ ജ്യോതിഷികളെ എന്തുകൊണ്ട് തിരഞ്ഞെടുക്കണം?",
      verifiedExperts: "പരിശോധിച്ച വിദഗ്ധർ",
      verifiedExpertsDesc: "എല്ലാ ജ്യോതിഷികളും ഞങ്ങളുടെ പ്ലാറ്റ്ഫോമിൽ ചേരുന്നതിന് മുമ്പ് കർശനമായ പരിശോധനയും പരീക്ഷണവും നടത്തുന്നു.",
      traditionalTraining: "പരമ്പരാഗത പരിശീലനം",
      traditionalTrainingDesc: "ക്ലാസിക്കൽ വൈദിക ഗ്രന്ഥങ്ങളിലും പരമ്പരാഗത ഗുരുകുല സംവിധാനങ്ങളിലും പരിശീലനം നേടിയവർ.",
      provenTrackRecord: "തെളിയിക്കപ്പെട്ട ട്രാക്ക് റെക്കോർഡ്",
      provenTrackRecordDesc: "സ്ഥിരമായി ഉയർന്ന റേറ്റിംഗുകളുള്ള ആയിരക്കണക്കിന് സംതൃപ്ത ക്ലയന്റുകൾ.",
      multipleLanguages: "ഒന്നിലധികം ഭാഷകൾ",
      multipleLanguagesDesc: "ഹിന്ദി, ഇംഗ്ലീഷ്, പ്രാദേശിക ഭാഷകളിൽ കൺസൾട്ടേഷനുകൾ ലഭ്യമാണ്.",
      
      // CTA Section
      readyForConsultation: "നിങ്ങളുടെ കൺസൾട്ടേഷനു തയ്യാറാണോ?",
      bookSessionDesc: "ഞങ്ങളുടെ വിദഗ്ധ ജ്യോതിഷികളുമായി സെഷൻ ബുക്ക് ചെയ്ത് വ്യക്തിഗത മാർഗ്ഗനിർദ്ദേശം നേടുക.",
      bookConsultation: "കൺസൾട്ടേഷൻ ബുക്ക് ചെയ്യുക",
      tryFreeKundli: "ആദ്യം സൗജന്യ കുണ്ഡലി പരീക്ഷിക്കുക",
      
      // Specializations
      astrology: "ജ്യോതിഷം",
      vastuShastra: "വാസ്തു ശാസ്ത്രം",
      pooja: "പൂജ",
      gemstones: "രത്നങ്ങൾ",
      remedies: "പരിഹാരങ്ങൾ",
      muhurta: "മുഹൂർത്തം",
      homeRemedies: "വീട്ടു പരിഹാരങ്ങൾ",
      kundliAnalysis: "കുണ്ഡലി വിശകലനം",
      grihaPravesh: "ഗൃഹ പ്രവേശം",
      marriageMatching: "വിവാഹ പൊരുത്തം",
      remedialMeasures: "പരിഹാര നടപടികൾ"
    }
  },
  pa: {
    about: {
      // Astrologer Experience
      exp35: "35+ ਸਾਲ",
      exp20: "20+ ਸਾਲ",
      exp16: "16+ ਸਾਲ",
      exp15: "15+ ਸਾਲ",
      exp12: "12+ ਸਾਲ",
      exp10: "10+ ਸਾਲ",
      
      // Astrologer Locations
      locationBengaluru: "ਬੈਂਗਲੁਰੂ",
      locationJaipur: "ਜੈਪੁਰ",
      locationKolkata: "ਕੋਲਕਾਤਾ (ਪੱਛਮੀ ਬੰਗਾਲ)",
      locationMumbai: "ਮੁੰਬਈ",
      locationNewDelhi: "ਨਵੀਂ ਦਿੱਲੀ",
      locationBareilly: "ਬਰੇਲੀ (ਉੱਤਰ ਪ੍ਰਦੇਸ਼)",
      
      // Astrologer Specializations
      specAstroVastuPoojaGems: "ਜੋਤਿਸ਼, ਵਾਸਤੂ, ਪੂਜਾ ਅਤੇ ਰਤਨ",
      specAstroPoojaGems: "ਜੋਤਿਸ਼, ਪੂਜਾ ਅਤੇ ਰਤਨ",
      specAstroVastuPooja: "ਜੋਤਿਸ਼, ਵਾਸਤੂ ਅਤੇ ਪੂਜਾ",
      specVastuPooja: "ਵਾਸਤੂ ਅਤੇ ਪੂਜਾ",
      
      // Astrologer Bios
      bioShridhar: "ਜੋਤਿਸ਼, ਵਾਸਤੂ, ਪੂਜਾ ਅਤੇ ਰਤਨ ਸਲਾਹ ਵਿੱਚ 35 ਸਾਲਾਂ ਦੇ ਤਜਰਬੇ ਵਾਲੇ ਪ੍ਰਸਿੱਧ ਵੈਦਿਕ ਜੋਤਿਸ਼ੀ। ਬੈਂਗਲੁਰੂ ਵਿੱਚ ਸਥਿਤ, ਆਚਾਰੀਆ ਸ਼੍ਰੀਧਰ ਨੇ ਪ੍ਰਮਾਣਿਕ ਜੋਤਿਸ਼ ਨੂੰ ਆਧੁਨਿਕ ਦੁਨੀਆ ਲਈ ਪਹੁੰਚਯੋਗ ਬਣਾਉਣ ਲਈ ਆਪਣੀ ਜ਼ਿੰਦਗੀ ਸਮਰਪਿਤ ਕੀਤੀ ਹੈ।",
      bioMadhav: "ਜੋਤਿਸ਼, ਪੂਜਾ ਅਤੇ ਰਤਨ ਸਲਾਹ ਵਿੱਚ 20 ਸਾਲਾਂ ਦੇ ਤਜਰਬੇ ਨਾਲ, ਮਾਧਵ ਸ਼ਰਮਾ ਜੈਪੁਰ ਤੋਂ ਰਵਾਇਤੀ ਜੋਤਿਸ਼ ਅਭਿਆਸ ਵਿੱਚ ਡੂੰਘੀ ਮੁਹਾਰਤ ਲਿਆਉਂਦੇ ਹਨ।",
      bioRajKumar: "16 ਸਾਲਾਂ ਦੇ ਤਜਰਬੇ ਨਾਲ ਜੋਤਿਸ਼, ਵਾਸਤੂ ਅਤੇ ਪੂਜਾ ਵਿੱਚ ਮਾਹਿਰ, ਰਾਜ ਕੁਮਾਰ ਸ਼ਾਸਤਰੀ ਨੇ ਕੋਲਕਾਤਾ ਤੋਂ ਹਜ਼ਾਰਾਂ ਲੋਕਾਂ ਨੂੰ ਚੁਣੌਤੀਪੂਰਨ ਗ੍ਰਹਿ ਸਮੇਂ ਨੂੰ ਪਾਰ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕੀਤੀ ਹੈ।",
      bioBanwari: "15 ਸਾਲਾਂ ਦੇ ਤਜਰਬੇ ਨਾਲ ਵਾਸਤੂ ਸ਼ਾਸਤਰ ਅਤੇ ਪੂਜਾ ਰੀਤੀ-ਰਿਵਾਜਾਂ ਵਿੱਚ ਮਾਹਿਰ, ਬਨਵਾਰੀ ਦਾਦੀਚ ਬੈਂਗਲੁਰੂ ਤੋਂ ਘਰ ਅਤੇ ਦਫ਼ਤਰ ਵਾਸਤੂ ਬਾਰੇ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ।",
      bioNemichand: "ਵਾਸਤੂ ਅਤੇ ਪੂਜਾ ਵਿੱਚ 12 ਸਾਲਾਂ ਦੇ ਤਜਰਬੇ ਨਾਲ, ਨੇਮੀਚੰਦ ਸ਼ਾਸਤਰੀ ਬੈਂਗਲੁਰੂ ਤੋਂ ਸੁਮੇਲ ਵਾਲੀਆਂ ਰਹਿਣ ਵਾਲੀਆਂ ਥਾਵਾਂ ਲਈ ਮਾਹਿਰ ਸਲਾਹ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ।",
      bioVinod: "ਵਿਨੋਦ ਸ਼ਾਸਤਰੀ ਵਾਸਤੂ ਅਤੇ ਪੂਜਾ ਸੇਵਾਵਾਂ ਵਿੱਚ 10 ਸਾਲਾਂ ਦੀ ਮੁਹਾਰਤ ਲਿਆਉਂਦੇ ਹਨ, ਮੁੰਬਈ ਵਿੱਚ ਗਾਹਕਾਂ ਨੂੰ ਉਨ੍ਹਾਂ ਦੇ ਘਰਾਂ ਅਤੇ ਕੰਮ ਦੀਆਂ ਥਾਵਾਂ ਵਿੱਚ ਸਕਾਰਾਤਮਕ ਊਰਜਾ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹਨ।",
      bioBajarangbali: "ਨਵੀਂ ਦਿੱਲੀ ਵਿੱਚ ਸਥਿਤ, ਬਜਰੰਗਬਲੀ ਦੁਬੇ ਨੂੰ ਵਾਸਤੂ ਸ਼ਾਸਤਰ ਅਤੇ ਪੂਜਾ ਰੀਤੀ-ਰਿਵਾਜਾਂ ਵਿੱਚ 12 ਸਾਲਾਂ ਦਾ ਤਜਰਬਾ ਹੈ, ਵੱਖ-ਵੱਖ ਜੀਵਨ ਚੁਣੌਤੀਆਂ ਲਈ ਉਪਾਅ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ।",
      bioPankaj: "ਬਰੇਲੀ ਦੇ ਪੰਕਜ ਸ਼ਾਸਤਰੀ ਨੂੰ ਵਾਸਤੂ ਅਤੇ ਪੂਜਾ ਵਿੱਚ 12 ਸਾਲਾਂ ਦਾ ਤਜਰਬਾ ਹੈ, ਖੁਸ਼ਹਾਲ ਜੀਵਨ ਲਈ ਰਵਾਇਤੀ ਉਪਾਅ ਅਤੇ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਨ।",
      
      // Roles
      founderRole: "ਸੰਸਥਾਪਕ ਅਤੇ ਮੁੱਖ ਜੋਤਿਸ਼ੀ",
      seniorRole: "ਸੀਨੀਅਰ ਜੋਤਿਸ਼ੀ",
      remediesRole: "ਉਪਾਅ ਮਾਹਿਰ",
    },
    astrologers: {
      badge: "ਸਾਡੇ ਮਾਹਿਰ",
      title: "ਸਾਡੇ ਪ੍ਰਮਾਣਿਤ ਜੋਤਿਸ਼ੀਆਂ ਨੂੰ ਮਿਲੋ",
      subtitle: "ਸਾਡੀ ਮਾਹਿਰ ਵੈਦਿਕ ਜੋਤਿਸ਼ੀਆਂ ਦੀ ਟੀਮ ਜੋਤਿਸ਼ ਸ਼ਾਸਤਰ ਵਿੱਚ ਦਹਾਕਿਆਂ ਦਾ ਤਜਰਬਾ ਲਿਆਉਂਦੀ ਹੈ। ਹਰ ਜੋਤਿਸ਼ੀ ਪ੍ਰਮਾਣਿਤ ਹੈ ਅਤੇ ਸਹੀ ਭਵਿੱਖਬਾਣੀਆਂ ਲਈ ਰਵਾਇਤੀ ਤਰੀਕਿਆਂ ਦੀ ਪਾਲਣਾ ਕਰਦਾ ਹੈ।",
      
      // Stats
      expertAstrologers: "ਮਾਹਿਰ ਜੋਤਿਸ਼ੀ",
      consultationsDone: "ਸਲਾਹ-ਮਸ਼ਵਰੇ ਪੂਰੇ",
      averageRating: "ਔਸਤ ਰੇਟਿੰਗ",
      yearsAvgExperience: "ਸਾਲ ਔਸਤ ਤਜਰਬਾ",
      
      // Card Labels
      available: "ਉਪਲਬਧ",
      busy: "ਵਿਅਸਤ",
      experience: "ਤਜਰਬਾ",
      consultations: "ਸਲਾਹ-ਮਸ਼ਵਰੇ",
      perSession: "/ਸੈਸ਼ਨ",
      
      // Buttons
      call: "ਕਾਲ",
      videoCall: "ਵੀਡੀਓ ਕਾਲ",
      chat: "ਚੈਟ",
      bookViaWhatsApp: "ਵਟਸਐਪ ਰਾਹੀਂ ਬੁੱਕ ਕਰੋ",
      
      // Why Choose Section
      whyChooseTitle: "ਸਾਡੇ ਜੋਤਿਸ਼ੀਆਂ ਨੂੰ ਕਿਉਂ ਚੁਣੋ?",
      verifiedExperts: "ਪ੍ਰਮਾਣਿਤ ਮਾਹਿਰ",
      verifiedExpertsDesc: "ਸਾਰੇ ਜੋਤਿਸ਼ੀ ਸਾਡੇ ਪਲੇਟਫਾਰਮ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਸਖ਼ਤ ਤਸਦੀਕ ਅਤੇ ਟੈਸਟਿੰਗ ਤੋਂ ਲੰਘਦੇ ਹਨ।",
      traditionalTraining: "ਰਵਾਇਤੀ ਸਿਖਲਾਈ",
      traditionalTrainingDesc: "ਕਲਾਸੀਕਲ ਵੈਦਿਕ ਗ੍ਰੰਥਾਂ ਅਤੇ ਰਵਾਇਤੀ ਗੁਰੂਕੁਲ ਪ੍ਰਣਾਲੀਆਂ ਵਿੱਚ ਸਿਖਲਾਈ ਪ੍ਰਾਪਤ।",
      provenTrackRecord: "ਸਾਬਤ ਟਰੈਕ ਰਿਕਾਰਡ",
      provenTrackRecordDesc: "ਲਗਾਤਾਰ ਉੱਚ ਰੇਟਿੰਗਾਂ ਨਾਲ ਹਜ਼ਾਰਾਂ ਸੰਤੁਸ਼ਟ ਗਾਹਕ।",
      multipleLanguages: "ਕਈ ਭਾਸ਼ਾਵਾਂ",
      multipleLanguagesDesc: "ਹਿੰਦੀ, ਅੰਗਰੇਜ਼ੀ ਅਤੇ ਖੇਤਰੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਸਲਾਹ-ਮਸ਼ਵਰੇ ਉਪਲਬਧ ਹਨ।",
      
      // CTA Section
      readyForConsultation: "ਆਪਣੀ ਸਲਾਹ ਲਈ ਤਿਆਰ ਹੋ?",
      bookSessionDesc: "ਸਾਡੇ ਮਾਹਿਰ ਜੋਤਿਸ਼ੀਆਂ ਨਾਲ ਸੈਸ਼ਨ ਬੁੱਕ ਕਰੋ ਅਤੇ ਵਿਅਕਤੀਗਤ ਮਾਰਗਦਰਸ਼ਨ ਪ੍ਰਾਪਤ ਕਰੋ।",
      bookConsultation: "ਸਲਾਹ ਬੁੱਕ ਕਰੋ",
      tryFreeKundli: "ਪਹਿਲਾਂ ਮੁਫ਼ਤ ਕੁੰਡਲੀ ਅਜ਼ਮਾਓ",
      
      // Specializations
      astrology: "ਜੋਤਿਸ਼",
      vastuShastra: "ਵਾਸਤੂ ਸ਼ਾਸਤਰ",
      pooja: "ਪੂਜਾ",
      gemstones: "ਰਤਨ",
      remedies: "ਉਪਾਅ",
      muhurta: "ਮੁਹੂਰਤ",
      homeRemedies: "ਘਰੇਲੂ ਉਪਾਅ",
      kundliAnalysis: "ਕੁੰਡਲੀ ਵਿਸ਼ਲੇਸ਼ਣ",
      grihaPravesh: "ਗ੍ਰਹਿ ਪ੍ਰਵੇਸ਼",
      marriageMatching: "ਵਿਆਹ ਮਿਲਾਨ",
      remedialMeasures: "ਉਪਚਾਰਕ ਉਪਾਅ"
    }
  }
};

// Helper function to merge astrologers translations with main translations
export function deepMergeAstrologers(target: TranslationObject, source: TranslationObject): TranslationObject {
  const result = { ...target };
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      result[key] = deepMergeAstrologers((result[key] as TranslationObject) || {}, source[key] as TranslationObject);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
