import { RoutePoint, Location, Stop, StopType } from '@/types';

// Routing utilities
// Note: getRoute has been moved to src/app/actions/trip.ts to run on server-side


// Generate stop positions along a route from AI recommendation data
// This maps AI-provided approximateKm to actual route coordinates
export function getCoordinateAtDistance(
    routeCoordinates: RoutePoint[],
    approximateKm: number,
    totalDistanceKm: number
): RoutePoint {
    const progress = Math.min(Math.max(approximateKm / totalDistanceKm, 0), 0.99);
    const coordIndex = Math.floor(progress * (routeCoordinates.length - 1));
    return routeCoordinates[coordIndex] || routeCoordinates[Math.floor(routeCoordinates.length / 2)];
}

// Calculate arrival time based on distance (assuming 6 AM start, 50 km/h avg)
export function calculateArrivalTime(approximateKm: number, startHour: number = 6): string {
    const travelTime = approximateKm / 50; // 50 km/h average speed
    const arrivalHour = startHour + travelTime;
    const hour = Math.floor(arrivalHour) % 24;
    const minutes = Math.floor((arrivalHour % 1) * 60);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

// Get midpoint for night halt suggestion
export function getMidpointForNightHalt(
    routeCoordinates: RoutePoint[],
    totalDistanceKm: number
): { location: RoutePoint; suggestedCity: string } | null {
    if (totalDistanceKm < 400) return null;

    const midIndex = Math.floor(routeCoordinates.length * 0.45); // Slightly before midpoint
    const midpoint = routeCoordinates[midIndex];

    return {
        location: midpoint,
        suggestedCity: 'Midpoint City', // Will be overridden by AI response
    };
}

// Validate stop type against allowed types
export function validateStopType(type: string): StopType {
    const validTypes: StopType[] = ['tourist', 'heritage', 'nature', 'adventure', 'cultural', 'viewpoint', 'food', 'restaurant', 'night_halt'];
    if (validTypes.includes(type as StopType)) return type as StopType;
    return 'tourist'; // Default fallback
}
