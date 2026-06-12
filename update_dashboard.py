import pandas as pd
import matplotlib.pyplot as plt
import os

try:
    print("🔄 Initializing cloud data sync...")
    
    # Check if file exists in the directory
    file_name = "NGO_Project_MNE_Dataset_2000.xlsx"
    if not os.path.exists(file_name):
        raise FileNotFoundError(f"Could not locate {file_name} in root folder.")
        
    # Read Excel specifying openpyxl explicitly for the engine
    df = pd.read_excel(file_name, engine='openpyxl')
    print(f"📊 Dataset successfully parsed. Found {len(df)} total rows.")
    
    # Calculate the updated frequencies using the exact case-sensitive label
    district_counts = df['District'].value_counts()
    
    # Generate the pristine visualization
    plt.figure(figsize=(10, 6))
    
    # Highlight highest frequency with a distinct color profile
    colors = ['#2196f3' if x < district_counts.max() else '#0b7dda' for x in district_counts.values]
    
    district_counts.plot(kind='bar', color=colors, edgecolor='black', zorder=3)
    
    plt.title("Project Implementation District (Automated Monitoring)", fontsize=14, fontweight='bold', pad=15)
    plt.ylabel("Frequency", fontsize=12, fontweight='bold')
    plt.xlabel("Project Implementation District", fontsize=12, fontweight='bold')
    plt.xticks(rotation=0)
    plt.grid(axis='y', linestyle='--', alpha=0.7, zorder=0)
    
    # Save chart asset
    plt.savefig("district_chart.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("🎯 Success: 'district_chart.png' generated and updated perfectly.")

except Exception as e:
    print(f"❌ Critical Pipeline Failure: {str(e)}")
    # Force exit code 0 to keep track of the workflow environment log
    exit(1)
