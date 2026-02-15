// API Configuration
const apiKey = '26aa4f6406859e7849b09a76f4607a97';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherDiv = document.getElementById('weather');
const forecastDiv = document.getElementById('forecast');
const languageSelector = document.getElementById('languageSelector');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackStatus = document.getElementById('feedbackStatus');

// Translations
const translations = {
    uz: {
        appTitle: '🌤 Ob-havo ilovasi',
        searchBtn: 'Qidirish',
        feedbackTitle: 'Feedback yuborish',
        feedbackBtn: 'Yuborish',
        placeholderText: 'Ob-havo ma\'lumotlarini ko\'rish uchun shaharni qidiring',
        placeholders: {
            city: 'Shahar nomini yozing',
            name: 'Ismingiz',
            email: 'Email',
            message: 'Xabar'
        },
        weatherLabels: {
            temp: 'Harorat',
            desc: 'Ob-havo',
            wind: 'Shamol',
            humidity: 'Namlik',
            pressure: 'Bosim',
            feelsLike: 'His etiladi'
        },
        errors: {
            empty: '⚠ Iltimos, shahar nomini kiriting',
            notfound: 'Shahar topilmadi! Boshqa nom bilan urinib ko\'ring',
            network: 'Tarmoq xatosi. Internetni tekshiring'
        },
        success: {
            feedback: 'Xabaringiz yuborildi! Rahmat!'
        }
    },
    ru: {
        appTitle: '🌤 Погодное приложение',
        searchBtn: 'Поиск',
        feedbackTitle: 'Отправить отзыв',
        feedbackBtn: 'Отправить',
        placeholderText: 'Найдите город, чтобы увидеть данные о погоде',
        placeholders: {
            city: 'Введите город',
            name: 'Имя',
            email: 'Email',
            message: 'Сообщение'
        },
        weatherLabels: {
            temp: 'Температура',
            desc: 'Погода',
            wind: 'Ветер',
            humidity: 'Влажность',
            pressure: 'Давление',
            feelsLike: 'Ощущается'
        },
        errors: {
            empty: '⚠ Пожалуйста, введите название города',
            notfound: 'Город не найден! Попробуйте другое название',
            network: 'Ошибка сети. Проверьте интернет'
        },
        success: {
            feedback: 'Ваше сообщение отправлено! Спасибо!'
        }
    },
    en: {
        appTitle: '🌤 Weather Station',
        searchBtn: 'Search',
        feedbackTitle: 'Send Feedback',
        feedbackBtn: 'Send',
        placeholderText: 'Search for a city to see weather data',
        placeholders: {
            city: 'Enter city name',
            name: 'Your name',
            email: 'Email',
            message: 'Message'
        },
        weatherLabels: {
            temp: 'Temperature',
            desc: 'Weather',
            wind: 'Wind',
            humidity: 'Humidity',
            pressure: 'Pressure',
            feelsLike: 'Feels like'
        },
        errors: {
            empty: '⚠ Please enter a city name',
            notfound: 'City not found! Try another name',
            network: 'Network error. Check your internet'
        },
        success: {
            feedback: 'Your message has been sent! Thank you!'
        }
    }
};

// Weather descriptions in multiple languages
const weatherDescriptions = {
    'clear sky': { uz: 'Toza osmon', ru: 'Ясное небо', en: 'Clear sky' },
    'few clouds': { uz: 'Ozgina bulutlar', ru: 'Малооблачно', en: 'Few clouds' },
    'scattered clouds': { uz: 'Tarqalgan bulutlar', ru: 'Переменная облачность', en: 'Scattered clouds' },
    'broken clouds': { uz: 'Ko\'p bulutlar', ru: 'Облачно с прояснениями', en: 'Broken clouds' },
    'overcast clouds': { uz: 'Bulutli', ru: 'Пасмурно', en: 'Overcast clouds' },
    'light rain': { uz: 'Yengil yomg\'ir', ru: 'Небольшой дождь', en: 'Light rain' },
    'moderate rain': { uz: 'O\'rtacha yomg\'ir', ru: 'Умеренный дождь', en: 'Moderate rain' },
    'heavy rain': { uz: 'Kuchli yomg\'ir', ru: 'Сильный дождь', en: 'Heavy rain' },
    'snow': { uz: 'Qor', ru: 'Снег', en: 'Snow' },
    'mist': { uz: 'Tuman', ru: 'Туман', en: 'Mist' },
    'fog': { uz: 'Tuman', ru: 'Туман', en: 'Fog' },
    'thunderstorm': { uz: 'Momaqaldiroq', ru: 'Гроза', en: 'Thunderstorm' }
};

// Current language
let currentLang = localStorage.getItem('preferredLanguage') || 'uz';
languageSelector.value = currentLang;

// Initialize
updateUI();
loadLastSearch();

// Event Listeners
languageSelector.addEventListener('change', (e) => {
    currentLang = e.target.value;
    localStorage.setItem('preferredLanguage', currentLang);
    updateUI();
    
    // Reload weather if it exists
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
        getWeather(lastCity);
    }
});

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});

// Feedback form handling
feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(feedbackForm);
    const t = translations[currentLang];
    
    // Disable submit button
    const submitBtn = document.getElementById('feedbackBtn');
    const submitBtnText = submitBtn.querySelector('span');
    const originalText = submitBtnText.textContent;
    submitBtnText.textContent = currentLang === 'uz' ? 'Yuborilmoqda...' : currentLang === 'ru' ? 'Отправка...' : 'Sending...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(feedbackForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            feedbackStatus.textContent = t.success.feedback;
            feedbackStatus.className = 'success';
            feedbackStatus.style.display = 'block';
            feedbackForm.reset();
            
            setTimeout(() => {
                feedbackStatus.style.display = 'none';
            }, 5000);
        } else {
            const data = await response.json();
            feedbackStatus.textContent = data.error || t.errors.network;
            feedbackStatus.className = 'error';
            feedbackStatus.style.display = 'block';
        }
        
    } catch (error) {
        feedbackStatus.textContent = t.errors.network;
        feedbackStatus.className = 'error';
        feedbackStatus.style.display = 'block';
    } finally {
        // Re-enable submit button
        submitBtnText.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Update UI with translations
function updateUI() {
    const t = translations[currentLang];
    
    document.getElementById('appTitle').textContent = t.appTitle;
    searchBtn.querySelector('span').textContent = t.searchBtn;
    document.getElementById('feedbackTitle').textContent = t.feedbackTitle;
    document.getElementById('feedbackBtn').querySelector('span').textContent = t.feedbackBtn;
    document.getElementById('placeholderText').textContent = t.placeholderText;
    
    cityInput.placeholder = t.placeholders.city;
    document.getElementById('userName').placeholder = t.placeholders.name;
    document.getElementById('userEmail').placeholder = t.placeholders.email;
    document.getElementById('userMessage').placeholder = t.placeholders.message;
}

// Load last search on page load
function loadLastSearch() {
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
        cityInput.value = lastCity;
    }
}

// Get weather data
async function getWeather(city) {
    const t = translations[currentLang];
    
    if (!city) {
        showError(t.errors.empty);
        return;
    }
    
    // Show loading
    weatherDiv.innerHTML = '<div class="loading"></div>';
    
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error(t.errors.notfound);
        }
        
        const data = await response.json();
        
        // Save to localStorage
        localStorage.setItem('lastSearchedCity', city);
        saveUserActivity(city);
        
        // Display weather
        displayWeather(data);
        
        // Update background
        updateBackground(data.weather[0].main);
        
    } catch (error) {
        showError(error.message);
    }
}

// Display weather data
function displayWeather(data) {
    const t = translations[currentLang];
    
    // Get translated weather description
    const weatherKey = data.weather[0].description.toLowerCase();
    const weatherDesc = weatherDescriptions[weatherKey]?.[currentLang] || data.weather[0].description;
    
    // Get weather icon
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    weatherDiv.innerHTML = `
        <div class="weather-content">
            <h2>${data.name}, ${data.sys.country}</h2>
            <img src="${iconUrl}" alt="${weatherDesc}" style="width: 100px; height: 100px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));">
            
            <div class="weather-grid">
                <div class="weather-item">
                    <div class="weather-item-icon">🌡️</div>
                    <div class="weather-item-label">${t.weatherLabels.temp}</div>
                    <div class="weather-item-value">${Math.round(data.main.temp)}°C</div>
                </div>
                
                <div class="weather-item">
                    <div class="weather-item-icon">🌥️</div>
                    <div class="weather-item-label">${t.weatherLabels.desc}</div>
                    <div class="weather-item-value">${weatherDesc}</div>
                </div>
                
                <div class="weather-item">
                    <div class="weather-item-icon">🌡️</div>
                    <div class="weather-item-label">${t.weatherLabels.feelsLike}</div>
                    <div class="weather-item-value">${Math.round(data.main.feels_like)}°C</div>
                </div>
                
                <div class="weather-item">
                    <div class="weather-item-icon">💨</div>
                    <div class="weather-item-label">${t.weatherLabels.wind}</div>
                    <div class="weather-item-value">${data.wind.speed} m/s</div>
                </div>
                
                <div class="weather-item">
                    <div class="weather-item-icon">💧</div>
                    <div class="weather-item-label">${t.weatherLabels.humidity}</div>
                    <div class="weather-item-value">${data.main.humidity}%</div>
                </div>
                
                <div class="weather-item">
                    <div class="weather-item-icon">📊</div>
                    <div class="weather-item-label">${t.weatherLabels.pressure}</div>
                    <div class="weather-item-value">${data.main.pressure} hPa</div>
                </div>
            </div>
        </div>
    `;
}

// Show error message
function showError(message) {
    weatherDiv.innerHTML = `<p class="error-message">${message}</p>`;
}

// Update background based on weather
function updateBackground(weatherType) {
    const body = document.body;
    
    // Remove any existing weather class
    body.className = '';
    
    switch(weatherType.toLowerCase()) {
        case 'clear':
            body.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)';
            break;
        case 'clouds':
            body.style.background = 'linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #2980b9 100%)';
            break;
        case 'rain':
        case 'drizzle':
            body.style.background = 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
            break;
        case 'thunderstorm':
            body.style.background = 'linear-gradient(135deg, #141e30 0%, #243b55 50%, #1e3c72 100%)';
            break;
        case 'snow':
            body.style.background = 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 50%, #a8c0ff 100%)';
            break;
        case 'mist':
        case 'fog':
            body.style.background = 'linear-gradient(135deg, #606c88 0%, #3f4c6b 50%, #2c3e50 100%)';
            break;
        default:
            body.style.background = 'linear-gradient(135deg, #0a0e27 0%, #1a1446 50%, #2d1b69 100%)';
    }
    
    // Smooth transition
    body.style.transition = 'background 1.5s ease';
}

// Save user activity
function saveUserActivity(city) {
    try {
        // Get unique users from localStorage
        let uniqueUsers = JSON.parse(localStorage.getItem('uniqueUsers')) || [];
        
        // Generate a simple user ID based on browser fingerprint
        const userId = generateUserId();
        
        // Check if user already exists
        if (!uniqueUsers.includes(userId)) {
            uniqueUsers.push(userId);
            localStorage.setItem('uniqueUsers', JSON.stringify(uniqueUsers));
        }
        
        // Save search history
        let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        searchHistory.unshift({
            city: city,
            timestamp: new Date().toISOString(),
            userId: userId
        });
        
        // Keep only last 50 searches
        if (searchHistory.length > 50) {
            searchHistory = searchHistory.slice(0, 50);
        }
        
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        
    } catch (error) {
        console.error('Error saving user activity:', error);
    }
}

// Generate simple user ID
function generateUserId() {
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
        // Create a simple unique ID
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    
    return userId;
}

// Get user statistics (for admin panel)
function getUserStats() {
    const uniqueUsers = JSON.parse(localStorage.getItem('uniqueUsers')) || [];
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    
    return {
        totalUsers: uniqueUsers.length,
        totalSearches: searchHistory.length,
        history: searchHistory
    };
}

// Export for admin panel
window.getUserStats = getUserStats;