import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Google Places Text Search API (New)
 * Used to validate AI-recommended stops with real coordinates, ratings, and photos
 * 
 * POST /api/google/places-search
 * Body: { query: string, locationBias?: { lat: number, lng: number, radius: number } }
 */
export async function POST(request: NextRequest) {
    if (!GOOGLE_MAPS_API_KEY) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { query, locationBias } = body;

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Use Google Places Text Search (New) API
        const searchUrl = new URL('https://places.googleapis.com/v1/places:searchText');

        const requestBody: Record<string, unknown> = {
            textQuery: `${query} India`,
            languageCode: 'en',
            maxResultCount: 5,
            regionCode: 'IN',
        };

        // Add location bias if provided (to search near the route)
        if (locationBias) {
            requestBody.locationBias = {
                circle: {
                    center: {
                        latitude: locationBias.lat,
                        longitude: locationBias.lng,
                    },
                    radius: locationBias.radius || 50000, // 50km default
                },
            };
        }

        const response = await fetch(searchUrl.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.types,places.editorialSummary,places.googleMapsUri',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Places API error:', response.status, errorText);
            return NextResponse.json({ error: 'Places search failed', details: errorText }, { status: response.status });
        }

        const data = await response.json();

        // Transform to a simpler format
        const places = (data.places || []).map((place: Record<string, unknown>) => {
            const location = place.location as { latitude: number; longitude: number } | undefined;
            const displayName = place.displayName as { text: string } | undefined;
            const editorial = place.editorialSummary as { text: string } | undefined;
            const photos = place.photos as Array<{ name: string }> | undefined;

            return {
                id: place.id,
                name: displayName?.text || '',
                address: place.formattedAddress || '',
                lat: location?.latitude || 0,
                lng: location?.longitude || 0,
                rating: place.rating || 0,
                reviewCount: place.userRatingCount || 0,
                description: editorial?.text || '',
                types: place.types || [],
                googleMapsUrl: place.googleMapsUri || '',
                // Return first photo reference for fetching later
                photoRef: photos?.[0]?.name || null,
            };
        });

        return NextResponse.json({ places });
    } catch (error) {
        console.error('Places search error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
