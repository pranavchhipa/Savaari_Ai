import type { Persona, PaceLevel, BudgetLevel, TravelContext } from '@/types';

// ===== Persona rule blocks =====

const PERSONA_RULES: Record<Persona, string> = {
  family: `PERSONA: Family Weekend (parents + children).
  - Only include KID-SAFE stops with easy restroom access and clean food options.
  - Prefer heritage sites with educational value, open-air parks/gardens, zoos, playgrounds, and family-friendly temples.
  - AVOID: cliffside viewpoints without railings, adventure sports (rafting/paragliding/trekking), nightlife, remote offbeat trails.
  - Tag each stop with "kid-safe" when it fits.`,

  couple: `PERSONA: Romantic Escape (2 adults).
  - Prioritize scenic viewpoints, sunset/sunrise spots, intimate cafes, lakeside walks, photogenic heritage.
  - Prefer quieter, less-crowded stops over mass-tourist hotspots.
  - AVOID: chaotic bazaars, theme parks, crowded temples at peak hours.
  - Tag stops with "romantic", "scenic", or "photo-op" when fitting.`,

  friends: `PERSONA: Friends Adventure (3-6 adults).
  - Include adventure activities (rafting, ziplining, trekking, boating), photo-op spots, lively cafes, offbeat experiences.
  - Higher-energy stops are welcome; group-photo opportunities are a plus.
  - AVOID: quiet meditation halls, purely educational museums with no interactive element.
  - Tag stops with "adventure", "photo-op", "scenic".`,

  solo: `PERSONA: Solo Explorer (1 adult).
  - Offbeat cultural stops, independent museums, quiet viewpoints, small towns with character.
  - Prefer flexible, walkable stops over rigid checklist tourism.
  - AVOID: packaged group-tour spots, places that strictly require pairs/groups (e.g. romantic couple-only viewpoints).
  - Tag stops with "offbeat", "cultural-depth".`,

  business: `PERSONA: Business Quick (1-2 adults, work-first).
  - Absolute minimum detours. Clean restrooms, reliable food, fast turnaround.
  - NO sightseeing unless detour is effectively zero (<2 km off the highway).
  - Prefer well-reviewed, predictable chains or heritage spots that are literally on the route.
  - Tag stops with "quick-stop".`,
};

// ===== Pace rule blocks =====

const PACE_RULES: Record<PaceLevel, { text: string; maxStops: number; maxDetourKm: number }> = {
  relaxed: {
    text: '- PACE: Relaxed — 3 to 5 stops total, each 60-90 minutes, max detour 5 km from the highway.',
    maxStops: 5,
    maxDetourKm: 5,
  },
  balanced: {
    text: '- PACE: Balanced — 5 to 7 stops total, each 30-60 minutes, max detour 10 km from the highway.',
    maxStops: 7,
    maxDetourKm: 10,
  },
  packed: {
    text: '- PACE: Packed — 8 to 12 stops total, each 20-45 minutes, max detour 20 km from the highway.',
    maxStops: 12,
    maxDetourKm: 20,
  },
};

// ===== Budget rule blocks =====

const BUDGET_RULES: Record<BudgetLevel, string> = {
  budget: '- BUDGET: Budget — prefer free/donation-based stops. No paid attractions above ₹100 per adult.',
  standard: '- BUDGET: Standard — typical Indian tourist pricing acceptable (₹100-500 range OK).',
  premium: '- BUDGET: Premium — paid heritage (₹500+), unique ticketed experiences, and boutique stops welcome.',
};

// ===== Context builders =====

function carConstraintsFor(carType: string): string {
  const t = carType.toLowerCase();
  if (t.includes('hatch')) return 'compact hatchback — avoid stops requiring rough-road access or large luggage handling';
  if (t.includes('suv')) return 'SUV — comfortable for rough-road stops, fine for long detours';
  if (t.includes('muv') || t.includes('ertiga') || t.includes('innova')) return 'MUV/MPV — 7-seater; prefer stops with ample parking';
  if (t.includes('sedan')) return 'sedan — smooth highway ride, avoid unpaved tracks';
  return 'standard cab — avoid extreme terrain';
}

function seasonFor(dateISO: string): 'winter' | 'summer' | 'monsoon' | 'post-monsoon' {
  const month = new Date(dateISO).getMonth(); // 0-11
  if (month >= 10 || month <= 1) return 'winter';     // Nov-Feb
  if (month >= 2 && month <= 4) return 'summer';      // Mar-May
  if (month >= 5 && month <= 8) return 'monsoon';     // Jun-Sep
  return 'post-monsoon';                              // Oct
}

function dayPartFor(timeHHMM: string): 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = parseInt(timeHHMM.split(':')[0], 10);
  if (h < 6) return 'early-morning';
  if (h < 11) return 'morning';
  if (h < 16) return 'afternoon';
  if (h < 20) return 'evening';
  return 'night';
}

// ===== Public API =====

export interface StageAPromptInput {
  ctx: TravelContext;
}

export function stageAPrompt({ ctx }: StageAPromptInput): string {
  const season = seasonFor(ctx.pickupDate);
  const daypart = dayPartFor(ctx.pickupTime);
  const carConstraints = carConstraintsFor(ctx.carType);
  const needsNightHalt = ctx.distanceKm > 400 || ctx.totalDays > 1;

  return `You are Sarathi, Savaari's expert AI travel advisor for Indian road trips.

CONTEXT
Route: "${ctx.source}" → "${ctx.destination}" (~${Math.round(ctx.distanceKm)} km by road)
Vehicle: ${ctx.carType} — ${carConstraints}
Pickup: ${ctx.pickupDate} at ${ctx.pickupTime} (${season}, ${daypart})
Trip span: ${ctx.totalDays} day(s)

TASK
Generate 12-15 REAL, FAMOUS tourist attractions that physically lie on or within 20 km of the driving route between these two cities. These will be filtered downstream for specific travel personas, so include VARIETY — mix heritage, nature, viewpoints, cultural, adventure, kid-friendly, offbeat.

RULES
- Every stop must be a REAL, NAMED, FAMOUS place any Indian would recognize (Google-searchable).
- approximateKm must be an accurate road distance from source (sorted ascending).
- detourKm <= 20.
- Each stop MUST have a "tags" array from this exact set: kid-safe, scenic, romantic, adventure, offbeat, cultural-depth, quick-stop, paid-entry, free, photo-op. Pick ALL that apply (typically 2-4).
- Include entryFeeInr (0 for free, otherwise approximate per-adult).
- DO NOT include: hotels, petrol pumps, generic dhabas, malls, hospitals, fictional places, or places off the actual route.

OUTPUT (JSON only, no markdown fences):
${outputSchema(needsNightHalt)}`;
}

export interface StageBPromptInput {
  ctx: TravelContext;
  persona: Persona;
  pace: PaceLevel;
  budget: BudgetLevel;
  candidates: Array<{ name: string; type: string; approximateKm: number; detourKm: number; tags?: string[]; entryFeeInr?: number }>;
}

export function stageBPrompt({ ctx, persona, pace, budget, candidates }: StageBPromptInput): string {
  const paceRule = PACE_RULES[pace];
  return `You are Sarathi, re-ranking candidate stops for a specific traveler persona.

ROUTE: "${ctx.source}" → "${ctx.destination}" (~${Math.round(ctx.distanceKm)} km)

${PERSONA_RULES[persona]}

${paceRule.text}

${BUDGET_RULES[budget]}

CANDIDATES (from Stage A):
${JSON.stringify(candidates, null, 2)}

TASK
Pick EXACTLY ${paceRule.maxStops} stops (or fewer if fewer fit) that best match the persona + pace + budget. For each chosen stop:
- Copy the original name, type, approximateKm, detourKm exactly.
- Add personaRelevance (0-1, higher = better fit).
- Add a 1-sentence personaReason describing WHY this suits the persona (e.g. "Kid-safe gardens with clean restrooms and no adventure risks").
- Write a compelling description, whyVisit, and famousFor if Stage A's were generic.
- Reject candidates whose detour > ${paceRule.maxDetourKm} km.
- Reject candidates violating the persona rules above.

OUTPUT (JSON only, no markdown fences):
${rerankedSchema()}`;
}

function outputSchema(needsNightHalt: boolean): string {
  return `{
  "stops": [
    {
      "name": "Exact Famous Place",
      "type": "heritage|tourist|nature|adventure|cultural|viewpoint",
      "description": "2-sentence vivid description",
      "whyVisit": "One compelling reason",
      "famousFor": "What makes it iconic",
      "rating": 4.5,
      "badges": ["must-visit"],
      "approximateKm": 85,
      "detourKm": 3,
      "suggestedDuration": 45,
      "bestTimeToVisit": "morning",
      "tags": ["scenic", "photo-op"],
      "entryFeeInr": 50
    }
  ]${needsNightHalt ? `,
  "nightHalt": { "city": "...", "reason": "...", "approximateKm": 180 }` : ''}
}`;
}

function rerankedSchema(): string {
  return `{
  "stops": [
    {
      "name": "same as candidate",
      "type": "heritage|tourist|nature|adventure|cultural|viewpoint",
      "description": "polished 2-sentence description",
      "whyVisit": "compelling reason tailored to persona",
      "famousFor": "what makes it iconic",
      "rating": 4.6,
      "badges": ["must-visit"],
      "approximateKm": 85,
      "detourKm": 3,
      "suggestedDuration": 45,
      "bestTimeToVisit": "morning",
      "tags": ["kid-safe", "photo-op"],
      "entryFeeInr": 50,
      "personaRelevance": 0.92,
      "personaReason": "Kid-safe gardens with clean restrooms and short walking loop"
    }
  ]
}`;
}

// Exported for reranker.ts to use pace caps at the client-side re-rank step.
export function paceCaps(pace: PaceLevel): { maxStops: number; maxDetourKm: number } {
  const p = PACE_RULES[pace];
  return { maxStops: p.maxStops, maxDetourKm: p.maxDetourKm };
}
