import React, { useState, useEffect } from 'react';
import { analyticsData } from './data/analyticsData';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Legend, CartesianGrid 
} from 'recharts';
import { 
  Activity, CheckCircle2, XCircle, RefreshCw, IndianRupee, 
  ShieldAlert, Zap, TrendingUp, Filter, Search, Bell, Download, 
  ChevronRight, X, Sliders, Play, Pause, 
  CreditCard, Store, Check, Sparkles, ArrowRight
} from 'lucide-react';

export default function App() {
  // Navigation & Layout State (Default to Landing / Launchpad page!)
  const [activeTab, setActiveTab] = useState('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Filters & Search State
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Modals & Drawers State
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Dynamic Rules & Alerts State
  const [notificationsList, setNotificationsList] = useState(analyticsData.system_alerts);
  const [retryRulesList, setRetryRulesList] = useState(analyticsData.retry_rules);
  const [tickerPaused, setTickerPaused] = useState(false);

  // Simulator State
  const [simMaxRetries, setSimMaxRetries] = useState(3);
  const [simDelayInterval, setSimDelayInterval] = useState(30);
  const [simAutoReroute, setSimAutoReroute] = useState(true);
  const [simResults, setSimResults] = useState(null);

  // --- DYNAMIC REACTIVE DATA ENGINE ---
  const dateMultiplier = dateRange === 'Q3 2026' ? 2.8 : dateRange === 'Year to Date 2026' ? 8.5 : 1.0;

  // Base Mode / Category filtering
  let baseModeList = analyticsData.by_payment_mode;
  if (selectedMode !== 'All') {
    baseModeList = analyticsData.by_payment_mode.filter(m => m.payment_mode === selectedMode);
  }

  let baseCategoryList = analyticsData.by_merchant_category;
  if (selectedCategory !== 'All') {
    baseCategoryList = analyticsData.by_merchant_category.filter(c => c.merchant_category === selectedCategory);
  }

  // Dynamic Overall Metrics Calculation
  const calculateDynamicMetrics = () => {
    let totalTxns = analyticsData.overall.total_transactions;
    let failedTxns = analyticsData.overall.failed_transactions;
    let successfulTxns = analyticsData.overall.successful_transactions;
    let totalAmt = analyticsData.overall.total_amount_inr;
    let successfulAmt = analyticsData.overall.successful_amount_inr;
    let failedAmt = analyticsData.overall.failed_amount_inr;
    let recoveredAmt = analyticsData.overall.revenue_recovered_inr;
    let permanentlyLostAmt = analyticsData.overall.permanently_lost_revenue_inr;

    if (selectedMode !== 'All') {
      const modeData = baseModeList.reduce((acc, m) => {
        acc.total += m.total;
        acc.failed += m.failed;
        acc.success += m.success;
        acc.total_amt += m.total_amt;
        acc.failed_amt += m.failed_amt;
        acc.recovered += m.revenue_recovered;
        acc.lost += m.permanently_lost;
        return acc;
      }, { total: 0, failed: 0, success: 0, total_amt: 0, failed_amt: 0, recovered: 0, lost: 0 });

      totalTxns = modeData.total;
      failedTxns = modeData.failed;
      successfulTxns = modeData.success;
      totalAmt = modeData.total_amt;
      failedAmt = modeData.failed_amt;
      successfulAmt = totalAmt - failedAmt;
      recoveredAmt = modeData.recovered;
      permanentlyLostAmt = modeData.lost;
    } else if (selectedCategory !== 'All') {
      const catData = baseCategoryList.reduce((acc, c) => {
        acc.total += c.total;
        acc.failed += c.failed;
        acc.success += (c.total - c.failed);
        acc.total_amt += c.total_amt;
        acc.failed_amt += c.failed_amt;
        return acc;
      }, { total: 0, failed: 0, success: 0, total_amt: 0, failed_amt: 0 });

      totalTxns = catData.total;
      failedTxns = catData.failed;
      successfulTxns = catData.success;
      totalAmt = catData.total_amt;
      failedAmt = catData.failed_amt;
      successfulAmt = totalAmt - failedAmt;
      recoveredAmt = Math.round(failedAmt * (analyticsData.overall.revenue_recovery_rate_pct / 100));
      permanentlyLostAmt = failedAmt - recoveredAmt;
    }

    // Apply date range multiplier
    totalTxns = Math.round(totalTxns * dateMultiplier);
    failedTxns = Math.round(failedTxns * dateMultiplier);
    successfulTxns = totalTxns - failedTxns;
    totalAmt = Math.round(totalAmt * dateMultiplier * 100) / 100;
    successfulAmt = Math.round(successfulAmt * dateMultiplier * 100) / 100;
    failedAmt = Math.round(failedAmt * dateMultiplier * 100) / 100;
    recoveredAmt = Math.round(recoveredAmt * dateMultiplier * 100) / 100;
    permanentlyLostAmt = Math.round(permanentlyLostAmt * dateMultiplier * 100) / 100;
    const finalNetRealizedAmt = Math.round((successfulAmt + recoveredAmt) * 100) / 100;

    const failureRatePct = totalTxns > 0 ? Number(((failedTxns / totalTxns) * 100).toFixed(2)) : 0;
    const recoveryRatePct = failedAmt > 0 ? Number(((recoveredAmt / failedAmt) * 100).toFixed(2)) : 0;
    const netRealizationRatePct = totalAmt > 0 ? Number(((finalNetRealizedAmt / totalAmt) * 100).toFixed(2)) : 0;
    const permanentlyLostRatePct = failedAmt > 0 ? Number(((permanentlyLostAmt / failedAmt) * 100).toFixed(2)) : 0;

    return {
      total_transactions: totalTxns,
      successful_transactions: successfulTxns,
      failed_transactions: failedTxns,
      failure_rate_pct: failureRatePct,
      total_amount_inr: totalAmt,
      successful_amount_inr: successfulAmt,
      failed_amount_inr: failedAmt,
      revenue_recovered_inr: recoveredAmt,
      permanently_lost_revenue_inr: permanentlyLostAmt,
      final_net_realized_revenue_inr: finalNetRealizedAmt,
      revenue_recovery_rate_pct: recoveryRatePct,
      net_realization_rate_pct: netRealizationRatePct,
      permanently_lost_rate_pct: permanentlyLostRatePct
    };
  };

  const overall = calculateDynamicMetrics();

  // Dynamic Retry Summary
  const tempFailures = Math.round(overall.failed_transactions * 0.62);
  const permFailures = overall.failed_transactions - tempFailures;
  const totalRetryAttempts = Math.round(tempFailures * 1.94);
  const successfulRetries = Math.round(tempFailures * 0.6581);
  const tempRecoveryRate = tempFailures > 0 ? Number(((successfulRetries / tempFailures) * 100).toFixed(2)) : 0;

  const retry_summary = {
    total_retry_attempts: totalRetryAttempts,
    total_successful_retries: successfulRetries,
    total_revenue_recovered_inr: overall.revenue_recovered_inr,
    overall_retry_success_rate_pct: totalRetryAttempts > 0 ? Number(((successfulRetries / totalRetryAttempts) * 100).toFixed(2)) : 0,
    temporary_recovery_rate_pct: tempRecoveryRate,
    average_retry_count: 1.94,
    temporary_failures: tempFailures,
    permanent_failures: permFailures
  };

  // Dynamic Retry Attempts dataset
  const retry_attempts = [
    { attempt: 1, label: "Attempt 1 (+30s)", retried_txns: tempFailures, successful_retries: Math.round(tempFailures * 0.4516), success_rate: 45.16, revenue_recovered: Math.round(overall.revenue_recovered_inr * 0.686) },
    { attempt: 2, label: "Attempt 2 (+2m)", retried_txns: Math.round(tempFailures * 0.548), successful_retries: Math.round(tempFailures * 0.155), success_rate: 28.24, revenue_recovered: Math.round(overall.revenue_recovered_inr * 0.235) },
    { attempt: 3, label: "Attempt 3 (+10m)", retried_txns: Math.round(tempFailures * 0.393), successful_retries: Math.round(tempFailures * 0.052), success_rate: 13.11, revenue_recovered: Math.round(overall.revenue_recovered_inr * 0.079) }
  ];

  // Dynamic Payment Mode list for charts
  const by_payment_mode = baseModeList.map(m => ({
    ...m,
    total: Math.round(m.total * dateMultiplier),
    failed: Math.round(m.failed * dateMultiplier),
    success: Math.round(m.success * dateMultiplier),
    total_amt: Math.round(m.total_amt * dateMultiplier),
    failed_amt: Math.round(m.failed_amt * dateMultiplier),
    revenue_recovered: Math.round(m.revenue_recovered * dateMultiplier),
    permanently_lost: Math.round(m.permanently_lost * dateMultiplier)
  }));

  const filteredModeData = by_payment_mode;

  // Dynamic Location breakdown list for charts
  const by_location_type = analyticsData.by_location_type.map(l => ({
    ...l,
    total: Math.round(l.total * dateMultiplier),
    failed: Math.round(l.failed * dateMultiplier),
    success: Math.round(l.success * dateMultiplier),
    total_amt: Math.round(l.total_amt * dateMultiplier),
    failed_amt: Math.round(l.failed_amt * dateMultiplier * (selectedMode !== 'All' ? 0.25 : 1.0))
  }));

  // Dynamic Merchant Category list
  const by_merchant_category = baseCategoryList.map(c => ({
    ...c,
    total: Math.round(c.total * dateMultiplier),
    failed: Math.round(c.failed * dateMultiplier),
    total_amt: Math.round(c.total_amt * dateMultiplier),
    failed_amt: Math.round(c.failed_amt * dateMultiplier)
  }));

  const recent_transactions = analyticsData.recent_transactions;

  // Keyboard shortcut listener (Cmd/Ctrl + K for global search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
        setSelectedTransaction(null);
        setShowNotifications(false);
        setShowExportModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered transactions list
  const filteredTransactions = recent_transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.failure_reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = selectedMode === 'All' || t.mode === selectedMode;
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesMode && matchesCategory;
  });

  // Chart Data Sets
  const outcomePieData = [
    { name: 'Successful', value: overall.successful_transactions, color: '#10b981' },
    { name: 'Failed', value: overall.failed_transactions, color: '#f43f5e' }
  ];

  const failureTypePieData = [
    { name: 'Temporary Friction', value: retry_summary.temporary_failures, color: '#3b82f6' },
    { name: 'Permanent Declines', value: retry_summary.permanent_failures, color: '#f43f5e' }
  ];

  const revenueBreakdownData = [
    { name: 'Initial Success', amount: overall.successful_amount_inr, fill: '#10b981' },
    { name: 'Recovered via Retry', amount: overall.revenue_recovered_inr, fill: '#3b82f6' },
    { name: 'Permanently Lost', amount: overall.permanently_lost_revenue_inr, fill: '#f43f5e' }
  ];

  // Helper toggle rule
  const toggleRule = (ruleId) => {
    setRetryRulesList(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  // Helper mark notifications read
  const markAllNotificationsRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Run Strategy Simulation Logic
  const handleRunSimulation = () => {
    const baseRecovery = overall.revenue_recovered_inr;
    const retryMultiplier = simMaxRetries === 4 ? 1.08 : simMaxRetries === 5 ? 1.12 : simMaxRetries === 2 ? 0.90 : 1.0;
    const rerouteBonus = simAutoReroute ? 1.06 : 1.0;
    const intervalMultiplier = simDelayInterval <= 45 ? 1.03 : 0.97;
    
    const projectedRevenue = Math.round(baseRecovery * retryMultiplier * rerouteBonus * intervalMultiplier);
    const netLiftPct = (((projectedRevenue - baseRecovery) / baseRecovery) * 100).toFixed(1);
    
    setSimResults({
      projectedRevenue,
      netLiftPct: netLiftPct > 0 ? `+${netLiftPct}%` : `${netLiftPct}%`,
      estimatedRecoveredTxns: Math.round(retry_summary.total_successful_retries * (projectedRevenue / baseRecovery))
    });
  };

  // Simulated Report Download Trigger
  const handleExportDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      
      // Trigger dynamic CSV file download
      const csvHeader = "Transaction ID,Merchant,Category,Amount INR,Mode,Location,Status,Failure Reason,Retry Count,Timestamp\n";
      const csvRows = recent_transactions.map(t => 
        `"${t.id}","${t.merchant}","${t.category}",${t.amount},"${t.mode}","${t.location}","${t.status}","${t.failure_reason}",${t.retry_count},"${t.timestamp}"`
      ).join("\n");

      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FinPulse_Payment_Analytics_${dateRange.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 1200);
  };

  const unreadAlertsCount = notificationsList.filter(n => !n.read).length;

  // Page Header Details Map for specialized template pages
  const pageConfigs = {
    landing: {
      breadcrumb: "FinPulse Platform / Launchpad / System Welcome Hub",
      title: "FinPulse Revenue Recovery Engine Launchpad",
      subtitle: "Enterprise telemetry portal for fintech payment friction analytics and dynamic recovery routing",
      statLabel1: "System Telemetry",
      statValue1: "100% Operational",
      statLabel2: "Net Recovery Rate",
      statValue2: `${overall.revenue_recovery_rate_pct}%`
    },
    overview: {
      breadcrumb: "FinPulse Platform / Dashboards / System Executive Overview",
      title: "System Executive Health & Financial Overview",
      subtitle: "Real-time telemetry on system throughput, initial success rate, and recovered volume",
      statLabel1: "Net Recovery Rate",
      statValue1: `${overall.revenue_recovery_rate_pct}%`,
      statLabel2: "Revenue Recovered",
      statValue2: `₹${overall.revenue_recovered_inr.toLocaleString()}`
    },
    failures: {
      breadcrumb: "FinPulse Platform / Analytics / Failure Diagnostics & Friction Root Cause",
      title: "Failure Diagnostics & Friction Root Cause Analysis",
      subtitle: "Classifying temporary network friction vs permanent hard declines across gateway channels & location zones",
      statLabel1: "Temporary Friction",
      statValue1: `${retry_summary.temporary_failures} txns`,
      statLabel2: "Hard Loss Exposure",
      statValue2: `₹${overall.permanently_lost_revenue_inr.toLocaleString()}`
    },
    retries: {
      breadcrumb: "FinPulse Platform / Telemetry / Automated Retry Engine Analytics",
      title: "Automated Retry Engine & Recovery Decay Analytics",
      subtitle: "Measuring multi-attempt recovery yield, algorithm delay intervals, and attempt success decay rates",
      statLabel1: "Total Retry Attempts",
      statValue1: `${retry_summary.total_retry_attempts} attempts`,
      statLabel2: "Temporary Recovery",
      statValue2: `${retry_summary.temporary_recovery_rate_pct}%`
    },
    revenue: {
      breadcrumb: "FinPulse Platform / Treasury / Financial Throughput & Revenue Reconciliation",
      title: "Revenue Realization & Net Recovery Reconciliation",
      subtitle: "Complete financial reconciliation of initial failure exposure vs salvaged funds and hard unrecoverable loss",
      statLabel1: "Failed Exposure",
      statValue1: `₹${overall.failed_amount_inr.toLocaleString()}`,
      statLabel2: "Net Realized Revenue",
      statValue2: `₹${overall.final_net_realized_revenue_inr.toLocaleString()}`
    },
    rules: {
      breadcrumb: "FinPulse Platform / Management / Smart Retry Strategy Studio",
      title: "Smart Retry Strategy Configurator & Policy Studio",
      subtitle: "Design, simulate, and deploy automated retry routing algorithms and secondary gateway failover policies",
      statLabel1: "Active Rules",
      statValue1: `${retryRulesList.filter(r => r.enabled).length} Active`,
      statLabel2: "Projected Strategy Lift",
      statValue2: "+9.1%"
    },
    transactions: {
      breadcrumb: "FinPulse Platform / Explorer / Live Payment Audit Log & Telemetry",
      title: "Real-time Transaction Audit Log & Failure Inspector",
      subtitle: "Deep-dive transaction explorer with step-by-step gateway error trace and retry execution timeline",
      statLabel1: "Logged Events",
      statValue1: `${recent_transactions.length} Records`,
      statLabel2: "Active Filter Mode",
      statValue2: selectedMode
    },
    merchants: {
      breadcrumb: "FinPulse Platform / Governance / Merchant Friction & Risk Classification",
      title: "Merchant Category Friction & Exposure Risk Matrix",
      subtitle: "Partner governance matrix classifying food & dining, online services, travel, and retail risk levels",
      statLabel1: "Critical Risk Categories",
      statValue1: "2 Categories",
      statLabel2: "Total Merchant Volume",
      statValue2: `₹${overall.total_amount_inr.toLocaleString()}`
    }
  };

  const currentPage = pageConfigs[activeTab] || pageConfigs.landing;

  return (
    <div className="app-container">
      {/* LEFT NAVIGATION SIDEBAR */}
      <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => setActiveTab('landing')}>
            <div className="brand-icon">
              <Zap size={22} />
            </div>
            {!sidebarCollapsed && (
              <div className="brand-info">
                <h2>FinPulse</h2>
                <span>REVENUE RECOVERY</span>
              </div>
            )}
          </div>
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ChevronRight size={16} style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveTab('landing')}
          >
            <div className="nav-item-icon"><Sparkles size={18} color="#3b82f6" /></div>
            {!sidebarCollapsed && <span>Product Launchpad</span>}
          </button>

          {!sidebarCollapsed && <div className="nav-group-title" style={{ marginTop: '0.5rem' }}>Analytics Dashboards</div>}
          
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <div className="nav-item-icon"><Activity size={18} /></div>
            {!sidebarCollapsed && <span>System Overview</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'failures' ? 'active' : ''}`}
            onClick={() => setActiveTab('failures')}
          >
            <div className="nav-item-icon"><ShieldAlert size={18} /></div>
            {!sidebarCollapsed && <span>Failure Analysis</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'retries' ? 'active' : ''}`}
            onClick={() => setActiveTab('retries')}
          >
            <div className="nav-item-icon"><RefreshCw size={18} /></div>
            {!sidebarCollapsed && <span>Retry Performance</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            <div className="nav-item-icon"><IndianRupee size={18} /></div>
            {!sidebarCollapsed && <span>Revenue Recovery</span>}
          </button>

          {!sidebarCollapsed && <div className="nav-group-title" style={{ marginTop: '0.75rem' }}>Management & Rules</div>}

          <button 
            className={`nav-item ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <div className="nav-item-icon"><Sliders size={18} /></div>
            {!sidebarCollapsed && <span>Smart Retry Engine</span>}
            {!sidebarCollapsed && <span className="nav-badge">NEW</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <div className="nav-item-icon"><CreditCard size={18} /></div>
            {!sidebarCollapsed && <span>Transaction Explorer</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'merchants' ? 'active' : ''}`}
            onClick={() => setActiveTab('merchants')}
          >
            <div className="nav-item-icon"><Store size={18} /></div>
            {!sidebarCollapsed && <span>Merchant Matrix</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">L</div>
          {!sidebarCollapsed && (
            <div className="user-meta">
              <h4>Layasree</h4>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN BODY AREA */}
      <main className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* TOP HEADER BAR */}
        <header className="top-header">
          <div className="header-left">
            <div className="env-badge">
              <div className="pulsing-dot"></div>
              <span>Live Production (Asia-South1)</span>
            </div>

            <button className="cmd-search-btn" onClick={() => setShowSearchModal(true)}>
              <Search size={15} />
              <span>Search transactions, codes...</span>
              <span className="kbd-shortcut">⌘K</span>
            </button>
          </div>

          <div className="header-right">
            <select 
              className="date-range-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="Last 30 Days">Last 30 Days (Aug 2026)</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Year to Date">Year to Date 2026</option>
            </select>

            <button 
              className="header-icon-btn" 
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications Drawer"
            >
              <Bell size={18} />
              {unreadAlertsCount > 0 && <span className="badge-count">{unreadAlertsCount}</span>}
            </button>

            <button 
              className="export-btn"
              onClick={() => { setShowExportModal(true); setExportComplete(false); }}
            >
              <Download size={16} />
              <span>Export Report</span>
            </button>
          </div>
        </header>

        {/* PAGE BODY CANVAS */}
        <div className="page-body">
          {/* WRAPPER FOR PAGE TRANSITION SLIDE ANIMATION */}
          <div key={activeTab} className="page-content-wrapper">
            {/* BREADCRUMB NAVIGATION TRAIL */}
            <div className="breadcrumb-bar">
              <span>{currentPage.breadcrumb.split(' / ')[0]}</span>
              <ChevronRight size={12} />
              <span>{currentPage.breadcrumb.split(' / ')[1]}</span>
              <ChevronRight size={12} />
              <span className="breadcrumb-active">{currentPage.breadcrumb.split(' / ')[2]}</span>
            </div>

            {/* PAGE 0: LAUNCHPAD / LANDING PAGE HERO */}
            {activeTab === 'landing' && (
              <>
                <div className="launch-hero">
                  <div className="launch-badge">
                    <Sparkles size={16} /> FINPULSE 3.0 • AUTOMATED RECOVERY ENGINE PLATFORM
                  </div>
                  <h1 className="launch-title">Next-Generation Payment Friction & Revenue Recovery</h1>
                  <p className="launch-subtitle">
                    Transforming payment failure friction into realized revenue with real-time telemetry, automated retry routing, and Power BI executive analytics.
                  </p>

                  <div className="launch-actions">
                    <button className="launch-primary-btn" onClick={() => setActiveTab('overview')}>
                      <Play size={18} />
                      <span>Launch Live Telemetry Dashboard</span>
                      <ArrowRight size={16} />
                    </button>

                    <button className="launch-secondary-btn" onClick={() => setActiveTab('rules')}>
                      <Sliders size={18} />
                      <span>Test Smart Retry Simulator</span>
                    </button>
                  </div>
                </div>

                {/* LAUNCHPAD FEATURE MODULES GRID */}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Platform Modules & Launch Shortcuts
                </div>

                <div className="launch-grid">
                  <div className="launch-card" onClick={() => setActiveTab('overview')}>
                    <div className="launch-card-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                      <Activity size={22} />
                    </div>
                    <h3>System Executive Overview</h3>
                    <p>High-level operational health, initial 50/50 payment outcome split, and friction distribution charts.</p>
                    <div className="launch-card-footer">
                      <span>Launch Module</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <div className="launch-card" onClick={() => setActiveTab('failures')}>
                    <div className="launch-card-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                      <ShieldAlert size={22} />
                    </div>
                    <h3>Failure Diagnostics Studio</h3>
                    <p>Classify temporary network timeouts HTTP 504 vs hard bank declines and rural location friction.</p>
                    <div className="launch-card-footer" style={{ color: '#f43f5e' }}>
                      <span>Launch Module</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <div className="launch-card" onClick={() => setActiveTab('retries')}>
                    <div className="launch-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <RefreshCw size={22} />
                    </div>
                    <h3>Retry Engine Telemetry</h3>
                    <p>Analyze multi-attempt decay curves (+30s, +2m, +10m) and cumulative recovery trajectory.</p>
                    <div className="launch-card-footer" style={{ color: '#10b981' }}>
                      <span>Launch Module</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <div className="launch-card" onClick={() => setActiveTab('revenue')}>
                    <div className="launch-card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                      <IndianRupee size={22} />
                    </div>
                    <h3>Revenue Reconciliation</h3>
                    <p>Complete financial reconciliation of initial failed exposure vs salvaged funds and realization rates.</p>
                    <div className="launch-card-footer" style={{ color: '#8b5cf6' }}>
                      <span>Launch Module</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <div className="launch-card" onClick={() => setActiveTab('rules')}>
                    <div className="launch-card-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                      <Sliders size={22} />
                    </div>
                    <h3>Smart Retry Strategy Studio</h3>
                    <p>Configure automated retry intervals, max attempts, and secondary gateway rerouting rules.</p>
                    <div className="launch-card-footer" style={{ color: '#06b6d4' }}>
                      <span>Launch Module</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <div className="launch-card" onClick={() => setActiveTab('transactions')}>
                    <div className="launch-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                      <CreditCard size={22} />
                    </div>
                    <h3>Transaction Audit Explorer</h3>
                    <p>Real-time payment event stream with search, status filters, and slide-out inspector drawer.</p>
                    <div className="launch-card-footer" style={{ color: '#f59e0b' }}>
                      <span>Launch Module</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CUSTOM PAGE HERO BANNER (Shown on analytical modules) */}
            {activeTab !== 'landing' && (
              <div className="page-banner">
                <div className="banner-text">
                  <h1>{currentPage.title}</h1>
                  <p>{currentPage.subtitle}</p>
                </div>
                <div className="banner-metrics">
                  <div className="banner-stat">
                    <span className="banner-stat-label">{currentPage.statLabel1}</span>
                    <span className="banner-stat-value">{currentPage.statValue1}</span>
                  </div>
                  <div className="banner-stat">
                    <span className="banner-stat-label">{currentPage.statLabel2}</span>
                    <span className="banner-stat-value" style={{ color: '#10b981' }}>{currentPage.statValue2}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SLICERS & FILTERS BAR (Shown on Analytics views) */}
            {['overview', 'failures', 'retries', 'revenue', 'transactions'].includes(activeTab) && (
              <div className="filter-bar">
                <div className="filter-label">
                  <Filter size={15} /> Data Controls:
                </div>

                <select 
                  className="filter-select"
                  value={selectedMode} 
                  onChange={(e) => setSelectedMode(e.target.value)}
                >
                  <option value="All">All Payment Modes</option>
                  <option value="Online">Online Payments</option>
                  <option value="QR">QR Code Payments</option>
                  <option value="Contact">Contact / Card Payments</option>
                  <option value="AutoPay">AutoPay / Recurring</option>
                </select>

                <select 
                  className="filter-select"
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Merchant Categories</option>
                  {by_merchant_category.map(c => (
                    <option key={c.merchant_category} value={c.merchant_category}>{c.merchant_category}</option>
                  ))}
                </select>

                <input 
                  type="text" 
                  className="search-input"
                  placeholder="Quick filter tables..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* PAGE 1: SYSTEM OVERVIEW */}
            {activeTab === 'overview' && (
              <>
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Total Volume</span>
                      <div className="kpi-icon" style={{ color: '#3b82f6' }}><Activity size={18} /></div>
                    </div>
                    <div className="kpi-value">{overall.total_transactions} txns</div>
                    <div className="kpi-subtext">Total Processed: ₹{overall.total_amount_inr.toLocaleString()}</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Initial Success Rate</span>
                      <div className="kpi-icon" style={{ color: '#10b981' }}><CheckCircle2 size={18} /></div>
                    </div>
                    <div className="kpi-value">{(100 - overall.failure_rate_pct).toFixed(2)}%</div>
                    <div className="kpi-subtext">{overall.successful_transactions} Seamless Payments (₹{(overall.successful_amount_inr / 1000).toFixed(1)}K)</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Initial Failure Rate</span>
                      <div className="kpi-icon" style={{ color: '#f43f5e' }}><XCircle size={18} /></div>
                    </div>
                    <div className="kpi-value">{overall.failure_rate_pct.toFixed(2)}%</div>
                    <div className="kpi-subtext">{overall.failed_transactions} Failed Attempts (₹{(overall.failed_amount_inr / 1000).toFixed(1)}K)</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Revenue Recovered</span>
                      <div className="kpi-icon" style={{ color: '#10b981' }}><TrendingUp size={18} /></div>
                    </div>
                    <div className="kpi-value" style={{ color: '#10b981' }}>₹{overall.revenue_recovered_inr.toLocaleString()}</div>
                    <div className="kpi-subtext">{overall.revenue_recovery_rate_pct}% Recovery of Failed Revenue</div>
                  </div>
                </div>

                <div className="charts-grid">
                  <div className="chart-card col-6">
                    <div className="chart-header">
                      <div>
                        <div className="chart-title">Payment Outcome Distribution</div>
                        <div className="chart-subtitle">Initial Success vs Failure Split</div>
                      </div>
                    </div>
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={outcomePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={5}>
                            {outcomePieData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} txns`, 'Volume']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-card col-6">
                    <div className="chart-header">
                      <div>
                        <div className="chart-title">Payment Mode Failure Rate</div>
                        <div className="chart-subtitle">Friction Breakdown across Payment Channels</div>
                      </div>
                    </div>
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredModeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="payment_mode" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" unit="%" />
                          <Tooltip formatter={(value) => [`${value}%`, 'Failure Rate']} />
                          <Bar dataKey="failure_rate" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="chart-card col-12" style={{ marginTop: '1.5rem' }}>
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Merchant Category Friction Highlights</div>
                      <div className="chart-subtitle">Top Categories sorted by Failed Revenue Exposure</div>
                    </div>
                  </div>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Merchant Category</th>
                          <th>Total Txns</th>
                          <th>Failed Txns</th>
                          <th>Failure Rate %</th>
                          <th>Total Volume (₹)</th>
                          <th>Failed Revenue (₹)</th>
                          <th>Risk Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {by_merchant_category.slice(0, 5).map((cat) => (
                          <tr key={cat.merchant_category}>
                            <td style={{ fontWeight: 600, color: '#f8fafc' }}>{cat.merchant_category}</td>
                            <td>{cat.total}</td>
                            <td>{cat.failed}</td>
                            <td>{cat.failure_rate.toFixed(2)}%</td>
                            <td>₹{cat.total_amt.toLocaleString()}</td>
                            <td style={{ color: '#f43f5e', fontWeight: 600 }}>₹{cat.failed_amt.toLocaleString()}</td>
                            <td>
                              <span className={`badge ${cat.risk === 'Critical' ? 'badge-danger' : cat.risk === 'High' ? 'badge-warning' : 'badge-info'}`}>
                                {cat.risk}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* PAGE 2: FAILURE ANALYSIS */}
            {activeTab === 'failures' && (
              <>
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Temporary Friction</span>
                      <div className="kpi-icon" style={{ color: '#3b82f6' }}><RefreshCw size={18} /></div>
                    </div>
                    <div className="kpi-value" style={{ color: '#3b82f6' }}>{retry_summary.temporary_failures} txns</div>
                    <div className="kpi-subtext">{((retry_summary.temporary_failures / overall.failed_transactions) * 100).toFixed(1)}% of Failures (₹{((overall.failed_amount_inr * retry_summary.temporary_failures) / overall.failed_transactions / 1000).toFixed(1)}K Exposure)</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Permanent Declines</span>
                      <div className="kpi-icon" style={{ color: '#f43f5e' }}><XCircle size={18} /></div>
                    </div>
                    <div className="kpi-value" style={{ color: '#f43f5e' }}>{retry_summary.permanent_failures} txns</div>
                    <div className="kpi-subtext">{((retry_summary.permanent_failures / overall.failed_transactions) * 100).toFixed(1)}% of Failures (₹{(overall.permanently_lost_revenue_inr / 1000).toFixed(1)}K Hard Loss)</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Top Friction Location</span>
                      <div className="kpi-icon" style={{ color: '#f59e0b' }}><ShieldAlert size={18} /></div>
                    </div>
                    <div className="kpi-value">
                      {by_location_type && by_location_type.length > 0 ? by_location_type[0].location_type : 'Rural'} ({by_location_type && by_location_type.length > 0 ? by_location_type[0].failure_rate.toFixed(1) : 54.3}%)
                    </div>
                    <div className="kpi-subtext">₹{by_location_type && by_location_type.length > 0 ? (by_location_type[0].failed_amt / 1000).toFixed(1) : 240.2}K Failed Revenue Exposure</div>
                  </div>
                </div>

                <div className="charts-grid">
                  <div className="chart-card col-6">
                    <div className="chart-header">
                      <div>
                        <div className="chart-title">Failure Classification Split</div>
                        <div className="chart-subtitle">Temporary Friction vs Permanent Declines</div>
                      </div>
                    </div>
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={failureTypePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={5}>
                            {failureTypePieData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} txns`, 'Volume']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-card col-6">
                    <div className="chart-header">
                      <div>
                        <div className="chart-title">Location Failure Exposure</div>
                        <div className="chart-subtitle">Rural vs Urban vs Semi-Urban Breakdown</div>
                      </div>
                    </div>
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={by_location_type}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="location_type" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Failed Amount']} />
                          <Bar dataKey="failed_amt" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Gateway Error & Response Codes Matrix */}
                <div className="chart-card col-12" style={{ marginTop: '1rem' }}>
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Gateway Response Error Codes & Root Cause Breakdown</div>
                      <div className="chart-subtitle">Analysis of technical friction triggers across network gateways</div>
                    </div>
                  </div>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Gateway Response Code</th>
                          <th>Failure Category</th>
                          <th>Friction Classification</th>
                          <th>Failed Volume</th>
                          <th>Revenue Exposure</th>
                          <th>Recommended Strategy</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span className="badge badge-info">HTTP 504 (Timeout)</span></td>
                          <td>Auth Gateway Congestion</td>
                          <td><span className="badge badge-info">Temporary Friction</span></td>
                          <td>98 txns</td>
                          <td style={{ color: '#f43f5e', fontWeight: 600 }}>₹245,120.00</td>
                          <td>Auto-retry +30s via Fast-Track Rule R-101</td>
                        </tr>
                        <tr>
                          <td><span className="badge badge-purple">Code 91 (Bank Down)</span></td>
                          <td>Issuing Bank Downtime</td>
                          <td><span className="badge badge-info">Temporary Friction</span></td>
                          <td>57 txns</td>
                          <td style={{ color: '#f43f5e', fontWeight: 600 }}>₹151,280.00</td>
                          <td>Auto-reroute to Secondary UPI Gateway (R-102)</td>
                        </tr>
                        <tr>
                          <td><span className="badge badge-danger">Code 14 (Stolen Card)</span></td>
                          <td>Hard Account Lock</td>
                          <td><span className="badge badge-danger">Permanent Decline</span></td>
                          <td>42 txns</td>
                          <td style={{ color: '#f43f5e', fontWeight: 600 }}>₹105,450.00</td>
                          <td>Immediate Decline (Do Not Retry)</td>
                        </tr>
                        <tr>
                          <td><span className="badge badge-danger">Code 51 (Invalid PIN)</span></td>
                          <td>User Auth Error</td>
                          <td><span className="badge badge-danger">Permanent Decline</span></td>
                          <td>53 txns</td>
                          <td style={{ color: '#f43f5e', fontWeight: 600 }}>₹122,152.79</td>
                          <td>Prompt User for Credentials Refresh</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* PAGE 3: RETRY PERFORMANCE */}
            {activeTab === 'retries' && (
              <>
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Total Retry Attempts</span>
                      <div className="kpi-icon" style={{ color: '#3b82f6' }}><RefreshCw size={18} /></div>
                    </div>
                    <div className="kpi-value">{retry_summary.total_retry_attempts}</div>
                    <div className="kpi-subtext">Across {retry_summary.temporary_failures} Temporary Failure Events</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Successful Retries</span>
                      <div className="kpi-icon" style={{ color: '#10b981' }}><CheckCircle2 size={18} /></div>
                    </div>
                    <div className="kpi-value" style={{ color: '#10b981' }}>{retry_summary.total_successful_retries}</div>
                    <div className="kpi-subtext">{retry_summary.temporary_recovery_rate_pct}% Temporary Recovery Rate</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Avg Retry Count</span>
                      <div className="kpi-icon" style={{ color: '#8b5cf6' }}><Activity size={18} /></div>
                    </div>
                    <div className="kpi-value">{retry_summary.average_retry_count}</div>
                    <div className="kpi-subtext">Attempts per Temporary Txn</div>
                  </div>
                </div>

                <div className="charts-grid">
                  <div className="chart-card col-8">
                    <div className="chart-header">
                      <div>
                        <div className="chart-title">Retry Attempt Success Decay Curve</div>
                        <div className="chart-subtitle">
                          {retry_attempts.map((r) => `Attempt ${r.attempt} (${r.success_rate}%)`).join(' → ')}
                        </div>
                      </div>
                    </div>
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={retry_attempts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="label" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" unit="%" />
                          <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                          <Bar dataKey="success_rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-card col-4">
                    <div className="chart-header">
                      <div>
                        <div className="chart-title">Recovered Revenue per Attempt</div>
                        <div className="chart-subtitle">Attempt 1 Recovers ₹{(retry_attempts[0]?.revenue_recovered / 1000).toFixed(1)}K</div>
                      </div>
                    </div>
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={retry_attempts} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" stroke="#94a3b8" />
                          <YAxis dataKey="attempt" type="category" stroke="#94a3b8" />
                          <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Recovered']} />
                          <Bar dataKey="revenue_recovered" fill="#10b981" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Cumulative Trajectory Breakdown */}
                <div className="chart-card col-12" style={{ marginTop: '1rem' }}>
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Cumulative Retry Recovery Trajectory & Attempt Yield</div>
                      <div className="chart-subtitle">Breakdown of recovery volume and diminishing returns per attempt</div>
                    </div>
                  </div>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Retry Step</th>
                          <th>Time Delay</th>
                          <th>Retried Txns</th>
                          <th>Successful Recoveries</th>
                          <th>Attempt Success Rate</th>
                          <th>Cumulative Recovery Rate</th>
                          <th>Revenue Recovered (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {retry_attempts.map((r, idx) => {
                          const cumYield = idx === 0 ? 45.16 : idx === 1 ? 59.82 : 65.81;
                          return (
                            <tr key={r.attempt}>
                              <td><span className="badge badge-info">Attempt #{r.attempt}</span></td>
                              <td>{r.label.split(' ')[2]}</td>
                              <td>{r.retried_txns} txns</td>
                              <td style={{ color: '#10b981', fontWeight: 600 }}>{r.successful_retries} txns</td>
                              <td>{r.success_rate}%</td>
                              <td style={{ color: '#3b82f6', fontWeight: 600 }}>{cumYield}%</td>
                              <td style={{ color: '#10b981', fontWeight: 600 }}>₹{r.revenue_recovered.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* PAGE 4: REVENUE RECOVERY */}
            {activeTab === 'revenue' && (
              <>
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Total Failed Revenue</span>
                      <div className="kpi-icon" style={{ color: '#f43f5e' }}><IndianRupee size={18} /></div>
                    </div>
                    <div className="kpi-value">₹{overall.failed_amount_inr.toLocaleString()}</div>
                    <div className="kpi-subtext">Initial Failure Exposure</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Revenue Recovered</span>
                      <div className="kpi-icon" style={{ color: '#10b981' }}><TrendingUp size={18} /></div>
                    </div>
                    <div className="kpi-value" style={{ color: '#10b981' }}>₹{overall.revenue_recovered_inr.toLocaleString()}</div>
                    <div className="kpi-subtext">{overall.revenue_recovery_rate_pct}% Recovery Rate</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Permanently Lost</span>
                      <div className="kpi-icon" style={{ color: '#f43f5e' }}><XCircle size={18} /></div>
                    </div>
                    <div className="kpi-value" style={{ color: '#f43f5e' }}>₹{overall.permanently_lost_revenue_inr.toLocaleString()}</div>
                    <div className="kpi-subtext">{overall.permanently_lost_rate_pct}% Permanent Hard Loss</div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-title">Final Realized Revenue</span>
                      <div className="kpi-icon" style={{ color: '#3b82f6' }}><Zap size={18} /></div>
                    </div>
                    <div className="kpi-value" style={{ color: '#3b82f6' }}>₹{overall.final_net_realized_revenue_inr.toLocaleString()}</div>
                    <div className="kpi-subtext">{overall.net_realization_rate_pct}% Net Realization Rate</div>
                  </div>
                </div>

                <div className="charts-grid">
                  <div className="chart-card col-12">
                    <div className="chart-header">
                      <div>
                        <div className="chart-title">Revenue Realization Reconciliation</div>
                        <div className="chart-subtitle">Initial Success vs Recovered via Retries vs Permanently Lost</div>
                      </div>
                    </div>
                    <div style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueBreakdownData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                            {revenueBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Revenue Breakdown Matrix */}
                <div className="chart-card col-12" style={{ marginTop: '1rem' }}>
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Channel Revenue Realization Breakdown</div>
                      <div className="chart-subtitle">Net financial throughput and salvage rate by payment channel</div>
                    </div>
                  </div>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Payment Mode</th>
                          <th>Total Volume (₹)</th>
                          <th>Initial Failed Exposure (₹)</th>
                          <th>Revenue Recovered (₹)</th>
                          <th>Permanently Lost (₹)</th>
                          <th>Net Realization Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {by_payment_mode.map(m => {
                          const netRealized = m.total_amt - m.permanently_lost;
                          const rate = ((netRealized / m.total_amt) * 100).toFixed(1);
                          return (
                            <tr key={m.payment_mode}>
                              <td style={{ fontWeight: 600, color: '#f8fafc' }}>{m.payment_mode}</td>
                              <td>₹{m.total_amt.toLocaleString()}</td>
                              <td style={{ color: '#f43f5e' }}>₹{m.failed_amt.toLocaleString()}</td>
                              <td style={{ color: '#10b981', fontWeight: 600 }}>₹{m.revenue_recovered.toLocaleString()}</td>
                              <td style={{ color: '#f43f5e' }}>₹{m.permanently_lost.toLocaleString()}</td>
                              <td style={{ color: '#3b82f6', fontWeight: 600 }}>{rate}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* PAGE 5: SMART RETRY ENGINE & SIMULATOR */}
            {activeTab === 'rules' && (
              <>
                {/* INTERACTIVE STRATEGY SIMULATOR */}
                <div className="simulator-panel">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Sparkles className="text-blue-400" size={20} color="#3b82f6" />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Smart Retry Strategy Simulator</h2>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    Adjust retry algorithm parameters to simulate projected revenue recovery lift before deploying rules.
                  </p>

                  <div className="simulator-controls">
                    <div className="control-group">
                      <label>
                        <span>Max Retry Attempts</span>
                        <strong style={{ color: '#3b82f6' }}>{simMaxRetries} attempts</strong>
                      </label>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        className="control-slider"
                        value={simMaxRetries}
                        onChange={(e) => setSimMaxRetries(Number(e.target.value))}
                      />
                    </div>

                    <div className="control-group">
                      <label>
                        <span>Retry Interval Delay</span>
                        <strong style={{ color: '#10b981' }}>{simDelayInterval} seconds</strong>
                      </label>
                      <input 
                        type="range" 
                        min="5" 
                        max="180" 
                        step="5"
                        className="control-slider"
                        value={simDelayInterval}
                        onChange={(e) => setSimDelayInterval(Number(e.target.value))}
                      />
                    </div>

                    <div className="control-group">
                      <label>
                        <span>Auto-Reroute Gateway</span>
                        <strong style={{ color: simAutoReroute ? '#10b981' : '#64748b' }}>
                          {simAutoReroute ? 'ENABLED' : 'DISABLED'}
                        </strong>
                      </label>
                      <button 
                        onClick={() => setSimAutoReroute(!simAutoReroute)}
                        style={{ 
                          padding: '0.45rem', 
                          borderRadius: '8px', 
                          background: simAutoReroute ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                          border: '1px solid var(--border-color)',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {simAutoReroute ? '✓ Secondary UPI Rerouting Active' : 'Off'}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={handleRunSimulation}
                      className="export-btn"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      <Play size={16} />
                      <span>Run Strategy Simulation</span>
                    </button>

                    {simResults && (
                      <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Projected Revenue: </span>
                          <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>₹{simResults.projectedRevenue.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Net Revenue Lift: </span>
                          <strong style={{ color: '#3b82f6', fontSize: '0.95rem' }}>{simResults.netLiftPct}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Est Recovered Txns: </span>
                          <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{simResults.estimatedRecoveredTxns}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RULES TABLE */}
                <div className="chart-card col-12">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Active Smart Retry Engine Rules Catalog</div>
                      <div className="chart-subtitle">Configured automated retry rules and recovery yield</div>
                    </div>
                  </div>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Rule ID</th>
                          <th>Rule Name</th>
                          <th>Failure Trigger</th>
                          <th>Payment Mode</th>
                          <th>Delay Interval</th>
                          <th>Max Retries</th>
                          <th>Success Yield</th>
                          <th>Revenue Recovered</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {retryRulesList.map((rule) => (
                          <tr key={rule.id}>
                            <td><span className="badge badge-info">{rule.id}</span></td>
                            <td style={{ fontWeight: 600, color: '#f8fafc' }}>{rule.name}</td>
                            <td>{rule.trigger}</td>
                            <td><span className="badge badge-purple">{rule.mode}</span></td>
                            <td>{rule.delay}</td>
                            <td>{rule.max_attempts}x</td>
                            <td style={{ color: '#10b981', fontWeight: 600 }}>{rule.recovery_rate}</td>
                            <td style={{ color: '#3b82f6', fontWeight: 600 }}>{rule.recovered_amt}</td>
                            <td>
                              <button 
                                onClick={() => toggleRule(rule.id)}
                                className={`badge ${rule.enabled ? 'badge-success' : 'badge-danger'}`}
                                style={{ cursor: 'pointer', border: 'none' }}
                              >
                                {rule.enabled ? '● Active' : '○ Paused'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* PAGE 6: TRANSACTION EXPLORER */}
            {activeTab === 'transactions' && (
              <div className="chart-card col-12">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Transaction Explorer & Audit Log</div>
                    <div className="chart-subtitle">Click any row to view full slide-out failure trace and retry history</div>
                  </div>
                </div>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Merchant</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Mode</th>
                        <th>Location</th>
                        <th>Initial Failure Reason</th>
                        <th>Retries</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((t) => (
                        <tr key={t.id} onClick={() => setSelectedTransaction(t)}>
                          <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: '#3b82f6' }}>{t.id}</td>
                          <td style={{ fontWeight: 600, color: '#f8fafc' }}>{t.merchant}</td>
                          <td>{t.category}</td>
                          <td style={{ fontWeight: 600 }}>₹{t.amount.toLocaleString()}</td>
                          <td><span className="badge badge-purple">{t.mode}</span></td>
                          <td>{t.location}</td>
                          <td style={{ color: t.status === 'Permanently Failed' ? '#f43f5e' : '#94a3b8' }}>{t.failure_reason}</td>
                          <td>{t.retry_count}x</td>
                          <td>
                            <span className={`badge ${
                              t.status === 'Successful' ? 'badge-success' :
                              t.status === 'Recovered' ? 'badge-info' : 'badge-danger'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAGE 7: MERCHANT MATRIX */}
            {activeTab === 'merchants' && (
              <div className="chart-card col-12">
                <div className="chart-header">
                  <div>
                    <div className="chart-title">Merchant Category Friction & Revenue Risk Matrix</div>
                    <div className="chart-subtitle">Partner classification matrix sorted by failed revenue exposure</div>
                  </div>
                </div>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Merchant Category</th>
                        <th>Total Txns</th>
                        <th>Failed Txns</th>
                        <th>Failure Rate %</th>
                        <th>Total Volume (₹)</th>
                        <th>Failed Revenue (₹)</th>
                        <th>Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {by_merchant_category.map((cat) => (
                        <tr key={cat.merchant_category}>
                          <td style={{ fontWeight: 600, color: '#f8fafc' }}>{cat.merchant_category}</td>
                          <td>{cat.total}</td>
                          <td>{cat.failed}</td>
                          <td>{cat.failure_rate.toFixed(2)}%</td>
                          <td>₹{cat.total_amt.toLocaleString()}</td>
                          <td style={{ color: '#f43f5e', fontWeight: 600 }}>₹{cat.failed_amt.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${cat.risk === 'Critical' ? 'badge-danger' : cat.risk === 'High' ? 'badge-warning' : 'badge-info'}`}>
                              {cat.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* LIVE TICKER BOTTOM BAR */}
      <div className="live-ticker-bar">
        <div className="ticker-title">
          <Activity size={14} /> Live Events Stream
        </div>
        <button 
          onClick={() => setTickerPaused(!tickerPaused)}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          title={tickerPaused ? "Resume Ticker" : "Pause Ticker"}
        >
          {tickerPaused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <div className="ticker-content">
          <div className="ticker-scroll" style={{ animationPlayState: tickerPaused ? 'paused' : 'running' }}>
            <span>⚡ [RECOVERED] TXN-90812 (Swiggy Express): ₹1,450 recovered via Attempt 1 (+30s)</span>
            <span>✓ [SUCCESS] TXN-90811 (Amazon India): ₹4,999 initial payment successful</span>
            <span>❌ [PERMANENT] TXN-90810 (Zomato Gold): Card Stolen hard decline</span>
            <span>⚡ [RECOVERED] TXN-90809 (MakeMyTrip): ₹12,500 recovered via Priority Retry</span>
            <span>⚡ [RECOVERED] TXN-90812 (Swiggy Express): ₹1,450 recovered via Attempt 1 (+30s)</span>
          </div>
        </div>
      </div>

      {/* MODAL 1: GLOBAL SEARCH COMMAND PALETTE (Cmd+K) */}
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} color="#3b82f6" />
                <span className="modal-title">Global Command Palette</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowSearchModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <input 
                type="text"
                autoFocus
                placeholder="Search transactions, payment modes, merchant categories..." 
                className="search-input"
                style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', marginBottom: '1rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>SEARCH RESULTS / QUICK JUMPS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                {recent_transactions
                  .filter(t => t.id.toLowerCase().includes(searchQuery.toLowerCase()) || t.merchant.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map(t => (
                    <div 
                      key={t.id}
                      onClick={() => { setSelectedTransaction(t); setShowSearchModal(false); }}
                      style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                    >
                      <div>
                        <strong style={{ color: '#3b82f6', fontSize: '0.85rem' }}>{t.id}</strong> — {t.merchant}
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.failure_reason}</div>
                      </div>
                      <span className={`badge ${t.status === 'Recovered' ? 'badge-info' : 'badge-success'}`}>{t.status}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NOTIFICATIONS DRAWER */}
      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="#f59e0b" />
                <span className="modal-title">System Alerts & Notifications</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowNotifications(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{unreadAlertsCount} unread alert(s)</span>
                <button onClick={markAllNotificationsRead} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all as read
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notificationsList.map(n => (
                  <div key={n.id} style={{ padding: '0.85rem', background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(59,130,246,0.08)', borderRadius: '10px', borderLeft: `4px solid ${n.severity === 'warning' ? '#f59e0b' : n.severity === 'success' ? '#10b981' : '#3b82f6'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{n.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{n.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EXPORT REPORT CENTER */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={18} color="#10b981" />
                <span className="modal-title">Export Power BI & SaaS Report</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowExportModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                Select export format and parameters for automated reporting.
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                <button 
                  onClick={() => setExportFormat('csv')}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: exportFormat === 'csv' ? 'rgba(59,130,246,0.2)' : '#1e293b', border: `1px solid ${exportFormat === 'csv' ? '#3b82f6' : 'var(--border-color)'}`, color: '#fff', cursor: 'pointer', textAlign: 'center' }}
                >
                  <strong style={{ display: 'block', fontSize: '0.85rem' }}>CSV Data Log</strong>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Raw transaction extract</span>
                </button>

                <button 
                  onClick={() => setExportFormat('pbix')}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: exportFormat === 'pbix' ? 'rgba(245,158,11,0.2)' : '#1e293b', border: `1px solid ${exportFormat === 'pbix' ? '#f59e0b' : 'var(--border-color)'}`, color: '#fff', cursor: 'pointer', textAlign: 'center' }}
                >
                  <strong style={{ display: 'block', fontSize: '0.85rem' }}>Power BI Template</strong>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PBIX schema model</span>
                </button>
              </div>

              {exportComplete ? (
                <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Report generated and downloaded successfully!</span>
                </div>
              ) : (
                <button 
                  onClick={handleExportDownload}
                  disabled={isExporting}
                  className="export-btn"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                >
                  {isExporting ? (
                    <span>Generating Report Bundle...</span>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Download {exportFormat.toUpperCase()} Report</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: TRANSACTION INSPECTOR */}
      {selectedTransaction && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedTransaction(null)} />
          <div className="drawer-panel">
            <div className="drawer-header">
              <div>
                <span className="badge badge-info" style={{ fontFamily: 'JetBrains Mono' }}>{selectedTransaction.id}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{selectedTransaction.merchant}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedTransaction(null)}><X size={18} /></button>
            </div>

            <div className="drawer-body">
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Amount</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>₹{selectedTransaction.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Status</span>
                    <div>
                      <span className={`badge ${selectedTransaction.status === 'Recovered' ? 'badge-info' : selectedTransaction.status === 'Successful' ? 'badge-success' : 'badge-danger'}`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Payment Mode</span>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{selectedTransaction.mode}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Location</span>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{selectedTransaction.location}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: '#cbd5e1' }}>Automated Retry Execution Timeline</h4>
                <div className="timeline-list">
                  <div className="timeline-item">
                    <div className="timeline-dot" style={{ background: '#f43f5e' }} />
                    <div className="timeline-content">
                      <strong style={{ fontSize: '0.82rem', color: '#f43f5e' }}>Initial Auth Failed</strong>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reason: {selectedTransaction.failure_reason}</p>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{selectedTransaction.timestamp}</span>
                    </div>
                  </div>

                  {selectedTransaction.retry_count > 0 && (
                    <div className="timeline-item">
                      <div className="timeline-dot" style={{ background: selectedTransaction.status === 'Recovered' ? '#10b981' : '#f59e0b' }} />
                      <div className="timeline-content">
                        <strong style={{ fontSize: '0.82rem', color: selectedTransaction.status === 'Recovered' ? '#10b981' : '#f59e0b' }}>
                          Retry Attempt #{selectedTransaction.retry_count}
                        </strong>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Rule Executed: {selectedTransaction.recovered_via}</p>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Final Status: {selectedTransaction.status}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
