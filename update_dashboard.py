"""
AVCB Dashboard Update Script
Generates high-quality visualizations, dynamic README insights, and gender distribution analytics.
"""

import pandas as pd
import matplotlib.pyplot as plt
import os
from dotenv import load_dotenv
import re
import time

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

empty_fields = df[df[['beneficiary_name', 'case_type', 'dispute_amount', 'filing_date']].isna().any(axis=1)]
if len(empty_fields) > 0:
    validation_errors.append(f"⚠️  {len(empty_fields)} rows have empty required fields")

invalid_case_types = df[~df['case_type'].isin(['CIVIL', 'CRIMINAL'])]
if len(invalid_case_types) > 0:
    validation_errors.append(f"⚠️  {len(invalid_case_types)} rows have invalid case_type (must be CIVIL or CRIMINAL)")

invalid_statuses = df[~df['current_status'].isin(['PENDING', 'RESOLVED'])]
if len(invalid_statuses) > 0:
    validation_errors.append(f"⚠️  {len(invalid_statuses)} rows have invalid status (must be PENDING or RESOLVED)")

invalid_amounts = df[(df['dispute_amount'] < 0) | (df['dispute_amount'] > 50000)]
if len(invalid_amounts) > 0:
    validation_errors.append(f"⚠️  {len(invalid_amounts)} rows exceed 50,000 BDT limit")

if validation_errors:
    for error in validation_errors:
        print(error)
else:
    print("✅ All data validation passed")

print(f"✅ Data loaded: {len(df)} records.")

# --- Calculate Dynamic Metrics for README & Charts ---
total_households = len(df)
district_counts = df['district_name'].value_counts(dropna=False)
sorted_districts = district_counts.sort_values(ascending=False)

dist_items = list(sorted_districts.items())
dist_phrases = [f"**{dist}** lead with **{count} records**" if i == 0 else f"**{dist}** (**{count}**)" for i, (dist, count) in enumerate(dist_items)]
if len(dist_phrases) > 1:
    district_text = f"{dist_phrases[0]}, followed by " + ", ".join(dist_phrases[1:-1]) + f" and {dist_phrases[-1]}" if len(dist_phrases) > 2 else f"{dist_phrases[0]} and {dist_phrases[1]}"
else:
    district_text = dist_phrases[0]

gender_counts = df['beneficiary_gender'].value_counts()
female_count = gender_counts.get('Female', 0)
male_count = gender_counts.get('Male', 0)
female_pct = (female_count / total_households) * 100 if total_households > 0 else 0
male_pct = (male_count / total_households) * 100 if total_households > 0 else 0

# --- CHART 1: Beneficiary Gender Distribution (male-female.jpg - Combined Pie & Column) ---
print("📊 Generating: Combined Gender Distribution (Pie & Column)")
gender_counts = df['beneficiary_gender'].value_counts()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
fig.patch.set_facecolor('#ffffff')

# Left side: Pie chart (Proportions)
colors_gender_pie = ['#3b82f6', '#ec4899']
ax1.pie(gender_counts.values, labels=gender_counts.index, autopct='%1.1f%%',
        colors=colors_gender_pie, startangle=90, textprops={'fontsize': 11, 'weight': 'bold'})
ax1.set_title('Beneficiary Gender Distribution (Proportion)', fontsize=12, fontweight='bold', color='#1e293b')

# Right side: Column chart (Counts)
colors_gender_bar = ['#3b82f6', '#ec4899']
gender_counts.plot(kind='bar', ax=ax2, color=colors_gender_bar)
ax2.set_title('Beneficiary Gender Distribution (Count)', fontsize=12, fontweight='bold', color='#1e293b')
ax2.set_xlabel('Gender', fontsize=11, color='#1e293b')
ax2.set_ylabel('Count', fontsize=11, color='#1e293b')
ax2.tick_params(axis='x', rotation=0, colors='#1e293b')
ax2.grid(axis='y', linestyle='--', alpha=0.5, color='#94a3b8')

plt.tight_layout()
plt.savefig('male-female.jpg', dpi=150)
print("✅ Saved: male-female.jpg")
plt.close()


# --- CHART 1: Regional Distribution (District) ---
print("📊 Generating: District Distribution")
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

colors_status = ['#10b981', '#ef4444']
ax1.pie(status_counts.values, labels=status_counts.index, autopct='%1.1f%%',
        colors=colors_status, startangle=90, textprops={'fontsize': 11, 'weight': 'bold'})
ax1.set_title('Case Resolution Status', fontsize=12, fontweight='bold', color='#1e293b')

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

# --- CHART 4: Beneficiary Gender Distribution (male-female.jpg - Combined Pie & Column) ---
print("📊 Generating: Combined Gender Distribution (Pie & Column)")
gender_counts = df['beneficiary_gender'].value_counts()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
fig.patch.set_facecolor('#ffffff')

# Left side: Pie chart (Proportions)
colors_gender_pie = ['#3b82f6', '#ec4899']
ax1.pie(gender_counts.values, labels=gender_counts.index, autopct='%1.1f%%',
        colors=colors_gender_pie, startangle=90, textprops={'fontsize': 11, 'weight': 'bold'})
ax1.set_title('Beneficiary Gender Distribution (Proportion)', fontsize=12, fontweight='bold', color='#1e293b')

# Right side: Column chart (Counts)
colors_gender_bar = ['#3b82f6', '#ec4899']
gender_counts.plot(kind='bar', ax=ax2, color=colors_gender_bar)
ax2.set_title('Beneficiary Gender Distribution (Count)', fontsize=12, fontweight='bold', color='#1e293b')
ax2.set_xlabel('Gender', fontsize=11, color='#1e293b')
ax2.set_ylabel('Count', fontsize=11, color='#1e293b')
ax2.tick_params(axis='x', rotation=0, colors='#1e293b')
ax2.grid(axis='y', linestyle='--', alpha=0.5, color='#94a3b8')

plt.tight_layout()
plt.savefig('male-female.jpg', dpi=150)
print("✅ Saved: male-female.jpg")
plt.close()

# --- STEP 3: Dynamic README Updates & Cache-Busting ---
print("📝 STEP 4: Updating README.md with live dynamic metrics and timestamps")

with open("README.md", "r", encoding="utf-8") as f:
    content = f.read()

new_geo_section = (
    f"Geographic Sample Distribution: The tracking dataset automatically parses real-time metrics "
    f"directly across active field household records. {district_text}. "
    f"Total live tracked sample size is {total_households} households."
)

new_demo_section = (
    f"Target Demographics: In alignment with institutional M&E and maternal development targets, "
    f"the baseline gender distribution was programmatically optimized, capturing "
    f"{female_count} Female beneficiaries ({female_pct:.1f}%) and "
    f"{male_count} Male beneficiaries ({male_pct:.1f}%)."
)

content = re.sub(
    r'Geographic Sample Distribution:.*?\.\s*Total live tracked sample size is.*?\.',
    new_geo_section,
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'Target Demographics:.*?\.\s*capturing.*?\.',
    new_demo_section,
    content,
    flags=re.DOTALL
)

# Cache-busting timestamps for all charts (including male-female.jpg)
timestamp = int(time.time())
content = re.sub(r'\(district_chart_v2\.png(\?v=\d+)?\)', f'(district_chart_v2.png?v={timestamp})', content)
content = re.sub(r'\(case_analytics\.png(\?v=\d+)?\)', f'(case_analytics.png?v={timestamp})', content)
content = re.sub(r'\(union_distribution_chart\.png(\?v=\d+)?\)', f'(union_distribution_chart.png?v={timestamp})', content)
content = re.sub(r'\(male-female\.jpg(\?v=\d+)?\)', f'(male-female.jpg?v={timestamp})', content)

with open("README.md", "w", encoding="utf-8") as f:
    f.write(content)

print("✅ README.md updated successfully with live dynamic data.")
print("=" * 60)
print("🚀 Pipeline Finished Successfully")
print("=" * 60)
