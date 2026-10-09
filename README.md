
# Atmos — Weather, with a Softer Touch

Atmos is a responsive weather dashboard built with HTML, CSS, and vanilla JavaScript. It combines real-time weather information with a clean white and blush-pink interface.

## Features

- Search for cities around the world
- Current temperature and feels-like temperature
- Humidity, wind speed, UV index, and precipitation
- Six upcoming hourly forecast entries
- Five-day weather forecast
- Sunrise and sunset times
- Weather descriptions and icons
- Responsive desktop, tablet, and mobile layouts
- Smooth scroll-reveal animations
- Interactive buttons, navigation, and hover effects
- Loading states and API error handling
- No API key, database, or framework required

## Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API and async/await
- Open-Meteo Weather API
- Open-Meteo Geocoding API

## Project Structure

```text
Atmos-Weather-Dashboard/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run Locally

1. Download or clone the project.
2. Open the project folder in VS Code.
3. Open `index.html` in a browser, or use the Live Server extension in VS Code.
4. Search for a city to view its weather.

An internet connection is required to load the weather data and external fonts.

## APIs Used

### Geocoding API

Converts a city name into geographic coordinates.

https://geocoding-api.open-meteo.com/v1/search

### Forecast API

Provides current conditions, hourly weather, and daily forecasts.

https://api.open-meteo.com/v1/forecast

Weather data is provided by [Open-Meteo](https://open-meteo.com/).

## JavaScript Concepts Demonstrated

- Fetch API and HTTP error handling
- Async functions and await
- Promises and try/catch/finally
- JSON parsing and nested objects
- Dynamic HTML rendering
- DOM manipulation and event listeners
- URLSearchParams and URL encoding
- Intersection Observer API
- Responsive and accessible interface patterns

## Project Information

**Project:** Atmos — Weather Dashboard  
**Developer:** Nagaraj Harwadekar  
**Stack:** HTML, CSS, JavaScript  
**Data provider:** Open-Meteo

---

Built with curiosity and a little love for the weather.