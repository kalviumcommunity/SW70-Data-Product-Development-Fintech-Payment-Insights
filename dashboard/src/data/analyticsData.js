export const analyticsData = {
  overall: {
    total_transactions: 500,
    successful_transactions: 250,
    failed_transactions: 250,
    failure_rate_pct: 50.00,
    total_amount_inr: 1261834.27,
    successful_amount_inr: 637831.48,
    failed_amount_inr: 624002.79,
    failed_amount_pct: 49.45,
    revenue_recovered_inr: 260730.80,
    permanently_lost_revenue_inr: 363271.99,
    final_net_realized_revenue_inr: 898562.28,
    revenue_recovery_rate_pct: 41.78,
    net_realization_rate_pct: 71.21,
    permanently_lost_rate_pct: 28.79
  },
  by_payment_mode: [
    { payment_mode: "AutoPay", total: 118, failed: 53, success: 65, failure_rate: 44.92, total_amt: 310060.66, failed_amt: 132128.83, revenue_recovered: 48475.41, permanently_lost: 83653.42, recovery_rate: 36.69 },
    { payment_mode: "Contact", total: 120, failed: 67, success: 53, failure_rate: 55.83, total_amt: 287313.80, failed_amt: 163971.39, revenue_recovered: 57390.00, permanently_lost: 106581.39, recovery_rate: 35.00 },
    { payment_mode: "Online", total: 134, failed: 66, success: 68, failure_rate: 49.25, total_amt: 358594.55, failed_amt: 181718.04, revenue_recovered: 81773.12, permanently_lost: 99944.92, recovery_rate: 45.00 },
    { payment_mode: "QR", total: 128, failed: 64, success: 64, failure_rate: 50.00, total_amt: 305865.26, failed_amt: 146184.53, revenue_recovered: 73092.27, permanently_lost: 73092.26, recovery_rate: 50.00 }
  ],
  by_location_type: [
    { location_type: "Rural", total: 173, failed: 94, success: 79, failure_rate: 54.34, total_amt: 455349.11, failed_amt: 240183.82, risk_level: "High Friction" },
    { location_type: "Semi-Urban", total: 153, failed: 70, success: 83, failure_rate: 45.75, total_amt: 383514.39, failed_amt: 176126.43, risk_level: "Medium Friction" },
    { location_type: "Urban", total: 174, failed: 86, success: 88, failure_rate: 49.43, total_amt: 422970.77, failed_amt: 207692.54, risk_level: "High Congestion" }
  ],
  by_merchant_category: [
    { merchant_category: "Food & Dining", total: 50, failed: 30, failure_rate: 60.00, total_amt: 153936.73, failed_amt: 86030.51, risk: "Critical" },
    { merchant_category: "Online Services", total: 60, failed: 32, failure_rate: 53.33, total_amt: 145041.70, failed_amt: 73634.77, risk: "Critical" },
    { merchant_category: "Entertainment", total: 46, failed: 26, failure_rate: 56.52, total_amt: 113308.65, failed_amt: 69731.94, risk: "High" },
    { merchant_category: "Bills & Utilities", total: 44, failed: 20, failure_rate: 45.45, total_amt: 113336.14, failed_amt: 63458.35, risk: "Medium" },
    { merchant_category: "Shopping", total: 47, failed: 22, failure_rate: 46.81, total_amt: 124489.45, failed_amt: 62208.23, risk: "Medium" },
    { merchant_category: "Travel", total: 50, failed: 25, failure_rate: 50.00, total_amt: 122460.00, failed_amt: 60830.11, risk: "Medium" },
    { merchant_category: "Other", total: 44, failed: 25, failure_rate: 56.82, total_amt: 104779.03, failed_amt: 55805.24, risk: "High" },
    { merchant_category: "Health & Pharmacy", total: 54, failed: 24, failure_rate: 44.44, total_amt: 129490.53, failed_amt: 54055.85, risk: "Low" },
    { merchant_category: "Groceries", total: 52, failed: 25, failure_rate: 48.08, total_amt: 123898.28, failed_amt: 50957.13, risk: "Medium" },
    { merchant_category: "Fuel", total: 53, failed: 21, failure_rate: 39.62, total_amt: 131093.76, failed_amt: 47290.66, risk: "Low" }
  ],
  retry_attempts: [
    { attempt: 1, label: "Attempt 1 (+30s)", retried_txns: 155, successful_retries: 70, failed_retries: 85, success_rate: 45.16, revenue_recovered: 178920.50 },
    { attempt: 2, label: "Attempt 2 (+2m)", retried_txns: 85, successful_retries: 24, failed_retries: 61, success_rate: 28.24, revenue_recovered: 61350.20 },
    { attempt: 3, label: "Attempt 3 (+10m)", retried_txns: 61, successful_retries: 8, failed_retries: 53, success_rate: 13.11, revenue_recovered: 20460.10 }
  ],
  retry_summary: {
    total_retry_attempts: 301,
    total_successful_retries: 102,
    total_revenue_recovered_inr: 260730.80,
    overall_retry_success_rate_pct: 33.89,
    temporary_recovery_rate_pct: 65.81,
    overall_failure_recovery_rate_pct: 40.80,
    average_retry_count: 1.94,
    temporary_failures: 155,
    permanent_failures: 95
  },
  system_alerts: [
    {
      id: "ALT-8921",
      severity: "warning",
      title: "Elevated Friction in Contact Payments (Rural Region)",
      description: "Failure rate reached 55.8% due to bank authentication timeouts during peak hours.",
      timestamp: "10 minutes ago",
      read: false
    },
    {
      id: "ALT-8919",
      severity: "success",
      title: "Smart Retry Engine Milestone",
      description: "Auto-retry rule #R-102 recovered ₹45,200 across 24 temporary food delivery failures today.",
      timestamp: "45 minutes ago",
      read: false
    },
    {
      id: "ALT-8904",
      severity: "info",
      title: "Power BI Data Model Sync Completed",
      description: "Daily transaction failure matrix refreshed successfully for Q3 2026 reporting.",
      timestamp: "2 hours ago",
      read: true
    }
  ],
  retry_rules: [
    {
      id: "R-101",
      name: "Fast-Track Immediate Retry (+30s)",
      trigger: "Temporary Network Timeout / HTTP 504",
      mode: "Online, Contact",
      delay: "30 seconds",
      max_attempts: 3,
      enabled: true,
      recovery_rate: "45.2%",
      recovered_amt: "₹178,920.50"
    },
    {
      id: "R-102",
      name: "Smart QR Auto-Reroute to Secondary Gateway",
      trigger: "Bank Downtime / Auth Failure Code 91",
      mode: "QR Code",
      delay: "2 minutes",
      max_attempts: 2,
      enabled: true,
      recovery_rate: "50.0%",
      recovered_amt: "₹73,092.27"
    },
    {
      id: "R-103",
      name: "AutoPay Off-Peak Night Buffer",
      trigger: "Insufficient Balance Temp Lock",
      mode: "AutoPay",
      delay: "10 minutes",
      max_attempts: 3,
      enabled: false,
      recovery_rate: "36.7%",
      recovered_amt: "₹48,475.41"
    },
    {
      id: "R-104",
      name: "High-Value Transaction Priority Recovery",
      trigger: "Amount > ₹5,000 Friction",
      mode: "All Modes",
      delay: "45 seconds",
      max_attempts: 3,
      enabled: true,
      recovery_rate: "62.4%",
      recovered_amt: "₹112,450.00"
    }
  ],
  recent_transactions: [
    {
      id: "TXN-90812",
      merchant: "Swiggy Express",
      category: "Food & Dining",
      amount: 1450.00,
      mode: "Contact",
      location: "Rural",
      status: "Recovered",
      failure_reason: "Auth Gateway Timeout (HTTP 504)",
      retry_count: 1,
      recovered_via: "Rule R-101 (+30s Retry)",
      timestamp: "2026-08-31 14:25:12"
    },
    {
      id: "TXN-90811",
      merchant: "Amazon India",
      category: "Shopping",
      amount: 4999.00,
      mode: "Online",
      location: "Urban",
      status: "Successful",
      failure_reason: "None",
      retry_count: 0,
      recovered_via: "Initial Auth",
      timestamp: "2026-08-31 14:24:01"
    },
    {
      id: "TXN-90810",
      merchant: "Zomato Gold",
      category: "Food & Dining",
      amount: 890.00,
      mode: "QR",
      location: "Semi-Urban",
      status: "Permanently Failed",
      failure_reason: "Card Stolen / Account Closed (Code 14)",
      retry_count: 3,
      recovered_via: "N/A (Permanent Hard Decline)",
      timestamp: "2026-08-31 14:22:45"
    },
    {
      id: "TXN-90809",
      merchant: "MakeMyTrip",
      category: "Travel",
      amount: 12500.00,
      mode: "Online",
      location: "Urban",
      status: "Recovered",
      failure_reason: "Bank Server Congestion",
      retry_count: 2,
      recovered_via: "Rule R-104 (Priority Retry)",
      timestamp: "2026-08-31 14:19:30"
    },
    {
      id: "TXN-90808",
      merchant: "Airtel Postpaid",
      category: "Bills & Utilities",
      amount: 799.00,
      mode: "AutoPay",
      location: "Rural",
      status: "Recovered",
      failure_reason: "Temporary Insufficient Balance Lock",
      retry_count: 1,
      recovered_via: "Rule R-103 (AutoPay Retry)",
      timestamp: "2026-08-31 14:15:02"
    },
    {
      id: "TXN-90807",
      merchant: "Reliance Fresh",
      category: "Groceries",
      amount: 2340.00,
      mode: "QR",
      location: "Urban",
      status: "Permanently Failed",
      failure_reason: "Invalid PIN / Auth Failed (Code 51)",
      retry_count: 3,
      recovered_via: "N/A (Max Retries Reached)",
      timestamp: "2026-08-31 14:12:18"
    },
    {
      id: "TXN-90806",
      merchant: "Netflix India",
      category: "Entertainment",
      amount: 649.00,
      mode: "AutoPay",
      location: "Semi-Urban",
      status: "Successful",
      failure_reason: "None",
      retry_count: 0,
      recovered_via: "Initial Auth",
      timestamp: "2026-08-31 14:08:50"
    },
    {
      id: "TXN-90805",
      merchant: "Apollo Pharmacy",
      category: "Health & Pharmacy",
      amount: 1850.00,
      mode: "Contact",
      location: "Rural",
      status: "Recovered",
      failure_reason: "Network Packet Drop",
      retry_count: 1,
      recovered_via: "Rule R-101 (+30s Retry)",
      timestamp: "2026-08-31 14:05:11"
    }
  ]
};
