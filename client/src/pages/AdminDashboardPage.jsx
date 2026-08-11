import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldAlert, Zap, TrendingUp, ShoppingBag, Users, Store, Bike, DollarSign, ArrowUpRight } from 'lucide-react';
import API from '../services/api';

const COLORS = ['#59624A', '#D8893D', '#20201D', '#78805E', '#E9E1D3', '#E11D48'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/dashboard-stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-warm-muted">Loading enterprise admin dashboard...</div>;
  }

  const { overview = {}, charts = {} } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-warm-dark tracking-tight">System Admin Operations</h1>
          <p className="text-xs text-warm-muted">Platform performance, fraud prevention, & surge controls</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/fraud"
            className="px-4 py-2 rounded-xl bg-warm-dark text-warm-amber text-xs font-bold flex items-center gap-2 shadow-md hover:bg-black transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-warm-amber" />
            <span>Fraud Management Panel</span>
          </Link>

          <Link
            to="/admin/surge-settings"
            className="px-4 py-2 rounded-xl bg-warm-amber text-white text-xs font-bold flex items-center gap-2 shadow-md hover:bg-warm-amber-hover transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Surge Settings</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-warm-card p-5 rounded-2xl border border-warm-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-warm-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-warm-olive" />
          </div>
          <p className="text-2xl font-black text-warm-dark">₹{overview.totalRevenue || 0}</p>
          <span className="text-[10px] text-emerald-700 font-bold">↑ 12% vs last week</span>
        </div>

        <div className="bg-warm-card p-5 rounded-2xl border border-warm-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-warm-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-warm-amber" />
          </div>
          <p className="text-2xl font-black text-warm-dark">{overview.totalOrders || 0}</p>
          <span className="text-[10px] text-warm-muted">Lifetime transactions</span>
        </div>

        <div className="bg-warm-card p-5 rounded-2xl border border-warm-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-warm-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Suspicious Flagged</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600">{overview.suspiciousOrdersCount || 0}</p>
          <span className="text-[10px] text-rose-700 font-bold">Requires review</span>
        </div>

        <div className="bg-warm-card p-5 rounded-2xl border border-warm-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-warm-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Active Deliveries</span>
            <Bike className="w-4 h-4 text-warm-olive" />
          </div>
          <p className="text-2xl font-black text-warm-olive">{overview.activeDeliveries || 0}</p>
          <span className="text-[10px] text-warm-muted">In transit</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-warm-card rounded-2xl p-6 border border-warm-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-warm-dark flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-warm-amber" />
            <span>Daily Revenue & Orders Trend (7 Days)</span>
          </h3>

          <div className="h-64 w-full">
            {charts.dailyOrders && charts.dailyOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.dailyOrders}>
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#D8893D" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-20 text-center text-xs text-warm-muted">No daily transaction chart data yet</div>
            )}
          </div>
        </div>

        {/* Order Status Distribution Pie Chart */}
        <div className="bg-warm-card rounded-2xl p-6 border border-warm-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-warm-dark">Order Status Breakdown</h3>

          <div className="h-64 w-full flex items-center justify-center">
            {charts.statusDistribution && charts.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusDistribution}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {charts.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-warm-muted">No status data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
