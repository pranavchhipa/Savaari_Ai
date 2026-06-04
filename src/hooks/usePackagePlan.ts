'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Location,
  Car,
  Stop,
  TripStats,
  AIRecommendation,
  Persona,
  LocalPackage,
} from '@/types';
import { computePackagePrice, SLAB_KM, SLAB_HOURS } from '@/lib/packagePricing';
import { distributeIntoDays, type DayPlan } from '@/lib/distributeIntoDays';
import { getCuratedDestination } from '@/lib/packageDestinations';
import { getDistance } from '@/lib/geoUtils';

interface UsePackagePlanProps {
  source: Location;
  destination: Location;
  numDays: number;
  car: Car;
  persona?: Persona | null;
  pickupDate?: string;
  pickupTime?: string;
  slab?: LocalPackage;
}

interface UsePackagePlanReturn {
  isLoading: boolean;
  error: string | null;
  attractions: AIRecommendation[];          // full pool (for "explore more")
  days: DayPlan[];
  addedIds: Set<string>;                     // keys currently in the plan
  addAttraction: (rec: AIRecommendation) => void; // toggles
  removeStop: (stopId: string) => void;
  tripStats: TripStats | null;
  transferKm: number;
  usedAi: boolean;
}

const recKey = (rec: AIRecommendation) => rec.id || rec.name;

// Deterministic scatter around the destination centre for AI results that have
// no coordinates (curated results carry real coords and skip this).
function scatterCoord(center: Location, i: number, n: number) {
  const angle = (i / Math.max(1, n)) * Math.PI * 2;
  const radius = 0.025 + (i % 4) * 0.015; // ~3–9 km
  return {
    lat: center.lat + radius * Math.cos(angle),
    lng: center.lng + radius * Math.sin(angle),
  };
}

export function usePackagePlan({
  source,
  destination,
  numDays,
  car,
  persona,
  pickupDate,
  pickupTime,
  slab = '8hr_80km',
}: UsePackagePlanProps): UsePackagePlanReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attractions, setAttractions] = useState<AIRecommendation[]>([]);
  const [stopByKey, setStopByKey] = useState<Map<string, Stop>>(new Map());
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [transferKm, setTransferKm] = useState<number>(0);
  const [usedAi, setUsedAi] = useState(false);

  const days = Math.max(1, Math.floor(numDays || 1));

  // ---- Fetch attractions for the destination (curated first, AI fallback) ----
  useEffect(() => {
    if (!destination?.name) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const buildStop = (rec: AIRecommendation, coord: { lat: number; lng: number }): Stop => ({
      id: `pkg-${recKey(rec)}`,
      name: rec.name,
      type: rec.type,
      location: {
        name: rec.name,
        displayName: rec.famousFor || rec.description || rec.name,
        lat: coord.lat,
        lng: coord.lng,
      },
      duration: rec.suggestedDuration || 60,
      description: rec.whyVisit || rec.description,
      isSelected: true,
      detourKm: 0,
      leg: 'onward',
      rating: rec.rating,
      badges: rec.badges,
      famousFor: rec.famousFor,
      bestTimeToVisit: rec.bestTimeToVisit,
      photoUrl: rec.photoUrl,
    });

    (async () => {
      // 1) Transfer distance (A→B) for pricing — route API, else straight-line × 1.35.
      let km = 0;
      try {
        const res = await fetch('/api/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start: source, end: destination }),
        });
        if (res.ok) {
          const data = await res.json();
          km = data.distanceKm || 0;
        }
      } catch {
        /* fall through to estimate */
      }
      if (!km && source) km = getDistance(source, destination) * 1.35;
      if (!cancelled) setTransferKm(Math.round(km));

      // 2) Attractions — curated first.
      let pool: AIRecommendation[] = [];
      let ai = false;
      const curated = getCuratedDestination(destination.name);
      if (curated && curated.length > 0) {
        pool = curated;
      } else {
        // AI fallback (works when an OPENROUTER key is configured).
        try {
          const res = await fetch('/api/ai/generate-stops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: destination.name,
              destination: destination.name,
              distanceKm: SLAB_KM[slab],
              isLocal: true,
              localPackage: slab,
              persona: persona ?? null,
              pace: 'balanced',
              budget: 'standard',
              carType: car.type,
              pickupDate,
              pickupTime,
              totalDays: days,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.stops) && data.stops.length > 0) {
              pool = data.stops as AIRecommendation[];
              ai = true;
            }
          }
        } catch {
          /* leave pool empty */
        }
      }

      if (cancelled) return;

      // Build the stop map (curated carry coords; AI results get scattered).
      const map = new Map<string, Stop>();
      pool.forEach((rec, i) => {
        const c = rec as AIRecommendation & { lat?: number; lng?: number };
        const coord =
          typeof c.lat === 'number' && typeof c.lng === 'number'
            ? { lat: c.lat, lng: c.lng }
            : scatterCoord(destination, i, pool.length);
        map.set(recKey(rec), buildStop(rec, coord));
      });

      setAttractions(pool);
      setStopByKey(map);
      setUsedAi(ai);

      // Default-select enough to fill the days (~3 per day), best-rated first.
      const target = Math.min(pool.length, Math.max(3, days * 3));
      const defaults = [...pool]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, target)
        .map(recKey);
      setSelectedKeys(new Set(defaults));

      if (pool.length === 0) {
        setError(`No curated attractions for ${destination.name} yet. Add an OPENROUTER_API_KEY to generate any city, or try Mysore / Ooty / Coorg / Goa / Jaipur.`);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination?.name, destination?.lat, destination?.lng, persona, days]);

  // ---- Derived: selected stops → day plan ----
  const transferDriveHours = useMemo(
    () => (transferKm > 0 ? transferKm / 45 : 0),
    [transferKm],
  );

  const dayPlans = useMemo<DayPlan[]>(() => {
    const selectedStops: Stop[] = [];
    selectedKeys.forEach((k) => {
      const s = stopByKey.get(k);
      if (s) selectedStops.push(s);
    });
    if (selectedStops.length === 0) return [];
    return distributeIntoDays(selectedStops, days, {
      slabKm: SLAB_KM[slab],
      slabHours: SLAB_HOURS[slab],
      transferDriveHours,
    });
  }, [selectedKeys, stopByKey, days, slab, transferDriveHours]);

  // ---- Pricing (package model — independent of which stops are picked) ----
  const tripStats = useMemo<TripStats | null>(() => {
    if (!transferKm) return null;
    return computePackagePrice({ transferKm, numDays: days, car, slab });
  }, [transferKm, days, car, slab]);

  // ---- Mutations ----
  const addAttraction = useCallback((rec: AIRecommendation) => {
    const key = recKey(rec);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const removeStop = useCallback((stopId: string) => {
    const key = stopId.replace(/^pkg-/, '');
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  return {
    isLoading,
    error,
    attractions,
    days: dayPlans,
    addedIds: selectedKeys,
    addAttraction,
    removeStop,
    tripStats,
    transferKm,
    usedAi,
  };
}
