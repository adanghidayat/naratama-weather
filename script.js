// ⚠️ GET YOUR FREE API KEY FROM: https://openweathermap.org/api
const API_KEY = '4880fb642f3b1da22fa00993eaad462e'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Default location: Taman Pramuka, Bandung, Indonesia
const DEFAULT_LOCATION = {
    name: 'Taman Pramuka',
    city: 'Bandung',
    region: 'West Java',
    country: 'Indonesia',
    lat: -6.9147500,
    lon: 107.6111875
};

// Weather icon mapping
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '⛈️', '10n': '⛈️',
    '11d': '⚡', '11n': '⚡',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    getCurrentLocation();
    setupSearch();
});

// Get user's current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather(latitude, longitude);
                fetchForecast(latitude, longitude);
            },
            (error) => {
                console.log('Location access denied, using default location');
                fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
                fetchForecast(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
            }
        );
    } else {
        fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
        fetchForecast(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
    }
}

// Fetch current weather
async function fetchWeather(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('Weather data not available');
        
        const data = await response.json();
        displayCurrentWeather(data);
    } catch (error) {
        document.getElementById('currentWeather').innerHTML = `
            <div class="error">❌ ${error.message}<br>Check your API key or internet connection</div>
        `;
    }
}

// Fetch 7-day forecast
async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('Forecast data not available');
        
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        document.getElementById('forecastGrid').innerHTML = `
            <div class="error">❌ ${error.message}</div>
        `;
    }
}

// Display current weather
function displayCurrentWeather(data) {
    const icon = weatherIcons[data.weather[0].icon] || '🌤️';
    
    document.getElementById('currentWeather').innerHTML = `
        <div class="icon" style="font-size: 4rem;">${icon}</div>
        <div class="temp">${Math.round(data.main.temp)}°C</div>
        <div class="description">${data.weather[0].description}</div>
        <div class="details">
            <div class="detail-item">
                <div class="label">Feels Like</div>
                <div class="value">${Math.round(data.main.feels_like)}°C</div>
            </div>
            <div class="detail-item">
                <div class="label">Humidity</div>
                <div class="value">${data.main.humidity}%</div>
            </div>
            <div class="detail-item">
                <div class="label">Wind</div>
                <div class="value">${data.wind.speed} m/s</div>
            </div>
            <div class="detail-item">
                <div class="label">Pressure</div>
                <div class="value">${data.main.pressure} hPa</div>
            </div>
        </div>
        <div style="margin-top: 20px; font-size: 0.9rem; opacity: 0.9;">
            📍 ${data.name}, ${data.sys.country}
        </div>
    `;
}

// Display 7-day forecast
function displayForecast(data) {
    // Group forecast by day (get one forecast per day)
    const dailyForecast = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-ID', { 
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
        
        if (!dailyForecast[date]) {
            dailyForecast[date] = {
                temp_max: item.main.temp_max,
                temp_min: item.main.temp_min,
                icon: item.weather[0].icon,
                description: item.weather[0].description
            };
        } else {
            dailyForecast[date].temp_max = Math.max(dailyForecast[date].temp_max, item.main.temp_max);
            dailyForecast[date].temp_min = Math.min(dailyForecast[date].temp_min, item.main.temp_min);
        }
    });
    
    // Convert to array and limit to 7 days
    const forecastArray = Object.entries(dailyForecast).slice(0, 7);
    
    const forecastHTML = forecastArray.map(([day, data]) => {
        const icon = weatherIcons[data.icon] || '🌤️';
        return `
            <div class="forecast-card">
                <div class="day">${day}</div>
                <div class="icon">${icon}</div>
                <div class="temp">${Math.round(data.temp_max)}°C</div>
                <div class="temp-min">${Math.round(data.temp_min)}°C</div>
            </div>
        `;
    }).join('');
    
    document.getElementById('forecastGrid').innerHTML = forecastHTML;
}

// Setup search functionality
function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    searchBtn.addEventListener('click', searchLocation);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchLocation();
    });
}

// Search for location
// 🔧 Fungsi pencarian lokasi (VERSI DIPERBAIKI)
async function searchLocation() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('❌ Harap masukkan nama kota');
        return;
    }
    
    // Loading state
    const searchBtn = document.getElementById('searchBtn');
    const originalBtnText = searchBtn.innerHTML;
    searchBtn.innerHTML = '⏳ Mencari...';
    searchBtn.disabled = true;
    
    try {
        console.log('🔍 Mencari lokasi:', query);
        
        // Coba beberapa format pencarian
        const searchQueries = [
            query,                                    // Query asli
            `${query},Indonesia`,                     // Dengan Indonesia
            `${query},ID`,                            // Dengan ID
            query.replace(/,\s*ID$/, ''),             // Tanpa ID jika ada
        ];
        
        let locationData = null;
        let usedQuery = '';
        
        // Coba satu per satu sampai berhasil
        for (const q of searchQueries) {
            const url = `${BASE_URL}/geo/1.0?q=${encodeURIComponent(q)}&limit=1&appid=${API_KEY}`;
            console.log('📡 Request:', url);
            
            const response = await fetch(url);
            console.log('📊 Status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    locationData = data[0];
                    usedQuery = q;
                    break;
                }
            } else if (response.status === 401) {
                throw new Error('⚠️ API Key tidak valid. Periksa kembali API Key Anda di script.js');
            } else if (response.status === 429) {
                throw new Error('⏱️ Terlalu banyak permintaan. Tunggu 10 detik dan coba lagi.');
            }
        }
        
        // Jika semua query gagal
        if (!locationData) {
            throw new Error(`❌ Lokasi "${query}" tidak ditemukan.\n\nCoba:\n• Gunakan nama kota besar (Bandung, Jakarta, Surabaya)\n• Periksa ejaan\n• Pastikan API Key sudah aktif`);
        }
        
        console.log('✅ Lokasi ditemukan:', locationData);
        
        // Tampilkan data lokasi
        const { name, lat, lon, country, state } = locationData;
        const locationName = state ? `${name}, ${state}` : name;
        
        // Update UI
        document.getElementById('location').textContent = `${locationName}, ${country}`;
        searchInput.value = '';
        
        // Ambil data cuaca
        console.log('🌤️ Mengambil data cuaca untuk:', lat, lon);
        await fetchWeather(lat, lon);
        await fetchForecast(lat, lon);
        
        // Update peta
        if (typeof updateRainMapLocation === 'function') {
            updateRainMapLocation(lat, lon);
        }
        
        console.log('✅ Selesai! Cuaca untuk', locationName, 'sudah ditampilkan');
        
    } catch (error) {
        console.error('❌ Error search:', error);
        alert(error.message);
    } finally {
        // Reset tombol
        searchBtn.innerHTML = originalBtnText;
        searchBtn.disabled = false;
    }
}
