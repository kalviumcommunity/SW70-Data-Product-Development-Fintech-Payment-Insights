# 📊 Power BI Basics

> **Learning Goal**: Understand the fundamentals of Power BI to build the fintech payment insights dashboard.

---

## What is Power BI?

**Power BI** is Microsoft's business intelligence tool that transforms raw data into interactive visual dashboards. It's the final delivery layer of this project — turning all Python-processed data into insights that finance teams can act on.

---

## Power BI Workflow in This Project

```
Python (cleaned_transactions.csv + kpi_summary.csv)
              ↓
     Load into Power BI Desktop
              ↓
        Power Query (minor transforms)
              ↓
       Data Model (relationships)
              ↓
        DAX Measures (KPIs)
              ↓
     Visuals & Dashboard
              ↓
     Publish & Share
```

---

## 1. Key Terms to Know

| Term | Meaning |
|------|---------|
| **Dataset** | The data you import into Power BI |
| **Report** | One or more pages of visuals built from a dataset |
| **Dashboard** | A pinned collection of visuals from reports |
| **Measure** | A DAX formula that calculates a value dynamically |
| **Calculated Column** | A new column added using DAX formula |
| **Slicer** | An interactive filter control on the report page |
| **Card Visual** | A single large number display (for KPIs) |
| **Power Query** | Power BI's built-in data transformation editor |

---

## 2. Importing Data

1. Open **Power BI Desktop**
2. Click **Home → Get Data → Text/CSV**
3. Select `data/processed/cleaned_transactions.csv`
4. Also import `data/processed/kpi_summary.csv`
5. Click **Transform Data** to open Power Query if needed

### In Power Query
- Verify column types (Amount = Decimal Number, Date = Date/Time)
- Rename columns for readability
- Click **Close & Apply**

---

## 3. Creating Relationships

If you load multiple tables, connect them via `Transaction_ID`:

1. Go to **Model view** (left sidebar icon)
2. Drag `Transaction_ID` from one table to another
3. Set cardinality: One-to-Many (1:*)
4. Set cross-filter direction: Single

---

## 4. DAX Basics

**DAX (Data Analysis Expressions)** is the formula language of Power BI.

### Basic Aggregations
```dax
Total Transactions = COUNTROWS(Transactions)

Total Revenue = SUM(Transactions[Amount])

Avg Amount = AVERAGE(Transactions[Amount])
```

### Filtered Measures (using CALCULATE)
```dax
Successful Payments = 
CALCULATE(
    COUNTROWS(Transactions),
    Transactions[Status] = "SUCCESS"
)

Failed Payments = 
CALCULATE(
    COUNTROWS(Transactions),
    Transactions[Status] = "FAILED"
)

Temporary Failures = 
CALCULATE(
    COUNTROWS(Transactions),
    Transactions[Failure_Type] = "Temporary"
)

Permanent Failures = 
CALCULATE(
    COUNTROWS(Transactions),
    Transactions[Failure_Type] = "Permanent"
)
```

### Percentage Measures
```dax
Failure Rate % = 
DIVIDE([Failed Payments], [Total Transactions]) * 100

Recovery Rate % = 
DIVIDE(
    CALCULATE(COUNTROWS(Transactions), Transactions[Recovery_Status] = "Recovered"),
    [Failed Payments]
) * 100

Retry Success Rate % = 
DIVIDE(
    CALCULATE(COUNTROWS(Retries), Retries[Retry_Status] = "SUCCESS"),
    COUNTROWS(Retries)
) * 100
```

### Revenue KPIs
```dax
Revenue Lost = 
CALCULATE(
    SUM(Transactions[Amount]),
    Transactions[Status] = "FAILED",
    Transactions[Recovery_Status] = "Not Recovered"
)

Revenue Recovered = 
CALCULATE(
    SUM(Transactions[Amount]),
    Transactions[Recovery_Status] = "Recovered"
)
```

---

## 5. Visuals to Build

### Page 1: Executive Summary
| Visual | Data | Purpose |
|--------|------|---------|
| Card | Total Transactions | Overview |
| Card | Failure Rate % | At-a-glance health |
| Card | Recovery Rate % | Retry effectiveness |
| Card | Revenue Lost | Business impact |
| Card | Revenue Recovered | Retry ROI |
| Donut Chart | Status distribution | Proportion view |

### Page 2: Failure Analysis
| Visual | Data | Purpose |
|--------|------|---------|
| Bar Chart | Failures by Bank Code | Top failure reasons |
| Pie Chart | Temporary vs Permanent | Failure type split |
| Bar Chart | Retry count distribution | Retry behavior |
| Table | Top failed transactions | Drill-down detail |

### Page 3: Recovery & Retry Analysis
| Visual | Data | Purpose |
|--------|------|---------|
| Line Chart | Recovery trend over time | Pattern detection |
| Scatter Plot | Retry Count vs Amount | High-value retry analysis |
| Bar Chart | Retry success by attempt # | Best retry window |

### Page 4: Trends
| Visual | Data | Purpose |
|--------|------|---------|
| Line Chart | Daily transactions | Volume trend |
| Area Chart | Daily failures | Failure trend |
| Heat Map | Failures by hour × day | Time pattern |

---

## 6. Adding Slicers (Filters)

Slicers make your dashboard interactive:
- **Date Range Slicer** — filter by time period
- **Status Slicer** — filter by payment status
- **Failure Type Slicer** — Temporary / Permanent
- **Bank Response Code Slicer** — drill into specific codes

To add: `Insert → Slicer → Select the column`

---

## 7. Design Best Practices

- Use a **consistent color theme**: Green = Success, Red = Failure, Orange = Temporary
- Keep each page focused on **one story**
- Use **tooltips** to add context to data points
- Add a **title** to every visual
- Use **conditional formatting** to highlight outliers in tables

---

## 8. Publishing

1. Click **File → Publish → Publish to Power BI**
2. Select your workspace
3. Access via `app.powerbi.com`

---

## ✅ Power BI Checklist

- [ ] Import `cleaned_transactions.csv` and `kpi_summary.csv`
- [ ] Verify column types in Power Query
- [ ] Create relationships between tables
- [ ] Create all DAX measures
- [ ] Build Executive Summary page (KPI cards)
- [ ] Build Failure Analysis page
- [ ] Build Recovery & Retry page
- [ ] Build Trends page
- [ ] Add Slicers to all pages
- [ ] Apply consistent color theme
- [ ] Publish to Power BI service
