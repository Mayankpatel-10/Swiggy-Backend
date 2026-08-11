import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, MapPin, User, ShieldAlert, Bike, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { activeAlerts } = useSocket();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-warm-dark text-white shadow-md border-b border-warm-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-warm-amber flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-warm-amber transition-colors">
                SWIGGY<span className="text-warm-amber">.</span>
              </span>
            </Link>

            {/* Location Indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-warm-beige/80 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-warm-amber" />
              <span className="font-medium text-white">Central City, Bangalore</span>
              <ChevronDown className="w-3 h-3 text-warm-beige/60" />
            </div>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-warm-muted" />
              <input
                type="text"
                placeholder="Search for restaurants, biryani, pizza..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white text-warm-dark rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-warm-amber"
              />
            </div>
          </form>

          {/* Right Navigation & Role Actions */}
          <div className="flex items-center gap-3">
            
            {/* Admin Shortcuts */}
            {user?.role === 'admin' && (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1"
                >
                  Admin Portal
                </Link>
                <Link
                  to="/admin/fraud"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-900/40 border border-rose-500/30 text-rose-200 hover:bg-rose-900/60 transition-colors flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Fraud Monitor
                </Link>
              </div>
            )}

            {/* Delivery Partner Shortcut */}
            {user?.role === 'delivery_partner' && (
              <Link
                to="/delivery/dashboard"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-warm-olive text-white hover:bg-warm-olive-light transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Bike className="w-3.5 h-3.5" />
                Delivery Dashboard
              </Link>
            )}

            {/* Notifications Icon */}
            {user && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-full text-warm-beige hover:text-white hover:bg-white/10 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {activeAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-warm-amber rounded-full animate-ping" />
                )}
              </Link>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-warm-amber hover:bg-warm-amber-hover text-white font-medium text-xs shadow-md transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-white text-warm-amber rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Auth Profile / Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-xs text-warm-beige hover:text-white font-medium px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <User className="w-4 h-4 text-warm-amber" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-warm-beige/70 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-full text-xs font-semibold border border-warm-beige/30 text-warm-beige hover:text-white hover:border-white transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
