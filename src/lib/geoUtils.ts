import { Location, RoutePoint } from '@/types';

/**
 * Calculate distance between two points using Haversine formula
 */
export function getDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
): number {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Check if a point is within a bounding box of start/end points + buffer
 */
export function isPointInBoundingBox(
    point: { lat: number; lng: number },
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    bufferKm: number = 50
): boolean {
    const minLat = Math.min(start.lat, end.lat);
    const maxLat = Math.max(start.lat, end.lat);
    const minLng = Math.min(start.lng, end.lng);
    const maxLng = Math.max(start.lng, end.lng);

    // Approximate degree conversion (1 degree lat ~= 111km, 1 degree lng varies)
    const latBuffer = bufferKm / 111;
    const lngBuffer = bufferKm / (111 * Math.cos(minLat * Math.PI / 180));

    return (
        point.lat >= minLat - latBuffer &&
        point.lat <= maxLat + latBuffer &&
        point.lng >= minLng - lngBuffer &&
        point.lng <= maxLng + lngBuffer
    );
}

/**
 * Calculate minimum distance from a point to a polyline (route)
 * Uses a simplified method checking distance to segments
 */
export function getMinDistanceToRoute(
    point: { lat: number; lng: number },
    routeCoordinates: RoutePoint[]
): number {
    let minDistance = Infinity;

    // Sample the route to avoid expensive calculation on thousands of points
    // We check every 5th point which is sufficient for 50km tolerance
    const sampleRate = 5;

    for (let i = 0; i < routeCoordinates.length; i += sampleRate) {
        const dist = getDistance(point, routeCoordinates[i]);
        if (dist < minDistance) {
            minDistance = dist;
        }
    }

    return minDistance;
}
/**
 * Get metrics for a point relative to the route
 * Returns the minimum distance to the route and the index of the closest point
 * Used for sorting stops by their actual position along the route
 */
export function getRouteMetrics(
    point: { lat: number; lng: number },
    routeCoordinates: RoutePoint[]
): { minDistance: number; routeIndex: number; matchedPoint: RoutePoint } {
    let minDistance = Infinity;
    let routeIndex = -1;
    let matchedPoint = routeCoordinates[0];

    // Sample rate can be 1 for maximum precision, or higher for performance
    // For sorting, we need decent precision, so step 1 or 2 is good.
    const step = 2;

    for (let i = 0; i < routeCoordinates.length; i += step) {
        const dist = getDistance(point, routeCoordinates[i]);
        if (dist < minDistance) {
            minDistance = dist;
            routeIndex = i;
            matchedPoint = routeCoordinates[i];
        }
    }

    return { minDistance, routeIndex, matchedPoint };
}
