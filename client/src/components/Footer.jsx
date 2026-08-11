import React from 'react';
import { ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-warm-dark text-warm-beige border-t border-warm-border/20 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warm-amber flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <span className="font-bold text-lg text-white tracking-tight">SWIGGY</span>
            </div>
            <p className="text-xs text-warm-beige/70 leading-relaxed">
              Production-grade food ordering system built with advanced fraud validation, dynamic surge pricing, and geo-smart partner assignment.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Customer Features</h4>
            <ul className="space-y-2 text-xs text-warm-beige/80">
              <li><a href="/restaurants" className="hover:text-warm-amber transition-colors">Restaurant Search</a></li>
              <li><a href="/restaurants?cuisine=Indian" className="hover:text-warm-amber transition-colors">North Indian Cuisine</a></li>
              <li><a href="/profile" className="hover:text-warm-amber transition-colors">Order Tracking</a></li>
              <li><a href="/notifications" className="hover:text-warm-amber transition-colors">Notifications</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Enterprise Portals</h4>
            <ul className="space-y-2 text-xs text-warm-beige/80">
              <li><a href="/admin" className="hover:text-warm-amber transition-colors">Admin Dashboard</a></li>
              <li><a href="/admin/fraud" className="hover:text-warm-amber transition-colors">Fraud Detection Panel</a></li>
              <li><a href="/admin/surge-settings" className="hover:text-warm-amber transition-colors">Surge Pricing Control</a></li>
              <li><a href="/delivery/dashboard" className="hover:text-warm-amber transition-colors">Delivery Partner Portal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Security & Compliance</h4>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2 text-xs text-warm-beige/80">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Fraud System Active</span>
              </div>
              <p className="text-[11px] text-warm-beige/60">
                Rule engine scoring orders 0–100 with automated risk flags & admin authorization.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-warm-beige/50">
          <p>© 2026 Swiggy Platform. Production Architecture & Security Review.</p>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <span>Crafted with precision food tech aesthetic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
