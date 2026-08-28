# 📚 Basics Documentation — Fintech Payment Insights

> **Project-Based Learning Reference**
> This folder contains foundational concepts you need to understand before diving into the project notebooks.

---

## What This Project Is About

**Fintech-Payment-Insights** is a data analytics project that helps finance teams distinguish between:

- ⚡ **Temporary payment failures** — failures that can be recovered via retries
- 🔴 **Permanent revenue loss** — failures that cannot be recovered

We analyze **payment retries**, **bank response codes**, and **transaction timestamps** using Python and visualize insights in a Power BI dashboard.

---

## Project Workflow at a Glance

```
Raw Datasets
     ↓
Data Collection & Loading
     ↓
Data Cleaning & Validation
     ↓
Data Integration (Merging on Transaction_ID)
     ↓
Feature Engineering
     ↓
Exploratory Data Analysis (EDA)
     ↓
KPI Calculation
     ↓
Power BI Dashboard
     ↓
Business Insights
```

---

## Folder Structure

```
SW70-Data-Product-Development-Fintech-Payment-Insights/
│
├── data/
│   └── raw/                    ← Original raw datasets
│
├── notebook/
│   └── 01_upi_data_exploration.ipynb
│
├── docs/
│   └── basics/                 ← 📍 You are here
│       ├── 00_overview.md
│       ├── 01_python_pandas_basics.md
│       ├── 02_data_cleaning_concepts.md
│       ├── 03_feature_engineering.md
│       ├── 04_eda_and_visualization.md
│       ├── 05_kpi_and_business_metrics.md
│       └── 06_power_bi_basics.md
│
└── README.md
```

---

## Learning Roadmap

| # | Document | What You'll Learn |
|---|----------|-------------------|
| 1 | `01_python_pandas_basics.md` | Python, Pandas, NumPy fundamentals |
| 2 | `02_data_cleaning_concepts.md` | Missing values, duplicates, type casting |
| 3 | `03_feature_engineering.md` | Creating new analytical columns |
| 4 | `04_eda_and_visualization.md` | EDA patterns, Matplotlib, Plotly |
| 5 | `05_kpi_and_business_metrics.md` | KPI definitions, business logic |
| 6 | `06_power_bi_basics.md` | DAX basics, dashboard design |

---

## Key Datasets Used

| Dataset | Description |
|---------|-------------|
| **Payment Retries** | Retry attempts made for failed transactions |
| **Bank Response Codes** | Gateway/bank codes for each transaction |
| **Transaction Details** | ID, timestamp, amount, payment status |

All three datasets are joined using **`Transaction_ID`** as the primary key.

---

## Tech Stack Quick Reference

| Tool | Role |
|------|------|
| Python 3.x | Core language |
| Pandas | Data wrangling |
| NumPy | Numerical ops |
| Matplotlib | Static charts |
| Plotly | Interactive charts |
| Jupyter Notebook | Dev environment |
| Power BI | BI Dashboard |
| Git + GitHub | Version control |
