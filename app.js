// ==================================================
// 1. GLOBAL INITIALIZATION (Executed first)
// ==================================================
const SUPABASE_PROJECT_URL = "https://eghmzetfcimllmenhhei.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "sb_publishable_qKZSUusEOjQLrQjkPGUjSw_d_WVUliX";

// Global client instance
const supabaseClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_PUBLIC_KEY);

let currentUserProfile = null;

// ==================================================
// 2. CORE FUNCTIONS
// ==================================================

async function handleUserLogin(event) {
    if (event) event.preventDefault();
    
    const emailInputElement = document.getElementById('email');
    if (!emailInputElement) return;
    
    const emailInput = emailInputElement.value.trim();

    try {
        const { data, error } = await supabaseClient
            .from('app_users')
            .select('*')
            .eq('email', emailInput)
            .single();

        if (error || !data?.union_id) {
            console.error("Access Map Fault: Account unlinked to a geographic region.");
            return;
        }

        currentUserProfile = data;
        initializeDashboard(currentUserProfile);
        
    } catch (err) {
        console.error("Login process crash:", err.message);
    }
}

function initializeDashboard(profile) {
    const displayElement = document.getElementById('total-records-display');
    
    try {
        console.log("Dashboard UI being built for:", profile.user_name);
        // Your specific dashboard building logic here
        
        // Final sanity check for UI
        if (displayElement) {
            displayElement.innerText = "Ready"; 
        }
    } catch (err) {
        console.error("Dashboard engine runtime crash:", err.message);
        if (displayElement) displayElement.innerText = "Error Loading";
    }
}

// ==================================================
// 3. EVENT LISTENERS (Executed when DOM is ready)
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM ready. Initializing listeners...");
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleUserLogin);
        console.log("Login form bound successfully.");
    }

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
        });
    }
});
