import { TripStats, Stop } from '@/types';

interface TripStatsInput {
    totalDistanceKm: number;
    durationMinutes: number;
    selectedStops: Stop[];
    baseFare: number;
    perKmRate: number;
    driverAllowancePerDay: number;
    tripType: 'one-way' | 'round-trip';
}

export function calculateTripStats(input: TripStatsInput): TripStats {
    const {
        totalDistanceKm,
        durationMinutes,
        selectedStops,
        baseFare,
        perKmRate,
        driverAllowancePerDay,
        tripType,
    } = input;

    // Calculate total stop time (excluding start/end which are waypoints, not stops)
    const actualStops = selectedStops.filter(s => s.type !== 'start' && s.type !== 'end');
    const totalStopTimeMinutes = actualStops.reduce(
        (acc, stop) => acc + (stop.duration || 0),
        0
    );

    // For round trip, double the distance and driving time
    const effectiveDistance = tripType === 'round-trip' ? totalDistanceKm * 2 : totalDistanceKm;
    const effectiveDriveMinutes = tripType === 'round-trip' ? durationMinutes * 2 : durationMinutes;

    // Total trip time = driving time + stop time (stops visited once, not doubled for round trip)
    const totalTripTimeMinutes = effectiveDriveMinutes + totalStopTimeMinutes;
    const totalTripTimeHours = totalTripTimeMinutes / 60;
    const driveTimeHours = effectiveDriveMinutes / 60;

    // Calculate number of days needed (10-hour effective driving limit per day, accounting for breaks)
    const maxEffectiveHoursPerDay = 10;
    let totalDays = 1;

    if (totalTripTimeHours > maxEffectiveHoursPerDay) {
        totalDays = Math.ceil(totalTripTimeHours / maxEffectiveHoursPerDay);
    }

    // --- Dynamic Pricing Calculation ---
    // Standard Outstation Logic:
    // 1. Min charge distance per day (e.g. 300km)
    // 2. Round trip charges for return distance (already doubled effectively)
    // 3. Driver allowance per day

    const minKmPerDay = 300;

    // Billing Effective Distance
    // Calculate billable distance: Max of (Actual Distance, Total Days * Min Km/Day)
    const minBillableKm = totalDays * minKmPerDay;
    const billableDistance = Math.max(effectiveDistance, minBillableKm);

    // Base Fare is effectively 0 in this dynamic model, or we can use it as a 'Booking Fee' if needed.
    // But for "Actual Pricing", we usually just do Distance * Rate.
    // If input baseFare is provided (from static data), we might ignore it or use it as a minimum floor.
    // Let's rely on perKmRate.

    const distanceCharge = billableDistance * perKmRate;

    // Driver allowance
    const driverAllowance = totalDays * driverAllowancePerDay;

    // Total Fare
    // We add a small platform fee or just uses the calc.
    // For now: Distance Charge + Driver Allowance.
    // If billableDistance > effectiveDistance, the "Extra Km" concept is slightly different.
    // It's just "Billable Km".
    // To match the UI fields:
    // baseFare in UI could mean "Fixed Charge" or we can repurpose fields.
    // Let's make:
    // baseFare = Billable Distance * Rate (The core travel cost)
    // extraKmCharge = 0 (since we already covered everything in baseFare/billable logic)
    // driverAllowance = as calc.

    const finalBaseFare = distanceCharge;
    const finalTotalFare = finalBaseFare + driverAllowance;

    // Suggest night halt if single-day trip time exceeds 12 hours (more realistic for India) or 
    // if driving time is very long.
    let suggestedNightHalt: string | undefined;
    if (driveTimeHours > 10 && totalDays > 1) {
        const midpointStop = actualStops[Math.floor(actualStops.length / 2)];
        if (midpointStop) {
            suggestedNightHalt = `Near ${midpointStop.name}`;
        }
    }

    return {
        totalDistanceKm: effectiveDistance,
        totalDriveTimeHours: driveTimeHours,
        totalDays,
        baseFare: Math.round(finalBaseFare), // This now represents the Distance Charge
        extraKmCharge: 0, // Simplified: Everything is in baseFare based on billable km
        driverAllowance,
        totalFare: Math.round(finalTotalFare),
        suggestedNightHalt,
    };
}

// Format currency in INR
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format duration
export function formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;
    return `${h} hr ${m} min`;
}

// Format distance
export function formatDistance(km: number): string {
    return `${Math.round(km)} km`;
}

// Get stop type icon
export function getStopTypeIcon(type: Stop['type']): string {
    const icons: Record<Stop['type'], string> = {
        start: '🚗',
        end: '🏁',
        restaurant: '🍽️',
        viewpoint: '📸',
        heritage: '🏛️',
        fuel: '⛽',
        rest: '☕',
        night_halt: '🌙',
        food: '🍽️',
    };
    return icons[type] || '📍';
}

// Get stop type color - Professional unified blue/slate theme
export function getStopTypeColor(type: Stop['type']): string {
    const colors: Record<Stop['type'], string> = {
        start: '#2563EB',      // Blue - Primary brand color
        end: '#1E40AF',        // Dark blue - Destination
        restaurant: '#475569', // Slate - Food stops
        viewpoint: '#6366F1',  // Indigo - Scenic spots
        heritage: '#4F46E5',   // Indigo-violet - Heritage
        fuel: '#64748B',       // Slate gray - Fuel
        rest: '#475569',       // Slate - Rest stops
        night_halt: '#1E3A8A', // Dark blue - Night
        food: '#475569',       // Slate - Food
    };
    return colors[type] || '#64748B';
}
