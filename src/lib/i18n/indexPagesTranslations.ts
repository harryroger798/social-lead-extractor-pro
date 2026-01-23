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
    doshas: {
      index: {
        badge: "வேத ஜோதிடம்",
        title: "வேத ஜோதிடத்தில் தோஷங்கள்",
        subtitle: "உங்கள் ஜாதகத்தில் உள்ள பல்வேறு தோஷங்கள், வாழ்க்கையில் அவற்றின் விளைவுகள் மற்றும் அவற்றின் எதிர்மறை தாக்கங்களைக் குறைக்க பயனுள்ள தீர்வுகள் பற்றி அறியவும்.",
        whatAreDoshas: "தோஷங்கள் என்றால் என்ன?",
        description: "வேத ஜோதிடத்தில், தோஷங்கள் என்பது ஜாதகத்தில் உள்ள சாதகமற்ற கிரக சேர்க்கைகள் அல்லது நிலைகள் ஆகும், அவை வாழ்க்கையின் குறிப்பிட்ட பகுதிகளில் சவால்களை உருவாக்கலாம்.",
        mangalDosh: {
          title: "செவ்வாய் தோஷம்",
          badge: "செவ்வாய் தோஷம்",
          description: "செவ்வாய் ஜாதகத்தின் சில வீடுகளில் வைக்கப்படும்போது செவ்வாய் தோஷம் ஏற்படுகிறது. இது திருமணம் மற்றும் உறவுகளை பாதிக்கலாம்."
        },
        kaalSarpDosh: {
          title: "கால சர்ப்ப தோஷம்",
          badge: "சர்ப்ப தோஷம்",
          description: "அனைத்து கிரகங்களும் ராகு மற்றும் கேதுவுக்கு இடையில் அடைக்கப்படும்போது கால சர்ப்ப தோஷம் உருவாகிறது."
        },
        sadeSati: {
          title: "சாடே சாத்தி",
          badge: "சனி கோச்சாரம்",
          description: "சாடே சாத்தி என்பது 7.5 ஆண்டு காலம் ஆகும், அப்போது சனி உங்கள் சந்திர ராசியிலிருந்து 12வது, 1வது மற்றும் 2வது வீடுகள் வழியாக செல்கிறது."
        },
        pitraDosh: {
          title: "பித்ரு தோஷம்",
          badge: "மூதாதையர் கர்மா",
          description: "பித்ரு தோஷம் உங்கள் வாழ்க்கையை பாதிக்கும் மூதாதையர் கர்மாவைக் குறிக்கிறது."
        },
        learnMore: "மேலும் அறிய",
        checkYourChart: "தோஷங்களுக்கு உங்கள் ஜாதகத்தை சரிபார்க்கவும்",
        checkDescription: "உங்கள் ஜாதகத்தில் ஏதேனும் தோஷங்களை அடையாளம் காண உங்கள் இலவச ஜாதகத்தை உருவாக்கவும்.",
        generateKundli: "இலவச ஜாதகம் உருவாக்கவும்",
        checkMangalDosh: "செவ்வாய் தோஷம் சரிபார்க்கவும்",
        checkSadeSati: "சாடே சாத்தி சரிபார்க்கவும்"
      }
    },
    horoscope: {
      index: {
        badge: "வேத ஜோதிடம்",
        title: "ராசிபலன் கணிப்புகள்",
        subtitle: "வேத ஜோதிடத்தின் அடிப்படையில் துல்லியமான ராசிபலன் கணிப்புகளைப் பெறுங்கள். அனைத்து 12 ராசிகளுக்கும் தினசரி, வாராந்திர, மாதாந்திர அல்லது வருடாந்திர ராசிபலன்களில் இருந்து தேர்வு செய்யவும்.",
        types: {
          daily: { title: "தினசரி ராசிபலன்", description: "கிரக கோச்சாரங்கள் மற்றும் உங்கள் ராசியின் அடிப்படையில் உங்கள் தினசரி கணிப்புகளைப் பெறுங்கள்." },
          weekly: { title: "வாராந்திர ராசிபலன்", description: "விரிவான வாராந்திர ஜோதிட கணிப்புகளுடன் உங்கள் வாரத்தைத் திட்டமிடுங்கள்." },
          monthly: { title: "மாதாந்திர ராசிபலன்", description: "வாழ்க்கையின் அனைத்து அம்சங்களுக்கும் விரிவான மாதாந்திர கணிப்புகள்." },
          yearly: { title: "வருடாந்திர ராசிபலன்", description: "விரிவான நுண்ணறிவுகள் மற்றும் வழிகாட்டுதலுடன் முழு ஆண்டு கணிப்புகள்." }
        },
        viewHoroscope: "ராசிபலன் பார்க்கவும்",
        aboutTitle: "வேத ராசிபலன்கள் பற்றி",
        aboutDescription: "எங்கள் ராசிபலன் கணிப்புகள் வேத ஜோதிடத்தை அடிப்படையாகக் கொண்டவை.",
        selectSign: "உங்கள் ராசியைத் தேர்ந்தெடுக்கவும்",
        personalizedTitle: "தனிப்பயனாக்கப்பட்ட கணிப்புகளைப் பெறுங்கள்",
        personalizedDescription: "உங்கள் துல்லியமான பிறப்பு விவரங்களின் அடிப்படையில் மேலும் துல்லியமான கணிப்புகளுக்கு.",
        generateKundli: "இலவச ஜாதகம் உருவாக்கவும்",
        consultAstrologer: "ஜோதிடரை அணுகவும்"
      },
      signs: {
        aries: "மேஷம்", taurus: "ரிஷபம்", gemini: "மிதுனம்", cancer: "கடகம்",
        leo: "சிம்மம்", virgo: "கன்னி", libra: "துலாம்", scorpio: "விருச்சிகம்",
        sagittarius: "தனுசு", capricorn: "மகரம்", aquarius: "கும்பம்", pisces: "மீனம்"
      },
      yearly: {
        notFound: "ராசி கிடைக்கவில்லை",
        notFoundDesc: "நீங்கள் தேடும் ராசி இல்லை.",
        backToHoroscope: "ராசிபலனுக்குத் திரும்பு",
        badge: "{year} ராசிபலன்",
        title: {
          aries: "மேஷம் ராசிபலன் {year}", taurus: "ரிஷபம் ராசிபலன் {year}",
          gemini: "மிதுனம் ராசிபலன் {year}", cancer: "கடகம் ராசிபலன் {year}",
          leo: "சிம்மம் ராசிபலன் {year}", virgo: "கன்னி ராசிபலன் {year}",
          libra: "துலாம் ராசிபலன் {year}", scorpio: "விருச்சிகம் ராசிபலன் {year}",
          sagittarius: "தனுசு ராசிபலன் {year}", capricorn: "மகரம் ராசிபலன் {year}",
          aquarius: "கும்பம் ராசிபலன் {year}", pisces: "மீனம் ராசிபலன் {year}"
        },
        hindi: {
          aries: "மேஷம்", taurus: "ரிஷபம்", gemini: "மிதுனம்", cancer: "கடகம்",
          leo: "சிம்மம்", virgo: "கன்னி", libra: "துலாம்", scorpio: "விருச்சிகம்",
          sagittarius: "தனுசு", capricorn: "மகரம்", aquarius: "கும்பம்", pisces: "மீனம்"
        },
        element: "உறுப்பு",
        ruler: "ஆட்சியாளர்",
        ratings: "{year} மதிப்பீடுகள்",
        labels: { overall: "ஒட்டுமொத்த", love: "காதல்", career: "தொழில்", finance: "நிதி", health: "ஆரோக்கியம்" },
        sections: {
          overview: { title: "கண்ணோட்டம் {year}" }, love: { title: "காதல் {year}" },
          career: { title: "தொழில் {year}" }, finance: { title: "நிதி {year}" },
          health: { title: "ஆரோக்கியம் {year}" }, family: { title: "குடும்பம் {year}" },
          education: { title: "கல்வி {year}" }, property: { title: "சொத்து {year}" }
        },
        default: {
          overview: "{year} க்கான உங்கள் கண்ணோட்ட கணிப்புகள் கிரக கோச்சாரங்களால் பாதிக்கப்படும்.",
          love: "{year} க்கான உங்கள் காதல் கணிப்புகள் கிரக கோச்சாரங்களால் பாதிக்கப்படும்.",
          career: "{year} க்கான உங்கள் தொழில் கணிப்புகள் கிரக கோச்சாரங்களால் பாதிக்கப்படும்.",
          finance: "{year} க்கான உங்கள் நிதி கணிப்புகள் கிரக கோச்சாரங்களால் பாதிக்கப்படும்.",
          health: "{year} க்கான உங்கள் ஆரோக்கிய கணிப்புகள் கிரக கோச்சாரங்களால் பாதிக்கப்படும்.",
          family: "{year} க்கான உங்கள் குடும்ப கணிப்புகள் கிரக கோச்சாரங்களால் பாதிக்கப்படும்.",
          education: "{year} க்கான உங்கள் கல்வி கணிப்புகள் கிரக கோச்சாரங்களால் பாதிக்கப்படும்.",
          property: "{year} க்கான உங்கள் சொத்து கணிப்புகள் கிரக கோச்சாரங்களால் பாதிக்கப்படும்.",
          monthSummary: "கிரக தாக்கங்கள் இந்த மாதத்தை வடிவமைக்கும். சமநிலை மற்றும் வளர்ச்சியில் கவனம் செலுத்துங்கள்."
        },
        monthlyOverview: "மாதாந்திர கண்ணோட்டம் {year}",
        luckyFactors: "{year} க்கான அதிர்ஷ்ட காரணிகள்",
        lucky: { numbers: "அதிர்ஷ்ட எண்கள்", colors: "அதிர்ஷ்ட நிறங்கள்", days: "அதிர்ஷ்ட நாட்கள்", gemstone: "அதிர்ஷ்ட ரத்தினம்" },
        personalizedTitle: "தனிப்பயனாக்கப்பட்ட கணிப்புகளைப் பெறுங்கள்",
        personalizedDescription: "உங்கள் துல்லியமான பிறப்பு விவரங்களின் அடிப்படையில்.",
        generateKundli: "இலவச ஜாதகம் உருவாக்கவும்",
        consultAstrologer: "ஜோதிடரை அணுகவும்",
        viewAllSigns: "அனைத்து ராசிகளையும் பார்க்கவும்"
      },
      elements: { fire: "நெருப்பு", earth: "பூமி", air: "காற்று", water: "நீர்" },
      planets: { mars: "செவ்வாய்", venus: "சுக்ரன்", mercury: "புதன்", moon: "சந்திரன்", sun: "சூரியன்", jupiter: "குரு", saturn: "சனி" },
      months: { january: "ஜனவரி", february: "பிப்ரவரி", march: "மார்ச்", april: "ஏப்ரல்", may: "மே", june: "ஜூன்", july: "ஜூலை", august: "ஆகஸ்ட்", september: "செப்டம்பர்", october: "அக்டோபர்", november: "நவம்பர்", december: "டிசம்பர்" }
    },
    transits: {
      index: {
        badge: "வேத ஜோதிடம்",
        title: "கிரக கோச்சாரங்கள் {year}",
        subtitle: "{year} இல் முக்கிய கிரக கோச்சாரங்கள் உங்கள் ராசியை எவ்வாறு பாதிக்கும் என்பதை ஆராயுங்கள்.",
        whatAreTransits: "கிரக கோச்சாரங்கள் என்றால் என்ன?",
        description: "வேத ஜோதிடத்தில், கிரக கோச்சாரங்கள் வெவ்வேறு ராசிகள் வழியாக கிரகங்களின் இயக்கத்தைக் குறிக்கின்றன.",
        jupiter: { title: "குரு கோச்சாரம் {year}", description: "குரு, ஞானம் மற்றும் விரிவாக்கத்தின் கிரகம், அது கோச்சாரம் செய்யும் இடத்தில் வளர்ச்சி மற்றும் வாய்ப்புகளைக் கொண்டுவருகிறது.", summary: "{year} இல் குருவின் இயக்கம் எவ்வாறு ஆசீர்வாதங்களையும் விரிவாக்கத்தையும் கொண்டுவரும் என்பதைக் கண்டறியுங்கள்." },
        saturn: { title: "சனி கோச்சாரம் {year}", description: "சனி, கர்மா மற்றும் ஒழுக்கத்தின் கிரகம், அதன் கோச்சாரத்தின் போது முக்கியமான வாழ்க்கை பாடங்களைக் கற்பிக்கிறது.", summary: "{year} இல் சனி கோச்சார விளைவுகள் பற்றி அறியவும்." },
        mercury: { title: "புதன் கோச்சாரம் {year}", description: "புதன் வக்ர காலங்கள் தொடர்பு, தொழில்நுட்பம் மற்றும் பயணத்தை பாதிக்கின்றன.", summary: "{year} இல் புதன் வக்ர தேதிகளைக் கண்காணிக்கவும்." },
        viewDetails: "விவரங்களைப் பார்க்கவும்",
        eclipses: { title: "கிரகணங்கள் {year}", description: "சூரிய மற்றும் சந்திர கிரகண தேதிகள், நேரங்கள் மற்றும் அவற்றின் ஜோதிட முக்கியத்துவம்." },
        viewEclipses: "கிரகண நாட்காட்டியைப் பார்க்கவும்",
        festivals: { title: "திருவிழா நாட்காட்டி {year}", description: "பஞ்சாங்கத்தின் அடிப்படையில் முக்கியமான இந்து திருவிழாக்கள், முகூர்த்தங்கள் மற்றும் சுப தேதிகள்." },
        viewFestivals: "திருவிழா நாட்காட்டியைப் பார்க்கவும்",
        personalizedTitle: "தனிப்பயனாக்கப்பட்ட கோச்சார பகுப்பாய்வைப் பெறுங்கள்",
        personalizedDescription: "உங்கள் துல்லியமான பிறப்பு விளக்கப்படத்தின் அடிப்படையில்.",
        generateKundli: "இலவச ஜாதகம் உருவாக்கவும்",
        transitCalculator: "கோச்சார கணிப்பான்",
        planetaryTracker: "நேரடி கிரக நிலைகள்"
      }
    }
  },
  te: {
    doshas: {
      index: {
        badge: "వేద జ్యోతిషం",
        title: "వేద జ్యోతిషంలో దోషాలు",
        subtitle: "మీ జాతకంలో ఉన్న వివిధ దోషాలు, జీవితంపై వాటి ప్రభావాలు మరియు వాటి ప్రతికూల ప్రభావాలను తగ్గించడానికి సమర్థవంతమైన పరిహారాల గురించి తెలుసుకోండి.",
        whatAreDoshas: "దోషాలు అంటే ఏమిటి?",
        description: "వేద జ్యోతిషంలో, దోషాలు అనేవి జాతకంలో ప్రతికూల గ్రహ కలయికలు లేదా స్థానాలు, ఇవి జీవితంలోని నిర్దిష్ట రంగాలలో సవాళ్లను సృష్టించగలవు.",
        mangalDosh: { title: "మంగళ దోషం", badge: "కుజ దోషం", description: "కుజుడు జాతకంలోని కొన్ని భావాలలో ఉన్నప్పుడు మంగళ దోషం ఏర్పడుతుంది. ఇది వివాహం మరియు సంబంధాలను ప్రభావితం చేయవచ్చు." },
        kaalSarpDosh: { title: "కాల సర్ప దోషం", badge: "సర్ప దోషం", description: "అన్ని గ్రహాలు రాహు మరియు కేతువు మధ్య ఉన్నప్పుడు కాల సర్ప దోషం ఏర్పడుతుంది." },
        sadeSati: { title: "సాడే సాతి", badge: "శని గోచారం", description: "సాడే సాతి అనేది 7.5 సంవత్సరాల కాలం, శని మీ చంద్ర రాశి నుండి 12వ, 1వ మరియు 2వ భావాల గుండా ప్రయాణిస్తుంది." },
        pitraDosh: { title: "పితృ దోషం", badge: "పూర్వీకుల కర్మ", description: "పితృ దోషం మీ జీవితాన్ని ప్రభావితం చేసే పూర్వీకుల కర్మను సూచిస్తుంది." },
        learnMore: "మరింత తెలుసుకోండి",
        checkYourChart: "దోషాల కోసం మీ జాతకాన్ని తనిఖీ చేయండి",
        checkDescription: "మీ జాతకంలో ఏవైనా దోషాలను గుర్తించడానికి మీ ఉచిత జాతకాన్ని రూపొందించండి.",
        generateKundli: "ఉచిత జాతకం రూపొందించండి",
        checkMangalDosh: "మంగళ దోషం తనిఖీ చేయండి",
        checkSadeSati: "సాడే సాతి తనిఖీ చేయండి"
      }
    },
    horoscope: {
      index: {
        badge: "వేద జ్యోతిషం",
        title: "రాశిఫలం అంచనాలు",
        subtitle: "వేద జ్యోతిషం ఆధారంగా ఖచ్చితమైన రాశిఫలం అంచనాలను పొందండి. అన్ని 12 రాశులకు రోజువారీ, వారపు, నెలవారీ లేదా వార్షిక రాశిఫలాల నుండి ఎంచుకోండి.",
        types: {
          daily: { title: "రోజువారీ రాశిఫలం", description: "గ్రహ గోచారాలు మరియు మీ రాశి ఆధారంగా మీ రోజువారీ అంచనాలను పొందండి." },
          weekly: { title: "వారపు రాశిఫలం", description: "వివరమైన వారపు జ్యోతిష అంచనాలతో మీ వారాన్ని ప్లాన్ చేయండి." },
          monthly: { title: "నెలవారీ రాశిఫలం", description: "జీవితంలోని అన్ని అంశాలకు సమగ్ర నెలవారీ అంచనాలు." },
          yearly: { title: "వార్షిక రాశిఫలం", description: "వివరమైన అంతర్దృష్టులు మరియు మార్గదర్శకత్వంతో పూర్తి సంవత్సర అంచనాలు." }
        },
        viewHoroscope: "రాశిఫలం చూడండి",
        aboutTitle: "వేద రాశిఫలాల గురించి",
        aboutDescription: "మా రాశిఫలం అంచనాలు వేద జ్యోతిషం ఆధారంగా ఉంటాయి.",
        selectSign: "మీ రాశిని ఎంచుకోండి",
        personalizedTitle: "వ్యక్తిగతీకరించిన అంచనాలను పొందండి",
        personalizedDescription: "మీ ఖచ్చితమైన జన్మ వివరాల ఆధారంగా మరింత ఖచ్చితమైన అంచనాల కోసం.",
        generateKundli: "ఉచిత జాతకం రూపొందించండి",
        consultAstrologer: "జ్యోతిష్కుడిని సంప్రదించండి"
      },
      signs: {
        aries: "మేషం", taurus: "వృషభం", gemini: "మిథునం", cancer: "కర్కాటకం",
        leo: "సింహం", virgo: "కన్య", libra: "తుల", scorpio: "వృశ్చికం",
        sagittarius: "ధనుస్సు", capricorn: "మకరం", aquarius: "కుంభం", pisces: "మీనం"
      },
      yearly: {
        notFound: "రాశి కనుగొనబడలేదు",
        notFoundDesc: "మీరు వెతుకుతున్న రాశి ఉనికిలో లేదు.",
        backToHoroscope: "రాశిఫలానికి తిరిగి వెళ్ళండి",
        badge: "{year} రాశిఫలం",
        title: {
          aries: "మేషం రాశిఫలం {year}", taurus: "వృషభం రాశిఫలం {year}",
          gemini: "మిథునం రాశిఫలం {year}", cancer: "కర్కాటకం రాశిఫలం {year}",
          leo: "సింహం రాశిఫలం {year}", virgo: "కన్య రాశిఫలం {year}",
          libra: "తుల రాశిఫలం {year}", scorpio: "వృశ్చికం రాశిఫలం {year}",
          sagittarius: "ధనుస్సు రాశిఫలం {year}", capricorn: "మకరం రాశిఫలం {year}",
          aquarius: "కుంభం రాశిఫలం {year}", pisces: "మీనం రాశిఫలం {year}"
        },
        hindi: {
          aries: "మేషం", taurus: "వృషభం", gemini: "మిథునం", cancer: "కర్కాటకం",
          leo: "సింహం", virgo: "కన్య", libra: "తుల", scorpio: "వృశ్చికం",
          sagittarius: "ధనుస్సు", capricorn: "మకరం", aquarius: "కుంభం", pisces: "మీనం"
        },
        element: "మూలకం",
        ruler: "అధిపతి",
        ratings: "{year} రేటింగ్‌లు",
        labels: { overall: "మొత్తం", love: "ప్రేమ", career: "వృత్తి", finance: "ఆర్థికం", health: "ఆరోగ్యం" },
        sections: {
          overview: { title: "అవలోకనం {year}" }, love: { title: "ప్రేమ {year}" },
          career: { title: "వృత్తి {year}" }, finance: { title: "ఆర్థికం {year}" },
          health: { title: "ఆరోగ్యం {year}" }, family: { title: "కుటుంబం {year}" },
          education: { title: "విద్య {year}" }, property: { title: "ఆస్తి {year}" }
        },
        default: {
          overview: "{year} కోసం మీ అవలోకన అంచనాలు గ్రహ గోచారాల ద్వారా ప్రభావితమవుతాయి.",
          love: "{year} కోసం మీ ప్రేమ అంచనాలు గ్రహ గోచారాల ద్వారా ప్రభావితమవుతాయి.",
          career: "{year} కోసం మీ వృత్తి అంచనాలు గ్రహ గోచారాల ద్వారా ప్రభావితమవుతాయి.",
          finance: "{year} కోసం మీ ఆర్థిక అంచనాలు గ్రహ గోచారాల ద్వారా ప్రభావితమవుతాయి.",
          health: "{year} కోసం మీ ఆరోగ్య అంచనాలు గ్రహ గోచారాల ద్వారా ప్రభావితమవుతాయి.",
          family: "{year} కోసం మీ కుటుంబ అంచనాలు గ్రహ గోచారాల ద్వారా ప్రభావితమవుతాయి.",
          education: "{year} కోసం మీ విద్య అంచనాలు గ్రహ గోచారాల ద్వారా ప్రభావితమవుతాయి.",
          property: "{year} కోసం మీ ఆస్తి అంచనాలు గ్రహ గోచారాల ద్వారా ప్రభావితమవుతాయి.",
          monthSummary: "గ్రహ ప్రభావాలు ఈ నెలను రూపొందిస్తాయి. సమతుల్యత మరియు వృద్ధిపై దృష్టి పెట్టండి."
        },
        monthlyOverview: "నెలవారీ అవలోకనం {year}",
        luckyFactors: "{year} కోసం అదృష్ట కారకాలు",
        lucky: { numbers: "అదృష్ట సంఖ్యలు", colors: "అదృష్ట రంగులు", days: "అదృష్ట రోజులు", gemstone: "అదృష్ట రత్నం" },
        personalizedTitle: "వ్యక్తిగతీకరించిన అంచనాలను పొందండి",
        personalizedDescription: "మీ ఖచ్చితమైన జన్మ వివరాల ఆధారంగా.",
        generateKundli: "ఉచిత జాతకం రూపొందించండి",
        consultAstrologer: "జ్యోతిష్కుడిని సంప్రదించండి",
        viewAllSigns: "అన్ని రాశులను చూడండి"
      },
      elements: { fire: "అగ్ని", earth: "భూమి", air: "వాయువు", water: "నీరు" },
      planets: { mars: "కుజుడు", venus: "శుక్రుడు", mercury: "బుధుడు", moon: "చంద్రుడు", sun: "సూర్యుడు", jupiter: "గురుడు", saturn: "శని" },
      months: { january: "జనవరి", february: "ఫిబ్రవరి", march: "మార్చి", april: "ఏప్రిల్", may: "మే", june: "జూన్", july: "జూలై", august: "ఆగస్టు", september: "సెప్టెంబర్", october: "అక్టోబర్", november: "నవంబర్", december: "డిసెంబర్" }
    },
    transits: {
      index: {
        badge: "వేద జ్యోతిషం",
        title: "గ్రహ గోచారాలు {year}",
        subtitle: "{year}లో ప్రధాన గ్రహ గోచారాలు మీ రాశిని ఎలా ప్రభావితం చేస్తాయో అన్వేషించండి.",
        whatAreTransits: "గ్రహ గోచారాలు అంటే ఏమిటి?",
        description: "వేద జ్యోతిషంలో, గ్రహ గోచారాలు వివిధ రాశుల గుండా గ్రహాల కదలికను సూచిస్తాయి.",
        jupiter: { title: "గురు గోచారం {year}", description: "గురుడు, జ్ఞానం మరియు విస్తరణ గ్రహం, అది గోచరించే చోట వృద్ధి మరియు అవకాశాలను తెస్తుంది.", summary: "{year}లో గురుడి కదలిక ఎలా ఆశీర్వాదాలు మరియు విస్తరణను తెస్తుందో కనుగొనండి." },
        saturn: { title: "శని గోచారం {year}", description: "శని, కర్మ మరియు క్రమశిక్షణ గ్రహం, దాని గోచారంలో ముఖ్యమైన జీవిత పాఠాలను బోధిస్తుంది.", summary: "{year}లో శని గోచార ప్రభావాల గురించి తెలుసుకోండి." },
        mercury: { title: "బుధ గోచారం {year}", description: "బుధ వక్ర కాలాలు సంభాషణ, సాంకేతికత మరియు ప్రయాణాన్ని ప్రభావితం చేస్తాయి.", summary: "{year}లో బుధ వక్ర తేదీలను ట్రాక్ చేయండి." },
        viewDetails: "వివరాలు చూడండి",
        eclipses: { title: "గ్రహణాలు {year}", description: "సూర్య మరియు చంద్ర గ్రహణ తేదీలు, సమయాలు మరియు వాటి జ్యోతిష ప్రాముఖ్యత." },
        viewEclipses: "గ్రహణ క్యాలెండర్ చూడండి",
        festivals: { title: "పండుగల క్యాలెండర్ {year}", description: "పంచాంగం ఆధారంగా ముఖ్యమైన హిందూ పండుగలు, ముహూర్తాలు మరియు శుభ తేదీలు." },
        viewFestivals: "పండుగల క్యాలెండర్ చూడండి",
        personalizedTitle: "వ్యక్తిగతీకరించిన గోచార విశ్లేషణ పొందండి",
        personalizedDescription: "మీ ఖచ్చితమైన జన్మ చార్ట్ ఆధారంగా.",
        generateKundli: "ఉచిత జాతకం రూపొందించండి",
        transitCalculator: "గోచార కాలిక్యులేటర్",
        planetaryTracker: "లైవ్ గ్రహ స్థానాలు"
      }
    }
  },
  bn: {
    doshas: {
      index: {
        badge: "বৈদিক জ্যোতিষ",
        title: "বৈদিক জ্যোতিষে দোষ",
        subtitle: "আপনার জন্মকুণ্ডলীতে বিভিন্ন দোষ, জীবনে তাদের প্রভাব এবং তাদের নেতিবাচক প্রভাব কমাতে কার্যকর প্রতিকার সম্পর্কে জানুন।",
        whatAreDoshas: "দোষ কী?",
        description: "বৈদিক জ্যোতিষে, দোষ হল জন্মকুণ্ডলীতে প্রতিকূল গ্রহ সংযোগ বা অবস্থান যা জীবনের নির্দিষ্ট ক্ষেত্রে চ্যালেঞ্জ তৈরি করতে পারে।",
        mangalDosh: { title: "মঙ্গল দোষ", badge: "কুজ দোষ", description: "মঙ্গল জন্মকুণ্ডলীর নির্দিষ্ট ভাবে থাকলে মঙ্গল দোষ হয়। এটি বিবাহ এবং সম্পর্ককে প্রভাবিত করতে পারে।" },
        kaalSarpDosh: { title: "কাল সর্প দোষ", badge: "সর্প দোষ", description: "সমস্ত গ্রহ রাহু এবং কেতুর মধ্যে থাকলে কাল সর্প দোষ হয়।" },
        sadeSati: { title: "সাড়ে সাতি", badge: "শনি গোচর", description: "সাড়ে সাতি হল ৭.৫ বছরের সময়কাল যখন শনি আপনার চন্দ্র রাশি থেকে ১২তম, ১ম এবং ২য় ভাবের মধ্য দিয়ে যায়।" },
        pitraDosh: { title: "পিতৃ দোষ", badge: "পূর্বপুরুষের কর্ম", description: "পিতৃ দোষ আপনার জীবনকে প্রভাবিত করে এমন পূর্বপুরুষের কর্মকে নির্দেশ করে।" },
        learnMore: "আরও জানুন",
        checkYourChart: "দোষের জন্য আপনার কুণ্ডলী পরীক্ষা করুন",
        checkDescription: "আপনার কুণ্ডলীতে কোনো দোষ চিহ্নিত করতে আপনার বিনামূল্যে কুণ্ডলী তৈরি করুন।",
        generateKundli: "বিনামূল্যে কুণ্ডলী তৈরি করুন",
        checkMangalDosh: "মঙ্গল দোষ পরীক্ষা করুন",
        checkSadeSati: "সাড়ে সাতি পরীক্ষা করুন"
      }
    },
    horoscope: {
      index: {
        badge: "বৈদিক জ্যোতিষ",
        title: "রাশিফল ভবিষ্যদ্বাণী",
        subtitle: "বৈদিক জ্যোতিষের উপর ভিত্তি করে সঠিক রাশিফল ভবিষ্যদ্বাণী পান। সমস্ত ১২ রাশির জন্য দৈনিক, সাপ্তাহিক, মাসিক বা বার্ষিক রাশিফল থেকে বেছে নিন।",
        types: {
          daily: { title: "দৈনিক রাশিফল", description: "গ্রহ গোচর এবং আপনার রাশির উপর ভিত্তি করে আপনার দৈনিক ভবিষ্যদ্বাণী পান।" },
          weekly: { title: "সাপ্তাহিক রাশিফল", description: "বিস্তারিত সাপ্তাহিক জ্যোতিষ ভবিষ্যদ্বাণী দিয়ে আপনার সপ্তাহ পরিকল্পনা করুন।" },
          monthly: { title: "মাসিক রাশিফল", description: "জীবনের সমস্ত দিকের জন্য ব্যাপক মাসিক ভবিষ্যদ্বাণী।" },
          yearly: { title: "বার্ষিক রাশিফল", description: "বিস্তারিত অন্তর্দৃষ্টি এবং নির্দেশনা সহ সম্পূর্ণ বছরের ভবিষ্যদ্বাণী।" }
        },
        viewHoroscope: "রাশিফল দেখুন",
        aboutTitle: "বৈদিক রাশিফল সম্পর্কে",
        aboutDescription: "আমাদের রাশিফল ভবিষ্যদ্বাণী বৈদিক জ্যোতিষের উপর ভিত্তি করে।",
        selectSign: "আপনার রাশি নির্বাচন করুন",
        personalizedTitle: "ব্যক্তিগতকৃত ভবিষ্যদ্বাণী পান",
        personalizedDescription: "আপনার সঠিক জন্ম বিবরণের উপর ভিত্তি করে আরও সঠিক ভবিষ্যদ্বাণীর জন্য।",
        generateKundli: "বিনামূল্যে কুণ্ডলী তৈরি করুন",
        consultAstrologer: "জ্যোতিষীর সাথে পরামর্শ করুন"
      },
      signs: {
        aries: "মেষ", taurus: "বৃষ", gemini: "মিথুন", cancer: "কর্কট",
        leo: "সিংহ", virgo: "কন্যা", libra: "তুলা", scorpio: "বৃশ্চিক",
        sagittarius: "ধনু", capricorn: "মকর", aquarius: "কুম্ভ", pisces: "মীন"
      },
      yearly: {
        notFound: "রাশি পাওয়া যায়নি",
        notFoundDesc: "আপনি যে রাশি খুঁজছেন তা বিদ্যমান নেই।",
        backToHoroscope: "রাশিফলে ফিরে যান",
        badge: "{year} রাশিফল",
        title: {
          aries: "মেষ রাশিফল {year}", taurus: "বৃষ রাশিফল {year}",
          gemini: "মিথুন রাশিফল {year}", cancer: "কর্কট রাশিফল {year}",
          leo: "সিংহ রাশিফল {year}", virgo: "কন্যা রাশিফল {year}",
          libra: "তুলা রাশিফল {year}", scorpio: "বৃশ্চিক রাশিফল {year}",
          sagittarius: "ধনু রাশিফল {year}", capricorn: "মকর রাশিফল {year}",
          aquarius: "কুম্ভ রাশিফল {year}", pisces: "মীন রাশিফল {year}"
        },
        hindi: {
          aries: "মেষ", taurus: "বৃষ", gemini: "মিথুন", cancer: "কর্কট",
          leo: "সিংহ", virgo: "কন্যা", libra: "তুলা", scorpio: "বৃশ্চিক",
          sagittarius: "ধনু", capricorn: "মকর", aquarius: "কুম্ভ", pisces: "মীন"
        },
        element: "উপাদান",
        ruler: "শাসক",
        ratings: "{year} রেটিং",
        labels: { overall: "সামগ্রিক", love: "প্রেম", career: "কর্মজীবন", finance: "অর্থ", health: "স্বাস্থ্য" },
        sections: {
          overview: { title: "সংক্ষিপ্ত বিবরণ {year}" }, love: { title: "প্রেম {year}" },
          career: { title: "কর্মজীবন {year}" }, finance: { title: "অর্থ {year}" },
          health: { title: "স্বাস্থ্য {year}" }, family: { title: "পরিবার {year}" },
          education: { title: "শিক্ষা {year}" }, property: { title: "সম্পত্তি {year}" }
        },
        default: {
          overview: "{year} এর জন্য আপনার সংক্ষিপ্ত ভবিষ্যদ্বাণী গ্রহ গোচর দ্বারা প্রভাবিত হবে।",
          love: "{year} এর জন্য আপনার প্রেম ভবিষ্যদ্বাণী গ্রহ গোচর দ্বারা প্রভাবিত হবে।",
          career: "{year} এর জন্য আপনার কর্মজীবন ভবিষ্যদ্বাণী গ্রহ গোচর দ্বারা প্রভাবিত হবে।",
          finance: "{year} এর জন্য আপনার অর্থ ভবিষ্যদ্বাণী গ্রহ গোচর দ্বারা প্রভাবিত হবে।",
          health: "{year} এর জন্য আপনার স্বাস্থ্য ভবিষ্যদ্বাণী গ্রহ গোচর দ্বারা প্রভাবিত হবে।",
          family: "{year} এর জন্য আপনার পরিবার ভবিষ্যদ্বাণী গ্রহ গোচর দ্বারা প্রভাবিত হবে।",
          education: "{year} এর জন্য আপনার শিক্ষা ভবিষ্যদ্বাণী গ্রহ গোচর দ্বারা প্রভাবিত হবে।",
          property: "{year} এর জন্য আপনার সম্পত্তি ভবিষ্যদ্বাণী গ্রহ গোচর দ্বারা প্রভাবিত হবে।",
          monthSummary: "গ্রহ প্রভাব এই মাসকে আকার দেবে। ভারসাম্য এবং বৃদ্ধিতে মনোযোগ দিন।"
        },
        monthlyOverview: "মাসিক সংক্ষিপ্ত বিবরণ {year}",
        luckyFactors: "{year} এর জন্য ভাগ্যবান কারণ",
        lucky: { numbers: "ভাগ্যবান সংখ্যা", colors: "ভাগ্যবান রং", days: "ভাগ্যবান দিন", gemstone: "ভাগ্যবান রত্ন" },
        personalizedTitle: "ব্যক্তিগতকৃত ভবিষ্যদ্বাণী পান",
        personalizedDescription: "আপনার সঠিক জন্ম বিবরণের উপর ভিত্তি করে।",
        generateKundli: "বিনামূল্যে কুণ্ডলী তৈরি করুন",
        consultAstrologer: "জ্যোতিষীর সাথে পরামর্শ করুন",
        viewAllSigns: "সমস্ত রাশি দেখুন"
      },
      elements: { fire: "অগ্নি", earth: "পৃথিবী", air: "বায়ু", water: "জল" },
      planets: { mars: "মঙ্গল", venus: "শুক্র", mercury: "বুধ", moon: "চন্দ্র", sun: "সূর্য", jupiter: "বৃহস্পতি", saturn: "শনি" },
      months: { january: "জানুয়ারি", february: "ফেব্রুয়ারি", march: "মার্চ", april: "এপ্রিল", may: "মে", june: "জুন", july: "জুলাই", august: "আগস্ট", september: "সেপ্টেম্বর", october: "অক্টোবর", november: "নভেম্বর", december: "ডিসেম্বর" }
    },
    transits: {
      index: {
        badge: "বৈদিক জ্যোতিষ",
        title: "গ্রহ গোচর {year}",
        subtitle: "{year} এ প্রধান গ্রহ গোচর আপনার রাশিকে কীভাবে প্রভাবিত করবে তা অন্বেষণ করুন।",
        whatAreTransits: "গ্রহ গোচর কী?",
        description: "বৈদিক জ্যোতিষে, গ্রহ গোচর বিভিন্ন রাশির মধ্য দিয়ে গ্রহের গতিবিধিকে বোঝায়।",
        jupiter: { title: "বৃহস্পতি গোচর {year}", description: "বৃহস্পতি, জ্ঞান এবং সম্প্রসারণের গ্রহ, যেখানে গোচর করে সেখানে বৃদ্ধি এবং সুযোগ নিয়ে আসে।", summary: "{year} এ বৃহস্পতির গতি কীভাবে আশীর্বাদ এবং সম্প্রসারণ আনবে তা জানুন।" },
        saturn: { title: "শনি গোচর {year}", description: "শনি, কর্ম এবং শৃঙ্খলার গ্রহ, তার গোচরের সময় গুরুত্বপূর্ণ জীবন পাঠ শেখায়।", summary: "{year} এ শনি গোচর প্রভাব সম্পর্কে জানুন।" },
        mercury: { title: "বুধ গোচর {year}", description: "বুধ বক্র সময়কাল যোগাযোগ, প্রযুক্তি এবং ভ্রমণকে প্রভাবিত করে।", summary: "{year} এ বুধ বক্র তারিখ ট্র্যাক করুন।" },
        viewDetails: "বিস্তারিত দেখুন",
        eclipses: { title: "গ্রহণ {year}", description: "সূর্য এবং চন্দ্র গ্রহণের তারিখ, সময় এবং তাদের জ্যোতিষ গুরুত্ব।" },
        viewEclipses: "গ্রহণ ক্যালেন্ডার দেখুন",
        festivals: { title: "উৎসব ক্যালেন্ডার {year}", description: "পঞ্চাঙ্গের উপর ভিত্তি করে গুরুত্বপূর্ণ হিন্দু উৎসব, মুহূর্ত এবং শুভ তারিখ।" },
        viewFestivals: "উৎসব ক্যালেন্ডার দেখুন",
        personalizedTitle: "ব্যক্তিগতকৃত গোচর বিশ্লেষণ পান",
        personalizedDescription: "আপনার সঠিক জন্ম চার্টের উপর ভিত্তি করে।",
        generateKundli: "বিনামূল্যে কুণ্ডলী তৈরি করুন",
        transitCalculator: "গোচর ক্যালকুলেটর",
        planetaryTracker: "লাইভ গ্রহ অবস্থান"
      }
    }
  },
  mr: {
    doshas: {
      index: {
        badge: "वैदिक ज्योतिष",
        title: "वैदिक ज्योतिषातील दोष",
        subtitle: "तुमच्या जन्मकुंडलीतील विविध दोष, जीवनावर त्यांचे परिणाम आणि त्यांचे नकारात्मक प्रभाव कमी करण्यासाठी प्रभावी उपाय जाणून घ्या.",
        whatAreDoshas: "दोष म्हणजे काय?",
        description: "वैदिक ज्योतिषात, दोष म्हणजे जन्मकुंडलीतील प्रतिकूल ग्रह संयोग किंवा स्थान जे जीवनाच्या विशिष्ट क्षेत्रात आव्हाने निर्माण करू शकतात.",
        mangalDosh: { title: "मंगळ दोष", badge: "कुज दोष", description: "मंगळ जन्मकुंडलीच्या विशिष्ट भावात असताना मंगळ दोष होतो. हे विवाह आणि नातेसंबंधांवर परिणाम करू शकते." },
        kaalSarpDosh: { title: "काल सर्प दोष", badge: "सर्प दोष", description: "सर्व ग्रह राहू आणि केतू यांच्यामध्ये असताना काल सर्प दोष होतो." },
        sadeSati: { title: "साडेसाती", badge: "शनि गोचर", description: "साडेसाती हा ७.५ वर्षांचा कालावधी आहे जेव्हा शनि तुमच्या चंद्र राशीपासून १२वा, १ला आणि २रा भाव ओलांडतो." },
        pitraDosh: { title: "पितृ दोष", badge: "पूर्वजांचे कर्म", description: "पितृ दोष तुमच्या जीवनावर परिणाम करणाऱ्या पूर्वजांच्या कर्माचे संकेत देतो." },
        learnMore: "अधिक जाणून घ्या",
        checkYourChart: "दोषांसाठी तुमची कुंडली तपासा",
        checkDescription: "तुमच्या कुंडलीत कोणतेही दोष ओळखण्यासाठी तुमची मोफत कुंडली तयार करा.",
        generateKundli: "मोफत कुंडली तयार करा",
        checkMangalDosh: "मंगळ दोष तपासा",
        checkSadeSati: "साडेसाती तपासा"
      }
    },
    horoscope: {
      index: {
        badge: "वैदिक ज्योतिष",
        title: "राशीभविष्य अंदाज",
        subtitle: "वैदिक ज्योतिषावर आधारित अचूक राशीभविष्य अंदाज मिळवा. सर्व १२ राशींसाठी दैनिक, साप्ताहिक, मासिक किंवा वार्षिक राशीभविष्य निवडा.",
        types: {
          daily: { title: "दैनिक राशीभविष्य", description: "ग्रह गोचर आणि तुमच्या राशीवर आधारित तुमचे दैनिक अंदाज मिळवा." },
          weekly: { title: "साप्ताहिक राशीभविष्य", description: "तपशीलवार साप्ताहिक ज्योतिष अंदाजांसह तुमचा आठवडा नियोजित करा." },
          monthly: { title: "मासिक राशीभविष्य", description: "जीवनाच्या सर्व पैलूंसाठी सर्वसमावेशक मासिक अंदाज." },
          yearly: { title: "वार्षिक राशीभविष्य", description: "तपशीलवार अंतर्दृष्टी आणि मार्गदर्शनासह संपूर्ण वर्षाचे अंदाज." }
        },
        viewHoroscope: "राशीभविष्य पहा",
        aboutTitle: "वैदिक राशीभविष्याबद्दल",
        aboutDescription: "आमचे राशीभविष्य अंदाज वैदिक ज्योतिषावर आधारित आहेत.",
        selectSign: "तुमची राशी निवडा",
        personalizedTitle: "वैयक्तिकृत अंदाज मिळवा",
        personalizedDescription: "तुमच्या अचूक जन्म तपशीलांवर आधारित अधिक अचूक अंदाजांसाठी.",
        generateKundli: "मोफत कुंडली तयार करा",
        consultAstrologer: "ज्योतिषाचा सल्ला घ्या"
      },
      signs: {
        aries: "मेष", taurus: "वृषभ", gemini: "मिथुन", cancer: "कर्क",
        leo: "सिंह", virgo: "कन्या", libra: "तूळ", scorpio: "वृश्चिक",
        sagittarius: "धनु", capricorn: "मकर", aquarius: "कुंभ", pisces: "मीन"
      },
      yearly: {
        notFound: "राशी सापडली नाही",
        notFoundDesc: "तुम्ही शोधत असलेली राशी अस्तित्वात नाही.",
        backToHoroscope: "राशीभविष्याकडे परत जा",
        badge: "{year} राशीभविष्य",
        title: {
          aries: "मेष राशीभविष्य {year}", taurus: "वृषभ राशीभविष्य {year}",
          gemini: "मिथुन राशीभविष्य {year}", cancer: "कर्क राशीभविष्य {year}",
          leo: "सिंह राशीभविष्य {year}", virgo: "कन्या राशीभविष्य {year}",
          libra: "तूळ राशीभविष्य {year}", scorpio: "वृश्चिक राशीभविष्य {year}",
          sagittarius: "धनु राशीभविष्य {year}", capricorn: "मकर राशीभविष्य {year}",
          aquarius: "कुंभ राशीभविष्य {year}", pisces: "मीन राशीभविष्य {year}"
        },
        hindi: {
          aries: "मेष", taurus: "वृषभ", gemini: "मिथुन", cancer: "कर्क",
          leo: "सिंह", virgo: "कन्या", libra: "तूळ", scorpio: "वृश्चिक",
          sagittarius: "धनु", capricorn: "मकर", aquarius: "कुंभ", pisces: "मीन"
        },
        element: "तत्व",
        ruler: "स्वामी",
        ratings: "{year} रेटिंग",
        labels: { overall: "एकूण", love: "प्रेम", career: "करिअर", finance: "आर्थिक", health: "आरोग्य" },
        sections: {
          overview: { title: "आढावा {year}" }, love: { title: "प्रेम {year}" },
          career: { title: "करिअर {year}" }, finance: { title: "आर्थिक {year}" },
          health: { title: "आरोग्य {year}" }, family: { title: "कुटुंब {year}" },
          education: { title: "शिक्षण {year}" }, property: { title: "मालमत्ता {year}" }
        },
        default: {
          overview: "{year} साठी तुमचे आढावा अंदाज ग्रह गोचरांनी प्रभावित होतील.",
          love: "{year} साठी तुमचे प्रेम अंदाज ग्रह गोचरांनी प्रभावित होतील.",
          career: "{year} साठी तुमचे करिअर अंदाज ग्रह गोचरांनी प्रभावित होतील.",
          finance: "{year} साठी तुमचे आर्थिक अंदाज ग्रह गोचरांनी प्रभावित होतील.",
          health: "{year} साठी तुमचे आरोग्य अंदाज ग्रह गोचरांनी प्रभावित होतील.",
          family: "{year} साठी तुमचे कुटुंब अंदाज ग्रह गोचरांनी प्रभावित होतील.",
          education: "{year} साठी तुमचे शिक्षण अंदाज ग्रह गोचरांनी प्रभावित होतील.",
          property: "{year} साठी तुमचे मालमत्ता अंदाज ग्रह गोचरांनी प्रभावित होतील.",
          monthSummary: "ग्रह प्रभाव या महिन्याला आकार देतील. संतुलन आणि वाढीवर लक्ष केंद्रित करा."
        },
        monthlyOverview: "मासिक आढावा {year}",
        luckyFactors: "{year} साठी भाग्यशाली घटक",
        lucky: { numbers: "भाग्यशाली अंक", colors: "भाग्यशाली रंग", days: "भाग्यशाली दिवस", gemstone: "भाग्यशाली रत्न" },
        personalizedTitle: "वैयक्तिकृत अंदाज मिळवा",
        personalizedDescription: "तुमच्या अचूक जन्म तपशीलांवर आधारित.",
        generateKundli: "मोफत कुंडली तयार करा",
        consultAstrologer: "ज्योतिषाचा सल्ला घ्या",
        viewAllSigns: "सर्व राशी पहा"
      },
      elements: { fire: "अग्नि", earth: "पृथ्वी", air: "वायू", water: "जल" },
      planets: { mars: "मंगळ", venus: "शुक्र", mercury: "बुध", moon: "चंद्र", sun: "सूर्य", jupiter: "गुरू", saturn: "शनि" },
      months: { january: "जानेवारी", february: "फेब्रुवारी", march: "मार्च", april: "एप्रिल", may: "मे", june: "जून", july: "जुलै", august: "ऑगस्ट", september: "सप्टेंबर", october: "ऑक्टोबर", november: "नोव्हेंबर", december: "डिसेंबर" }
    },
    transits: {
      index: {
        badge: "वैदिक ज्योतिष",
        title: "ग्रह गोचर {year}",
        subtitle: "{year} मध्ये प्रमुख ग्रह गोचर तुमच्या राशीवर कसा परिणाम करतील ते शोधा.",
        whatAreTransits: "ग्रह गोचर म्हणजे काय?",
        description: "वैदिक ज्योतिषात, ग्रह गोचर म्हणजे विविध राशींमधून ग्रहांची हालचाल.",
        jupiter: { title: "गुरू गोचर {year}", description: "गुरू, ज्ञान आणि विस्ताराचा ग्रह, जिथे गोचर करतो तिथे वाढ आणि संधी आणतो.", summary: "{year} मध्ये गुरूची हालचाल कशी आशीर्वाद आणि विस्तार आणेल ते शोधा." },
        saturn: { title: "शनि गोचर {year}", description: "शनि, कर्म आणि शिस्तीचा ग्रह, त्याच्या गोचरात महत्त्वाचे जीवन धडे शिकवतो.", summary: "{year} मध्ये शनि गोचर प्रभावांबद्दल जाणून घ्या." },
        mercury: { title: "बुध गोचर {year}", description: "बुध वक्री कालावधी संवाद, तंत्रज्ञान आणि प्रवासावर परिणाम करतात.", summary: "{year} मध्ये बुध वक्री तारखा ट्रॅक करा." },
        viewDetails: "तपशील पहा",
        eclipses: { title: "ग्रहण {year}", description: "सूर्य आणि चंद्र ग्रहणाच्या तारखा, वेळा आणि त्यांचे ज्योतिष महत्त्व." },
        viewEclipses: "ग्रहण कॅलेंडर पहा",
        festivals: { title: "सण कॅलेंडर {year}", description: "पंचांगावर आधारित महत्त्वाचे हिंदू सण, मुहूर्त आणि शुभ तारखा." },
        viewFestivals: "सण कॅलेंडर पहा",
        personalizedTitle: "वैयक्तिकृत गोचर विश्लेषण मिळवा",
        personalizedDescription: "तुमच्या अचूक जन्म चार्टवर आधारित.",
        generateKundli: "मोफत कुंडली तयार करा",
        transitCalculator: "गोचर कॅल्क्युलेटर",
        planetaryTracker: "लाइव्ह ग्रह स्थिती"
      }
    }
  },
  gu: {
    doshas: {
      index: {
        badge: "વૈદિક જ્યોતિષ",
        title: "વૈદિક જ્યોતિષમાં દોષ",
        subtitle: "તમારી જન્મકુંડળીમાં વિવિધ દોષો, જીવન પર તેમની અસરો અને તેમની નકારાત્મક અસરો ઘટાડવા માટે અસરકારક ઉપાયો વિશે જાણો.",
        whatAreDoshas: "દોષ શું છે?",
        description: "વૈદિક જ્યોતિષમાં, દોષ એ જન્મકુંડળીમાં પ્રતિકૂળ ગ્રહ સંયોજનો અથવા સ્થાનો છે જે જીવનના ચોક્કસ ક્ષેત્રોમાં પડકારો સર્જી શકે છે.",
        mangalDosh: { title: "મંગળ દોષ", badge: "કુજ દોષ", description: "મંગળ જન્મકુંડળીના ચોક્કસ ભાવમાં હોય ત્યારે મંગળ દોષ થાય છે. તે લગ્ન અને સંબંધોને અસર કરી શકે છે." },
        kaalSarpDosh: { title: "કાળ સર્પ દોષ", badge: "સર્પ દોષ", description: "બધા ગ્રહો રાહુ અને કેતુ વચ્ચે હોય ત્યારે કાળ સર્પ દોષ થાય છે." },
        sadeSati: { title: "સાડા સાતી", badge: "શનિ ગોચર", description: "સાડા સાતી એ ૭.૫ વર્ષનો સમયગાળો છે જ્યારે શનિ તમારી ચંદ્ર રાશિથી ૧૨મા, ૧લા અને ૨જા ભાવમાંથી પસાર થાય છે." },
        pitraDosh: { title: "પિતૃ દોષ", badge: "પૂર્વજોનું કર્મ", description: "પિતૃ દોષ તમારા જીવનને અસર કરતા પૂર્વજોના કર્મનો સંકેત આપે છે." },
        learnMore: "વધુ જાણો",
        checkYourChart: "દોષ માટે તમારી કુંડળી તપાસો",
        checkDescription: "તમારી કુંડળીમાં કોઈપણ દોષ ઓળખવા માટે તમારી મફત કુંડળી બનાવો.",
        generateKundli: "મફત કુંડળી બનાવો",
        checkMangalDosh: "મંગળ દોષ તપાસો",
        checkSadeSati: "સાડા સાતી તપાસો"
      }
    },
    horoscope: {
      index: {
        badge: "વૈદિક જ્યોતિષ",
        title: "રાશિફળ આગાહી",
        subtitle: "વૈદિક જ્યોતિષ પર આધારિત સચોટ રાશિફળ આગાહી મેળવો. બધી ૧૨ રાશિઓ માટે દૈનિક, સાપ્તાહિક, માસિક અથવા વાર્ષિક રાશિફળમાંથી પસંદ કરો.",
        types: {
          daily: { title: "દૈનિક રાશિફળ", description: "ગ્રહ ગોચર અને તમારી રાશિ પર આધારિત તમારી દૈનિક આગાહી મેળવો." },
          weekly: { title: "સાપ્તાહિક રાશિફળ", description: "વિગતવાર સાપ્તાહિક જ્યોતિષ આગાહી સાથે તમારું અઠવાડિયું આયોજન કરો." },
          monthly: { title: "માસિક રાશિફળ", description: "જીવનના બધા પાસાઓ માટે વ્યાપક માસિક આગાહી." },
          yearly: { title: "વાર્ષિક રાશિફળ", description: "વિગતવાર આંતરદૃષ્ટિ અને માર્ગદર્શન સાથે સંપૂર્ણ વર્ષની આગાહી." }
        },
        viewHoroscope: "રાશિફળ જુઓ",
        aboutTitle: "વૈદિક રાશિફળ વિશે",
        aboutDescription: "અમારી રાશિફળ આગાહી વૈદિક જ્યોતિષ પર આધારિત છે.",
        selectSign: "તમારી રાશિ પસંદ કરો",
        personalizedTitle: "વ્યક્તિગત આગાહી મેળવો",
        personalizedDescription: "તમારી સચોટ જન્મ વિગતો પર આધારિત વધુ સચોટ આગાહી માટે.",
        generateKundli: "મફત કુંડળી બનાવો",
        consultAstrologer: "જ્યોતિષીની સલાહ લો"
      },
      signs: {
        aries: "મેષ", taurus: "વૃષભ", gemini: "મિથુન", cancer: "કર્ક",
        leo: "સિંહ", virgo: "કન્યા", libra: "તુલા", scorpio: "વૃશ્ચિક",
        sagittarius: "ધન", capricorn: "મકર", aquarius: "કુંભ", pisces: "મીન"
      },
      yearly: {
        notFound: "રાશિ મળી નથી",
        notFoundDesc: "તમે શોધી રહ્યા છો તે રાશિ અસ્તિત્વમાં નથી.",
        backToHoroscope: "રાશિફળ પર પાછા જાઓ",
        badge: "{year} રાશિફળ",
        title: {
          aries: "મેષ રાશિફળ {year}", taurus: "વૃષભ રાશિફળ {year}",
          gemini: "મિથુન રાશિફળ {year}", cancer: "કર્ક રાશિફળ {year}",
          leo: "સિંહ રાશિફળ {year}", virgo: "કન્યા રાશિફળ {year}",
          libra: "તુલા રાશિફળ {year}", scorpio: "વૃશ્ચિક રાશિફળ {year}",
          sagittarius: "ધન રાશિફળ {year}", capricorn: "મકર રાશિફળ {year}",
          aquarius: "કુંભ રાશિફળ {year}", pisces: "મીન રાશિફળ {year}"
        },
        hindi: {
          aries: "મેષ", taurus: "વૃષભ", gemini: "મિથુન", cancer: "કર્ક",
          leo: "સિંહ", virgo: "કન્યા", libra: "તુલા", scorpio: "વૃશ્ચિક",
          sagittarius: "ધન", capricorn: "મકર", aquarius: "કુંભ", pisces: "મીન"
        },
        element: "તત્વ",
        ruler: "સ્વામી",
        ratings: "{year} રેટિંગ",
        labels: { overall: "એકંદર", love: "પ્રેમ", career: "કારકિર્દી", finance: "નાણાકીય", health: "આરોગ્ય" },
        sections: {
          overview: { title: "ઝાંખી {year}" }, love: { title: "પ્રેમ {year}" },
          career: { title: "કારકિર્દી {year}" }, finance: { title: "નાણાકીય {year}" },
          health: { title: "આરોગ્ય {year}" }, family: { title: "કુટુંબ {year}" },
          education: { title: "શિક્ષણ {year}" }, property: { title: "મિલકત {year}" }
        },
        default: {
          overview: "{year} માટે તમારી ઝાંખી આગાહી ગ્રહ ગોચરથી પ્રભાવિત થશે.",
          love: "{year} માટે તમારી પ્રેમ આગાહી ગ્રહ ગોચરથી પ્રભાવિત થશે.",
          career: "{year} માટે તમારી કારકિર્દી આગાહી ગ્રહ ગોચરથી પ્રભાવિત થશે.",
          finance: "{year} માટે તમારી નાણાકીય આગાહી ગ્રહ ગોચરથી પ્રભાવિત થશે.",
          health: "{year} માટે તમારી આરોગ્ય આગાહી ગ્રહ ગોચરથી પ્રભાવિત થશે.",
          family: "{year} માટે તમારી કુટુંબ આગાહી ગ્રહ ગોચરથી પ્રભાવિત થશે.",
          education: "{year} માટે તમારી શિક્ષણ આગાહી ગ્રહ ગોચરથી પ્રભાવિત થશે.",
          property: "{year} માટે તમારી મિલકત આગાહી ગ્રહ ગોચરથી પ્રભાવિત થશે.",
          monthSummary: "ગ્રહ પ્રભાવો આ મહિનાને આકાર આપશે. સંતુલન અને વૃદ્ધિ પર ધ્યાન કેન્દ્રિત કરો."
        },
        monthlyOverview: "માસિક ઝાંખી {year}",
        luckyFactors: "{year} માટે નસીબદાર પરિબળો",
        lucky: { numbers: "નસીબદાર અંકો", colors: "નસીબદાર રંગો", days: "નસીબદાર દિવસો", gemstone: "નસીબદાર રત્ન" },
        personalizedTitle: "વ્યક્તિગત આગાહી મેળવો",
        personalizedDescription: "તમારી સચોટ જન્મ વિગતો પર આધારિત.",
        generateKundli: "મફત કુંડળી બનાવો",
        consultAstrologer: "જ્યોતિષીની સલાહ લો",
        viewAllSigns: "બધી રાશિઓ જુઓ"
      },
      elements: { fire: "અગ્નિ", earth: "પૃથ્વી", air: "વાયુ", water: "જળ" },
      planets: { mars: "મંગળ", venus: "શુક્ર", mercury: "બુધ", moon: "ચંદ્ર", sun: "સૂર્ય", jupiter: "ગુરુ", saturn: "શનિ" },
      months: { january: "જાન્યુઆરી", february: "ફેબ્રુઆરી", march: "માર્ચ", april: "એપ્રિલ", may: "મે", june: "જૂન", july: "જુલાઈ", august: "ઓગસ્ટ", september: "સપ્ટેમ્બર", october: "ઓક્ટોબર", november: "નવેમ્બર", december: "ડિસેમ્બર" }
    },
    transits: {
      index: {
        badge: "વૈદિક જ્યોતિષ",
        title: "ગ્રહ ગોચર {year}",
        subtitle: "{year}માં મુખ્ય ગ્રહ ગોચર તમારી રાશિને કેવી રીતે અસર કરશે તે શોધો.",
        whatAreTransits: "ગ્રહ ગોચર શું છે?",
        description: "વૈદિક જ્યોતિષમાં, ગ્રહ ગોચર વિવિધ રાશિઓમાંથી ગ્રહોની ગતિનો સંદર્ભ આપે છે.",
        jupiter: { title: "ગુરુ ગોચર {year}", description: "ગુરુ, જ્ઞાન અને વિસ્તરણનો ગ્રહ, જ્યાં ગોચર કરે છે ત્યાં વૃદ્ધિ અને તકો લાવે છે.", summary: "{year}માં ગુરુની ગતિ કેવી રીતે આશીર્વાદ અને વિસ્તરણ લાવશે તે શોધો." },
        saturn: { title: "શનિ ગોચર {year}", description: "શનિ, કર્મ અને શિસ્તનો ગ્રહ, તેના ગોચરમાં મહત્વપૂર્ણ જીવન પાઠ શીખવે છે.", summary: "{year}માં શનિ ગોચર અસરો વિશે જાણો." },
        mercury: { title: "બુધ ગોચર {year}", description: "બુધ વક્રી સમયગાળા સંચાર, ટેકનોલોજી અને મુસાફરીને અસર કરે છે.", summary: "{year}માં બુધ વક્રી તારીખો ટ્રેક કરો." },
        viewDetails: "વિગતો જુઓ",
        eclipses: { title: "ગ્રહણ {year}", description: "સૂર્ય અને ચંદ્ર ગ્રહણની તારીખો, સમય અને તેમનું જ્યોતિષ મહત્વ." },
        viewEclipses: "ગ્રહણ કેલેન્ડર જુઓ",
        festivals: { title: "તહેવાર કેલેન્ડર {year}", description: "પંચાંગ પર આધારિત મહત્વપૂર્ણ હિંદુ તહેવારો, મુહૂર્ત અને શુભ તારીખો." },
        viewFestivals: "તહેવાર કેલેન્ડર જુઓ",
        personalizedTitle: "વ્યક્તિગત ગોચર વિશ્લેષણ મેળવો",
        personalizedDescription: "તમારી સચોટ જન્મ ચાર્ટ પર આધારિત.",
        generateKundli: "મફત કુંડળી બનાવો",
        transitCalculator: "ગોચર કેલ્ક્યુલેટર",
        planetaryTracker: "લાઇવ ગ્રહ સ્થિતિ"
      }
    }
  },
  kn: {
    doshas: {
      index: {
        badge: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ",
        title: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ದೋಷಗಳು",
        subtitle: "ನಿಮ್ಮ ಜನ್ಮಕುಂಡಲಿಯಲ್ಲಿನ ವಿವಿಧ ದೋಷಗಳು, ಜೀವನದ ಮೇಲೆ ಅವುಗಳ ಪರಿಣಾಮಗಳು ಮತ್ತು ಅವುಗಳ ನಕಾರಾತ್ಮಕ ಪರಿಣಾಮಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಪರಿಣಾಮಕಾರಿ ಪರಿಹಾರಗಳ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ.",
        whatAreDoshas: "ದೋಷಗಳು ಎಂದರೇನು?",
        description: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ, ದೋಷಗಳು ಜನ್ಮಕುಂಡಲಿಯಲ್ಲಿನ ಪ್ರತಿಕೂಲ ಗ್ರಹ ಸಂಯೋಜನೆಗಳು ಅಥವಾ ಸ್ಥಾನಗಳಾಗಿವೆ, ಅವು ಜೀವನದ ನಿರ್ದಿಷ್ಟ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಸವಾಲುಗಳನ್ನು ಸೃಷ್ಟಿಸಬಹುದು.",
        mangalDosh: { title: "ಮಂಗಳ ದೋಷ", badge: "ಕುಜ ದೋಷ", description: "ಮಂಗಳ ಜನ್ಮಕುಂಡಲಿಯ ನಿರ್ದಿಷ್ಟ ಭಾವಗಳಲ್ಲಿ ಇರುವಾಗ ಮಂಗಳ ದೋಷ ಉಂಟಾಗುತ್ತದೆ. ಇದು ವಿವಾಹ ಮತ್ತು ಸಂಬಂಧಗಳ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು." },
        kaalSarpDosh: { title: "ಕಾಲ ಸರ್ಪ ದೋಷ", badge: "ಸರ್ಪ ದೋಷ", description: "ಎಲ್ಲಾ ಗ್ರಹಗಳು ರಾಹು ಮತ್ತು ಕೇತುವಿನ ನಡುವೆ ಇರುವಾಗ ಕಾಲ ಸರ್ಪ ದೋಷ ಉಂಟಾಗುತ್ತದೆ." },
        sadeSati: { title: "ಸಾಡೆ ಸಾತಿ", badge: "ಶನಿ ಗೋಚಾರ", description: "ಸಾಡೆ ಸಾತಿ ೭.೫ ವರ್ಷಗಳ ಅವಧಿಯಾಗಿದ್ದು, ಶನಿ ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ ೧೨ನೇ, ೧ನೇ ಮತ್ತು ೨ನೇ ಭಾವಗಳ ಮೂಲಕ ಸಂಚರಿಸುತ್ತದೆ." },
        pitraDosh: { title: "ಪಿತೃ ದೋಷ", badge: "ಪೂರ್ವಜರ ಕರ್ಮ", description: "ಪಿತೃ ದೋಷ ನಿಮ್ಮ ಜೀವನದ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರುವ ಪೂರ್ವಜರ ಕರ್ಮವನ್ನು ಸೂಚಿಸುತ್ತದೆ." },
        learnMore: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
        checkYourChart: "ದೋಷಗಳಿಗಾಗಿ ನಿಮ್ಮ ಕುಂಡಲಿಯನ್ನು ಪರಿಶೀಲಿಸಿ",
        checkDescription: "ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಯಾವುದೇ ದೋಷಗಳನ್ನು ಗುರುತಿಸಲು ನಿಮ್ಮ ಉಚಿತ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ.",
        generateKundli: "ಉಚಿತ ಕುಂಡಲಿ ರಚಿಸಿ",
        checkMangalDosh: "ಮಂಗಳ ದೋಷ ಪರಿಶೀಲಿಸಿ",
        checkSadeSati: "ಸಾಡೆ ಸಾತಿ ಪರಿಶೀಲಿಸಿ"
      }
    },
    horoscope: {
      index: {
        badge: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ",
        title: "ರಾಶಿಫಲ ಭವಿಷ್ಯ",
        subtitle: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದ ಆಧಾರದ ಮೇಲೆ ನಿಖರವಾದ ರಾಶಿಫಲ ಭವಿಷ್ಯವನ್ನು ಪಡೆಯಿರಿ. ಎಲ್ಲಾ ೧೨ ರಾಶಿಗಳಿಗೆ ದೈನಿಕ, ಸಾಪ್ತಾಹಿಕ, ಮಾಸಿಕ ಅಥವಾ ವಾರ್ಷಿಕ ರಾಶಿಫಲದಿಂದ ಆಯ್ಕೆ ಮಾಡಿ.",
        types: {
          daily: { title: "ದೈನಿಕ ರಾಶಿಫಲ", description: "ಗ್ರಹ ಗೋಚಾರ ಮತ್ತು ನಿಮ್ಮ ರಾಶಿಯ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ದೈನಿಕ ಭವಿಷ್ಯವನ್ನು ಪಡೆಯಿರಿ." },
          weekly: { title: "ಸಾಪ್ತಾಹಿಕ ರಾಶಿಫಲ", description: "ವಿವರವಾದ ಸಾಪ್ತಾಹಿಕ ಜ್ಯೋತಿಷ್ಯ ಭವಿಷ್ಯದೊಂದಿಗೆ ನಿಮ್ಮ ವಾರವನ್ನು ಯೋಜಿಸಿ." },
          monthly: { title: "ಮಾಸಿಕ ರಾಶಿಫಲ", description: "ಜೀವನದ ಎಲ್ಲಾ ಅಂಶಗಳಿಗೆ ಸಮಗ್ರ ಮಾಸಿಕ ಭವಿಷ್ಯ." },
          yearly: { title: "ವಾರ್ಷಿಕ ರಾಶಿಫಲ", description: "ವಿವರವಾದ ಒಳನೋಟಗಳು ಮತ್ತು ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಸಂಪೂರ್ಣ ವರ್ಷದ ಭವಿಷ್ಯ." }
        },
        viewHoroscope: "ರಾಶಿಫಲ ನೋಡಿ",
        aboutTitle: "ವೈದಿಕ ರಾಶಿಫಲಗಳ ಬಗ್ಗೆ",
        aboutDescription: "ನಮ್ಮ ರಾಶಿಫಲ ಭವಿಷ್ಯಗಳು ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದ ಆಧಾರದ ಮೇಲೆ ಇವೆ.",
        selectSign: "ನಿಮ್ಮ ರಾಶಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
        personalizedTitle: "ವೈಯಕ್ತಿಕ ಭವಿಷ್ಯವನ್ನು ಪಡೆಯಿರಿ",
        personalizedDescription: "ನಿಮ್ಮ ನಿಖರವಾದ ಜನ್ಮ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ ಹೆಚ್ಚು ನಿಖರವಾದ ಭವಿಷ್ಯಕ್ಕಾಗಿ.",
        generateKundli: "ಉಚಿತ ಕುಂಡಲಿ ರಚಿಸಿ",
        consultAstrologer: "ಜ್ಯೋತಿಷಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ"
      },
      signs: {
        aries: "ಮೇಷ", taurus: "ವೃಷಭ", gemini: "ಮಿಥುನ", cancer: "ಕರ್ಕಾಟಕ",
        leo: "ಸಿಂಹ", virgo: "ಕನ್ಯಾ", libra: "ತುಲಾ", scorpio: "ವೃಶ್ಚಿಕ",
        sagittarius: "ಧನು", capricorn: "ಮಕರ", aquarius: "ಕುಂಭ", pisces: "ಮೀನ"
      },
      yearly: {
        notFound: "ರಾಶಿ ಕಂಡುಬಂದಿಲ್ಲ",
        notFoundDesc: "ನೀವು ಹುಡುಕುತ್ತಿರುವ ರಾಶಿ ಅಸ್ತಿತ್ವದಲ್ಲಿಲ್ಲ.",
        backToHoroscope: "ರಾಶಿಫಲಕ್ಕೆ ಹಿಂತಿರುಗಿ",
        badge: "{year} ರಾಶಿಫಲ",
        title: {
          aries: "ಮೇಷ ರಾಶಿಫಲ {year}", taurus: "ವೃಷಭ ರಾಶಿಫಲ {year}",
          gemini: "ಮಿಥುನ ರಾಶಿಫಲ {year}", cancer: "ಕರ್ಕಾಟಕ ರಾಶಿಫಲ {year}",
          leo: "ಸಿಂಹ ರಾಶಿಫಲ {year}", virgo: "ಕನ್ಯಾ ರಾಶಿಫಲ {year}",
          libra: "ತುಲಾ ರಾಶಿಫಲ {year}", scorpio: "ವೃಶ್ಚಿಕ ರಾಶಿಫಲ {year}",
          sagittarius: "ಧನು ರಾಶಿಫಲ {year}", capricorn: "ಮಕರ ರಾಶಿಫಲ {year}",
          aquarius: "ಕುಂಭ ರಾಶಿಫಲ {year}", pisces: "ಮೀನ ರಾಶಿಫಲ {year}"
        },
        hindi: {
          aries: "ಮೇಷ", taurus: "ವೃಷಭ", gemini: "ಮಿಥುನ", cancer: "ಕರ್ಕಾಟಕ",
          leo: "ಸಿಂಹ", virgo: "ಕನ್ಯಾ", libra: "ತುಲಾ", scorpio: "ವೃಶ್ಚಿಕ",
          sagittarius: "ಧನು", capricorn: "ಮಕರ", aquarius: "ಕುಂಭ", pisces: "ಮೀನ"
        },
        element: "ತತ್ವ",
        ruler: "ಅಧಿಪತಿ",
        ratings: "{year} ರೇಟಿಂಗ್‌ಗಳು",
        labels: { overall: "ಒಟ್ಟಾರೆ", love: "ಪ್ರೀತಿ", career: "ವೃತ್ತಿ", finance: "ಹಣಕಾಸು", health: "ಆರೋಗ್ಯ" },
        sections: {
          overview: { title: "ಅವಲೋಕನ {year}" }, love: { title: "ಪ್ರೀತಿ {year}" },
          career: { title: "ವೃತ್ತಿ {year}" }, finance: { title: "ಹಣಕಾಸು {year}" },
          health: { title: "ಆರೋಗ್ಯ {year}" }, family: { title: "ಕುಟುಂಬ {year}" },
          education: { title: "ಶಿಕ್ಷಣ {year}" }, property: { title: "ಆಸ್ತಿ {year}" }
        },
        default: {
          overview: "{year} ಗಾಗಿ ನಿಮ್ಮ ಅವಲೋಕನ ಭವಿಷ್ಯ ಗ್ರಹ ಗೋಚಾರಗಳಿಂದ ಪ್ರಭಾವಿತವಾಗುತ್ತದೆ.",
          love: "{year} ಗಾಗಿ ನಿಮ್ಮ ಪ್ರೀತಿ ಭವಿಷ್ಯ ಗ್ರಹ ಗೋಚಾರಗಳಿಂದ ಪ್ರಭಾವಿತವಾಗುತ್ತದೆ.",
          career: "{year} ಗಾಗಿ ನಿಮ್ಮ ವೃತ್ತಿ ಭವಿಷ್ಯ ಗ್ರಹ ಗೋಚಾರಗಳಿಂದ ಪ್ರಭಾವಿತವಾಗುತ್ತದೆ.",
          finance: "{year} ಗಾಗಿ ನಿಮ್ಮ ಹಣಕಾಸು ಭವಿಷ್ಯ ಗ್ರಹ ಗೋಚಾರಗಳಿಂದ ಪ್ರಭಾವಿತವಾಗುತ್ತದೆ.",
          health: "{year} ಗಾಗಿ ನಿಮ್ಮ ಆರೋಗ್ಯ ಭವಿಷ್ಯ ಗ್ರಹ ಗೋಚಾರಗಳಿಂದ ಪ್ರಭಾವಿತವಾಗುತ್ತದೆ.",
          family: "{year} ಗಾಗಿ ನಿಮ್ಮ ಕುಟುಂಬ ಭವಿಷ್ಯ ಗ್ರಹ ಗೋಚಾರಗಳಿಂದ ಪ್ರಭಾವಿತವಾಗುತ್ತದೆ.",
          education: "{year} ಗಾಗಿ ನಿಮ್ಮ ಶಿಕ್ಷಣ ಭವಿಷ್ಯ ಗ್ರಹ ಗೋಚಾರಗಳಿಂದ ಪ್ರಭಾವಿತವಾಗುತ್ತದೆ.",
          property: "{year} ಗಾಗಿ ನಿಮ್ಮ ಆಸ್ತಿ ಭವಿಷ್ಯ ಗ್ರಹ ಗೋಚಾರಗಳಿಂದ ಪ್ರಭಾವಿತವಾಗುತ್ತದೆ.",
          monthSummary: "ಗ್ರಹ ಪ್ರಭಾವಗಳು ಈ ತಿಂಗಳನ್ನು ರೂಪಿಸುತ್ತವೆ. ಸಮತೋಲನ ಮತ್ತು ಬೆಳವಣಿಗೆಯ ಮೇಲೆ ಗಮನ ಕೇಂದ್ರೀಕರಿಸಿ."
        },
        monthlyOverview: "ಮಾಸಿಕ ಅವಲೋಕನ {year}",
        luckyFactors: "{year} ಗಾಗಿ ಅದೃಷ್ಟ ಅಂಶಗಳು",
        lucky: { numbers: "ಅದೃಷ್ಟ ಸಂಖ್ಯೆಗಳು", colors: "ಅದೃಷ್ಟ ಬಣ್ಣಗಳು", days: "ಅದೃಷ್ಟ ದಿನಗಳು", gemstone: "ಅದೃಷ್ಟ ರತ್ನ" },
        personalizedTitle: "ವೈಯಕ್ತಿಕ ಭವಿಷ್ಯವನ್ನು ಪಡೆಯಿರಿ",
        personalizedDescription: "ನಿಮ್ಮ ನಿಖರವಾದ ಜನ್ಮ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ.",
        generateKundli: "ಉಚಿತ ಕುಂಡಲಿ ರಚಿಸಿ",
        consultAstrologer: "ಜ್ಯೋತಿಷಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ",
        viewAllSigns: "ಎಲ್ಲಾ ರಾಶಿಗಳನ್ನು ನೋಡಿ"
      },
      elements: { fire: "ಅಗ್ನಿ", earth: "ಭೂಮಿ", air: "ವಾಯು", water: "ಜಲ" },
      planets: { mars: "ಮಂಗಳ", venus: "ಶುಕ್ರ", mercury: "ಬುಧ", moon: "ಚಂದ್ರ", sun: "ಸೂರ್ಯ", jupiter: "ಗುರು", saturn: "ಶನಿ" },
      months: { january: "ಜನವರಿ", february: "ಫೆಬ್ರವರಿ", march: "ಮಾರ್ಚ್", april: "ಏಪ್ರಿಲ್", may: "ಮೇ", june: "ಜೂನ್", july: "ಜುಲೈ", august: "ಆಗಸ್ಟ್", september: "ಸೆಪ್ಟೆಂಬರ್", october: "ಅಕ್ಟೋಬರ್", november: "ನವೆಂಬರ್", december: "ಡಿಸೆಂಬರ್" }
    },
    transits: {
      index: {
        badge: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ",
        title: "ಗ್ರಹ ಗೋಚಾರ {year}",
        subtitle: "{year} ರಲ್ಲಿ ಪ್ರಮುಖ ಗ್ರಹ ಗೋಚಾರಗಳು ನಿಮ್ಮ ರಾಶಿಯ ಮೇಲೆ ಹೇಗೆ ಪರಿಣಾಮ ಬೀರುತ್ತವೆ ಎಂಬುದನ್ನು ಅನ್ವೇಷಿಸಿ.",
        whatAreTransits: "ಗ್ರಹ ಗೋಚಾರಗಳು ಎಂದರೇನು?",
        description: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ, ಗ್ರಹ ಗೋಚಾರಗಳು ವಿವಿಧ ರಾಶಿಗಳ ಮೂಲಕ ಗ್ರಹಗಳ ಚಲನೆಯನ್ನು ಸೂಚಿಸುತ್ತವೆ.",
        jupiter: { title: "ಗುರು ಗೋಚಾರ {year}", description: "ಗುರು, ಜ್ಞಾನ ಮತ್ತು ವಿಸ್ತರಣೆಯ ಗ್ರಹ, ಅದು ಸಂಚರಿಸುವ ಸ್ಥಳದಲ್ಲಿ ಬೆಳವಣಿಗೆ ಮತ್ತು ಅವಕಾಶಗಳನ್ನು ತರುತ್ತದೆ.", summary: "{year} ರಲ್ಲಿ ಗುರುವಿನ ಚಲನೆ ಹೇಗೆ ಆಶೀರ್ವಾದ ಮತ್ತು ವಿಸ್ತರಣೆಯನ್ನು ತರುತ್ತದೆ ಎಂಬುದನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ." },
        saturn: { title: "ಶನಿ ಗೋಚಾರ {year}", description: "ಶನಿ, ಕರ್ಮ ಮತ್ತು ಶಿಸ್ತಿನ ಗ್ರಹ, ಅದರ ಗೋಚಾರದಲ್ಲಿ ಮಹತ್ವದ ಜೀವನ ಪಾಠಗಳನ್ನು ಕಲಿಸುತ್ತದೆ.", summary: "{year} ರಲ್ಲಿ ಶನಿ ಗೋಚಾರ ಪರಿಣಾಮಗಳ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ." },
        mercury: { title: "ಬುಧ ಗೋಚಾರ {year}", description: "ಬುಧ ವಕ್ರ ಅವಧಿಗಳು ಸಂವಹನ, ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಪ್ರಯಾಣದ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರುತ್ತವೆ.", summary: "{year} ರಲ್ಲಿ ಬುಧ ವಕ್ರ ದಿನಾಂಕಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ." },
        viewDetails: "ವಿವರಗಳನ್ನು ನೋಡಿ",
        eclipses: { title: "ಗ್ರಹಣಗಳು {year}", description: "ಸೂರ್ಯ ಮತ್ತು ಚಂದ್ರ ಗ್ರಹಣಗಳ ದಿನಾಂಕಗಳು, ಸಮಯಗಳು ಮತ್ತು ಅವುಗಳ ಜ್ಯೋತಿಷ್ಯ ಮಹತ್ವ." },
        viewEclipses: "ಗ್ರಹಣ ಕ್ಯಾಲೆಂಡರ್ ನೋಡಿ",
        festivals: { title: "ಹಬ್ಬಗಳ ಕ್ಯಾಲೆಂಡರ್ {year}", description: "ಪಂಚಾಂಗದ ಆಧಾರದ ಮೇಲೆ ಪ್ರಮುಖ ಹಿಂದೂ ಹಬ್ಬಗಳು, ಮುಹೂರ್ತಗಳು ಮತ್ತು ಶುಭ ದಿನಾಂಕಗಳು." },
        viewFestivals: "ಹಬ್ಬಗಳ ಕ್ಯಾಲೆಂಡರ್ ನೋಡಿ",
        personalizedTitle: "ವೈಯಕ್ತಿಕ ಗೋಚಾರ ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಿರಿ",
        personalizedDescription: "ನಿಮ್ಮ ನಿಖರವಾದ ಜನ್ಮ ಚಾರ್ಟ್ ಆಧಾರದ ಮೇಲೆ.",
        generateKundli: "ಉಚಿತ ಕುಂಡಲಿ ರಚಿಸಿ",
        transitCalculator: "ಗೋಚಾರ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        planetaryTracker: "ಲೈವ್ ಗ್ರಹ ಸ್ಥಾನಗಳು"
      }
    }
  },
  ml: {
    doshas: {
      index: {
        badge: "വൈദിക ജ്യോതിഷം",
        title: "വൈദിക ജ്യോതിഷത്തിലെ ദോഷങ്ങൾ",
        subtitle: "നിങ്ങളുടെ ജനനകുണ്ഡലിയിലെ വിവിധ ദോഷങ്ങൾ, ജീവിതത്തിൽ അവയുടെ സ്വാധീനം, അവയുടെ നെഗറ്റീവ് ഫലങ്ങൾ കുറയ്ക്കാനുള്ള ഫലപ്രദമായ പരിഹാരങ്ങൾ എന്നിവയെക്കുറിച്ച് അറിയുക.",
        whatAreDoshas: "ദോഷങ്ങൾ എന്താണ്?",
        description: "വൈദിക ജ്യോതിഷത്തിൽ, ദോഷങ്ങൾ ജനനകുണ്ഡലിയിലെ പ്രതികൂല ഗ്രഹ സംയോജനങ്ങളോ സ്ഥാനങ്ങളോ ആണ്, അവ ജീവിതത്തിന്റെ പ്രത്യേക മേഖലകളിൽ വെല്ലുവിളികൾ സൃഷ്ടിക്കാം.",
        mangalDosh: { title: "മംഗൾ ദോഷം", badge: "കുജ ദോഷം", description: "ചൊവ്വ ജനനകുണ്ഡലിയുടെ പ്രത്യേക ഭാവങ്ങളിൽ ഇരിക്കുമ്പോൾ മംഗൾ ദോഷം ഉണ്ടാകുന്നു. ഇത് വിവാഹത്തെയും ബന്ധങ്ങളെയും ബാധിക്കാം." },
        kaalSarpDosh: { title: "കാൽ സർപ്പ ദോഷം", badge: "സർപ്പ ദോഷം", description: "എല്ലാ ഗ്രഹങ്ങളും രാഹുവിനും കേതുവിനും ഇടയിൽ ഇരിക്കുമ്പോൾ കാൽ സർപ്പ ദോഷം ഉണ്ടാകുന്നു." },
        sadeSati: { title: "സാഡേ സാതി", badge: "ശനി ഗോചരം", description: "സാഡേ സാതി 7.5 വർഷത്തെ കാലഘട്ടമാണ്, ശനി നിങ്ങളുടെ ചന്ദ്ര രാശിയിൽ നിന്ന് 12-ാം, 1-ാം, 2-ാം ഭാവങ്ങളിലൂടെ സഞ്ചരിക്കുന്നു." },
        pitraDosh: { title: "പിതൃ ദോഷം", badge: "പൂർവ്വികരുടെ കർമ്മം", description: "പിതൃ ദോഷം നിങ്ങളുടെ ജീവിതത്തെ ബാധിക്കുന്ന പൂർവ്വികരുടെ കർമ്മത്തെ സൂചിപ്പിക്കുന്നു." },
        learnMore: "കൂടുതൽ അറിയുക",
        checkYourChart: "ദോഷങ്ങൾക്കായി നിങ്ങളുടെ കുണ്ഡലി പരിശോധിക്കുക",
        checkDescription: "നിങ്ങളുടെ കുണ്ഡലിയിൽ ഏതെങ്കിലും ദോഷങ്ങൾ തിരിച്ചറിയാൻ നിങ്ങളുടെ സൗജന്യ കുണ്ഡലി സൃഷ്ടിക്കുക.",
        generateKundli: "സൗജന്യ കുണ്ഡലി സൃഷ്ടിക്കുക",
        checkMangalDosh: "മംഗൾ ദോഷം പരിശോധിക്കുക",
        checkSadeSati: "സാഡേ സാതി പരിശോധിക്കുക"
      }
    },
    horoscope: {
      index: {
        badge: "വൈദിക ജ്യോതിഷം",
        title: "രാശിഫലം പ്രവചനം",
        subtitle: "വൈദിക ജ്യോതിഷത്തെ അടിസ്ഥാനമാക്കി കൃത്യമായ രാശിഫലം പ്രവചനം നേടുക. എല്ലാ 12 രാശികൾക്കും ദൈനംദിന, പ്രതിവാര, മാസിക അല്ലെങ്കിൽ വാർഷിക രാശിഫലത്തിൽ നിന്ന് തിരഞ്ഞെടുക്കുക.",
        types: {
          daily: { title: "ദൈനംദിന രാശിഫലം", description: "ഗ്രഹ ഗോചരവും നിങ്ങളുടെ രാശിയും അടിസ്ഥാനമാക്കി നിങ്ങളുടെ ദൈനംദിന പ്രവചനം നേടുക." },
          weekly: { title: "പ്രതിവാര രാശിഫലം", description: "വിശദമായ പ്രതിവാര ജ്യോതിഷ പ്രവചനത്തോടെ നിങ്ങളുടെ ആഴ്ച ആസൂത്രണം ചെയ്യുക." },
          monthly: { title: "മാസിക രാശിഫലം", description: "ജീവിതത്തിന്റെ എല്ലാ വശങ്ങൾക്കും സമഗ്രമായ മാസിക പ്രവചനം." },
          yearly: { title: "വാർഷിക രാശിഫലം", description: "വിശദമായ ഉൾക്കാഴ്ചകളും മാർഗ്ഗനിർദ്ദേശവും ഉള്ള മുഴുവൻ വർഷത്തെ പ്രവചനം." }
        },
        viewHoroscope: "രാശിഫലം കാണുക",
        aboutTitle: "വൈദിക രാശിഫലങ്ങളെക്കുറിച്ച്",
        aboutDescription: "ഞങ്ങളുടെ രാശിഫലം പ്രവചനങ്ങൾ വൈദിക ജ്യോതിഷത്തെ അടിസ്ഥാനമാക്കിയുള്ളതാണ്.",
        selectSign: "നിങ്ങളുടെ രാശി തിരഞ്ഞെടുക്കുക",
        personalizedTitle: "വ്യക്തിഗത പ്രവചനം നേടുക",
        personalizedDescription: "നിങ്ങളുടെ കൃത്യമായ ജനന വിവരങ്ങളെ അടിസ്ഥാനമാക്കി കൂടുതൽ കൃത്യമായ പ്രവചനത്തിനായി.",
        generateKundli: "സൗജന്യ കുണ്ഡലി സൃഷ്ടിക്കുക",
        consultAstrologer: "ജ്യോതിഷിയെ സമീപിക്കുക"
      },
      signs: {
        aries: "മേടം", taurus: "ഇടവം", gemini: "മിഥുനം", cancer: "കർക്കടകം",
        leo: "ചിങ്ങം", virgo: "കന്നി", libra: "തുലാം", scorpio: "വൃശ്ചികം",
        sagittarius: "ധനു", capricorn: "മകരം", aquarius: "കുംഭം", pisces: "മീനം"
      },
      yearly: {
        notFound: "രാശി കണ്ടെത്തിയില്ല",
        notFoundDesc: "നിങ്ങൾ തിരയുന്ന രാശി നിലവിലില്ല.",
        backToHoroscope: "രാശിഫലത്തിലേക്ക് മടങ്ങുക",
        badge: "{year} രാശിഫലം",
        title: {
          aries: "മേടം രാശിഫലം {year}", taurus: "ഇടവം രാശിഫലം {year}",
          gemini: "മിഥുനം രാശിഫലം {year}", cancer: "കർക്കടകം രാശിഫലം {year}",
          leo: "ചിങ്ങം രാശിഫലം {year}", virgo: "കന്നി രാശിഫലം {year}",
          libra: "തുലാം രാശിഫലം {year}", scorpio: "വൃശ്ചികം രാശിഫലം {year}",
          sagittarius: "ധനു രാശിഫലം {year}", capricorn: "മകരം രാശിഫലം {year}",
          aquarius: "കുംഭം രാശിഫലം {year}", pisces: "മീനം രാശിഫലം {year}"
        },
        hindi: {
          aries: "മേടം", taurus: "ഇടവം", gemini: "മിഥുനം", cancer: "കർക്കടകം",
          leo: "ചിങ്ങം", virgo: "കന്നി", libra: "തുലാം", scorpio: "വൃശ്ചികം",
          sagittarius: "ധനു", capricorn: "മകരം", aquarius: "കുംഭം", pisces: "മീനം"
        },
        element: "മൂലകം",
        ruler: "അധിപതി",
        ratings: "{year} റേറ്റിംഗുകൾ",
        labels: { overall: "മൊത്തത്തിൽ", love: "പ്രണയം", career: "കരിയർ", finance: "സാമ്പത്തികം", health: "ആരോഗ്യം" },
        sections: {
          overview: { title: "അവലോകനം {year}" }, love: { title: "പ്രണയം {year}" },
          career: { title: "കരിയർ {year}" }, finance: { title: "സാമ്പത്തികം {year}" },
          health: { title: "ആരോഗ്യം {year}" }, family: { title: "കുടുംബം {year}" },
          education: { title: "വിദ്യാഭ്യാസം {year}" }, property: { title: "സ്വത്ത് {year}" }
        },
        default: {
          overview: "{year}-ലേക്കുള്ള നിങ്ങളുടെ അവലോകന പ്രവചനം ഗ്രഹ ഗോചരങ്ങളാൽ സ്വാധീനിക്കപ്പെടും.",
          love: "{year}-ലേക്കുള്ള നിങ്ങളുടെ പ്രണയ പ്രവചനം ഗ്രഹ ഗോചരങ്ങളാൽ സ്വാധീനിക്കപ്പെടും.",
          career: "{year}-ലേക്കുള്ള നിങ്ങളുടെ കരിയർ പ്രവചനം ഗ്രഹ ഗോചരങ്ങളാൽ സ്വാധീനിക്കപ്പെടും.",
          finance: "{year}-ലേക്കുള്ള നിങ്ങളുടെ സാമ്പത്തിക പ്രവചനം ഗ്രഹ ഗോചരങ്ങളാൽ സ്വാധീനിക്കപ്പെടും.",
          health: "{year}-ലേക്കുള്ള നിങ്ങളുടെ ആരോഗ്യ പ്രവചനം ഗ്രഹ ഗോചരങ്ങളാൽ സ്വാധീനിക്കപ്പെടും.",
          family: "{year}-ലേക്കുള്ള നിങ്ങളുടെ കുടുംബ പ്രവചനം ഗ്രഹ ഗോചരങ്ങളാൽ സ്വാധീനിക്കപ്പെടും.",
          education: "{year}-ലേക്കുള്ള നിങ്ങളുടെ വിദ്യാഭ്യാസ പ്രവചനം ഗ്രഹ ഗോചരങ്ങളാൽ സ്വാധീനിക്കപ്പെടും.",
          property: "{year}-ലേക്കുള്ള നിങ്ങളുടെ സ്വത്ത് പ്രവചനം ഗ്രഹ ഗോചരങ്ങളാൽ സ്വാധീനിക്കപ്പെടും.",
          monthSummary: "ഗ്രഹ സ്വാധീനങ്ങൾ ഈ മാസത്തെ രൂപപ്പെടുത്തും. സന്തുലിതത്വത്തിലും വളർച്ചയിലും ശ്രദ്ധ കേന്ദ്രീകരിക്കുക."
        },
        monthlyOverview: "മാസിക അവലോകനം {year}",
        luckyFactors: "{year}-ലേക്കുള്ള ഭാഗ്യ ഘടകങ്ങൾ",
        lucky: { numbers: "ഭാഗ്യ നമ്പറുകൾ", colors: "ഭാഗ്യ നിറങ്ങൾ", days: "ഭാഗ്യ ദിവസങ്ങൾ", gemstone: "ഭാഗ്യ രത്നം" },
        personalizedTitle: "വ്യക്തിഗത പ്രവചനം നേടുക",
        personalizedDescription: "നിങ്ങളുടെ കൃത്യമായ ജനന വിവരങ്ങളെ അടിസ്ഥാനമാക്കി.",
        generateKundli: "സൗജന്യ കുണ്ഡലി സൃഷ്ടിക്കുക",
        consultAstrologer: "ജ്യോതിഷിയെ സമീപിക്കുക",
        viewAllSigns: "എല്ലാ രാശികളും കാണുക"
      },
      elements: { fire: "അഗ്നി", earth: "ഭൂമി", air: "വായു", water: "ജലം" },
      planets: { mars: "ചൊവ്വ", venus: "ശുക്രൻ", mercury: "ബുധൻ", moon: "ചന്ദ്രൻ", sun: "സൂര്യൻ", jupiter: "വ്യാഴം", saturn: "ശനി" },
      months: { january: "ജനുവരി", february: "ഫെബ്രുവരി", march: "മാർച്ച്", april: "ഏപ്രിൽ", may: "മെയ്", june: "ജൂൺ", july: "ജൂലൈ", august: "ഓഗസ്റ്റ്", september: "സെപ്റ്റംബർ", october: "ഒക്ടോബർ", november: "നവംബർ", december: "ഡിസംബർ" }
    },
    transits: {
      index: {
        badge: "വൈദിക ജ്യോതിഷം",
        title: "ഗ്രഹ ഗോചരം {year}",
        subtitle: "{year}-ൽ പ്രധാന ഗ്രഹ ഗോചരങ്ങൾ നിങ്ങളുടെ രാശിയെ എങ്ങനെ ബാധിക്കുമെന്ന് കണ്ടെത്തുക.",
        whatAreTransits: "ഗ്രഹ ഗോചരങ്ങൾ എന്താണ്?",
        description: "വൈദിക ജ്യോതിഷത്തിൽ, ഗ്രഹ ഗോചരങ്ങൾ വിവിധ രാശികളിലൂടെയുള്ള ഗ്രഹങ്ങളുടെ ചലനത്തെ സൂചിപ്പിക്കുന്നു.",
        jupiter: { title: "വ്യാഴം ഗോചരം {year}", description: "വ്യാഴം, ജ്ഞാനത്തിന്റെയും വിപുലീകരണത്തിന്റെയും ഗ്രഹം, അത് സഞ്ചരിക്കുന്നിടത്ത് വളർച്ചയും അവസരങ്ങളും കൊണ്ടുവരുന്നു.", summary: "{year}-ൽ വ്യാഴത്തിന്റെ ചലനം എങ്ങനെ അനുഗ്രഹവും വിപുലീകരണവും കൊണ്ടുവരുമെന്ന് കണ്ടെത്തുക." },
        saturn: { title: "ശനി ഗോചരം {year}", description: "ശനി, കർമ്മത്തിന്റെയും അച്ചടക്കത്തിന്റെയും ഗ്രഹം, അതിന്റെ ഗോചരത്തിൽ പ്രധാനപ്പെട്ട ജീവിത പാഠങ്ങൾ പഠിപ്പിക്കുന്നു.", summary: "{year}-ൽ ശനി ഗോചര ഫലങ്ങളെക്കുറിച്ച് അറിയുക." },
        mercury: { title: "ബുധൻ ഗോചരം {year}", description: "ബുധൻ വക്ര കാലഘട്ടങ്ങൾ ആശയവിനിമയം, സാങ്കേതികവിദ്യ, യാത്ര എന്നിവയെ ബാധിക്കുന്നു.", summary: "{year}-ൽ ബുധൻ വക്ര തീയതികൾ ട്രാക്ക് ചെയ്യുക." },
        viewDetails: "വിശദാംശങ്ങൾ കാണുക",
        eclipses: { title: "ഗ്രഹണങ്ങൾ {year}", description: "സൂര്യ, ചന്ദ്ര ഗ്രഹണങ്ങളുടെ തീയതികൾ, സമയങ്ങൾ, അവയുടെ ജ്യോതിഷ പ്രാധാന്യം." },
        viewEclipses: "ഗ്രഹണ കലണ്ടർ കാണുക",
        festivals: { title: "ഉത്സവ കലണ്ടർ {year}", description: "പഞ്ചാംഗത്തെ അടിസ്ഥാനമാക്കി പ്രധാന ഹിന്ദു ഉത്സവങ്ങൾ, മുഹൂർത്തങ്ങൾ, ശുഭ തീയതികൾ." },
        viewFestivals: "ഉത്സവ കലണ്ടർ കാണുക",
        personalizedTitle: "വ്യക്തിഗത ഗോചര വിശകലനം നേടുക",
        personalizedDescription: "നിങ്ങളുടെ കൃത്യമായ ജനന ചാർട്ടിനെ അടിസ്ഥാനമാക്കി.",
        generateKundli: "സൗജന്യ കുണ്ഡലി സൃഷ്ടിക്കുക",
        transitCalculator: "ഗോചര കാൽക്കുലേറ്റർ",
        planetaryTracker: "ലൈവ് ഗ്രഹ സ്ഥാനങ്ങൾ"
      }
    }
  },
  pa: {
    doshas: {
      index: {
        badge: "ਵੈਦਿਕ ਜੋਤਿਸ਼",
        title: "ਵੈਦਿਕ ਜੋਤਿਸ਼ ਵਿੱਚ ਦੋਸ਼",
        subtitle: "ਆਪਣੀ ਜਨਮ ਕੁੰਡਲੀ ਵਿੱਚ ਵੱਖ-ਵੱਖ ਦੋਸ਼ਾਂ, ਜੀਵਨ ਉੱਤੇ ਉਨ੍ਹਾਂ ਦੇ ਪ੍ਰਭਾਵਾਂ ਅਤੇ ਉਨ੍ਹਾਂ ਦੇ ਨਕਾਰਾਤਮਕ ਪ੍ਰਭਾਵਾਂ ਨੂੰ ਘੱਟ ਕਰਨ ਲਈ ਪ੍ਰਭਾਵਸ਼ਾਲੀ ਉਪਾਵਾਂ ਬਾਰੇ ਜਾਣੋ।",
        whatAreDoshas: "ਦੋਸ਼ ਕੀ ਹਨ?",
        description: "ਵੈਦਿਕ ਜੋਤਿਸ਼ ਵਿੱਚ, ਦੋਸ਼ ਜਨਮ ਕੁੰਡਲੀ ਵਿੱਚ ਪ੍ਰਤੀਕੂਲ ਗ੍ਰਹਿ ਸੰਯੋਜਨ ਜਾਂ ਸਥਿਤੀਆਂ ਹਨ ਜੋ ਜੀਵਨ ਦੇ ਖਾਸ ਖੇਤਰਾਂ ਵਿੱਚ ਚੁਣੌਤੀਆਂ ਪੈਦਾ ਕਰ ਸਕਦੀਆਂ ਹਨ।",
        mangalDosh: { title: "ਮੰਗਲ ਦੋਸ਼", badge: "ਕੁਜ ਦੋਸ਼", description: "ਮੰਗਲ ਜਨਮ ਕੁੰਡਲੀ ਦੇ ਖਾਸ ਭਾਵਾਂ ਵਿੱਚ ਹੋਣ ਤੇ ਮੰਗਲ ਦੋਸ਼ ਹੁੰਦਾ ਹੈ। ਇਹ ਵਿਆਹ ਅਤੇ ਰਿਸ਼ਤਿਆਂ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰ ਸਕਦਾ ਹੈ।" },
        kaalSarpDosh: { title: "ਕਾਲ ਸਰਪ ਦੋਸ਼", badge: "ਸਰਪ ਦੋਸ਼", description: "ਸਾਰੇ ਗ੍ਰਹਿ ਰਾਹੂ ਅਤੇ ਕੇਤੂ ਵਿਚਕਾਰ ਹੋਣ ਤੇ ਕਾਲ ਸਰਪ ਦੋਸ਼ ਹੁੰਦਾ ਹੈ।" },
        sadeSati: { title: "ਸਾਢੇ ਸਾਤੀ", badge: "ਸ਼ਨੀ ਗੋਚਰ", description: "ਸਾਢੇ ਸਾਤੀ 7.5 ਸਾਲਾਂ ਦਾ ਸਮਾਂ ਹੈ ਜਦੋਂ ਸ਼ਨੀ ਤੁਹਾਡੀ ਚੰਦਰ ਰਾਸ਼ੀ ਤੋਂ 12ਵੇਂ, 1ਲੇ ਅਤੇ 2ਜੇ ਭਾਵ ਵਿੱਚੋਂ ਲੰਘਦਾ ਹੈ।" },
        pitraDosh: { title: "ਪਿਤਰ ਦੋਸ਼", badge: "ਪੁਰਖਿਆਂ ਦਾ ਕਰਮ", description: "ਪਿਤਰ ਦੋਸ਼ ਤੁਹਾਡੇ ਜੀਵਨ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰਨ ਵਾਲੇ ਪੁਰਖਿਆਂ ਦੇ ਕਰਮ ਨੂੰ ਦਰਸਾਉਂਦਾ ਹੈ।" },
        learnMore: "ਹੋਰ ਜਾਣੋ",
        checkYourChart: "ਦੋਸ਼ਾਂ ਲਈ ਆਪਣੀ ਕੁੰਡਲੀ ਚੈੱਕ ਕਰੋ",
        checkDescription: "ਆਪਣੀ ਕੁੰਡਲੀ ਵਿੱਚ ਕੋਈ ਵੀ ਦੋਸ਼ ਪਛਾਣਨ ਲਈ ਆਪਣੀ ਮੁਫ਼ਤ ਕੁੰਡਲੀ ਬਣਾਓ।",
        generateKundli: "ਮੁਫ਼ਤ ਕੁੰਡਲੀ ਬਣਾਓ",
        checkMangalDosh: "ਮੰਗਲ ਦੋਸ਼ ਚੈੱਕ ਕਰੋ",
        checkSadeSati: "ਸਾਢੇ ਸਾਤੀ ਚੈੱਕ ਕਰੋ"
      }
    },
    horoscope: {
      index: {
        badge: "ਵੈਦਿਕ ਜੋਤਿਸ਼",
        title: "ਰਾਸ਼ੀਫਲ ਭਵਿੱਖਬਾਣੀ",
        subtitle: "ਵੈਦਿਕ ਜੋਤਿਸ਼ ਦੇ ਆਧਾਰ ਤੇ ਸਹੀ ਰਾਸ਼ੀਫਲ ਭਵਿੱਖਬਾਣੀ ਪ੍ਰਾਪਤ ਕਰੋ। ਸਾਰੀਆਂ 12 ਰਾਸ਼ੀਆਂ ਲਈ ਰੋਜ਼ਾਨਾ, ਹਫ਼ਤਾਵਾਰੀ, ਮਾਸਿਕ ਜਾਂ ਸਾਲਾਨਾ ਰਾਸ਼ੀਫਲ ਵਿੱਚੋਂ ਚੁਣੋ।",
        types: {
          daily: { title: "ਰੋਜ਼ਾਨਾ ਰਾਸ਼ੀਫਲ", description: "ਗ੍ਰਹਿ ਗੋਚਰ ਅਤੇ ਤੁਹਾਡੀ ਰਾਸ਼ੀ ਦੇ ਆਧਾਰ ਤੇ ਆਪਣੀ ਰੋਜ਼ਾਨਾ ਭਵਿੱਖਬਾਣੀ ਪ੍ਰਾਪਤ ਕਰੋ।" },
          weekly: { title: "ਹਫ਼ਤਾਵਾਰੀ ਰਾਸ਼ੀਫਲ", description: "ਵਿਸਤ੍ਰਿਤ ਹਫ਼ਤਾਵਾਰੀ ਜੋਤਿਸ਼ ਭਵਿੱਖਬਾਣੀ ਨਾਲ ਆਪਣਾ ਹਫ਼ਤਾ ਯੋਜਨਾਬੱਧ ਕਰੋ।" },
          monthly: { title: "ਮਾਸਿਕ ਰਾਸ਼ੀਫਲ", description: "ਜੀਵਨ ਦੇ ਸਾਰੇ ਪਹਿਲੂਆਂ ਲਈ ਵਿਆਪਕ ਮਾਸਿਕ ਭਵਿੱਖਬਾਣੀ।" },
          yearly: { title: "ਸਾਲਾਨਾ ਰਾਸ਼ੀਫਲ", description: "ਵਿਸਤ੍ਰਿਤ ਸੂਝ ਅਤੇ ਮਾਰਗਦਰਸ਼ਨ ਨਾਲ ਪੂਰੇ ਸਾਲ ਦੀ ਭਵਿੱਖਬਾਣੀ।" }
        },
        viewHoroscope: "ਰਾਸ਼ੀਫਲ ਦੇਖੋ",
        aboutTitle: "ਵੈਦਿਕ ਰਾਸ਼ੀਫਲ ਬਾਰੇ",
        aboutDescription: "ਸਾਡੀਆਂ ਰਾਸ਼ੀਫਲ ਭਵਿੱਖਬਾਣੀਆਂ ਵੈਦਿਕ ਜੋਤਿਸ਼ ਤੇ ਆਧਾਰਿਤ ਹਨ।",
        selectSign: "ਆਪਣੀ ਰਾਸ਼ੀ ਚੁਣੋ",
        personalizedTitle: "ਵਿਅਕਤੀਗਤ ਭਵਿੱਖਬਾਣੀ ਪ੍ਰਾਪਤ ਕਰੋ",
        personalizedDescription: "ਤੁਹਾਡੇ ਸਹੀ ਜਨਮ ਵੇਰਵਿਆਂ ਦੇ ਆਧਾਰ ਤੇ ਵਧੇਰੇ ਸਹੀ ਭਵਿੱਖਬਾਣੀ ਲਈ।",
        generateKundli: "ਮੁਫ਼ਤ ਕੁੰਡਲੀ ਬਣਾਓ",
        consultAstrologer: "ਜੋਤਿਸ਼ੀ ਨਾਲ ਸਲਾਹ ਕਰੋ"
      },
      signs: {
        aries: "ਮੇਖ", taurus: "ਬ੍ਰਿਸ਼ਭ", gemini: "ਮਿਥੁਨ", cancer: "ਕਰਕ",
        leo: "ਸਿੰਘ", virgo: "ਕੰਨਿਆ", libra: "ਤੁਲਾ", scorpio: "ਬ੍ਰਿਸ਼ਚਿਕ",
        sagittarius: "ਧਨੁ", capricorn: "ਮਕਰ", aquarius: "ਕੁੰਭ", pisces: "ਮੀਨ"
      },
      yearly: {
        notFound: "ਰਾਸ਼ੀ ਨਹੀਂ ਮਿਲੀ",
        notFoundDesc: "ਜਿਹੜੀ ਰਾਸ਼ੀ ਤੁਸੀਂ ਲੱਭ ਰਹੇ ਹੋ ਉਹ ਮੌਜੂਦ ਨਹੀਂ ਹੈ।",
        backToHoroscope: "ਰਾਸ਼ੀਫਲ ਤੇ ਵਾਪਸ ਜਾਓ",
        badge: "{year} ਰਾਸ਼ੀਫਲ",
        title: {
          aries: "ਮੇਖ ਰਾਸ਼ੀਫਲ {year}", taurus: "ਬ੍ਰਿਸ਼ਭ ਰਾਸ਼ੀਫਲ {year}",
          gemini: "ਮਿਥੁਨ ਰਾਸ਼ੀਫਲ {year}", cancer: "ਕਰਕ ਰਾਸ਼ੀਫਲ {year}",
          leo: "ਸਿੰਘ ਰਾਸ਼ੀਫਲ {year}", virgo: "ਕੰਨਿਆ ਰਾਸ਼ੀਫਲ {year}",
          libra: "ਤੁਲਾ ਰਾਸ਼ੀਫਲ {year}", scorpio: "ਬ੍ਰਿਸ਼ਚਿਕ ਰਾਸ਼ੀਫਲ {year}",
          sagittarius: "ਧਨੁ ਰਾਸ਼ੀਫਲ {year}", capricorn: "ਮਕਰ ਰਾਸ਼ੀਫਲ {year}",
          aquarius: "ਕੁੰਭ ਰਾਸ਼ੀਫਲ {year}", pisces: "ਮੀਨ ਰਾਸ਼ੀਫਲ {year}"
        },
        hindi: {
          aries: "ਮੇਖ", taurus: "ਬ੍ਰਿਸ਼ਭ", gemini: "ਮਿਥੁਨ", cancer: "ਕਰਕ",
          leo: "ਸਿੰਘ", virgo: "ਕੰਨਿਆ", libra: "ਤੁਲਾ", scorpio: "ਬ੍ਰਿਸ਼ਚਿਕ",
          sagittarius: "ਧਨੁ", capricorn: "ਮਕਰ", aquarius: "ਕੁੰਭ", pisces: "ਮੀਨ"
        },
        element: "ਤੱਤ",
        ruler: "ਸਵਾਮੀ",
        ratings: "{year} ਰੇਟਿੰਗਾਂ",
        labels: { overall: "ਸਮੁੱਚਾ", love: "ਪਿਆਰ", career: "ਕਰੀਅਰ", finance: "ਵਿੱਤ", health: "ਸਿਹਤ" },
        sections: {
          overview: { title: "ਸੰਖੇਪ {year}" }, love: { title: "ਪਿਆਰ {year}" },
          career: { title: "ਕਰੀਅਰ {year}" }, finance: { title: "ਵਿੱਤ {year}" },
          health: { title: "ਸਿਹਤ {year}" }, family: { title: "ਪਰਿਵਾਰ {year}" },
          education: { title: "ਸਿੱਖਿਆ {year}" }, property: { title: "ਜਾਇਦਾਦ {year}" }
        },
        default: {
          overview: "{year} ਲਈ ਤੁਹਾਡੀ ਸੰਖੇਪ ਭਵਿੱਖਬਾਣੀ ਗ੍ਰਹਿ ਗੋਚਰਾਂ ਦੁਆਰਾ ਪ੍ਰਭਾਵਿਤ ਹੋਵੇਗੀ।",
          love: "{year} ਲਈ ਤੁਹਾਡੀ ਪਿਆਰ ਭਵਿੱਖਬਾਣੀ ਗ੍ਰਹਿ ਗੋਚਰਾਂ ਦੁਆਰਾ ਪ੍ਰਭਾਵਿਤ ਹੋਵੇਗੀ।",
          career: "{year} ਲਈ ਤੁਹਾਡੀ ਕਰੀਅਰ ਭਵਿੱਖਬਾਣੀ ਗ੍ਰਹਿ ਗੋਚਰਾਂ ਦੁਆਰਾ ਪ੍ਰਭਾਵਿਤ ਹੋਵੇਗੀ।",
          finance: "{year} ਲਈ ਤੁਹਾਡੀ ਵਿੱਤ ਭਵਿੱਖਬਾਣੀ ਗ੍ਰਹਿ ਗੋਚਰਾਂ ਦੁਆਰਾ ਪ੍ਰਭਾਵਿਤ ਹੋਵੇਗੀ।",
          health: "{year} ਲਈ ਤੁਹਾਡੀ ਸਿਹਤ ਭਵਿੱਖਬਾਣੀ ਗ੍ਰਹਿ ਗੋਚਰਾਂ ਦੁਆਰਾ ਪ੍ਰਭਾਵਿਤ ਹੋਵੇਗੀ।",
          family: "{year} ਲਈ ਤੁਹਾਡੀ ਪਰਿਵਾਰ ਭਵਿੱਖਬਾਣੀ ਗ੍ਰਹਿ ਗੋਚਰਾਂ ਦੁਆਰਾ ਪ੍ਰਭਾਵਿਤ ਹੋਵੇਗੀ।",
          education: "{year} ਲਈ ਤੁਹਾਡੀ ਸਿੱਖਿਆ ਭਵਿੱਖਬਾਣੀ ਗ੍ਰਹਿ ਗੋਚਰਾਂ ਦੁਆਰਾ ਪ੍ਰਭਾਵਿਤ ਹੋਵੇਗੀ।",
          property: "{year} ਲਈ ਤੁਹਾਡੀ ਜਾਇਦਾਦ ਭਵਿੱਖਬਾਣੀ ਗ੍ਰਹਿ ਗੋਚਰਾਂ ਦੁਆਰਾ ਪ੍ਰਭਾਵਿਤ ਹੋਵੇਗੀ।",
          monthSummary: "ਗ੍ਰਹਿ ਪ੍ਰਭਾਵ ਇਸ ਮਹੀਨੇ ਨੂੰ ਆਕਾਰ ਦੇਣਗੇ। ਸੰਤੁਲਨ ਅਤੇ ਵਿਕਾਸ ਤੇ ਧਿਆਨ ਕੇਂਦਰਿਤ ਕਰੋ।"
        },
        monthlyOverview: "ਮਾਸਿਕ ਸੰਖੇਪ {year}",
        luckyFactors: "{year} ਲਈ ਖੁਸ਼ਕਿਸਮਤ ਕਾਰਕ",
        lucky: { numbers: "ਖੁਸ਼ਕਿਸਮਤ ਨੰਬਰ", colors: "ਖੁਸ਼ਕਿਸਮਤ ਰੰਗ", days: "ਖੁਸ਼ਕਿਸਮਤ ਦਿਨ", gemstone: "ਖੁਸ਼ਕਿਸਮਤ ਰਤਨ" },
        personalizedTitle: "ਵਿਅਕਤੀਗਤ ਭਵਿੱਖਬਾਣੀ ਪ੍ਰਾਪਤ ਕਰੋ",
        personalizedDescription: "ਤੁਹਾਡੇ ਸਹੀ ਜਨਮ ਵੇਰਵਿਆਂ ਦੇ ਆਧਾਰ ਤੇ।",
        generateKundli: "ਮੁਫ਼ਤ ਕੁੰਡਲੀ ਬਣਾਓ",
        consultAstrologer: "ਜੋਤਿਸ਼ੀ ਨਾਲ ਸਲਾਹ ਕਰੋ",
        viewAllSigns: "ਸਾਰੀਆਂ ਰਾਸ਼ੀਆਂ ਦੇਖੋ"
      },
      elements: { fire: "ਅੱਗ", earth: "ਧਰਤੀ", air: "ਹਵਾ", water: "ਪਾਣੀ" },
      planets: { mars: "ਮੰਗਲ", venus: "ਸ਼ੁੱਕਰ", mercury: "ਬੁੱਧ", moon: "ਚੰਦਰਮਾ", sun: "ਸੂਰਜ", jupiter: "ਬ੍ਰਿਹਸਪਤੀ", saturn: "ਸ਼ਨੀ" },
      months: { january: "ਜਨਵਰੀ", february: "ਫਰਵਰੀ", march: "ਮਾਰਚ", april: "ਅਪ੍ਰੈਲ", may: "ਮਈ", june: "ਜੂਨ", july: "ਜੁਲਾਈ", august: "ਅਗਸਤ", september: "ਸਤੰਬਰ", october: "ਅਕਤੂਬਰ", november: "ਨਵੰਬਰ", december: "ਦਸੰਬਰ" }
    },
    transits: {
      index: {
        badge: "ਵੈਦਿਕ ਜੋਤਿਸ਼",
        title: "ਗ੍ਰਹਿ ਗੋਚਰ {year}",
        subtitle: "{year} ਵਿੱਚ ਮੁੱਖ ਗ੍ਰਹਿ ਗੋਚਰ ਤੁਹਾਡੀ ਰਾਸ਼ੀ ਨੂੰ ਕਿਵੇਂ ਪ੍ਰਭਾਵਿਤ ਕਰਨਗੇ ਇਹ ਖੋਜੋ।",
        whatAreTransits: "ਗ੍ਰਹਿ ਗੋਚਰ ਕੀ ਹਨ?",
        description: "ਵੈਦਿਕ ਜੋਤਿਸ਼ ਵਿੱਚ, ਗ੍ਰਹਿ ਗੋਚਰ ਵੱਖ-ਵੱਖ ਰਾਸ਼ੀਆਂ ਵਿੱਚੋਂ ਗ੍ਰਹਿਆਂ ਦੀ ਚਾਲ ਨੂੰ ਦਰਸਾਉਂਦੇ ਹਨ।",
        jupiter: { title: "ਬ੍ਰਿਹਸਪਤੀ ਗੋਚਰ {year}", description: "ਬ੍ਰਿਹਸਪਤੀ, ਗਿਆਨ ਅਤੇ ਵਿਸਤਾਰ ਦਾ ਗ੍ਰਹਿ, ਜਿੱਥੇ ਗੋਚਰ ਕਰਦਾ ਹੈ ਉੱਥੇ ਵਿਕਾਸ ਅਤੇ ਮੌਕੇ ਲਿਆਉਂਦਾ ਹੈ।", summary: "{year} ਵਿੱਚ ਬ੍ਰਿਹਸਪਤੀ ਦੀ ਚਾਲ ਕਿਵੇਂ ਅਸ਼ੀਰਵਾਦ ਅਤੇ ਵਿਸਤਾਰ ਲਿਆਵੇਗੀ ਇਹ ਖੋਜੋ।" },
        saturn: { title: "ਸ਼ਨੀ ਗੋਚਰ {year}", description: "ਸ਼ਨੀ, ਕਰਮ ਅਤੇ ਅਨੁਸ਼ਾਸਨ ਦਾ ਗ੍ਰਹਿ, ਆਪਣੇ ਗੋਚਰ ਵਿੱਚ ਮਹੱਤਵਪੂਰਨ ਜੀਵਨ ਸਬਕ ਸਿਖਾਉਂਦਾ ਹੈ।", summary: "{year} ਵਿੱਚ ਸ਼ਨੀ ਗੋਚਰ ਪ੍ਰਭਾਵਾਂ ਬਾਰੇ ਜਾਣੋ।" },
        mercury: { title: "ਬੁੱਧ ਗੋਚਰ {year}", description: "ਬੁੱਧ ਵਕਰੀ ਸਮੇਂ ਸੰਚਾਰ, ਤਕਨਾਲੋਜੀ ਅਤੇ ਯਾਤਰਾ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰਦੇ ਹਨ।", summary: "{year} ਵਿੱਚ ਬੁੱਧ ਵਕਰੀ ਤਾਰੀਖਾਂ ਟ੍ਰੈਕ ਕਰੋ।" },
        viewDetails: "ਵੇਰਵੇ ਦੇਖੋ",
        eclipses: { title: "ਗ੍ਰਹਿਣ {year}", description: "ਸੂਰਜ ਅਤੇ ਚੰਦਰ ਗ੍ਰਹਿਣ ਦੀਆਂ ਤਾਰੀਖਾਂ, ਸਮੇਂ ਅਤੇ ਉਨ੍ਹਾਂ ਦੀ ਜੋਤਿਸ਼ ਮਹੱਤਤਾ।" },
        viewEclipses: "ਗ੍ਰਹਿਣ ਕੈਲੰਡਰ ਦੇਖੋ",
        festivals: { title: "ਤਿਉਹਾਰ ਕੈਲੰਡਰ {year}", description: "ਪੰਚਾਂਗ ਦੇ ਆਧਾਰ ਤੇ ਮੁੱਖ ਹਿੰਦੂ ਤਿਉਹਾਰ, ਮੁਹੂਰਤ ਅਤੇ ਸ਼ੁਭ ਤਾਰੀਖਾਂ।" },
        viewFestivals: "ਤਿਉਹਾਰ ਕੈਲੰਡਰ ਦੇਖੋ",
        personalizedTitle: "ਵਿਅਕਤੀਗਤ ਗੋਚਰ ਵਿਸ਼ਲੇਸ਼ਣ ਪ੍ਰਾਪਤ ਕਰੋ",
        personalizedDescription: "ਤੁਹਾਡੇ ਸਹੀ ਜਨਮ ਚਾਰਟ ਦੇ ਆਧਾਰ ਤੇ।",
        generateKundli: "ਮੁਫ਼ਤ ਕੁੰਡਲੀ ਬਣਾਓ",
        transitCalculator: "ਗੋਚਰ ਕੈਲਕੁਲੇਟਰ",
        planetaryTracker: "ਲਾਈਵ ਗ੍ਰਹਿ ਸਥਿਤੀਆਂ"
      }
    }
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
