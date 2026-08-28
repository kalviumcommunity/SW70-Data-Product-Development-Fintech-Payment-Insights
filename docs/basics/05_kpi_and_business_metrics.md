# 📈 KPIs & Business Metrics

> **Learning Goal**: Understand what KPIs the project tracks, what they mean, and how to calculate them in Python.

---

## What is a KPI?

A **Key Performance Indicator (KPI)** is a measurable value that shows how effectively a business is achieving its goals.

In this project, KPIs help the finance team answer:
- "How much revenue did we lose?"
- "How much did we recover?"
- "Are our retry strategies working?"

---

## Project KPIs

| KPI | Business Question |
|-----|-------------------|
| Total Transactions | How many payments were processed? |
| Successful Payments | How many succeeded on first try? |
| Failed Payments | How many failed overall? |
| Temporary Failures | How many failures could be retried? |
| Permanent Failures | How many failures are unrecoverable? |
| Recovery Rate | What % of failures were recovered? |
| Retry Success Rate | What % of retries succeeded? |
| Revenue Lost | Total amount lost to permanent failures |
| Revenue Recovered | Total amount recovered via retries |
| Average Retry Count | On average, how many retries per failed txn? |

---

## 1. Total Transactions

```python
total_transactions = len(df)
print(f"Total Transactions: {total_transactions:,}")
```

---

## 2. Successful & Failed Payments

```python
successful_payments = df[df["Status"] == "SUCCESS"].shape[0]
failed_payments = df[df["Status"] == "FAILED"].shape[0]

success_rate = (successful_payments / total_transactions) * 100
failure_rate = (failed_payments / total_transactions) * 100

print(f"Successful Payments: {successful_payments:,} ({success_rate:.2f}%)")
print(f"Failed Payments: {failed_payments:,} ({failure_rate:.2f}%)")
```

---

## 3. Temporary vs Permanent Failures

```python
failed_df = df[df["Status"] == "FAILED"]

temporary_failures = failed_df[failed_df["Failure_Type"] == "Temporary"].shape[0]
permanent_failures = failed_df[failed_df["Failure_Type"] == "Permanent"].shape[0]

print(f"Temporary Failures: {temporary_failures:,}")
print(f"Permanent Failures: {permanent_failures:,}")
```

---

## 4. Recovery Rate

> "Of all the failed transactions, how many were eventually recovered?"

```python
recovered = df[df["Recovery_Status"] == "Recovered"].shape[0]
recovery_rate = (recovered / failed_payments) * 100

print(f"Recovery Rate: {recovery_rate:.2f}%")
```

---

## 5. Retry Success Rate

> "Of all the retry attempts made, how many eventually succeeded?"

```python
total_retries = len(retries_df)
successful_retries = retries_df[retries_df["Retry_Status"] == "SUCCESS"].shape[0]

retry_success_rate = (successful_retries / total_retries) * 100
print(f"Retry Success Rate: {retry_success_rate:.2f}%")
```

---

## 6. Revenue Lost

> "Total transaction value permanently lost (failed with no recovery)."

```python
revenue_lost = df[
    (df["Status"] == "FAILED") &
    (df["Recovery_Status"] == "Not Recovered")
]["Amount"].sum()

print(f"Revenue Lost: ₹{revenue_lost:,.2f}")
```

---

## 7. Revenue Recovered

> "Total transaction value recovered after retries."

```python
revenue_recovered = df[df["Recovery_Status"] == "Recovered"]["Amount"].sum()

print(f"Revenue Recovered: ₹{revenue_recovered:,.2f}")
```

---

## 8. Average Retry Count

```python
avg_retry_count = df[df["Retry_Count"] > 0]["Retry_Count"].mean()

print(f"Average Retry Count (for retried txns): {avg_retry_count:.2f}")
```

---

## 9. KPI Summary Table

Create a clean summary dataframe for Power BI export:

```python
kpis = {
    "KPI": [
        "Total Transactions",
        "Successful Payments",
        "Failed Payments",
        "Temporary Failures",
        "Permanent Failures",
        "Recovery Rate (%)",
        "Retry Success Rate (%)",
        "Revenue Lost (₹)",
        "Revenue Recovered (₹)",
        "Average Retry Count"
    ],
    "Value": [
        total_transactions,
        successful_payments,
        failed_payments,
        temporary_failures,
        permanent_failures,
        round(recovery_rate, 2),
        round(retry_success_rate, 2),
        round(revenue_lost, 2),
        round(revenue_recovered, 2),
        round(avg_retry_count, 2)
    ]
}

kpi_df = pd.DataFrame(kpis)
print(kpi_df.to_string(index=False))

# Export for Power BI
kpi_df.to_csv("data/processed/kpi_summary.csv", index=False)
```

---

## Understanding the Business Impact

### Why distinguish Temporary vs Permanent?
- **Temporary failures** → Retrying is worth it; revenue can be recovered
- **Permanent failures** → Retrying wastes infrastructure and frustrates users

### Why track Recovery Rate?
A high recovery rate means your retry strategy is working.
A low recovery rate means either:
- Your retry logic is flawed
- You're retrying permanent failures (wasted effort)
- Retry timing is wrong

### Why track Revenue Lost separately?
Finance teams need to report actual losses vs. expected losses.
Tracking revenue recovered shows the ROI of the retry system.

---

## ✅ KPI Checklist

- [ ] Total Transactions calculated
- [ ] Success and Failure counts with percentages
- [ ] Temporary vs Permanent failure split
- [ ] Recovery Rate computed
- [ ] Retry Success Rate computed
- [ ] Revenue Lost computed
- [ ] Revenue Recovered computed
- [ ] Average Retry Count computed
- [ ] KPI summary table exported to CSV
