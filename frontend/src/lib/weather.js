export const WEATHER = {
  0: {
    text: "Clear Sky",
    icon: "/weather/sunny.svg",
  },

  1: {
    text: "Mainly Clear",
    icon: "/weather/sun-cloud.svg",
  },

  2: {
    text: "Partly Cloudy",
    icon: "/weather/partly-cloudy.svg",
  },

  3: {
    text: "Cloudy",
    icon: "/weather/cloudy.svg",
  },

  45: {
    text: "Fog",
    icon: "/weather/fog.svg",
  },

  48: {
    text: "Dense Fog",
    icon: "/weather/fog.svg",
  },

  51: {
    text: "Light Drizzle",
    icon: "/weather/drizzle.svg",
  },

  53: {
    text: "Drizzle",
    icon: "/weather/drizzle.svg",
  },

  55: {
    text: "Heavy Drizzle",
    icon: "/weather/heavy-rain.svg",
  },

  61: {
    text: "Light Rain",
    icon: "/weather/rain.svg",
  },

  63: {
    text: "Rain",
    icon: "/weather/rain.svg",
  },

  65: {
    text: "Heavy Rain",
    icon: "/weather/heavy-rain.svg",
  },

  66: {
    text: "Freezing Rain",
    icon: "/weather/rain.svg",
  },

  67: {
    text: "Heavy Freezing Rain",
    icon: "/weather/heavy-rain.svg",
  },

  71: {
    text: "Snow",
    icon: "/weather/snow.svg",
  },

  73: {
    text: "Heavy Snow",
    icon: "/weather/snow.svg",
  },

  75: {
    text: "Snowfall",
    icon: "/weather/snow.svg",
  },
  80: {
    text: "Rain Showers",
    icon: "/weather/rain.svg",
  },

  81: {
    text: "Heavy Showers",
    icon: "/weather/heavy-rain.svg",
  },

  82: {
    text: "Violent Showers",
    icon: "/weather/heavy-rain.svg",
  },

  95: {
    text: "Thunderstorm",
    icon: "/weather/thunder.svg",
  },

  96: {
    text: "Thunderstorm + Hail",
    icon: "/weather/thunder-rain.png",
    // icon: "/weather/thunder.svg",
  },

  99: {
    text: "Severe Thunderstorm",
    icon: "/weather/thunder-rain.png",
    // icon: "/weather/thunder.svg",
  },
};

export const getWeatherInfo = (code) => {
  return (
    WEATHER[code] || {
      text: "Loading...",
      icon: "/weather/cloudy.svg",
    }
  );
};