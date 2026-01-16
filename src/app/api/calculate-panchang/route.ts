import { NextRequest, NextResponse } from "next/server";
import { getCoordinatesFromPlace } from "@/lib/coordinates";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Tithi names
const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
];

// Yoga names
const YOGAS = [
  "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
  "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
  "Indra", "Vaidhriti"
];

// Karana names
const KARANAS = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara",
  "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

// Nakshatra names
const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// Calculate Rahu Kaal based on weekday
function calculateRahuKaal(date: Date, sunrise: string, sunset: string): { start: string; end: string } {
  const weekday = date.getDay();
  
  // Rahu Kaal periods for each day (in 8ths of the day from sunrise)
  // Sunday=8, Monday=2, Tuesday=7, Wednesday=5, Thursday=6, Friday=4, Saturday=3
  const rahuPeriods: Record<number, number> = {
    0: 8, // Sunday
    1: 2, // Monday
    2: 7, // Tuesday
    3: 5, // Wednesday
    4: 6, // Thursday
    5: 4, // Friday
    6: 3, // Saturday
  };

  const period = rahuPeriods[weekday];
  
  // Parse sunrise and sunset times
  const [sunriseHour, sunriseMin] = sunrise.split(":").map(Number);
  const [sunsetHour, sunsetMin] = sunset.split(":").map(Number);
  
  const sunriseMinutes = sunriseHour * 60 + sunriseMin;
  const sunsetMinutes = sunsetHour * 60 + sunsetMin;
  const dayLength = sunsetMinutes - sunriseMinutes;
  const periodLength = dayLength / 8;
  
  const startMinutes = sunriseMinutes + (period - 1) * periodLength;
  const endMinutes = startMinutes + periodLength;
  
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };
  
  return {
    start: formatTime(startMinutes),
    end: formatTime(endMinutes),
  };
}

// Calculate approximate sunrise/sunset for a location using simplified algorithm
function calculateSunTimes(date: Date, lat: number, lon: number): { sunrise: string; sunset: string } {
  const D2R = Math.PI / 180;
  
  // Day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  
  // Solar declination (simplified)
  const declination = -23.45 * Math.cos(D2R * (360 / 365) * (dayOfYear + 10));
  
  // Hour angle at sunrise/sunset
  const latRad = lat * D2R;
  const decRad = declination * D2R;
  
  // Calculate hour angle
  let cosHourAngle = -Math.tan(latRad) * Math.tan(decRad);
  
  // Clamp to valid range
  if (cosHourAngle > 1) cosHourAngle = 1;
  if (cosHourAngle < -1) cosHourAngle = -1;
  
  const hourAngle = Math.acos(cosHourAngle) / D2R;
  
  // Solar noon in hours (approximate for IST)
  // IST is UTC+5:30, and solar noon varies by longitude
  const solarNoon = 12 - (lon - 82.5) / 15; // 82.5 is roughly center of IST zone
  
  // Calculate sunrise and sunset times
  const dayLengthHours = (2 * hourAngle) / 15;
  const sunriseHour = solarNoon - dayLengthHours / 2;
  const sunsetHour = solarNoon + dayLengthHours / 2;
  
  const formatTime = (time: number) => {
    // Ensure time is in valid range
    let h = Math.floor(time);
    let m = Math.floor((time - h) * 60);
    if (h < 0) h += 24;
    if (h >= 24) h -= 24;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };
  
  return {
    sunrise: formatTime(sunriseHour),
    sunset: formatTime(sunsetHour),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, location } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Missing required field: date" },
        { status: 400 }
      );
    }

    const dateObj = new Date(date);
    const coords = getCoordinatesFromPlace(location || "Delhi");
    
    // Calculate sunrise/sunset
    const sunTimes = calculateSunTimes(dateObj, coords.lat, coords.lon);
    
    // Calculate Rahu Kaal
    const rahuKaal = calculateRahuKaal(dateObj, sunTimes.sunrise, sunTimes.sunset);

    // Call the FastAPI backend for Moon position (needed for Tithi, Nakshatra)
    const backendResponse = await fetch(`${BACKEND_URL}/api/charts/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Panchang",
        birth_date: date,
        birth_time: "12:00",
        birth_place: location || "Delhi, India",
        latitude: coords.lat,
        longitude: coords.lon,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: "Failed to calculate from backend" },
        { status: 500 }
      );
    }

    const data = await backendResponse.json();
    const chartData = data.chart_data;

    // Get Moon and Sun positions
    const moonPlanet = chartData.planets?.find((p: { name: string }) => p.name === "Moon");
    const sunPlanet = chartData.planets?.find((p: { name: string }) => p.name === "Sun");

    // Calculate Tithi from Moon-Sun angle
    const moonLon = moonPlanet?.longitude || 0;
    const sunLon = sunPlanet?.longitude || 0;
    const moonSunAngle = ((moonLon - sunLon + 360) % 360);
    const tithiIndex = Math.floor(moonSunAngle / 12) % 15;
    const paksha = moonSunAngle < 180 ? "Shukla" : "Krishna";

    // Calculate Yoga from Moon+Sun
    const yogaAngle = (moonLon + sunLon) % 360;
    const yogaIndex = Math.floor(yogaAngle / (360 / 27)) % 27;

    // Calculate Karana (half of Tithi)
    const karanaIndex = Math.floor(moonSunAngle / 6) % 11;

    // Get Nakshatra from Moon position
    const nakshatraIndex = Math.floor(moonLon / (360 / 27)) % 27;

    return NextResponse.json({
      date: date,
      weekday: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
      tithi: {
        name: TITHIS[tithiIndex],
        paksha: paksha,
        number: tithiIndex + 1,
      },
      nakshatra: {
        name: NAKSHATRAS[nakshatraIndex],
        lord: chartData.nakshatra_lord,
      },
      yoga: {
        name: YOGAS[yogaIndex],
      },
      karana: {
        name: KARANAS[karanaIndex],
      },
      sunrise: sunTimes.sunrise,
      sunset: sunTimes.sunset,
      rahu_kaal: rahuKaal,
      moon_sign: chartData.moon_sign,
      sun_sign: chartData.sun_sign,
      calculation_method: chartData.calculation_method,
    });
  } catch (error) {
    console.error("Error calculating panchang:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
