// Server-only module (imports env vars + calls OpenRouter).
// Not marked 'use server' because it exports both async (rerankStops) and
// sync (clientSideRerank) functions — 'use server' requires all exports async.

import type {
  AICandidate,
  RerankedStop,
  Persona,
  PaceLevel,
  BudgetLevel,
  TravelContext,
  StopBadge,
} from '@/types';
import { stageBPrompt, paceCaps } from './prompts';
import { fallbackRerankedStops } from './fallback';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

const stageBCache = new Map<string, { data: RerankedStop[]; timestamp: number }>();
const STAGE_B_TTL = 30 * 60 * 1000; // 30 minutes

function stageBCacheKey(ctx: TravelContext, persona: Persona, pace: PaceLevel, budget: BudgetLevel): string {
  return `${ctx.source.toLowerCase()}-${ctx.destination.toLowerCase()}-${persona}-${pace}-${budget}`;
}

export interface RerankInput {
  ctx: TravelContext;
  persona: Persona;
  pace: PaceLevel;
  budget: BudgetLevel;
  candidates: AICandidate[];
}

export async function rerankStops(input: RerankInput): Promise<RerankedStop[]> {
  const { ctx, persona, pace, budget, candidates } = input;
  const key = stageBCacheKey(ctx, persona, pace, budget);
  const cached = stageBCache.get(key);
  if (cached && Date.now() - cached.timestamp < STAGE_B_TTL) {
    console.log(`[Sarathi/Stage B] Cache hit: ${key}`);
    return cached.data;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || candidates.length === 0) {
    console.warn('[Sarathi/Stage B] No API key or no candidates — using fallback rerank');
    return fallbackRerankedStops(ctx.source, ctx.destination, ctx.distanceKm, persona, pace, budget).stops;
  }

  // Slim candidates down to what the prompt needs (keeps token usage lean).
  const slim = candidates.map((c) => ({
    name: c.name,
    type: c.type,
    approximateKm: c.approximateKm,
    detourKm: c.detourKm,
    tags: c.tags ?? [],
    entryFeeInr: c.entryFeeInr ?? 0,
  }));

  const prompt = stageBPrompt({ ctx, persona, pace, budget, candidates: slim });

  try {
    const response = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://savaari.com',
        'X-Title': 'Savaari - Sarathi AI (Stage B)',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are Sarathi, re-ranking stops for a specific persona. Respond with valid JSON only — no markdown fences.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      console.error('[Sarathi/Stage B] API error:', response.status);
      return clientSideRerank(candidates, persona, pace, budget);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return clientSideRerank(candidates, persona, pace, budget);

    const clean = raw.startsWith('```') ? raw.replace(/```json?\n?/g, '').replace(/```$/g, '').trim() : raw;
    const parsed = JSON.parse(clean) as { stops?: RerankedStop[] };
    if (!Array.isArray(parsed.stops)) return clientSideRerank(candidates, persona, pace, budget);

    const stops: RerankedStop[] = parsed.stops.map((s, i) => ({
      ...s,
      id: `rr-${persona}-${i}`,
      detourKm: Math.min(20, s.detourKm ?? 5),
      rating: Math.min(5, Math.max(1, s.rating ?? 4)),
      personaRelevance: Math.min(1, Math.max(0, s.personaRelevance ?? 0.5)),
      badges: Array.isArray(s.badges) ? s.badges : (['must-visit'] as StopBadge[]),
    }));

    stageBCache.set(key, { data: stops, timestamp: Date.now() });
    console.log(`[Sarathi/Stage B] Reranked ${stops.length} stops for persona=${persona}, pace=${pace}, budget=${budget}`);
    return stops;
  } catch (err) {
    console.error('[Sarathi/Stage B] Exception:', err);
    return clientSideRerank(candidates, persona, pace, budget);
  }
}

/**
 * Heuristic re-rank used when AI is unavailable or as the slider-driven
 * client-side path (exposed via /api/ai/rerank — no AI tokens spent).
 */
export function clientSideRerank(
  candidates: AICandidate[],
  persona: Persona,
  pace: PaceLevel,
  budget: BudgetLevel,
): RerankedStop[] {
  const { maxStops, maxDetourKm } = paceCaps(pace);

  const personaWeight = (c: AICandidate): number => {
    const tags = new Set(c.tags ?? []);
    switch (persona) {
      case 'family':
        return (tags.has('kid-safe') ? 0.6 : 0)
          + (tags.has('scenic') ? 0.2 : 0)
          + (c.badges?.includes('family-friendly') ? 0.2 : 0);
      case 'couple':
        return (tags.has('romantic') ? 0.5 : 0)
          + (tags.has('scenic') ? 0.3 : 0)
          + (tags.has('photo-op') ? 0.2 : 0);
      case 'friends':
        return (tags.has('adventure') ? 0.5 : 0)
          + (tags.has('photo-op') ? 0.3 : 0)
          + (tags.has('scenic') ? 0.2 : 0);
      case 'solo':
        return (tags.has('offbeat') ? 0.5 : 0)
          + (tags.has('cultural-depth') ? 0.3 : 0)
          + (c.detourKm <= 8 ? 0.2 : 0);
      case 'business':
        return (tags.has('quick-stop') ? 0.5 : 0)
          + (c.detourKm <= 2 ? 0.5 : 0);
    }
  };

  const budgetPass = (c: AICandidate): boolean => {
    const fee = c.entryFeeInr ?? 0;
    if (budget === 'budget') return fee <= 100;
    if (budget === 'standard') return fee <= 500;
    return true; // premium: no cap
  };

  return candidates
    .filter((c) => (c.detourKm ?? 0) <= maxDetourKm)
    .filter(budgetPass)
    .map((c) => ({
      candidate: c,
      score: personaWeight(c) * 0.7 + ((c.rating ?? 4) / 5) * 0.3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxStops)
    .map((x, i) => ({
      ...x.candidate,
      id: `rr-h-${persona}-${i}`,
      personaRelevance: x.score,
      personaReason: undefined,
    }));
}
