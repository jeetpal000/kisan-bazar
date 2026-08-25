import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        {
          success: false,
          message: "Latitude and Longitude are required",
        },
        { status: 400 }
      );
    }

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&` +
      `longitude=${lon}&` +
      `current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,cloud_cover,uv_index,precipitation&` +
      `hourly=precipitation,precipitation_probability&` +
      `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max&` +
      `forecast_days=7&` +
      `timezone=auto`;

    const geoUrl =
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=jsonv2&lat=${lat}&lon=${lon}`;

    const [weatherRes, geoRes] =
      await Promise.all([
        fetch(weatherUrl, {
          next: {
            revalidate: 600,
          },
        }),

        fetch(geoUrl, {
          headers: {
            "User-Agent":
              "KisanBazar/1.0 (admin@kisanbazar.com)",
            Accept: "application/json",
          },
          cache: "no-store",
        }),
      ]);

    if (!weatherRes.ok) {
      throw new Error("Weather API failed");
    }

    const weather = await weatherRes.json();

    const geo = geoRes.ok
      ? await geoRes.json()
      : null;

    return NextResponse.json({
      success: true,

      weather,

      location: {
        ...(geo || {}),

        lat: Number(lat),
        lon: Number(lon),
      },
    });
  } catch (error) {
    console.error("Weather API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}