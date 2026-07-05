
const supabase_PROJECT_URL = "https://eghmzetfcimllmenhhei.supabaseClient.co";
const supabase_ANON_PUBLIC_KEY = "sb_publishable_qKZSUusEOjQLrQjkPGUjSw_d_WVUliX";
const supabaseClient = window.supabaseClient.createClient(supabase_PROJECT_URL, supabase_ANON_PUBLIC_KEY);
let currentUserProfile = null;

// 2. THIS LISTENER ONLY SETS UP THE UI
document.addEventListener('DOMContentLoaded', () => {
console.log("DOM ready. Initializing listeners...");
// Setup event listeners for buttons that exist in the HTML
const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => { 
            document.documentElement.classList.toggle('dark');
        });
    }
});


// 1. LOGIN ROUTINE
async function handleUserLogin(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('email').value; // Ensure this ID is correct
  console.log("Attempting database connection...");
  const loginBtn = document.getElementById('btn-login');
  const errorBox = document.getElementById('auth-error');
  const emailInputElement = document.getElementById('login-email');
  
  if (!emailInputElement) return;
  const emailInput = emailInputElement.value.trim();

  if (!emailInput) {
    alert("Please enter a valid Court Officer Email address.");
    return;
  }

  if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerText = "Verifying Credentials...";
  }
  if (errorBox) errorBox.classList.add('hidden');

  try {
      const { data: userData, error: userError } = await supabaseClientClient
     .from('app_users')
     .select('*')
     .eq('email', userEmail)
     .single();

      if (userData) {
      console.log("Logged-in User Profile Details:", userData);
     // This will show you exactly what ID, NGO_ID, and UNION_ID the system is working with
        } else {
        console.error("User fetch error:", userError);
        }

      currentUserProfile = userProfile;
      
      // Fire configuration handshakes sequentially 
      initializeDashboardLayout(currentUserProfile);
      await initializeSmartCaseID(currentUserProfile.email);
      await setTamperProofDate();
      await loadActiveCaseRegistry();

    } catch (err) {
      console.error(err);
      if (errorBox) {
          errorBox.innerText = err.message;
          errorBox.classList.remove('hidden');
      }
      if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.innerText = "Verify Identity & Enter Workspace";
      }
  }
}
// 2. DASHBOARD INIT
function initializeDashboardLayout(profile) {
    document.getElementById('displayUserName').textContent = profile.user_name;
    document.getElementById('displayUserRole').textContent = profile.role;
    document.getElementById('displayUserAvatar').textContent = profile.user_name.substring(0, 2).toUpperCase();

    document.getElementById('loginGateway').classList.add('scale-110', 'opacity-0', 'pointer-events-none');
    setTimeout(() => { document.getElementById('loginGateway').classList.add('hidden'); }, 500);
    
    document.getElementById('mainDashboardApp').classList.remove('hidden');
    setTimeout(() => { document.getElementById('mainDashboardApp').classList.remove('opacity-0'); }, 100);
}

// 3. CASE ID & METRICS
async function initializeSmartCaseID(loggedInUserEmail) {
    try {
    // 1. Fetch the user's explicit union configuration reference
    const { data: userProfile, error: profileError } = await supabaseClientClient
      .from('app_users')
      .select('union_id')
      .eq('email', loggedInUserEmail)
      .maybeSingle();

    if (profileError || !userProfile?.union_id) {
      console.error("Access Map Fault: Account unlinked to a geographic region.");
      return;
    }

    const currentUnionId = userProfile.union_id;

    // 2. Query ALL case records belonging strictly to this Union
    const { data: unionCases, error: casesError } = await supabaseClientClient
      .from('avcb_cases')
      .select('*')
      .eq('union_id', currentUnionId);

    if (casesError) throw casesError;

    // --- CASE MANIPULATION & SERIAL SEQUENCE CALCULATION ---
    let nextCaseIdNumber = 1; // Default fallback if table array is empty
    
    if (unionCases && unionCases.length > 0) {
      // Look through the array, parse values to true integers, and find the max
      const numericalIds = unionCases
        .map(item => parseInt(item.case_id, 10))
        .filter(num => !isNaN(num));
        
      if (numericalIds.length > 0) {
         nextCaseIdNumber = Math.max(...numericalIds) + 1; // Auto-increment by 1
      }
    }

    // Set the auto-calculated increment value into your form field instantly!
    const caseNumberField = document.getElementById('input-case-number');
    if (caseNumberField) {
      caseNumberField.value = nextCaseIdNumber.toString();
      //caseNumberField.value = nextCaseIdNumber;
    }

    // --- METRIC PANEL RENDERING (REAL TIME INPUT) ---
    const totalRecordsCount = unionCases ? unionCases.length : 0;
    document.getElementById('total-records-display').innerText = totalRecordsCount;

    if (totalRecordsCount > 0) {
      // Calculate Demographics
      const females = unionCases.filter(c => c.beneficiary_gender?.toUpperCase() === 'FEMALE').length;
      const males = totalRecordsCount - females;
      
      document.getElementById('female-percentage-display').innerText = ((females / totalRecordsCount) * 100).toFixed(1) + '%';
      document.getElementById('male-percentage-display').innerText = ((males / totalRecordsCount) * 100).toFixed(1) + '%';
      
      // Calculate Status Stats (Pending vs Resolved)
      const pendingCount = unionCases.filter(c => c.current_status?.toUpperCase() === 'PENDING').length;
      const resolvedCount = unionCases.filter(c => c.current_status?.toUpperCase() === 'RESOLVED').length;
      
      // Calculate Total Dispute Value Accumulation (Taka)
      const totalTakaValuation = unionCases.reduce((sum, current) => sum + (parseFloat(current.dispute_amount) || 0), 0);

      // Map values directly onto your separate individual metrics layout wrappers
      if (document.getElementById('pending-count-display')) {
         document.getElementById('pending-count-display').innerText = pendingCount;
      }
      if (document.getElementById('resolved-count-display')) {
         document.getElementById('resolved-count-display').innerText = resolvedCount;
      }
      if (document.getElementById('total-taka-display')) {
         document.getElementById('total-taka-display').innerText = totalTakaValuation.toLocaleString() + " BDT";
      }
    } else {
      // Reset layout variables to clean zeros if the workspace database is empty
      document.getElementById('female-percentage-display').innerText = '0%';
      document.getElementById('male-percentage-display').innerText = '0%';
      if (document.getElementById('pending-count-display')) document.getElementById('pending-count-display').innerText = '0';
      if (document.getElementById('resolved-count-display')) document.getElementById('resolved-count-display').innerText = '0';
      if (document.getElementById('total-taka-display')) document.getElementById('total-taka-display').innerText = '0 BDT';
    }

  } catch (err) {
    console.error("Dashboard engine runtime crash:", err.message);
  }
}

// 4. SUBMISSION PIPELINE
async function submitNewAvcbCase(event) {
    if (event) event.preventDefault();
    if (!currentUserProfile) return alert("System Error: No user profile loaded.");

    const amount = parseFloat(document.getElementById('input-amount').value) || 0;
    const age = parseInt(document.getElementById('input-beneficiary-age').value) || 0;
    if (amount > 50000) return alert("Jurisdiction limit: 50,000 BDT");
    
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
        created_at: new Date().toISOString(),
        current_status: 'PENDING'
    };

    try {
        const { error } = await supabaseClientClient.from('avcb_cases').insert([casePayload]);
        if (error) throw error;
        alert("🎉 Case successfully recorded!");
        document.getElementById('case-entry-form').reset();
        await initializeSmartCaseID(currentUserProfile);
        await loadActiveCaseRegistry();
    } catch (err) {
        alert(`Error: ${err.message}`);
    } finally {
        submitBtn.disabled = false;
    }
}

// 5. REGISTRY & HELPERS
async function loadActiveCaseRegistry() {
  if (!currentUserProfile) return;
  const { data: cases, error } = await supabaseClientClient
      .from('avcb_cases')
      .select('*')
      .eq('union_id', currentUserProfile.union_id)
      .eq('current_status', 'PENDING');

  if (error) return console.error(error);
  
  const container = document.getElementById('unsolved-list-container');
  if (!container) return;
  container.innerHTML = cases.map(item => `
    <div class="case-card border p-4 rounded-2xl bg-white shadow-sm">
      <p class="text-xs font-bold">📍 ID: ${item.case_id}</p>
      <p class="text-xs"><strong>Beneficiary:</strong> ${item.beneficiary_name}</p>
      <button onclick="resolveCase('${item.id}')" class="mt-2 w-full bg-slate-100 hover:bg-emerald-500 rounded-xl text-xs font-semibold py-1">✓ Mark Solved</button>
    </div>
  `).join('');
}

async function resolveCase(guid) {
    await supabaseClientClient.from('avcb_cases').update({ current_status: 'RESOLVED' }).eq('id', guid);
    await loadActiveCaseRegistry();
}

function setTamperProofDate() {
    const dateInput = document.getElementById('input-filing-date');
    if (dateInput) {
        dateInput.value = new Date().toLocaleDateString('en-GB');
        dateInput.readOnly = true;
    }
}

function executeSystemLogout() { location.reload(); }
