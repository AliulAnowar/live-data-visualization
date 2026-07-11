import pandas as pd
import matplotlib.pyplot as plt

# 1. Load Data
df = pd.read_excel('NGO_Project_MNE_Dataset_2000.xlsx')

# 2. Prepare Data (Count all rows, including any potential blanks just in case)
district_counts = df['District'].value_counts(dropna=False)

# 3. Setup Plot
plt.style.use('default')
fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#f8fafc')

# 4. Create Chart
district_counts.plot(kind='bar', ax=ax, color=['#10b981', '#3b82f6', '#f59e0b', '#ef4444'])

# 5. Styling & Labels
ax.set_title('Regional Distribution Metrics', fontsize=14, fontweight='bold', color='#1e293b')
ax.set_xlabel('District', fontsize=12, color='#1e293b')
ax.set_ylabel('Household Record Volumes', fontsize=12, color='#1e293b')
ax.tick_params(axis='x', rotation=0, colors='#1e293b')
ax.tick_params(axis='y', colors='#1e293b')
ax.grid(axis='y', linestyle='--', alpha=0.5, color='#94a3b8')

# 6. Save
plt.tight_layout()
plt.savefig('district_chart.png', dpi=150)
