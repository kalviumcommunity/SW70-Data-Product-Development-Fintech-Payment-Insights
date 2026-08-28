# 📊 EDA & Visualization

> **Learning Goal**: Understand how to explore data patterns, distributions, and trends using Python visualization libraries.

---

## What is EDA?

**Exploratory Data Analysis (EDA)** is the process of visually and statistically summarizing data to:
- Understand the structure and patterns
- Spot anomalies and outliers
- Generate hypotheses for deeper analysis
- Communicate findings to stakeholders

---

## 1. Setup

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go

# Load cleaned data
df = pd.read_csv("data/processed/cleaned_transactions.csv")

# Set plot style
plt.style.use("seaborn-v0_8-darkgrid")
plt.rcParams["figure.figsize"] = (12, 6)
plt.rcParams["font.size"] = 12
```

---

## 2. Univariate Analysis (Single Column)

### Distribution of Payment Status
```python
# Count plot (bar)
status_counts = df["Status"].value_counts()

plt.figure(figsize=(8, 5))
plt.bar(status_counts.index, status_counts.values, color=["#2ecc71", "#e74c3c", "#f39c12"])
plt.title("Distribution of Payment Status")
plt.xlabel("Status")
plt.ylabel("Count")
plt.tight_layout()
plt.show()
```

### Distribution of Transaction Amount
```python
plt.figure(figsize=(10, 5))
plt.hist(df["Amount"], bins=50, color="#3498db", edgecolor="white")
plt.title("Transaction Amount Distribution")
plt.xlabel("Amount (₹)")
plt.ylabel("Frequency")
plt.tight_layout()
plt.show()
```

---

## 3. Bivariate Analysis (Two Columns)

### Average Amount by Status
```python
avg_amount = df.groupby("Status")["Amount"].mean().reset_index()

fig = px.bar(avg_amount, x="Status", y="Amount",
             title="Average Transaction Amount by Status",
             color="Status",
             color_discrete_map={"SUCCESS": "#2ecc71", "FAILED": "#e74c3c"})
fig.show()
```

### Retry Count vs Recovery
```python
fig = px.box(df, x="Recovery_Status", y="Retry_Count",
             title="Retry Count Distribution by Recovery Status",
             color="Recovery_Status")
fig.show()
```

---

## 4. Time Series Analysis

### Transaction Volume Over Time
```python
df["Date"] = pd.to_datetime(df["Timestamp"]).dt.date

daily_transactions = df.groupby("Date").size().reset_index(name="Count")

fig = px.line(daily_transactions, x="Date", y="Count",
              title="Daily Transaction Volume",
              markers=True)
fig.update_traces(line_color="#3498db")
fig.show()
```

### Failure Trend Over Time
```python
daily_failures = df[df["Status"] == "FAILED"].groupby("Date").size().reset_index(name="Failures")

fig = px.area(daily_failures, x="Date", y="Failures",
              title="Daily Payment Failures Trend",
              color_discrete_sequence=["#e74c3c"])
fig.show()
```

---

## 5. Categorical Analysis

### Bank Response Code Frequency
```python
top_codes = df["Bank_Response_Code"].value_counts().head(10)

fig = px.bar(x=top_codes.index, y=top_codes.values,
             title="Top 10 Bank Response Codes",
             labels={"x": "Bank Response Code", "y": "Count"},
             color=top_codes.values,
             color_continuous_scale="Reds")
fig.show()
```

### Failure Type Distribution (Pie Chart)
```python
failure_dist = df[df["Status"] == "FAILED"]["Failure_Type"].value_counts()

fig = px.pie(names=failure_dist.index, values=failure_dist.values,
             title="Failure Type Distribution",
             color_discrete_map={"Temporary": "#f39c12", "Permanent": "#e74c3c"})
fig.show()
```

---

## 6. Correlation Analysis

```python
# Select numeric columns
numeric_cols = df[["Amount", "Retry_Count", "Retry_Delay_Minutes"]]

# Correlation matrix
corr_matrix = numeric_cols.corr()

import matplotlib.pyplot as plt
import seaborn as sns  # optional but cleaner heatmaps

plt.figure(figsize=(8, 6))
sns.heatmap(corr_matrix, annot=True, fmt=".2f", cmap="coolwarm", center=0)
plt.title("Correlation Heatmap")
plt.tight_layout()
plt.show()
```

---

## 7. Key EDA Questions to Answer

| Question | Chart Type |
|----------|------------|
| What % of transactions failed? | Pie / Donut chart |
| What are the most common bank error codes? | Bar chart |
| How does retry count vary by failure type? | Box plot |
| Is there a time-of-day pattern in failures? | Line / Heatmap |
| What is the recovery rate? | KPI card / Bar |
| Which transaction amount ranges fail most? | Histogram |

---

## 8. Saving Charts

```python
# Save matplotlib figure
plt.savefig("images/failure_distribution.png", dpi=150, bbox_inches="tight")

# Save plotly figure as HTML (interactive)
fig.write_html("images/daily_transactions.html")

# Save plotly figure as PNG
fig.write_image("images/daily_transactions.png")
```

---

## ✅ EDA Checklist

- [ ] Check data shape and types
- [ ] Plot distribution of all key columns
- [ ] Analyze payment status distribution
- [ ] Visualize transaction amount distribution
- [ ] Plot time series of transaction volume
- [ ] Analyze bank response code frequencies
- [ ] Explore failure type breakdown
- [ ] Check retry count patterns
- [ ] Compute and plot correlation matrix
- [ ] Save all key charts to `images/`
