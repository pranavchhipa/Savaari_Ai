# Sarathi AI Personalization v2 — Design Spec

**Date:** 2026-04-15
**Workspace:** `C:\Users\Pranav\.gemini\antigravity\scratch\savaari_Ai`
**Status:** Draft for review

---

## 1. Purpose

Upgrade Sarathi AI's trip planning from one-size-fits-all to **persona-aware, industry-standard personalization** (Airbnb / Skyscanner / TripAdvisor pattern). Single-tap persona selection plus context-aware prompting plus client-side refinement sliders.

---

## 2. Scope (Option ii — Ambitious v1)

### IN scope
- **Approach C**: 5-persona tile picker
- **Tier 1**: Car-aware prompt, Time/season awareness, Duration-aware stop count, Streaming AI responses
- **Tier 2**: Two-stage AI (broad generator → persona re-ranker), Refinement bar (Pace + Budget sliders)

### OUT of scope (v1.5 or later)
- Conversational "chat with Sarathi" refine — edge-case heavy
- Opening-hours temporal pacing — needs extra data API
- Dietary filters, trust badges, accessibility — need usage data to validate
- Memory across trips — requires auth
- Collaborative planning — requires backend

---

## 3. The 5 Personas

| ID | Name | Composition | Default vibe |
|---|---|---|---|
| `family` | Family Weekend | Parents + kids | Safe, kid-friendly, heritage + nature |
| `couple` | Romantic Escape | 2 adults | Scenic, sunsets, intimate |
| `friends` | Friends Adventure | 3-6 adults | Adventure, photo-ops, nightlife-adjacent |
| `solo` | Solo Explorer | 1 adult | Offbeat, cultural depth, flexible |
| `business` | Business Quick | 1-2 adults | Efficient, minimal detours, comfort stops |

Each tile renders: emoji/icon, name, 1-line subtitle, vibe chip preview.

---

## 4. User flow after v2

```
Homepage search  →  /listing  →  Pick car  →  [NEW] PersonaPicker overlay
                                                      ↓
                                              PlanningModal opens
                                                      ↓
                                     Stops stream into ScoutContainer
                                                      ↓
                                         [NEW] RefinementBar below
                                     (Pace + Budget sliders, live re-rank)
```

---

## 5. Key Architecture Changes

### 5.1 AI layer split (`src/lib/ai/`)

The current monolithic `src/lib/ai.ts` splits into focused modules:

- **`generator.ts`** — Stage A: generates 12–15 broad candidates. Minimal persona input. Highly cacheable per route.
- **`reranker.ts`** — Stage B: filters + ranks + enriches top N stops by persona + pace + budget. Produces final user-facing list.
- **`prompts.ts`** — composable prompt builders: `routeContext()`, `personaRules()`, `paceBudgetRules()`, `outputSchema()`.
- **`fallback.ts`** — hardcoded per-persona lists for top Indian routes (Mumbai-Pune, Delhi-Jaipur, Bangalore-Mysore, etc.). Used when OpenRouter fails.

### 5.2 API routes

- **`POST /api/ai/generate-stops`** (modified): streaming response. Accepts `{ source, dest, distanceKm, carType, pickupDate, pickupTime }`. Returns Stage A candidates progressively via Server-Sent Events.
- **`POST /api/ai/rerank`** (new): accepts Stage A candidates + `{ persona, pace, budget }`. Returns the final ranked list.

### 5.3 Cache strategy

Current `clientAICache` extended:

| Stage | Cache key | TTL |
|---|---|---|
| A (candidates) | `${source}-${dest}-${carType}-${season}-${daypart}` | 1 hour |
| B (reranked) | `${source}-${dest}-${persona}-${pace}-${budget}` | 30 min |

Stage A cache survives persona changes — switching from family to couple only triggers Stage B.

### 5.4 Hook state (`useTripLogic`)

Additions:
```ts
persona: Persona | null
paceLevel: 'relaxed' | 'balanced' | 'packed'
budgetLevel: 'budget' | 'standard' | 'premium'
stageACandidates: AIRecommendation[]
```

Behavior:
- Mount → fetch Stage A (always runs with route context)
- Persona selected → fetch Stage B
- Slider change → **client-side re-rank over Stage A** (no network), debounced 400ms

---

## 6. Prompt skeleton (new structure)

```
Route: {source} → {dest} (~{distanceKm} km by road)
Vehicle: {carType} — {carConstraints}
Pickup: {date} at {time} ({season}, {daypart})
Trip span: {totalDays} day(s)

Persona: {personaName}
{personaRules}

Pace: {paceLevel} ({maxStops} stops, max {maxDetourKm}km detour)
Budget: {budgetLevel} ({feeGuidance})

Return EXACTLY {N} stops, JSON-only, matching this schema: [...]
```

### Per-persona rule blocks (examples)

- **family:** "Only kid-safe stops with restroom access. Avoid adventure sports and cliffside viewpoints. Prefer heritage sites with educational value, open-air parks, clean eateries."
- **couple:** "Prioritize scenic viewpoints, sunset spots, intimate cafes, photogenic heritage. Avoid crowded/chaotic stops."
- **friends:** "Include adventure activities, photo-op-friendly spots, lively cafes. Higher energy stops OK."
- **solo:** "Offbeat cultural stops, museums, quiet viewpoints. Flexibility over checklist tourism."
- **business:** "Absolute minimum detours. Clean restrooms, reliable food. No sightseeing unless zero-detour."

### Per-pace rule blocks

- **relaxed:** 3-5 stops, max 5km detour, 60-90 min each
- **balanced:** 5-7 stops, max 10km detour, 30-60 min each
- **packed:** 8-12 stops, max 20km detour, 20-45 min each

### Per-budget rule blocks

- **budget:** Free/donation-based, no paid attractions > ₹100
- **standard:** Mixed — typical Indian tourist pricing
- **premium:** OK to include paid heritage (₹500+), unique experiences

---

## 7. Files affected

### New files
- `src/components/PersonaPicker.tsx`
- `src/components/RefinementBar.tsx`
- `src/lib/ai/generator.ts`
- `src/lib/ai/reranker.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/ai/fallback.ts`
- `src/app/api/ai/rerank/route.ts`

### Modified files
- `src/lib/ai.ts` — thin shim re-exporting new modules (keeps external import paths working during transition)
- `src/app/api/ai/generate-stops/route.ts` — switch to streaming, accept new params
- `src/hooks/useTripLogic.ts` — persona + slider state, two-stage orchestration
- `src/app/listing/page.tsx` — intercept car click to show PersonaPicker before PlanningModal
- `src/components/PlanningModal.tsx` — accept `persona` prop, pass down
- `src/components/ScoutContainer.tsx` — mount `RefinementBar` below results
- `src/types/index.ts` — add `Persona`, `PaceLevel`, `BudgetLevel`, `TravelContext`

---

## 8. Error handling & fallback

- OpenRouter down / key missing → `fallback.ts` per-persona hardcoded list for top routes; "approximate match" for unknown routes (haversine midpoint)
- Stage A fails → fall back to current `generateIntelligentFallback()` (generic but functional)
- Stage B fails (but A succeeded) → show Stage A candidates with client-side heuristic ranking (no AI re-rank)
- Streaming failure → degrade to non-streaming (fetch full response)

---

## 9. Testing approach

**Manual QA matrix** (must all visibly differ):
- 3 routes: Mumbai→Pune (short), Delhi→Jaipur (medium), Bangalore→Goa (long + multi-day)
- × 5 personas = 15 baseline outputs
- × 3 pace/budget combos per persona = 45 total runs
- Verify: same route + different persona = noticeably different stops
- Verify: slider changes re-rank client-side (no network calls in DevTools)
- Verify: mobile responsive (persona tiles, slider, streaming UI)

**No automated tests in v1** — rapid iteration phase. Add snapshot/integration tests in v1.5 once personas stabilize.

---

## 10. Rollout

- Single feature branch off `main`
- In-code feature flag: `export const ENABLE_PERSONAS = true` in `src/lib/flags.ts`
- Dev locally → Vercel preview → manual QA → merge

---

## 11. Open decisions (locked unless revisited)

- **Skip persona?** → No, required. "Not sure" tile defaults to `family` (highest-traffic persona in cab rental).
- **Refinement bar behavior?** → Auto-apply with 400ms debounce (no Apply button).
- **Stage A model?** → Keep current `openai/gpt-4o-mini` via OpenRouter. Re-evaluate if cost spikes.
- **Persona persistence?** → Saved to `sessionStorage` alongside existing `savaari_search`. Persists refresh, cleared on tab close.

---

## 12. Estimated effort

~5–7 days solo-dev. Breakdown:
- Phase 1 (AI layer + prompts + types): 1.5 days
- Phase 2 (PersonaPicker UI): 1 day
- Phase 3 (Two-stage + streaming wiring): 1.5 days
- Phase 4 (Refinement bar): 1 day
- Phase 5 (Fallback + QA): 1 day

---

*End of spec.*
