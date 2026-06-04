// Pricing for destination 'package' trips:
//   transfer (A→B→A outstation km) + N × per-day at-disposal slab
//   + driver allowance × days + estimated tolls.
// Returns a TripStats so it slots straight into BillingFooter / BookingModal.

import type { Car, TripStats, LocalPackage } from '@/types';

export const SLAB_KM: Record<LocalPackage, number> = { '8hr_80km': 80, '12hr_120km': 120 };
export const SLAB_HOURS: Record<LocalPackage, number> = { '8hr_80km': 8, '12hr_120km': 12 };

export interface PackagePriceInput {
  transferKm: number;   // one-way A→B road distance
  numDays: number;
  car: Car;
  slab?: LocalPackage;
}

export function computePackagePrice({
  transferKm,
  numDays,
  car,
  slab = '8hr_80km',
}: PackagePriceInput): TripStats {
  const days = Math.max(1, Math.floor(numDays));
  const slabKm = SLAB_KM[slab];

  // Round-trip transfer drive (A → B and back).
  const transferFare = Math.round(transferKm * 2 * car.perKmRate);

  // Per-day at-disposal sightseeing slab.
  const perDaySlab =
    slab === '12hr_120km'
      ? car.localPackage12hr ?? car.perKmRate * 120
      : car.localPackage8hr ?? car.perKmRate * 80;
  const sightseeingFare = Math.round(perDaySlab * days);

  const driverAllowance = Math.round(car.driverAllowancePerDay * days);

  // Rough toll estimate for the two transfer legs (~₹1.4/km each way).
  const tollEstimate = Math.round(transferKm * 1.4 * 2);

  const baseFare = transferFare + sightseeingFare;
  const totalFare = baseFare + driverAllowance + tollEstimate;

  const totalDistanceKm = Math.round(transferKm * 2 + slabKm * days);
  const totalDriveTimeHours =
    Math.round(((transferKm * 2) / 45 + SLAB_HOURS[slab] * days) * 10) / 10;

  return {
    totalDistanceKm,
    totalDriveTimeHours,
    totalDays: days,
    baseFare,
    extraKmCharge: 0,
    driverAllowance,
    tollEstimate,
    totalFare,
    routeLabel: 'Package',
  };
}

// Per-stop-selection independent breakdown, for an itemised display if needed.
export function packageFareBreakdown(input: PackagePriceInput) {
  const days = Math.max(1, Math.floor(input.numDays));
  const transferFare = Math.round(input.transferKm * 2 * input.car.perKmRate);
  const slab = input.slab ?? '8hr_80km';
  const perDaySlab =
    slab === '12hr_120km'
      ? input.car.localPackage12hr ?? input.car.perKmRate * 120
      : input.car.localPackage8hr ?? input.car.perKmRate * 80;
  return {
    transferFare,
    sightseeingFare: Math.round(perDaySlab * days),
    perDaySlab: Math.round(perDaySlab),
    driverAllowance: Math.round(input.car.driverAllowancePerDay * days),
    tollEstimate: Math.round(input.transferKm * 1.4 * 2),
    days,
  };
}
