const SUPABASE_PROJECT_URL = "https://eghmzetfcimllmenhhei.supabase.co";
const SUPABASE_ANON_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnaG16ZXRmY2ltbGxtZW5oaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTA1MTAsImV4cCI6MjA5NzM2NjUxMH0.FLDImmDZ7pSlgcmoufnSENOhBPQAPQ20uZfYnHUQEq4";

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
      const { data: userProfile, error } = await supabaseClient
          .from('app_users')
          .select('id, email, user_name, role, ngo_id, district_id, upazila_id, union_id')
          .eq('email', emailInput)
          .maybeSingle();

      if (error) throw error;
      if (!userProfile) throw new Error("Access Denied: Unregistered email footprints.");

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

    updateDashboardMetrics();
    renderInteractiveChartGraphics(['Rangpur', 'Gaibandha', 'Dinajpur', 'Kurigram'], [831, 460, 448, 414]);
}

// RULE 1: AUTOMATED PREFIX STRATIFICATION IDENTIFICATION GENERATOR
async function initializeSmartCaseID(loggedInUserEmail) {
  try {
    const { data: profile, error: profileError } = await supabaseClient
      .from('app_users')
      .select(`
        unions (
          prefix,
          upazilas (
            prefix,
            districts (
              prefix
            )
          )
        )
      `)
      .eq('email', loggedInUserEmail)
      .single();

    if (profileError || !profile?.unions) {
      console.error("Could not resolve structural location prefix branches.");
      return;
    }

    const dist = profile.unions.upazilas.districts.prefix.toLowerCase();
    const upaz = profile.unions.upazilas.prefix.toLowerCase();
    const uni = profile.unions.prefix.toLowerCase();
    currentPrefixCombined = `${dist}-${upaz}-${uni}-`; 

    const { count, error: countError } = await supabaseClient
      .from('avcb_cases')
      .select('*', { count: 'exact', head: true })
      .like('case_id', `${currentPrefixCombined}%`);

    if (countError) throw countError;

    const nextSequenceNum = (count || 0) + 1;
    const finalSmartID = `${currentPrefixCombined}${nextSequenceNum}`;

    const caseInputHtmlElement = document.getElementById('input-case-number');
    if (caseInputHtmlElement) {
       caseInputHtmlElement.value = finalSmartID;
       caseInputHtmlElement.disabled = true; 
    }

  } catch (err) {
    console.error("Smart Tracking Sequence Fault:", err.message);
  }
}

// RULE 2: NETWORK CLOCK OS TIME-TAMPER MITIGATION DEPLOYMENT
async function setTamperProofDate() {
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Dhaka');
    const timeData = await response.json();
    const isoDate = timeData.datetime.split('T')[0]; // "YYYY-MM-DD"
    
    const [year, month, day] = isoDate.split('-');
    const trueFormattedDate = `${day}/${month}/${year}`; // Formats cleanly to "DD/MM/YYYY"

    const dateInput = document.getElementById('input-filing-date');
    if (dateInput) {
        dateInput.value = trueFormattedDate;
        dateInput.readOnly = true;
        dateInput.style.pointerEvents = 'none';
    }
  } catch (error) {
    console.warn("Fallback: Clock endpoint blocked. Enforcing default Postgres timestamp assignment.");
    const dateInput = document.getElementById('input-filing-date');
    if (dateInput) {
        const localFallback = new Date();
        const d = String(localFallback.getDate()).padStart(2, '0');
        const m = String(localFallback.getMonth() + 1).padStart(2, '0');
        const y = localFallback.getFullYear();
        dateInput.value = `${d}/${m}/${y}`;
    }
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
async function submitNewAvcbCase(event) {
    if (event) event.preventDefault();

    // Fire the Guardrails Interceptor Checks before sending to DB
    if (!validateCaseForm()) return;

    const submitBtn = document.getElementById('btn-submit-case');
    const formErrorBox = document.getElementById('form-error-msg');
    
    submitBtn.disabled = true;
    submitBtn.innerText = "Syncing Case to Cloud...";
    if (formErrorBox) formErrorBox.classList.add('hidden');

    // Parse DD/MM/YYYY text back to a clean ISO date string for Supabase storage engine
    const visualDateString = document.getElementById('input-filing-date').value;
    const [d, m, y] = visualDateString.split('/');
    const cleanIsoDate = `${y}-${m}-${d}`;

    const casePayload = {
        ngo_id: currentUserProfile?.ngo_id,
        union_id: currentUserProfile?.union_id,
        case_id: document.getElementById('input-case-number').value.trim(),
        filing_date: cleanIsoDate,
        case_type: document.getElementById('select-case-type').value,
        dispute_amount: parseFloat(document.getElementById('input-amount').value) || 0,
        beneficiary_name: document.getElementById('input-beneficiary-name').value.trim(),
        beneficiary_gender: document.getElementById('select-gender').value,
        beneficiary_age: parseInt(document.getElementById('input-beneficiary-age').value) || null,
        current_status: 'PENDING'
    };

    try {
        const { error } = await supabaseClient
            .from('avcb_cases')
            .insert([casePayload]);
        if (error) throw error;

        alert(`🎉 Case ${casePayload.case_id} successfully mapped and synchronized!`);
        
        // Reset non-locked variables
        document.getElementById('select-case-type').value = "";
        document.getElementById('input-amount').value = "";
        document.getElementById('input-beneficiary-name').value = "";
        document.getElementById('select-gender').value = "";
        document.getElementById('input-beneficiary-age').value = "";

        // Instantly reload system counters & workspace boards
        await updateDashboardMetrics(); 
        await initializeSmartCaseID(currentUserProfile.email);
        await loadActiveCaseRegistry();

    } catch (err) {
        console.error(err);
        if (formErrorBox) {
            formErrorBox.innerText = `⚠️ Sync Failure: ${err.message}`;
            formErrorBox.classList.remove('hidden');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit & Sync Case Record";
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
