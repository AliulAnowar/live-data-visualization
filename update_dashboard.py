I have reproduced the full, original content of your `update_dashboard.py` file exactly as you provided it.

```python
"""
Updated Dashboard Script - Syncs Excel data with Supabase and generates visualizations
This script reads case data from Excel, validates it, syncs to Supabase, and generates charts
"""

import pandas as pd
import matplotlib.pyplot as plt
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
EXCEL_FILE = 'NGO_Project_MNE_Dataset_2000.xlsx'

print("=" * 60)
print("🚀 AVCB Dashboard Update Pipeline Started")
print("=" * 60)

# ============================================================================
# STEP 1: Load and Validate Excel Data
# ============================================================================
print("\n📂 STEP 1: Loading Excel Data")

try:
    if not os.path.exists(EXCEL_FILE):
        raise FileNotFoundError(f"Data file not found: {EXCEL_FILE}")
    
    df = pd.read_excel(EXCEL_FILE, sheet_name='AVCB Cases')
    print(f"✅ Loaded {len(df)} records from Excel")
    print(f"   Columns: {list(df.columns)}")
    
except Exception as e:
    print(f"❌ Error loading Excel: {str(e)}")
    exit(1)

# ============================================================================
# STEP 2: Data Validation
# ============================================================================
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

# Clean data
df = df.dropna(subset=['beneficiary_name', 'case_type', 'dispute_amount'])

# ============================================================================
# STEP 3: Generate Analytics & Visualizations
# ============================================================================
print("\n📊 STEP 3: Generating Visualizations")

try:
    # --- Chart 1: District Distribution ---
    district_counts = df['district_name'].value_counts(dropna=False)
    
    plt.style.use('default')
    fig, ax = plt.subplots(figsize=(12, 6))
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#f8fafc')
    
    colors = plt.cm.tab20(range(len(district_counts)))
    district_counts.plot(kind='bar', ax=ax, color=colors)
    
    ax.set_title('Regional Distribution Metrics - AVCB Cases by District', 
                 fontsize=14, fontweight='bold', color='#1e293b')
    ax.set_xlabel('District', fontsize=12, color='#1e293b')
    ax.set_ylabel('Active Case Volume', fontsize=12, color='#1e293b')
    ax.tick_params(axis='x', rotation=45, colors='#1e293b')
    ax.tick_params(axis='y', colors='#1e293b')
    ax.grid(axis='y', linestyle='--', alpha=0.5, color='#94a3b8')
    
    plt.tight_layout()
    plt.savefig('district_chart.png', dpi=150)
    print("✅ District chart generated: district_chart.png")
    plt.close()
    
    # --- Chart 2: Case Status Distribution ---
    status_counts = df['current_status'].value_counts()
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    fig.patch.set_facecolor('#ffffff')
    
    # Pie chart
    colors_status = ['#10b981', '#ef4444']  # green for RESOLVED, red for PENDING
    ax1.pie(status_counts.values, labels=status_counts.index, autopct='%1.1f%%',
            colors=colors_status, startangle=90, textprops={'fontsize': 11, 'weight': 'bold'})
    ax1.set_title('Case Resolution Status', fontsize=12, fontweight='bold', color='#1e293b')
    
    # Bar chart - Case types
    case_type_counts = df['case_type'].value_counts()
    case_type_counts.plot(kind='bar', ax=ax2, color=['#3b82f6', '#f59e0b'])
    ax2.set_title('Case Types Distribution', fontsize=12, fontweight='bold', color='#1e293b')
    ax2.set_xlabel('Case Type', fontsize=11, color='#1e293b')
    ax2.set_ylabel('Count', fontsize=11, color='#1e293b')
    ax2.tick_params(axis='x', rotation=0)
    ax2.grid(axis='y', linestyle='--', alpha=0.5)
    
    plt.tight_layout()
    plt.savefig('case_analytics.png', dpi=150)
    print("✅ Case analytics chart generated: case_analytics.png")
    plt.close()
    
except Exception as e:
    print(f"❌ Error generating charts: {str(e)}")
    exit(1)

# ============================================================================
# STEP 4: Calculate Statistics
# ============================================================================
print("\n📈 STEP 4: Calculating Statistics")

stats = {
    'total_cases': len(df),
    'pending_cases': len(df[df['current_status'] == 'PENDING']),
    'resolved_cases': len(df[df['current_status'] == 'RESOLVED']),
    'resolution_rate': f"{(len(df[df['current_status'] == 'RESOLVED']) / len(df) * 100):.1f}%",
    'avg_dispute_amount': f"BDT {df['dispute_amount'].mean():,.2f}",
    'max_dispute_amount': f"BDT {df['dispute_amount'].max():,.2f}",
    'civil_cases': len(df[df['case_type'] == 'CIVIL']),
    'criminal_cases': len(df[df['case_type'] == 'CRIMINAL']),
    'avg_beneficiary_age': f"{df['beneficiary_age'].mean():.1f} years",
    'male_count': len(df[df['beneficiary_gender'] == 'Male']),
    'female_count': len(df[df['beneficiary_gender'] == 'Female']),
}

print("\n📊 Dashboard Statistics:")
print(f"   Total Cases: {stats['total_cases']}")
print(f"   Pending: {stats['pending_cases']} | Resolved: {stats['resolved_cases']}")
print(f"   Resolution Rate: {stats['resolution_rate']}")
print(f"   Avg Dispute Amount: {stats['avg_dispute_amount']}")
print(f"   Civil: {stats['civil_cases']} | Criminal: {stats['criminal_cases']}")
print(f"   Gender Distribution: {stats['male_count']} Male, {stats['female_count']} Female")

# ============================================================================
# STEP 5: Prepare Data for Supabase Sync (Optional)
# ============================================================================
print("\n🔄 STEP 5: Preparing Data for Supabase")

try:
    # Only sync if Supabase credentials are available
    if SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client, Client
        
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
        
        # Prepare records for insertion
        # Note: UUIDs and foreign keys should be handled based on your system
        records_to_sync = []
        
        print(f"   Ready to sync {len(df)} records to avcb_cases table")
        print("   ⚠️  Note: Manual Supabase credentials and UUID mapping required")
        
    else:
        print("⚠️  Supabase credentials not found in environment variables")
        print("   To enable Supabase sync, set: SUPABASE_URL and SUPABASE_KEY")
        
except Exception as e:
    print(f"⚠️  Supabase sync not configured: {str(e)}")

# ============================================================================
# STEP 6: Summary
# ============================================================================
print("\n" + "=" * 60)
print("✅ Dashboard Update Pipeline Completed Successfully!")
print("=" * 60)
print(f"\n📊 Generated Files:")
print(f"   ✓ district_chart.png")
print(f"   ✓ case_analytics.png")
print(f"\n📈 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("\n" + "=" * 60)

```
