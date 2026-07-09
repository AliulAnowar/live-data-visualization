import os
import requests
import pandas as pd
import matplotlib.pyplot as plt

# 🔒 SECURE SYSTEM LOGIC: Automatically loads keys from GitHub Action runner variables
SUPABASE_PROJECT_URL = os.getenv("SUPABASE_PROJECT_URL")
SUPABASE_ANON_PUBLIC_KEY = os.getenv("SUPABASE_ANON_PUBLIC_KEY")

def run_data_automation_pipeline():
    # Defensive checkpoint check: Stops execution early if configuration keys are absent
    if not SUPABASE_PROJECT_URL or not SUPABASE_ANON_PUBLIC_KEY:
        print("❌ System Error: Missing database connection secrets in environment layers.")
        return

    print("🚀 Connecting to Supabase API to fetch live project records...")
    
    headers = {
        "apikey": SUPABASE_ANON_PUBLIC_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_PUBLIC_KEY}"
    }
    
    target_endpoint = f"{SUPABASE_PROJECT_URL}/rest/v1/ngo_project_records?select=district"
    
    try:
        response = requests.get(target_endpoint, headers=headers)
        response.raise_for_status()
        records_data = response.json()
        
        if not records_data:
            print("⚠️ Pipeline Warning: No records found inside the database table.")
            return
            
        # Parse records into a clean dataframe table structural model
        df = pd.DataFrame(records_data)
        district_counts = df['district'].value_counts()
        
       # Example: detect dark mode from environment or frontend flag
# For demo, let's assume an environment variable "APP_THEME" is set to "dark" or "light"
#theme = os.getenv("APP_THEME", "light")  # default to light if not set

print("📊 Re-compiling chart graphic visualizations...")

plt.style.use('dark_background' if theme == "dark" else 'default')
fig, ax = plt.subplots(figsize=(6, 4.5))

if theme == "dark":
    fig.patch.set_facecolor('#0b0f19')
    ax.set_facecolor('#111827')
    ax.tick_params(colors='white')   # axis ticks
    ax.xaxis.label.set_color('white')
    ax.yaxis.label.set_color('white')
    ax.title.set_color('white')
else:
    fig.patch.set_facecolor('white')
    ax.set_facecolor('#f9f9f9')
    ax.tick_params(colors='black')
    ax.xaxis.label.set_color('black')
    ax.yaxis.label.set_color('black')
    ax.title.set_color('black')

ax.set_title("Sample Chart")
ax.set_xlabel("X-axis")
ax.set_ylabel("Y-axis")

plt.show()
        
        # Plot matching emerald dashboard color palette rows
        ax.bar(district_counts.index, district_counts.values, color='#10b981', width=0.5)
        
        # Strip borders
        for spine in ['top', 'right', 'left', 'bottom']:
            ax.spines[spine].set_visible(False)
            
        ax.tick_params(colors='#94a3b8', labelsize=10)
        ax.grid(axis='y', linestyle='--', alpha=0.1, color='#ffffff')
        
        plt.tight_layout()
        plt.savefig('district_chart.png', facecolor=fig.get_facecolor(), edgecolor='none', dpi=150)
        print("🎉 Success! 'district_chart.png' generated perfectly from live database records.")
        
    except Exception as error:
        print(f"❌ Automation runtime broken: {error}")

if __name__ == "__main__":
    run_data_automation_pipeline()
