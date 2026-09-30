// --- app.js: Optimized M&E Enterprise Portal Logic ---
const { createClient } = supabase;
const supabaseUrl = 'https://eghmzetfcimllmenhhei.supabase.co';
const supabaseKey = 'sb_publishable_xHtk1KS8h_c7Xp26RoMk0w_EbUifBgQ';
const supabaseClient = createClient(supabaseUrl, supabaseKey);
let currentUserProfile = null;
let caseSubscription = null;

// 2. THIS LISTENER ONLY SETS UP THE UI
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready. Initializing listeners...');

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

  const loginBtn = document.getElementById('btn-login');
  const errorBox = document.getElementById('auth-error');
  const emailInput = document.getElementById('login-email').value.trim();

  if (!emailInput) return alert('Please enter your email.');

  loginBtn.disabled = true;
  loginBtn.innerText = 'Verifying...';
  errorBox.classList.add('hidden');

  try {
    const { data: userData, error: userError } = await supabaseClient
      .from('app_users')
      .select(`
        *,
        unions (name),
        upazilas (name),
        districts (name),
        ngos (name)
      `)
      .eq('email', emailInput)
      .single();

    if (userError || !userData) throw new Error('Email not found.');
    console.log('--- User Profile Data ---');
    console.log('Full Object:', userData);
    currentUserProfile = userData;

    initializeDashboardLayout(currentUserProfile);
    await initializeSmartCaseID(currentUserProfile);
    await setTamperProofDate();
    await loadActiveCaseRegistry();
    setupRealtimeSubscription();
  } catch (err) {
    console.error(err);
    errorBox.innerText = err.message;
    errorBox.classList.remove('hidden');
    loginBtn.disabled = false;
    loginBtn.innerText = 'Verify Identity & Enter Workspace';
  }
}

// 2. DASHBOARD INIT
function initializeDashboardLayout(profile) {
  document.getElementById('displayUserName').textContent = profile.user_name;
  document.getElementById('displayUserRole').textContent = profile.role;
  document.getElementById('displayUserAvatar').textContent = profile.user_name.substring(0, 2).toUpperCase();

  document.getElementById('loginGateway').classList.add('scale-110', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    document.getElementById('loginGateway').classList.add('hidden');
  }, 500);

  document.getElementById('mainDashboardApp').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('mainDashboardApp').classList.remove('opacity-0');
  }, 100);
}

// 3. CASE ID & METRICS
async function initializeSmartCaseID(profile) {
  if (!profile) return;

  try {
    const { data: unionCases, error: casesError } = await supabaseClient
      .from('avcb_cases')
      .select('*')
      .eq('union_id', profile.union_id);

    if (casesError) throw casesError;

    let nextCaseIdNumber = 1;
    if (unionCases?.length > 0) {
      const numericalIds = unionCases
        .map(item => parseInt(item.case_id, 10))
        .filter(num => !Number.isNaN(num));

      if (numericalIds.length > 0) {
        nextCaseIdNumber = Math.max(...numericalIds) + 1;
      }
    }

    const caseNumberField = document.getElementById('input-case-number');
    if (caseNumberField) {
      caseNumberField.value = nextCaseIdNumber.toString();
    }

    document.getElementById('total-records-display').innerText = unionCases ? unionCases.length : 0;
    updateDemographics(unionCases || []);
  } catch (err) {
    console.error('Initialization error:', err.message);
  }
}

function updateDemographics(cases) {
  const femaleDisplay = document.getElementById('female-percentage-display');
  const maleDisplay = document.getElementById('male-percentage-display');

  if (!femaleDisplay || !maleDisplay) return;

  if (!cases || cases.length === 0) {
    femaleDisplay.innerText = '0%';
    maleDisplay.innerText = '0%';
    return;
  }

  const femaleCount = cases.filter(c => c.beneficiary_gender === 'Female').length;
  const maleCount = cases.filter(c => c.beneficiary_gender === 'Male').length;

  const femalePercentage = Math.round((femaleCount / cases.length) * 100);
  const malePercentage = Math.round((maleCount / cases.length) * 100);

  femaleDisplay.innerText = `${femalePercentage}%`;
  maleDisplay.innerText = `${malePercentage}%`;
}

// 4. SUBMISSION PIPELINE
async function submitNewAvcbCase(event) {
  if (event) event.preventDefault();
  if (!currentUserProfile) return alert('System Error: No user profile loaded.');

  const amount = parseFloat(document.getElementById('input-amount').value) || 0;
  const age = parseInt(document.getElementById('input-beneficiary-age').value) || 0;
  if (amount > 50000) return alert('Jurisdiction limit: 50,000 BDT');

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

  console.table(casePayload);

  try {
    const { error } = await supabaseClient.from('avcb_cases').insert([casePayload]);
    if (error) throw error;

    alert('🎉 Case successfully recorded!');
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

  const { data: cases, error } = await supabaseClient
    .from('avcb_cases')
    .select('*')
    .eq('union_id', currentUserProfile.union_id)
    .eq('current_status', 'PENDING');

  if (error) return console.error(error);

  renderCaseRegistry(cases || []);
  updateDemographics(cases || []);
}

function renderCaseRegistry(cases) {
  const container = document.getElementById('unsolved-list-container');
  if (!container) return;

  if (!cases || cases.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-400 italic">No pending cases</p>';
    return;
  }

  container.innerHTML = cases.map(item => `
    <div class="case-card border p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition">
      <p class="text-xs font-bold">📍 ID: ${item.case_id}</p>
      <p class="text-xs"><strong>Beneficiary:</strong> ${item.beneficiary_name}</p>
      <p class="text-xs text-slate-500">Gender: ${item.beneficiary_gender} | Age: ${item.beneficiary_age}</p>
      <button onclick="resolveCase('${item.id}')" class="mt-2 w-full bg-slate-100 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-semibold py-1 transition">✓ Mark Solved</button>
    </div>
  `).join('');
}

async function resolveCase(guid) {
  try {
    await supabaseClient.from('avcb_cases').update({ current_status: 'RESOLVED' }).eq('id', guid);
    await loadActiveCaseRegistry();
  } catch (err) {
    console.error('Error resolving case:', err);
  }
}

function setupRealtimeSubscription() {
  if (!currentUserProfile) return;

  if (caseSubscription) {
    caseSubscription.unsubscribe();
  }

  caseSubscription = supabaseClient
    .channel('public:avcb_cases')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'avcb_cases',
        filter: `union_id=eq.${currentUserProfile.union_id}`
      },
      () => {
        console.log('Case data changed: refreshing dashboard');
        loadActiveCaseRegistry();
        initializeSmartCaseID(currentUserProfile);
      }
    )
    .subscribe();

  console.log('✅ Real-time subscription activated');
}

function setTamperProofDate() {
  const dateInput = document.getElementById('input-filing-date');
  if (dateInput) {
    dateInput.value = new Date().toLocaleDateString('en-GB');
    dateInput.readOnly = true;
  }
}

function searchCaseRegistry() {
  const searchInput = document.getElementById('search-case-input').value.toLowerCase();
  const cards = document.querySelectorAll('.case-card');

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(searchInput) ? 'block' : 'none';
  });
}

function executeSystemLogout() {
  if (caseSubscription) {
    caseSubscription.unsubscribe();
  }
  location.reload();
}
