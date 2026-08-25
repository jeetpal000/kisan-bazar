import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://ipwho.is/",
      {
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to detect location",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,

      lat: data.latitude,
      lon: data.longitude,

      city: data.city,
      state: data.region,
      country: data.country_name,
    });
  } catch (error) {
    console.error("IP location error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}