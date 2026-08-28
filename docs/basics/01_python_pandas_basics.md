# 🐍 Python & Pandas Basics

> **Learning Goal**: Understand the core tools used for data loading, exploration, and manipulation in this project.

---

## 1. Why Python for Data Analytics?

Python is the go-to language for data analytics because:
- Huge ecosystem of libraries (Pandas, NumPy, Matplotlib, etc.)
- Readable and beginner-friendly syntax
- Jupyter Notebooks allow interactive, step-by-step execution

---

## 2. Jupyter Notebook Essentials

```python
# Run a cell: Shift + Enter
# Add a cell below: B
# Add a cell above: A
# Delete a cell: D + D
# Change cell to Markdown: M
# Change cell to Code: Y
```

### Magic Commands
```python
%matplotlib inline    # Show plots inside notebook
%time some_function() # Time a function call
%%time                # Time entire cell
```

---

## 3. Python Fundamentals (Quick Recap)

### Data Types
```python
# Primitive types
name = "Vedant"      # str
age = 21             # int
score = 98.5         # float
is_active = True     # bool

# Collections
my_list = [1, 2, 3]
my_dict = {"key": "value"}
my_tuple = (10, 20)
my_set = {1, 2, 3}
```

### Functions
```python
def classify_failure(code):
    """Classify bank response code as Temporary or Permanent."""
    temporary_codes = ["R01", "R02", "R03"]
    if code in temporary_codes:
        return "Temporary"
    return "Permanent"
```

### List Comprehensions
```python
# Get all failed transaction IDs
failed_ids = [txn["id"] for txn in transactions if txn["status"] == "Failed"]
```

---

## 4. NumPy Basics

NumPy provides fast numerical operations on arrays.

```python
import numpy as np

arr = np.array([10, 20, 30, 40, 50])

print(arr.mean())   # → 30.0
print(arr.sum())    # → 150
print(arr.max())    # → 50
print(arr.min())    # → 10
print(arr.std())    # Standard deviation
```

### Why use NumPy over Python lists?
- **Speed**: Vectorized operations (no need for loops)
- **Memory efficient**: Stores data in compact typed arrays

---

## 5. Pandas — The Core Data Tool

### Loading Data
```python
import pandas as pd

# Read CSV
df = pd.read_csv("data/raw/transactions.csv")

# Read Excel
df = pd.read_excel("data/raw/transactions.xlsx")
```

### First Look at Data
```python
df.shape          # (rows, columns)
df.head()         # First 5 rows
df.tail()         # Last 5 rows
df.info()         # Column names, types, null counts
df.describe()     # Statistical summary (mean, std, min, max)
df.columns        # Column names
df.dtypes         # Data types per column
```

### Selecting Data
```python
# Select a single column → returns Series
df["Transaction_ID"]

# Select multiple columns → returns DataFrame
df[["Transaction_ID", "Amount", "Status"]]

# Filter rows by condition
df[df["Status"] == "Failed"]

# Multiple conditions
df[(df["Status"] == "Failed") & (df["Amount"] > 1000)]

# Using query (cleaner syntax)
df.query("Status == 'Failed' and Amount > 1000")
```

### Sorting & Ranking
```python
df.sort_values("Amount", ascending=False)
df.sort_values(["Status", "Amount"])
df["Amount"].rank(method="dense")
```

### Grouping & Aggregation
```python
# Count failures by bank code
df.groupby("Bank_Response_Code")["Transaction_ID"].count()

# Average amount per status
df.groupby("Status")["Amount"].mean()

# Multiple aggregations
df.groupby("Status").agg({
    "Amount": ["sum", "mean", "count"],
    "Retry_Count": "max"
})
```

### Adding New Columns
```python
# Simple derived column
df["Amount_INR"] = df["Amount"] * 83.5

# Using apply() with a function
df["Failure_Type"] = df["Bank_Response_Code"].apply(classify_failure)

# Using np.where() — efficient conditional column
df["Is_High_Value"] = np.where(df["Amount"] > 5000, "High", "Low")
```

### Merging DataFrames
```python
# Inner join (only matching Transaction_IDs)
merged_df = pd.merge(transactions_df, retries_df, on="Transaction_ID", how="inner")

# Left join (keep all from left, match from right)
merged_df = pd.merge(transactions_df, bank_codes_df, on="Transaction_ID", how="left")
```

---

## 6. Working with Dates & Times

```python
# Parse date column
df["Timestamp"] = pd.to_datetime(df["Timestamp"])

# Extract parts
df["Date"] = df["Timestamp"].dt.date
df["Hour"] = df["Timestamp"].dt.hour
df["DayOfWeek"] = df["Timestamp"].dt.day_name()
df["Month"] = df["Timestamp"].dt.month

# Time difference
df["Time_Between_Retries"] = df["Retry_Timestamp"] - df["Original_Timestamp"]
df["Retry_Delay_Minutes"] = df["Time_Between_Retries"].dt.total_seconds() / 60
```

---

## 7. Saving Processed Data

```python
# Export to CSV (no index column)
df.to_csv("data/processed/cleaned_transactions.csv", index=False)

# Export to Excel
df.to_excel("data/processed/cleaned_transactions.xlsx", index=False)
```

---

## ✅ Quick Reference Cheatsheet

| Task | Code |
|------|------|
| Load CSV | `pd.read_csv("file.csv")` |
| Shape | `df.shape` |
| Info | `df.info()` |
| Filter rows | `df[df["col"] == "val"]` |
| Group & count | `df.groupby("col").size()` |
| Merge | `pd.merge(df1, df2, on="key")` |
| Add column | `df["new"] = df["a"] + df["b"]` |
| Save CSV | `df.to_csv("out.csv", index=False)` |
