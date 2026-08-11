import React from 'react';
import { CheckCircle2, Clock, Truck, Utensils, PackageCheck, AlertCircle } from 'lucide-react';

const STAGES = [
  { key: 'ORDER_PLACED', label: 'Order Placed', icon: Clock },
  { key: 'RESTAURANT_ACCEPTED', label: 'Restaurant Accepted', icon: Utensils },
  { key: 'PREPARING', label: 'Preparing Food', icon: Utensils },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: PackageCheck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderTimeline({ currentStatus = 'ORDER_PLACED', timeline = {} }) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold block text-sm">Order Cancelled</span>
          <p className="text-[11px] text-rose-700/80">This transaction was cancelled and refunded.</p>
        </div>
      </div>
    );
  }

  const getStageIndex = (status) => {
    return STAGES.findIndex((s) => s.key === status);
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="py-4">
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-2">
        {STAGES.map((stage, idx) => {
          const isDone = idx <= currentIndex;
          const isActive = idx === currentIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex-1 flex md:flex-col items-center gap-3 md:gap-2 z-10 w-full md:w-auto">
              
              {/* Icon Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0 ${
                  isDone
                    ? 'bg-warm-olive text-white'
                    : 'bg-warm-beige text-warm-muted border border-warm-border'
                } ${isActive ? 'ring-4 ring-warm-amber/30 scale-110' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Label */}
              <div className="text-left md:text-center">
                <span
                  className={`text-xs font-bold block ${
                    isActive
                      ? 'text-warm-amber font-extrabold'
                      : isDone
                      ? 'text-warm-dark'
                      : 'text-warm-muted'
                  }`}
                >
                  {stage.label}
                </span>
                {isActive && (
                  <span className="text-[10px] text-warm-olive font-semibold animate-pulse">
                    ● In Progress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
