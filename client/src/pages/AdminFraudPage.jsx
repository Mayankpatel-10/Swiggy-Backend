import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, UserX, UserCheck, AlertTriangle, CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import API from '../services/api';
import FraudScoreBadge from '../components/FraudScoreBadge';

export default function AdminFraudPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchFraudOrders();
  }, []);

  const fetchFraudOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/fraud/orders');
      if (res.data.success) {
        setLogs(res.data.data);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching fraud logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      const res = await API.post(`/admin/fraud/orders/${orderId}/approve`);
      if (res.data.success) {
        alert('Order approved successfully');
        fetchFraudOrders();
        setSelectedLog(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve order');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Reason for rejecting order:', 'Security policy violation');
    if (!reason) return;
    try {
      const res = await API.post(`/admin/fraud/orders/${orderId}/reject`, { reason });
      if (res.data.success) {
        alert('Order rejected and cancelled');
        fetchFraudOrders();
        setSelectedLog(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject order');
    }
  };

  const handleToggleUserRestrict = async (userId, isCurrentlyRestricted) => {
    try {
      const endpoint = isCurrentlyRestricted ? `/admin/users/${userId}/unrestrict` : `/admin/users/${userId}/restrict`;
      const res = await API.post(endpoint, { reason: 'Administrative security enforcement' });
      if (res.data.success) {
        alert(res.data.message);
        fetchFraudOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user restriction');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-warm-border pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-warm-amber" />
          <h1 className="text-3xl font-black text-warm-dark tracking-tight">Fraud Detection & Security Panel</h1>
        </div>
        <p className="text-xs text-warm-muted mt-1">
          Automated rule-based risk evaluation engine monitoring rapid ordering, cancellation abuse, and coupon manipulation.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-warm-card p-4 rounded-2xl border border-warm-border shadow-sm">
          <span className="text-[10px] font-bold text-warm-muted uppercase block">Total Flagged</span>
          <span className="text-xl font-black text-warm-dark">{stats.totalFlagged || 0}</span>
        </div>
        <div className="bg-warm-card p-4 rounded-2xl border border-warm-border shadow-sm border-l-4 border-l-rose-600">
          <span className="text-[10px] font-bold text-rose-700 uppercase block">Critical Risk (80+)</span>
          <span className="text-xl font-black text-rose-600">{stats.criticalCount || 0}</span>
        </div>
        <div className="bg-warm-card p-4 rounded-2xl border border-warm-border shadow-sm border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">High Risk (60+)</span>
          <span className="text-xl font-black text-amber-800">{stats.highCount || 0}</span>
        </div>
        <div className="bg-warm-card p-4 rounded-2xl border border-warm-border shadow-sm">
          <span className="text-[10px] font-bold text-warm-muted uppercase block">Medium Risk (30+)</span>
          <span className="text-xl font-black text-warm-dark">{stats.mediumCount || 0}</span>
        </div>
        <div className="bg-warm-card p-4 rounded-2xl border border-warm-border shadow-sm">
          <span className="text-[10px] font-bold text-warm-muted uppercase block">Suspended Users</span>
          <span className="text-xl font-black text-warm-dark">{stats.suspendedUsersCount || 0}</span>
        </div>
      </div>

      {/* Flagged Transactions Table */}
      <div className="bg-warm-card rounded-2xl border border-warm-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-warm-border bg-warm-bg flex items-center justify-between">
          <h3 className="font-bold text-sm text-warm-dark">Suspicious Order Logs</h3>
          <span className="text-xs text-warm-muted">{logs.length} transactions requiring admin audit</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-warm-muted">Analyzing fraud log repository...</div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-warm-beige/50 text-warm-dark font-extrabold border-b border-warm-border">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Flagged Reasons</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border/60">
                {logs.map((log) => {
                  const ord = log.order;
                  const usr = log.user || ord?.user;
                  if (!ord) return null;

                  return (
                    <tr key={log._id} className="hover:bg-warm-bg/50 transition-colors">
                      <td className="p-3 font-bold text-warm-dark">
                        #{ord._id.toString().slice(-6)}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-warm-dark">{usr?.name || 'User'}</div>
                        <div className="text-[10px] text-warm-muted">{usr?.email}</div>
                        {usr?.isRestricted && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-black bg-rose-900 text-white rounded">
                            SUSPENDED
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            log.riskLevel === 'CRITICAL'
                              ? 'bg-rose-900 text-warm-amber'
                              : log.riskLevel === 'HIGH'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {log.riskLevel}
                        </span>
                      </td>
                      <td className="p-3 font-black text-warm-dark">{log.riskScore}/100</td>
                      <td className="p-3 max-w-xs">
                        <ul className="list-disc list-inside text-[11px] text-warm-dark space-y-0.5">
                          {log.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            log.status === 'FLAGGED'
                              ? 'bg-amber-100 text-amber-900'
                              : log.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 rounded-lg bg-warm-bg hover:bg-warm-beige text-warm-dark"
                            title="Inspect Fraud Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {log.status === 'FLAGGED' && (
                            <>
                              <button
                                onClick={() => handleApproveOrder(ord._id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectOrder(ord._id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleToggleUserRestrict(usr._id || usr, usr?.isRestricted)}
                            className={`p-1.5 rounded-lg text-white ${
                              usr?.isRestricted ? 'bg-emerald-700' : 'bg-warm-dark hover:bg-black'
                            }`}
                            title={usr?.isRestricted ? 'Unrestrict User' : 'Restrict User Account'}
                          >
                            {usr?.isRestricted ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-warm-muted">No flagged suspicious orders.</div>
        )}
      </div>

      {/* Detailed Fraud Investigation Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-warm-card rounded-2xl border border-warm-border max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <h3 className="font-bold text-base text-warm-dark">Fraud Case File #{selectedLog.order?._id.slice(-6)}</h3>
              <button onClick={() => setSelectedLog(null)} className="text-xs font-bold text-warm-muted hover:text-warm-dark">
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <FraudScoreBadge score={selectedLog.riskScore} level={selectedLog.riskLevel} reasons={selectedLog.reasons} />

              <div className="p-3 bg-warm-bg rounded-xl border border-warm-border space-y-1">
                <span className="font-bold text-warm-dark block">User Account Profile:</span>
                <p>Name: {selectedLog.user?.name}</p>
                <p>Email: {selectedLog.user?.email}</p>
                <p>Past Cancellations: {selectedLog.user?.cancellationCount || 0}</p>
                <p>Past Refund Requests: {selectedLog.user?.refundCount || 0}</p>
              </div>

              <div className="p-3 bg-warm-bg rounded-xl border border-warm-border space-y-1">
                <span className="font-bold text-warm-dark block">Transaction Total:</span>
                <p>Subtotal: ₹{selectedLog.order?.subtotal}</p>
                <p>Coupon Used: {selectedLog.order?.couponCode || 'None'}</p>
                <p>Final Total Paid: ₹{selectedLog.order?.finalTotal}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-warm-border">
              <button
                onClick={() => handleApproveOrder(selectedLog.order._id)}
                className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                Approve & Clear Risk Flag
              </button>
              <button
                onClick={() => handleRejectOrder(selectedLog.order._id)}
                className="px-4 py-2 bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                Reject Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
