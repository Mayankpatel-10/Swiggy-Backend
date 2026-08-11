import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ShieldCheck, Zap, Tag, ArrowRight, AlertTriangle, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const passedCoupon = location.state?.appliedCouponCode || '';
  const surgeData = location.state?.surgeData || {
    baseDeliveryFee: 40,
    surgeMultiplier: 1.0,
    surgeFee: 0,
    finalDeliveryFee: 40,
    isSurgeActive: false,
  };

  const [address, setAddress] = useState({
    street: user?.addresses?.[0]?.street || '123 Green Avenue, Indiranagar',
    city: user?.addresses?.[0]?.city || 'Bangalore',
    state: 'Karnataka',
    zipCode: '560001',
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [couponCode, setCouponCode] = useState(passedCoupon);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-warm-dark">Your cart is empty</h2>
        <button
          onClick={() => navigate('/restaurants')}
          className="px-6 py-2.5 bg-warm-amber text-white font-bold text-xs rounded-xl shadow-md"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  const subtotal = cart.totalAmount || 0;
  const taxes = Math.round(subtotal * 0.05);

  let discount = 0;
  if (couponCode === 'WELCOME50') discount = Math.min(subtotal * 0.5, 150);
  else if (couponCode === 'SWIGGYIT') discount = Math.min(100, subtotal);
  else if (couponCode === 'HUNGRY20') discount = Math.min(subtotal * 0.2, 100);

  const deliveryFee = surgeData.finalDeliveryFee || 40;
  const finalTotal = Math.max(0, subtotal + taxes + deliveryFee - discount);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const fullAddressString = `${address.street}, ${address.city}, ${address.state} - ${address.zipCode}`;

      const formattedItems = cart.items.map((item) => ({
        menuItem: item.menuItem._id || item.menuItem,
        quantity: item.quantity,
        name: item.menuItem.name,
        price: item.menuItem.price,
      }));

      const res = await API.post('/orders/create', {
        restaurantId: cart.restaurant._id || cart.restaurant,
        items: formattedItems,
        deliveryAddress: fullAddressString,
        couponCode: couponCode || null,
        paymentMethod,
      });

      if (res.data.success) {
        const createdOrder = res.data.data;
        clearCart();

        // Redirect to real-time order tracking page
        navigate(`/orders/${createdOrder._id}/tracking`, {
          state: { isNewOrder: true, isSuspicious: createdOrder.isSuspicious },
        });
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-warm-dark tracking-tight">Checkout</h1>
        <p className="text-xs text-warm-muted">Review delivery address, surge breakdown, and payment details</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Steps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Delivery Address */}
          <div className="bg-warm-card rounded-2xl p-6 border border-warm-border shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-warm-border pb-3">
              <MapPin className="w-5 h-5 text-warm-amber" />
              <h3 className="font-bold text-sm text-warm-dark">1. Delivery Address</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-warm-dark block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-warm-bg border border-warm-border rounded-lg focus:ring-1 focus:ring-warm-amber"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-warm-dark block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-warm-bg border border-warm-border rounded-lg focus:ring-1 focus:ring-warm-amber"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-warm-dark block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-warm-bg border border-warm-border rounded-lg focus:ring-1 focus:ring-warm-amber"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-warm-dark block mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-warm-bg border border-warm-border rounded-lg focus:ring-1 focus:ring-warm-amber"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-warm-card rounded-2xl p-6 border border-warm-border shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-warm-border pb-3">
              <CreditCard className="w-5 h-5 text-warm-amber" />
              <h3 className="font-bold text-sm text-warm-dark">2. Payment Method</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'UPI', title: 'UPI Instant', desc: 'GPay / PhonePe / Paytm' },
                { id: 'CARD', title: 'Credit / Debit', desc: 'Visa / Mastercard' },
                { id: 'COD', title: 'Cash on Delivery', desc: 'Pay at Doorstep' },
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === pm.id
                      ? 'border-warm-amber bg-amber-50/60 ring-1 ring-warm-amber'
                      : 'border-warm-border bg-warm-bg hover:bg-warm-beige'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-warm-dark">{pm.title}</span>
                    {paymentMethod === pm.id && <Check className="w-3.5 h-3.5 text-warm-amber" />}
                  </div>
                  <span className="text-[10px] text-warm-muted">{pm.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-warm-card rounded-2xl p-6 border border-warm-border shadow-md space-y-4">
            <h3 className="font-bold text-sm text-warm-dark border-b border-warm-border pb-3">Order Summary</h3>

            {/* Restaurant */}
            {cart.restaurant && (
              <div className="text-xs text-warm-muted">
                <span className="font-bold text-warm-dark">{cart.restaurant.name}</span>
              </div>
            )}

            {/* Items */}
            <div className="space-y-2 text-xs border-b border-warm-border pb-3">
              {cart.items.map((item) => (
                <div key={item.menuItem._id || item.menuItem} className="flex justify-between">
                  <span className="text-warm-dark font-medium">
                    {item.menuItem.name} x {item.quantity}
                  </span>
                  <span className="font-bold text-warm-dark">₹{item.menuItem.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Surge Fee Notice */}
            {surgeData.isSurgeActive && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-warm-amber shrink-0" />
                <span>{surgeData.surgeMultiplier}x Peak Demand Surge Applied</span>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-warm-muted">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-warm-muted">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-warm-muted">
                <span>Taxes & GST (5%)</span>
                <span>₹{taxes}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-warm-border flex justify-between font-extrabold text-sm text-warm-dark">
                <span>Grand Total</span>
                <span className="text-warm-amber text-lg">₹{finalTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-warm-amber hover:bg-warm-amber-hover text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              <span>{submitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
