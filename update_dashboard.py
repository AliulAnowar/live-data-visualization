import pandas as pd
import matplotlib.pyplot as plt

def run_data_automation_pipeline():
    print("📂 Loading data directly from local Excel file...")
    
    try:
        # Read the local file
        df = pd.read_excel('NGO_Project_MNE_Dataset_2000.xlsx')
        
        # 'District' (Note: check if it's 'District' or 'district' in your file)
        district_counts = df['District'].value_counts()
        
        print("📊 Re-compiling chart graphic visualizations...")
        plt.style.use('dark_background')
        fig, ax = plt.subplots(figsize=(6, 4.5))
        
        # Set background colors
        fig.patch.set_facecolor('#0b0f19')
        ax.set_facecolor('#111827')
        
        # --- APPLY COLORS ---
        ax.xaxis.label.set_color('#e2e8f0')
        ax.yaxis.label.set_color('#e2e8f0')
        ax.tick_params(axis='x', colors='#e2e8f0')
        ax.tick_params(axis='y', colors='#e2e8f0')
        ax.title.set_color('#e2e8f0')
        ax.spines['bottom'].set_color('#e2e8f0')
        ax.spines['left'].set_color('#e2e8f0')
        
        # Create bar chart
        ax.bar(district_counts.index, district_counts.values, color='#10b981', width=0.5)
        
        # Strip borders
        for spine in ['top', 'right', 'left', 'bottom']:
            ax.spines[spine].set_visible(False)
            
        ax.tick_params(labelsize=10) 
        ax.grid(axis='y', linestyle='--', alpha=0.1, color='#ffffff')
        
        plt.tight_layout()
        plt.savefig('district_chart.png', facecolor=fig.get_facecolor(), edgecolor='none', dpi=150, transparent=False)
        print("🎉 Success! 'district_chart.png' generated from local Excel file.")
        
    except Exception as error:
        print(f"❌ Automation runtime broken: {error}")

if __name__ == "__main__":
    run_data_automation_pipeline()
