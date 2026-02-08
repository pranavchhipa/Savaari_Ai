import { RouteData, RoutePoint, Location, Stop } from '@/types';

const OSRM_API = 'https://router.project-osrm.org';

export async function getRoute(
    start: Location,
    end: Location
): Promise<RouteData | null> {
    try {
        const response = await fetch(
            `${OSRM_API}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        );

        if (!response.ok) throw new Error('Routing failed');

        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes?.[0]) {
            throw new Error('No route found');
        }

        const route = data.routes[0];
        const coordinates: RoutePoint[] = route.geometry.coordinates.map(
            (coord: [number, number]) => ({
                lat: coord[1],
                lng: coord[0],
            })
        );

        return {
            coordinates,
            distanceKm: route.distance / 1000,
            durationMinutes: route.duration / 60,
        };
    } catch (error) {
        console.error('Routing error:', error);
        return null;
    }
}

// Generate realistic stops along a route
export function generateStopsAlongRoute(
    routeCoordinates: RoutePoint[],
    source: Location,
    destination: Location,
    totalDistanceKm: number
): Stop[] {
    const stops: Stop[] = [];
    const numStops = Math.min(6, Math.floor(totalDistanceKm / 50)); // 1 stop every ~50km

    const stopTypes: Array<{
        type: Stop['type'];
        names: string[];
        duration: number;
        icon: string;
    }> = [
            { type: 'restaurant', names: ['Highway Dhaba', 'Food Court', 'Rest Stop Cafe', 'Local Cuisine Hub'], duration: 45, icon: '🍽️' },
            { type: 'viewpoint', names: ['Scenic Viewpoint', 'Valley View', 'Mountain Vista', 'River Crossing'], duration: 20, icon: '📸' },
            { type: 'heritage', names: ['Ancient Fort', 'Historic Temple', 'Palace Gardens', 'Museum'], duration: 60, icon: '🏛️' },
            { type: 'fuel', names: ['HP Petrol Pump', 'Indian Oil Station', 'Bharat Petroleum'], duration: 15, icon: '⛽' },
            { type: 'rest', names: ['Rest Area', 'Coffee Stop', 'Refreshment Point'], duration: 15, icon: '☕' },
        ];

    // Add start point
    stops.push({
        id: 'start',
        name: source.name,
        type: 'start',
        location: source,
        duration: 0,
        suggestedTime: '06:00 AM',
        description: 'Trip starting point',
    });

    // Generate intermediate stops
    for (let i = 1; i <= numStops; i++) {
        const progress = i / (numStops + 1);
        const coordIndex = Math.floor(progress * (routeCoordinates.length - 1));
        const coord = routeCoordinates[coordIndex];

        const stopType = stopTypes[i % stopTypes.length];
        const stopName = stopType.names[Math.floor(Math.random() * stopType.names.length)];

        const startHour = 6;
        const travelTime = progress * (totalDistanceKm / 40); // Assuming 40 km/h average
        const arrivalHour = startHour + travelTime;
        const hour = Math.floor(arrivalHour) % 24;
        const minutes = Math.floor((arrivalHour % 1) * 60);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

        stops.push({
            id: `stop-${i}`,
            name: stopName,
            type: stopType.type,
            location: {
                name: stopName,
                displayName: `${stopName} on route to ${destination.name}`,
                lat: coord.lat,
                lng: coord.lng,
            },
            duration: stopType.duration,
            suggestedTime: `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`,
            description: `${stopType.icon} Suggested ${stopType.duration} min stop`,
            isSelected: false,
        });
    }

    // Add end point
    const endTime = 6 + (totalDistanceKm / 40);
    const endHour = Math.floor(endTime) % 24;
    const endMinutes = Math.floor((endTime % 1) * 60);
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const endDisplayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;

    stops.push({
        id: 'end',
        name: destination.name,
        type: 'end',
        location: destination,
        duration: 0,
        suggestedTime: `${String(endDisplayHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`,
        description: 'Trip destination',
    });

    return stops;
}

// Get midpoint for night halt suggestion
export function getMidpointForNightHalt(
    routeCoordinates: RoutePoint[],
    totalDistanceKm: number
): { location: RoutePoint; suggestedCity: string } | null {
    if (totalDistanceKm < 400) return null; // No night halt needed for short trips

    const midIndex = Math.floor(routeCoordinates.length / 2);
    const midpoint = routeCoordinates[midIndex];

    // Suggest a city name based on approximate location
    const suggestedCities = ['Hospet', 'Chitradurga', 'Tumkur', 'Davangere', 'Hubli', 'Belgaum'];
    const suggestedCity = suggestedCities[Math.floor(Math.random() * suggestedCities.length)];

    return {
        location: midpoint,
        suggestedCity,
    };
}
