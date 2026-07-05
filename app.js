// --- app.js: Optimized M&E Enterprise Portal Logic ---
const SUPABASE_PROJECT_URL = "https://eghmzetfcimllmenhhei.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "sb_publishable_qKZSUusEOjQLrQjkPGUjSw_d_WVUliX"

const supabaseClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_PUBLIC_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

let currentUserProfile = null;
let currentPrefixCombined = "";

document.getElementById('themeToggle').addEventListener('click', () => { 
    document.documentElement.classList.toggle('dark');
});

// INTERLOCKED LOGIN IDENTITY PROFILING ROUTINE
async function handleUserLogin(event) {
  if (event) event.preventDefault();
  
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
      const { data: userData, error: userError } = await supabase
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

function initializeDashboardLayout(profile) {
    document.getElementById('displayUserName').textContent = profile.user_name;
    document.getElementById('displayUserRole').textContent = profile.role;
    document.getElementById('displayUserAvatar').textContent = profile.user_name.substring(0, 2).toUpperCase();

    document.getElementById('loginGateway').classList.add('scale-110', 'opacity-0', 'pointer-events-none');
    setTimeout(() => { document.getElementById('loginGateway').classList.add('hidden'); }, 500);
    
    const mainApp = document.getElementById('mainDashboardApp');
    mainApp.classList.remove('hidden');
    setTimeout(() => { mainApp.classList.remove('opacity-0'); }, 100);

    updateDashboardMetrics(profile.email);
    //renderInteractiveChartGraphics(['Rangpur', 'Gaibandha', 'Dinajpur', 'Kurigram'], [831, 460, 448, 414]);
}

// RULE 1: AUTOMATED PREFIX STRATIFICATION IDENTIFICATION GENERATOR
async function initializeSmartCaseID(loggedInUserEmail) {
    try {
    // 1. Fetch the user's explicit union configuration reference
    const { data: userProfile, error: profileError } = await supabaseClient
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
    const { data: unionCases, error: casesError } = await supabaseClient
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

// RULE 2: NETWORK CLOCK OS TIME-TAMPER MITIGATION DEPLOYMENT
// FIXED RULE 2: REWRITTEN TO GENERATE RELIABLE SYSTEM CLOCK DATES
function setTamperProofDate() {
    const dateInput = document.getElementById('input-filing-date');
    if (dateInput) {
        const localFallback = new Date();
        const d = String(localFallback.getDate()).padStart(2, '0');
        const m = String(localFallback.getMonth() + 1).padStart(2, '0');
        const y = localFallback.getFullYear();
        
        dateInput.value = `${d}/${m}/${y}`;
        dateInput.readOnly = true;
        dateInput.style.pointerEvents = 'none';
    }
}
// RULES 3 & 4: BUSINESS INTELLIGENCE CRITERIA PRE-FLIGHT GUARD
function validateCaseForm() {
  const disputeAmount = parseFloat(document.getElementById('input-amount').value) || 0;
  const beneficiaryAge = parseInt(document.getElementById('input-beneficiary-age').value) || 0;
  
  // Rule 3: Dispute Valuation Ceiling Enforcer
  if (disputeAmount > 50000) {
    alert("❌ Limit Violation Threshold: Village Court civil claims jurisdiction cap is restricted to a maximum of 50,000 BDT.");
    return false;
  }
  
  // Rule 4: Structural Demographic Boundary Check
  if (beneficiaryAge <= 0 || beneficiaryAge >= 100) {
    alert("❌ Invalid Human Demographics: Case profiles require a valid target age field value under 100 years.");
    return false;
  }
  
  return true; 
}

async function updateDashboardMetrics() {
    let query = supabaseClient.from('avcb_cases').select('*', { count: 'exact' });
    const { data, count, error } = await query;
    if (error) return console.error(error.message);

    document.getElementById('total-records-display').innerText = count || 0;
    
    if (data && data.length > 0) {
        const females = data.filter(r => r.beneficiary_gender?.toUpperCase() === 'FEMALE').length;
        const total = data.length;
        document.getElementById('female-percentage-display').innerText = ((females / total) * 100).toFixed(1) + '%';
        document.getElementById('male-percentage-display').innerText = (((total - females) / total) * 100).toFixed(1) + '%';
    }
}

// FORM SUBMISSION GATEWAY TRANSCEIVER PIPELINE
    // REPLACE THE LOWER FUNCTION AT THE BOTTOM OF YOUR FILE WITH THIS:
async function submitNewAvcbCase(event) {
    if (event) event.preventDefault();
    if (!validateCaseForm()) return;

    const submitBtn = document.getElementById('btn-submit-case');
    submitBtn.disabled = true;

    const visualDateString = document.getElementById('input-filing-date').value;
    const [d, m, y] = visualDateString.split('/');
    const cleanIsoDate = `${y}-${m}-${d}`;

    // IMPORTANT: Use the UUID strings directly from your profile, 
    // DO NOT use parseInt() on them.
    const casePayload = {
        case_id: parseInt(document.getElementById('input-case-number').value, 10), 
        
        // Pass these as strings (they are UUIDs)
        ngo_id: currentUserProfile?.ngo_id,         
        union_id: currentUserProfile?.union_id,     
        created_at:cleanIsoDate,
        filing_date: cleanIsoDate,
        case_type: document.getElementById('select-case-type').value,
        dispute_amount: parseFloat(document.getElementById('input-amount').value) || 0,
        beneficiary_name: document.getElementById('input-beneficiary-name').value.trim(),
        beneficiary_gender: document.getElementById('select-gender').value,
        beneficiary_age: parseInt(document.getElementById('input-beneficiary-age').value, 10) || null,
        current_status: 'PENDING'
        
    };
     console.log("Submitting payload to Supabase:", casePayload);
    try {
        const { error } = await supabaseClient
            .from('avcb_cases')
            .insert([casePayload]);
            
        if (error) throw error;

        alert("🎉 Case successfully recorded!");

        // Reset form inputs
        document.getElementById('case-entry-form').reset();

        // Refresh panels
        await initializeSmartCaseID(currentUserProfile.email);
        await loadActiveCaseRegistry();
        await updateDashboardMetrics();

    } catch (err) {
        console.error("Submission Failure:", err.message);
        alert(`Error saving record: ${err.message}`);
    } finally {
        submitBtn.disabled = false;
    }
}
// RULE 5: ACTIVE TRIAL REGISTRY PIPELINE COMPILER WITH 90-DAY BREACH INDICATORS
async function loadActiveCaseRegistry() {
  try {
    const { data: cases, error } = await supabaseClient
      .from('avcb_cases')
      .select('*')
      .eq('current_status', 'PENDING') 
      .order('filing_date', { ascending: true });

    if (error) throw error;

    const container = document.getElementById('unsolved-list-container');
    if (!container) return;
    container.innerHTML = '';

    if (!cases || cases.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic col-span-full">Excellent status: No pending unsolved files logged for this workspace matching your profile parameters.</p>`;
        return;
    }

    cases.forEach(item => {
      // Calculate chronological age criteria rules (90 Days statutory breach timeline constraint)
      const filingDateTime = new Date(item.filing_date).getTime();
      const threeMonthsInMs = 90 * 24 * 60 * 60 * 1000;
      const isOverdue = (Date.now() - filingDateTime) > threeMonthsInMs;

      // Reformat DB YYYY-MM-DD timestamp to clean display DD/MM/YYYY text
      const [currYear, currMonth, currDay] = item.filing_date.split('-');
      const displayFilingDate = `${currDay}/${currMonth}/${currYear}`;

      container.innerHTML += `
        <div class="case-card border p-4 rounded-2xl bg-white dark:bg-slate-900 transition shadow-sm ${isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-800'}">
          <div class="flex justify-between items-start">
             <p class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">📍 ID: <span class="case-search-id-string">${item.case_id}</span></p>
             ${isOverdue ? '<span class="text-[9px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold animate-pulse">⚠️ OVERDUE 3M+</span>' : '<span class="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">PENDING</span>'}
          </div>
          <div class="mt-2 text-xs space-y-0.5 text-slate-500">
             <p><strong>Beneficiary Name:</strong> ${item.beneficiary_name}</p>
             <p><strong>Filing Date:</strong> ${displayFilingDate}</p>
             <p><strong>Dispute Amount:</strong> ${item.dispute_amount} BDT</p>
          </div>
          <button onclick="resolveCase('${item.id}')" class="mt-3 w-full py-1.5 px-3 bg-slate-100 hover:bg-emerald-500 hover:text-white dark:bg-slate-800 text-xs font-semibold rounded-xl transition">
             ✓ Mark Case File Solved
          </button>
        </div>
      `;
    });
  } catch (err) {
      console.error("Registry load aborted:", err.message);
  }
}

// ACTIVE ACTION INTERCEPTOR TO RE-MARK RECORD STATE
async function resolveCase(guid) {
  try {
    const timestampTodayStr = new Date().toISOString().split('T')[0];
    const { error } = await supabaseClient
      .from('avcb_cases')
      .update({ current_status: 'RESOLVED', resolution_date: timestampTodayStr })
      .eq('id', guid);

    if (error) throw error;
    alert("🎉 Status updated successfully: Record tagged RESOLVED in repository registry matrices.");
    
    // Auto refresh active layouts
    await updateDashboardMetrics();
    await loadActiveCaseRegistry();
    await initializeSmartCaseID(currentUserProfile.email);

  } catch (err) {
      alert(`Operation fault: ${err.message}`);
  }
}

// FUZZY INPUT PATTERN TEXT FILTER MATCH MATCH ENGINE
function searchCaseRegistry() {
  const filterValue = document.getElementById('search-case-input').value.toLowerCase().trim();
  const caseCards = document.querySelectorAll('.case-card');

  caseCards.forEach(card => {
    // Selects the nested inner text field carrying the Case number string
    const searchTargetSpanNode = card.querySelector('.case-search-id-string');
    if (!searchTargetSpanNode) return;
    
    const idTextStringValue = searchTargetSpanNode.textContent.toLowerCase();
    
    if (idTextStringValue.includes(filterValue)) {
      card.style.display = ""; 
    } else {
      card.style.display = "none";  
    }
  });
}

function renderInteractiveChartGraphics(labelsArray, dataValuesArray) {
    const canvasElement = document.getElementById('luxuryInteractiveChart');
    if (!canvasElement) return;
    new Chart(canvasElement.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labelsArray,
            datasets: [{ data: dataValuesArray, backgroundColor: '#10b981', borderRadius: 12, barPercentage: 0.45 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function executeSystemLogout() {
    location.reload();
}
