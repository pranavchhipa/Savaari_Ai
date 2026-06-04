'use client';

import { Check, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/calculateTripStats';

interface CabMeterProps {
  usedKm: number;
  usedHours: number;
  slabKm: number;
  slabHours: number;
  perKmRate?: number;
}

/**
 * Per-day "cab at disposal" usage meter — the Savaari-specific bit.
 * Green within the 8hr/80km (or 12hr/120km) slab, amber as it fills,
 * red when it spills over (with an extra-km charge estimate).
 */
export default function CabMeter({
  usedKm,
  usedHours,
  slabKm,
  slabHours,
  perKmRate = 14,
}: CabMeterProps) {
  const kmPct = (usedKm / slabKm) * 100;
  const hrPct = (usedHours / slabHours) * 100;
  const fill = Math.min(100, Math.max(kmPct, hrPct));

  const overKm = Math.max(0, usedKm - slabKm);
  const overHr = Math.max(0, usedHours - slabHours);
  const isOver = overKm > 0 || overHr > 0;
  const isTight = !isOver && fill > 80;

  // Extra km billed at ~1.3× the base per-km rate (industry convention).
  const extraCharge = Math.round(overKm * perKmRate * 1.3);

  const barClass = isOver
    ? 'from-red-400 to-red-500'
    : isTight
      ? 'from-amber-400 to-amber-500'
      : 'from-green-400 to-emerald-500';

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1.5">
        <span>
          <span className="font-semibold text-slate-700">Cab today</span> · {usedKm}/{slabKm} km · {usedHours}/{slabHours} hrs
        </span>
        {isOver ? (
          <span className="flex items-center gap-1 text-red-600 font-medium">
            <AlertTriangle className="w-3 h-3" />
            +{overKm > 0 ? `${overKm} km` : `${Math.ceil(overHr)} hr`} over{extraCharge > 0 ? ` · ~${formatCurrency(extraCharge)}` : ''}
          </span>
        ) : isTight ? (
          <span className="text-amber-600 font-medium">Almost full</span>
        ) : (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <Check className="w-3 h-3" /> within {slabHours}hr/{slabKm}km
          </span>
        )}
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barClass} transition-all`}
          style={{ width: `${fill}%` }}
        />
      </div>
    </div>
  );
}
