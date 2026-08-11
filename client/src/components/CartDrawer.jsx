import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Tag, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import API from '../services/api';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, clearCart } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const [surgeData, setSurgeData] = useState({
    baseDeliveryFee: 40,
    surgeMultiplier: 1.0,
    surgeFee: 0,
    finalDeliveryFee: 40,
    isSurgeActive: false,
    peakNotice: '',
  });

  useEffect(() => {
    if (isCartOpen) {
      fetchSurgeFee();
    }
  }, [isCartOpen]);

  const fetchSurgeFee = async () => {
    try {
      const res = await API.post('/orders/calculate-delivery-fee');
      if (res.data.success) {
        setSurgeData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching surge fee:', err);
    }
  };

  if (!isCartOpen) return null;

  const subtotal = cart.totalAmount || 0;
  const taxes = Math.round(subtotal * 0.05);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discount = Math.min((subtotal * appliedCoupon.val) / 100, 150);
    } else {
      discount = Math.min(appliedCoupon.val, subtotal);
    }
  }

  const deliveryFee = surgeData.finalDeliveryFee || 40;
  const finalTotal = Math.max(0, subtotal + taxes + deliveryFee - discount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'WELCOME50') {
      setAppliedCoupon({ code: 'WELCOME50', type: 'PERCENTAGE', val: 50 });
    } else if (code === 'SWIGGYIT') {
      setAppliedCoupon({ code: 'SWIGGYIT', type: 'FLAT', val: 100 });
    } else if (code === 'HUNGRY20') {
      setAppliedCoupon({ code: 'HUNGRY20', type: 'PERCENTAGE', val: 20 });
    } else {
      setCouponError('Invalid coupon code. Try WELCOME50 or SWIGGYIT.');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout', {
      state: {
        appliedCouponCode: appliedCoupon ? appliedCoupon.code : '',
        surgeData,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-warm-card border-l border-warm-border shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="bg-warm-dark text-white p-5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-warm-amber" />
              <h2 className="font-bold text-lg">Your Cart</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-warm-beige hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {cart.items && cart.items.length > 0 ? (
              <>
                {/* Restaurant Info */}
                {cart.restaurant && (
                  <div className="p-3 bg-warm-bg rounded-xl border border-warm-border flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-warm-dark">{cart.restaurant.name}</h4>
                      <p className="text-xs text-warm-muted">{cart.restaurant.address}</p>
                    </div>
                    <button
                      onClick={clearCart}
                      className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>
                )}

                {/* Item List */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.menuItem._id || item.menuItem}
                      className="flex items-center justify-between gap-3 p-3 bg-warm-bg/50 rounded-xl border border-warm-border/60"
                    >
                      <div className="flex-1">
                        <h5 className="font-semibold text-xs text-warm-dark">{item.menuItem.name || 'Item'}</h5>
                        <p className="text-xs text-warm-muted font-bold">₹{item.menuItem.price}</p>
                      </div>

                      <div className="flex items-center gap-2 bg-white border border-warm-border rounded-lg px-2 py-1 text-xs font-bold">
                        <button
                          onClick={() => updateQuantity(item.menuItem._id || item.menuItem, item.quantity - 1)}
                          className="hover:text-warm-amber"
                        >
                          -
                        </button>
                        <span className="text-warm-amber font-extrabold px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItem._id || item.menuItem, item.quantity + 1)}
                          className="hover:text-warm-amber"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Application Box */}
                <div className="p-4 bg-warm-beige/40 rounded-xl border border-warm-border space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-warm-dark">
                    <Tag className="w-4 h-4 text-warm-amber" />
                    <span>Apply Coupon Code</span>
                  </div>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME50, SWIGGYIT"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-warm-border rounded-lg uppercase font-semibold focus:outline-none focus:ring-1 focus:ring-warm-amber"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-bold bg-warm-dark text-white rounded-lg hover:bg-black transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                  {appliedCoupon && (
                    <div className="text-xs text-emerald-700 font-semibold flex items-center justify-between">
                      <span>✓ Code '{appliedCoupon.code}' applied!</span>
                      <button onClick={() => setAppliedCoupon(null)} className="text-rose-600 underline">
                        Remove
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-xs text-rose-600">{couponError}</p>}
                </div>

                {/* Dynamic Surge Pricing Notice */}
                {surgeData.isSurgeActive && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                    <Zap className="w-4 h-4 text-warm-amber shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-warm-amber block">
                        ⚡ {surgeData.surgeMultiplier}x Surge Pricing Active
                      </span>
                      <p className="text-[11px] text-amber-800/90 mt-0.5">{surgeData.peakNotice}</p>
                    </div>
                  </div>
                )}

                {/* Bill Breakdown */}
                <div className="p-4 bg-warm-bg rounded-xl border border-warm-border space-y-2 text-xs">
                  <h4 className="font-bold text-warm-dark mb-2">Bill Details</h4>

                  <div className="flex justify-between text-warm-muted">
                    <span>Item Total</span>
                    <span className="font-semibold text-warm-dark">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-warm-muted">
                    <span>Delivery Fee ({surgeData.isSurgeActive ? `${surgeData.surgeMultiplier}x Surge` : 'Standard'})</span>
                    <span className="font-semibold text-warm-dark">₹{deliveryFee}</span>
                  </div>

                  <div className="flex justify-between text-warm-muted">
                    <span>GST & Restaurant Charges (5%)</span>
                    <span className="font-semibold text-warm-dark">₹{taxes}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Coupon Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-warm-border/80 flex justify-between font-extrabold text-sm text-warm-dark">
                    <span>To Pay</span>
                    <span className="text-warm-amber text-base">₹{finalTotal}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-warm-muted mx-auto" />
                <h3 className="font-bold text-base text-warm-dark">Your cart is empty</h3>
                <p className="text-xs text-warm-muted max-w-xs mx-auto">
                  Explore top restaurants in Central City and add your favorite dishes!
                </p>
              </div>
            )}
          </div>

          {/* Drawer Footer Checkout Button */}
          {cart.items && cart.items.length > 0 && (
            <div className="p-5 bg-warm-card border-t border-warm-border shadow-lg">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 bg-warm-amber hover:bg-warm-amber-hover text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
