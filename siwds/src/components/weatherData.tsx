// import React, { useState, useEffect } from "react";

// interface WeatherData {
//   temperature: number;
//   humidity: number;
//   windSpeed: number;
//   description: string;
//   icon: string;
// }

// const WeatherWidget = () => {
//   const [weather, setWeather] = useState<WeatherData | null>(null);

//   useEffect(() => {
//     const fetchWeather = async () => {
//       const API_KEY = "your_openweather_api_key"; // Replace with your API key
//       const response = await fetch(
//         `https://api.openweathermap.org/data/2.5/weather?q=Paro,BT&units=metric&appid=${API_KEY}`
//       );
//       const data = await response.json();

//       setWeather({
//         temperature: data.main.temp,
//         humidity: data.main.humidity,
//         windSpeed: data.wind.speed,
//         description: data.weather[0].description,
//         icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
//       });
//     };

//     fetchWeather();
//   }, []);

//   return (
//     weather && (
//       <div className="flex items-center justify-between bg-blue-500 text-white p-4 rounded-lg shadow-md">
//         <div className="flex items-center">
//           <img
//             src={weather.icon}
//             alt={weather.description}
//             className="w-16 h-16"
//           />
//           <div className="ml-4">
//             <h3 className="text-lg font-semibold">Paro District</h3>
//             <p>{weather.description}</p>
//             <p className="text-2xl font-bold">{weather.temperature}°C</p>
//           </div>
//         </div>
//         <div>
//           <p>Wind: {weather.windSpeed} km/h</p>
//           <p>Humidity: {weather.humidity}%</p>
//         </div>
//       </div>
//     )
//   );
// };

// export default WeatherWidget;
