"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getWeatherInfo } from "@/lib/weather";
import WeatherSkeleton from "./ui/WeatherCardSkelton";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WeatherCard = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const weatherInfo = getWeatherInfo(weather?.current?.weather_code);

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const result = await res.json();
      if (!res.ok) {
        console.error(result);
        return;
      }

      if (result.success) {
        setWeather(result.weather);
        setLocation(result.location);
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("weather-location");
    if (saved) {
      const data = JSON.parse(saved);
      fetchWeather(data.lat, data.lon);
      return;
    }
    if (!navigator.geolocation) {
      getLocationByIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        sessionStorage.setItem(
          "weather-location",
          JSON.stringify({
            lat,
            lon,
          }),
        );

        fetchWeather(lat, lon);
      },
      (error) => {
        console.log("Location Denied:", error);

        getLocationByIP();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, []);
  const getLocationByIP = async () => {
    try {
      const res = await fetch("/api/weather/location");
      const data = await res.json();

      if (!data.success) return;

      sessionStorage.setItem(
        "weather-location",
        JSON.stringify({
          lat: data.lat,
          lon: data.lon,
        }),
      );

      fetchWeather(data.lat, data.lon);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <WeatherSkeleton />;
  return (
    <div className="bg-[#026d04b4] backdrop-blur-2xl rounded-md p-2 grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-6 text-[white]">
      <div className="col-span-1 md:col-span-2 border-r border-[gray]">
        <h3 className="text-sm md:text-md ">📍{location?.display_name}</h3>
        <p className="mt-2 text-sm md:text-md">
          Today, {weather?.current?.time.split("T").reverse()[1]}
        </p>
        <div className="flex gap-2 items-starts mt-4">
          <Image src={weatherInfo.icon} alt="hhh" width={120} height={120} />
          <div className="space-y-2">
            <h1 className="font-bold text-2xl flex items-start">
              {weather?.current?.temperature_2m}
              <span className="text-sm"> °C</span>
            </h1>
            <p className="font-semibold text-sm md:text-md">
              {weatherInfo.text}
            </p>
            <p className="text-sm">
              Feels like {weather?.current?.apparent_temperature}°C
            </p>
          </div>
        </div>
      </div>
      <div className="text-sm md:text-md col-span-1 lg:not-first:border-r border-[#808080] pl-2 pt-2 space-y-2">
        <div className="">
          <p className="">💧Humidity</p>
          <p className="pl-6">
            {weather?.current?.relative_humidity_2m}
            {weather?.current_units?.relative_humidity_2m}
          </p>
        </div>
        <div className="">
          <p className="">☔Railfall</p>
          <p className="pl-6">
            {weather?.current?.precipitation}
            {weather?.current_units?.precipitation}
          </p>
        </div>
        <div className="">
          <p className="">💨Wind</p>
          <p className="pl-6">
            {weather?.current?.wind_speed_10m}{" "}
            {weather?.current_units?.wind_speed_10m}
          </p>
        </div>
        <div className="">
          <p className="">🔆UV Index</p>
          <p className="pl-6">
            {weather?.current?.uv_index}
            {weather?.current_units?.uv_index}
          </p>
        </div>
      </div>
      <div className="col-span-3 lg:col-span-3 pt-2">
        <div className="border-b p-2 flex justify-between">
          <p className="">7 day Forecast</p>
          <p className="">View All {">"} </p>
        </div>
        <div className="flex gap-2 items-center justify-between p-2 ">
          {weather?.daily?.time?.map((day, index) => {
            const info = getWeatherInfo(weather.daily.weather_code[index]);
            const dayName = weekDays[new Date(day).getDay()];
            const today = weekDays[new Date().getDay()];

            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center ${dayName === today ? "bg-black/30 rounded-md px-2 " : ""} `}
              >
                <p className="text-sm md:text-md">{dayName}</p>
                <Image src={info.icon} width={40} height={40} alt={info.text} />

                <p className="flex items-start text-sm md:text-md">
                  {Math.round(weather.daily.temperature_2m_max[index])}
                  <span className="text-xs">
                    {weather.daily_units?.temperature_2m_max}
                  </span>
                </p>

                <p className="flex items-start">
                  {Math.round(weather.daily.temperature_2m_min[index])}
                  <span className="text-xs">
                    {weather.daily_units?.temperature_2m_max}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
