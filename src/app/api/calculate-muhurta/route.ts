import { NextRequest, NextResponse } from "next/server";
import { getCoordinatesFromPlace } from "@/lib/coordinates";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, place, event_type } = body;

    if (!date) {
      return NextResponse.json(
        { error: "Missing required date field" },
        { status: 400 }
      );
    }

    const coords = getCoordinatesFromPlace(place || "Delhi");
    const latitude = coords.lat;
    const longitude = coords.lon;

    const response = await fetch(
      `${BACKEND_URL}/api/muhurta?date=${encodeURIComponent(date)}&latitude=${latitude}&longitude=${longitude}&event_type=${event_type || "general"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: "Failed to calculate Muhurta" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error calculating Muhurta:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
