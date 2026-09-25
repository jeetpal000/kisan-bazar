"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getWeatherInfo } from "@/lib/weather";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, RefreshCw } from "lucide-react";
import WeatherSkeleton from "./ui/WeatherCardSkelton";
import { toast } from "react-toastify";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WeatherCard = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [locationName, setLocationName] = useState("");

  const weatherInfo = getWeatherInfo(weather?.current?.weather_code);

  // --------------------------------------------------
  // FETCH WEATHER BY LAT / LON
  // --------------------------------------------------

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

      const result = await res.json();

      if (!res.ok || !result.success) {
        console.error(result);
        return false;
      }

      setWeather(result.weather);
      setLocation(result.location);

      return true;
    } catch (error) {
      console.error("Weather fetch error:", error);
      return false;
    } finally {
      setLoading(false);
      setSearching(false);
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // SEARCH LOCATION BY NAME
  // --------------------------------------------------

  const searchLocation = async () => {
    const name = locationName.trim();

    if (!name) return;

    try {
      setSearching(true);

      const res = await fetch(
        `/api/weather/geocode?name=${encodeURIComponent(name)}`,
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Location not found", {
          position: "bottom-right",
          autoClose: 2500,
        });
        setSearching(false);
        return;
      }

      /*
        Save:
        - type
        - name
        - lat
        - lon
      */

      const savedLocation = {
        type: "manual",
        name: data.name,
        lat: data.lat,
        lon: data.lon,
      };

      localStorage.setItem("weather-location", JSON.stringify(savedLocation));

      setLocationName(data.name);

      // Weather fetch
      await fetchWeather(data.lat, data.lon);
    } catch (error) {
      console.error("Location search error:", error);
      setSearching(false);
    }
  };

  // --------------------------------------------------
  // REFRESH CURRENT WEATHER
  // --------------------------------------------------

  const refreshWeather = async () => {
    if (!location) return;

    const lat = location.lat;
    const lon = location.lon;

    if (!lat || !lon) return;

    try {
      setRefreshing(true);

      await fetchWeather(lat, lon);
    } catch (error) {
      console.error("Refresh error:", error);
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // GET LOCATION BY IP
  // --------------------------------------------------

  const getLocationByIP = async () => {
    try {
      const res = await fetch("/api/weather/location");

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "weather-location",
        JSON.stringify({
          type: "ip",
          name: data.city || "",
          lat: data.lat,
          lon: data.lon,
        }),
      );

      setLocationName(data.city || "");

      await fetchWeather(data.lat, data.lon);
    } catch (error) {
      console.error("IP location error:", error);
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOCATION
  // --------------------------------------------------

  useEffect(() => {
    const loadInitialWeather = async () => {
      const saved = localStorage.getItem("weather-location");

      if (saved) {
        try {
          const data = JSON.parse(saved);

          if (data.type === "manual" && data.name && data.lat && data.lon) {
            setLocationName(data.name);

            await fetchWeather(data.lat, data.lon);

            return;
          }

          if (data.lat && data.lon) {
            setLocationName(data.name || "");

            await fetchWeather(data.lat, data.lon);

            return;
          }
        } catch (error) {
          console.error("Invalid saved weather location:", error);

          localStorage.removeItem("weather-location");
        }
      }

      if (!navigator.geolocation) {
        await getLocationByIP();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          localStorage.setItem(
            "weather-location",
            JSON.stringify({
              type: "gps",
              name: "",
              lat,
              lon,
            }),
          );

          await fetchWeather(lat, lon);
        },

        async (error) => {
          await getLocationByIP();
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    };

    loadInitialWeather();
  }, []);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return <WeatherSkeleton />;
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="bg-[#026d04b4] backdrop-blur-2xl max-w-3xl mx-auto rounded-md p-2 text-white">
      {/* SEARCH + REFRESH */}

      <div className="flex items-center gap-2 mx-auto w-full md:w-1/2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter location"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchLocation();
              }
            }}
            className="pr-16 text-sm md:text-sm"
          />

          {/* Clear + Search buttons */}
          {isInputFocused && locationName && (
            <Button
              type="button"
              variant="ghost"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setLocationName("")}
              className="absolute right-9 top-1/2 bg-black/20 -translate-y-1/2 h-8 w-8 p-0"
            >
              ×
            </Button>
          )}

          <Button
            type="button"
            onClick={searchLocation}
            disabled={searching}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <Search size={18} className={searching ? "animate-pulse" : ""} />
          </Button>
        </div>

        {/* Refresh */}
        <Button
          type="button"
          onClick={refreshWeather}
          disabled={refreshing}
          className="h-9 w-9 p-0"
          title="Refresh weather"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* WEATHER */}

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* CURRENT WEATHER */}

        <div className="col-span-1 md:border-r border-gray-500 p-2">
          <h3 className="text-sm md:text-base">📍 {location?.display_name}</h3>

          <p className="mt-2 text-sm md:text-base">
            Today, {weather?.current?.time?.split("T").reverse()[1]}
          </p>

          <div className="flex gap-2 items-start mt-4">
            <Image
              src={weatherInfo.icon}
              alt={weatherInfo.text}
              width={120}
              height={120}
            />

            <div className="space-y-2">
              <h1 className="font-bold text-2xl flex items-start">
                {weather?.current?.temperature_2m}

                <span className="text-sm">°C</span>
              </h1>

              <p className="font-semibold text-sm md:text-base">
                {weatherInfo.text}
              </p>

              <p className="text-sm">
                Feels like {weather?.current?.apparent_temperature}
                °C
              </p>
            </div>
          </div>
        </div>

        {/* WEATHER DETAILS */}

        <div className="text-sm md:text-base col-span-1 pl-2 pt-1 space-y-1 flex items-center justify-around md:flex-col">
          <div className="space-y-1 flex flex-col md:flex-row w-full items-center justify-around ">
            <p>💧 Humidity</p>

            <p>
              {weather?.current?.relative_humidity_2m}
              {weather?.current_units?.relative_humidity_2m}
            </p>
          </div>

          <div className="space-y-2 flex flex-col md:flex-row w-full items-center justify-around border-l md:border-0">
            <p>☔ Rainfall</p>

            <p>
              {weather?.current?.precipitation}
              {weather?.current_units?.precipitation}
            </p>
          </div>

          <div className="space-y-2 flex flex-col md:flex-row w-full items-center justify-around border-l md:border-0">
            <p>💨 Wind</p>

            <p>
              {weather?.current?.wind_speed_10m}{" "}
              {weather?.current_units?.wind_speed_10m}
            </p>
          </div>

          <div className="space-y-2 flex flex-col md:flex-row w-full items-center justify-around border-l md:border-0  ">
            <p>🔆 UV Index</p>

            <p>
              {weather?.current?.uv_index}
              {weather?.current_units?.uv_index}
            </p>
          </div>
        </div>

        {/* 7 DAY FORECAST */}

        <div className="col-span-1 md:col-span-2  overflow-hidden">
          <div className="border-b p-2 flex justify-between">
            <p>7 Day Forecast</p>
          </div>

          <div className="flex gap-5 items-center justify-between p-2 overflow-x-auto scrollbar-hide">
            {weather?.daily?.time?.map((day, index) => {
              const info = getWeatherInfo(weather.daily.weather_code[index]);

              const dayName = weekDays[new Date(day).getDay()];

              const today = weekDays[new Date().getDay()];

              return (
                <div
                  key={day}
                  className={`flex flex-col items-center justify-center ${
                    dayName === today ? "bg-white/30 rounded-md px-4" : ""
                  }`}
                >
                  <p className="text-sm md:text-base">{dayName}</p>

                  <Image
                    src={info.icon}
                    width={40}
                    height={40}
                    alt={info.text}
                  />

                  <p className="flex items-start text-xs md:text-base mb-1">
                    {Math.round(weather.daily.temperature_2m_max[index])}

                    <span className="text-xs">
                      {weather.daily_units?.temperature_2m_max}
                    </span>
                  </p>

                  <p className="flex items-start text-xs sm:text-base">
                    {Math.round(weather.daily.temperature_2m_min[index])}

                    <span className="text-xs">
                      {weather.daily_units?.temperature_2m_min}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
