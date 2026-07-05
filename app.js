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
