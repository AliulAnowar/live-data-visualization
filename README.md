📊 NGO Project Automated M&E Dashboard

This repository contains a production-grade Monitoring and Evaluation (M&E) data system and automated cloud pipeline. The project processes socioeconomic indicators across beneficiary records, transitioning a static institutional database into a living, cloud-monitored dashboard.
🏗️ System Architecture & Workflow

The architecture operates entirely on open-source automation, ensuring that field modifications are instantly calculated and published without manual developer intervention:

    Data Ingestion: Raw tracking metrics are modified or inserted directly into the primary Excel spreadsheet.

    Cloud Orchestration (GitHub Actions): A secure Ubuntu virtual machine initializes automatically on file update triggers or manual dispatch overrides.

    Programmatic Compilation (Python): Python's pandas and openpyxl data engines parse the file, validate column schemas, and dynamically recalculate descriptive distribution metrics.

    Automated Visualization Deployment: The script draws a pristine statistical frequency chart via matplotlib and automatically overwrites the web asset, updating the public dashboard in real time.
### 1. District Distribution
![District Chart](district_chart_v2.png?v=1784569967)

### 2. Case Analytics
![Case Analytics](case_analytics.png?v=1784569967)

### 3. Top 10 Union Distribution
![Union Distribution](union_distribution_chart.png?v=1784569967)

### 3. Male & Femle Analytics
![Union Distribution](male-female.jpg?v=1784569967)
🔍 Foundational Statistical Findings

Below is the live data visualization tracking our regional distributions across the target sample size, automatically compiled by our Python and GitHub Actions cloud pipeline:
📈 Verified Statistical Insights (Live Monitoring Output)




🛠️ Repository File Structure

    📁 .github/workflows/auto_run.yml — Cloud automation layout governing virtual server environments, libraries, write-permissions, and script executions.

    📄 NGO_Project_MNE_Dataset_2000.xlsx — Master tracking spreadsheet holding active indicator metrics.

    🐍 update_dashboard.py — Automation script written in Python to extract data, manage exceptions, and compile charts natively.

    📝 README.md — Front-facing presentation dashboard containing project documentation and statistical findings.
