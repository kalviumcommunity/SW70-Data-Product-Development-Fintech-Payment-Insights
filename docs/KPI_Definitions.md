# Key Performance Indicator (KPI) Definitions

This document establishes the official definitions, mathematical formulas, dataset column mappings, and business rationale for all payment analytics, retry performance, and revenue recovery KPIs.

---

## Executive Summary of Core KPIs

| KPI Name | Actual Dataset Value | Mathematical Formula | Column(s) Used |
| :--- | :--- | :--- | :--- |
| **Total Transactions** | 500 | $\text{COUNT}(\text{transaction\_id})$ | `transaction_id` |
| **Successful Payments** | 250 | $\text{COUNTIF}(\text{payment\_status} = \text{'Successful'})$ | `payment_status` |
| **Failed Payments** | 250 | $\text{COUNTIF}(\text{payment\_status} = \text{'Failed'})$ | `payment_status` |
| **Failure Rate** | 50.00% | $(\text{Failed Payments} / \text{Total Transactions}) \times 100$ | `payment_status` |
| **Total Processed Revenue** | ₹1,261,834.27 | $\text{SUM}(\text{amount})$ | `amount` |
| **Initial Successful Revenue** | ₹637,831.48 | $\text{SUMIF}(\text{payment\_status} = \text{'Successful'}, \text{amount})$ | `amount`, `payment_status` |
| **Failed Revenue (At Risk)** | ₹624,002.79 | $\text{SUMIF}(\text{payment\_status} = \text{'Failed'}, \text{amount})$ | `amount`, `payment_status` |
| **Temporary Failures** | 155 (62.0% of failures) | $\text{COUNTIF}(\text{Failure\_Type} = \text{'Temporary'})$ | `payment_mode`, `location_type`, `transaction_hour` |
| **Permanent Failures** | 95 (38.0% of failures) | $\text{COUNTIF}(\text{Failure\_Type} = \text{'Permanent'})$ | `payment_mode`, `location_type` |
| **Total Retry Attempts** | 301 attempts | $\sum \text{Retry Attempts on Temporary Failures}$ | Calculated retry sequence |
| **Successful Retries** | 102 recovered | $\text{COUNTIF}(\text{Retry\_Outcome} = \text{'Success'})$ | Calculated retry sequence |
| **Retry Success Rate** | 33.89% per attempt | $(\text{Successful Retries} / \text{Total Retry Attempts}) \times 100$ | Calculated retry sequence |
| **Average Retry Count** | 1.94 retries | $\text{Total Retry Attempts} / \text{Temporary Failed Transactions}$ | Calculated retry sequence |
| **Recovered Payments** | 102 transactions | $\text{Count of initial failed transactions resolved via retry}$ | `transaction_id`, `payment_status` |
| **Recovery Rate** | 41.78% of failed revenue | $(\text{Revenue Recovered} / \text{Failed Revenue}) \times 100$ | `amount`, `payment_status` |
| **Revenue Recovered** | ₹260,730.80 | $\text{SUM}(\text{Amount of Recovered Transactions})$ | `amount`, `payment_status` |
| **Revenue Lost** | ₹363,271.99 | $\text{Failed Revenue} - \text{Revenue Recovered}$ | `amount`, `payment_status` |

---

## Detailed KPI Definitions

### 1. Total Transactions
* **Definition**: Total volume of payment requests processed by the platform.
* **Formula**: $\text{COUNT}(\text{transaction\_id})$
* **Dataset Columns**: `transaction_id`
* **Business Importance**: Establishes the baseline operational scale for assessing throughput and success rates.

### 2. Successful Payments
* **Definition**: Number of transactions authorized and settled on the initial attempt.
* **Formula**: $\text{COUNTIF}(\text{payment\_status} = \text{'Successful'})$
* **Dataset Columns**: `payment_status`, `is_successful`
* **Business Importance**: Represents seamless user payments requiring zero retry intervention.

### 3. Failed Payments
* **Definition**: Number of payment attempts rejected or timed out on initial authorization.
* **Formula**: $\text{COUNTIF}(\text{payment\_status} = \text{'Failed'})$
* **Dataset Columns**: `payment_status`, `is_successful`
* **Business Importance**: Highlights initial payment friction; total volume at risk of customer drop-off.

### 4. Failure Rate
* **Definition**: Percentage of total processed transactions that failed on initial attempt.
* **Formula**: $\left(\frac{\text{Failed Payments}}{\text{Total Transactions}}\right) \times 100$
* **Dataset Columns**: `payment_status`
* **Business Importance**: Primary health indicator of platform integration stability and gateway reliability.

### 5. Temporary Failures
* **Definition**: Payment failures caused by transient system issues (e.g. network latency, bank gateway peak congestion, QR scanning timeouts) that are recoverable through retries.
* **Formula**: $\text{COUNTIF}(\text{Failure\_Type} = \text{'Temporary'})$ (155 transactions in dataset, ₹396,407.36 value).
* **Dataset Columns**: `payment_mode`, `location_type`, `transaction_hour`, `amount`
* **Business Importance**: Identifies recoverable revenue opportunities rather than lost customers.

### 6. Permanent Failures
* **Definition**: Payment failures caused by hard unrecoverable errors (e.g. invalid account details, closed accounts, hard compliance blocks, insufficient funds without retry capability).
* **Formula**: $\text{COUNTIF}(\text{Failure\_Type} = \text{'Permanent'})$ (95 transactions in dataset, ₹227,595.43 value).
* **Dataset Columns**: `payment_mode`, `location_type`, `amount`
* **Business Importance**: Prevents wasting API retries and gateway charges on unrecoverable transactions.

### 7. Total Retry Attempts
* **Definition**: Sum of all secondary and tertiary payment re-execution attempts submitted to payment gateways.
* **Formula**: $\sum \text{Retry Attempts for Temporary Failures}$ (301 attempts across 155 temporary failed transactions).
* **Dataset Columns**: `transaction_id`, retry simulation engine
* **Business Importance**: Measures operational retry load and gateway query volume.

### 8. Successful Retries
* **Definition**: Number of initial failed transactions that successfully settled upon subsequent retry.
* **Formula**: $\text{COUNT}(\text{Retried Transactions resulting in 'Successful'})$ (102 transactions).
* **Dataset Columns**: `transaction_id`, `payment_status`
* **Business Importance**: Directly quantifies the operational effectiveness of automated retry engines.

### 9. Retry Success Rate
* **Definition**: Proportion of individual retry attempts that resulted in successful payment authorization.
* **Formula**: $\left(\frac{\text{Successful Retries}}{\text{Total Retry Attempts}}\right) \times 100$ (33.89% overall; Attempt 1: 45.16%, Attempt 2: 28.24%, Attempt 3: 13.11%).
* **Dataset Columns**: Retry attempt logs
* **Business Importance**: Guides decay cutoff policies for retries to avoid cost overhead.

### 10. Average Retry Count
* **Definition**: Average number of retry attempts executed per temporary failed transaction.
* **Formula**: $\frac{\text{Total Retry Attempts}}{\text{Temporary Failed Transactions}}$ (1.94 retries).
* **Dataset Columns**: `transaction_id`, retry logs
* **Business Importance**: Ensures retries do not breach user latency or bank threshold guidelines.

### 11. Recovered Payments
* **Definition**: Total count of initial failed payment transactions salvaged through smart retry algorithms.
* **Formula**: 102 transactions (out of 250 initial failures).
* **Dataset Columns**: `transaction_id`, `payment_status`
* **Business Importance**: Demonstrates tangible customer retention and friction elimination.

### 12. Recovery Rate
* **Definition**: Percentage of initial failed revenue successfully converted into settled revenue.
* **Formula**: $\left(\frac{\text{Revenue Recovered}}{\text{Failed Revenue}}\right) \times 100$ (41.78% of failed revenue; 65.81% of temporary failure revenue).
* **Dataset Columns**: `amount`, `payment_status`
* **Business Importance**: Key financial recovery metric reported to executive management.

### 13. Revenue Recovered
* **Definition**: Total monetary value (in INR) of payments salvaged via retries after initial failure.
* **Formula**: $\text{SUM}(\text{Amount of Recovered Transactions})$ (₹260,730.80).
* **Dataset Columns**: `amount`, `payment_status`
* **Business Importance**: Direct top-line revenue saved from permanent loss.

### 14. Revenue Lost
* **Definition**: Monetary value of failed transactions that remained unrecovered after retry exhaustion or permanent failure classification.
* **Formula**: $\text{Failed Revenue} - \text{Revenue Recovered}$ (₹363,271.99).
* **Dataset Columns**: `amount`, `payment_status`
* **Business Importance**: Quantifies the financial cost of permanent payment friction and hard declines.
