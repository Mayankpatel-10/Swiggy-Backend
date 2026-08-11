import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function FraudScoreBadge({ score = 0, level = 'LOW', reasons = [] }) {
  let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let Icon = ShieldCheck;

  if (level === 'CRITICAL') {
    badgeStyle = 'bg-warm-dark text-warm-amber border-warm-amber';
    Icon = ShieldAlert;
  } else if (level === 'HIGH') {
    badgeStyle = 'bg-amber-100 text-amber-900 border-amber-300';
    Icon = AlertTriangle;
  } else if (level === 'MEDIUM') {
    badgeStyle = 'bg-yellow-50 text-yellow-800 border-yellow-200';
    Icon = AlertTriangle;
  }

  return (
    <div className={`inline-flex flex-col gap-1 px-3 py-1.5 rounded-xl border ${badgeStyle} shadow-sm`}>
      <div className="flex items-center gap-1.5 font-bold text-xs">
        <Icon className="w-4 h-4" />
        <span>Risk Score: {score}/100</span>
        <span className="ml-1 px-1.5 py-0.2 text-[10px] uppercase tracking-wider font-black rounded bg-black/10">
          {level}
        </span>
      </div>

      {reasons && reasons.length > 0 && (
        <ul className="text-[10px] opacity-90 list-disc list-inside">
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
