import { Stop, StopType, TripStats } from '@/types';

/**
 * Savaari Trip Pricing Engine
 *
 * Product decisions as Savaari's AI product lead:
 * - Tolls are INCLUDED in total fare (customer simplicity)
 * - Minimum 300km/day billing (industry standard)
 * - Adding tourist stops = more detour km = higher fare (good for revenue)
 * - Route type affects pricing: scenic routes get standard rate, all routes fair
 */

interface CalculateTripStatsParams {
    totalDistanceKm: number;
    durationMinutes: number;
    selectedStops: Stop[];
    baseFare: number;
    perKmRate: number;
    driverAllowancePerDay: number;
    tripType: 'one-way' | 'round-trip';
    tollEstimate?: number;
    routeLabel?: string;
}

export function calculateTripStats({
    totalDistanceKm,
    durationMinutes,
    selectedStops,
    baseFare,
    perKmRate,
    driverAllowancePerDay,
    tripType,
    tollEstimate = 0,
    routeLabel,
}: CalculateTripStatsParams): TripStats {
    // For round trips, double the distance
    const effectiveDistance = tripType === 'round-trip' ? totalDistanceKm * 2 : totalDistanceKm;

    // Total drive hours
    const totalDriveTimeHours = durationMinutes / 60;
    const effectiveDriveTime = tripType === 'round-trip' ? totalDriveTimeHours * 2 : totalDriveTimeHours;

    // Calculate days based on drive time + stop durations
    const stopDurationHours = selectedStops.reduce((acc, stop) => {
        if (stop.type === 'start' || stop.type === 'end') return acc;
        return acc + (stop.duration || 30) / 60;
    }, 0);

    const totalTravelHours = effectiveDriveTime + stopDurationHours;

    // Calculate total days: 10 hours driving per day max
    const maxDrivingHoursPerDay = 10;
    let totalDays = Math.max(1, Math.ceil(totalTravelHours / maxDrivingHoursPerDay));

    // For round trip, minimum 2 days for trips > 200km one way
    if (tripType === 'round-trip' && totalDistanceKm > 200) {
        totalDays = Math.max(2, totalDays);
    }

    // Minimum billable distance: 300km per day (industry standard)
    const minBillableKmPerDay = 300;
    const minBillableKm = totalDays * minBillableKmPerDay;
    const billableDistance = Math.max(effectiveDistance, minBillableKm);

    // Fare calculation
    const distanceCharge = billableDistance * perKmRate;
    const driverAllowance = totalDays * driverAllowancePerDay;

    // Toll is included in total fare — customer simplicity
    const effectiveToll = tripType === 'round-trip' ? tollEstimate * 2 : tollEstimate;

    const finalBaseFare = distanceCharge;
    const finalTotalFare = finalBaseFare + driverAllowance + effectiveToll;

    return {
        totalDistanceKm: Math.round(effectiveDistance),
        totalDriveTimeHours: Math.round(effectiveDriveTime * 10) / 10,
        totalDays,
        baseFare: Math.round(finalBaseFare),
        extraKmCharge: 0,
        driverAllowance: Math.round(driverAllowance),
        tollEstimate: Math.round(effectiveToll),
        totalFare: Math.round(finalTotalFare),
        routeLabel,
    };
}

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number): string {
    if (amount === 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format duration
 */
export function formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h}h ${m}m`;
}

/**
 * Format distance
 */
export function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${Math.round(km)} km`;
}

/**
 * Get color for stop type — tourist-focused palette
 */
export function getStopTypeColor(type: StopType): string {
    const colors: Record<string, string> = {
        start: '#2563EB',      // Blue
        end: '#F97316',        // Orange
        tourist: '#8B5CF6',    // Purple
        heritage: '#D97706',   // Amber/Gold
        nature: '#059669',     // Green
        adventure: '#DC2626',  // Red
        cultural: '#7C3AED',   // Violet
        viewpoint: '#0891B2',  // Cyan
        food: '#EA580C',       // Deep Orange
        restaurant: '#EA580C', // Deep Orange
        night_halt: '#6366F1', // Indigo
    };
    return colors[type] || '#6B7280';
}

/**
 * Get emoji icon for stop type
 */
export function getStopTypeIcon(type: StopType): string {
    const icons: Record<string, string> = {
        start: '🚗',
        end: '📍',
        tourist: '⭐',
        heritage: '🏛️',
        nature: '🌿',
        adventure: '🏔️',
        cultural: '🎭',
        viewpoint: '📸',
        food: '🍛',
        restaurant: '🍛',
        night_halt: '🌙',
    };
    return icons[type] || '📌';
}

/**
 * Get label for stop type
 */
export function getStopTypeLabel(type: StopType): string {
    const labels: Record<string, string> = {
        start: 'Start',
        end: 'Destination',
        tourist: 'Tourist Spot',
        heritage: 'Heritage Site',
        nature: 'Nature',
        adventure: 'Adventure',
        cultural: 'Cultural',
        viewpoint: 'Viewpoint',
        food: 'Famous Food',
        restaurant: 'Restaurant',
        night_halt: 'Night Stay',
    };
    return labels[type] || 'Stop';
}

/**
 * Calculate fare difference between two routes
 */
export function getRouteFareDifference(baseFare: number, compareFare: number): string {
    const diff = compareFare - baseFare;
    if (diff === 0) return '';
    return diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff);
}
