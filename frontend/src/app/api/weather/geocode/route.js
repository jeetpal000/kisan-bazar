import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get("name")?.trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Location name is required",
        },
        { status: 400 }
      );
    }

    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(name)}&` +
      `format=jsonv2&` +
      `limit=5&` +
      `addressdetails=1&` +
      `countrycodes=in`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "KisanBazar/1.0 (admin@kisanbazar.com)",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Geocoding API failed");
    }

    const results = await res.json();

    if (!results.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Location not found",
        },
        { status: 404 }
      );
    }

    const result = results[0];

    return NextResponse.json({
      success: true,

      name: result.display_name,

      lat: Number(result.lat),
      lon: Number(result.lon),

      address: result.address,
    });
  } catch (error) {
    console.error("Geocode error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}