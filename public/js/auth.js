// Supabase config
const SUPABASE_URL = 'https://okeogjphgpxlmfpddiwc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZW9nanBoZ3B4bG1mcGRkaXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjQzNjYsImV4cCI6MjA4MjYwMDM2Nn0.gp68_IngC8DwGIgYuPMj2de9Kt8ihLikfgmnzyqO_Ng';

// Initialize Supabase client
let supabaseClient;

// Wait for Supabase library to load
(function() {
    function getSupabaseLib() {
        // Try to get supabase from various possible locations
        if (typeof window !== 'undefined') {
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                return window.supabase;
            }
        }
        // Try global scope (using bracket notation to avoid reference errors)
        try {
            if (typeof window !== 'undefined' && 'supabase' in window && typeof window['supabase'].createClient === 'function') {
                return window['supabase'];
            }
        } catch (e) {
            // Ignore
        }
        return null;
    }

    function initClient() {
        const supabaseLib = getSupabaseLib();
        if (supabaseLib) {
            supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            setupAuthListener();
            return true;
        }
        return false;
    }

    // Try immediately
    if (!initClient()) {
        // Wait for script to load
        const checkInterval = setInterval(() => {
            if (initClient()) {
                clearInterval(checkInterval);
            }
        }, 50);

        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!supabaseClient) {
                console.error('Failed to load Supabase library');
            }
        }, 5000);
    }
})();

// Check if user is logged in
async function checkAuth() {
    if (!supabaseClient) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!supabaseClient) {
            return null;
        }
    }
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
}

// Get current session
async function getSession() {
    if (!supabaseClient) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!supabaseClient) {
            return null;
        }
    }
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
}

// Login with Google
async function loginWithGoogle() {
    if (!supabaseClient) {
        alert('Error: Supabase no está cargado. Por favor recarga la página.');
        return;
    }
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/app.html'
        }
    });

    if (error) {
        console.error('Login error:', error);
        alert('Error al iniciar sesión');
    }
}

// Logout
async function logout() {
    if (!supabaseClient) {
        return;
    }
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        window.location.href = '/index.html';
    }
}

// Setup auth state change listener
function setupAuthListener() {
    if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && window.location.pathname === '/index.html') {
                window.location.href = '/app.html';
            }
            if (event === 'SIGNED_OUT') {
                window.location.href = '/index.html';
            }
        });
    }
}
