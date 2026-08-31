# Payment Retry Analytics - Data Dictionary

This document details the actual dataset columns present in the cleaned analytical dataset (`data/processed/final_payment_dataset.csv`) produced by Member 1 and utilized for Member 2's Business Intelligence and Revenue Analytics.

---

## Dataset Overview

* **File Name**: `final_payment_dataset.csv`
* **Storage Location**: `data/processed/final_payment_dataset.csv` (and `notebook/data/processed/final_payment_dataset.csv`)
* **Total Record Count**: 500 records
* **Total Column Count**: 11 columns
* **Domain Context**: UPI & Digital Payment Transactions for Fintech Payment Friction & Revenue Recovery Analysis

---

## Column Descriptions

| Column Name | Data Type | Description | Example Value | Utility for Analysis |
| :--- | :--- | :--- | :--- | :--- |
| `transaction_id` | String / Text | Unique alphanumeric identifier assigned to each individual payment attempt. | `TXN100148` | Primary key used to track individual payment records, count transaction volumes, and link retry attempts. |
| `timestamp` | Datetime (`YYYY-MM-DD HH:MM:SS`) | Exact date and time when the payment transaction was initiated. | `2024-01-01 14:48:00` | Enables time-series analysis, peak-hour failure detection, off-peak latency tracking, and chronological sorting. |
| `transaction_date` | Date (`YYYY-MM-DD`) | Calendar date extracted from the transaction timestamp. | `2024-01-01` | Enables daily volume, revenue trend analysis, and day-over-day performance comparison. |
| `transaction_hour` | Integer (`0`–`23`) | Hour of the day (24-hour format) when the payment occurred. | `14` | Used to evaluate hourly failure concentrations, peak usage friction, and optimal automated retry timing. |
| `day_of_week` | String / Text | Day of the week corresponding to the transaction date. | `Monday` | Identifies day-of-week failure patterns, weekend transaction volume spikes, and day-specific friction. |
| `amount` | Float / Numeric | Transaction value monetary amount in Indian Rupees (INR, ₹). | `4571.70` | Fundamental metric for calculating Total Processed Revenue, Failed Revenue at Risk, Revenue Recovered, and Lost Revenue. |
| `merchant_category` | String / Text | Commercial category/industry sector of the recipient merchant. | `Online Services` | Identifies high-friction merchant sectors (e.g. Food & Dining vs Fuel) and categorizes revenue exposure by industry. |
| `payment_mode` | String / Text | Mechanism or channel used to process the payment (Online, QR, Contact, AutoPay). | `Online` | Critical for channel failure rate comparison, identifying high-timeout modes (Online/QR) vs high-hard error modes (AutoPay/Contact). |
| `location_type` | String / Text | Geographical classification of the customer/merchant location (Urban, Semi-Urban, Rural). | `Rural` | Analyzes regional infrastructure impact, rural network latency friction, and location-based failure rates. |
| `is_successful` | String / Binary ('Yes' / 'No') | Binary indicator of initial payment authorization outcome. | `Yes` | Raw binary outcome field; basis for computing initial payment success and failure counts. |
| `payment_status` | String / Categorical ('Successful' / 'Failed') | Standardized payment status field mapped from `is_successful`. | `Successful` | Standard categorical field used in visual dashboards, slicers, and aggregate KPI aggregations. |

---

## Dataset Summary Statistics

* **Total Transaction Count**: 500
* **Total Transaction Volume**: ₹1,261,834.27
* **Successful Transactions**: 250 (50.00%) | ₹637,831.48
* **Failed Transactions**: 250 (50.00%) | ₹624,002.79
* **Minimum Transaction Amount**: ₹17.62
* **Maximum Transaction Amount**: ₹4,973.82
* **Average Transaction Amount**: ₹2,523.67
