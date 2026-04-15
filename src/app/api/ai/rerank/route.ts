import { NextRequest, NextResponse } from 'next/server';
import { clientSideRerank } from '@/lib/ai';
import type { AICandidate, Persona, PaceLevel, BudgetLevel } from '@/types';

interface RerankBody {
    candidates: AICandidate[];
    persona: Persona;
    pace: PaceLevel;
    budget: BudgetLevel;
}

/**
 * Heuristic re-rank endpoint.
 * Invoked by the slider UI whenever pace/budget changes — no OpenRouter call.
 * Lives on the server to keep the client bundle lean and to centralize scoring.
 */
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as RerankBody;
        if (!Array.isArray(body.candidates) || !body.persona || !body.pace || !body.budget) {
            return NextResponse.json(
                { error: 'Missing candidates/persona/pace/budget' },
                { status: 400 },
            );
        }
        const stops = clientSideRerank(body.candidates, body.persona, body.pace, body.budget);
        return NextResponse.json({ stops });
    } catch (err) {
        console.error('Rerank API error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
