import pandas as pd
import matplotlib.pyplot as plt

try:
    # 1. Load the dataset
    df = pd.read_excel("NGO_Project_MNE_Dataset_2000.xlsx")
    
    # 2. Calculate the updated frequencies
    district_counts = df['District'].value_counts()
    
    # 3. Re-generate and overwrite the exact chart image
    plt.figure(figsize=(10, 6))
    colors = ['#34a853' if x == district_counts.max() else '#2196f3' for x in district_counts.values]
    
    district_counts.plot(kind='bar', color=colors, edgecolor='black', zorder=3)
    
    plt.title("Project Implementation District (Live Tracking)", fontsize=14, fontweight='bold', pad=15)
    plt.ylabel("Frequency", fontsize=12, fontweight='bold')
    plt.xlabel("Project Implementation District", fontsize=12, fontweight='bold')
    plt.xticks(rotation=0)
    plt.grid(axis='y', linestyle='--', alpha=0.7, zorder=0)
    
    # Overwrite the old image file automatically
    plt.savefig("district_chart.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("✅ Success: Pipeline executed. 'district_chart.png' updated perfectly.")

except Exception as e:
    print(f"❌ Error running pipeline: {e}")