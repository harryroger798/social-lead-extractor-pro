import { NextRequest, NextResponse } from "next/server";
import { getCoordinatesFromPlace } from "@/lib/coordinates";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birth_date, birth_time, birth_place } = body;

    if (!birth_date || !birth_time) {
      return NextResponse.json(
        { error: "Missing required fields: birth_date, birth_time" },
        { status: 400 }
      );
    }

    // Get coordinates from place name
    const coords = getCoordinatesFromPlace(birth_place || "Delhi");

    // Call the FastAPI backend for real astronomical calculations
    const backendResponse = await fetch(`${BACKEND_URL}/api/charts/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "User",
        birth_date: birth_date,
        birth_time: birth_time,
        birth_place: birth_place || "Delhi, India",
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

    return NextResponse.json({
      ascendant: chartData.ascendant,
      ascendant_sanskrit: chartData.ascendant_sanskrit,
      ascendant_degree: chartData.ascendant_degree,
      moon_sign: chartData.moon_sign,
      sun_sign: chartData.sun_sign,
      nakshatra: chartData.nakshatra,
      calculation_method: chartData.calculation_method,
    });
  } catch (error) {
    console.error("Error calculating ascendant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
