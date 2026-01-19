import { NextRequest, NextResponse } from "next/server";

// Roboflow API configuration
// Use Private API Key for server-side inference (not Publishable Key which is client-side only)
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY || "zMz0kWTjOf514ZL88sz5";
const ROBOFLOW_MODEL_ID = "palmistry-g45zz/1"; // Using palmistry model with 6.7k images, detects: fate, head, heart, life

interface RoboflowPrediction {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  points?: { x: number; y: number }[];
}

interface RoboflowResponse {
  predictions: RoboflowPrediction[];
  time: number;
  image: {
    width: number;
    height: number;
  };
}

// Palm line interpretations based on traditional Vedic palmistry
// Keys include both formats: "heart" (from palmistry-g45zz model) and "heart_line" (legacy)
const lineInterpretations: Record<string, {
  name: string;
  hindi: string;
  meaning: string;
  characteristics: { condition: string; interpretation: string }[];
}> = {
  "heart": {
    name: "Heart Line",
    hindi: "हृदय रेखा",
    meaning: "Represents emotional life, relationships, and cardiac health",
    characteristics: [
      { condition: "Clear and deep", interpretation: "Strong emotional nature, passionate in relationships" },
      { condition: "Long line", interpretation: "Expressive of feelings, romantic, warm-hearted" },
      { condition: "Short line", interpretation: "Practical in love, prefers actions over words" },
      { condition: "Curved line", interpretation: "Emotionally expressive, wears heart on sleeve" },
      { condition: "Straight line", interpretation: "Logical approach to relationships, reserved emotions" }
    ]
  },
  "head": {
    name: "Head Line",
    hindi: "मस्तिष्क रेखा",
    meaning: "Represents intellect, learning style, and communication",
    characteristics: [
      { condition: "Clear and deep", interpretation: "Strong mental abilities, focused thinker" },
      { condition: "Long line", interpretation: "Clear thinker, analytical, successful in academics" },
      { condition: "Short line", interpretation: "Prefers physical achievements over mental pursuits" },
      { condition: "Curved line", interpretation: "Creative, artistic, imaginative mind" },
      { condition: "Straight line", interpretation: "Practical, logical, realistic thinker" }
    ]
  },
  "life": {
    name: "Life Line",
    hindi: "जीवन रेखा",
    meaning: "Represents vitality, life changes, and physical health (NOT length of life)",
    characteristics: [
      { condition: "Clear and deep", interpretation: "Strong vitality, good health, stable life" },
      { condition: "Long line", interpretation: "High energy, enthusiasm for life" },
      { condition: "Short line", interpretation: "May need to focus more on health and energy" },
      { condition: "Wide curve", interpretation: "Generous, warm personality, loves life" },
      { condition: "Close to thumb", interpretation: "May experience fatigue, needs rest" }
    ]
  },
  "fate": {
    name: "Fate Line",
    hindi: "भाग्य रेखा",
    meaning: "Represents career, life path, and destiny",
    characteristics: [
      { condition: "Clear and deep", interpretation: "Strong sense of destiny, clear life path" },
      { condition: "Long line", interpretation: "Career-focused, strong professional drive" },
      { condition: "Broken line", interpretation: "Career changes, life transitions ahead" },
      { condition: "Multiple lines", interpretation: "Multiple careers or diverse interests" },
      { condition: "Absent", interpretation: "Free will dominates, creates own path" }
    ]
  },
  "heart_line": {
    name: "Heart Line",
    hindi: "हृदय रेखा",
    meaning: "Represents emotional life, relationships, and cardiac health",
    characteristics: [
      { condition: "Clear and deep", interpretation: "Strong emotional nature, passionate in relationships" },
      { condition: "Long line", interpretation: "Expressive of feelings, romantic, warm-hearted" },
      { condition: "Short line", interpretation: "Practical in love, prefers actions over words" },
      { condition: "Curved line", interpretation: "Emotionally expressive, wears heart on sleeve" },
      { condition: "Straight line", interpretation: "Logical approach to relationships, reserved emotions" }
    ]
  },
  "head_line": {
    name: "Head Line",
    hindi: "मस्तिष्क रेखा",
    meaning: "Represents intellect, learning style, and communication",
    characteristics: [
      { condition: "Clear and deep", interpretation: "Strong mental abilities, focused thinker" },
      { condition: "Long line", interpretation: "Clear thinker, analytical, successful in academics" },
      { condition: "Short line", interpretation: "Prefers physical achievements over mental pursuits" },
      { condition: "Curved line", interpretation: "Creative, artistic, imaginative mind" },
      { condition: "Straight line", interpretation: "Practical, logical, realistic thinker" }
    ]
  },
  "life_line": {
    name: "Life Line",
    hindi: "जीवन रेखा",
    meaning: "Represents vitality, life changes, and physical health (NOT length of life)",
    characteristics: [
      { condition: "Clear and deep", interpretation: "Strong vitality, good health, stable life" },
      { condition: "Long line", interpretation: "High energy, enthusiasm for life" },
      { condition: "Short line", interpretation: "May need to focus more on health and energy" },
      { condition: "Wide curve", interpretation: "Generous, warm personality, loves life" },
      { condition: "Close to thumb", interpretation: "May experience fatigue, needs rest" }
    ]
  },
  "fate_line": {
    name: "Fate Line",
    hindi: "भाग्य रेखा",
    meaning: "Represents career, life path, and destiny",
    characteristics: [
      { condition: "Clear and deep", interpretation: "Strong sense of destiny, clear life path" },
      { condition: "Long line", interpretation: "Career-focused, strong professional drive" },
      { condition: "Broken line", interpretation: "Career changes, life transitions ahead" },
      { condition: "Multiple lines", interpretation: "Multiple careers or diverse interests" },
      { condition: "Absent", interpretation: "Free will dominates, creates own path" }
    ]
  },
  "sun_line": {
    name: "Sun Line",
    hindi: "सूर्य रेखा",
    meaning: "Represents fame, success, and creativity",
    characteristics: [
      { condition: "Clear and deep", interpretation: "Success, fame, good reputation likely" },
      { condition: "Long line", interpretation: "Strong creative abilities, artistic talent" },
      { condition: "Multiple lines", interpretation: "Many talents, diverse creative interests" },
      { condition: "Absent", interpretation: "Success through hard work rather than luck" }
    ]
  },
  "marriage_line": {
    name: "Marriage Line",
    hindi: "विवाह रेखा",
    meaning: "Represents significant relationships and marriage",
    characteristics: [
      { condition: "Clear and deep", interpretation: "Strong, meaningful relationships" },
      { condition: "Long line", interpretation: "Long-lasting, committed relationship" },
      { condition: "Short line", interpretation: "Brief but significant relationships" },
      { condition: "Multiple lines", interpretation: "Multiple significant relationships in life" }
    ]
  }
};

// Analyze line characteristics based on bounding box dimensions
function analyzeLineCharacteristics(
  pred: RoboflowPrediction,
  imageWidth: number,
  imageHeight: number
): { condition: string; isLong: boolean; isDeep: boolean; isCurved: boolean } {
  // Normalize dimensions relative to image size
  const normalizedWidth = pred.width / imageWidth;
  const normalizedHeight = pred.height / imageHeight;
  const aspectRatio = pred.width / pred.height;
  
  // Determine line characteristics based on bounding box
  // A longer line will have a larger width (for horizontal lines) or height (for vertical lines)
  const isLong = normalizedWidth > 0.25 || normalizedHeight > 0.25;
  
  // A deeper/clearer line will have higher confidence
  const isDeep = pred.confidence > 0.85;
  
  // A curved line will have a more square aspect ratio (width ≈ height)
  // A straight line will be more elongated (very different width vs height)
  const isCurved = aspectRatio > 0.5 && aspectRatio < 2.0;
  
  // Determine the primary condition
  let condition: string;
  if (isDeep && isLong) {
    condition = "Clear and deep";
  } else if (isLong && isCurved) {
    condition = "Long line";
  } else if (!isLong) {
    condition = "Short line";
  } else if (isCurved) {
    condition = "Curved line";
  } else {
    condition = "Straight line";
  }
  
  return { condition, isLong, isDeep, isCurved };
}

// Generate personalized interpretation based on line characteristics
function getPersonalizedInterpretation(
  lineType: string,
  characteristics: { condition: string; isLong: boolean; isDeep: boolean; isCurved: boolean },
  confidence: number
): string {
  const interpretations: Record<string, Record<string, string[]>> = {
    heart: {
      "Clear and deep": [
        "You have a strong emotional nature with deep capacity for love and meaningful connections.",
        "Your heart line shows exceptional clarity, indicating genuine emotional depth and sincerity in relationships."
      ],
      "Long line": [
        "You are expressive with your feelings and have a warm, romantic nature that draws others to you.",
        "Your extended heart line suggests you wear your heart on your sleeve and form lasting emotional bonds."
      ],
      "Short line": [
        "You tend to be practical in matters of love, preferring actions over words to show affection.",
        "Your heart line indicates a reserved emotional nature - you express love through deeds rather than declarations."
      ],
      "Curved line": [
        "You are emotionally expressive and intuitive, often understanding others' feelings before they speak.",
        "Your curved heart line reveals a naturally empathetic personality with strong emotional intelligence."
      ],
      "Straight line": [
        "You approach relationships with logic and careful consideration, valuing stability over passion.",
        "Your straight heart line indicates a thoughtful approach to love - you analyze before committing."
      ]
    },
    head: {
      "Clear and deep": [
        "You possess strong mental abilities with excellent focus and analytical thinking.",
        "Your clear head line indicates sharp intellect and the ability to concentrate deeply on complex problems."
      ],
      "Long line": [
        "You are a clear thinker with strong analytical abilities, likely successful in academic or intellectual pursuits.",
        "Your extended head line suggests a methodical mind that excels at planning and strategic thinking."
      ],
      "Short line": [
        "You prefer hands-on learning and practical achievements over theoretical knowledge.",
        "Your head line indicates you learn best through experience and action rather than study."
      ],
      "Curved line": [
        "You have a creative and imaginative mind, often thinking outside conventional boundaries.",
        "Your curved head line reveals artistic tendencies and innovative problem-solving abilities."
      ],
      "Straight line": [
        "You are a practical, logical thinker who values facts and realistic approaches.",
        "Your straight head line indicates a grounded intellect that excels at systematic analysis."
      ]
    },
    life: {
      "Clear and deep": [
        "You have strong vitality and good health, with a stable and grounded approach to life.",
        "Your clear life line indicates robust physical energy and resilience through life's challenges."
      ],
      "Long line": [
        "You possess high energy and enthusiasm for life, with a zest for new experiences.",
        "Your extended life line suggests longevity of spirit and sustained vitality throughout your journey."
      ],
      "Short line": [
        "You may benefit from focusing more on health and energy management in your daily routine.",
        "Your life line suggests you should prioritize rest and self-care to maintain your vitality."
      ],
      "Curved line": [
        "You have a generous, warm personality with a natural love for life and its pleasures.",
        "Your curved life line reveals an adventurous spirit and openness to life's experiences."
      ],
      "Straight line": [
        "You approach life with caution and careful planning, preferring security over risk.",
        "Your life line indicates a measured approach to life decisions, valuing stability."
      ]
    },
    fate: {
      "Clear and deep": [
        "You have a strong sense of destiny and purpose, with a clear direction in life.",
        "Your clear fate line indicates you are on a well-defined path toward your life goals."
      ],
      "Long line": [
        "You are career-focused with strong professional drive and ambition.",
        "Your extended fate line suggests a lifelong dedication to your chosen path or profession."
      ],
      "Short line": [
        "You may experience career changes or life transitions that redirect your path.",
        "Your fate line indicates flexibility in your life direction - you adapt to new opportunities."
      ],
      "Curved line": [
        "Your life path may take unexpected turns, leading to diverse experiences and growth.",
        "Your curved fate line suggests a non-linear journey with meaningful detours along the way."
      ],
      "Straight line": [
        "You follow a direct path toward your goals with determination and focus.",
        "Your straight fate line indicates unwavering commitment to your chosen direction in life."
      ]
    }
  };
  
  const lineInterpretations = interpretations[lineType];
  if (!lineInterpretations) {
    return "This line reveals important aspects of your personality and life path.";
  }
  
  const conditionInterpretations = lineInterpretations[characteristics.condition];
  if (!conditionInterpretations) {
    return lineInterpretations["Clear and deep"]?.[0] || "This line reveals important aspects of your personality.";
  }
  
  // Select interpretation based on confidence to add variety
  const index = confidence > 0.85 ? 0 : 1;
  return conditionInterpretations[Math.min(index, conditionInterpretations.length - 1)];
}

// Hand shape analysis based on detected features
function analyzeHandShape(predictions: RoboflowPrediction[], imageWidth: number, imageHeight: number): {
  shape: string;
  element: string;
  characteristics: string;
} {
  // Analyze overall palm characteristics from line positions
  if (predictions.length === 0) {
    return {
      shape: "Unknown",
      element: "Unknown",
      characteristics: "Unable to determine hand shape from the image."
    };
  }
  
  // Calculate average line positions and sizes
  const avgWidth = predictions.reduce((sum, p) => sum + p.width, 0) / predictions.length;
  const avgHeight = predictions.reduce((sum, p) => sum + p.height, 0) / predictions.length;
  const normalizedAvgWidth = avgWidth / imageWidth;
  const normalizedAvgHeight = avgHeight / imageHeight;
  
  // Determine hand shape based on line characteristics
  if (normalizedAvgWidth > 0.3 && normalizedAvgHeight > 0.2) {
    return {
      shape: "Earth",
      element: "Practical",
      characteristics: "Your hand shows strong, well-defined lines indicating a practical, grounded nature with reliability and determination."
    };
  } else if (normalizedAvgWidth > 0.25) {
    return {
      shape: "Fire",
      element: "Energetic",
      characteristics: "Your hand reveals dynamic energy and enthusiasm, suggesting a passionate and action-oriented personality."
    };
  } else if (normalizedAvgHeight > 0.2) {
    return {
      shape: "Water",
      element: "Intuitive",
      characteristics: "Your hand indicates deep emotional sensitivity and intuition, with a creative and empathetic nature."
    };
  } else {
    return {
      shape: "Air",
      element: "Intellectual",
      characteristics: "Your hand suggests a quick, analytical mind with strong communication abilities and curiosity."
    };
  }
}

// Generate comprehensive palm reading from detected lines
function generatePalmReading(predictions: RoboflowPrediction[], imageWidth: number, imageHeight: number): {
  detectedLines: {
    name: string;
    hindi: string;
    confidence: number;
    meaning: string;
    interpretation: string;
    condition: string;
  }[];
  overallReading: string;
  handShape: { shape: string; element: string; characteristics: string };
} {
  const detectedLines: {
    name: string;
    hindi: string;
    confidence: number;
    meaning: string;
    interpretation: string;
    condition: string;
  }[] = [];

  // Process each prediction with line characteristic analysis
  for (const pred of predictions) {
    const lineKey = pred.class.toLowerCase().replace(/\s+/g, "_");
    const lineInfo = lineInterpretations[lineKey];
    
    if (lineInfo) {
      // Analyze line characteristics from bounding box
      const characteristics = analyzeLineCharacteristics(pred, imageWidth, imageHeight);
      
      // Get personalized interpretation based on characteristics
      const interpretation = getPersonalizedInterpretation(
        lineKey,
        characteristics,
        pred.confidence
      );
      
      detectedLines.push({
        name: lineInfo.name,
        hindi: lineInfo.hindi,
        confidence: Math.round(pred.confidence * 100),
        meaning: lineInfo.meaning,
        interpretation: interpretation,
        condition: characteristics.condition
      });
    }
  }

  // Generate overall reading
  let overallReading = "";
  if (detectedLines.length === 0) {
    overallReading = "We could not clearly detect palm lines in the uploaded image. Please ensure your palm is well-lit, the image is clear, and your palm is fully visible in the frame.";
  } else {
    overallReading = `We detected ${detectedLines.length} palm line(s) in your image. `;
    
    const hasHeartLine = detectedLines.some(l => l.name === "Heart Line");
    const hasHeadLine = detectedLines.some(l => l.name === "Head Line");
    const hasLifeLine = detectedLines.some(l => l.name === "Life Line");
    const hasFateLine = detectedLines.some(l => l.name === "Fate Line");
    
    if (hasHeartLine && hasHeadLine && hasLifeLine) {
      overallReading += "Your three major lines (Heart, Head, and Life) are visible, indicating a well-balanced personality with strong emotional, intellectual, and physical aspects. ";
    }
    
    if (hasFateLine) {
      overallReading += "The presence of a Fate Line suggests you have a clear sense of purpose and direction in life. ";
    }
    
    overallReading += "Remember, palmistry is an ancient art meant for guidance and self-reflection, not absolute prediction.";
  }

  return {
    detectedLines,
    overallReading,
    handShape: analyzeHandShape(predictions, imageWidth, imageHeight)
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { success: false, error: "Image data is required" },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    // Call Roboflow API
    const roboflowResponse = await fetch(
      `https://detect.roboflow.com/${ROBOFLOW_MODEL_ID}?api_key=${ROBOFLOW_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: base64Image,
      }
    );

    if (!roboflowResponse.ok) {
      const errorText = await roboflowResponse.text();
      console.error("Roboflow API Error:", errorText);
      
      // If Roboflow fails, provide a fallback analysis
      return NextResponse.json({
        success: true,
        analysis: {
          detectedLines: [],
          overallReading: "We encountered an issue analyzing your palm image. Please try again with a clearer image where your palm lines are visible.",
          handShape: {
            shape: "Unknown",
            element: "Unknown",
            characteristics: "Unable to determine hand shape from the image."
          }
        },
        warning: "Image analysis service temporarily unavailable. Please try again."
      });
    }

    const roboflowData: RoboflowResponse = await roboflowResponse.json();
    
    // Generate palm reading from predictions with image dimensions for line analysis
    const analysis = generatePalmReading(
      roboflowData.predictions,
      roboflowData.image.width,
      roboflowData.image.height
    );

    return NextResponse.json({
      success: true,
      analysis,
      rawPredictions: roboflowData.predictions.length,
      processingTime: roboflowData.time
    });

  } catch (error) {
    console.error("Palm Analysis API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze palm image" },
      { status: 500 }
    );
  }
}
