'use server';

import { RouteData, RoutePoint, Location } from '@/types';

const GOOGLE_ROUTES_API = 'https://routes.googleapis.com/directions/v2:computeRoutes';

export async function getRoute(
    start: Location,
    end: Location
): Promise<RouteData | null> {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            throw new Error('Google Maps API Key not configured');
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
            routingPreference: 'TRAFFIC_AWARE',
            extraComputations: ['TOLLS'],
            routeModifiers: {
                vehicleInfo: {
                    emissionType: 'GASOLINE'
                }
            }
        };

        const response = await fetch(GOOGLE_ROUTES_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.travelAdvisory.tollInfo'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('------- GOOGLE ROUTES API ERROR -------');
            console.error(`Status: ${response.status}`);
            console.error(`Response: ${errorText}`);
            console.error('Request Body:', JSON.stringify(requestBody, null, 2));
            console.error('---------------------------------------');
            throw new Error(`Google Routes API failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            throw new Error('No route found');
        }

        const route = data.routes[0];

        // Decode polyline
        const { decode } = await import('@googlemaps/polyline-codec');
        const decodedPath = decode(route.polyline.encodedPolyline);

        // Convert to RoutePoint[]
        const coordinates: RoutePoint[] = decodedPath.map((point: [number, number]) => ({
            lat: point[0],
            lng: point[1]
        }));

        // Extract toll info
        let tollInfo = undefined;
        if (route.travelAdvisory?.tollInfo?.estimatedPrice) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const price = route.travelAdvisory.tollInfo.estimatedPrice.reduce((acc: number, curr: any) => {
                return acc + parseInt(curr.units || '0');
            }, 0);

            // Assuming the first currency is representative or dominant
            const currency = route.travelAdvisory.tollInfo.estimatedPrice[0]?.currencyCode || 'INR';

            tollInfo = {
                estimatedPrice: price,
                currency: currency
            };
        }

        return {
            coordinates,
            distanceKm: route.distanceMeters / 1000,
            durationMinutes: parseInt(route.duration.replace('s', '')) / 60,
            tollInfo
        };
    } catch (error) {
        console.error('Routing error:', error);
        return null;
    }
}
