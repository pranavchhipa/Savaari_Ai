import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Google Places Photos API proxy
 * Fetches a photo for a place using the photo reference from Places API
 * 
 * GET /api/google/places-photo?ref=PHOTO_REFERENCE&maxWidth=400
 */
export async function GET(request: NextRequest) {
    if (!GOOGLE_MAPS_API_KEY) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const photoRef = searchParams.get('ref');
    const maxWidth = searchParams.get('maxWidth') || '400';

    if (!photoRef) {
        return NextResponse.json({ error: 'Photo reference (ref) is required' }, { status: 400 });
    }

    try {
        // Use Places API v1 photo endpoint
        const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(photoUrl, {
            redirect: 'follow',
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch photo' }, { status: response.status });
        }

        // Stream the image back
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
        });
    } catch (error) {
        console.error('Places photo error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
