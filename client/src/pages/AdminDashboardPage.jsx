import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ShieldAlert, Zap, TrendingUp, ShoppingBag, Users, Store, Bike, DollarSign, Activity, Plus, RefreshCw, X, Check } from 'lucide-react';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';

const COLORS = ['#59624A', '#D8893D', '#20201D', '#78805E', '#E9E1D3', '#E11D48'];

export default function AdminDashboardPage() {
  const { activeAlerts } = useSocket();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddRestOpen, setIsAddRestOpen] = useState(false);
  const [restForm, setRestForm] = useState({
    name: '',
    cuisine: 'North Indian',
    deliveryTime: 25,
    address: 'Bangalore, Central City',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  });
  const [restMsg, setRestMsg] = useState('');

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

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setRestMsg('');
    try {
      const res = await API.post('/restaurants/create', {
        ...restForm,
        cuisine: [restForm.cuisine],
      });
      if (res.data.success) {
        setRestMsg('Restaurant created successfully!');
        setRestForm({
          name: '',
          cuisine: 'North Indian',
          deliveryTime: 25,
          address: 'Bangalore, Central City',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        });
        setTimeout(() => {
          setIsAddRestOpen(false);
          fetchDashboardStats();
        }, 1200);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create restaurant');
    }
  };

  if (loading && !stats) {
    return <div className="py-20 text-center text-xs text-warm-muted">Loading enterprise admin dashboard...</div>;
  }

  const { overview = {}, charts = {} } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Platform Health Status Indicator Bar */}
      <div className="bg-warm-dark text-white rounded-2xl p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-lg border border-warm-dark/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>WebSockets Gateway Active</span>
          </div>
          <span className="text-white/30 hidden md:inline">|</span>
          <div className="flex items-center gap-1.5 text-warm-beige/80">
            <Activity className="w-3.5 h-3.5 text-warm-amber" />
            <span>MongoDB Database Connected (Atlas)</span>
          </div>
          <span className="text-white/30 hidden md:inline">|</span>
          <div className="flex items-center gap-1.5 text-warm-beige/80">
            <ShieldAlert className="w-3.5 h-3.5 text-warm-amber" />
            <span>Rule Engine Armed (0-100 Risk)</span>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          className="self-start md:self-auto px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1.5 font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Real-Time Sync</span>
        </button>
      </div>

      {/* Executive Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-warm-dark tracking-tight">Enterprise Control Center</h1>
          <p className="text-xs text-warm-muted">Real-time platform operations, fraud review, & dynamic pricing dashboard</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddRestOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-warm-olive text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-warm-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Restaurant</span>
          </button>

          <Link
            to="/admin/fraud"
            className="px-3.5 py-2 rounded-xl bg-warm-dark text-warm-amber text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-black transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-warm-amber" />
            <span>Fraud Panel ({overview.suspiciousOrdersCount || 0})</span>
          </Link>

          <Link
            to="/admin/surge-settings"
            className="px-3.5 py-2 rounded-xl bg-warm-amber text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-warm-amber-hover transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Surge Settings</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-warm-card p-5 rounded-2xl border border-warm-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-warm-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-warm-olive" />
          </div>
          <p className="text-2xl font-black text-warm-dark">₹{overview.totalRevenue || 0}</p>
          <span className="text-[10px] text-emerald-700 font-bold block">↑ 14.8% growth rate</span>
        </div>

        <div className="bg-warm-card p-5 rounded-2xl border border-warm-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-warm-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-warm-amber" />
          </div>
          <p className="text-2xl font-black text-warm-dark">{overview.totalOrders || 0}</p>
          <span className="text-[10px] text-warm-muted block">Lifetime transactions</span>
        </div>

        <div className="bg-warm-card p-5 rounded-2xl border border-warm-border shadow-sm space-y-2 border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between text-warm-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Flagged Suspicious</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600">{overview.suspiciousOrdersCount || 0}</p>
          <span className="text-[10px] text-rose-700 font-bold block">Requires Admin Audit</span>
        </div>

        <div className="bg-warm-card p-5 rounded-2xl border border-warm-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-warm-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Deliveries</span>
            <Bike className="w-4 h-4 text-warm-olive" />
          </div>
          <p className="text-2xl font-black text-warm-olive">{overview.activeDeliveries || 0}</p>
          <span className="text-[10px] text-warm-muted block">In Transit</span>
        </div>

        <div className="bg-warm-card p-5 rounded-2xl border border-warm-border shadow-sm space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-warm-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-warm-dark" />
          </div>
          <p className="text-2xl font-black text-warm-dark">{overview.totalUsers || 0}</p>
          <span className="text-[10px] text-warm-muted block">Customers & Drivers</span>
        </div>
      </div>

      {/* Analytics Charts & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Revenue Area Chart */}
        <div className="lg:col-span-2 bg-warm-card rounded-2xl p-6 border border-warm-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-warm-dark flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-warm-amber" />
              <span>Revenue & Transaction Volume Trend (7 Days)</span>
            </h3>
            <span className="text-xs text-warm-muted font-medium">Recharts Analytics</span>
          </div>

          <div className="h-64 w-full">
            {charts.dailyOrders && charts.dailyOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.dailyOrders}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D8893D" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#D8893D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#D8893D" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-20 text-center text-xs text-warm-muted">No transaction chart data yet</div>
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
                    outerRadius={75}
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

      {/* Add Restaurant Modal */}
      {isAddRestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-warm-card rounded-2xl border border-warm-border max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <h3 className="font-bold text-base text-warm-dark">Add New Partner Restaurant</h3>
              <button onClick={() => setIsAddRestOpen(false)} className="p-1 text-warm-muted hover:text-warm-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            {restMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{restMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateRestaurant} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-warm-dark block mb-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Curry House"
                  value={restForm.name}
                  onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-bg border border-warm-border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-warm-dark block mb-1">Primary Cuisine</label>
                <select
                  value={restForm.cuisine}
                  onChange={(e) => setRestForm({ ...restForm, cuisine: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-bg border border-warm-border rounded-lg"
                >
                  <option value="North Indian">North Indian</option>
                  <option value="Biryani">Biryani</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Italian">Italian</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Punjabi">Punjabi</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-warm-dark block mb-1">Est. Delivery Time (Mins)</label>
                <input
                  type="number"
                  required
                  value={restForm.deliveryTime}
                  onChange={(e) => setRestForm({ ...restForm, deliveryTime: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-warm-bg border border-warm-border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-warm-dark block mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={restForm.address}
                  onChange={(e) => setRestForm({ ...restForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-warm-bg border border-warm-border rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRestOpen(false)}
                  className="px-4 py-2 bg-warm-bg border border-warm-border text-warm-dark text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-warm-amber hover:bg-warm-amber-hover text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Add Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
