import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password, formData.role, formData.phone);
      } else {
        await login(formData.email, formData.password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (email, password) => {
    setFormData((prev) => ({ ...prev, email, password }));
    setIsRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-warm-card rounded-2xl shadow-2xl border border-warm-border overflow-hidden">
        {/* Header */}
        <div className="bg-warm-dark text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {isRegister ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-warm-beige/80 mt-1">
              Sign in to manage food orders, fraud tools, & delivery operations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-warm-beige hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Credentials Quick Fill Banner */}
        <div className="bg-warm-beige/50 border-b border-warm-border p-3 px-6 text-xs text-warm-dark">
          <div className="flex items-center gap-1.5 font-semibold text-warm-amber mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Evaluation Demo Accounts (Click to Fill):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@example.com', 'admin123')}
              className="px-2.5 py-1 rounded bg-warm-dark text-white hover:bg-black transition-colors"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('customer@example.com', 'customer123')}
              className="px-2.5 py-1 rounded bg-warm-olive text-white hover:bg-warm-dark transition-colors"
            >
              🍔 Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('delivery@example.com', 'delivery123')}
              className="px-2.5 py-1 rounded bg-warm-amber text-white hover:bg-warm-amber-hover transition-colors"
            >
              🛵 Delivery Partner Demo
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-warm-dark mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-warm-muted" />
                <input
                  type="text"
                  required
                  placeholder="Mayank Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-warm-bg border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-amber"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-warm-dark mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-warm-muted" />
              <input
                type="email"
                required
                placeholder="customer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-4 py-2 text-sm bg-warm-bg border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-amber"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-warm-dark mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-warm-muted" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-4 py-2 text-sm bg-warm-bg border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-amber"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-warm-dark mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-warm-muted" />
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-warm-bg border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-amber"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-dark mb-1">Account Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-warm-bg border border-warm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-amber"
                >
                  <option value="customer">Customer (Food Ordering)</option>
                  <option value="delivery_partner">Delivery Partner</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-warm-amber hover:bg-warm-amber-hover text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50 mt-2"
          >
            {submitting ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-warm-olive hover:underline font-medium"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
