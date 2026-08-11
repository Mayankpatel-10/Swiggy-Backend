import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

import LandingPage from './pages/LandingPage';
import RestaurantSearchPage from './pages/RestaurantSearchPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import DeliveryDashboardPage from './pages/DeliveryDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminFraudPage from './pages/AdminFraudPage';
import AdminSurgePage from './pages/AdminSurgePage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col bg-warm-bg text-warm-dark font-sans selection:bg-warm-amber selection:text-white">
              <Navbar />
              <CartDrawer />
              
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/restaurants" element={<RestaurantSearchPage />} />
                  <Route path="/restaurants/:restaurantId" element={<RestaurantDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders/:orderId/tracking" element={<OrderTrackingPage />} />
                  <Route path="/profile" element={<UserProfilePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/delivery/dashboard" element={<DeliveryDashboardPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/fraud" element={<AdminFraudPage />} />
                  <Route path="/admin/surge-settings" element={<AdminSurgePage />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
