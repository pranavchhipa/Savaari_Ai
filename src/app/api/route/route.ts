import { NextRequest, NextResponse } from 'next/server';
import { RouteOption, RoutePoint } from '@/types';

const GOOGLE_ROUTES_API = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

// Classify route based on characteristics
function classifyRoute(
    route: { distanceKm: number; durationMinutes: number; tollPrice: number },
    allRoutes: { distanceKm: number; durationMinutes: number; tollPrice: number }[],
    index: number
): { label: string; highlights: string[] } {
    const fastest = allRoutes.reduce((min, r) => r.durationMinutes < min.durationMinutes ? r : min, allRoutes[0]);
    const shortest = allRoutes.reduce((min, r) => r.distanceKm < min.distanceKm ? r : min, allRoutes[0]);
    const cheapestToll = allRoutes.reduce((min, r) => r.tollPrice < min.tollPrice ? r : min, allRoutes[0]);

    const highlights: string[] = [];
    let label = 'Alternative Route';

    if (route === fastest && route === shortest) {
        label = 'Recommended Route';
        highlights.push('Fastest & shortest');
    } else if (route.durationMinutes === fastest.durationMinutes) {
        label = 'Fastest Route';
        highlights.push(`Saves ${Math.round((allRoutes[allRoutes.length - 1].durationMinutes - route.durationMinutes))} min`);
    } else if (route.distanceKm === shortest.distanceKm) {
        label = 'Shortest Route';
        highlights.push(`${Math.round(route.distanceKm)} km`);
    } else if (route.tollPrice === 0 && cheapestToll.tollPrice === route.tollPrice) {
        label = 'Toll-Free Route';
        highlights.push('No tolls');
    } else if (route.durationMinutes > fastest.durationMinutes * 1.15) {
        label = 'Scenic Route';
        highlights.push('More to explore');
    }

    if (route.tollPrice > 0) {
        highlights.push(`Tolls: ₹${route.tollPrice}`);
    } else if (allRoutes.some(r => r.tollPrice > 0)) {
        highlights.push('No tolls');
    }

    // Fallback for first route
    if (index === 0 && label === 'Alternative Route') {
        label = 'Recommended Route';
    }

    return { label, highlights };
}

// Route colors for map polylines
const ROUTE_COLORS = ['#2563EB', '#8B5CF6', '#059669'];

// Fallback to OSRM (free, open-source routing)
async function getRouteFromOSRM(start: { lat: number; lng: number }, end: { lat: number; lng: number }) {
    try {
        const url = `${OSRM_API}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=polyline&alternatives=true`;
        console.log('[OSRM] Fetching route from:', url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`OSRM failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            throw new Error('OSRM: No route found');
        }

        const { decode } = await import('@googlemaps/polyline-codec');

        // Process all routes (OSRM supports alternatives)
        const routeOptions: RouteOption[] = data.routes.slice(0, 3).map((route: { geometry: string; distance: number; duration: number }, index: number) => {
            const decodedPath = decode(route.geometry);
            const coordinates: RoutePoint[] = decodedPath.map((point: [number, number]) => ({
                lat: point[0],
                lng: point[1]
            }));

            const distanceKm = route.distance / 1000;
            const durationMinutes = route.duration / 60;

            return {
                id: `route-${index}`,
                label: index === 0 ? 'Recommended Route' : index === 1 ? 'Alternative Route' : 'Scenic Route',
                coordinates,
                distanceKm,
                durationMinutes,
                tollInfo: undefined,
                isRecommended: index === 0,
                highlights: index === 0 ? ['Fastest route'] : ['Alternative path'],
                color: ROUTE_COLORS[index] || ROUTE_COLORS[0],
            };
        });

        const primary = routeOptions[0];

        return {
            coordinates: primary.coordinates,
            distanceKm: primary.distanceKm,
            durationMinutes: primary.durationMinutes,
            tollInfo: undefined,
            alternativeRoutes: routeOptions,
            selectedRouteId: 'route-0',
            source: 'osrm',
        };
    } catch (error) {
        console.error('[OSRM] Error:', error);
        return null;
    }
}

// Primary: Google Routes API with alternative routes
async function getRouteFromGoogle(start: { lat: number; lng: number }, end: { lat: number; lng: number }) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error('[Google] GOOGLE_MAPS_API_KEY is not set!');
        return null;
    }

    const requestBody = {
        origin: {
            location: {
                latLng: {
                    latitude: start.lat,
                    longitude: start.lng
                }
            }
        },
        destination: {
            location: {
                latLng: {
                    latitude: end.lat,
                    longitude: end.lng
                }
            }
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        computeAlternativeRoutes: true,
        extraComputations: ['TOLLS'],
        routeModifiers: {
            vehicleInfo: {
                emissionType: 'GASOLINE'
            }
        }
    };

    try {
        console.log('[Google] Fetching routes with alternatives...');
        const response = await fetch(GOOGLE_ROUTES_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.travelAdvisory.tollInfo,routes.description,routes.routeLabels'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Google] API Error:', response.status, errorText);
            return null;
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            console.error('[Google] No routes in response');
            return null;
        }

        const { decode } = await import('@googlemaps/polyline-codec');

        // Extract toll info helper
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extractTollInfo = (route: any) => {
            if (route.travelAdvisory?.tollInfo?.estimatedPrice) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const price = route.travelAdvisory.tollInfo.estimatedPrice.reduce((acc: number, curr: any) => {
                    return acc + parseInt(curr.units || '0');
                }, 0);
                const currency = route.travelAdvisory.tollInfo.estimatedPrice[0]?.currencyCode || 'INR';
                return { estimatedPrice: price, currency };
            }
            return undefined;
        };

        // Parse duration string (e.g., "12345s" -> minutes)
        const parseDuration = (duration: string) => parseInt(duration.replace('s', '')) / 60;

        // Process all routes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const routeMetrics = data.routes.slice(0, 3).map((route: any) => ({
            distanceKm: route.distanceMeters / 1000,
            durationMinutes: parseDuration(route.duration),
            tollPrice: extractTollInfo(route)?.estimatedPrice || 0,
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const routeOptions: RouteOption[] = data.routes.slice(0, 3).map((route: any, index: number) => {
            const decodedPath = decode(route.polyline.encodedPolyline);
            const coordinates: RoutePoint[] = decodedPath.map((point: [number, number]) => ({
                lat: point[0],
                lng: point[1]
            }));

            const distanceKm = route.distanceMeters / 1000;
            const durationMinutes = parseDuration(route.duration);
            const tollInfo = extractTollInfo(route);
            const { label, highlights } = classifyRoute(routeMetrics[index], routeMetrics, index);

            // Add Google's description if available
            if (route.description) {
                highlights.unshift(`Via ${route.description}`);
            }

            return {
                id: `route-${index}`,
                label,
                description: route.description || undefined,
                coordinates,
                distanceKm,
                durationMinutes,
                tollInfo,
                isRecommended: index === 0,
                highlights,
                color: ROUTE_COLORS[index] || ROUTE_COLORS[0],
            };
        });

        const primary = routeOptions[0];

        console.log(`[Google] Fetched ${routeOptions.length} routes successfully`);
        return {
            coordinates: primary.coordinates,
            distanceKm: primary.distanceKm,
            durationMinutes: primary.durationMinutes,
            tollInfo: primary.tollInfo,
            alternativeRoutes: routeOptions,
            selectedRouteId: 'route-0',
            source: 'google',
        };
    } catch (error) {
        console.error('[Google] Error:', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { start, end } = body;

        if (!start || !end) {
            return NextResponse.json(
                { error: 'Missing start or end location' },
                { status: 400 }
            );
        }

        console.log('=== ROUTE API REQUEST ===');
        console.log('From:', start.name || `${start.lat},${start.lng}`);
        console.log('To:', end.name || `${end.lat},${end.lng}`);

        // Try Google first, fallback to OSRM
        let routeData = await getRouteFromGoogle(start, end);

        if (!routeData) {
            console.log('[Fallback] Using OSRM routing...');
            routeData = await getRouteFromOSRM(start, end);
        }

        if (!routeData) {
            console.error('[Error] Both Google and OSRM failed');
            return NextResponse.json(
                { error: 'Could not fetch route from any provider' },
                { status: 502 }
            );
        }

        console.log(`[Success] ${routeData.alternativeRoutes?.length || 1} routes via ${routeData.source}`);
        console.log('=========================');

        return NextResponse.json(routeData);

    } catch (error) {
        console.error('[Route API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}
