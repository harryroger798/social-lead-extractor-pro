// Index Pages Translations for VedicStarAstro
// Translations for /doshas, /horoscope, /transits index pages and /horoscope/yearly/[sign]

import { Language } from "./translations";

type TranslationObject = Record<string, unknown>;

export const indexPagesTranslations: Record<Language, TranslationObject> = {
  en: {
    doshas: {
      index: {
        badge: "Vedic Astrology",
        title: "Doshas in Vedic Astrology",
        subtitle: "Learn about various doshas in your birth chart, their effects on life, and effective remedies to mitigate their negative influences.",
        whatAreDoshas: "What are Doshas?",
        description: "In Vedic astrology, doshas are unfavorable planetary combinations or placements in a birth chart that can create challenges in specific areas of life. Understanding your doshas helps you take appropriate remedial measures and make informed decisions about marriage, career, and other important life events.",
        mangalDosh: {
          title: "Mangal Dosh",
          badge: "Mars Dosha",
          description: "Mangal Dosh occurs when Mars is placed in certain houses of the birth chart. It can affect marriage and relationships, but proper remedies can minimize its effects."
        },
        kaalSarpDosh: {
          title: "Kaal Sarp Dosh",
          badge: "Serpent Dosha",
          description: "Kaal Sarp Dosh forms when all planets are hemmed between Rahu and Ketu. It can create obstacles in life, but understanding it helps in finding solutions."
        },
        sadeSati: {
          title: "Sade Sati",
          badge: "Saturn Transit",
          description: "Sade Sati is a 7.5-year period when Saturn transits through the 12th, 1st, and 2nd houses from your Moon sign. It brings challenges but also growth and maturity."
        },
        pitraDosh: {
          title: "Pitra Dosh",
          badge: "Ancestral Karma",
          description: "Pitra Dosh indicates ancestral karma affecting your life. It requires specific remedies and rituals to honor ancestors and remove obstacles."
        },
        learnMore: "Learn More",
        checkYourChart: "Check Your Birth Chart for Doshas",
        checkDescription: "Generate your free Kundli to identify any doshas in your birth chart and get personalized remedies.",
        generateKundli: "Generate Free Kundli",
        checkMangalDosh: "Check Mangal Dosh",
        checkSadeSati: "Check Sade Sati"
      }
    },
    horoscope: {
      index: {
        badge: "Vedic Astrology",
        title: "Horoscope Predictions",
        subtitle: "Get accurate horoscope predictions based on Vedic astrology. Choose from daily, weekly, monthly, or yearly horoscopes for all 12 zodiac signs.",
        types: {
          daily: {
            title: "Daily Horoscope",
            description: "Get your daily predictions based on planetary transits and your zodiac sign."
          },
          weekly: {
            title: "Weekly Horoscope",
            description: "Plan your week ahead with detailed weekly astrological predictions."
          },
          monthly: {
            title: "Monthly Horoscope",
            description: "Comprehensive monthly predictions for all aspects of life."
          },
          yearly: {
            title: "Yearly Horoscope",
            description: "Complete year ahead predictions with detailed insights and guidance."
          }
        },
        viewHoroscope: "View Horoscope",
        aboutTitle: "About Vedic Horoscopes",
        aboutDescription: "Our horoscope predictions are based on Vedic astrology, an ancient Indian system that uses the sidereal zodiac. Unlike Western astrology, Vedic astrology accounts for the precession of equinoxes, providing more accurate planetary positions. Our predictions consider the Moon sign (Rashi), planetary transits, and dasha periods for comprehensive insights.",
        selectSign: "Select Your Zodiac Sign",
        personalizedTitle: "Get Personalized Predictions",
        personalizedDescription: "For more accurate predictions based on your exact birth details, generate your free Kundli or consult with our expert astrologers.",
        generateKundli: "Generate Free Kundli",
        consultAstrologer: "Consult an Astrologer"
      },
      signs: {
        aries: "Aries",
        taurus: "Taurus",
        gemini: "Gemini",
        cancer: "Cancer",
        leo: "Leo",
        virgo: "Virgo",
        libra: "Libra",
        scorpio: "Scorpio",
        sagittarius: "Sagittarius",
        capricorn: "Capricorn",
        aquarius: "Aquarius",
        pisces: "Pisces"
      },
      yearly: {
        notFound: "Zodiac Sign Not Found",
        notFoundDesc: "The zodiac sign you are looking for does not exist.",
        backToHoroscope: "Back to Horoscope",
        badge: "{year} Horoscope",
        title: {
          aries: "Aries Horoscope {year}",
          taurus: "Taurus Horoscope {year}",
          gemini: "Gemini Horoscope {year}",
          cancer: "Cancer Horoscope {year}",
          leo: "Leo Horoscope {year}",
          virgo: "Virgo Horoscope {year}",
          libra: "Libra Horoscope {year}",
          scorpio: "Scorpio Horoscope {year}",
          sagittarius: "Sagittarius Horoscope {year}",
          capricorn: "Capricorn Horoscope {year}",
          aquarius: "Aquarius Horoscope {year}",
          pisces: "Pisces Horoscope {year}"
        },
        hindi: {
          aries: "मेष",
          taurus: "वृषभ",
          gemini: "मिथुन",
          cancer: "कर्क",
          leo: "सिंह",
          virgo: "कन्या",
          libra: "तुला",
          scorpio: "वृश्चिक",
          sagittarius: "धनु",
          capricorn: "मकर",
          aquarius: "कुंभ",
          pisces: "मीन"
        },
        element: "Element",
        ruler: "Ruler",
        ratings: "{year} Ratings",
        labels: {
          overall: "Overall",
          love: "Love",
          career: "Career",
          finance: "Finance",
          health: "Health"
        },
        sections: {
          overview: { title: "Overview {year}" },
          love: { title: "Love {year}" },
          career: { title: "Career {year}" },
          finance: { title: "Finance {year}" },
          health: { title: "Health {year}" },
          family: { title: "Family {year}" },
          education: { title: "Education {year}" },
          property: { title: "Property {year}" }
        },
        default: {
          overview: "Your overview predictions for {year} will be influenced by planetary transits. Check back for detailed predictions.",
          love: "Your love predictions for {year} will be influenced by planetary transits. Check back for detailed predictions.",
          career: "Your career predictions for {year} will be influenced by planetary transits. Check back for detailed predictions.",
          finance: "Your finance predictions for {year} will be influenced by planetary transits. Check back for detailed predictions.",
          health: "Your health predictions for {year} will be influenced by planetary transits. Check back for detailed predictions.",
          family: "Your family predictions for {year} will be influenced by planetary transits. Check back for detailed predictions.",
          education: "Your education predictions for {year} will be influenced by planetary transits. Check back for detailed predictions.",
          property: "Your property predictions for {year} will be influenced by planetary transits. Check back for detailed predictions.",
          monthSummary: "Planetary influences will shape this month. Focus on balance and growth."
        },
        monthlyOverview: "Month-by-Month Overview {year}",
        luckyFactors: "Lucky Factors for {year}",
        lucky: {
          numbers: "Lucky Numbers",
          colors: "Lucky Colors",
          days: "Lucky Days",
          gemstone: "Lucky Gemstone"
        },
        personalizedTitle: "Get Personalized Predictions",
        personalizedDescription: "For more accurate predictions based on your exact birth details, generate your free Kundli or consult with our expert astrologers.",
        generateKundli: "Generate Free Kundli",
        consultAstrologer: "Consult an Astrologer",
        viewAllSigns: "View All Signs"
      },
      elements: {
        fire: "Fire",
        earth: "Earth",
        air: "Air",
        water: "Water"
      },
      planets: {
        mars: "Mars",
        venus: "Venus",
        mercury: "Mercury",
        moon: "Moon",
        sun: "Sun",
        jupiter: "Jupiter",
        saturn: "Saturn"
      },
      months: {
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December"
      }
    },
    transits: {
      index: {
        badge: "Vedic Astrology",
        title: "Planetary Transits {year}",
        subtitle: "Explore how major planetary transits in {year} will affect your zodiac sign. Get detailed predictions for Jupiter, Saturn, and Mercury movements.",
        whatAreTransits: "What are Planetary Transits?",
        description: "In Vedic astrology, planetary transits (Gochar) refer to the movement of planets through different zodiac signs. These transits significantly influence various aspects of life including career, relationships, health, and finances. Understanding transits helps you prepare for upcoming changes and make the most of favorable periods.",
        jupiter: {
          title: "Jupiter Transit {year}",
          description: "Jupiter, the planet of wisdom and expansion, brings growth and opportunities wherever it transits.",
          summary: "Discover how Jupiter's movement through zodiac signs will bring blessings and expansion in {year}."
        },
        saturn: {
          title: "Saturn Transit {year}",
          description: "Saturn, the planet of karma and discipline, teaches important life lessons during its transit.",
          summary: "Learn about Saturn's transit effects and how to navigate challenges with wisdom in {year}."
        },
        mercury: {
          title: "Mercury Transit {year}",
          description: "Mercury retrograde periods affect communication, technology, and travel. Stay prepared.",
          summary: "Track Mercury retrograde dates and their impact on your daily life in {year}."
        },
        viewDetails: "View Details",
        eclipses: {
          title: "Eclipses {year}",
          description: "Solar and lunar eclipse dates, timings, and their astrological significance."
        },
        viewEclipses: "View Eclipse Calendar",
        festivals: {
          title: "Festival Calendar {year}",
          description: "Important Hindu festivals, muhurtas, and auspicious dates based on Panchang."
        },
        viewFestivals: "View Festival Calendar",
        personalizedTitle: "Get Personalized Transit Analysis",
        personalizedDescription: "For accurate transit predictions based on your exact birth chart, generate your free Kundli or use our transit calculator.",
        generateKundli: "Generate Free Kundli",
        transitCalculator: "Transit Calculator",
        planetaryTracker: "Live Planetary Positions"
      }
    }
  },
  hi: {
    doshas: {
      index: {
        badge: "वैदिक ज्योतिष",
        title: "वैदिक ज्योतिष में दोष",
        subtitle: "अपनी जन्म कुंडली में विभिन्न दोषों, जीवन पर उनके प्रभाव और उनके नकारात्मक प्रभावों को कम करने के प्रभावी उपायों के बारे में जानें।",
        whatAreDoshas: "दोष क्या हैं?",
        description: "वैदिक ज्योतिष में, दोष जन्म कुंडली में प्रतिकूल ग्रह संयोजन या स्थिति हैं जो जीवन के विशिष्ट क्षेत्रों में चुनौतियां पैदा कर सकते हैं। अपने दोषों को समझने से आपको उचित उपचारात्मक उपाय करने और विवाह, करियर और अन्य महत्वपूर्ण जीवन घटनाओं के बारे में सूचित निर्णय लेने में मदद मिलती है।",
        mangalDosh: {
          title: "मंगल दोष",
          badge: "मंगल दोष",
          description: "मंगल दोष तब होता है जब मंगल जन्म कुंडली के कुछ घरों में स्थित होता है। यह विवाह और रिश्तों को प्रभावित कर सकता है, लेकिन उचित उपाय इसके प्रभावों को कम कर सकते हैं।"
        },
        kaalSarpDosh: {
          title: "काल सर्प दोष",
          badge: "सर्प दोष",
          description: "काल सर्प दोष तब बनता है जब सभी ग्रह राहु और केतु के बीच फंस जाते हैं। यह जीवन में बाधाएं पैदा कर सकता है, लेकिन इसे समझने से समाधान खोजने में मदद मिलती है।"
        },
        sadeSati: {
          title: "साढ़े साती",
          badge: "शनि गोचर",
          description: "साढ़े साती 7.5 साल की अवधि है जब शनि आपके चंद्र राशि से 12वें, 1ले और 2रे घर से गुजरता है। यह चुनौतियां लाता है लेकिन विकास और परिपक्वता भी।"
        },
        pitraDosh: {
          title: "पितृ दोष",
          badge: "पूर्वजों का कर्म",
          description: "पितृ दोष आपके जीवन को प्रभावित करने वाले पूर्वजों के कर्म को इंगित करता है। इसके लिए पूर्वजों का सम्मान करने और बाधाओं को दूर करने के लिए विशिष्ट उपाय और अनुष्ठान की आवश्यकता होती है।"
        },
        learnMore: "और जानें",
        checkYourChart: "दोषों के लिए अपनी जन्म कुंडली जांचें",
        checkDescription: "अपनी जन्म कुंडली में किसी भी दोष की पहचान करने और व्यक्तिगत उपाय प्राप्त करने के लिए अपनी मुफ्त कुंडली बनाएं।",
        generateKundli: "मुफ्त कुंडली बनाएं",
        checkMangalDosh: "मंगल दोष जांचें",
        checkSadeSati: "साढ़े साती जांचें"
      }
    },
    horoscope: {
      index: {
        badge: "वैदिक ज्योतिष",
        title: "राशिफल भविष्यवाणियां",
        subtitle: "वैदिक ज्योतिष के आधार पर सटीक राशिफल भविष्यवाणियां प्राप्त करें। सभी 12 राशियों के लिए दैनिक, साप्ताहिक, मासिक या वार्षिक राशिफल में से चुनें।",
        types: {
          daily: {
            title: "दैनिक राशिफल",
            description: "ग्रह गोचर और आपकी राशि के आधार पर अपनी दैनिक भविष्यवाणियां प्राप्त करें।"
          },
          weekly: {
            title: "साप्ताहिक राशिफल",
            description: "विस्तृत साप्ताहिक ज्योतिषीय भविष्यवाणियों के साथ अपने सप्ताह की योजना बनाएं।"
          },
          monthly: {
            title: "मासिक राशिफल",
            description: "जीवन के सभी पहलुओं के लिए व्यापक मासिक भविष्यवाणियां।"
          },
          yearly: {
            title: "वार्षिक राशिफल",
            description: "विस्तृत अंतर्दृष्टि और मार्गदर्शन के साथ पूर्ण वर्ष की भविष्यवाणियां।"
          }
        },
        viewHoroscope: "राशिफल देखें",
        aboutTitle: "वैदिक राशिफल के बारे में",
        aboutDescription: "हमारी राशिफल भविष्यवाणियां वैदिक ज्योतिष पर आधारित हैं, एक प्राचीन भारतीय प्रणाली जो नाक्षत्रिक राशि चक्र का उपयोग करती है। पश्चिमी ज्योतिष के विपरीत, वैदिक ज्योतिष विषुवों के अग्रगमन के लिए जिम्मेदार है, अधिक सटीक ग्रह स्थिति प्रदान करता है। हमारी भविष्यवाणियां व्यापक अंतर्दृष्टि के लिए चंद्र राशि (राशि), ग्रह गोचर और दशा अवधि पर विचार करती हैं।",
        selectSign: "अपनी राशि चुनें",
        personalizedTitle: "व्यक्तिगत भविष्यवाणियां प्राप्त करें",
        personalizedDescription: "अपने सटीक जन्म विवरण के आधार पर अधिक सटीक भविष्यवाणियों के लिए, अपनी मुफ्त कुंडली बनाएं या हमारे विशेषज्ञ ज्योतिषियों से परामर्श करें।",
        generateKundli: "मुफ्त कुंडली बनाएं",
        consultAstrologer: "ज्योतिषी से परामर्श करें"
      },
      signs: {
        aries: "मेष",
        taurus: "वृषभ",
        gemini: "मिथुन",
        cancer: "कर्क",
        leo: "सिंह",
        virgo: "कन्या",
        libra: "तुला",
        scorpio: "वृश्चिक",
        sagittarius: "धनु",
        capricorn: "मकर",
        aquarius: "कुंभ",
        pisces: "मीन"
      },
      yearly: {
        notFound: "राशि नहीं मिली",
        notFoundDesc: "आप जिस राशि की तलाश कर रहे हैं वह मौजूद नहीं है।",
        backToHoroscope: "राशिफल पर वापस जाएं",
        badge: "{year} राशिफल",
        title: {
          aries: "मेष राशिफल {year}",
          taurus: "वृषभ राशिफल {year}",
          gemini: "मिथुन राशिफल {year}",
          cancer: "कर्क राशिफल {year}",
          leo: "सिंह राशिफल {year}",
          virgo: "कन्या राशिफल {year}",
          libra: "तुला राशिफल {year}",
          scorpio: "वृश्चिक राशिफल {year}",
          sagittarius: "धनु राशिफल {year}",
          capricorn: "मकर राशिफल {year}",
          aquarius: "कुंभ राशिफल {year}",
          pisces: "मीन राशिफल {year}"
        },
        hindi: {
          aries: "मेष",
          taurus: "वृषभ",
          gemini: "मिथुन",
          cancer: "कर्क",
          leo: "सिंह",
          virgo: "कन्या",
          libra: "तुला",
          scorpio: "वृश्चिक",
          sagittarius: "धनु",
          capricorn: "मकर",
          aquarius: "कुंभ",
          pisces: "मीन"
        },
        element: "तत्व",
        ruler: "स्वामी",
        ratings: "{year} रेटिंग",
        labels: {
          overall: "समग्र",
          love: "प्रेम",
          career: "करियर",
          finance: "वित्त",
          health: "स्वास्थ्य"
        },
        sections: {
          overview: { title: "अवलोकन {year}" },
          love: { title: "प्रेम {year}" },
          career: { title: "करियर {year}" },
          finance: { title: "वित्त {year}" },
          health: { title: "स्वास्थ्य {year}" },
          family: { title: "परिवार {year}" },
          education: { title: "शिक्षा {year}" },
          property: { title: "संपत्ति {year}" }
        },
        default: {
          overview: "{year} के लिए आपकी अवलोकन भविष्यवाणियां ग्रह गोचर से प्रभावित होंगी। विस्तृत भविष्यवाणियों के लिए वापस जांचें।",
          love: "{year} के लिए आपकी प्रेम भविष्यवाणियां ग्रह गोचर से प्रभावित होंगी। विस्तृत भविष्यवाणियों के लिए वापस जांचें।",
          career: "{year} के लिए आपकी करियर भविष्यवाणियां ग्रह गोचर से प्रभावित होंगी। विस्तृत भविष्यवाणियों के लिए वापस जांचें।",
          finance: "{year} के लिए आपकी वित्त भविष्यवाणियां ग्रह गोचर से प्रभावित होंगी। विस्तृत भविष्यवाणियों के लिए वापस जांचें।",
          health: "{year} के लिए आपकी स्वास्थ्य भविष्यवाणियां ग्रह गोचर से प्रभावित होंगी। विस्तृत भविष्यवाणियों के लिए वापस जांचें।",
          family: "{year} के लिए आपकी परिवार भविष्यवाणियां ग्रह गोचर से प्रभावित होंगी। विस्तृत भविष्यवाणियों के लिए वापस जांचें।",
          education: "{year} के लिए आपकी शिक्षा भविष्यवाणियां ग्रह गोचर से प्रभावित होंगी। विस्तृत भविष्यवाणियों के लिए वापस जांचें।",
          property: "{year} के लिए आपकी संपत्ति भविष्यवाणियां ग्रह गोचर से प्रभावित होंगी। विस्तृत भविष्यवाणियों के लिए वापस जांचें।",
          monthSummary: "ग्रह प्रभाव इस महीने को आकार देंगे। संतुलन और विकास पर ध्यान दें।"
        },
        monthlyOverview: "महीने-दर-महीने अवलोकन {year}",
        luckyFactors: "{year} के लिए भाग्यशाली कारक",
        lucky: {
          numbers: "भाग्यशाली संख्याएं",
          colors: "भाग्यशाली रंग",
          days: "भाग्यशाली दिन",
          gemstone: "भाग्यशाली रत्न"
        },
        personalizedTitle: "व्यक्तिगत भविष्यवाणियां प्राप्त करें",
        personalizedDescription: "अपने सटीक जन्म विवरण के आधार पर अधिक सटीक भविष्यवाणियों के लिए, अपनी मुफ्त कुंडली बनाएं या हमारे विशेषज्ञ ज्योतिषियों से परामर्श करें।",
        generateKundli: "मुफ्त कुंडली बनाएं",
        consultAstrologer: "ज्योतिषी से परामर्श करें",
        viewAllSigns: "सभी राशियां देखें"
      },
      elements: {
        fire: "अग्नि",
        earth: "पृथ्वी",
        air: "वायु",
        water: "जल"
      },
      planets: {
        mars: "मंगल",
        venus: "शुक्र",
        mercury: "बुध",
        moon: "चंद्र",
        sun: "सूर्य",
        jupiter: "गुरु",
        saturn: "शनि"
      },
      months: {
        january: "जनवरी",
        february: "फरवरी",
        march: "मार्च",
        april: "अप्रैल",
        may: "मई",
        june: "जून",
        july: "जुलाई",
        august: "अगस्त",
        september: "सितंबर",
        october: "अक्टूबर",
        november: "नवंबर",
        december: "दिसंबर"
      }
    },
    transits: {
      index: {
        badge: "वैदिक ज्योतिष",
        title: "ग्रह गोचर {year}",
        subtitle: "{year} में प्रमुख ग्रह गोचर आपकी राशि को कैसे प्रभावित करेंगे, इसका पता लगाएं। बृहस्पति, शनि और बुध की गतिविधियों के लिए विस्तृत भविष्यवाणियां प्राप्त करें।",
        whatAreTransits: "ग्रह गोचर क्या हैं?",
        description: "वैदिक ज्योतिष में, ग्रह गोचर (गोचर) विभिन्न राशियों के माध्यम से ग्रहों की गति को संदर्भित करता है। ये गोचर करियर, रिश्तों, स्वास्थ्य और वित्त सहित जीवन के विभिन्न पहलुओं को महत्वपूर्ण रूप से प्रभावित करते हैं। गोचर को समझने से आपको आने वाले परिवर्तनों के लिए तैयार होने और अनुकूल अवधि का अधिकतम लाभ उठाने में मदद मिलती है।",
        jupiter: {
          title: "बृहस्पति गोचर {year}",
          description: "बृहस्पति, ज्ञान और विस्तार का ग्रह, जहां भी गोचर करता है वहां विकास और अवसर लाता है।",
          summary: "जानें कि {year} में राशियों के माध्यम से बृहस्पति की गति कैसे आशीर्वाद और विस्तार लाएगी।"
        },
        saturn: {
          title: "शनि गोचर {year}",
          description: "शनि, कर्म और अनुशासन का ग्रह, अपने गोचर के दौरान महत्वपूर्ण जीवन पाठ सिखाता है।",
          summary: "{year} में शनि गोचर प्रभावों के बारे में जानें और ज्ञान के साथ चुनौतियों का सामना कैसे करें।"
        },
        mercury: {
          title: "बुध गोचर {year}",
          description: "बुध वक्री अवधि संचार, प्रौद्योगिकी और यात्रा को प्रभावित करती है। तैयार रहें।",
          summary: "{year} में बुध वक्री तिथियों और आपके दैनिक जीवन पर उनके प्रभाव को ट्रैक करें।"
        },
        viewDetails: "विवरण देखें",
        eclipses: {
          title: "ग्रहण {year}",
          description: "सूर्य और चंद्र ग्रहण की तारीखें, समय और उनका ज्योतिषीय महत्व।"
        },
        viewEclipses: "ग्रहण कैलेंडर देखें",
        festivals: {
          title: "त्योहार कैलेंडर {year}",
          description: "पंचांग के आधार पर महत्वपूर्ण हिंदू त्योहार, मुहूर्त और शुभ तिथियां।"
        },
        viewFestivals: "त्योहार कैलेंडर देखें",
        personalizedTitle: "व्यक्तिगत गोचर विश्लेषण प्राप्त करें",
        personalizedDescription: "अपनी सटीक जन्म कुंडली के आधार पर सटीक गोचर भविष्यवाणियों के लिए, अपनी मुफ्त कुंडली बनाएं या हमारे गोचर कैलकुलेटर का उपयोग करें।",
        generateKundli: "मुफ्त कुंडली बनाएं",
        transitCalculator: "गोचर कैलकुलेटर",
        planetaryTracker: "लाइव ग्रह स्थिति"
      }
    }
  },
  // Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi translations
  // Using English as fallback for now - can be replaced with native translations later
  ta: {
    doshas: { index: {} },
    horoscope: { index: {}, signs: {}, yearly: {}, elements: {}, planets: {}, months: {} },
    transits: { index: {} }
  },
  te: {
    doshas: { index: {} },
    horoscope: { index: {}, signs: {}, yearly: {}, elements: {}, planets: {}, months: {} },
    transits: { index: {} }
  },
  bn: {
    doshas: { index: {} },
    horoscope: { index: {}, signs: {}, yearly: {}, elements: {}, planets: {}, months: {} },
    transits: { index: {} }
  },
  mr: {
    doshas: { index: {} },
    horoscope: { index: {}, signs: {}, yearly: {}, elements: {}, planets: {}, months: {} },
    transits: { index: {} }
  },
  gu: {
    doshas: { index: {} },
    horoscope: { index: {}, signs: {}, yearly: {}, elements: {}, planets: {}, months: {} },
    transits: { index: {} }
  },
  kn: {
    doshas: { index: {} },
    horoscope: { index: {}, signs: {}, yearly: {}, elements: {}, planets: {}, months: {} },
    transits: { index: {} }
  },
  ml: {
    doshas: { index: {} },
    horoscope: { index: {}, signs: {}, yearly: {}, elements: {}, planets: {}, months: {} },
    transits: { index: {} }
  },
  pa: {
    doshas: { index: {} },
    horoscope: { index: {}, signs: {}, yearly: {}, elements: {}, planets: {}, months: {} },
    transits: { index: {} }
  }
};

// Deep merge function to combine translation objects
export function deepMergeIndexPages(target: TranslationObject, source: TranslationObject): TranslationObject {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMergeIndexPages(
        (result[key] as TranslationObject) || {},
        source[key] as TranslationObject
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
