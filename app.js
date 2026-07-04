// --- app.js: Optimized M&E Enterprise Portal Logic ---

const SUPABASE_PROJECT_URL = "https://eghmzetfcimllmenhhei.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "sb_publishable_qKZSUusEOjQLrQjkPGUjSw_d_WVUliX";

const supabaseClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_PUBLIC_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

let currentUserProfile = null;

// Theme Toggle
document.getElementById('themeToggle').addEventListener('click', () => { 
    document.documentElement.classList.toggle('dark');
});

// 1. LOGIN ROUTINE
async function handleUserLogin(event) {
  if (event) event.preventDefault();
  
  const loginBtn = document.getElementById('btn-login');
  const errorBox = document.getElementById('auth-error');
  const emailInput = document.getElementById('login-email').value.trim();
  
  if (!emailInput) {
    alert("Please enter a valid Court Officer Email address.");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.innerText = "Verifying Credentials...";
  errorBox.classList.add('hidden');

  try {
      const { data: userData, error: userError } = await supabaseClient
       .from('app_users')
       .select('*')
       .eq('email', emailInput)
       .single();

      if (userError) throw new Error("Email not found in our system.");
      
      currentUserProfile = userData; // Store global profile
      console.log("Login Successful. Profile:", currentUserProfile);
      
      initializeDashboardLayout(currentUserProfile);
      await initializeSmartCaseID(currentUserProfile.email);
      await setTamperProofDate();
      await loadActiveCaseRegistry();

    } catch (err) {
      console.error(err);
      errorBox.innerText = err.message;
      errorBox.classList.remove('hidden');
      loginBtn.disabled = false;
      loginBtn.innerText = "Verify Identity & Enter Workspace";
  }
}

// 2. DASHBOARD INIT
function initializeDashboardLayout(profile) {
    document.getElementById('displayUserName').textContent = profile.user_name;
    document.getElementById('displayUserRole').textContent = profile.role;
    document.getElementById('displayUserAvatar').textContent = profile.user_name.substring(0, 2).toUpperCase();

    document.getElementById('loginGateway').classList.add('scale-110', 'opacity-0', 'pointer-events-none');
    setTimeout(() => { document.getElementById('loginGateway').classList.add('hidden'); }, 500);
    
    const mainApp = document.getElementById('mainDashboardApp');
    mainApp.classList.remove('hidden');
    setTimeout(() => { mainApp.classList.remove('opacity-0'); }, 100);
}

// 3. CASE ID & METRICS
async function initializeSmartCaseID(loggedInUserEmail) {
    try {
        const { data: unionCases, error: casesError } = await supabaseClient
          .from('avcb_cases')
          .select('*')
          .eq('union_id', currentUserProfile.union_id);

        if (casesError) throw casesError;

        let nextCaseIdNumber = 1;
        if (unionCases?.length > 0) {
           const numericalIds = unionCases.map(item => parseInt(item.case_id, 10)).filter(num => !isNaN(num));
           if (numericalIds.length > 0) nextCaseIdNumber = Math.max(...numericalIds) + 1;
        }

        const caseNumberField = document.getElementById('input-case-number');
        if (caseNumberField) caseNumberField.value = nextCaseIdNumber.toString();
        
        document.getElementById('total-records-display').innerText = unionCases ? unionCases.length : 0;
    } catch (err) {
        console.error("Initialization error:", err.message);
    }
}

// 4. SUBMISSION PIPELINE
async function submitNewAvcbCase(event) {
    if (event) event.preventDefault();
    
    // Validation
    const amount = parseFloat(document.getElementById('input-amount').value) || 0;
    const age = parseInt(document.getElementById('input-beneficiary-age').value) || 0;
    if (amount > 50000) return alert("Jurisdiction limit: 50,000 BDT");
    if (age <= 0 || age >= 100) return alert("Invalid Age");

    const submitBtn = document.getElementById('btn-submit-case');
    submitBtn.disabled = true;

    const casePayload = {
        case_id: parseInt(document.getElementById('input-case-number').value, 10),
        ngo_id: currentUserProfile.ngo_id,
        union_id: currentUserProfile.union_id,
        case_type: document.getElementById('select-case-type').value,
        dispute_amount: amount,
        beneficiary_name: document.getElementById('input-beneficiary-name').value.trim(),
        beneficiary_gender: document.getElementById('select-gender').value,
        beneficiary_age: age,
        filing_date: new Date().toISOString().split('T')[0],
        current_status: 'PENDING'
    };

    try {
        const { error } = await supabaseClient.from('avcb_cases').insert([casePayload]);
        if (error) throw error;
        alert("🎉 Case successfully recorded!");
        document.getElementById('case-entry-form').reset();
        await initializeSmartCaseID(currentUserProfile.email);
        await loadActiveCaseRegistry();
    } catch (err) {
        alert(`Error: ${err.message}`);
    } finally {
        submitBtn.disabled = false;
    }
}

// 5. REGISTRY & LOGOUT
async function loadActiveCaseRegistry() { /* ... kept as is ... */ }
async function resolveCase(guid) { /* ... kept as is ... */ }
function executeSystemLogout() { location.reload(); }
function setTamperProofDate() { /* ... kept as is ... */ }
