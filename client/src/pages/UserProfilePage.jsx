import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Calendar, ShieldCheck, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function UserProfilePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders/history');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <p className="text-sm font-bold text-warm-dark">Please sign in to view your profile and order history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Account Info Header */}
      <div className="bg-warm-card rounded-3xl p-6 sm:p-8 border border-warm-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-warm-amber text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-warm-dark">{user.name}</h1>
            <p className="text-xs text-warm-muted">{user.email} • {user.phone || 'No phone'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-warm-beige text-warm-dark">
              Role: {user.role}
            </span>
          </div>
        </div>

        {/* Security / Restriction Status */}
        {user.isRestricted ? (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold block">Account Restricted</span>
              <p className="text-[10px]">Under security review by system admin.</p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Account Status: Active & Verified</span>
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-warm-dark tracking-tight">Order History</h2>
          <span className="text-xs font-semibold text-warm-muted">{orders.length} total orders</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-warm-muted">Loading your past orders...</div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-warm-card rounded-2xl p-5 border border-warm-border shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-warm-dark">
                      {ord.restaurant?.name || 'Restaurant'}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-warm-bg border border-warm-border text-warm-dark">
                      #{ord._id.toString().slice(-6)}
                    </span>
                  </div>

                  <p className="text-xs text-warm-muted">
                    {ord.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                  </p>

                  <p className="text-[11px] text-warm-muted/80 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(ord.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-warm-border/60">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-warm-amber block">₹{ord.finalTotal}</span>
                    <span className="text-[10px] font-bold text-warm-olive">{ord.orderStatus.replace(/_/g, ' ')}</span>
                  </div>

                  <Link
                    to={`/orders/${ord._id}/tracking`}
                    className="px-3.5 py-1.5 bg-warm-dark hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-warm-card rounded-2xl border border-warm-border p-8 space-y-3">
            <Package className="w-10 h-10 text-warm-muted mx-auto" />
            <h3 className="font-bold text-base text-warm-dark">No past orders yet</h3>
            <Link
              to="/restaurants"
              className="inline-block px-4 py-2 bg-warm-amber text-white text-xs font-bold rounded-xl"
            >
              Order Food Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
