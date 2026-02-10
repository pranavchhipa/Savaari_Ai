import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const origin = searchParams.get('origin'); // "lat,lng"
    const destination = searchParams.get('destination'); // "lat,lng"

    if (!origin || !destination) {
        return NextResponse.json({ error: 'Origin and Destination are required' }, { status: 400 });
    }

    if (!GOOGLE_MAPS_API_KEY) {
        return NextResponse.json({ error: 'Server API key configuration missing' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&alternatives=true&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Maps API error: ${data.status}`);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Failed to fetch from Google Maps' }, { status: 500 });
    }
}
