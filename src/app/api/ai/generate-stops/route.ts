import { NextRequest, NextResponse } from 'next/server';
import { generateRouteStops } from '@/lib/ai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { source, destination, distanceKm } = body;

        if (!source || !destination || !distanceKm) {
            return NextResponse.json(
                { error: 'Missing required fields: source, destination, distanceKm' },
                { status: 400 }
            );
        }

        const routeStops = await generateRouteStops(source, destination, distanceKm);

        if (!routeStops) {
            return NextResponse.json(
                { error: 'Failed to generate recommendations', fallback: true },
                { status: 200 }
            );
        }

        return NextResponse.json(routeStops);
    } catch (error) {
        console.error('Generate stops API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', fallback: true },
            { status: 200 }
        );
    }
}
