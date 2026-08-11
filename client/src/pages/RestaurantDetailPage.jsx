import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, MapPin, Search, ShoppingBag, Leaf, ChevronRight } from 'lucide-react';
import API from '../services/api';
import MenuItemCard from '../components/MenuItemCard';
import { useCart } from '../context/CartContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function RestaurantDetailPage() {
  const { restaurantId } = useParams();
  const { cart, itemCount, setIsCartOpen } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurantDetails();
  }, [restaurantId]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/restaurants/${restaurantId}`);
      if (res.data.success) {
        setRestaurant(res.data.data.restaurant);
        setMenuItems(res.data.data.menuItems);
      }
    } catch (err) {
      console.error('Error fetching restaurant detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-64 bg-warm-beige/80 rounded-3xl animate-pulse" />
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-warm-dark">Restaurant Not Found</h2>
      </div>
    );
  }

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(menuItems.map((m) => m.category || 'Main Course')))];

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Restaurant Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-warm-border shadow-md bg-warm-card">
        <div className="h-48 sm:h-64 w-full bg-warm-dark relative">
          <img
            src={restaurant.coverImage || restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-warm-dark via-warm-dark/40 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 space-y-3 relative -mt-16 z-10 bg-warm-card/90 backdrop-blur-md rounded-2xl mx-4 sm:mx-8 border border-warm-border shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-warm-dark">{restaurant.name}</h1>
                {restaurant.isVegetarian && (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-700 text-white rounded-full flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> PURE VEG
                  </span>
                )}
              </div>
              <p className="text-xs text-warm-muted mt-1">{restaurant.cuisine.join(', ')}</p>
              <p className="text-xs text-warm-muted/80 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-warm-amber" /> {restaurant.address}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-warm-bg p-3 rounded-xl border border-warm-border shrink-0">
              <div className="text-center px-2">
                <div className="flex items-center gap-1 text-warm-olive font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-current text-warm-amber" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-warm-muted">{restaurant.numRatings}+ ratings</span>
              </div>

              <div className="w-px h-8 bg-warm-border" />

              <div className="text-center px-2">
                <div className="flex items-center gap-1 text-warm-dark font-extrabold text-sm">
                  <Clock className="w-4 h-4 text-warm-amber" />
                  <span>{restaurant.deliveryTime} mins</span>
                </div>
                <span className="text-[10px] text-warm-muted">Delivery Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-warm-border pb-4">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-warm-dark text-white shadow-sm'
                  : 'bg-warm-card border border-warm-border text-warm-dark hover:bg-warm-beige'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Filter Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-warm-muted" />
          <input
            type="text"
            placeholder="Search in menu..."
            value={menuSearchQuery}
            onChange={(e) => setMenuSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-warm-card border border-warm-border rounded-xl focus:outline-none focus:ring-1 focus:ring-warm-amber"
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Menu Items List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item) => (
              <MenuItemCard key={item._id} item={item} restaurantId={restaurant._id} />
            ))
          ) : (
            <div className="py-16 text-center bg-warm-card rounded-2xl border border-warm-border p-6">
              <p className="text-sm font-bold text-warm-dark">No menu items match your search</p>
            </div>
          )}
        </div>

        {/* Sticky Desktop Cart Widget */}
        <div className="hidden lg:block sticky top-24 bg-warm-card rounded-2xl p-6 border border-warm-border shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <h3 className="font-bold text-sm text-warm-dark">Cart Summary</h3>
            <span className="text-xs font-bold text-warm-amber">{itemCount} items</span>
          </div>

          {cart.items && cart.items.length > 0 ? (
            <div className="space-y-3">
              {cart.items.map((ci) => (
                <div key={ci.menuItem._id || ci.menuItem} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-warm-dark line-clamp-1">{ci.menuItem.name}</span>
                  <span className="font-bold text-warm-dark shrink-0">x{ci.quantity}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-warm-border flex justify-between font-extrabold text-sm text-warm-dark">
                <span>Subtotal</span>
                <span className="text-warm-amber">₹{cart.totalAmount}</span>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full py-2.5 bg-warm-amber hover:bg-warm-amber-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Full Cart & Checkout</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-warm-muted">
              Add items from the menu to start your order
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
