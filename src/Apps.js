import React, { useState, useEffect } from 'react';
import { Wind, CloudRain, Sun, Cloud, Fish, CalendarDays, Clock, Waves, X, Lightbulb, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Main App component
const App = () => {
    // State to hold weather data
    const [weatherData, setWeatherData] = useState([]);
    // State to hold current weather display (e.g., wind direction)
    const [currentWeather, setCurrentWeather] = useState(null);
    // State to hold the day selected for detailed 24-hour forecast
    const [selectedDay, setSelectedDay] = useState(null);
    // State for the generated fishing tip
    const [fishingTip, setFishingTip] = useState('');
    // State to indicate if the tip is being loaded
    const [loadingTip, setLoadingTip] = useState(false);

    // Define the custom animations CSS
    const animationsCss = `
        @keyframes strongFlashRed {
            0% { background-color: #ef4444 !important; } /* Tailwind red-500 */
            50% { background-color: #1a202c !important; } /* Very dark grey/almost black for high contrast */
            100% { background-color: #ef4444 !important; }
        }
        .flash-red {
            animation: strongFlashRed 0.7s infinite alternate; /* Slightly faster animation */
        }

        @keyframes subtleFlashOrange {
            0% { background-color: #fbbf24 !important; } /* Tailwind amber-400 */
            50% { background-color: #4b5563 !important; } /* A darker grey for contrast with amber */
            100% { background-color: #fbbf24 !important; }
        }
        .flash-orange {
            animation: subtleFlashOrange 1s infinite alternate; /* Slower, less aggressive animation */
        }

        /* New animations for subtle wind effect on main tile */
        @keyframes windyLow {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
        .windy-low {
            background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.05) 100%);
            background-size: 200% 100%;
            animation: windyLow 15s infinite linear;
        }

        @keyframes windyModerate {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
        .windy-moderate {
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.1) 100%);
            background-size: 200% 100%;
            animation: windyModerate 10s infinite linear;
        }

        @keyframes windyHigh {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
        .windy-high {
            background: linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.15) 100%);
            background-size: 200% 100%;
            animation: windyHigh 5s infinite linear;
        }
    `;

    /**
     * Generates mock weather and tide data for 7 days starting from the current date.
     * This makes the dates dynamic, so "today" always reflects the current date.
     */
    const generateDynamicMockData = () => {
        const data = [];
        const today = new Date(); // Get the actual current date

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i); // Increment date for each day

            // Simple pseudo-random variations for mock data
            // Ensure first day's wind speed is within subtle animation range
            const windSpeed = (i === 0) ? 15 : (5 + Math.floor(Math.random() * 35)); // 5-40 km/h
            const windGust = (i === 0) ? 20 : (windSpeed + Math.floor(Math.random() * 10)); // Gusts slightly higher
            const temp = 10 + Math.floor(Math.random() * 10); // 10-20 C
            const humidity = 60 + Math.floor(Math.random() * 30); // 60-90%

            const descriptions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Showers', 'Strong Winds', 'Overcast'];
            const description = descriptions[Math.floor(Math.random() * descriptions.length)];

            const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            const windDirection = windDirections[Math.floor(Math.random() * windDirections.length)];

            // Generate mock hourly data for tide chart and conditions
            const hourlyForecast = [];
            const baseTideHeight = 1.0 + Math.random() * 0.5; // Base around 1.0-1.5m
            const tideRange = 2.0 + Math.random() * 1.0; // Range of 2.0-3.0m

            for (let h = 0; h < 24; h += 3) { // Every 3 hours
                const time = `${h.toString().padStart(2, '0')}:00`;
                const hourTemp = temp - 5 + Math.floor(Math.random() * 10); // Vary temp slightly
                const hourWindSpeed = windSpeed - 5 + Math.floor(Math.random() * 10);
                const hourWindGust = hourWindSpeed + Math.floor(Math.random() * 5);

                // Simple sine wave for mock tide height
                const tideHeight = baseTideHeight + (tideRange / 2) * Math.sin((h / 24) * 2 * Math.PI + (i * Math.PI / 3)); // Shift phase for different days

                let tideStatus = 'Stable';
                if (tideHeight > 2.5) tideStatus = 'High Tide';
                else if (tideHeight < 1.0) tideStatus = 'Low Tide';
                else if (tideHeight > hourlyForecast[hourlyForecast.length - 1]?.tideHeight) tideStatus = 'Rising Tide';
                else if (tideHeight < hourlyForecast[hourlyForecast.length - 1]?.tideHeight) tideStatus = 'Falling Tide';


                hourlyForecast.push({
                    time,
                    temp: hourTemp,
                    description: description, // Keep daily description for simplicity
                    windSpeed: Math.max(0, hourWindSpeed),
                    windDirection: windDirection,
                    windGust: Math.max(0, hourWindGust),
                    tideStatus: tideStatus,
                    tideHeight: parseFloat(tideHeight.toFixed(2)) // Round for display
                });
            }

            // Mock high/low tide times (simplified, would be derived from hourly in real app)
            const mockHighTides = [`${(9 + i) % 12 || 12}:00 AM`, `${(21 + i) % 12 || 12}:00 PM`];
            const mockLowTides = [`${(3 + i) % 12 || 12}:00 AM`, `${(15 + i) % 12 || 12}:00 PM`];

            // Determine ideal fishing time text
            let idealFishingTimeText;
            const { condition: fishingCondition } = getFishingCondition(windSpeed, windDirection, windGust);
            if (fishingCondition === 'Good') {
                idealFishingTimeText = 'Morning (7 AM - 10 AM)'; // Example good time
            } else {
                idealFishingTimeText = 'Take a punt'; // Changed from 'Not Recommended'
            }

            data.push({
                date: date.toISOString().split('T')[0], // YYYY-MM-DD format
                windSpeed,
                windDirection,
                windGust,
                description,
                temp,
                humidity,
                idealFishingTime: idealFishingTimeText,
                tideTimes: { high: mockHighTides, low: mockLowTides },
                hourlyForecast: hourlyForecast
            });
        }
        return data;
    };

    useEffect(() => {
        const dynamicMockData = generateDynamicMockData();
        setWeatherData(dynamicMockData);
        setCurrentWeather(dynamicMockData[0]); // Set current weather to the first day (today)
    }, []); // Run once on component mount

    /**
     * Determines fishing conditions based on wind speed and direction,
     * specifically for beach fishing with drones/long lines.
     * @param {number} windSpeed - Sustained wind speed in km/h.
     * @param {string} windDirection - Wind direction (e.g., 'NW', 'SE').
     * @param {number} windGust - Wind gust speed in km/h.
     * @returns {object} An object containing 'condition' ('Good' or 'Shit'), 'droneNotAnOption' (boolean), 'shouldFlash' (boolean for red), and 'shouldWarnDrone' (boolean for orange).
     */
    const getFishingCondition = (windSpeed, windDirection, windGust) => {
        const GOOD_FISHING_WIND_THRESHOLD = 15; // Wind speed below this is generally good
        const BAD_ONSHORE_WIND_THRESHOLD = 10; // Onshore wind above this might be bad
        const DRONE_MAX_SUSTAINED_WIND_SPEED = 35; // Max sustained wind speed for Aeroo fishing drone
        const DRONE_GUST_NO_GO_THRESHOLD = 40; // Max wind gust speed for Aeroo fishing drone (absolute no-go)
        const DRONE_STRONG_FLASH_THRESHOLD = 38; // Sustained wind speed to trigger aggressive red flashing
        const DRONE_WARNING_FLASH_THRESHOLD = 30; // Sustained wind speed to trigger subtle orange flashing

        let condition = 'Good';
        let droneNotAnOption = false;
        let shouldFlash = false; // For aggressive red flash (sustained > 38 OR gust > 40)
        let shouldWarnDrone = false; // For subtle orange flash (sustained 30-35)
        let droneWarningReason = ''; // To specify why drone is not an option

        // --- Drone Safety Logic ---
        // Priority 1: Gusts over 40 km/h are an absolute no-go and trigger red flash
        if (windGust > DRONE_GUST_NO_GO_THRESHOLD) {
            droneNotAnOption = true;
            shouldFlash = true;
            condition = 'Shit'; // If drone is out, fishing is "Shit"
            droneWarningReason = `Gusts > ${DRONE_GUST_NO_GO_THRESHOLD}km/h`;
        }
        // Priority 2: Sustained wind over 35 km/h is a no-go
        else if (windSpeed > DRONE_MAX_SUSTAINED_WIND_SPEED) {
            droneNotAnOption = true;
            condition = 'Shit'; // If drone is out, fishing is "Shit"
            droneWarningReason = `Wind > ${DRONE_MAX_SUSTAINED_WIND_SPEED}km/h`;
            // If sustained wind is also over 38, it will still flash red
            if (windSpeed > DRONE_STRONG_FLASH_THRESHOLD) {
                shouldFlash = true;
            }
        }
        // Priority 3: Sustained wind between 30-35 km/h is a warning (orange flash)
        else if (windSpeed >= DRONE_WARNING_FLASH_THRESHOLD && windSpeed <= DRONE_MAX_SUSTAINED_WIND_SPEED) {
            shouldWarnDrone = true;
            droneWarningReason = `Wind ${DRONE_WARNING_FLASH_THRESHOLD}-${DRONE_MAX_SUSTAINED_WIND_SPEED}km/h`;
        }

        // --- General Fishing Condition Logic (independent of drone-specific "Shit" if drone is not primary method) ---
        // If fishing is not already "Shit" due to drone, check other factors
        if (condition === 'Good') {
            // Condition 1: Very high sustained wind speed is always "Shit"
            if (windSpeed >= 20) {
                condition = 'Shit';
            }

            // Assume Porangahau Beach faces generally East.
            // Onshore winds would be E, NE, SE.
            const onshoreWinds = ['E', 'NE', 'SE'];
            const isWindOnshore = onshoreWinds.includes(windDirection.toUpperCase());

            // Condition 2: Moderate to strong onshore winds are "Shit" for drone/longline
            if (isWindOnshore && windSpeed >= BAD_ONSHORE_WIND_THRESHOLD) {
                condition = 'Shit';
            }
        }

        return { condition, droneNotAnOption, shouldFlash, shouldWarnDrone, droneWarningReason };
    };

    /**
     * Returns the appropriate icon based on weather description.
     * @param {string} description - Weather description string.
     * @param {string} size - Tailwind CSS class for size (e.g., 'w-6 h-6').
     * @returns {JSX.Element} Lucide React icon component.
     */
    const getWeatherIcon = (description, size = 'w-6 h-6') => {
        if (description.toLowerCase().includes('sunny') || description.toLowerCase().includes('clear')) {
            return <Sun className={`${size} text-yellow-400`} />;
        } else if (description.toLowerCase().includes('rain') || description.toLowerCase().includes('showers')) {
            return <CloudRain className={`${size} text-blue-400`} />;
        } else if (description.toLowerCase().includes('cloudy') || description.toLowerCase().includes('overcast')) {
            return <Cloud className={`${size} text-gray-300`} />;
        } else if (description.toLowerCase().includes('wind')) {
            return <Wind className={`${size} text-gray-400`} />;
        }
        return <Cloud className={`${size} text-gray-300`} />; // Default icon
    };

    // Helper to get tide icon
    const getTideIcon = (status, size = 'w-4 h-4') => {
        if (status.includes('Rising')) {
            return <ArrowUp className={`${size} text-blue-400`} />;
        } else if (status.includes('Falling')) {
            return <ArrowDown className={`${size} text-blue-400`} />;
        } else if (status.includes('High')) {
            return <Waves className={`${size} text-blue-300`} />;
        } else if (status.includes('Low')) {
            return <Waves className={`${size} text-blue-500`} />;
        }
        return null;
    };

    // Helper to determine wind animation class for the main tile
    const getWindAnimationClass = (windSpeed) => {
        if (windSpeed <= 10) {
            return 'windy-low';
        } else if (windSpeed > 10 && windSpeed <= 25) {
            return 'windy-moderate';
        } else if (windSpeed > 25 && windSpeed <= 30) {
            return 'windy-high';
        }
        return ''; // No animation for higher winds (flashing will take over)
    };

    // Handler for when a forecast tile is clicked
    const handleTileClick = (day) => {
        setSelectedDay(day);
        setFishingTip(''); // Clear tip when new day is selected
    };

    // Handler to close the 24-hour forecast modal
    const handleCloseModal = () => {
        setSelectedDay(null);
        setFishingTip(''); // Clear tip when modal is closed
    };

    /**
     * Calls the Gemini API to generate a fishing tip based on current weather.
     * @param {object} dayData - The weather data for the day to generate a tip for.
     */
    const generateFishingTip = async (dayData) => {
        setLoadingTip(true);
        setFishingTip(''); // Clear previous tip

        const prompt = `Given the weather conditions for ${dayData.date}: ${dayData.description}, wind ${dayData.windDirection} at ${dayData.windSpeed} km/h (gusts up to ${dayData.windGust} km/h), and temperature ${dayData.temp}°C, provide a concise fishing tip (2-3 sentences) for beach fishing at Porangahau Beach using a drone or long line. Focus on strategies, gear, or general advice suitable for these conditions. If conditions are generally "Shit" for fishing, suggest an alternative activity or how to prepare for better conditions.`;

        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = ""; // Canvas will provide this at runtime
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setFishingTip(text);
            } else {
                setFishingTip("Could not generate a tip. Please try again.");
            }
        } catch (error) {
            console.error("Error generating fishing tip:", error);
            setFishingTip("Failed to generate tip due to an error.");
        } finally {
            setLoadingTip(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 font-inter p-4 sm:p-6 lg:p-8 flex flex-col items-center">
            {/* Inject custom CSS for flashing animation */}
            <style>{animationsCss}</style>

            {/* Header */}
            <header className="w-full max-w-4xl text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 mb-2">
                    Beach Fishing
                </h1>
                <p className="text-lg sm:text-xl text-gray-300">Weather & Fishing Forecast for Porangahau Beach</p>
            </header>

            {/* Current Conditions Card */}
            {currentWeather && (
                <div className={`bg-gray-700 rounded-2xl shadow-xl p-6 sm:p-8 mb-8 w-full max-w-xl flex flex-col items-center text-center ${
                    // Get fishing conditions for current day once
                    (() => {
                        const conditions = getFishingCondition(currentWeather.windSpeed, currentWeather.windDirection, currentWeather.windGust);
                        return conditions.shouldFlash || conditions.shouldWarnDrone
                            ? '' // No animation if flashing
                            : getWindAnimationClass(currentWeather.windSpeed); // Apply subtle wind animation
                    })()
                }`}>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-4">Current Conditions</h2>
                    <div className="flex items-center justify-center mb-4">
                        {getWeatherIcon(currentWeather.description, 'w-8 h-8')}
                        <span className="text-4xl sm:text-5xl font-bold text-gray-50 ml-3">
                            {currentWeather.temp}°C
                        </span>
                    </div>
                    <p className="text-lg text-gray-300 mb-2">{currentWeather.description}</p>
                    {/* Conditionally render wind and tide for current day */}
                    {getFishingCondition(currentWeather.windSpeed, currentWeather.windDirection, currentWeather.windGust).condition === 'Good' ? (
                        <>
                            <div className="flex items-center text-gray-200 text-xl mb-2">
                                <Wind className="w-6 h-6 mr-2" />
                                <span>Wind: {currentWeather.windDirection} {currentWeather.windSpeed} km/h (Gusts: {currentWeather.windGust} km/h)</span>
                            </div>
                            {getFishingCondition(currentWeather.windSpeed, currentWeather.windDirection, currentWeather.windGust).droneNotAnOption && (
                                <p className="text-red-400 text-sm font-semibold mb-2">
                                    (Drone not an option: {getFishingCondition(currentWeather.windSpeed, currentWeather.windDirection, currentWeather.windGust).droneWarningReason})
                                </p>
                            )}
                            <div className="flex items-center text-gray-200 text-xl mb-2">
                                <Clock className="w-6 h-6 mr-2" />
                                <span>Ideal Fishing: {currentWeather.idealFishingTime}</span>
                            </div>
                            <div className="text-gray-200 text-xl mb-4">
                                <Waves className="w-6 h-6 inline-block mr-2" />
                                <span>High Tide: {currentWeather.tideTimes.high.join(' & ')}</span><br/>
                                <span>Low Tide: {currentWeather.tideTimes.low.join(' & ')}</span>
                            </div>
                        </>
                    ) : (
                        // No wind or tide info if fishing is 'Shit'
                        <div className="mb-4"></div> // Maintain some spacing
                    )}

                    <div className={`mt-4 px-4 py-2 rounded-full text-white font-semibold ${
                        getFishingCondition(currentWeather.windSpeed, currentWeather.windDirection, currentWeather.windGust).condition === 'Good' ? 'bg-green-600 text-lg' : 'bg-red-600 text-2xl sm:text-3xl'
                    }`}>
                        <Fish className="inline-block mr-2" />
                        Fishing: {getFishingCondition(currentWeather.windSpeed, currentWeather.windDirection, currentWeather.windGust).condition}
                    </div>

                    {/* ✨ Gemini API Feature: Fishing Tip Generator Button */}
                    <button
                        onClick={() => generateFishingTip(currentWeather)}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                        disabled={loadingTip}
                    >
                        {loadingTip ? (
                            <span className="animate-spin mr-2">⚙️</span>
                        ) : (
                            <Lightbulb className="w-5 h-5 mr-2" />
                        )}
                        {loadingTip ? 'Generating Tip...' : '✨ Get Fishing Tip ✨'}
                    </button>

                    {/* Display Generated Fishing Tip */}
                    {fishingTip && (
                        <div className="mt-6 bg-gray-800 rounded-lg p-4 text-gray-200 text-sm italic relative">
                            <button
                                onClick={() => setFishingTip('')}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-100 transition-colors"
                                aria-label="Clear Tip"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <p className="pr-6">{fishingTip}</p>
                        </div>
                    )}
                </div>
            )}

            {/* 7-Day Weather Forecast Section */}
            <section className="w-full max-w-4xl mb-8"> {/* Added mb-8 for spacing */}
                <h2 className="text-3xl font-semibold text-gray-100 mb-6 flex items-center justify-center">
                    <CalendarDays className="w-7 h-7 mr-3" />
                    7-Day Weather Forecast
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {weatherData.map((day, index) => {
                        const { condition: fishingCondition, droneNotAnOption, shouldFlash, shouldWarnDrone, droneWarningReason } = getFishingCondition(day.windSpeed, day.windDirection, day.windGust);
                        return (
                            <div
                                key={index}
                                className={`bg-gray-700 rounded-xl shadow-md p-5 flex flex-col items-center text-center cursor-pointer
                                    ${shouldFlash ? 'flash-red' : shouldWarnDrone ? 'flash-orange' : ''}
                                `}
                                onClick={() => handleTileClick(day)}
                            >
                                <p className="text-md font-medium text-gray-300 mb-2">
                                    {new Date(day.date).toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                                <div className="mb-3">
                                    {getWeatherIcon(day.description)}
                                </div>
                                <p className="text-lg font-semibold text-gray-100 mb-1">{day.description}</p>
                                <p className="text-md text-gray-300 mb-2">{day.temp}°C</p>

                                {/* Conditionally render wind and tide info for forecast days */}
                                {fishingCondition === 'Good' ? (
                                    <>
                                        <p className="text-md text-gray-300 mb-3">
                                            <Wind className="inline-block w-4 h-4 mr-1" />
                                            {day.windDirection} {day.windSpeed} km/h (Gusts: {day.windGust} km/h)
                                        </p>
                                        {droneNotAnOption && (
                                            <p className="text-red-400 text-xs font-semibold mb-2">
                                                (Drone not an option: {droneWarningReason})
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-300 mb-1">
                                            <Clock className="inline-block w-4 h-4 mr-1" />
                                            Ideal: {day.idealFishingTime}
                                        </p>
                                        <p className="text-sm text-gray-300 mb-3">
                                            <Waves className="inline-block w-4 h-4 mr-1" />
                                            High: {day.tideTimes.high.join(' & ')}<br/>
                                            Low: {day.tideTimes.low.join(' & ')}
                                        </p>
                                    </>
                                ) : (
                                    // No wind or tide info if fishing is 'Shit'
                                    <div className="mb-8"></div> // Maintain some spacing for consistency
                                )}

                                <div className={`w-full py-2 rounded-full text-white font-bold ${
                                    fishingCondition === 'Good' ? 'bg-green-500 text-sm' : 'bg-red-500 text-xl sm:text-2xl'
                                }`}>
                                    Fishing: {fishingCondition}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* NEW: 7-Day Tide Overview Section */}
            <section className="w-full max-w-4xl">
                <h2 className="text-3xl font-semibold text-gray-100 mb-6 flex items-center justify-center">
                    <Waves className="w-7 h-7 mr-3" />
                    7-Day Tide Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                    {weatherData.map((day, index) => (
                        <div
                            key={`tide-graph-${index}`}
                            className="bg-gray-700 rounded-xl shadow-md p-5 flex flex-col items-center text-center"
                        >
                            <p className="text-md font-medium text-gray-300 mb-2">
                                {new Date(day.date).toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <div className="w-full h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={day.hourlyForecast}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                        <XAxis dataKey="time" stroke="#9ca3af" interval={2} tickFormatter={(tick) => tick.split(':')[0]} />
                                        <YAxis stroke="#9ca3af" domain={['auto', 'auto']} tickFormatter={(tick) => `${tick}m`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }}
                                            labelStyle={{ color: '#e5e7eb' }}
                                            itemStyle={{ color: '#d1d5db' }}
                                            formatter={(value, name, props) => [`${value}m`, 'Tide Height']}
                                        />
                                        <Line type="monotone" dataKey="tideHeight" stroke="#60a5fa" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-sm text-gray-300 mt-2">
                                High: {day.tideTimes.high.join(' & ')}<br/>
                                Low: {day.tideTimes.low.join(' & ')}
                            </p>
                        </div>
                    ))}
                </div>
            </section>


            {/* 24-Hour Forecast Modal */}
            {selectedDay && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-300 hover:text-gray-100 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <h2 className="text-3xl font-bold text-gray-100 mb-4 text-center">
                            24-Hour Forecast for {new Date(selectedDay.date).toLocaleDateString('en-NZ', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h2>

                        {/* Tide Chart in Modal */}
                        <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-2 text-center">Tide Chart (Meters)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={selectedDay.hourlyForecast}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                <XAxis dataKey="time" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" domain={['auto', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }}
                                    labelStyle={{ color: '#e5e7eb' }}
                                    itemStyle={{ color: '#d1d5db' }}
                                    formatter={(value, name, props) => [`${value}m`, 'Tide Height']}
                                />
                                <Line type="monotone" dataKey="tideHeight" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>

                        <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-2 text-center">Hourly Conditions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedDay.hourlyForecast.map((hour, idx) => (
                                <div key={idx} className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        {getWeatherIcon(hour.description, 'w-8 h-8')}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-lg font-semibold text-gray-50">{hour.time}</p>
                                        <p className="text-md text-gray-200">{hour.temp}°C, {hour.description}</p>
                                        <p className="text-sm text-gray-300">
                                            <Wind className="inline-block w-4 h-4 mr-1" />
                                            {hour.windDirection} {hour.windSpeed} km/h (Gusts: {hour.windGust} km/h)
                                        </p>
                                        <p className="text-sm text-gray-300 flex items-center">
                                            {getTideIcon(hour.tideStatus, 'w-4 h-4 mr-1')}
                                            Tide: {hour.tideStatus} ({hour.tideHeight}m)
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;

