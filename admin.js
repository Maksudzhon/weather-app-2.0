const adminPassword = "avgust1408";

// DOM Elements
const loginBtn = document.getElementById("loginBtn");
const adminInput = document.getElementById("adminPass");
const loginBox = document.getElementById("loginBox");
const panel = document.getElementById("panel");
const loginError = document.getElementById("loginError");

const userCountElem = document.getElementById("userCount");
const searchCountElem = document.getElementById("searchCount");
const todayActivityElem = document.getElementById("todayActivity");
const searchHistoryElem = document.getElementById("searchHistory");

const clearBtn = document.getElementById("clearBtn");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");
const langSelect = document.getElementById("langSelect");

// Translations
const translations = {
    uz: {
        userCount: "Foydalanuvchilar",
        searchCount: "Qidiruvlar",
        todayActivity: "Bugungi faollik",
        historyTitle: "So'nggi qidiruvlar",
        reset: "Barcha ma'lumotlarni tozalash",
        refresh: "Ma'lumotlarni yangilash",
        logout: "Chiqish",
        login: "Kirish",
        loginErr: "Parol noto'g'ri!",
        noHistory: "Hozircha qidiruv tarixi yo'q",
        confirmReset: "Barcha ma'lumotlarni o'chirmoqchimisiz?",
        resetSuccess: "Ma'lumotlar muvaffaqiyatli tozalandi!",
        adminTitle: "🔐 Admin Panel"
    },
    ru: {
        userCount: "Пользователи",
        searchCount: "Поиски",
        todayActivity: "Сегодняшняя активность",
        historyTitle: "Недавние поиски",
        reset: "Сбросить все данные",
        refresh: "Обновить данные",
        logout: "Выйти",
        login: "Войти",
        loginErr: "Неверный пароль!",
        noHistory: "История поиска пока пуста",
        confirmReset: "Вы уверены, что хотите удалить все данные?",
        resetSuccess: "Данные успешно очищены!",
        adminTitle: "🔐 Админ Панель"
    },
    en: {
        userCount: "Users",
        searchCount: "Searches",
        todayActivity: "Today's Activity",
        historyTitle: "Recent Searches",
        reset: "Reset All Data",
        refresh: "Refresh Data",
        logout: "Logout",
        login: "Login",
        loginErr: "Wrong password!",
        noHistory: "No search history yet",
        confirmReset: "Are you sure you want to delete all data?",
        resetSuccess: "Data successfully cleared!",
        adminTitle: "🔐 Admin Panel"
    }
};

// Current language
let currentLang = localStorage.getItem('adminLanguage') || 'uz';
langSelect.value = currentLang;

// Update UI language
function updateLanguage() {
    const t = translations[currentLang];
    
    document.getElementById("adminTitle").textContent = t.adminTitle;
    document.getElementById("loginTitle").textContent = t.login;
    document.getElementById("loginBtnText").textContent = t.login;
    document.getElementById("userCountLabel").textContent = t.userCount;
    document.getElementById("searchCountLabel").textContent = t.searchCount;
    document.getElementById("todayLabel").textContent = t.todayActivity;
    document.getElementById("historyTitle").textContent = t.historyTitle;
    document.getElementById("clearBtnText").textContent = t.reset;
    document.getElementById("refreshBtnText").textContent = t.refresh;
    document.getElementById("logoutBtnText").textContent = t.logout;
}

// Language selector
langSelect.addEventListener("change", () => {
    currentLang = langSelect.value;
    localStorage.setItem('adminLanguage', currentLang);
    updateLanguage();
    displayUserData();
});

// Login functionality
loginBtn.addEventListener("click", handleLogin);
adminInput.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

function handleLogin() {
    const t = translations[currentLang];
    
    if (adminInput.value === adminPassword) {
        loginBox.style.display = "none";
        panel.style.display = "block";
        loginError.textContent = "";
        
        // Save login state
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Display data
        displayUserData();
    } else {
        loginError.textContent = t.loginErr;
        adminInput.value = "";
        
        // Shake animation
        adminInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            adminInput.style.animation = '';
        }, 500);
    }
}

// Check if already logged in
window.addEventListener('load', () => {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        loginBox.style.display = "none";
        panel.style.display = "block";
        displayUserData();
    }
    updateLanguage();
});

// Logout functionality
logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem('adminLoggedIn');
    panel.style.display = "none";
    loginBox.style.display = "block";
    adminInput.value = "";
    loginError.textContent = "";
});

// Display user statistics
function displayUserData() {
    try {
        const uniqueUsers = JSON.parse(localStorage.getItem("uniqueUsers")) || [];
        const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
        
        // Update counts
        userCountElem.textContent = uniqueUsers.length;
        searchCountElem.textContent = searchHistory.length;
        
        // Calculate today's activity
        const today = new Date().toDateString();
        const todaySearches = searchHistory.filter(item => {
            const searchDate = new Date(item.timestamp).toDateString();
            return searchDate === today;
        });
        todayActivityElem.textContent = todaySearches.length;
        
        // Display search history
        displaySearchHistory(searchHistory);
        
    } catch (error) {
        console.error('Error displaying user data:', error);
    }
}

// Display search history
function displaySearchHistory(history) {
    const t = translations[currentLang];
    
    if (history.length === 0) {
        searchHistoryElem.innerHTML = `
            <div class="history-item">
                <p style="text-align: center; color: rgba(255, 255, 255, 0.5);">
                    ${t.noHistory}
                </p>
            </div>
        `;
        return;
    }
    
    // Show last 20 searches
    const recentHistory = history.slice(0, 20);
    
    searchHistoryElem.innerHTML = recentHistory.map(item => {
        const date = new Date(item.timestamp);
        const timeString = formatDate(date);
        
        return `
            <div class="history-item">
                <div class="history-city">🌍 ${item.city}</div>
                <div class="history-time">⏰ ${timeString}</div>
            </div>
        `;
    }).join('');
}

// Format date for display
function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return currentLang === 'uz' ? 'Hozir' : currentLang === 'ru' ? 'Только что' : 'Just now';
    if (diffMins < 60) return `${diffMins} ${currentLang === 'uz' ? 'daqiqa oldin' : currentLang === 'ru' ? 'мин назад' : 'mins ago'}`;
    if (diffHours < 24) return `${diffHours} ${currentLang === 'uz' ? 'soat oldin' : currentLang === 'ru' ? 'ч назад' : 'hours ago'}`;
    if (diffDays < 7) return `${diffDays} ${currentLang === 'uz' ? 'kun oldin' : currentLang === 'ru' ? 'дн назад' : 'days ago'}`;
    
    return date.toLocaleDateString(currentLang === 'uz' ? 'uz-UZ' : currentLang === 'ru' ? 'ru-RU' : 'en-US');
}

// Refresh data
refreshBtn.addEventListener("click", () => {
    displayUserData();
    
    // Visual feedback
    refreshBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        refreshBtn.style.transform = '';
    }, 500);
});

// Clear all data
clearBtn.addEventListener("click", () => {
    const t = translations[currentLang];
    
    if (confirm(t.confirmReset)) {
        try {
            // Clear all localStorage data
            localStorage.removeItem("uniqueUsers");
            localStorage.removeItem("searchHistory");
            localStorage.removeItem("lastSearchedCity");
            
            // Update display
            displayUserData();
            
            // Show success message
            alert(t.resetSuccess);
            
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    }
});

// Auto-refresh every 30 seconds when panel is visible
setInterval(() => {
    if (panel.style.display === "block") {
        displayUserData();
    }
}, 30000);

// Add shake animation to CSS if not already present
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Initialize
updateLanguage();