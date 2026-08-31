import React, { useState } from 'react';
import { analyticsData } from './data/analyticsData';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { 
  Activity, ArrowUpRight, CheckCircle2, XCircle, RefreshCw, DollarSign, 
  PieChart as PieIcon, ShieldAlert, Zap, TrendingUp, Filter, FileCode, Layers
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { overall, by_payment_mode, by_location_type, by_merchant_category, retry_attempts, retry_summary } = analyticsData;

  // Filtered payment mode data
  const filteredModeData = selectedMode === 'All' 
    ? by_payment_mode 
    : by_payment_mode.filter(m => m.payment_mode === selectedMode);

  // Colors
  const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4'];

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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header>
        <div className="logo-section">
          <div className="logo-icon">
            <Zap className="w-6 h-6 text-white" size={24} />
          </div>
          <div className="logo-text">
            <h1>PAYMENT RETRY ANALYTICS</h1>
            <p>Payment Friction & Revenue Recovery Platform • Member 2 BI</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={16} /> Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'failures' ? 'active' : ''}`}
            onClick={() => setActiveTab('failures')}
          >
            <ShieldAlert size={16} /> Failure Analysis
          </button>
          <button 
            className={`tab-button ${activeTab === 'retries' ? 'active' : ''}`}
            onClick={() => setActiveTab('retries')}
          >
            <RefreshCw size={16} /> Retry Analysis
          </button>
          <button 
            className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            <DollarSign size={16} /> Revenue Analysis
          </button>
        </div>
      </header>

      {/* Slicers & Filters Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
          <Filter size={16} /> Dashboard Slicers:
        </div>
        
        <select 
          value={selectedMode} 
          onChange={(e) => setSelectedMode(e.target.value)}
          style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          <option value="All">All Payment Modes</option>
          <option value="Online">Online</option>
          <option value="QR">QR Code</option>
          <option value="Contact">Contact</option>
          <option value="AutoPay">AutoPay</option>
        </select>

        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          <option value="All">All Merchant Categories</option>
          {by_merchant_category.map(c => (
            <option key={c.merchant_category} value={c.merchant_category}>{c.merchant_category}</option>
          ))}
        </select>
      </div>

      {/* PAGE 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Total Transactions</span>
                <div className="kpi-icon" style={{ color: '#3b82f6' }}><Activity size={18} /></div>
              </div>
              <div className="kpi-value">{overall.total_transactions}</div>
              <div className="kpi-subtext">Total Processed Volume</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Initial Success Rate</span>
                <div className="kpi-icon" style={{ color: '#10b981' }}><CheckCircle2 size={18} /></div>
              </div>
              <div className="kpi-value">{100 - overall.failure_rate_pct}%</div>
              <div className="kpi-subtext">250 Seamless Payments</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Initial Failure Rate</span>
                <div className="kpi-icon" style={{ color: '#f43f5e' }}><XCircle size={18} /></div>
              </div>
              <div className="kpi-value">{overall.failure_rate_pct}%</div>
              <div className="kpi-subtext">250 Failed Attempts (₹624.0K)</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Revenue Recovered</span>
                <div className="kpi-icon" style={{ color: '#10b981' }}><TrendingUp size={18} /></div>
              </div>
              <div className="kpi-value" style={{ color: '#10b981' }}>₹{overall.revenue_recovered_inr.toLocaleString()}</div>
              <div className="kpi-subtext">41.78% Recovery of Failed Rev</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card col-6">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Payment Outcome Distribution</div>
                  <div className="chart-subtitle">Initial 50/50 Transaction Split</div>
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
                  <div className="chart-subtitle">Contact (55.8%) & QR (50.0%) Lead Friction</div>
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
              <div className="kpi-subtext">62.0% of Failures (₹396.4K)</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Permanent Declines</span>
                <div className="kpi-icon" style={{ color: '#f43f5e' }}><XCircle size={18} /></div>
              </div>
              <div className="kpi-value" style={{ color: '#f43f5e' }}>{retry_summary.permanent_failures} txns</div>
              <div className="kpi-subtext">38.0% of Failures (₹227.6K)</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Top Friction Location</span>
                <div className="kpi-icon" style={{ color: '#f59e0b' }}><ShieldAlert size={18} /></div>
              </div>
              <div className="kpi-value">Rural (54.3%)</div>
              <div className="kpi-subtext">₹240.2K Failed Revenue</div>
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
                  <div className="chart-subtitle">Rural vs Urban vs Semi-Urban</div>
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
        </>
      )}

      {/* PAGE 3: RETRY ANALYSIS */}
      {activeTab === 'retries' && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Total Retry Attempts</span>
                <div className="kpi-icon" style={{ color: '#3b82f6' }}><RefreshCw size={18} /></div>
              </div>
              <div className="kpi-value">{retry_summary.total_retry_attempts}</div>
              <div className="kpi-subtext">Across 155 Temporary Failures</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Successful Retries</span>
                <div className="kpi-icon" style={{ color: '#10b981' }}><CheckCircle2 size={18} /></div>
              </div>
              <div className="kpi-value" style={{ color: '#10b981' }}>{retry_summary.total_successful_retries}</div>
              <div className="kpi-subtext">65.81% Temporary Recovery Rate</div>
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
                  <div className="chart-subtitle">Attempt 1 (45.2%) $\rightarrow$ Attempt 2 (28.2%) $\rightarrow$ Attempt 3 (13.1%)</div>
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
                  <div className="chart-subtitle">Attempt 1 Recovers ₹178.9K</div>
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
        </>
      )}

      {/* PAGE 4: REVENUE ANALYSIS */}
      {activeTab === 'revenue' && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Total Failed Revenue</span>
                <div className="kpi-icon" style={{ color: '#f43f5e' }}><DollarSign size={18} /></div>
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
              <div className="kpi-subtext">41.78% Recovery Rate</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Permanently Lost Revenue</span>
                <div className="kpi-icon" style={{ color: '#f43f5e' }}><XCircle size={18} /></div>
              </div>
              <div className="kpi-value" style={{ color: '#f43f5e' }}>₹{overall.permanently_lost_revenue_inr.toLocaleString()}</div>
              <div className="kpi-subtext">28.79% Permanent Loss</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Final Realized Revenue</span>
                <div className="kpi-icon" style={{ color: '#3b82f6' }}><Zap size={18} /></div>
              </div>
              <div className="kpi-value" style={{ color: '#3b82f6' }}>₹{overall.final_net_realized_revenue_inr.toLocaleString()}</div>
              <div className="kpi-subtext">71.21% Net Realization Rate</div>
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
        </>
      )}

      {/* Summary Table */}
      <div className="chart-card col-12" style={{ marginTop: '1.5rem' }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">Merchant Category Friction & Revenue Risk Matrix</div>
            <div className="chart-subtitle">Sorted by Failed Revenue Exposure</div>
          </div>
        </div>
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
  );
}
