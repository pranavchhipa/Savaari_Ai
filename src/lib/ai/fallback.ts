import type { AICandidate, RerankedStop, Persona, PaceLevel, BudgetLevel, StopBadge } from '@/types';

// Reuse the legacy tourist data as the candidate pool. We import it via the
// shim in @/lib/ai — see Task 6. `getLegacyRouteFallback` returns null when
// no curated data exists for the route.
import { getLegacyRouteFallback } from '@/lib/ai';

/**
 * Persona-specific biases applied over the shared candidate pool.
 * Each filter returns true if the stop should REMAIN for this persona.
 */
const PERSONA_FILTERS: Record<Persona, (stop: AICandidate) => boolean> = {
  family: (s) => {
    const name = s.name.toLowerCase();
    // Keep family-friendly, drop adventure/cliffside
    if (s.badges?.includes('family-friendly')) return true;
    if (name.includes('adventure') || name.includes('rafting') || name.includes('paragli')) return false;
    return true;
  },
  couple: (s) => {
    // Prefer scenic/viewpoint/heritage, drop theme-parky stuff
    if (s.type === 'adventure') return false;
    return true;
  },
  friends: () => true,   // friends can do most things
  solo: (s) => s.type !== 'adventure' || (s.detourKm ?? 0) < 10, // solo avoids long adventure detours
  business: (s) => (s.detourKm ?? 0) <= 3,                        // hard zero-detour rule
};

const PERSONA_REASONS: Record<Persona, string> = {
  family: 'Safe for kids with easy access and clean facilities',
  couple: 'Quieter, photogenic spot suited to a romantic pace',
  friends: 'Group-friendly and high on photo-ops',
  solo: 'Flexible, character-filled stop great for a solo traveler',
  business: 'Minimal detour from the highway — quick and reliable',
};

export function fallbackRerankedStops(
  source: string,
  destination: string,
  distanceKm: number,
  persona: Persona,
  pace: PaceLevel,
  _budget: BudgetLevel,
): { stops: RerankedStop[]; fallback: true } {
  const legacy = getLegacyRouteFallback(source, destination, distanceKm);
  const candidates: AICandidate[] = (legacy?.stops ?? []).map((s) => ({
    ...s,
    tags: s.badges?.includes('family-friendly') ? ['kid-safe'] : [],
    entryFeeInr: 0,
  }));

  const filter = PERSONA_FILTERS[persona];
  const reason = PERSONA_REASONS[persona];
  const maxStops = pace === 'relaxed' ? 5 : pace === 'balanced' ? 7 : 12;

  const stops: RerankedStop[] = candidates
    .filter(filter)
    .slice(0, maxStops)
    .map((c, i) => ({
      ...c,
      id: `fb-${persona}-${i}`,
      personaRelevance: 0.7,
      personaReason: reason,
      badges: [...(c.badges ?? []), 'must-visit' as StopBadge].filter((b, idx, arr) => arr.indexOf(b) === idx),
    }));

  return { stops, fallback: true };
}
