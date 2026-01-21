import { NextRequest, NextResponse } from "next/server";
import { getCoordinatesFromPlace } from "@/lib/coordinates";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, birth_date, birth_time, birth_place } = body;

    if (!birth_date || !birth_time || !birth_place) {
      return NextResponse.json(
        { error: "Missing required fields: birth_date, birth_time, birth_place" },
        { status: 400 }
      );
    }

    // Get coordinates from place name
    const coords = getCoordinatesFromPlace(birth_place);

    // Call the FastAPI backend for real astronomical calculations
    const backendResponse = await fetch(`${BACKEND_URL}/api/charts/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name || "User",
        birth_date: birth_date,
        birth_time: birth_time,
        birth_place: birth_place,
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
    
    return NextResponse.json({
      id: data.id,
      share_token: data.share_token,
      chart_data: data.chart_data,
    });
  } catch (error) {
    console.error("Error calculating chart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
