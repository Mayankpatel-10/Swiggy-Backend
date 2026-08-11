import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Package, Bike, MapPin, Clock, ShieldAlert, Phone, RotateCcw, AlertTriangle } from 'lucide-react';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';
import OrderTimeline from '../components/OrderTimeline';
import FraudScoreBadge from '../components/FraudScoreBadge';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, joinOrderRoom } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    joinOrderRoom(orderId);
  }, [orderId]);

  useEffect(() => {
    if (socket) {
      socket.on('order:status_updated', (updatedOrder) => {
        if (updatedOrder._id === orderId) {
          setOrder(updatedOrder);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('order:status_updated');
      }
    };
  }, [socket, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      const res = await API.post(`/orders/cancel/${orderId}`, {
        cancellationReason: 'Cancelled by customer via order tracking dashboard',
      });
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-warm-amber border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-warm-muted">Connecting to real-time order tracking server...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-warm-dark">Order Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-warm-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-warm-amber" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Order #{order._id.toString().slice(-6)}
              </h1>
            </div>
            <p className="text-xs text-warm-beige/70 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-warm-amber text-white shadow-sm">
              {order.orderStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Real-time Order Stepper */}
        <OrderTimeline currentStatus={order.orderStatus} timeline={order.timeline} />
      </div>

      {/* Fraud Security Warning (If Flagged) */}
      {order.isSuspicious && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-bold text-warm-amber text-sm">
            <ShieldAlert className="w-5 h-5" />
            <span>Fraud Risk Verification Pending ({order.riskLevel} Risk - Score: {order.riskScore}/100)</span>
          </div>
          <p className="text-amber-900/80">
            This transaction was flagged by our security engine due to: <strong>{order.fraudReasons.join(', ')}</strong>. An administrator is reviewing this order.
          </p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Delivery Partner & Restaurant Info */}
        <div className="space-y-6">
          
          {/* Delivery Partner Assigned Box */}
          <div className="bg-warm-card rounded-2xl p-6 border border-warm-border shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-warm-muted">Delivery Partner</h3>
            {order.assignedDeliveryPartner ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warm-amber/20 flex items-center justify-center text-warm-amber font-bold">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-warm-dark">{order.assignedDeliveryPartner.name}</h4>
                    <p className="text-xs text-warm-muted">⭐ {order.assignedDeliveryPartner.rating} Delivery Rating</p>
                  </div>
                </div>
                <a
                  href={`tel:${order.assignedDeliveryPartner.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-warm-olive text-white text-xs font-bold flex items-center gap-1 hover:bg-warm-dark transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
              </div>
            ) : (
              <p className="text-xs text-warm-muted italic">Smart partner assignment in progress...</p>
            )}
          </div>

          {/* Restaurant & Delivery Address */}
          <div className="bg-warm-card rounded-2xl p-6 border border-warm-border shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-warm-muted">Delivery Location</h3>
            <p className="text-xs text-warm-dark font-medium leading-relaxed">
              📍 {order.deliveryAddress}
            </p>
          </div>
        </div>

        {/* Right Column: Items & Price Breakdown */}
        <div className="bg-warm-card rounded-2xl p-6 border border-warm-border shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-warm-dark border-b border-warm-border pb-3">Items Ordered</h3>

          <div className="space-y-2 text-xs border-b border-warm-border pb-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-warm-dark font-medium">
                  {item.name} x {item.quantity}
                </span>
                <span className="font-bold text-warm-dark">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs text-warm-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-warm-dark">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee ({order.surgeFee > 0 ? 'Surge' : 'Standard'})</span>
              <span className="font-semibold text-warm-dark">₹{order.deliveryFee + order.surgeFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & GST</span>
              <span className="font-semibold text-warm-dark">₹{order.taxes}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount ({order.couponCode})</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-warm-border flex justify-between font-extrabold text-sm text-warm-dark">
              <span>Paid Total</span>
              <span className="text-warm-amber text-base">₹{order.finalTotal}</span>
            </div>
          </div>

          {!['DELIVERED', 'CANCELLED', 'OUT_FOR_DELIVERY'].includes(order.orderStatus) && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors mt-4"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
