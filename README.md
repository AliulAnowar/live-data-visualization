📊 NGO Project Automated M&E Dashboard

This repository contains a production-grade Monitoring and Evaluation (M&E) data system and automated cloud pipeline. The project processes socioeconomic indicators across beneficiary records, transitioning a static institutional database into a living, cloud-monitored dashboard.
🏗️ System Architecture & Workflow

The architecture operates entirely on open-source automation, ensuring that field modifications are instantly calculated and published without manual developer intervention:

    Data Ingestion: Raw tracking metrics are modified or inserted directly into the primary Excel spreadsheet.

    Cloud Orchestration (GitHub Actions): A secure Ubuntu virtual machine initializes automatically on file update triggers or manual dispatch overrides.

    Programmatic Compilation (Python): Python's pandas and openpyxl data engines parse the file, validate column schemas, and dynamically recalculate descriptive distribution metrics.

    Automated Visualization Deployment: The script draws a pristine statistical frequency chart via matplotlib and automatically overwrites the web asset, updating the public dashboard in real time.
### 1. District Distribution
![District Chart](district_chart_v2.png?v=1784438190)

### 2. Case Analytics
![Case Analytics](case_analytics.png?v=1784438190)

### 3. Top 10 Union Distribution
![Union Distribution](union_distribution_chart.png?v=1784438190)
🔍 Foundational Statistical Findings

Below is the live data visualization tracking our regional distributions across the target sample size, automatically compiled by our Python and GitHub Actions cloud pipeline:
📈 Verified Statistical Insights (Live Monitoring Output)


    Geographic Sample Distribution: The tracking dataset automatically parses real-time metrics directly across active field household records. Rangpur and Gaibandha lead as our primary implementation hubs with 5 records each, followed by Dinajpur (4) and Kurigram (4). Total live tracked sample size is 18 households.

    Target Demographics: In alignment with institutional M&E and maternal development targets, the baseline gender distribution was programmatically optimized, capturing 9 Female beneficiaries (50%) and 9 Male beneficiaries (50%).

    Core Interventions: Programmatic resource allocation was distributed equally across core developmental pillars tracked live within the main tracking database architecture.

    Hypothesis Testing (Paired Samples T-Test Results):

  

        Analysis: The tracking dataset reveals a substantial positive shift from baseline to endline tracking bounds.

        Conclusion: The Paired Samples Test achieved an absolute significance value of p<.001. This mathematically proves that the capacity-building training interventions directly correlate with a highly significant economic household gain.

🛠️ Repository File Structure

    📁 .github/workflows/auto_run.yml — Cloud automation layout governing virtual server environments, libraries, write-permissions, and script executions.

    📄 NGO_Project_MNE_Dataset_2000.xlsx — Master tracking spreadsheet holding active indicator metrics.

    🐍 update_dashboard.py — Automation script written in Python to extract data, manage exceptions, and compile charts natively.

    📝 README.md — Front-facing presentation dashboard containing project documentation and statistical findings.
