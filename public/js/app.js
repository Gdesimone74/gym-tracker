// API base URL
const API_BASE = '/api';

// State
let currentLog = null;

// Get auth token
async function getAuthToken() {
    // Wait for session to be ready
    let retries = 0;
    while (retries < 10) {
        const session = await getSession();
        if (session?.access_token) {
            return session.access_token;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        retries++;
    }
    console.error('Could not get auth token');
    return null;
}

// API helper
async function apiRequest(endpoint, options = {}) {
    const token = await getAuthToken();

    if (!token) {
        throw new Error('No auth token available');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) {
        return 'Hoy';
    } else if (date.getTime() === yesterday.getTime()) {
        return 'Ayer';
    } else {
        return date.toLocaleDateString('es-AR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    }
}

// Get today's date in ISO format
function getTodayISO() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Load stats
async function loadStats() {
    try {
        const data = await apiRequest('/stats');

        document.getElementById('workout-streak').textContent = data.workout_streak;
        document.getElementById('nutrition-streak').textContent = data.nutrition_streak;
        document.getElementById('total-workouts').textContent = data.total_workouts;
        document.getElementById('total-nutrition').textContent = data.total_nutrition;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load today's log
async function loadTodayLog() {
    try {
        const today = getTodayISO();
        const data = await apiRequest(`/logs?start_date=${today}&end_date=${today}`);

        if (data.logs && data.logs.length > 0) {
            currentLog = data.logs[0];
            updateTodayUI();
        } else {
            currentLog = {
                date: today,
                workout_completed: false,
                nutrition_completed: false,
                notes: ''
            };
            updateTodayUI();
        }
    } catch (error) {
        console.error('Error loading today log:', error);
    }
}

// Update today's UI
function updateTodayUI() {
    const workoutCheckbox = document.getElementById('workout-checkbox');
    const nutritionCheckbox = document.getElementById('nutrition-checkbox');
    const notesTextarea = document.getElementById('notes');
    const workoutItem = document.getElementById('workout-item');
    const nutritionItem = document.getElementById('nutrition-item');

    workoutCheckbox.checked = currentLog.workout_completed;
    nutritionCheckbox.checked = currentLog.nutrition_completed;
    notesTextarea.value = currentLog.notes || '';

    workoutItem.classList.toggle('completed', currentLog.workout_completed);
    nutritionItem.classList.toggle('completed', currentLog.nutrition_completed);
}

// Save today's log
async function saveTodayLog() {
    try {
        const data = await apiRequest('/logs', {
            method: 'POST',
            body: JSON.stringify({
                date: currentLog.date,
                workout_completed: currentLog.workout_completed,
                nutrition_completed: currentLog.nutrition_completed,
                notes: currentLog.notes
            })
        });

        if (data.log) {
            currentLog = data.log;
        }

        // Reload stats
        loadStats();
    } catch (error) {
        console.error('Error saving log:', error);
    }
}

// Load history
async function loadHistory() {
    try {
        const data = await apiRequest('/logs');
        const historyContainer = document.getElementById('history-list');

        if (!data.logs || data.logs.length === 0) {
            historyContainer.innerHTML = '<div class="empty-state">No hay registros aún</div>';
            return;
        }

        // Skip today's log in history
        const today = getTodayISO();
        const historyLogs = data.logs.filter(log => log.date !== today);

        if (historyLogs.length === 0) {
            historyContainer.innerHTML = '<div class="empty-state">No hay registros anteriores</div>';
            return;
        }

        historyContainer.innerHTML = historyLogs.slice(0, 7).map(log => `
            <div class="history-item">
                <span class="date">${formatDate(log.date)}</span>
                <div class="badges">
                    ${log.workout_completed
                        ? '<span class="badge workout">Rutina</span>'
                        : '<span class="badge missed">Sin rutina</span>'}
                    ${log.nutrition_completed
                        ? '<span class="badge nutrition">Alimentación</span>'
                        : '<span class="badge missed">Sin dieta</span>'}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Event handlers
function setupEventHandlers() {
    // Workout checkbox
    document.getElementById('workout-checkbox').addEventListener('change', (e) => {
        currentLog.workout_completed = e.target.checked;
        document.getElementById('workout-item').classList.toggle('completed', e.target.checked);
        saveTodayLog();
    });

    // Nutrition checkbox
    document.getElementById('nutrition-checkbox').addEventListener('change', (e) => {
        currentLog.nutrition_completed = e.target.checked;
        document.getElementById('nutrition-item').classList.toggle('completed', e.target.checked);
        saveTodayLog();
    });

    // Notes (debounced save)
    let notesTimeout;
    document.getElementById('notes').addEventListener('input', (e) => {
        currentLog.notes = e.target.value;
        clearTimeout(notesTimeout);
        notesTimeout = setTimeout(saveTodayLog, 1000);
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
}

// Initialize app
async function initApp() {
    // Check auth
    const session = await checkAuth();
    if (!session) {
        window.location.href = '/index.html';
        return;
    }

    // Setup event handlers
    setupEventHandlers();

    // Load data
    await Promise.all([
        loadStats(),
        loadTodayLog(),
        loadHistory()
    ]);
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
