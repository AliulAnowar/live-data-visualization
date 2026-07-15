"""
AVCB Dashboard Update Script
Generates high-quality visualizations from NGO Case Data.
"""

import pandas as pd
import matplotlib.pyplot as plt
import os
from dotenv import load_dotenv

# Load environment variables if needed
load_dotenv()

# Configuration
EXCEL_FILE = 'NGO_Project_MNE_Dataset_2000.xlsx'

print("=" * 60)
print("🚀 Starting Dashboard Generation Pipeline")
print("=" * 60)

# --- Load Data ---
if not os.path.exists(EXCEL_FILE):
    print(f"❌ Error: {EXCEL_FILE} not found.")
    exit(1)

df = pd.read_excel(EXCEL_FILE, sheet_name='AVCB Cases')
print("\n🔍 STEP 2: Validating Data")

required_columns = [
    'case_id', 'beneficiary_name', 'beneficiary_gender', 'beneficiary_age',
    'case_type', 'dispute_amount', 'current_status', 'filing_date',
    'district_name', 'upazila_name', 'union_name', 'ngo_name'
]

missing_columns = [col for col in required_columns if col not in df.columns]
if missing_columns:
    print(f"❌ Missing columns: {missing_columns}")
    exit(1)

print("✅ All required columns present")

# Validation checks
validation_errors = []

# Check for empty required fields
empty_fields = df[df[['beneficiary_name', 'case_type', 'dispute_amount', 'filing_date']].isna().any(axis=1)]
if len(empty_fields) > 0:
    validation_errors.append(f"⚠️  {len(empty_fields)} rows have empty required fields")

# Validate case_type
invalid_case_types = df[~df['case_type'].isin(['CIVIL', 'CRIMINAL'])]
if len(invalid_case_types) > 0:
    validation_errors.append(f"⚠️  {len(invalid_case_types)} rows have invalid case_type (must be CIVIL or CRIMINAL)")

# Validate current_status
invalid_statuses = df[~df['current_status'].isin(['PENDING', 'RESOLVED'])]
if len(invalid_statuses) > 0:
    validation_errors.append(f"⚠️  {len(invalid_statuses)} rows have invalid status (must be PENDING or RESOLVED)")

# Validate dispute_amount
invalid_amounts = df[(df['dispute_amount'] < 0) | (df['dispute_amount'] > 50000)]
if len(invalid_amounts) > 0:
    validation_errors.append(f"⚠️  {len(invalid_amounts)} rows exceed 50,000 BDT limit")

if validation_errors:
    for error in validation_errors:
        print(error)
else:
    print("✅ All data validation passed")

print(f"✅ Data loaded: {len(df)} records.")

# --- CHART 1: Regional Distribution (District) ---
print("📊 Generating: District Distribution")
district_counts = df['district_name'].value_counts(dropna=False)

plt.style.use('default')
fig, ax = plt.subplots(figsize=(12, 6))
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#f8fafc')

colors = plt.cm.tab20(range(len(district_counts)))
district_counts.plot(kind='bar', ax=ax, color=colors)

ax.set_title('Regional Distribution Metrics - AVCB Cases by District', fontsize=14, fontweight='bold', color='#1e293b')
ax.set_xlabel('District', fontsize=12, color='#1e293b')
ax.set_ylabel('Active Case Volume', fontsize=12, color='#1e293b')
ax.tick_params(axis='x', rotation=45, colors='#1e293b')
ax.tick_params(axis='y', colors='#1e293b')
ax.grid(axis='y', linestyle='--', alpha=0.5, color='#94a3b8')

plt.tight_layout()
plt.savefig('district_chart_v2.png', dpi=150)
print("✅ Saved: district_chart_v2.png")
plt.close()

# --- CHART 2: Case Analytics (Status & Type) ---
print("📊 Generating: Case Analytics")
status_counts = df['current_status'].value_counts()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
fig.patch.set_facecolor('#ffffff')

# Pie chart: Status
colors_status = ['#10b981', '#ef4444']
ax1.pie(status_counts.values, labels=status_counts.index, autopct='%1.1f%%',
        colors=colors_status, startangle=90, textprops={'fontsize': 11, 'weight': 'bold'})
ax1.set_title('Case Resolution Status', fontsize=12, fontweight='bold', color='#1e293b')

# Bar chart: Case Types
case_type_counts = df['case_type'].value_counts()
case_type_counts.plot(kind='bar', ax=ax2, color=['#3b82f6', '#f59e0b'])
ax2.set_title('Case Types Distribution', fontsize=12, fontweight='bold', color='#1e293b')
ax2.set_xlabel('Case Type', fontsize=11, color='#1e293b')
ax2.set_ylabel('Count', fontsize=11, color='#1e293b')
ax2.tick_params(axis='x', rotation=0, colors='#1e293b')
ax2.grid(axis='y', linestyle='--', alpha=0.5, color='#94a3b8')

plt.tight_layout()
plt.savefig('case_analytics.png', dpi=150)
print("✅ Saved: case_analytics.png")
plt.close()

# --- CHART 3: Top 10 Union Distribution ---
print("📊 Generating: Union Distribution")
union_counts = df['union_name'].value_counts().head(10)

fig, ax = plt.subplots(figsize=(12, 6))
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#f8fafc')

union_counts.plot(kind='bar', ax=ax, color='#6366f1')

ax.set_title('Top 10 Union Distribution - Case Volume', fontsize=14, fontweight='bold', color='#1e293b')
ax.set_xlabel('Union Name', fontsize=12, color='#1e293b')
ax.set_ylabel('Number of Cases', fontsize=12, color='#1e293b')
ax.tick_params(axis='x', rotation=45, colors='#1e293b')
ax.grid(axis='y', linestyle='--', alpha=0.5, color='#94a3b8')

plt.tight_layout()
plt.savefig('union_distribution_chart.png', dpi=150)
print("✅ Saved: union_distribution_chart.png")
plt.close()

print("=" * 60)
print("🚀 Dashboard Generation Complete!")
print("=" * 60)
