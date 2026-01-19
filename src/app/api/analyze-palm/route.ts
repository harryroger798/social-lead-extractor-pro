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

// Hand shape analysis based on detected features
function analyzeHandShape(predictions: RoboflowPrediction[]): {
  shape: string;
  element: string;
  characteristics: string;
} {
  // Default analysis if we can't determine shape from predictions
  return {
    shape: "Mixed",
    element: "Balanced",
    characteristics: "Your hand shows a balanced combination of elements, indicating adaptability and versatility in life."
  };
}

// Generate comprehensive palm reading from detected lines
function generatePalmReading(predictions: RoboflowPrediction[]): {
  detectedLines: {
    name: string;
    hindi: string;
    confidence: number;
    meaning: string;
    interpretation: string;
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
  }[] = [];

  // Process each prediction
  for (const pred of predictions) {
    const lineKey = pred.class.toLowerCase().replace(/\s+/g, "_");
    const lineInfo = lineInterpretations[lineKey];
    
    if (lineInfo) {
      // Select interpretation based on confidence (higher confidence = clearer line)
      const interpretationIndex = pred.confidence > 0.8 ? 0 : 
                                  pred.confidence > 0.6 ? 1 : 2;
      const interpretation = lineInfo.characteristics[
        Math.min(interpretationIndex, lineInfo.characteristics.length - 1)
      ];
      
      detectedLines.push({
        name: lineInfo.name,
        hindi: lineInfo.hindi,
        confidence: Math.round(pred.confidence * 100),
        meaning: lineInfo.meaning,
        interpretation: interpretation.interpretation
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
    handShape: analyzeHandShape(predictions)
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
    
    // Generate palm reading from predictions
    const analysis = generatePalmReading(roboflowData.predictions);

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
