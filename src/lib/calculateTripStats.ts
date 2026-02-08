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

    // Pricing calculation
    const includedKmPerDay = 250; // Base fare includes 250 km per day
    const totalIncludedKm = includedKmPerDay * totalDays;
    const extraKm = Math.max(0, effectiveDistance - totalIncludedKm);
    const extraKmCharge = extraKm * perKmRate;

    // Driver allowance for extra days beyond first day
    const baseDays = 1;
    const extraDays = Math.max(0, totalDays - baseDays);
    const driverAllowance = extraDays * driverAllowancePerDay;

    // Total fare
    const totalFare = baseFare + extraKmCharge + driverAllowance;

    // Suggest night halt if single-day trip time exceeds 8 hours
    let suggestedNightHalt: string | undefined;
    if (driveTimeHours > 8 && totalDays > 1) {
        const midpointStop = actualStops[Math.floor(actualStops.length / 2)];
        if (midpointStop) {
            suggestedNightHalt = `Near ${midpointStop.name}`;
        }
    }

    return {
        totalDistanceKm: effectiveDistance,
        totalDriveTimeHours: driveTimeHours,
        totalDays,
        baseFare,
        extraKmCharge: Math.round(extraKmCharge),
        driverAllowance,
        totalFare: Math.round(totalFare),
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
