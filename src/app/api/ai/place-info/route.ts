import { NextRequest, NextResponse } from 'next/server';
import { getPlaceInfo } from '@/lib/ai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { placeName, placeType, nearCity } = body;

        if (!placeName || !placeType) {
            return NextResponse.json(
                { error: 'Missing required fields: placeName, placeType' },
                { status: 400 }
            );
        }

        const placeInfo = await getPlaceInfo(placeName);

        if (!placeInfo) {
            return NextResponse.json(
                { error: 'Failed to get place info' },
                { status: 500 }
            );
        }

        return NextResponse.json(placeInfo);
    } catch (error) {
        console.error('Place info API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
