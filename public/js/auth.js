// Supabase config - Replace with your values
const SUPABASE_URL = 'https://okeogjphgpxlmfpddiwc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZW9nanBoZ3B4bG1mcGRkaXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjQzNjYsImV4cCI6MjA4MjYwMDM2Nn0.gp68_IngC8DwGIgYuPMj2de9Kt8ihLikfgmnzyqO_Ng';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if user is logged in
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Get current session
async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Login with Google
async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
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
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = '/index.html';
    }
}

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && window.location.pathname === '/index.html') {
        window.location.href = '/app.html';
    }
    if (event === 'SIGNED_OUT') {
        window.location.href = '/index.html';
    }
});
