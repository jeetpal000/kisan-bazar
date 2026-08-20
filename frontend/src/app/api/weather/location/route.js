import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://ipwho.is/", {
      cache: "no-store"
    });

    const data = await res.json();

    return NextResponse.json({
      success: true,
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      state: data.region,
      country: data.country_name
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}