import React, { useState, useEffect } from 'react';
import { Bike, Power, MapPin, Phone, CheckCircle, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import API from '../services/api';

export default function DeliveryDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const profRes = await API.get('/delivery/profile');
      if (profRes.data.success) {
        setProfile(profRes.data.data);
      }

      const orderRes = await API.get('/delivery/orders');
      if (orderRes.data.success) {
        setOrders(orderRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching delivery partner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (newStatus) => {
    try {
      setStatusLoading(true);
      const res = await API.put('/delivery/set-status', { status: newStatus });
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set availability status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await API.post(`/delivery/orders/${orderId}/accept`);
      if (res.data.success) {
        fetchDeliveryData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order.');
    }
  };

  const handleDeclineOrder = async (orderId) => {
    if (!window.confirm('Decline this delivery assignment? It will be automatically reassigned to another available partner.')) return;
    try {
      const res = await API.post(`/delivery/orders/${orderId}/decline`);
      if (res.data.success) {
        alert(res.data.message);
        fetchDeliveryData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline order.');
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      const res = await API.put(`/orders/update-status/${orderId}`, { status: nextStatus });
      if (res.data.success) {
        fetchDeliveryData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-warm-muted">Loading delivery partner portal...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      
      {/* Driver Status Card */}
      <div className="bg-warm-dark text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-warm-amber text-white flex items-center justify-center shadow-lg">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg">{profile?.name || 'Delivery Partner'}</h1>
              <p className="text-xs text-warm-beige/70">⭐ {profile?.rating} Rating • {profile?.totalDeliveries} Completed Deliveries</p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 text-xs font-black rounded-full uppercase ${
                profile?.status === 'AVAILABLE'
                  ? 'bg-emerald-500 text-white'
                  : profile?.status === 'BUSY'
                  ? 'bg-warm-amber text-white'
                  : 'bg-gray-600 text-white'
              }`}
            >
              {profile?.status || 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Availability Toggle Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
          {['AVAILABLE', 'BUSY', 'OFFLINE'].map((st) => (
            <button
              key={st}
              disabled={statusLoading}
              onClick={() => handleToggleStatus(st)}
              className={`py-2 rounded-xl font-bold transition-all ${
                profile?.status === st
                  ? 'bg-white text-warm-dark shadow'
                  : 'bg-white/10 text-warm-beige hover:bg-white/20'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Assigned Deliveries List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-warm-dark">Active Assigned Orders</h2>
          <span className="text-xs font-bold text-warm-muted">{orders.length} orders</span>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord._id} className="bg-warm-card rounded-2xl p-5 border border-warm-border shadow-md space-y-4">
                
                <div className="flex items-center justify-between border-b border-warm-border pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-warm-dark">{ord.restaurant?.name}</h3>
                    <p className="text-xs text-warm-muted">Order #{ord._id.toString().slice(-6)}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-warm-amber/20 text-warm-amber border border-warm-amber/30">
                    {ord.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-warm-dark">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-warm-amber shrink-0 mt-0.5" />
                    <span><strong>Customer Address:</strong> {ord.deliveryAddress}</span>
                  </p>
                  <p className="text-warm-muted pl-5">Customer: {ord.user?.name} ({ord.user?.phone || 'No phone'})</p>
                </div>

                {/* Status Progression Actions */}
                <div className="pt-2 border-t border-warm-border flex flex-wrap items-center justify-between gap-2">
                  {ord.orderStatus === 'ORDER_PLACED' && (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleAcceptOrder(ord._id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Accept Delivery
                      </button>
                      <button
                        onClick={() => handleDeclineOrder(ord._id)}
                        className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  )}

                  {ord.orderStatus === 'RESTAURANT_ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'PREPARING')}
                      className="w-full py-2 bg-warm-dark text-white text-xs font-bold rounded-xl"
                    >
                      Start Food Preparation →
                    </button>
                  )}

                  {ord.orderStatus === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'READY_FOR_PICKUP')}
                      className="w-full py-2 bg-warm-olive text-white text-xs font-bold rounded-xl"
                    >
                      Mark Ready for Pickup →
                    </button>
                  )}

                  {ord.orderStatus === 'READY_FOR_PICKUP' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'OUT_FOR_DELIVERY')}
                      className="w-full py-2 bg-warm-amber text-white text-xs font-bold rounded-xl"
                    >
                      Picked Up & Out for Delivery 🛵 →
                    </button>
                  )}

                  {ord.orderStatus === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'DELIVERED')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md"
                    >
                      Mark Order as DELIVERED 🎉
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-warm-muted bg-warm-card rounded-2xl border border-warm-border p-6">
            No active delivery assignments. Toggle your status to <strong>AVAILABLE</strong> to receive orders.
          </div>
        )}
      </div>
    </div>
  );
}
