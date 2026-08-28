# ⚙️ Feature Engineering

> **Learning Goal**: Learn how to create meaningful new columns from existing data to power your analysis and KPIs.

---

## What is Feature Engineering?

Feature engineering is the process of **creating new variables** (columns) from raw data that better capture patterns and business logic.

In this project, raw data doesn't tell us directly whether a failure was "temporary" or if a retry eventually "recovered" revenue. Feature engineering creates those labels.

---

## Features Built in This Project

| Feature | Description | Source Columns |
|---------|-------------|----------------|
| `Retry_Count` | How many times a transaction was retried | `Transaction_ID` in retries table |
| `Failure_Type` | Temporary or Permanent | `Bank_Response_Code` |
| `Recovery_Status` | Whether a failed txn was eventually recovered | `Status`, `Retry_Count` |
| `Final_Payment_Status` | Final outcome after all retries | `Status`, retries data |
| `Time_Between_Retries` | Duration between original attempt and retry | `Timestamp`, `Retry_Timestamp` |
| `Retry_Success_Rate` | % of retries that succeeded | `Status` after retries |

---

## 1. Retry Count

```python
import pandas as pd

# Count the number of retries per Transaction_ID
retry_counts = retries_df.groupby("Transaction_ID").size().reset_index(name="Retry_Count")

# Merge into main dataframe
df = pd.merge(df, retry_counts, on="Transaction_ID", how="left")

# Fill 0 for transactions with no retries
df["Retry_Count"] = df["Retry_Count"].fillna(0).astype(int)
```

---

## 2. Failure Type Classification

Bank response codes indicate whether a failure is recoverable.

```python
# Define which codes mean temporary (can be retried and recovered)
TEMPORARY_CODES = ["R01", "R02", "R03", "TIMEOUT", "NETWORK_ERROR", "BANK_BUSY"]
PERMANENT_CODES = ["R04", "R05", "FRAUD", "BLACKLISTED", "INSUFFICIENT_FUNDS"]

def classify_failure(code):
    """Classify a bank response code as Temporary or Permanent."""
    if pd.isna(code):
        return "Unknown"
    if code in TEMPORARY_CODES:
        return "Temporary"
    if code in PERMANENT_CODES:
        return "Permanent"
    return "Unknown"

df["Failure_Type"] = df["Bank_Response_Code"].apply(classify_failure)
```

---

## 3. Recovery Status

Was a failed transaction eventually recovered (i.e., a retry succeeded)?

```python
import numpy as np

# A transaction is "Recovered" if:
# - Original status was Failed
# - At least one retry eventually succeeded
df["Recovery_Status"] = np.where(
    (df["Status"] == "FAILED") & (df["Retry_Success_Flag"] == 1),
    "Recovered",
    np.where(df["Status"] == "FAILED", "Not Recovered", "N/A")
)
```

---

## 4. Final Payment Status

```python
def determine_final_status(row):
    """Determine the final outcome of a transaction."""
    if row["Status"] == "SUCCESS":
        return "Success"
    elif row["Recovery_Status"] == "Recovered":
        return "Recovered after Retry"
    elif row["Failure_Type"] == "Temporary":
        return "Temporary Failure"
    else:
        return "Permanent Failure"

df["Final_Payment_Status"] = df.apply(determine_final_status, axis=1)
```

---

## 5. Time Between Retries

```python
# Convert to datetime if not already
df["Timestamp"] = pd.to_datetime(df["Timestamp"])
df["Retry_Timestamp"] = pd.to_datetime(df["Retry_Timestamp"])

# Calculate time difference
df["Time_Between_Retries"] = df["Retry_Timestamp"] - df["Timestamp"]

# Convert to minutes for readability
df["Retry_Delay_Minutes"] = df["Time_Between_Retries"].dt.total_seconds() / 60
```

---

## 6. Retry Success Rate (Aggregated)

```python
# Overall retry success rate
total_retries = len(retries_df)
successful_retries = len(retries_df[retries_df["Retry_Status"] == "SUCCESS"])
retry_success_rate = (successful_retries / total_retries) * 100

print(f"Retry Success Rate: {retry_success_rate:.2f}%")

# Per bank response code
retry_rate_by_code = retries_df.groupby("Bank_Response_Code").apply(
    lambda x: (x["Retry_Status"] == "SUCCESS").sum() / len(x) * 100
).reset_index(name="Retry_Success_Rate_%")
```

---

## 7. Is High Value Transaction

```python
# Flag transactions above a threshold
HIGH_VALUE_THRESHOLD = 5000  # ₹5,000

df["Is_High_Value"] = np.where(df["Amount"] >= HIGH_VALUE_THRESHOLD, True, False)
```

---

## Best Practices for Feature Engineering

1. **Understand business logic first** — ask what each feature means in context
2. **Avoid data leakage** — don't use future data to create features for the past
3. **Keep features interpretable** — business stakeholders should understand them
4. **Document each feature** — note what it means and how it's derived
5. **Validate values** — check value distributions after creating each feature

---

## ✅ Feature Engineering Checklist

- [ ] `Retry_Count` — number of retries per transaction
- [ ] `Failure_Type` — Temporary / Permanent based on bank code
- [ ] `Recovery_Status` — was the failure eventually recovered?
- [ ] `Final_Payment_Status` — final outcome after all retries
- [ ] `Time_Between_Retries` — delay between original attempt and retry
- [ ] `Retry_Success_Rate` — % of retries that succeeded
- [ ] `Is_High_Value` — transaction above threshold flag
