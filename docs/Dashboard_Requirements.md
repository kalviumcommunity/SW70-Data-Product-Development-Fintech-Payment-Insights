# Power BI Dashboard Requirements Specification

This document details the architectural blueprint and visual layout for the **Payment Retry Analytics & Revenue Recovery Platform** Power BI dashboard.

---

## Executive Dashboard Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   POWER BI DASHBOARD ARCHITECTURE                      │
├───────────────────┬───────────────────┬───────────────────┬────────────┤
│ PAGE 1: OVERVIEW  │ PAGE 2: FAILURES  │ PAGE 3: RETRIES   │ PAGE 4: REV│
│ System Health     │ Root Cause Analysis│ Retry Performance │ Recovered  │
│ High-Level KPIs   │ Temp vs Permanent │ Attempt Breakdown │ vs Lost    │
└───────────────────┴───────────────────┴───────────────────┴────────────┘
```

---

## PAGE 1 — PAYMENT OVERVIEW

### Primary Business Question
> *What is the overall operational health and financial throughput of the payment system?*

### Target Audience
Chief Executive Officer (CEO), Chief Risk Officer (CRO), VP of Operations.

### Key Performance Indicators (KPI Cards)
* **Total Transactions**: `500`
* **Successful Payments**: `250`
* **Failed Payments**: `250`
* **Failure Rate**: `50.00%`
* **Recovery Rate**: `41.78%`
* **Revenue Recovered**: `₹260,730.80`
* **Revenue Lost**: `₹363,271.99`

### Visual Charts Configuration

| Visual Title | Chart Type | Data Fields Used | Purpose / Business Rationale |
| :--- | :--- | :--- | :--- |
| **Payment Success vs Failure Volume** | Donut / Pie Chart | Legend: `payment_status`<br>Values: `COUNT(transaction_id)` | Displays initial 50/50 transaction outcome split. |
| **Transaction Volume Trend** | Line Chart | Axis: `transaction_date`<br>Values: `COUNT(transaction_id)` | Monitors daily payment traffic fluctuations over time. |
| **Payment Status Distribution by Mode** | Stacked Bar Chart | Axis: `payment_mode`<br>Legend: `payment_status`<br>Values: `COUNT(transaction_id)` | Identifies high-volume channel friction (Online & Contact). |
| **Revenue Realization Breakdown** | Clustered Column | Axis: Category<br>Values: `Initial Success`, `Recovered`, `Lost` | Compares initial vs recovered vs lost revenue stream. |

---

## PAGE 2 — FAILURE ANALYSIS

### Primary Business Question
> *Why are payments failing, and which failures are temporary friction versus permanent loss?*

### Target Audience
Head of Product, Payment Gateway Integration Lead, Operations Analysts.

### Key Performance Indicators (KPI Cards)
* **Temporary Failures**: `155` (62.0% of failures)
* **Permanent Failures**: `95` (38.0% of failures)
* **Failure Rate**: `50.00%`

### Visual Charts Configuration

| Visual Title | Chart Type | Data Fields Used | Purpose / Business Rationale |
| :--- | :--- | :--- | :--- |
| **Temporary vs Permanent Failure Breakdown** | Donut Chart | Legend: `Failure_Type`<br>Values: `COUNT(transaction_id)` | Classifies recoverable friction vs hard unrecoverable declines. |
| **Failure Count by Response Trigger / Mode** | Bar Chart | Axis: `payment_mode`<br>Values: `Failed Transactions` | Highlights failure concentrations in Contact (67) & Online (66). |
| **Top Failure Reasons by Category** | Horizontal Bar Chart | Axis: `merchant_category`<br>Values: `Failed Transactions` | Ranks high-friction categories (Food & Dining: 60%). |
| **Hourly Failure Distribution** | Column Chart | Axis: `transaction_hour`<br>Values: `Failure Rate %` | Uncovers peak-hour server timeout spikes (14:00-18:00). |
| **Revenue Impact by Failure Type** | Clustered Column | Axis: `Failure_Type`<br>Values: `SUM(amount)` | Displays ₹396.4K temporary exposure vs ₹227.6K permanent loss. |

---

## PAGE 3 — RETRY ANALYSIS

### Primary Business Question
> *How effective are payment retries, and what is the optimal retry attempt strategy?*

### Target Audience
Engineering Lead, Automated Retry Product Owner, Integration Engineers.

### Key Performance Indicators (KPI Cards)
* **Total Retry Attempts**: `301`
* **Successful Retries**: `102`
* **Retry Success Rate**: `33.89%`
* **Average Retry Count**: `1.94`
* **Recovered Payments**: `102`

### Visual Charts Configuration

| Visual Title | Chart Type | Data Fields Used | Purpose / Business Rationale |
| :--- | :--- | :--- | :--- |
| **Retry Success Rate by Attempt Number** | Bar Chart | Axis: `Retry_Attempt` (1, 2, 3)<br>Values: `Success Rate %` | Illustrates decay curve (45.16% $\rightarrow$ 28.24% $\rightarrow$ 13.11%). |
| **Successful vs Failed Retries** | Stacked Column Chart | Axis: `Retry_Attempt`<br>Legend: `Outcome`<br>Values: `Count` | Compares successful recoveries vs failed attempts. |
| **Retry Count Distribution** | Column Chart | Axis: `Retry_Count`<br>Values: `Transaction Count` | Distribution of transactions retried 1x, 2x, or 3x. |
| **Recovery Rate by Retry Attempt** | Line Chart | Axis: `Retry_Attempt`<br>Values: `Cumulative Recovery %` | Demonstrates cumulative recovery reaching 65.81% by Attempt 3. |
| **Retry Performance Over Time** | Line Chart | Axis: `transaction_date`<br>Values: `Successful Retries` | Tracks daily retry recovery consistency over time. |

---

## PAGE 4 — REVENUE ANALYSIS

### Primary Business Question
> *How much revenue is recovered versus permanently lost, and where is exposure concentrated?*

### Target Audience
Chief Financial Officer (CFO), Treasury Lead, Finance & Analytics Teams.

### Key Performance Indicators (KPI Cards)
* **Revenue Recovered**: `₹260,730.80`
* **Revenue Lost**: `₹363,271.99`
* **Recovery Rate**: `41.78%`

### Visual Charts Configuration

| Visual Title | Chart Type | Data Fields Used | Purpose / Business Rationale |
| :--- | :--- | :--- | :--- |
| **Revenue Recovered vs Revenue Lost** | Waterfall Chart | Categories: Initial Failed $\rightarrow$ Recovered $\rightarrow$ Net Lost | Clear financial reconciliation of lost vs salvaged funds. |
| **Revenue Lost by Failure Type** | Pie Chart | Legend: `Failure_Type`<br>Values: `Lost Revenue` | Isolates permanent lost revenue (₹227.6K) vs unrecovered temp. |
| **Revenue Impact by Response Code / Mode** | Treemap | Group: `payment_mode`<br>Values: `Failed Revenue Amount` | Visualizes financial exposure by payment channel. |
| **Revenue Recovered by Retry Attempt** | Column Chart | Axis: `Retry_Attempt`<br>Values: `Recovered Revenue INR` | Shows Attempt 1 recovered ₹178.9K, Attempt 2 ₹61.4K, Attempt 3 ₹20.5K. |
| **Revenue Realization Trend Over Time** | Area Chart | Axis: `transaction_date`<br>Values: `Recovered Revenue`, `Lost Revenue` | Monitors daily net revenue recovery performance over time. |
