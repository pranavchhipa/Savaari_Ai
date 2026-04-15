'use server';

import type { AICandidate, TravelContext } from '@/types';
import { stageAPrompt } from './prompts';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

// Stage A cache: keyed by route + car + season + daypart (persona-agnostic).
// Survives persona switches — changing persona only re-runs Stage B.
const stageACache = new Map<string, { data: AICandidate[]; timestamp: number }>();
const STAGE_A_TTL = 60 * 60 * 1000; // 1 hour

function stageACacheKey(ctx: TravelContext): string {
  const season = new Date(ctx.pickupDate).getMonth();
  const daypart = parseInt(ctx.pickupTime.split(':')[0], 10);
  return `${ctx.source.toLowerCase()}-${ctx.destination.toLowerCase()}-${ctx.carType}-${season}-${daypart}`;
}

export async function generateCandidates(ctx: TravelContext): Promise<AICandidate[] | null> {
  const key = stageACacheKey(ctx);
  const cached = stageACache.get(key);
  if (cached && Date.now() - cached.timestamp < STAGE_A_TTL) {
    console.log(`[Sarathi/Stage A] Cache hit: ${key}`);
    return cached.data;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('[Sarathi/Stage A] No OPENROUTER_API_KEY — returning null; caller will use fallback');
    return null;
  }

  const prompt = stageAPrompt({ ctx });

  try {
    const response = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://savaari.com',
        'X-Title': 'Savaari - Sarathi AI (Stage A)',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are Sarathi, an expert Indian travel planner. Respond with valid JSON only — no markdown fences. Only recommend REAL, FAMOUS attractions physically on the driving route.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      console.error('[Sarathi/Stage A] API error:', response.status);
      return null;
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;

    const clean = raw.startsWith('```') ? raw.replace(/```json?\n?/g, '').replace(/```$/g, '').trim() : raw;
    const parsed = JSON.parse(clean) as { stops?: AICandidate[] };
    if (!Array.isArray(parsed.stops)) return null;

    const candidates: AICandidate[] = parsed.stops
      .filter((s) => s.name && typeof s.approximateKm === 'number' && s.approximateKm >= 0)
      .map((s, i) => ({
        ...s,
        id: `cand-${i}`,
        detourKm: Math.min(20, s.detourKm ?? 5),
        rating: Math.min(5, Math.max(1, s.rating ?? 4)),
        tags: Array.isArray(s.tags) ? s.tags : [],
        entryFeeInr: typeof s.entryFeeInr === 'number' ? s.entryFeeInr : 0,
      }))
      .sort((a, b) => a.approximateKm - b.approximateKm);

    stageACache.set(key, { data: candidates, timestamp: Date.now() });
    console.log(`[Sarathi/Stage A] Generated ${candidates.length} candidates for ${ctx.source} → ${ctx.destination}`);
    return candidates;
  } catch (err) {
    console.error('[Sarathi/Stage A] Exception:', err);
    return null;
  }
}
