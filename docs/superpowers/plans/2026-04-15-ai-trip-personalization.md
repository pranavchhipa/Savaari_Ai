# Sarathi AI Personalization v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persona-aware trip planning (5 personas × pace × budget) with a two-stage AI pipeline (broad generator → persona reranker) and client-side refinement sliders.

**Architecture:** Split the monolithic `src/lib/ai.ts` into four focused modules under `src/lib/ai/`: `prompts.ts` (composable prompt builders), `fallback.ts` (per-persona hardcoded data), `generator.ts` (Stage A broad candidates), `reranker.ts` (Stage B persona filtering). Intercept the "Plan My Perfect Trip" click in `CarCard` to show a `PersonaPicker` overlay before the `PlanningModal` opens. Mount a `RefinementBar` inside `ScoutContainer` that runs a debounced client-side re-rank over cached Stage A candidates.

**Tech Stack:** Next.js 16.1.6 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide icons, OpenRouter → gpt-4o-mini.

**Testing approach:** Per spec §9, automated tests are explicitly deferred to v1.5. Every task ends with: (1) `npx tsc --noEmit` to verify types, (2) a manual browser verification step describing exactly what to click and what to observe. This is the agreed-upon testing discipline for this feature.

**Streaming note:** Spec §5.2 calls for SSE streaming on `/api/ai/generate-stops`. This plan implements the two-stage pipeline with regular JSON responses and defers true SSE streaming to a v1.1 follow-up. The UX win is smaller than persona personalization, and streaming adds ~1 day of plumbing for marginal benefit. This scope call is noted here so the user can flip the decision if desired.

**Branch:** Create and work on branch `feat/ai-personalization-v2` off current HEAD.

---

## File Structure

### New files
| Path | Responsibility |
|---|---|
| `src/lib/flags.ts` | Single-export feature flag (`ENABLE_PERSONAS`) |
| `src/lib/ai/prompts.ts` | Pure functions that compose prompt fragments (route context, persona rules, pace/budget rules, output schema) |
| `src/lib/ai/fallback.ts` | Per-persona × per-route hardcoded stop lists, plus approximate-match helper |
| `src/lib/ai/generator.ts` | Stage A: generates 12–15 broad candidates per route + car + season |
| `src/lib/ai/reranker.ts` | Stage B: filters + ranks Stage A candidates by persona/pace/budget |
| `src/app/api/ai/rerank/route.ts` | POST handler wrapping `reranker.ts` |
| `src/components/PersonaPicker.tsx` | Overlay with 5 persona tiles; returns chosen persona via callback |
| `src/components/RefinementBar.tsx` | Sticky pace + budget segmented controls with 400ms debounce |

### Modified files
| Path | What changes |
|---|---|
| `src/types/index.ts` | Add `Persona`, `PaceLevel`, `BudgetLevel`, `TravelContext`, `AICandidate` |
| `src/lib/ai.ts` | Becomes a thin shim: re-exports `generateRouteStops` backed by new modules |
| `src/app/api/ai/generate-stops/route.ts` | Accepts new context params, delegates to `generator.ts` |
| `src/hooks/useTripLogic.ts` | Adds persona/pace/budget state, two-stage fetch orchestration, client-side re-rank |
| `src/components/CarCard.tsx` | "Plan My Perfect Trip" now opens `PersonaPicker` first; on persona select, opens `PlanningModal` |
| `src/components/PlanningModal.tsx` | Accepts `persona` prop, passes to `ScoutContainer` |
| `src/components/ScoutContainer.tsx` | Accepts `persona` prop; passes persona + pace + budget to `useTripLogic`; mounts `RefinementBar` |

---

## Task 0: Pre-flight — commit current state

**Why this exists:** The working tree has the b2b-demo deletion and the untracked `docs/` directory (containing the design spec). We need a clean baseline before starting the feature branch.

**Files:**
- Modify: git working tree

- [ ] **Step 1: Verify working tree contents**

Run: `git status --short`
Expected: lines starting with ` D` for b2b-demo files, `??` for `docs/`

- [ ] **Step 2: Stage and commit cleanup + spec**

```bash
git add -u                  # stage deletions
git add docs/
git commit -m "chore: remove b2b-demo scaffolding and add personalization spec

- Clean out b2b-demo pages/components (not part of core Savaari AI)
- Add docs/superpowers/specs/2026-04-15-ai-trip-personalization-design.md
- Add docs/superpowers/plans/2026-04-15-ai-trip-personalization.md"
```

- [ ] **Step 3: Create feature branch**

```bash
git checkout -b feat/ai-personalization-v2
```

Run: `git branch --show-current`
Expected: `feat/ai-personalization-v2`

---

## Task 1: Types + feature flag

**Files:**
- Create: `src/lib/flags.ts`
- Modify: `src/types/index.ts` (append at end, after line 187)

- [ ] **Step 1: Create feature flag**

Write `src/lib/flags.ts`:

```ts
// Feature flags — compile-time constants only.
// Flip ENABLE_PERSONAS to false to fall back to the pre-v2 flow.
export const ENABLE_PERSONAS = true;
```

- [ ] **Step 2: Add personalization types**

Append to `src/types/index.ts`:

```ts
// ===== Personalization v2 =====

export type Persona = 'family' | 'couple' | 'friends' | 'solo' | 'business';
export type PaceLevel = 'relaxed' | 'balanced' | 'packed';
export type BudgetLevel = 'budget' | 'standard' | 'premium';

export interface PersonaMeta {
  id: Persona;
  name: string;              // "Family Weekend"
  subtitle: string;          // "Safe stops the kids will love"
  emoji: string;             // "👨‍👩‍👧"
  vibeChips: string[];       // ["Kid-safe", "Heritage", "Nature"]
}

export interface TravelContext {
  source: string;
  destination: string;
  distanceKm: number;
  carType: string;           // e.g. "Hatchback", "SUV", "MUV"
  pickupDate: string;        // YYYY-MM-DD
  pickupTime: string;        // HH:MM
  totalDays: number;         // from trip type + dates
}

// Stage A output: broader than AIRecommendation, with persona-hint tags.
export interface AICandidate extends AIRecommendation {
  tags?: Array<
    | 'kid-safe'
    | 'scenic'
    | 'romantic'
    | 'adventure'
    | 'offbeat'
    | 'cultural-depth'
    | 'quick-stop'
    | 'paid-entry'
    | 'free'
    | 'photo-op'
  >;
  entryFeeInr?: number;      // 0 for free
}

// Stage B output: subset of AICandidate with persona fit added.
export interface RerankedStop extends AICandidate {
  personaRelevance: number;  // 0-1
  personaReason?: string;    // "Kid-safe open gardens with clean restrooms"
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: exits with code 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/flags.ts src/types/index.ts
git commit -m "feat(types): add Persona, PaceLevel, BudgetLevel, TravelContext + feature flag"
```

---

## Task 2: Prompt builders

**Files:**
- Create: `src/lib/ai/prompts.ts`

This module contains pure, composable functions. No side effects, no fetch — only string assembly.

- [ ] **Step 1: Write `prompts.ts`**

Write `src/lib/ai/prompts.ts`:

```ts
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/prompts.ts
git commit -m "feat(ai): add composable prompt builders for stage A and stage B"
```

---

## Task 3: Per-persona fallback data

**Files:**
- Create: `src/lib/ai/fallback.ts`

We already have generic fallbacks in the legacy `ai.ts`. Add a **persona-aware** lookup that can hydrate from the legacy data when no persona-specific set exists yet.

- [ ] **Step 1: Write `fallback.ts`**

Write `src/lib/ai/fallback.ts`:

```ts
import type { AICandidate, RerankedStop, Persona, PaceLevel, BudgetLevel, StopBadge } from '@/types';

// Reuse the legacy tourist data as the candidate pool. We import it inline so
// we don't duplicate route data — just transform it per persona.
import { getLegacyRouteFallback } from '@/lib/ai'; // will re-export from legacy shim (Task 6)

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
```

- [ ] **Step 2: Note the forward dependency**

`fallback.ts` imports `getLegacyRouteFallback` from `@/lib/ai`, which we'll export in Task 6 when we refactor `ai.ts`. `tsc` will fail until Task 6 lands. That's expected — we'll type-check at the end of Task 6.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/fallback.ts
git commit -m "feat(ai): add persona-aware fallback that biases legacy data per persona"
```

---

## Task 4: Stage A generator

**Files:**
- Create: `src/lib/ai/generator.ts`

- [ ] **Step 1: Write `generator.ts`**

Write `src/lib/ai/generator.ts`:

```ts
'use server';

import type { AICandidate, TravelContext } from '@/types';
import { stageAPrompt } from './prompts';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

// Stage A cache: keyed by route+car+season+daypart (persona-agnostic).
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

    const candidates = parsed.stops
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
```

- [ ] **Step 2: Type-check (expected to fail on fallback.ts import — ignore until Task 6)**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: errors only in `src/lib/ai/fallback.ts` (about `getLegacyRouteFallback`). Nothing else.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/generator.ts
git commit -m "feat(ai): add Stage A generator (broad candidates with persona-hint tags)"
```

---

## Task 5: Stage B reranker

**Files:**
- Create: `src/lib/ai/reranker.ts`

- [ ] **Step 1: Write `reranker.ts`**

Write `src/lib/ai/reranker.ts`:

```ts
'use server';

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

  // Slim candidates down to what the prompt needs.
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
    return stops;
  } catch (err) {
    console.error('[Sarathi/Stage B] Exception:', err);
    return clientSideRerank(candidates, persona, pace, budget);
  }
}

/**
 * Heuristic re-rank used when AI is unavailable or as the slider-driven client-side path.
 * Exposed for the client API too (Task 10 uses this via the rerank route when asked in "heuristic" mode).
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
        return (tags.has('kid-safe') ? 0.6 : 0) + (tags.has('scenic') ? 0.2 : 0) + (c.badges?.includes('family-friendly') ? 0.2 : 0);
      case 'couple':
        return (tags.has('romantic') ? 0.5 : 0) + (tags.has('scenic') ? 0.3 : 0) + (tags.has('photo-op') ? 0.2 : 0);
      case 'friends':
        return (tags.has('adventure') ? 0.5 : 0) + (tags.has('photo-op') ? 0.3 : 0) + (tags.has('scenic') ? 0.2 : 0);
      case 'solo':
        return (tags.has('offbeat') ? 0.5 : 0) + (tags.has('cultural-depth') ? 0.3 : 0) + (c.detourKm <= 8 ? 0.2 : 0);
      case 'business':
        return (tags.has('quick-stop') ? 0.5 : 0) + (c.detourKm <= 2 ? 0.5 : 0);
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai/reranker.ts
git commit -m "feat(ai): add Stage B reranker with AI + heuristic fallback"
```

---

## Task 6: Refactor `src/lib/ai.ts` as shim + wire generate-stops API

**Files:**
- Modify: `src/lib/ai.ts` (major refactor)
- Modify: `src/app/api/ai/generate-stops/route.ts`

This task makes everything type-check and runs end-to-end (up through Stage A only — persona picker wiring comes later).

- [ ] **Step 1: Extract legacy fallback from `ai.ts` into exportable form**

In `src/lib/ai.ts`:

- Keep `generateIntelligentFallback` but rename its exported form to `getLegacyRouteFallback`.
- Keep the rest of the file as-is for now (it's still referenced by other parts; we'll delete dead code later).

Edit `src/lib/ai.ts` — at the bottom, add:

```ts
/**
 * Exported for the new src/lib/ai/ modules. Provides the legacy per-route tourist
 * data that we now reuse as the candidate pool when AI is unavailable.
 */
export function getLegacyRouteFallback(
  source: string,
  destination: string,
  distanceKm: number,
): AIRouteStopsResponse | null {
  const result = generateIntelligentFallback(source, destination, distanceKm);
  return result.stops.length > 0 ? result : null;
}
```

- [ ] **Step 2: Add `generateStopsForContext` to `ai.ts`**

Still in `src/lib/ai.ts`, add (below the existing exports):

```ts
import type { TravelContext, Persona, PaceLevel, BudgetLevel } from '@/types';
import { generateCandidates } from './ai/generator';
import { rerankStops, clientSideRerank } from './ai/reranker';
import { fallbackRerankedStops } from './ai/fallback';

/**
 * New two-stage entry point used by /api/ai/generate-stops.
 * If persona is null, returns Stage A candidates only (caller will rerank client-side).
 * If persona is provided, runs both stages.
 */
export async function generateStopsForContext(params: {
  ctx: TravelContext;
  persona: Persona | null;
  pace: PaceLevel;
  budget: BudgetLevel;
}): Promise<AIRouteStopsResponse> {
  const { ctx, persona, pace, budget } = params;

  const candidates = await generateCandidates(ctx);

  if (!candidates || candidates.length === 0) {
    // Full fallback path
    if (persona) {
      const fb = fallbackRerankedStops(ctx.source, ctx.destination, ctx.distanceKm, persona, pace, budget);
      return { stops: fb.stops, dontMiss: fb.stops.slice(0, 3), fallback: true };
    }
    const legacy = getLegacyRouteFallback(ctx.source, ctx.destination, ctx.distanceKm);
    return legacy ?? { stops: [], dontMiss: [], fallback: true };
  }

  // We have Stage A candidates.
  if (!persona) {
    // Caller will handle persona later; return broad candidates as "stops" for display.
    return {
      stops: candidates.slice(0, 7),
      dontMiss: candidates.slice(0, 3),
      nightHalt: ctx.distanceKm > 400 ? { city: 'Midpoint City', reason: 'Rest for a fresh start', approximateKm: Math.round(ctx.distanceKm * 0.45) } : undefined,
    };
  }

  const reranked = await rerankStops({ ctx, persona, pace, budget, candidates });
  return {
    stops: reranked,
    dontMiss: reranked.slice(0, 3),
    nightHalt: ctx.distanceKm > 400 ? { city: 'Midpoint City', reason: 'Rest for a fresh start', approximateKm: Math.round(ctx.distanceKm * 0.45) } : undefined,
  };
}

// Re-export heuristic rerank for the /api/ai/rerank route in Task 7.
export { clientSideRerank };
```

- [ ] **Step 3: Update `/api/ai/generate-stops/route.ts`**

Replace the entire body of `src/app/api/ai/generate-stops/route.ts` with:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { generateRouteStops, generateStopsForContext } from '@/lib/ai';
import { ENABLE_PERSONAS } from '@/lib/flags';
import type { TravelContext, Persona, PaceLevel, BudgetLevel } from '@/types';

interface GenerateStopsBody {
  source: string;
  destination: string;
  distanceKm: number;
  // New optional fields (v2):
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

    // Legacy path: no persona flag → preserve old behavior for any remaining callers.
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
    return NextResponse.json({ error: 'Internal server error', fallback: true }, { status: 200 });
  }
}
```

- [ ] **Step 4: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: exits with code 0. (Task 3's forward dependency now resolves.)

- [ ] **Step 5: Manually verify in browser (sanity smoke)**

```bash
npm run dev
```

Open http://localhost:3000. Search Bangalore → Mysore. On /listing, click "Plan My Perfect Trip" on any car. In DevTools Network, confirm `/api/ai/generate-stops` still returns 200 with `stops`. No visible UI change yet — this task only refactors the backend.

- [ ] **Step 6: Commit**

```bash
git add src/lib/ai.ts src/app/api/ai/generate-stops/route.ts
git commit -m "feat(ai): refactor ai.ts as shim; wire generate-stops to two-stage pipeline"
```

---

## Task 7: Rerank API route

**Files:**
- Create: `src/app/api/ai/rerank/route.ts`

- [ ] **Step 1: Write the route**

Write `src/app/api/ai/rerank/route.ts`:

```ts
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
 * Client-side (heuristic) re-rank endpoint.
 * The hook calls this when slider values change — no AI hit, instant.
 * Named "api" only because the heuristic logic lives server-side to keep
 * the client bundle small; no OpenRouter call is made here.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RerankBody;
    if (!Array.isArray(body.candidates) || !body.persona || !body.pace || !body.budget) {
      return NextResponse.json({ error: 'Missing candidates/persona/pace/budget' }, { status: 400 });
    }
    const stops = clientSideRerank(body.candidates, body.persona, body.pace, body.budget);
    return NextResponse.json({ stops });
  } catch (err) {
    console.error('Rerank API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits with code 0.

- [ ] **Step 3: Smoke-test with curl**

With dev server running (`npm run dev`):

```bash
curl -X POST http://localhost:3000/api/ai/rerank \
  -H "Content-Type: application/json" \
  -d '{"candidates":[{"id":"a","name":"X","type":"heritage","description":"","whyVisit":"","famousFor":"","rating":4.5,"badges":[],"approximateKm":50,"detourKm":2,"suggestedDuration":30,"tags":["kid-safe"]}],"persona":"family","pace":"balanced","budget":"standard"}'
```

Expected: `{"stops":[{...}]}` — one stop returned.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/ai/rerank/route.ts
git commit -m "feat(ai): add /api/ai/rerank heuristic re-rank endpoint"
```

---

## Task 8: PersonaPicker component

**Files:**
- Create: `src/components/PersonaPicker.tsx`

- [ ] **Step 1: Write the component**

Write `src/components/PersonaPicker.tsx`:

```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { Persona, PersonaMeta } from '@/types';

export const PERSONAS: PersonaMeta[] = [
  {
    id: 'family',
    name: 'Family Weekend',
    subtitle: 'Safe stops the kids will love',
    emoji: '👨‍👩‍👧',
    vibeChips: ['Kid-safe', 'Heritage', 'Open-air'],
  },
  {
    id: 'couple',
    name: 'Romantic Escape',
    subtitle: 'Scenic & intimate spots for two',
    emoji: '💑',
    vibeChips: ['Scenic', 'Sunsets', 'Cafes'],
  },
  {
    id: 'friends',
    name: 'Friends Adventure',
    subtitle: 'High-energy, photo-ready stops',
    emoji: '🧑‍🤝‍🧑',
    vibeChips: ['Adventure', 'Photo-ops', 'Lively'],
  },
  {
    id: 'solo',
    name: 'Solo Explorer',
    subtitle: 'Offbeat, cultural, flexible',
    emoji: '🧳',
    vibeChips: ['Offbeat', 'Culture', 'Flexible'],
  },
  {
    id: 'business',
    name: 'Business Quick',
    subtitle: 'Efficient — zero-detour stops only',
    emoji: '💼',
    vibeChips: ['Minimal detour', 'Clean', 'Fast'],
  },
];

interface PersonaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (persona: Persona) => void;
}

export default function PersonaPicker({ isOpen, onClose, onSelect }: PersonaPickerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Who are you travelling with?</h2>
                  <p className="text-gray-500 mt-1 text-sm">Sarathi picks stops that fit your group.</p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close persona picker"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PERSONAS.map((p) => (
                  <motion.button
                    key={p.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(p.id)}
                    className="text-left p-5 rounded-2xl border-2 border-gray-200 hover:border-[#2563EB] hover:bg-blue-50/40 hover:shadow-md transition-all group"
                  >
                    <div className="text-4xl mb-3">{p.emoji}</div>
                    <div className="font-semibold text-gray-900 group-hover:text-[#2563EB]">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-1 mb-3">{p.subtitle}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.vibeChips.map((chip) => (
                        <span
                          key={chip}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 group-hover:bg-white group-hover:text-[#2563EB]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/PersonaPicker.tsx
git commit -m "feat(ui): add PersonaPicker overlay with 5 persona tiles"
```

---

## Task 9: RefinementBar component

**Files:**
- Create: `src/components/RefinementBar.tsx`

- [ ] **Step 1: Write the component**

Write `src/components/RefinementBar.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import { Gauge, IndianRupee } from 'lucide-react';
import type { PaceLevel, BudgetLevel } from '@/types';

interface RefinementBarProps {
  pace: PaceLevel;
  budget: BudgetLevel;
  onPaceChange: (next: PaceLevel) => void;
  onBudgetChange: (next: BudgetLevel) => void;
  isBusy?: boolean;   // shows a subtle spinner while re-rank runs
}

const PACE_OPTIONS: { value: PaceLevel; label: string }[] = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'packed', label: 'Packed' },
];

const BUDGET_OPTIONS: { value: BudgetLevel; label: string }[] = [
  { value: 'budget', label: 'Budget' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
];

export default function RefinementBar({
  pace,
  budget,
  onPaceChange,
  onBudgetChange,
  isBusy,
}: RefinementBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Gauge className="w-4 h-4 text-[#2563EB]" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pace</span>
      </div>
      <div className="inline-flex bg-gray-100 rounded-xl p-1">
        {PACE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onPaceChange(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              pace === opt.value ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200 hidden sm:block" />

      <div className="flex items-center gap-2">
        <IndianRupee className="w-4 h-4 text-[#F97316]" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</span>
      </div>
      <div className="inline-flex bg-gray-100 rounded-xl p-1">
        {BUDGET_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onBudgetChange(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              budget === opt.value ? 'bg-white text-[#F97316] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isBusy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-auto text-xs text-gray-400 flex items-center gap-1.5"
        >
          <div className="w-3 h-3 border-2 border-gray-300 border-t-[#2563EB] rounded-full animate-spin" />
          Updating…
        </motion.div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check and commit**

```bash
npx tsc --noEmit
git add src/components/RefinementBar.tsx
git commit -m "feat(ui): add RefinementBar with pace + budget segmented controls"
```

---

## Task 10: Two-stage orchestration in `useTripLogic`

**Files:**
- Modify: `src/hooks/useTripLogic.ts`

This is the largest task. We're adding persona/pace/budget inputs, threading them into the API call, and adding a debounced client-side re-rank when sliders change.

- [ ] **Step 1: Extend `UseTripLogicProps` and `UseTripLogicReturn`**

In `src/hooks/useTripLogic.ts`, edit the `UseTripLogicProps` interface (around line 20) to add:

```ts
    // Personalization v2
    persona?: Persona | null;
    pace?: PaceLevel;
    budget?: BudgetLevel;
    carType?: string;
```

Edit imports at the top (line 4) to add:

```ts
import { Persona, PaceLevel, BudgetLevel, AICandidate } from '@/types';
```

- [ ] **Step 2: Add state for Stage A candidates + last-applied rerank**

Inside the hook, after the existing `useState` calls (around line 77, after `scoutTip`), add:

```ts
    const [stageACandidates, setStageACandidates] = useState<AICandidate[]>([]);
```

Also add a ref to track whether a rerank is in flight (prevents overlapping network calls):

```ts
    const rerankAbortRef = useRef<AbortController | null>(null);
```

- [ ] **Step 3: Update the `fetchAIStops` call site**

Find `fetchAIStops` (starts ~line 171). Change its signature to accept the full context:

```ts
    const fetchAIStops = async (
        sourceName: string,
        destName: string,
        distanceKm: number,
        opts: {
            carType?: string;
            pickupDate?: string;
            pickupTime?: string;
            totalDays?: number;
            persona?: Persona | null;
            pace?: PaceLevel;
            budget?: BudgetLevel;
        } = {},
    ): Promise<AIRouteStopsResponse | null> => {
        // [...existing cache check code stays unchanged...]

        try {
            const response = await fetch('/api/ai/generate-stops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: sourceName,
                    destination: destName,
                    distanceKm,
                    carType: opts.carType,
                    pickupDate: opts.pickupDate,
                    pickupTime: opts.pickupTime,
                    totalDays: opts.totalDays,
                    persona: opts.persona ?? null,
                    pace: opts.pace ?? 'balanced',
                    budget: opts.budget ?? 'standard',
                }),
            });
            // [...rest of function unchanged...]
```

Note: the cache keys (`getClientCacheKey`) should be updated to include persona so that switching persona re-fetches:

```ts
function getClientCacheKey(source: string, dest: string, persona?: Persona | null): string {
    return `${source.toLowerCase().trim()}-${dest.toLowerCase().trim()}-${persona ?? 'any'}`;
}
```

Update both call sites that build cache keys accordingly.

- [ ] **Step 4: Thread persona/pace/budget into `fetchRouteAndStops`**

Find the orchestration function `fetchRouteAndStops` (further down in the file). When it calls `fetchAIStops`, pass through the new props:

```ts
    const aiResponse = await fetchAIStops(source.name, destination.name, distanceKm, {
        carType,
        pickupDate,
        pickupTime,
        totalDays,
        persona,
        pace,
        budget,
    });
```

Also set `stageACandidates` from the response when `persona` is null OR when Stage B data includes an implicit candidate pool. Simplest: when the response has `stops`, snapshot them as `stageACandidates` so the client-side re-rank has data to work with:

```ts
    if (aiResponse?.stops) {
        setStageACandidates(aiResponse.stops as AICandidate[]);
    }
```

- [ ] **Step 5: Add the debounced client-side re-rank effect**

After the existing `useEffect` that runs `fetchRouteAndStops` on mount, add a new effect that fires on pace/budget/persona changes and re-ranks client-side over `stageACandidates`:

```ts
    // Client-side re-rank when sliders change. Debounced 400ms. Persona change
    // triggers a full refetch (handled above) — this effect only refines.
    useEffect(() => {
        if (!persona) return;
        if (stageACandidates.length === 0) return;

        const handle = setTimeout(async () => {
            rerankAbortRef.current?.abort();
            const controller = new AbortController();
            rerankAbortRef.current = controller;

            try {
                const res = await fetch('/api/ai/rerank', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        candidates: stageACandidates,
                        persona,
                        pace: pace ?? 'balanced',
                        budget: budget ?? 'standard',
                    }),
                    signal: controller.signal,
                });
                if (!res.ok) return;
                const json = await res.json() as { stops: AIRecommendation[] };
                setRecommendations(json.stops);
                // Re-derive stops[] from new recommendations (use existing convert helper).
                if (routeData && source && destination) {
                    const newStops = convertAIStopsToStops(
                        json.stops,
                        routeData.coordinates,
                        source,
                        destination,
                        routeData.distanceKm,
                        'onward',
                    );
                    setStops(newStops);
                }
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('[Sarathi] Rerank failed:', err);
                }
            }
        }, 400);

        return () => clearTimeout(handle);
    }, [pace, budget, persona, stageACandidates, routeData, source, destination, convertAIStopsToStops]);
```

(Persona changes intentionally trigger the main `fetchRouteAndStops` effect too, which hits Stage B via the API — the local effect handles the slider-only case.)

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: exits with code 0.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useTripLogic.ts
git commit -m "feat(hook): two-stage AI orchestration + debounced client-side rerank"
```

---

## Task 11: Wire PersonaPicker into the CarCard flow

**Files:**
- Modify: `src/components/CarCard.tsx`

Intercept the "Plan My Perfect Trip" click so `PersonaPicker` opens first; once a persona is chosen, open the `PlanningModal` with the persona in hand.

- [ ] **Step 1: Add persona state and import**

At the top of `src/components/CarCard.tsx`:

```tsx
import PersonaPicker from './PersonaPicker';
import type { Persona } from '@/types';
import { ENABLE_PERSONAS } from '@/lib/flags';
```

Inside the component (near the other `useState` calls around line 31):

```tsx
    const [showPersonaPicker, setShowPersonaPicker] = useState(false);
    const [chosenPersona, setChosenPersona] = useState<Persona | null>(null);
```

- [ ] **Step 2: Change the "Plan My Perfect Trip" handler**

Replace the existing button's `onClick` (line 128):

```tsx
    <button
        onClick={() => {
            if (ENABLE_PERSONAS) {
                setShowPersonaPicker(true);
            } else {
                setShowPlanningModal(true);
            }
        }}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 text-[#2563EB] border border-blue-200/60 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300 group"
    >
```

- [ ] **Step 3: Render `PersonaPicker` and chain to `PlanningModal`**

After the existing `PlanningModal` JSX (line 164), add:

```tsx
            {/* Persona Picker (gates PlanningModal) */}
            <PersonaPicker
                isOpen={showPersonaPicker}
                onClose={() => setShowPersonaPicker(false)}
                onSelect={(persona) => {
                    setChosenPersona(persona);
                    setShowPersonaPicker(false);
                    setShowPlanningModal(true);
                }}
            />
```

- [ ] **Step 4: Pass `persona` to `PlanningModal`**

Update the `<PlanningModal ...>` JSX to include:

```tsx
                persona={chosenPersona}
```

(`PlanningModal` will accept this in Task 12.)

- [ ] **Step 5: Type-check and commit**

Types will fail until Task 12 wires the prop through — that's fine, commit anyway with a note and proceed:

```bash
git add src/components/CarCard.tsx
git commit -m "feat(ui): intercept Plan My Perfect Trip with PersonaPicker overlay"
```

---

## Task 12: Thread persona through PlanningModal + ScoutContainer, mount RefinementBar

**Files:**
- Modify: `src/components/PlanningModal.tsx`
- Modify: `src/components/ScoutContainer.tsx`

- [ ] **Step 1: Add `persona` to `PlanningModal` props**

In `src/components/PlanningModal.tsx`:

Edit the `PlanningModalProps` interface (line 11):

```tsx
interface PlanningModalProps {
    isOpen: boolean;
    onClose: () => void;
    car: Car;
    source: Location;
    destination: Location;
    tripType: 'one-way' | 'round-trip';
    pickupDate?: string;
    dropDate?: string;
    pickupTime?: string;
    persona?: Persona | null;
}
```

Import `Persona`:

```tsx
import { Car, Location, TripStats, Stop, Persona } from '@/types';
```

Destructure `persona` in the component signature and pass it down to `ScoutContainer`:

```tsx
export default function PlanningModal({
    isOpen,
    onClose,
    car,
    source,
    destination,
    tripType,
    pickupDate,
    dropDate,
    pickupTime,
    persona,
}: PlanningModalProps) {
```

Find the `<ScoutContainer ... />` JSX lower in the file and add:

```tsx
    persona={persona ?? null}
```

- [ ] **Step 2: Add persona/pace/budget to `ScoutContainer`**

In `src/components/ScoutContainer.tsx`:

Edit the props interface (line 28):

```tsx
interface ScoutContainerProps {
    source: Location;
    destination: Location;
    car: Car;
    tripType: 'one-way' | 'round-trip';
    onPriceUpdate: (newPrice: number) => void;
    pickupDate?: string;
    dropDate?: string;
    pickupTime?: string;
    onDestinationChange?: (newDestination: Location) => void;
    onTripStatsUpdate?: (tripStats: TripStats, selectedStops: Stop[]) => void;
    isInModal?: boolean;
    persona?: Persona | null;
}
```

Import `Persona`, `PaceLevel`, `BudgetLevel`:

```tsx
import { Location, Car, Stop, JourneySegment, TripStats, Persona, PaceLevel, BudgetLevel } from '@/types';
import RefinementBar from './RefinementBar';
```

Add local state for pace/budget defaults:

```tsx
    const [pace, setPace] = useState<PaceLevel>('balanced');
    const [budget, setBudget] = useState<BudgetLevel>('standard');
```

Pass new props to `useTripLogic`:

```tsx
    } = useTripLogic({
        source,
        destination: currentDestination,
        tripType,
        baseFare: car.baseFare,
        perKmRate: car.perKmRate,
        driverAllowancePerDay: car.driverAllowancePerDay,
        pickupDate,
        dropDate,
        pickupTime,
        persona: persona ?? null,
        pace,
        budget,
        carType: car.type,
    });
```

- [ ] **Step 3: Mount `RefinementBar` above the recommendations**

Locate where the recommendations/results render inside `ScoutContainer`'s JSX. Immediately above that section, render:

```tsx
    {persona && (
        <div className="mb-4">
            <RefinementBar
                pace={pace}
                budget={budget}
                onPaceChange={setPace}
                onBudgetChange={setBudget}
                isBusy={isLoading}
            />
        </div>
    )}
```

- [ ] **Step 4: Type-check, build, and smoke-test**

```bash
npx tsc --noEmit
npm run build
npm run dev
```

Expected build output: successful compilation. Open http://localhost:3000 → search Bangalore → Mysore → on /listing click "Plan My Perfect Trip" on the Innova row.

Verify:
1. Persona picker overlay appears first.
2. Click "Family Weekend" — picker closes, planning modal opens.
3. Inside the modal, the RefinementBar shows Pace + Budget toggles, defaults to Balanced/Standard.
4. Stops populate. Open DevTools Network — you should see `/api/ai/generate-stops` POST with body including `persona:"family"`.
5. Click "Packed" pace — DevTools should show a POST to `/api/ai/rerank` after 400ms and the stops list refreshes.
6. Close the modal, pick "Romantic Escape" persona on the same car. Verify `generate-stops` refetches (new cache key, persona=couple) and the stops list visibly differs from the Family output.

- [ ] **Step 5: Commit**

```bash
git add src/components/PlanningModal.tsx src/components/ScoutContainer.tsx
git commit -m "feat(ui): thread persona into trip logic and mount RefinementBar"
```

---

## Task 13: QA matrix + polish

**Files:**
- Only modifications if bugs are found during QA.

- [ ] **Step 1: Run the manual QA matrix from spec §9**

Three routes × five personas = 15 baseline combinations. For each, record one-line notes (what stops appeared, any surprises):

- [ ] Mumbai → Pune (short, 150 km) × family, couple, friends, solo, business
- [ ] Delhi → Jaipur (medium, 275 km) × same 5
- [ ] Bangalore → Goa (long + multi-day, 560 km) × same 5

For each of the 15, verify: (a) result set visibly differs from at least 2 other personas on the same route, (b) no broken images/empty cards, (c) distance/fare numbers remain sensible.

- [ ] **Step 2: Slider sanity (3 combos per persona on one route)**

Pick Delhi → Jaipur × family. Cycle through the 9 pace × budget combos. For each:
- Confirm DevTools shows POST to `/api/ai/rerank` (not `/api/ai/generate-stops`).
- Confirm stop count and detour caps change sensibly (Relaxed → ≤5 stops, Packed → up to 12).
- Budget=Budget should drop paid-entry stops if tag present.

- [ ] **Step 3: Fallback paths**

Temporarily rename `OPENROUTER_API_KEY` in `.env.local` to `OPENROUTER_API_KEY_DISABLED` and restart the dev server. Pick Mumbai → Goa × family. Verify:
- The page still loads with stops (from `fallbackRerankedStops`).
- The stops are from the legacy curated list (Pratapgad, Tarkarli, etc.).
- No unhandled errors in the console.
Restore the env var name and restart.

- [ ] **Step 4: Mobile responsive sanity**

DevTools → iPhone SE viewport. Verify:
- Persona picker grid collapses to 1 column.
- RefinementBar wraps cleanly.
- Stop cards and timeline don't overflow horizontally.

- [ ] **Step 5: Tidy + commit any QA fixes**

If any bugs surfaced, fix them in a single commit:

```bash
git add <files>
git commit -m "fix(ai): QA fixes from personalization v2 rollout"
```

- [ ] **Step 6: Final sanity build**

```bash
npm run build
```

Expected: clean build with no warnings other than pre-existing ones.

- [ ] **Step 7: Merge branch (optional — user call)**

Do NOT push or merge without explicit user approval. Report to user:

> "Personalization v2 implemented on `feat/ai-personalization-v2`. QA matrix passed. Ready for your review — do you want to merge into main?"

---

## Self-review notes

- All 7 new files and 7 modified files from spec §7 are covered.
- Streaming (spec §5.2) is explicitly deferred — noted in the plan header and rationale given.
- Each task ends with `npx tsc --noEmit` + a browser verification step, substituting for automated tests per spec §9.
- Cache keys in `useTripLogic` and `ai/generator.ts` match spec §5.3: Stage A keyed by route+carType+season+daypart, Stage B by route+persona+pace+budget.
- `clientSideRerank` covers both the heuristic fallback when AI is unavailable AND the slider-driven re-rank path — one function, two callers.
- The feature flag `ENABLE_PERSONAS` gates the PersonaPicker UI and the new API branch; flipping to `false` restores pre-v2 behavior without any other changes.

*End of plan.*
