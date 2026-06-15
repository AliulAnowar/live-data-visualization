import pandas as pd
import matplotlib.pyplot as plt
import os
from datetime import datetime

try:
    print("🔄 Initializing modern luxury UI/UX web pipeline...")
    
    # 1. Read your master Excel dataset
    file_name = "NGO_Project_MNE_Dataset_2000.xlsx"
    if not os.path.exists(file_name):
        raise FileNotFoundError(f"Could not locate {file_name} in root folder.")
        
    df = pd.read_excel(file_name, engine='openpyxl')
    print(f"📊 Dataset successfully parsed. Found {len(df)} total rows.")
    
    # 2. Compute dynamic live variables
    total_records = len(df)
    
    district_counts = df['District'].value_counts()
    sorted_districts = district_counts.index.tolist()
    sorted_values = district_counts.values.tolist()
    
    gender_counts = df['Gender'].value_counts()
    female_count = int(gender_counts.get('Female', 0))
    male_count = int(gender_counts.get('Male', 0))
    female_pct = round((female_count / total_records) * 100, 1) if total_records else 0
    male_pct = round((male_count / total_records) * 100, 1) if total_records else 0
    
    # 3. Create a clean Matplotlib backup chart asset
    plt.figure(figsize=(7, 4))
    plt.bar(sorted_districts, sorted_values, color='#10b981', edgecolor='none', alpha=0.8, width=0.5)
    plt.title("Static System Backup Asset", fontsize=10, fontweight='bold', color='#64748b', pad=10)
    plt.grid(axis='y', linestyle=':', alpha=0.3)
    plt.gca().spines['top'].set_visible(False)
    plt.gca().spines['right'].set_visible(False)
    plt.tight_layout()
    plt.savefig("district_chart.png", dpi=300, transparent=True)
    plt.close()
    
    sync_time = datetime.now().strftime("%Y-%m-%d %H:%M")

    # 4. --- LUXURY WHITE/BLACK THEME HTML GENERATION FACTORY ---
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>M&E Advanced Monitoring System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {{
            darkMode: 'class',
            theme: {{
                extend: {{
                    fontFamily: {{ sans: ['Plus Jakarta Sans', 'sans-serif'] }}
                }}
            }}
        }}
    </script>
</head>
<body class="bg-[#f8fafc] text-[#1e293b] dark:bg-[#0b0f19] dark:text-[#f1f5f9] min-h-screen transition-colors duration-300 flex flex-col">

    <header class="bg-white dark:bg-[#111827] border-b border-slate-200/80 dark:border-slate-800/50 px-8 py-4 flex items-center justify-between transition-colors duration-300">
        <div class="flex items-center gap-8">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">✦</div>
                <span class="text-lg font-bold tracking-tight dark:text-white">DataView</span>
            </div>
            <nav class="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                <a href="#" class="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full">Monitoring</a>
                <a href="#" class="px-4 py-1.5 hover:text-slate-900 dark:hover:text-white transition">Reporting</a>
                <a href="#" class="px-4 py-1.5 hover:text-slate-900 dark:hover:text-white transition">Help & Resources</a>
            </nav>
        </div>
        
        <div class="flex items-center gap-4">
            <button id="themeToggle" class="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-semibold shadow-sm hover:scale-105 transition-all">
                🌓 Toggle Theme
            </button>
            
            <div class="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
                <div class="text-right hidden sm:block">
                    <div class="text-xs font-semibold dark:text-white">M&E Officer</div>
                    <div class="text-[10px] text-slate-400">Active Session</div>
                </div>
                <div class="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-emerald-500 overflow-hidden flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300">
                    ME
                </div>
            </div>
        </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
        <aside class="w-64 bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-slate-800/50 p-6 flex flex-col justify-between transition-colors duration-300">
            <div class="space-y-6">
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Dataset Criteria Filter</label>
                    <select id="queryEngine" class="w-full bg-slate-50 dark:bg-[#1f2937] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl focus:outline-none text-sm transition">
                        <option value="all">All Field Districts</option>
                        {"".join([f'<option value="{d}">{d}</option>' for d in sorted_districts])}
                    </select>
                </div>
                
                <div class="space-y-1">
                    <span class="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Column Metrics</span>
                    <div class="text-xs p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg font-medium">📍 Location Matrix Active</div>
                    <div class="text-xs p-2.5 text-slate-500 dark:text-slate-400 font-medium">👥 Gender Matrix Active</div>
                </div>
            </div>

            <div class="text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <div class="font-medium">System Core: Python Engine</div>
                <div class="text-slate-500 mt-0.5">Automated: {sync_time}</div>
            </div>
        </aside>

        <main class="flex-1 p-8 overflow-y-auto space-y-8">
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Project Distribution</h2>
                    <p class="text-xs text-slate-400 mt-1">Live data streaming framework displaying descriptive evaluation layers.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm transition">
                    <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Evaluated Records</div>
                    <div class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">{total_records}</div>
                    <div class="text-[10px] text-emerald-500 font-semibold mt-2">✓ Verified Database Stream</div>
                </div>
                <div class="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm transition">
                    <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Female Distribution</div>
                    <div class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">{female_pct}%</div>
                    <div class="text-[10px] text-slate-400 mt-2">Target sample: {female_count} active entries</div>
                </div>
                <div class="bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm transition">
                    <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Male Distribution</div>
                    <div class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">{male_pct}%</div>
                    <div class="text-[10px] text-slate-400 mt-2">Target sample: {male_count} active entries</div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div class="mb-4">
                        <span class="text-xs font-bold text-emerald-500 uppercase tracking-wider">Dynamic Visual Module</span>
                        <h3 class="text-base font-bold text-slate-800 dark:text-white mt-0.5">Interactive Geographic Frequencies</h3>
                    </div>
                    <div class="relative h-64 w-full">
                        <canvas id="luxuryInteractiveChart"></canvas>
                    </div>
                </div>

                <div class="bg-[#0b0f19] text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl border border-slate-800">
                    <div>
                        <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Matplotlib Module</span>
                        <h3 class="text-base font-bold text-white mt-0.5">Static Asset Lock</h3>
                        <p class="text-xs text-slate-500 mt-1">High-resolution tracking asset compiled by python core.</p>
                    </div>
                    <div class="bg-[#111827] rounded-2xl p-4 flex items-center justify-center border border-slate-800/50 mt-4 overflow-hidden">
                        <img src="district_chart.png" alt="Pipeline Chart" class="w-full h-auto object-contain max-h-[160px]">
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Theme switching engine mechanism
        const themeToggleBtn = document.getElementById('themeToggle');
        themeToggleBtn.addEventListener('click', () => {{
            document.documentElement.classList.toggle('dark');
        }});

        // Interactive Chart rendering setup
        const ctx = document.getElementById('luxuryInteractiveChart').getContext('2d');
        const chartLabels = {list(sorted_districts)};
        const chartValues = {list(sorted_values)};

        new Chart(ctx, {{
            type: 'bar',
            data: {{
                labels: chartLabels,
                datasets: [{{
                    data: chartValues,
                    backgroundColor: '#10b981',
                    hoverBackgroundColor: '#059669',
                    borderRadius: 12,
                    borderSkipped: false,
                    barPercentage: 0.5
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{ legend: {{ display: false }} }},
                scales: {{
                    x: {{ grid: {{ display: false }}, ticks: {{ color: '#94a3b8' }} }},
                    y: {{ grid: {{ color: '#e2e8f0', drawBorder: false }}, ticks: {{ color: '#94a3b8' }} }}
                }}
            }}
        }});
    </script>
</body>
</html>
"""

    # 5. Overwrite index.html safely
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html_content)

    print("🚀 Masterpiece Compiled successfully! 'index.html' matches your custom design layout.")

except Exception as e:
    print(f"❌ Critical Pipeline Failure: {str(e)}")
    exit(1)
