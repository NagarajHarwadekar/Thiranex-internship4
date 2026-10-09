
const API = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  forecast: "https://api.open-meteo.com/v1/forecast"
};

const $ = (id) => document.getElementById(id);

const weatherTypes = {
  0: { label: "Clear skies", icon: "☀️" },
  1: { label: "Mostly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Icy fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  56: { label: "Freezing drizzle", icon: "🌧️" },
  57: { label: "Heavy freezing drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌦️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌧️" },
  67: { label: "Heavy freezing rain", icon: "🌧️" },
  71: { label: "Light snowfall", icon: "🌨️" },
  73: { label: "Snowfall", icon: "❄️" },
  75: { label: "Heavy snowfall", icon: "❄️" },
  77: { label: "Snow grains", icon: "❄️" },
  80: { label: "Light rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Heavy rain showers", icon: "🌧️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Heavy snow showers", icon: "❄️" },
  95: { label: "Thunderstorms", icon: "⛈️" },
  96: { label: "Thunderstorms with hail", icon: "⛈️" },
  99: { label: "Heavy thunderstorms", icon: "⛈️" }
};

function weatherFor(code, isDay = true) {
  const type = weatherTypes[code] || { label: "Variable conditions", icon: "🌤️" };
  if (code === 0 && !isDay) return { label: "Clear night", icon: "🌙" };
  if ([1, 2].includes(code) && !isDay) return { label: "Partly cloudy night", icon: "☁️" };
  return type;
}

function rounded(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : "--";
}

function formatTime(value) {
  if (!value) return "--:--";
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatHour(value) {
  if (!value) return "--";
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "numeric", hour12: true });
}

function formatDay(value, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Date(`${value}T12:00:00`).toLocaleDateString([], { weekday: "long" });
}

function formatDate(value, options = { weekday: "long", day: "numeric", month: "long" }) {
  return new Date(value).toLocaleDateString([], options);
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather service returned an error (${response.status}). Please try again.`);
  }
  return response.json();
}

function setStatus(message, state = "ready") {
  const status = $("status-message");
  if (!status) return;

  const colors = {
    ready: "#8ac5a0",
    loading: "#e9a0ba",
    error: "#d97583"
  };

  status.innerHTML = `
    <span class="status-dot" style="background:${colors[state] || colors.ready}"></span>
    <span>${message}</span>
  `;
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value;
}

function setBar(id, percent) {
  const element = $(id);
  if (element) {
    element.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }
}

function getUVDescription(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "UV information unavailable";
  }
  const uv = Number(value);
  if (uv <= 2) return "Low · Minimal protection";
  if (uv <= 5) return "Moderate · Stay mindful";
  if (uv <= 7) return "High · Use sun protection";
  if (uv <= 10) return "Very high · Seek shade";
  return "Extreme · Extra protection needed";
}

function getWindDescription(value) {
  const speed = Number(value);
  if (!Number.isFinite(speed)) return "Wind information unavailable";
  if (speed < 6) return "A gentle breeze";
  if (speed < 20) return "A pleasant breeze";
  if (speed < 35) return "Quite breezy";
  return "Strong winds · Take care";
}

function updateCurrent(data) {
  const current = data.current;
  const daily = data.daily;

  const weather = weatherFor(current.weather_code, current.is_day === 1);
  setText("temperature", rounded(current.temperature_2m));
  setText("feels-like", `${rounded(current.apparent_temperature)}°`);
  setText("weather-description", weather.label);

  setText("humidity", rounded(current.relative_humidity_2m));
  setBar("humidity-bar", Number(current.relative_humidity_2m) || 0);

  setText("wind-speed", rounded(current.wind_speed_10m));
  setText("wind-note", getWindDescription(current.wind_speed_10m));

  const currentUV = current.uv_index ?? daily.uv_index_max?.[0];
  setText("uv-index", currentUV == null ? "--" : rounded(currentUV));
  setText("uv-note", getUVDescription(currentUV));
  setBar("uv-bar", currentUV == null ? 0 : (Number(currentUV) / 11) * 100);

  setText("precipitation", Number(current.precipitation ?? 0).toFixed(1));
  setText("sunrise", formatTime(daily.sunrise?.[0]));
  setText("sunset", formatTime(daily.sunset?.[0]));

  const now = new Date();
  setText("header-date", now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" }));
  setText("full-date", formatDate(now));
}

function renderHourly(data) {
  const container = $("hourly-forecast");
  if (!container) return;

  const times = data.hourly.time;
  const now = Date.now();

  let start = times.findIndex((time) => new Date(time).getTime() >= now - 30 * 60 * 1000);
  if (start < 0) start = 0;

  const hours = times.slice(start, start + 6);

  if (!hours.length) {
    container.innerHTML = '<p class="loading-copy">Hourly forecast is not available.</p>';
    return;
  }

  container.innerHTML = hours.map((time, index) => {
    const i = start + index;
    const type = weatherFor(data.hourly.weather_code[i]);
    const label = index === 0 ? "Now" : formatHour(time);
    const temp = rounded(data.hourly.temperature_2m[i]);
    const rain = rounded(data.hourly.precipitation_probability?.[i] ?? 0);

    return `
      <div class="hour-item">
        <span class="hour-time">${label}</span>
        <span class="hour-icon" role="img" aria-label="${type.label}">${type.icon}</span>
        <span class="hour-temp">${temp}°</span>
        <span class="hour-rain">${rain}% rain</span>
      </div>
    `;
  }).join("");
}

function renderDaily(data) {
  const container = $("daily-forecast");
  if (!container) return;

  const daily = data.daily;

  container.innerHTML = daily.time.slice(0, 5).map((date, index) => {
    const type = weatherFor(daily.weather_code[index]);
    const high = rounded(daily.temperature_2m_max[index]);
    const low = rounded(daily.temperature_2m_min[index]);

    return `
      <div class="forecast-row">
        <div class="forecast-day">
          <span class="forecast-day-icon" role="img" aria-label="${type.label}">${type.icon}</span>
          <span>${formatDay(date, index)}</span>
        </div>
        <span class="forecast-desc">${type.label}</span>
        <span class="forecast-rain">UV ${rounded(daily.uv_index_max?.[index])}</span>
        <div class="forecast-temps">
          <span>${high}°</span>
          <span class="low">${low}°</span>
        </div>
      </div>
    `;
  }).join("");
}

async function searchCity(cityName) {
  const query = cityName.trim();
  if (!query) {
    setStatus("Type a city name to explore its weather.", "error");
    return;
  }

  setStatus(`Finding the forecast for ${query}...`, "loading");

  const searchButton = document.querySelector(".search-button");
  if (searchButton) {
    searchButton.disabled = true;
    searchButton.style.opacity = "0.65";
  }

  try {
    const geocodeURL = `${API.geocoding}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const places = await fetchJSON(geocodeURL);

    if (!places.results?.length) {
      throw new Error(`We couldn't find "${query}". Check the spelling or try another city.`);
    }

    const place = places.results[0];
    const params = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,uv_index",
      hourly: "temperature_2m,precipitation_probability,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max",
      forecast_days: "5",
      timezone: "auto"
    });

    const weatherData = await fetchJSON(`${API.forecast}?${params}`);

    if (!weatherData.current || !weatherData.hourly || !weatherData.daily) {
      throw new Error("The weather service returned incomplete data. Please try again.");
    }

    setText("city-name", place.name);
    const locationDetail = [place.admin1, place.country].filter(Boolean).join(", ");
    setText("location-detail", locationDetail || "Local forecast");

    updateCurrent(weatherData);
    renderHourly(weatherData);
    renderDaily(weatherData);

    const updatedAt = weatherData.current.time
      ? `Updated for ${formatTime(weatherData.current.time)} local time`
      : "Forecast loaded successfully";

    setStatus(`${updatedAt} · Data by Open-Meteo`, "ready");
  } catch (error) {
    setStatus(error.message || "Something went wrong. Please try again.", "error");
  } finally {
    if (searchButton) {
      searchButton.disabled = false;
      searchButton.style.opacity = "1";
    }
  }
}

function initialiseScrollAnimations() {
  const elements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
}

function initialiseNavigation() {
  const links = document.querySelectorAll(".nav-link");
  const sections = [...links]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      links.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  }, { rootMargin: "-20% 0px -65% 0px" });

  sections.forEach((section) => observer.observe(section));
}

document.addEventListener("DOMContentLoaded", () => {
  initialiseScrollAnimations();
  initialiseNavigation();

  const form = $("search-form");
  const input = $("city-input");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    searchCity(input.value);
  });

  searchCity("Bengaluru");
});
