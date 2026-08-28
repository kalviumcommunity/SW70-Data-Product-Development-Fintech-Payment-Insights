# 🧹 Data Cleaning Concepts

> **Learning Goal**: Understand how to detect and fix data quality issues — a critical step before any analysis.

---

## Why Data Cleaning Matters

Raw data from payment systems is almost never clean. Issues include:
- Missing transaction records
- Duplicate retry entries
- Inconsistent date formats
- Wrong data types (e.g., Amount stored as string)
- Outliers and invalid values

**Rule of thumb**: Garbage in → Garbage out. Clean data = reliable insights.

---

## 1. Understanding the Data First

Before cleaning, always explore:

```python
import pandas as pd

df = pd.read_csv("data/raw/transactions.csv")

# Understand shape and types
print(df.shape)
print(df.dtypes)

# Spot issues immediately
df.info()
df.describe()
df.head(10)
```

---

## 2. Handling Missing Values

### Detecting Missing Values
```python
# Count nulls per column
df.isnull().sum()

# Percentage of missing values
(df.isnull().sum() / len(df)) * 100

# Visual overview
df.isnull().any()
```

### Strategies for Handling Missing Values

| Scenario | Strategy |
|----------|----------|
| Missing `Amount` | Fill with 0 or median |
| Missing `Bank_Response_Code` | Fill with "UNKNOWN" |
| Missing `Timestamp` | Drop the row (timestamp is critical) |
| Missing optional fields | Fill with "N/A" or forward fill |

```python
# Fill numeric column with median
df["Amount"].fillna(df["Amount"].median(), inplace=True)

# Fill categorical column with a placeholder
df["Bank_Response_Code"].fillna("UNKNOWN", inplace=True)

# Drop rows where Timestamp is missing (critical column)
df.dropna(subset=["Timestamp"], inplace=True)

# Forward fill (useful for time-series data)
df["Status"].fillna(method="ffill", inplace=True)
```

---

## 3. Removing Duplicates

Duplicate records can skew KPIs like retry counts and revenue calculations.

```python
# Check for exact duplicates
df.duplicated().sum()

# Check duplicates based on key columns
df.duplicated(subset=["Transaction_ID"]).sum()

# View duplicate rows
df[df.duplicated(subset=["Transaction_ID"], keep=False)]

# Remove duplicates — keep first occurrence
df.drop_duplicates(subset=["Transaction_ID"], keep="first", inplace=True)
```

---

## 4. Fixing Data Types

```python
# Convert to correct types
df["Transaction_ID"] = df["Transaction_ID"].astype(str)
df["Amount"] = df["Amount"].astype(float)
df["Retry_Count"] = df["Retry_Count"].astype(int)

# Convert Timestamp strings to datetime
df["Timestamp"] = pd.to_datetime(df["Timestamp"], format="%Y-%m-%d %H:%M:%S")

# Handle multiple possible formats
df["Timestamp"] = pd.to_datetime(df["Timestamp"], infer_datetime_format=True)
```

---

## 5. Standardizing Text/Categorical Data

Inconsistent categories will break groupby operations.

```python
# Standardize to uppercase
df["Status"] = df["Status"].str.upper().str.strip()

# Fix typos or inconsistent labels
df["Status"] = df["Status"].replace({
    "SUCESS": "SUCCESS",
    "FAIL": "FAILED",
    "success": "SUCCESS"
})

# Check unique values after standardization
df["Status"].unique()
df["Status"].value_counts()
```

---

## 6. Handling Outliers

```python
# Detect outliers using IQR method
Q1 = df["Amount"].quantile(0.25)
Q3 = df["Amount"].quantile(0.75)
IQR = Q3 - Q1

lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

# Flag outliers
df["Is_Outlier"] = (df["Amount"] < lower_bound) | (df["Amount"] > upper_bound)

# Remove outliers (optional — depends on business context)
df_clean = df[~df["Is_Outlier"]]
```

---

## 7. Validating Data After Cleaning

Always validate that your cleaning worked:

```python
# No missing values remain
assert df.isnull().sum().sum() == 0, "Still has missing values!"

# No duplicate Transaction_IDs
assert df.duplicated(subset=["Transaction_ID"]).sum() == 0, "Duplicate IDs found!"

# Amount should always be positive
assert (df["Amount"] > 0).all(), "Negative amounts found!"

# Print cleaning summary
print(f"Final shape: {df.shape}")
print(f"Date range: {df['Timestamp'].min()} → {df['Timestamp'].max()}")
print(f"Status distribution:\n{df['Status'].value_counts()}")
```

---

## 8. Saving the Cleaned Dataset

```python
df.to_csv("data/processed/cleaned_transactions.csv", index=False)
print("✅ Cleaned data saved!")
```

---

## ✅ Data Cleaning Checklist

- [ ] Check shape and column types (`df.info()`)
- [ ] Handle missing values (fill or drop)
- [ ] Remove duplicate records
- [ ] Fix data types (dates, numerics, strings)
- [ ] Standardize categorical text values
- [ ] Detect and handle outliers
- [ ] Validate the cleaned dataset
- [ ] Save cleaned data to `data/processed/`
