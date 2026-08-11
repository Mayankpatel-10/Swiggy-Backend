import React, { useState, useEffect } from 'react';
import { Zap, Sliders, Clock, ShieldCheck, Check } from 'lucide-react';
import API from '../services/api';

export default function AdminSurgePage() {
  const [settings, setSettings] = useState({
    region: 'Central City',
    isSurgeActive: true,
    baseDeliveryFee: 40,
    surgeMultiplier: 1.5,
    demandThreshold: 5,
    peakHours: {
      lunchStart: '12:00',
      lunchEnd: '15:00',
      dinnerStart: '19:30',
      dinnerEnd: '22:30',
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSurgeSettings();
  }, []);

  const fetchSurgeSettings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/surge-settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching surge settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await API.put('/admin/surge-settings', settings);
      if (res.data.success) {
        setSuccessMsg('Surge pricing configuration successfully updated!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update surge settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-warm-muted">Loading surge configuration...</div>;
  }

  const previewSurgeFee = Math.round(settings.baseDeliveryFee * (settings.surgeMultiplier - 1.0));
  const previewFinalFee = settings.baseDeliveryFee + previewSurgeFee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-warm-border pb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-warm-amber" />
          <h1 className="text-3xl font-black text-warm-dark tracking-tight">Dynamic Surge Pricing Controls</h1>
        </div>
        <p className="text-xs text-warm-muted mt-1">
          Configure peak hour multipliers, demand thresholds, and base delivery fees across regions.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Form */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-2 space-y-6 bg-warm-card p-6 rounded-2xl border border-warm-border shadow-sm">
          <div className="flex items-center justify-between border-b border-warm-border pb-3">
            <h3 className="font-bold text-sm text-warm-dark">Pricing Rules Configuration</h3>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <span className="text-warm-dark">Surge Engine</span>
              <input
                type="checkbox"
                checked={settings.isSurgeActive}
                onChange={(e) => setSettings({ ...settings, isSurgeActive: e.target.checked })}
                className="w-4 h-4 text-warm-amber rounded border-warm-border focus:ring-warm-amber"
              />
            </label>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-warm-dark block mb-1">Target Region</label>
              <input
                type="text"
                value={settings.region}
                onChange={(e) => setSettings({ ...settings, region: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-warm-bg border border-warm-border rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-warm-dark block mb-1">
                Base Delivery Fee (₹{settings.baseDeliveryFee})
              </label>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={settings.baseDeliveryFee}
                onChange={(e) => setSettings({ ...settings, baseDeliveryFee: Number(e.target.value) })}
                className="w-full accent-warm-amber"
              />
            </div>

            <div>
              <label className="font-semibold text-warm-dark block mb-1">
                Surge Multiplier ({settings.surgeMultiplier}x)
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={settings.surgeMultiplier}
                onChange={(e) => setSettings({ ...settings, surgeMultiplier: Number(e.target.value) })}
                className="w-full accent-warm-amber"
              />
            </div>

            <div>
              <label className="font-semibold text-warm-dark block mb-1">
                Order Demand Threshold ({settings.demandThreshold} orders / 15 mins)
              </label>
              <input
                type="number"
                value={settings.demandThreshold}
                onChange={(e) => setSettings({ ...settings, demandThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-warm-bg border border-warm-border rounded-lg"
              />
            </div>

            {/* Peak Hours Pickers */}
            <div className="pt-2 border-t border-warm-border space-y-3">
              <span className="font-bold text-warm-dark block">Peak Hours Schedule</span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-warm-muted block mb-1">Lunch Peak Start</label>
                  <input
                    type="time"
                    value={settings.peakHours?.lunchStart || '12:00'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        peakHours: { ...settings.peakHours, lunchStart: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-warm-bg border border-warm-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-warm-muted block mb-1">Lunch Peak End</label>
                  <input
                    type="time"
                    value={settings.peakHours?.lunchEnd || '15:00'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        peakHours: { ...settings.peakHours, lunchEnd: e.target.value },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-warm-bg border border-warm-border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-warm-amber hover:bg-warm-amber-hover text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              {saving ? 'Saving Rules...' : 'Save Surge Settings'}
            </button>
          </div>
        </form>

        {/* Live Calculation Preview Card */}
        <div className="bg-warm-card p-6 rounded-2xl border border-warm-border shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-sm text-warm-dark flex items-center gap-2 border-b border-warm-border pb-3">
            <Sliders className="w-4 h-4 text-warm-amber" />
            <span>Live Delivery Fee Preview</span>
          </h3>

          <div className="p-4 bg-warm-bg rounded-xl border border-warm-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Base Delivery Fee</span>
              <span className="font-bold text-warm-dark">₹{settings.baseDeliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Surge Multiplier</span>
              <span className="font-bold text-warm-amber">{settings.surgeMultiplier}x</span>
            </div>
            <div className="flex justify-between text-warm-amber font-semibold">
              <span>Surge Adjustment</span>
              <span>+₹{previewSurgeFee}</span>
            </div>
            <div className="pt-2 border-t border-warm-border flex justify-between font-black text-sm text-warm-dark">
              <span>Customer Fee</span>
              <span className="text-warm-amber">₹{previewFinalFee}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
