import { Language } from "./translations";

export const calculatorTranslations: Record<Language, Record<string, unknown>> = {
  en: {
    calculator: {
      // Common
      freeTool: "Free Tool",
      enterDetails: "Enter Your Details",
      enterBirthDetails: "Enter Birth Details",
      enterName: "Enter Your Name",
      fullName: "Full Name",
      enterFullName: "Enter your full name",
      dateOfBirth: "Date of Birth",
      timeOfBirth: "Time of Birth",
      placeOfBirth: "Place of Birth",
      searchCity: "Search city...",
      calculating: "Calculating...",
      analyzing: "Analyzing...",
      calculate: "Calculate",
      generate: "Generate",
      discover: "Discover",
      find: "Find",
      explore: "Explore",
      ruledBy: "Ruled by",
      keyTraits: "Key Traits",
      benefits: "Benefits",
      mantra: "Mantra",
      attributes: "Divine Attributes",
      luckyDay: "Lucky Day",
      luckyColor: "Lucky Color",
      luckyNumber: "Lucky Number",
      luckyColors: "Lucky Colors",
      luckyDays: "Lucky Days",

      // Numerology Calculator
      numerology: {
        title: "Numerology Calculator",
        shortDesc: "Discover your Life Path and Destiny Numbers.",
        subtitle: "Discover your Life Path Number and Destiny Number based on your birth date and name. Understand your personality, strengths, and life purpose through the ancient science of numerology.",
        inputDesc: "Enter your full name and birth date to calculate your numerology numbers",
        nameNote: "Use your full birth name for accurate Destiny Number",
        calculate: "Calculate My Numbers",
        lifePathNumber: "Life Path Number",
        destinyNumber: "Destiny Number",
        careerPaths: "Ideal Career Paths",
        compatibleNumbers: "Compatible Numbers",
        resultPlaceholder: "Your Numbers Will Appear Here",
        resultPlaceholderDesc: "Enter your name and birth date to discover your Life Path and Destiny Numbers.",
        aboutTitle: "Understanding Numerology",
        aboutDesc1: "Numerology is an ancient science that studies the mystical relationship between numbers and life events. It has been practiced for thousands of years across various cultures including Indian, Chinese, and Western traditions.",
        lifePathTitle: "What is Life Path Number?",
        lifePathDesc: "Your Life Path Number is derived from your birth date and reveals your life purpose, natural talents, and the opportunities and challenges you may face. It is considered the most important number in numerology.",
        destinyTitle: "What is Destiny Number?",
        destinyDesc: "Your Destiny Number (also called Expression Number) is calculated from your full birth name. It reveals your goals, talents, and the path you are meant to follow in this lifetime.",
      },

      // Yantra Recommendations
      yantra: {
        title: "Yantra Recommendations",
        shortDesc: "Find the right sacred Yantras for you.",
        subtitle: "Discover which sacred Yantras are most beneficial for you based on your birth chart. Yantras are powerful geometric diagrams that invoke divine energies and bring positive changes in life.",
        inputDesc: "Enter your birth details to get personalized Yantra recommendations",
        getRecommendations: "Get Yantra Recommendations",
        recommendedYantras: "Recommended Yantras for You",
        resultPlaceholder: "Your Yantra Recommendations Will Appear Here",
        resultPlaceholderDesc: "Enter your birth details to discover which sacred Yantras are most beneficial for your spiritual and material growth.",
        aboutTitle: "About Yantras in Vedic Astrology",
        aboutDesc1: "Yantras are sacred geometric diagrams used in Hindu and Buddhist traditions for meditation and worship. They are believed to be the dwelling places of deities and serve as tools for focusing the mind and invoking divine energies.",
        aboutDesc2: "Each Yantra is associated with a specific deity or planet and is designed to harness particular cosmic energies. When properly energized and worshipped, Yantras can help overcome obstacles, attract prosperity, improve health, and accelerate spiritual growth.",
        howToUse: "How to Use a Yantra",
        step1: "Place the Yantra in your puja room or meditation space facing East or North",
        step2: "Clean the Yantra regularly and offer flowers, incense, and light a lamp",
        step3: "Chant the associated mantra while focusing on the center of the Yantra",
        step4: "Meditate on the Yantra daily for best results",
      },

      // Rudraksha Recommendations
      rudraksha: {
        title: "Rudraksha Recommendations",
        shortDesc: "Find the right Rudraksha beads for you.",
        subtitle: "Discover which Rudraksha beads are most beneficial for you based on your birth chart. Rudraksha beads are sacred seeds with powerful spiritual and healing properties.",
        inputDesc: "Enter your birth details to get personalized Rudraksha recommendations",
        getRecommendations: "Get Rudraksha Recommendations",
        recommendedRudraksha: "Recommended Rudraksha for You",
        wearingDay: "Best Day to Wear",
        resultPlaceholder: "Your Rudraksha Recommendations Will Appear Here",
        resultPlaceholderDesc: "Enter your birth details to discover which sacred Rudraksha beads are most beneficial for your spiritual and physical well-being.",
        aboutTitle: "About Rudraksha Beads",
        aboutDesc1: "Rudraksha beads are sacred seeds from the Elaeocarpus ganitrus tree, found primarily in the Himalayan regions of Nepal and Indonesia. The word \"Rudraksha\" comes from \"Rudra\" (Lord Shiva) and \"Aksha\" (eyes), meaning \"tears of Lord Shiva.\"",
        aboutDesc2: "Each Rudraksha bead has a certain number of \"mukhis\" or faces, ranging from 1 to 21. Each type has unique properties and is associated with different deities and planets. Wearing the right Rudraksha can bring spiritual, mental, and physical benefits.",
        howToWear: "How to Wear Rudraksha",
        step1: "Energize the Rudraksha by chanting the associated mantra 108 times",
        step2: "Wear it on the recommended day after taking a bath",
        step3: "String it in silk or gold/silver thread",
        step4: "Remove before sleeping or going to impure places",
      },

      // Ishta Devata Calculator
      ishtaDevata: {
        title: "Ishta Devata Calculator",
        shortDesc: "Find your personal deity based on your chart.",
        subtitle: "Discover your Ishta Devata (personal deity) based on your birth chart. Your Ishta Devata is the form of the Divine that is most suited for your spiritual evolution.",
        inputDesc: "Enter your birth details to discover your personal deity",
        timeNote: "Accurate birth time helps determine the 9th house lord precisely",
        findDeity: "Find My Ishta Devata",
        yourDeity: "Your Ishta Devata",
        howToWorship: "How to Worship",
        offerings: "Recommended Offerings",
        resultPlaceholder: "Your Ishta Devata Will Appear Here",
        resultPlaceholderDesc: "Enter your birth details to discover your personal deity and learn how to connect with the Divine through worship.",
        aboutTitle: "Understanding Ishta Devata",
        aboutDesc1: "Ishta Devata is a Sanskrit term meaning \"chosen deity\" or \"personal god.\" In Vedic astrology, your Ishta Devata is determined by analyzing the 12th house from the Karakamsha (the sign where Atmakaraka is placed in Navamsa chart).",
        aboutDesc2: "Your Ishta Devata represents the form of the Divine that is most suited for your spiritual evolution. Worshipping your Ishta Devata helps in achieving moksha (liberation) and accelerates your spiritual growth.",
        whyImportant: "Why is Ishta Devata Important?",
        reason1: "Provides a personal connection with the Divine",
        reason2: "Accelerates spiritual growth and evolution",
        reason3: "Helps overcome karmic obstacles",
        reason4: "Brings peace, prosperity, and protection",
      },

      // Naam Rashi Calculator
      naamRashi: {
        title: "Naam Rashi Calculator",
        shortDesc: "Find your zodiac sign based on your name.",
        subtitle: "Discover your zodiac sign (Rashi) based on the first letter of your name. In Vedic astrology, Naam Rashi is used for daily horoscope readings and astrological predictions.",
        inputDesc: "Enter your name to find your Naam Rashi based on the first letter",
        nameNote: "Your Naam Rashi is determined by the first letter of your name",
        findRashi: "Find My Naam Rashi",
        yourRashi: "Your Naam Rashi",
        compatibleSigns: "Compatible Signs",
        associatedLetters: "Associated Letters",
        resultPlaceholder: "Your Naam Rashi Will Appear Here",
        resultPlaceholderDesc: "Enter your name to discover your zodiac sign based on the first letter of your name.",
        aboutTitle: "Understanding Naam Rashi",
        aboutDesc1: "Naam Rashi (Name Zodiac Sign) is a concept in Vedic astrology where your zodiac sign is determined by the first letter or syllable of your name. This is different from your Moon Sign (Chandra Rashi) which is based on the position of the Moon at your birth.",
        aboutDesc2: "In Indian tradition, names are often chosen based on the Nakshatra (birth star) of the child, which corresponds to specific letters. This ensures that the name is astrologically aligned with the child's birth chart.",
        whenToUse: "When to Use Naam Rashi",
        use1: "Reading daily, weekly, or monthly horoscopes in newspapers and magazines",
        use2: "Quick astrological predictions when birth time is unknown",
        use3: "Checking compatibility based on names",
        use4: "Understanding general personality traits associated with your name",
      },

      // Gemstones
      gemstones: {
        title: "Gemstone Recommendations",
        shortDesc: "Find your lucky gemstones.",
      },

      // Kundli Calculator
      kundliCalc: {
        title: "Kundli Calculator",
        shortDesc: "Generate your complete Vedic birth chart.",
      },

      // Moon Sign Calculator
      moonSignCalc: {
        title: "Moon Sign Calculator",
        shortDesc: "Discover your Moon Sign (Chandra Rashi).",
      },
    },
  },
  hi: {
    calculator: {
      freeTool: "मुफ्त टूल",
      enterDetails: "अपना विवरण दर्ज करें",
      enterBirthDetails: "जन्म विवरण दर्ज करें",
      enterName: "अपना नाम दर्ज करें",
      fullName: "पूरा नाम",
      enterFullName: "अपना पूरा नाम दर्ज करें",
      dateOfBirth: "जन्म तिथि",
      timeOfBirth: "जन्म समय",
      placeOfBirth: "जन्म स्थान",
      searchCity: "शहर खोजें...",
      calculating: "गणना हो रही है...",
      analyzing: "विश्लेषण हो रहा है...",
      calculate: "गणना करें",
      generate: "बनाएं",
      discover: "खोजें",
      find: "ढूंढें",
      explore: "जानें",
      ruledBy: "स्वामी",
      keyTraits: "मुख्य गुण",
      benefits: "लाभ",
      mantra: "मंत्र",
      attributes: "दिव्य गुण",
      luckyDay: "शुभ दिन",
      luckyColor: "शुभ रंग",
      luckyNumber: "शुभ अंक",
      luckyColors: "शुभ रंग",
      luckyDays: "शुभ दिन",

      numerology: {
        title: "अंक ज्योतिष कैलकुलेटर",
        shortDesc: "अपना जीवन पथ और भाग्य अंक जानें।",
        subtitle: "अपनी जन्म तिथि और नाम के आधार पर अपना जीवन पथ अंक और भाग्य अंक जानें। अंक ज्योतिष की प्राचीन विज्ञान के माध्यम से अपने व्यक्तित्व, शक्तियों और जीवन उद्देश्य को समझें।",
        inputDesc: "अपने अंक ज्योतिष संख्याओं की गणना के लिए अपना पूरा नाम और जन्म तिथि दर्ज करें",
        nameNote: "सटीक भाग्य अंक के लिए अपना पूरा जन्म नाम उपयोग करें",
        calculate: "मेरे अंक की गणना करें",
        lifePathNumber: "जीवन पथ अंक",
        destinyNumber: "भाग्य अंक",
        careerPaths: "आदर्श करियर पथ",
        compatibleNumbers: "अनुकूल अंक",
        resultPlaceholder: "आपके अंक यहां दिखाई देंगे",
        resultPlaceholderDesc: "अपना जीवन पथ और भाग्य अंक जानने के लिए अपना नाम और जन्म तिथि दर्ज करें।",
        aboutTitle: "अंक ज्योतिष को समझें",
        aboutDesc1: "अंक ज्योतिष एक प्राचीन विज्ञान है जो संख्याओं और जीवन की घटनाओं के बीच रहस्यमय संबंध का अध्ययन करता है। इसका अभ्यास हजारों वर्षों से भारतीय, चीनी और पश्चिमी परंपराओं सहित विभिन्न संस्कृतियों में किया जाता रहा है।",
        lifePathTitle: "जीवन पथ अंक क्या है?",
        lifePathDesc: "आपका जीवन पथ अंक आपकी जन्म तिथि से प्राप्त होता है और आपके जीवन उद्देश्य, प्राकृतिक प्रतिभाओं और आपके सामने आने वाले अवसरों और चुनौतियों को प्रकट करता है।",
        destinyTitle: "भाग्य अंक क्या है?",
        destinyDesc: "आपका भाग्य अंक (जिसे अभिव्यक्ति अंक भी कहा जाता है) आपके पूरे जन्म नाम से गणना किया जाता है। यह आपके लक्ष्यों, प्रतिभाओं और इस जीवनकाल में आपके अनुसरण करने के लिए निर्धारित मार्ग को प्रकट करता है।",
      },

      yantra: {
        title: "यंत्र सिफारिशें",
        shortDesc: "अपने लिए सही पवित्र यंत्र खोजें।",
        subtitle: "अपनी जन्म कुंडली के आधार पर जानें कि कौन से पवित्र यंत्र आपके लिए सबसे लाभकारी हैं। यंत्र शक्तिशाली ज्यामितीय आरेख हैं जो दिव्य ऊर्जाओं को आमंत्रित करते हैं।",
        inputDesc: "व्यक्तिगत यंत्र सिफारिशें प्राप्त करने के लिए अपना जन्म विवरण दर्ज करें",
        getRecommendations: "यंत्र सिफारिशें प्राप्त करें",
        recommendedYantras: "आपके लिए अनुशंसित यंत्र",
        resultPlaceholder: "आपकी यंत्र सिफारिशें यहां दिखाई देंगी",
        resultPlaceholderDesc: "अपने आध्यात्मिक और भौतिक विकास के लिए सबसे लाभकारी पवित्र यंत्रों की खोज के लिए अपना जन्म विवरण दर्ज करें।",
        aboutTitle: "वैदिक ज्योतिष में यंत्रों के बारे में",
        aboutDesc1: "यंत्र हिंदू और बौद्ध परंपराओं में ध्यान और पूजा के लिए उपयोग किए जाने वाले पवित्र ज्यामितीय आरेख हैं।",
        aboutDesc2: "प्रत्येक यंत्र एक विशिष्ट देवता या ग्रह से जुड़ा होता है और विशेष ब्रह्मांडीय ऊर्जाओं का उपयोग करने के लिए डिज़ाइन किया गया है।",
        howToUse: "यंत्र का उपयोग कैसे करें",
        step1: "यंत्र को अपने पूजा कक्ष में पूर्व या उत्तर की ओर मुख करके रखें",
        step2: "यंत्र को नियमित रूप से साफ करें और फूल, धूप चढ़ाएं और दीपक जलाएं",
        step3: "यंत्र के केंद्र पर ध्यान केंद्रित करते हुए संबंधित मंत्र का जाप करें",
        step4: "सर्वोत्तम परिणामों के लिए प्रतिदिन यंत्र पर ध्यान करें",
      },

      rudraksha: {
        title: "रुद्राक्ष सिफारिशें",
        shortDesc: "अपने लिए सही रुद्राक्ष खोजें।",
        subtitle: "अपनी जन्म कुंडली के आधार पर जानें कि कौन से रुद्राक्ष आपके लिए सबसे लाभकारी हैं। रुद्राक्ष शक्तिशाली आध्यात्मिक और उपचार गुणों वाले पवित्र बीज हैं।",
        inputDesc: "व्यक्तिगत रुद्राक्ष सिफारिशें प्राप्त करने के लिए अपना जन्म विवरण दर्ज करें",
        getRecommendations: "रुद्राक्ष सिफारिशें प्राप्त करें",
        recommendedRudraksha: "आपके लिए अनुशंसित रुद्राक्ष",
        wearingDay: "धारण करने का सर्वोत्तम दिन",
        resultPlaceholder: "आपकी रुद्राक्ष सिफारिशें यहां दिखाई देंगी",
        resultPlaceholderDesc: "अपने आध्यात्मिक और शारीरिक कल्याण के लिए सबसे लाभकारी पवित्र रुद्राक्ष की खोज के लिए अपना जन्म विवरण दर्ज करें।",
        aboutTitle: "रुद्राक्ष के बारे में",
        aboutDesc1: "रुद्राक्ष एलेओकार्पस गैनिट्रस वृक्ष के पवित्र बीज हैं, जो मुख्य रूप से नेपाल और इंडोनेशिया के हिमालयी क्षेत्रों में पाए जाते हैं।",
        aboutDesc2: "प्रत्येक रुद्राक्ष में एक निश्चित संख्या में 'मुखी' या चेहरे होते हैं, जो 1 से 21 तक होते हैं। प्रत्येक प्रकार के अद्वितीय गुण होते हैं।",
        howToWear: "रुद्राक्ष कैसे धारण करें",
        step1: "संबंधित मंत्र का 108 बार जाप करके रुद्राक्ष को ऊर्जावान करें",
        step2: "स्नान के बाद अनुशंसित दिन पर इसे धारण करें",
        step3: "इसे रेशम या सोने/चांदी के धागे में पिरोएं",
        step4: "सोने से पहले या अशुद्ध स्थानों पर जाने से पहले उतार दें",
      },

      ishtaDevata: {
        title: "इष्ट देवता कैलकुलेटर",
        shortDesc: "अपनी कुंडली के आधार पर अपने व्यक्तिगत देवता खोजें।",
        subtitle: "अपनी जन्म कुंडली के आधार पर अपने इष्ट देवता (व्यक्तिगत देवता) की खोज करें। आपके इष्ट देवता दिव्य का वह रूप हैं जो आपके आध्यात्मिक विकास के लिए सबसे उपयुक्त हैं।",
        inputDesc: "अपने व्यक्तिगत देवता की खोज के लिए अपना जन्म विवरण दर्ज करें",
        timeNote: "सटीक जन्म समय 9वें भाव के स्वामी को सटीक रूप से निर्धारित करने में मदद करता है",
        findDeity: "मेरे इष्ट देवता खोजें",
        yourDeity: "आपके इष्ट देवता",
        howToWorship: "पूजा कैसे करें",
        offerings: "अनुशंसित प्रसाद",
        resultPlaceholder: "आपके इष्ट देवता यहां दिखाई देंगे",
        resultPlaceholderDesc: "अपने व्यक्तिगत देवता की खोज करने और पूजा के माध्यम से दिव्य से जुड़ने का तरीका जानने के लिए अपना जन्म विवरण दर्ज करें।",
        aboutTitle: "इष्ट देवता को समझें",
        aboutDesc1: "इष्ट देवता एक संस्कृत शब्द है जिसका अर्थ है 'चुने हुए देवता' या 'व्यक्तिगत भगवान'।",
        aboutDesc2: "आपके इष्ट देवता दिव्य का वह रूप दर्शाते हैं जो आपके आध्यात्मिक विकास के लिए सबसे उपयुक्त है।",
        whyImportant: "इष्ट देवता क्यों महत्वपूर्ण हैं?",
        reason1: "दिव्य के साथ व्यक्तिगत संबंध प्रदान करता है",
        reason2: "आध्यात्मिक विकास और उन्नति को तेज करता है",
        reason3: "कर्म बाधाओं को दूर करने में मदद करता है",
        reason4: "शांति, समृद्धि और सुरक्षा लाता है",
      },

      naamRashi: {
        title: "नाम राशि कैलकुलेटर",
        shortDesc: "अपने नाम के आधार पर अपनी राशि खोजें।",
        subtitle: "अपने नाम के पहले अक्षर के आधार पर अपनी राशि (राशि) की खोज करें। वैदिक ज्योतिष में, नाम राशि का उपयोग दैनिक राशिफल पढ़ने और ज्योतिषीय भविष्यवाणियों के लिए किया जाता है।",
        inputDesc: "पहले अक्षर के आधार पर अपनी नाम राशि खोजने के लिए अपना नाम दर्ज करें",
        nameNote: "आपकी नाम राशि आपके नाम के पहले अक्षर से निर्धारित होती है",
        findRashi: "मेरी नाम राशि खोजें",
        yourRashi: "आपकी नाम राशि",
        compatibleSigns: "अनुकूल राशियां",
        associatedLetters: "संबंधित अक्षर",
        resultPlaceholder: "आपकी नाम राशि यहां दिखाई देगी",
        resultPlaceholderDesc: "अपने नाम के पहले अक्षर के आधार पर अपनी राशि जानने के लिए अपना नाम दर्ज करें।",
        aboutTitle: "नाम राशि को समझें",
        aboutDesc1: "नाम राशि वैदिक ज्योतिष में एक अवधारणा है जहां आपकी राशि आपके नाम के पहले अक्षर या शब्दांश से निर्धारित होती है।",
        aboutDesc2: "भारतीय परंपरा में, नाम अक्सर बच्चे के नक्षत्र (जन्म तारा) के आधार पर चुने जाते हैं, जो विशिष्ट अक्षरों से मेल खाता है।",
        whenToUse: "नाम राशि का उपयोग कब करें",
        use1: "समाचार पत्रों और पत्रिकाओं में दैनिक, साप्ताहिक या मासिक राशिफल पढ़ना",
        use2: "जब जन्म समय अज्ञात हो तो त्वरित ज्योतिषीय भविष्यवाणियां",
        use3: "नामों के आधार पर अनुकूलता जांचना",
        use4: "अपने नाम से जुड़े सामान्य व्यक्तित्व लक्षणों को समझना",
      },

      gemstones: {
        title: "रत्न सिफारिशें",
        shortDesc: "अपने शुभ रत्न खोजें।",
      },

      kundliCalc: {
        title: "कुंडली कैलकुलेटर",
        shortDesc: "अपनी पूर्ण वैदिक जन्म कुंडली बनाएं।",
      },

      moonSignCalc: {
        title: "चंद्र राशि कैलकुलेटर",
        shortDesc: "अपनी चंद्र राशि (चंद्र राशि) जानें।",
      },
    },
  },
  ta: {
    calculator: {
      freeTool: "இலவச கருவி",
      enterDetails: "உங்கள் விவரங்களை உள்ளிடவும்",
      enterBirthDetails: "பிறப்பு விவரங்களை உள்ளிடவும்",
      enterName: "உங்கள் பெயரை உள்ளிடவும்",
      fullName: "முழு பெயர்",
      enterFullName: "உங்கள் முழு பெயரை உள்ளிடவும்",
      dateOfBirth: "பிறந்த தேதி",
      timeOfBirth: "பிறந்த நேரம்",
      placeOfBirth: "பிறந்த இடம்",
      searchCity: "நகரத்தைத் தேடுங்கள்...",
      calculating: "கணக்கிடுகிறது...",
      analyzing: "பகுப்பாய்வு செய்கிறது...",
      calculate: "கணக்கிடு",
      generate: "உருவாக்கு",
      discover: "கண்டறியுங்கள்",
      find: "கண்டுபிடி",
      explore: "ஆராயுங்கள்",
      ruledBy: "ஆளுகிறது",
      keyTraits: "முக்கிய குணங்கள்",
      benefits: "நன்மைகள்",
      mantra: "மந்திரம்",
      attributes: "தெய்வீக குணங்கள்",
      luckyDay: "அதிர்ஷ்ட நாள்",
      luckyColor: "அதிர்ஷ்ட நிறம்",
      luckyNumber: "அதிர்ஷ்ட எண்",

      numerology: {
        title: "எண் கணிதம் கால்குலேட்டர்",
        shortDesc: "உங்கள் வாழ்க்கை பாதை மற்றும் விதி எண்களைக் கண்டறியுங்கள்.",
        subtitle: "உங்கள் பிறந்த தேதி மற்றும் பெயரின் அடிப்படையில் உங்கள் வாழ்க்கை பாதை எண் மற்றும் விதி எண்ணைக் கண்டறியுங்கள்.",
        calculate: "என் எண்களைக் கணக்கிடு",
        lifePathNumber: "வாழ்க்கை பாதை எண்",
        destinyNumber: "விதி எண்",
        resultPlaceholder: "உங்கள் எண்கள் இங்கே தோன்றும்",
      },

      yantra: {
        title: "யந்திர பரிந்துரைகள்",
        shortDesc: "உங்களுக்கான சரியான புனித யந்திரங்களைக் கண்டறியுங்கள்.",
        getRecommendations: "யந்திர பரிந்துரைகளைப் பெறுங்கள்",
        resultPlaceholder: "உங்கள் யந்திர பரிந்துரைகள் இங்கே தோன்றும்",
      },

      rudraksha: {
        title: "ருத்ராட்ச பரிந்துரைகள்",
        shortDesc: "உங்களுக்கான சரியான ருத்ராட்ச மணிகளைக் கண்டறியுங்கள்.",
        getRecommendations: "ருத்ராட்ச பரிந்துரைகளைப் பெறுங்கள்",
        wearingDay: "அணிய சிறந்த நாள்",
        resultPlaceholder: "உங்கள் ருத்ராட்ச பரிந்துரைகள் இங்கே தோன்றும்",
      },

      ishtaDevata: {
        title: "இஷ்ட தேவதா கால்குலேட்டர்",
        shortDesc: "உங்கள் ஜாதகத்தின் அடிப்படையில் உங்கள் தனிப்பட்ட தெய்வத்தைக் கண்டறியுங்கள்.",
        findDeity: "என் இஷ்ட தேவதாவைக் கண்டுபிடி",
        yourDeity: "உங்கள் இஷ்ட தேவதா",
        resultPlaceholder: "உங்கள் இஷ்ட தேவதா இங்கே தோன்றும்",
      },

      naamRashi: {
        title: "நாம ராசி கால்குலேட்டர்",
        shortDesc: "உங்கள் பெயரின் அடிப்படையில் உங்கள் ராசியைக் கண்டறியுங்கள்.",
        findRashi: "என் நாம ராசியைக் கண்டுபிடி",
        yourRashi: "உங்கள் நாம ராசி",
        resultPlaceholder: "உங்கள் நாம ராசி இங்கே தோன்றும்",
      },

      gemstones: {
        title: "ரத்தின பரிந்துரைகள்",
        shortDesc: "உங்கள் அதிர்ஷ்ட ரத்தினங்களைக் கண்டறியுங்கள்.",
      },

      kundliCalc: {
        title: "குண்டலி கால்குலேட்டர்",
        shortDesc: "உங்கள் முழுமையான வேத ஜாதகத்தை உருவாக்குங்கள்.",
      },

      moonSignCalc: {
        title: "சந்திர ராசி கால்குலேட்டர்",
        shortDesc: "உங்கள் சந்திர ராசியைக் கண்டறியுங்கள்.",
      },
    },
  },
  te: {
    calculator: {
      freeTool: "ఉచిత సాధనం",
      enterDetails: "మీ వివరాలను నమోదు చేయండి",
      enterBirthDetails: "జన్మ వివరాలను నమోదు చేయండి",
      enterName: "మీ పేరును నమోదు చేయండి",
      fullName: "పూర్తి పేరు",
      enterFullName: "మీ పూర్తి పేరును నమోదు చేయండి",
      dateOfBirth: "పుట్టిన తేదీ",
      timeOfBirth: "పుట్టిన సమయం",
      placeOfBirth: "పుట్టిన ప్రదేశం",
      searchCity: "నగరాన్ని వెతకండి...",
      calculating: "లెక్కిస్తోంది...",
      analyzing: "విశ్లేషిస్తోంది...",
      calculate: "లెక్కించు",
      generate: "సృష్టించు",
      discover: "కనుగొనండి",
      find: "కనుగొను",
      explore: "అన్వేషించండి",

      numerology: {
        title: "సంఖ్యాశాస్త్ర కాలిక్యులేటర్",
        shortDesc: "మీ జీవిత మార్గం మరియు విధి సంఖ్యలను కనుగొనండి.",
        calculate: "నా సంఖ్యలను లెక్కించు",
        lifePathNumber: "జీవిత మార్గ సంఖ్య",
        destinyNumber: "విధి సంఖ్య",
        resultPlaceholder: "మీ సంఖ్యలు ఇక్కడ కనిపిస్తాయి",
      },

      yantra: {
        title: "యంత్ర సిఫార్సులు",
        shortDesc: "మీకు సరైన పవిత్ర యంత్రాలను కనుగొనండి.",
        getRecommendations: "యంత్ర సిఫార్సులను పొందండి",
        resultPlaceholder: "మీ యంత్ర సిఫార్సులు ఇక్కడ కనిపిస్తాయి",
      },

      rudraksha: {
        title: "రుద్రాక్ష సిఫార్సులు",
        shortDesc: "మీకు సరైన రుద్రాక్ష పూసలను కనుగొనండి.",
        getRecommendations: "రుద్రాక్ష సిఫార్సులను పొందండి",
        resultPlaceholder: "మీ రుద్రాక్ష సిఫార్సులు ఇక్కడ కనిపిస్తాయి",
      },

      ishtaDevata: {
        title: "ఇష్ట దేవత కాలిక్యులేటర్",
        shortDesc: "మీ జాతకం ఆధారంగా మీ వ్యక్తిగత దేవతను కనుగొనండి.",
        findDeity: "నా ఇష్ట దేవతను కనుగొను",
        yourDeity: "మీ ఇష్ట దేవత",
        resultPlaceholder: "మీ ఇష్ట దేవత ఇక్కడ కనిపిస్తుంది",
      },

      naamRashi: {
        title: "నామ రాశి కాలిక్యులేటర్",
        shortDesc: "మీ పేరు ఆధారంగా మీ రాశిని కనుగొనండి.",
        findRashi: "నా నామ రాశిని కనుగొను",
        yourRashi: "మీ నామ రాశి",
        resultPlaceholder: "మీ నామ రాశి ఇక్కడ కనిపిస్తుంది",
      },

      gemstones: {
        title: "రత్న సిఫార్సులు",
        shortDesc: "మీ అదృష్ట రత్నాలను కనుగొనండి.",
      },

      kundliCalc: {
        title: "కుండలి కాలిక్యులేటర్",
        shortDesc: "మీ పూర్తి వేద జాతకాన్ని సృష్టించండి.",
      },

      moonSignCalc: {
        title: "చంద్ర రాశి కాలిక్యులేటర్",
        shortDesc: "మీ చంద్ర రాశిని కనుగొనండి.",
      },
    },
  },
  bn: {
    calculator: {
      freeTool: "বিনামূল্যে টুল",
      enterDetails: "আপনার বিবরণ লিখুন",
      enterBirthDetails: "জন্ম বিবরণ লিখুন",
      enterName: "আপনার নাম লিখুন",
      fullName: "পুরো নাম",
      enterFullName: "আপনার পুরো নাম লিখুন",
      dateOfBirth: "জন্ম তারিখ",
      timeOfBirth: "জন্ম সময়",
      placeOfBirth: "জন্মস্থান",
      searchCity: "শহর খুঁজুন...",
      calculating: "গণনা করা হচ্ছে...",
      analyzing: "বিশ্লেষণ করা হচ্ছে...",
      calculate: "গণনা করুন",
      generate: "তৈরি করুন",
      discover: "আবিষ্কার করুন",
      find: "খুঁজুন",
      explore: "অন্বেষণ করুন",

      numerology: {
        title: "সংখ্যাতত্ত্ব ক্যালকুলেটর",
        shortDesc: "আপনার জীবন পথ এবং ভাগ্য সংখ্যা আবিষ্কার করুন।",
        calculate: "আমার সংখ্যা গণনা করুন",
        lifePathNumber: "জীবন পথ সংখ্যা",
        destinyNumber: "ভাগ্য সংখ্যা",
        resultPlaceholder: "আপনার সংখ্যা এখানে প্রদর্শিত হবে",
      },

      yantra: {
        title: "যন্ত্র সুপারিশ",
        shortDesc: "আপনার জন্য সঠিক পবিত্র যন্ত্র খুঁজুন।",
        getRecommendations: "যন্ত্র সুপারিশ পান",
        resultPlaceholder: "আপনার যন্ত্র সুপারিশ এখানে প্রদর্শিত হবে",
      },

      rudraksha: {
        title: "রুদ্রাক্ষ সুপারিশ",
        shortDesc: "আপনার জন্য সঠিক রুদ্রাক্ষ মালা খুঁজুন।",
        getRecommendations: "রুদ্রাক্ষ সুপারিশ পান",
        resultPlaceholder: "আপনার রুদ্রাক্ষ সুপারিশ এখানে প্রদর্শিত হবে",
      },

      ishtaDevata: {
        title: "ইষ্ট দেবতা ক্যালকুলেটর",
        shortDesc: "আপনার জন্মকুণ্ডলির উপর ভিত্তি করে আপনার ব্যক্তিগত দেবতা খুঁজুন।",
        findDeity: "আমার ইষ্ট দেবতা খুঁজুন",
        yourDeity: "আপনার ইষ্ট দেবতা",
        resultPlaceholder: "আপনার ইষ্ট দেবতা এখানে প্রদর্শিত হবে",
      },

      naamRashi: {
        title: "নাম রাশি ক্যালকুলেটর",
        shortDesc: "আপনার নামের উপর ভিত্তি করে আপনার রাশি খুঁজুন।",
        findRashi: "আমার নাম রাশি খুঁজুন",
        yourRashi: "আপনার নাম রাশি",
        resultPlaceholder: "আপনার নাম রাশি এখানে প্রদর্শিত হবে",
      },

      gemstones: {
        title: "রত্ন সুপারিশ",
        shortDesc: "আপনার ভাগ্যবান রত্ন খুঁজুন।",
      },

      kundliCalc: {
        title: "কুণ্ডলি ক্যালকুলেটর",
        shortDesc: "আপনার সম্পূর্ণ বৈদিক জন্মকুণ্ডলি তৈরি করুন।",
      },

      moonSignCalc: {
        title: "চন্দ্র রাশি ক্যালকুলেটর",
        shortDesc: "আপনার চন্দ্র রাশি আবিষ্কার করুন।",
      },
    },
  },
  mr: {
    calculator: {
      freeTool: "मोफत साधन",
      enterDetails: "तुमचे तपशील प्रविष्ट करा",
      enterBirthDetails: "जन्म तपशील प्रविष्ट करा",
      enterName: "तुमचे नाव प्रविष्ट करा",
      fullName: "पूर्ण नाव",
      enterFullName: "तुमचे पूर्ण नाव प्रविष्ट करा",
      dateOfBirth: "जन्म तारीख",
      timeOfBirth: "जन्म वेळ",
      placeOfBirth: "जन्म ठिकाण",
      searchCity: "शहर शोधा...",
      calculating: "गणना करत आहे...",
      analyzing: "विश्लेषण करत आहे...",
      calculate: "गणना करा",
      generate: "तयार करा",
      discover: "शोधा",
      find: "शोधा",
      explore: "अन्वेषण करा",

      numerology: {
        title: "अंकशास्त्र कॅल्क्युलेटर",
        shortDesc: "तुमचा जीवन मार्ग आणि नशीब क्रमांक शोधा.",
        calculate: "माझे क्रमांक मोजा",
        lifePathNumber: "जीवन मार्ग क्रमांक",
        destinyNumber: "नशीब क्रमांक",
        resultPlaceholder: "तुमचे क्रमांक येथे दिसतील",
      },

      yantra: {
        title: "यंत्र शिफारसी",
        shortDesc: "तुमच्यासाठी योग्य पवित्र यंत्रे शोधा.",
        getRecommendations: "यंत्र शिफारसी मिळवा",
        resultPlaceholder: "तुमच्या यंत्र शिफारसी येथे दिसतील",
      },

      rudraksha: {
        title: "रुद्राक्ष शिफारसी",
        shortDesc: "तुमच्यासाठी योग्य रुद्राक्ष मणी शोधा.",
        getRecommendations: "रुद्राक्ष शिफारसी मिळवा",
        resultPlaceholder: "तुमच्या रुद्राक्ष शिफारसी येथे दिसतील",
      },

      ishtaDevata: {
        title: "इष्ट देवता कॅल्क्युलेटर",
        shortDesc: "तुमच्या कुंडलीवर आधारित तुमचे वैयक्तिक देवता शोधा.",
        findDeity: "माझे इष्ट देवता शोधा",
        yourDeity: "तुमचे इष्ट देवता",
        resultPlaceholder: "तुमचे इष्ट देवता येथे दिसतील",
      },

      naamRashi: {
        title: "नाम राशी कॅल्क्युलेटर",
        shortDesc: "तुमच्या नावावर आधारित तुमची राशी शोधा.",
        findRashi: "माझी नाम राशी शोधा",
        yourRashi: "तुमची नाम राशी",
        resultPlaceholder: "तुमची नाम राशी येथे दिसेल",
      },

      gemstones: {
        title: "रत्न शिफारसी",
        shortDesc: "तुमचे भाग्यशाली रत्न शोधा.",
      },

      kundliCalc: {
        title: "कुंडली कॅल्क्युलेटर",
        shortDesc: "तुमची संपूर्ण वैदिक जन्मकुंडली तयार करा.",
      },

      moonSignCalc: {
        title: "चंद्र राशी कॅल्क्युलेटर",
        shortDesc: "तुमची चंद्र राशी शोधा.",
      },
    },
  },
  gu: {
    calculator: {
      freeTool: "મફત સાધન",
      enterDetails: "તમારી વિગતો દાખલ કરો",
      enterBirthDetails: "જન્મ વિગતો દાખલ કરો",
      enterName: "તમારું નામ દાખલ કરો",
      fullName: "પૂરું નામ",
      enterFullName: "તમારું પૂરું નામ દાખલ કરો",
      dateOfBirth: "જન્મ તારીખ",
      timeOfBirth: "જન્મ સમય",
      placeOfBirth: "જન્મ સ્થળ",
      searchCity: "શહેર શોધો...",
      calculating: "ગણતરી કરી રહ્યા છીએ...",
      analyzing: "વિશ્લેષણ કરી રહ્યા છીએ...",
      calculate: "ગણતરી કરો",
      generate: "બનાવો",
      discover: "શોધો",
      find: "શોધો",
      explore: "અન્વેષણ કરો",

      numerology: {
        title: "અંકશાસ્ત્ર કેલ્ક્યુલેટર",
        shortDesc: "તમારો જીવન માર્ગ અને ભાગ્ય અંક શોધો.",
        calculate: "મારા અંકોની ગણતરી કરો",
        lifePathNumber: "જીવન માર્ગ અંક",
        destinyNumber: "ભાગ્ય અંક",
        resultPlaceholder: "તમારા અંકો અહીં દેખાશે",
      },

      yantra: {
        title: "યંત્ર ભલામણો",
        shortDesc: "તમારા માટે યોગ્ય પવિત્ર યંત્રો શોધો.",
        getRecommendations: "યંત્ર ભલામણો મેળવો",
        resultPlaceholder: "તમારી યંત્ર ભલામણો અહીં દેખાશે",
      },

      rudraksha: {
        title: "રુદ્રાક્ષ ભલામણો",
        shortDesc: "તમારા માટે યોગ્ય રુદ્રાક્ષ મણકા શોધો.",
        getRecommendations: "રુદ્રાક્ષ ભલામણો મેળવો",
        resultPlaceholder: "તમારી રુદ્રાક્ષ ભલામણો અહીં દેખાશે",
      },

      ishtaDevata: {
        title: "ઇષ્ટ દેવતા કેલ્ક્યુલેટર",
        shortDesc: "તમારી કુંડળી પર આધારિત તમારા વ્યક્તિગત દેવતા શોધો.",
        findDeity: "મારા ઇષ્ટ દેવતા શોધો",
        yourDeity: "તમારા ઇષ્ટ દેવતા",
        resultPlaceholder: "તમારા ઇષ્ટ દેવતા અહીં દેખાશે",
      },

      naamRashi: {
        title: "નામ રાશિ કેલ્ક્યુલેટર",
        shortDesc: "તમારા નામ પર આધારિત તમારી રાશિ શોધો.",
        findRashi: "મારી નામ રાશિ શોધો",
        yourRashi: "તમારી નામ રાશિ",
        resultPlaceholder: "તમારી નામ રાશિ અહીં દેખાશે",
      },

      gemstones: {
        title: "રત્ન ભલામણો",
        shortDesc: "તમારા ભાગ્યશાળી રત્નો શોધો.",
      },

      kundliCalc: {
        title: "કુંડળી કેલ્ક્યુલેટર",
        shortDesc: "તમારી સંપૂર્ણ વૈદિક જન્મકુંડળી બનાવો.",
      },

      moonSignCalc: {
        title: "ચંદ્ર રાશિ કેલ્ક્યુલેટર",
        shortDesc: "તમારી ચંદ્ર રાશિ શોધો.",
      },
    },
  },
  kn: {
    calculator: {
      freeTool: "ಉಚಿತ ಸಾಧನ",
      enterDetails: "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ",
      enterBirthDetails: "ಜನ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ",
      enterName: "ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
      fullName: "ಪೂರ್ಣ ಹೆಸರು",
      enterFullName: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
      dateOfBirth: "ಹುಟ್ಟಿದ ದಿನಾಂಕ",
      timeOfBirth: "ಹುಟ್ಟಿದ ಸಮಯ",
      placeOfBirth: "ಹುಟ್ಟಿದ ಸ್ಥಳ",
      searchCity: "ನಗರವನ್ನು ಹುಡುಕಿ...",
      calculating: "ಲೆಕ್ಕಾಚಾರ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
      calculate: "ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ",
      generate: "ರಚಿಸಿ",
      discover: "ಕಂಡುಹಿಡಿಯಿರಿ",
      find: "ಹುಡುಕಿ",
      explore: "ಅನ್ವೇಷಿಸಿ",

      numerology: {
        title: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        shortDesc: "ನಿಮ್ಮ ಜೀವನ ಮಾರ್ಗ ಮತ್ತು ಭಾಗ್ಯ ಸಂಖ್ಯೆಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.",
        calculate: "ನನ್ನ ಸಂಖ್ಯೆಗಳನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ",
        lifePathNumber: "ಜೀವನ ಮಾರ್ಗ ಸಂಖ್ಯೆ",
        destinyNumber: "ಭಾಗ್ಯ ಸಂಖ್ಯೆ",
        resultPlaceholder: "ನಿಮ್ಮ ಸಂಖ್ಯೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ",
      },

      yantra: {
        title: "ಯಂತ್ರ ಶಿಫಾರಸುಗಳು",
        shortDesc: "ನಿಮಗಾಗಿ ಸರಿಯಾದ ಪವಿತ್ರ ಯಂತ್ರಗಳನ್ನು ಹುಡುಕಿ.",
        getRecommendations: "ಯಂತ್ರ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",
        resultPlaceholder: "ನಿಮ್ಮ ಯಂತ್ರ ಶಿಫಾರಸುಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ",
      },

      rudraksha: {
        title: "ರುದ್ರಾಕ್ಷ ಶಿಫಾರಸುಗಳು",
        shortDesc: "ನಿಮಗಾಗಿ ಸರಿಯಾದ ರುದ್ರಾಕ್ಷ ಮಣಿಗಳನ್ನು ಹುಡುಕಿ.",
        getRecommendations: "ರುದ್ರಾಕ್ಷ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",
        resultPlaceholder: "ನಿಮ್ಮ ರುದ್ರಾಕ್ಷ ಶಿಫಾರಸುಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ",
      },

      ishtaDevata: {
        title: "ಇಷ್ಟ ದೇವತಾ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        shortDesc: "ನಿಮ್ಮ ಜಾತಕದ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ದೇವತೆಯನ್ನು ಹುಡುಕಿ.",
        findDeity: "ನನ್ನ ಇಷ್ಟ ದೇವತೆಯನ್ನು ಹುಡುಕಿ",
        yourDeity: "ನಿಮ್ಮ ಇಷ್ಟ ದೇವತಾ",
        resultPlaceholder: "ನಿಮ್ಮ ಇಷ್ಟ ದೇವತಾ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ",
      },

      naamRashi: {
        title: "ನಾಮ ರಾಶಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        shortDesc: "ನಿಮ್ಮ ಹೆಸರಿನ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ರಾಶಿಯನ್ನು ಹುಡುಕಿ.",
        findRashi: "ನನ್ನ ನಾಮ ರಾಶಿಯನ್ನು ಹುಡುಕಿ",
        yourRashi: "ನಿಮ್ಮ ನಾಮ ರಾಶಿ",
        resultPlaceholder: "ನಿಮ್ಮ ನಾಮ ರಾಶಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ",
      },

      gemstones: {
        title: "ರತ್ನ ಶಿಫಾರಸುಗಳು",
        shortDesc: "ನಿಮ್ಮ ಅದೃಷ್ಟದ ರತ್ನಗಳನ್ನು ಹುಡುಕಿ.",
      },

      kundliCalc: {
        title: "ಕುಂಡಲಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        shortDesc: "ನಿಮ್ಮ ಸಂಪೂರ್ಣ ವೈದಿಕ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ.",
      },

      moonSignCalc: {
        title: "ಚಂದ್ರ ರಾಶಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
        shortDesc: "ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.",
      },
    },
  },
  ml: {
    calculator: {
      freeTool: "സൗജന്യ ടൂൾ",
      enterDetails: "നിങ്ങളുടെ വിശദാംശങ്ങൾ നൽകുക",
      enterBirthDetails: "ജനന വിശദാംശങ്ങൾ നൽകുക",
      enterName: "നിങ്ങളുടെ പേര് നൽകുക",
      fullName: "മുഴുവൻ പേര്",
      enterFullName: "നിങ്ങളുടെ മുഴുവൻ പേര് നൽകുക",
      dateOfBirth: "ജനന തീയതി",
      timeOfBirth: "ജനന സമയം",
      placeOfBirth: "ജനന സ്ഥലം",
      searchCity: "നഗരം തിരയുക...",
      calculating: "കണക്കുകൂട്ടുന്നു...",
      analyzing: "വിശകലനം ചെയ്യുന്നു...",
      calculate: "കണക്കാക്കുക",
      generate: "സൃഷ്ടിക്കുക",
      discover: "കണ്ടെത്തുക",
      find: "കണ്ടെത്തുക",
      explore: "പര്യവേക്ഷണം ചെയ്യുക",

      numerology: {
        title: "സംഖ്യാശാസ്ത്ര കാൽക്കുലേറ്റർ",
        shortDesc: "നിങ്ങളുടെ ജീവിത പാതയും വിധി സംഖ്യകളും കണ്ടെത്തുക.",
        calculate: "എന്റെ സംഖ്യകൾ കണക്കാക്കുക",
        lifePathNumber: "ജീവിത പാത സംഖ്യ",
        destinyNumber: "വിധി സംഖ്യ",
        resultPlaceholder: "നിങ്ങളുടെ സംഖ്യകൾ ഇവിടെ കാണിക്കും",
      },

      yantra: {
        title: "യന്ത്ര ശുപാർശകൾ",
        shortDesc: "നിങ്ങൾക്കായി ശരിയായ പവിത്ര യന്ത്രങ്ങൾ കണ്ടെത്തുക.",
        getRecommendations: "യന്ത്ര ശുപാർശകൾ നേടുക",
        resultPlaceholder: "നിങ്ങളുടെ യന്ത്ര ശുപാർശകൾ ഇവിടെ കാണിക്കും",
      },

      rudraksha: {
        title: "രുദ്രാക്ഷ ശുപാർശകൾ",
        shortDesc: "നിങ്ങൾക്കായി ശരിയായ രുദ്രാക്ഷ മണികൾ കണ്ടെത്തുക.",
        getRecommendations: "രുദ്രാക്ഷ ശുപാർശകൾ നേടുക",
        resultPlaceholder: "നിങ്ങളുടെ രുദ്രാക്ഷ ശുപാർശകൾ ഇവിടെ കാണിക്കും",
      },

      ishtaDevata: {
        title: "ഇഷ്ട ദേവത കാൽക്കുലേറ്റർ",
        shortDesc: "നിങ്ങളുടെ ജാതകത്തെ അടിസ്ഥാനമാക്കി നിങ്ങളുടെ വ്യക്തിഗത ദേവതയെ കണ്ടെത്തുക.",
        findDeity: "എന്റെ ഇഷ്ട ദേവതയെ കണ്ടെത്തുക",
        yourDeity: "നിങ്ങളുടെ ഇഷ്ട ദേവത",
        resultPlaceholder: "നിങ്ങളുടെ ഇഷ്ട ദേവത ഇവിടെ കാണിക്കും",
      },

      naamRashi: {
        title: "നാമ രാശി കാൽക്കുലേറ്റർ",
        shortDesc: "നിങ്ങളുടെ പേരിനെ അടിസ്ഥാനമാക്കി നിങ്ങളുടെ രാശി കണ്ടെത്തുക.",
        findRashi: "എന്റെ നാമ രാശി കണ്ടെത്തുക",
        yourRashi: "നിങ്ങളുടെ നാമ രാശി",
        resultPlaceholder: "നിങ്ങളുടെ നാമ രാശി ഇവിടെ കാണിക്കും",
      },

      gemstones: {
        title: "രത്ന ശുപാർശകൾ",
        shortDesc: "നിങ്ങളുടെ ഭാഗ്യ രത്നങ്ങൾ കണ്ടെത്തുക.",
      },

      kundliCalc: {
        title: "കുണ്ഡലി കാൽക്കുലേറ്റർ",
        shortDesc: "നിങ്ങളുടെ പൂർണ്ണ വൈദിക ജനന കുണ്ഡലി സൃഷ്ടിക്കുക.",
      },

      moonSignCalc: {
        title: "ചന്ദ്ര രാശി കാൽക്കുലേറ്റർ",
        shortDesc: "നിങ്ങളുടെ ചന്ദ്ര രാശി കണ്ടെത്തുക.",
      },
    },
  },
  pa: {
    calculator: {
      freeTool: "ਮੁਫ਼ਤ ਸਾਧਨ",
      enterDetails: "ਆਪਣੇ ਵੇਰਵੇ ਦਰਜ ਕਰੋ",
      enterBirthDetails: "ਜਨਮ ਵੇਰਵੇ ਦਰਜ ਕਰੋ",
      enterName: "ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ",
      fullName: "ਪੂਰਾ ਨਾਮ",
      enterFullName: "ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦਰਜ ਕਰੋ",
      dateOfBirth: "ਜਨਮ ਮਿਤੀ",
      timeOfBirth: "ਜਨਮ ਸਮਾਂ",
      placeOfBirth: "ਜਨਮ ਸਥਾਨ",
      searchCity: "ਸ਼ਹਿਰ ਖੋਜੋ...",
      calculating: "ਗਣਨਾ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
      analyzing: "ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
      calculate: "ਗਣਨਾ ਕਰੋ",
      generate: "ਬਣਾਓ",
      discover: "ਖੋਜੋ",
      find: "ਲੱਭੋ",
      explore: "ਖੋਜ ਕਰੋ",

      numerology: {
        title: "ਅੰਕ ਵਿਗਿਆਨ ਕੈਲਕੁਲੇਟਰ",
        shortDesc: "ਆਪਣਾ ਜੀਵਨ ਮਾਰਗ ਅਤੇ ਕਿਸਮਤ ਅੰਕ ਖੋਜੋ.",
        calculate: "ਮੇਰੇ ਅੰਕਾਂ ਦੀ ਗਣਨਾ ਕਰੋ",
        lifePathNumber: "ਜੀਵਨ ਮਾਰਗ ਅੰਕ",
        destinyNumber: "ਕਿਸਮਤ ਅੰਕ",
        resultPlaceholder: "ਤੁਹਾਡੇ ਅੰਕ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੇ",
      },

      yantra: {
        title: "ਯੰਤਰ ਸਿਫ਼ਾਰਸ਼ਾਂ",
        shortDesc: "ਤੁਹਾਡੇ ਲਈ ਸਹੀ ਪਵਿੱਤਰ ਯੰਤਰ ਲੱਭੋ.",
        getRecommendations: "ਯੰਤਰ ਸਿਫ਼ਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ",
        resultPlaceholder: "ਤੁਹਾਡੀਆਂ ਯੰਤਰ ਸਿਫ਼ਾਰਸ਼ਾਂ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ",
      },

      rudraksha: {
        title: "ਰੁਦਰਾਕਸ਼ ਸਿਫ਼ਾਰਸ਼ਾਂ",
        shortDesc: "ਤੁਹਾਡੇ ਲਈ ਸਹੀ ਰੁਦਰਾਕਸ਼ ਮਣਕੇ ਲੱਭੋ.",
        getRecommendations: "ਰੁਦਰਾਕਸ਼ ਸਿਫ਼ਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ",
        resultPlaceholder: "ਤੁਹਾਡੀਆਂ ਰੁਦਰਾਕਸ਼ ਸਿਫ਼ਾਰਸ਼ਾਂ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ",
      },

      ishtaDevata: {
        title: "ਇਸ਼ਟ ਦੇਵਤਾ ਕੈਲਕੁਲੇਟਰ",
        shortDesc: "ਆਪਣੀ ਕੁੰਡਲੀ ਦੇ ਆਧਾਰ 'ਤੇ ਆਪਣੇ ਨਿੱਜੀ ਦੇਵਤਾ ਲੱਭੋ.",
        findDeity: "ਮੇਰੇ ਇਸ਼ਟ ਦੇਵਤਾ ਲੱਭੋ",
        yourDeity: "ਤੁਹਾਡੇ ਇਸ਼ਟ ਦੇਵਤਾ",
        resultPlaceholder: "ਤੁਹਾਡੇ ਇਸ਼ਟ ਦੇਵਤਾ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੇ",
      },

      naamRashi: {
        title: "ਨਾਮ ਰਾਸ਼ੀ ਕੈਲਕੁਲੇਟਰ",
        shortDesc: "ਆਪਣੇ ਨਾਮ ਦੇ ਆਧਾਰ 'ਤੇ ਆਪਣੀ ਰਾਸ਼ੀ ਲੱਭੋ.",
        findRashi: "ਮੇਰੀ ਨਾਮ ਰਾਸ਼ੀ ਲੱਭੋ",
        yourRashi: "ਤੁਹਾਡੀ ਨਾਮ ਰਾਸ਼ੀ",
        resultPlaceholder: "ਤੁਹਾਡੀ ਨਾਮ ਰਾਸ਼ੀ ਇੱਥੇ ਦਿਖਾਈ ਦੇਵੇਗੀ",
      },

      gemstones: {
        title: "ਰਤਨ ਸਿਫ਼ਾਰਸ਼ਾਂ",
        shortDesc: "ਆਪਣੇ ਭਾਗਸ਼ਾਲੀ ਰਤਨ ਲੱਭੋ.",
      },

      kundliCalc: {
        title: "ਕੁੰਡਲੀ ਕੈਲਕੁਲੇਟਰ",
        shortDesc: "ਆਪਣੀ ਪੂਰੀ ਵੈਦਿਕ ਜਨਮ ਕੁੰਡਲੀ ਬਣਾਓ.",
      },

      moonSignCalc: {
        title: "ਚੰਦਰ ਰਾਸ਼ੀ ਕੈਲਕੁਲੇਟਰ",
        shortDesc: "ਆਪਣੀ ਚੰਦਰ ਰਾਸ਼ੀ ਖੋਜੋ.",
      },
    },
  },
};

export function deepMergeCalculator(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMergeCalculator(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
