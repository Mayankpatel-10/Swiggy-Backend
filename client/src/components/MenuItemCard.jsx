import React from 'react';
import { Plus, Minus, Star, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MenuItemCard({ item, restaurantId }) {
  const { cart, addToCart, updateQuantity } = useCart();

  if (!item) return null;

  const { _id, name, description, price, category, isVeg, isBestSeller, image } = item;

  // Find quantity in cart
  const cartItem = cart.items?.find((ci) => ci.menuItem && (ci.menuItem._id === _id || ci.menuItem === _id));
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(restaurantId, _id, 1);
  };

  const handleIncrement = () => {
    updateQuantity(_id, quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(_id, quantity - 1);
  };

  return (
    <div className="bg-warm-card rounded-2xl p-4 border border-warm-border/80 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-4">
      
      {/* Details */}
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          {/* Veg / Non-Veg Indicator */}
          <div className={`w-4 h-4 rounded border flex items-center justify-center p-0.5 ${isVeg ? 'border-emerald-600' : 'border-rose-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
          </div>

          {isBestSeller && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 text-warm-amber fill-current" /> Bestseller
            </span>
          )}
        </div>

        <h4 className="font-bold text-sm text-warm-dark">{name}</h4>
        
        <p className="font-extrabold text-sm text-warm-dark">
          ₹{price}
        </p>

        {description && (
          <p className="text-xs text-warm-muted line-clamp-2 leading-relaxed pt-1">
            {description}
          </p>
        )}
      </div>

      {/* Image & Action Stepper */}
      <div className="relative flex flex-col items-center shrink-0 w-28">
        <div className="w-24 h-24 rounded-xl bg-warm-beige overflow-hidden border border-warm-border">
          <img
            src={image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Stepper Button Overlay */}
        <div className="absolute -bottom-3 bg-white border border-warm-border rounded-xl shadow-md overflow-hidden flex items-center">
          {quantity > 0 ? (
            <div className="flex items-center px-2 py-1 gap-2 text-xs font-bold text-warm-dark">
              <button
                onClick={handleDecrement}
                className="p-1 text-warm-dark hover:text-warm-amber transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="min-w-[16px] text-center text-warm-amber font-extrabold">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="p-1 text-warm-dark hover:text-warm-amber transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="px-4 py-1.5 text-xs font-bold text-warm-olive hover:bg-warm-olive hover:text-white transition-colors flex items-center gap-1"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
