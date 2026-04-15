import { NextRequest, NextResponse } from 'next/server';
import { generateRouteStops, generateStopsForContext } from '@/lib/ai';
import { ENABLE_PERSONAS } from '@/lib/flags';
import type { TravelContext, Persona, PaceLevel, BudgetLevel } from '@/types';

interface GenerateStopsBody {
    source: string;
    destination: string;
    distanceKm: number;
    // Personalization v2 (all optional to preserve legacy callers):
    carType?: string;
    pickupDate?: string;
    pickupTime?: string;
    totalDays?: number;
    persona?: Persona | null;
    pace?: PaceLevel;
    budget?: BudgetLevel;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as GenerateStopsBody;
        const { source, destination, distanceKm } = body;

        if (!source || !destination || !distanceKm) {
            return NextResponse.json(
                { error: 'Missing required fields: source, destination, distanceKm' },
                { status: 400 },
            );
        }

        // Legacy path: feature flag off or no persona context in body.
        if (!ENABLE_PERSONAS || (!body.carType && !body.persona)) {
            const legacy = await generateRouteStops(source, destination, distanceKm);
            return NextResponse.json(legacy ?? { error: 'Failed to generate', fallback: true });
        }

        const ctx: TravelContext = {
            source,
            destination,
            distanceKm,
            carType: body.carType ?? 'Sedan',
            pickupDate: body.pickupDate ?? new Date().toISOString().split('T')[0],
            pickupTime: body.pickupTime ?? '09:00',
            totalDays: body.totalDays ?? 1,
        };

        const result = await generateStopsForContext({
            ctx,
            persona: body.persona ?? null,
            pace: body.pace ?? 'balanced',
            budget: body.budget ?? 'standard',
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Generate stops API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', fallback: true },
            { status: 200 },
        );
    }
}
