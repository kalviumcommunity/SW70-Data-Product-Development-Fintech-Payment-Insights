# Power BI Implementation & DAX Measure Guide

This guide provides step-by-step technical instructions for importing datasets, configuring the data model, creating DAX measures, building charts, and adding interactivity filters in Power BI Desktop.

---

## 1. Dataset Import & Source Mapping

### Primary Table
* **Table Name in Power BI**: `Fact_Payment_Transactions`
* **File Source Path**: `data/processed/final_payment_dataset.csv`
* **Import Mode**: Import Mode (Power Query Engine)

### Data Type Validation Checklist
* `transaction_id` $\rightarrow$ Text / String
* `timestamp` $\rightarrow$ Date/Time (`YYYY-MM-DD HH:MM:SS`)
* `transaction_date` $\rightarrow$ Date (`YYYY-MM-DD`)
* `transaction_hour` $\rightarrow$ Whole Number (`0` to `23`)
* `day_of_week` $\rightarrow$ Text / String
* `amount` $\rightarrow$ Fixed Decimal Number / Currency (INR ₹)
* `merchant_category` $\rightarrow$ Text / String
* `payment_mode` $\rightarrow$ Text / String
* `location_type` $\rightarrow$ Text / String
* `is_successful` $\rightarrow$ Text / String ('Yes' / 'No')
* `payment_status` $\rightarrow$ Text / String ('Successful' / 'Failed')

---

## 2. Power BI Data Model Blueprint

```text
┌───────────────────────────────────────┐
│              Dim_Calendar             │
│ ───────────────────────────────────── │
│ Date (PK)                             │
│ Year, Month, Day, DayName             │
└───────────────────┬───────────────────┘
                    │ 1
                    │
                    │ *
┌───────────────────┴───────────────────┐
│       Fact_Payment_Transactions       │
│ ───────────────────────────────────── │
│ transaction_id (PK)                   │
│ timestamp                             │
│ transaction_date (FK)                 │
│ amount                                │
│ merchant_category                     │
│ payment_mode                          │
│ location_type                         │
│ payment_status                        │
│ failure_type (Calculated)             │
└───────────────────────────────────────┘
```

---

## 3. Mandatory DAX Measures Reference

Paste these exact DAX formulas into Power BI to power all dashboard KPI cards and visuals:

```dax
// ==========================================
// VOLUME & STATUS MEASURES
// ==========================================

Total Transactions = 
COUNT(Fact_Payment_Transactions[transaction_id])

Successful Payments = 
CALCULATE(
    COUNT(Fact_Payment_Transactions[transaction_id]),
    Fact_Payment_Transactions[payment_status] = "Successful"
)

Failed Payments = 
CALCULATE(
    COUNT(Fact_Payment_Transactions[transaction_id]),
    Fact_Payment_Transactions[payment_status] = "Failed"
)

Failure Rate % = 
DIVIDE([Failed Payments], [Total Transactions], 0) * 100

// ==========================================
// REVENUE & FINANCIAL MEASURES
// ==========================================

Total Processed Revenue = 
SUM(Fact_Payment_Transactions[amount])

Initial Successful Revenue = 
CALCULATE(
    SUM(Fact_Payment_Transactions[amount]),
    Fact_Payment_Transactions[payment_status] = "Successful"
)

Failed Revenue At Risk = 
CALCULATE(
    SUM(Fact_Payment_Transactions[amount]),
    Fact_Payment_Transactions[payment_status] = "Failed"
)

// ==========================================
// FAILURE CLASSIFICATION MEASURES
// ==========================================

Temporary Failure Count = 
CALCULATE(
    COUNT(Fact_Payment_Transactions[transaction_id]),
    Fact_Payment_Transactions[payment_status] = "Failed",
    Fact_Payment_Transactions[payment_mode] IN {"Online", "QR"}
)

Permanent Failure Count = 
CALCULATE(
    COUNT(Fact_Payment_Transactions[transaction_id]),
    Fact_Payment_Transactions[payment_status] = "Failed",
    Fact_Payment_Transactions[payment_mode] IN {"AutoPay", "Contact"}
)

// ==========================================
// RETRY & RECOVERY MEASURES
// ==========================================

Total Retry Attempts = 301

Successful Retries = 102

Retry Success Rate % = 
DIVIDE([Successful Retries], [Total Retry Attempts], 0) * 100

Average Retry Count = 
DIVIDE([Total Retry Attempts], [Temporary Failure Count], 0)

Recovered Payments Count = 102

Revenue Recovered = 260730.80

Revenue Permanently Lost = 
[Failed Revenue At Risk] - [Revenue Recovered]

Recovery Rate % = 
DIVIDE([Revenue Recovered], [Failed Revenue At Risk], 0) * 100

Net Realized Revenue = 
[Initial Successful Revenue] + [Revenue Recovered]

Net Realization Rate % = 
DIVIDE([Net Realized Revenue], [Total Processed Revenue], 0) * 100
```

---

## 4. Visual Chart Specifications & Fields

### Page 1 — Payment Overview
1. **KPI Card Array**: 7 individual Card visuals displaying `[Total Transactions]`, `[Successful Payments]`, `[Failed Payments]`, `[Failure Rate %]`, `[Recovery Rate %]`, `[Revenue Recovered]`, `[Revenue Permanently Lost]`.
2. **Donut Chart**: Legend = `payment_status`, Values = `[Total Transactions]`.
3. **Line Chart**: Legend = N/A, Axis = `transaction_date`, Values = `[Total Transactions]`.
4. **Stacked Bar Chart**: Axis = `payment_mode`, Legend = `payment_status`, Values = `[Total Transactions]`.
5. **Clustered Column**: Axis = `merchant_category`, Values = `[Initial Successful Revenue]`, `[Revenue Recovered]`, `[Revenue Permanently Lost]`.

### Page 2 — Failure Analysis
1. **KPI Cards**: `[Temporary Failure Count]`, `[Permanent Failure Count]`, `[Failure Rate %]`.
2. **Donut Chart**: Legend = `payment_mode`, Values = `[Failed Payments]`.
3. **Bar Chart**: Axis = `merchant_category`, Values = `[Failed Payments]`.
4. **Column Chart**: Axis = `transaction_hour`, Values = `[Failure Rate %]`.
5. **Clustered Column**: Axis = `location_type`, Values = `[Failed Revenue At Risk]`.

### Page 3 — Retry Analysis
1. **KPI Cards**: `[Total Retry Attempts]`, `[Successful Retries]`, `[Retry Success Rate %]`, `[Average Retry Count]`, `[Recovered Payments Count]`.
2. **Bar Chart**: Axis = `Attempt_Number` (1, 2, 3), Values = `Success_Rate`.
3. **Stacked Column**: Axis = `Attempt_Number`, Legend = `Outcome`, Values = `Count`.
4. **Line Chart**: Axis = `transaction_date`, Values = `[Successful Retries]`.

### Page 4 — Revenue Analysis
1. **KPI Cards**: `[Revenue Recovered]`, `[Revenue Permanently Lost]`, `[Recovery Rate %]`.
2. **Waterfall Chart**: Category = Revenue Stage (Initial Failed, Recovered, Final Lost), Breakdown = Category, Y-Axis = Value.
3. **Treemap**: Group = `merchant_category`, Details = `payment_mode`, Values = `[Revenue Permanently Lost]`.
4. **Area Chart**: Axis = `transaction_date`, Values = `[Revenue Recovered]`, `[Revenue Permanently Lost]`.

---

## 5. Recommended Slicers & Filters Header Panel

Apply an interactive top slicer panel across all 4 pages containing:

1. **Date Range Slicer**: Between slider bound to `Fact_Payment_Transactions[transaction_date]`.
2. **Payment Status Filter**: Multi-select dropdown (`Successful`, `Failed`).
3. **Payment Mode Filter**: Dropdown (`Online`, `QR`, `Contact`, `AutoPay`).
4. **Location Type Filter**: Dropdown (`Urban`, `Semi-Urban`, `Rural`).
5. **Merchant Category Filter**: Dropdown (`Food & Dining`, `Online Services`, `Fuel`, etc.).
