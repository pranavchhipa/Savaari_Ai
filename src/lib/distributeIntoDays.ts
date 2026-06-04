// Distributes selected destination attractions across the trip days for the
// Packages feature: proximity-orders the stops (to cut zig-zagging) and packs
// them into days respecting the per-day at-disposal slab (e.g. 8hr/80km).

import type { Stop } from '@/types';
import { getDistance } from './geoUtils';

export interface DayPlan {
  day: number;
  stops: Stop[];
  usedKm: number;     // driving km between the day's stops
  usedHours: number;  // visit time + in-city driving time
  slabKm: number;     // included allowance (80 / 120)
  slabHours: number;  // included hours (8 / 12)
}

export interface DistributeOptions {
  slabKm?: number;
  slabHours?: number;
  transferDriveHours?: number; // one-way A→B drive, eats into the arrival day
}

const AVG_CITY_SPEED_KMH = 28;
const DEFAULT_STOP_MIN = 45;

// Greedy nearest-neighbour ordering to keep each day's stops geographically sane.
function orderByProximity(stops: Stop[]): Stop[] {
  if (stops.length <= 2) return [...stops];
  const remaining = [...stops];
  const ordered: Stop[] = [remaining.shift() as Stop];
  while (remaining.length) {
    const last = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = getDistance(last.location, s.location);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }
  return ordered;
}

export function distributeIntoDays(
  stops: Stop[],
  numDays: number,
  opts: DistributeOptions = {},
): DayPlan[] {
  const slabKm = opts.slabKm ?? 80;
  const slabHours = opts.slabHours ?? 8;
  const transferDriveHours = opts.transferDriveHours ?? 0;
  const days = Math.max(1, Math.floor(numDays));

  // Activity-hour capacity for a given day index (arrival/departure days are shorter).
  const capacityFor = (dayIndex: number): number => {
    const isFirst = dayIndex === 0;
    const isLast = dayIndex === days - 1;
    if (isFirst && isLast) return Math.max(2, slabHours - transferDriveHours);
    let cap = slabHours;
    if (isFirst) cap -= Math.min(transferDriveHours, slabHours - 2); // arrival drive
    if (isLast) cap -= 2;                                            // departure buffer
    return Math.max(2, cap);
  };

  const ordered = orderByProximity(stops);
  const buckets: Stop[][] = Array.from({ length: days }, () => []);

  let d = 0;
  let dayHours = 0;
  let prev: Stop | null = null;

  for (const stop of ordered) {
    const driveKm = prev ? getDistance(prev.location, stop.location) : 0;
    const cost = (stop.duration || DEFAULT_STOP_MIN) / 60 + driveKm / AVG_CITY_SPEED_KMH;

    if (buckets[d].length > 0 && dayHours + cost > capacityFor(d) && d < days - 1) {
      d += 1;
      dayHours = 0;
      prev = null;
    }

    buckets[d].push({ ...stop, day: d + 1 });
    const drive = prev ? driveKm / AVG_CITY_SPEED_KMH : 0;
    dayHours += (stop.duration || DEFAULT_STOP_MIN) / 60 + drive;
    prev = stop;
  }

  return buckets.map((dayStops, i) => {
    let usedKm = 0;
    for (let j = 1; j < dayStops.length; j++) {
      usedKm += getDistance(dayStops[j - 1].location, dayStops[j].location);
    }
    const visitHours = dayStops.reduce((acc, s) => acc + (s.duration || DEFAULT_STOP_MIN) / 60, 0);
    const usedHours = visitHours + usedKm / AVG_CITY_SPEED_KMH;
    return {
      day: i + 1,
      stops: dayStops,
      usedKm: Math.round(usedKm),
      usedHours: Math.round(usedHours * 10) / 10,
      slabKm,
      slabHours,
    };
  });
}
