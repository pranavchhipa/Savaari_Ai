# Local Tab + Performance Fix + Images — Design Spec

**Date:** 2026-04-16
**Branch:** `feat/local-tab-perf-images` (off `feat/ai-personalization-v2`)

---

## 1. Problem Statement

Three issues need solving:

1. **Missing "Local" booking mode.** The SearchWidget only supports one-way and round-trip. Local (hourly rental) bookings need a third tab with simplified fields (pickup address only, no destination) and package-based pricing (8hr/80km, 12hr/120km).

2. **AI response takes 2-3 minutes.** The current pipeline runs Stage A → Stage B → Google Places validation (one `textSearch` per stop, 8-12 stops) sequentially. Google Places validation is the bottleneck (~2-5 sec per stop × 10 stops = 20-50s, plus timeouts can push it to minutes).

3. **Missing images on suggested places.** The `Stop` interface lacks a `photoUrl` field. Photos fetched via Google Places during validation don't propagate to the rendered stop cards because the type doesn't carry them.

---

## 2. Scope

### In scope
- "Local" tab in SearchWidget with single pickup field
- Package toggle (8hr/80km, 12hr/120km) on listing page for local trips
- Local package pricing on car cards
- AI personalization (PersonaPicker + RefinementBar) available for local trips
- Local-aware AI prompt (sightseeing within city radius instead of A→B route)
- Skip Google Places validation on initial render — show stops instantly with AI-provided data
- Lazy background photo loading via new `useLazyPlacePhotos` hook
- Add `photoUrl` to `Stop` type; propagate photos through the pipeline
- Shimmer/placeholder for images while loading

### Out of scope
- Multi-day local packages
- Airport transfer tab
- Automated tests (deferred per v2 spec §9)
- SSE streaming (deferred per v2 plan)

---

## 3. Architecture

### 3.1 Local Tab Flow

```
SearchWidget (local tab)
  → pickup address + date + time only
  → sessionStorage: { tripType: 'local', source, pickupDate, pickupTime }
  → /listing page

ListingPage (local mode)
  → Package toggle: 8hr/80km | 12hr/120km
  → Car cards with package pricing
  → "Plan My Perfect Trip" → PersonaPicker → PlanningModal
  → AI generates sightseeing stops around pickup city
```

### 3.2 Performance: Skip-and-Stream Pattern

**Before (current):**
```
Stage A (15s) → Stage B (10s) → Google Places per stop (20-50s+) → render
Total: 45-75+ seconds, often 2-3 min with timeouts
```

**After:**
```
Stage A (15s) → Stage B (10s) → render immediately with AI coords
                                  ↓ (background, non-blocking)
                           useLazyPlacePhotos → updates cards as photos arrive
Total perceived: ~20-25 seconds to interactive, photos stream in after
```

### 3.3 Image Pipeline

```
AI response (no photos) → convertAIStopsToStops (approximate coords)
  → render with type-based placeholder
  → useLazyPlacePhotos fires per stop name
  → Google Places textSearch → photoUrl
  → setStops() update → card re-renders with real photo
  → If no Google photo found → keep type-based gradient placeholder
```

---

## 4. Type Changes

### 4.1 `src/types/index.ts`

```ts
// Extend SearchParams to support local
export interface SearchParams {
  source: Location | null;
  destination: Location | null;
  pickupDate: string;
  dropDate?: string;
  pickupTime?: string;
  tripType: 'one-way' | 'round-trip' | 'local';
  localPackage?: LocalPackage;
}

export type LocalPackage = '8hr_80km' | '12hr_120km';

// Add photoUrl to Stop
export interface Stop {
  // ... existing fields ...
  photoUrl?: string;
}

// Add local package pricing to Car
export interface Car {
  // ... existing fields ...
  localPackage8hr?: number;   // base price for 8hr/80km
  localPackage12hr?: number;  // base price for 12hr/120km
}
```

### 4.2 `src/types/index.ts` — TravelContext update

```ts
export interface TravelContext {
  // ... existing fields ...
  isLocal?: boolean;
  localPackage?: LocalPackage;
  radiusKm?: number;   // for local: 80 or 120
}
```

---

## 5. Component Changes

### 5.1 SearchWidget — Local Tab

**File:** `src/components/SearchWidget.tsx`

- Change `TripTab` from `'one-way' | 'round-trip'` to `'one-way' | 'round-trip' | 'local'`
- Add "Local" to the tab bar (3 tabs)
- When `tripTab === 'local'`:
  - Hide the destination ("To") field and the swap button
  - Hide the return date field
  - Change "From" label to "Pickup Address"
  - Change placeholder to "Enter pickup city or address"
- `handleSubmit` for local: validate only `source` (no destination required). Set `destination: null` in sessionStorage.

### 5.2 ListingPage — Package Toggle + Local Pricing

**File:** `src/app/listing/page.tsx`

- Read `tripType` from sessionStorage; if `'local'`, show the package toggle instead of route info header
- New state: `const [localPackage, setLocalPackage] = useState<LocalPackage>('8hr_80km')`
- Package toggle: segmented control styled like RefinementBar — "8 hrs / 80 km" | "12 hrs / 120 km"
- When `tripType === 'local'`:
  - Don't fetch `/api/route` (no destination)
  - Car pricing uses local package rates:
    - `car.localPackage8hr` for 8hr/80km
    - `car.localPackage12hr` for 12hr/120km
  - If `localPackage8hr`/`12hr` are not set, compute from perKmRate: `perKmRate × 80` or `perKmRate × 120`
  - Don't show distance/duration in the header (show package info instead)
- Header changes for local mode:
  - Show: "{Pickup City} • Local" instead of "{Source} → {Destination}"
  - Show: package details "8 Hours / 80 km included"

### 5.3 CarCard — Local Context Pass-through

**File:** `src/components/CarCard.tsx`

- Accept optional `localPackage` and `isLocal` props
- When local: display package price instead of distance-based fare
- Pass `isLocal` + `localPackage` down to PlanningModal

### 5.4 sampleCars — Local Pricing

**File:** `src/app/listing/page.tsx` (sampleCars array)

Add local package pricing to each car:

| Car | 8hr/80km | 12hr/120km |
|-----|----------|------------|
| Wagon R | ₹1,800 | ₹2,400 |
| Etios | ₹2,200 | ₹2,900 |
| Amaze | ₹2,400 | ₹3,200 |
| Ertiga | ₹3,200 | ₹4,200 |
| Innova Crysta | ₹4,500 | ₹5,800 |

---

## 6. Performance: Instant Stops + Lazy Photos

### 6.1 Skip Validation on First Render

**File:** `src/hooks/useTripLogic.ts`

In `fetchRouteAndStops`, after getting AI response:

- **Remove** the call to `processAndValidateStops` from the critical render path
- **Directly** call `convertAIStopsToStops` with AI-provided approximate coordinates
- Set stops and render immediately
- `processAndValidateStops` is preserved but only called on-demand (e.g., user clicks a stop for directions)

**Local trip handling:** When `tripType === 'local'`, `fetchRouteAndStops` skips the `/api/route` call entirely. Instead:
- Creates a synthetic `routeData` centered on the pickup city (source coords as center, no polyline)
- Sets `distanceKm` to the package radius (80 or 120)
- Sets `destination = source` for the AI call
- Stops are arranged by `approximateKm` from city center (not along a road line)
- The map component shows pins around the city instead of a route polyline

### 6.2 New Hook: `useLazyPlacePhotos`

**File:** `src/hooks/useLazyPlacePhotos.ts` (new)

```ts
interface UseLazyPlacePhotosReturn {
  photoMap: Map<string, string>;  // stopName → photoUrl
  isLoading: boolean;
}

function useLazyPlacePhotos(
  stops: Stop[],
  biasLat: number,
  biasLng: number,
): UseLazyPlacePhotosReturn
```

Behavior:
- Takes the current stops array + center point for Google Places bias
- Fires `textSearch` for each stop that lacks a `photoUrl`, **3 at a time** (concurrency limit to avoid rate limits)
- Returns a progressively-filling `photoMap`
- Caller uses the map to patch `photoUrl` onto stops via a `useEffect`
- Debounced: waits 500ms after stops change before starting (avoids double-fetching during re-rank)
- Skips stops that already have photos

### 6.3 Image Placeholders

**Components:** `TimelineItem`, `RecommendationShowcase`, stop cards

When `photoUrl` is undefined:
- Show a gradient placeholder based on stop type:
  - heritage: warm amber gradient + 🏛️
  - nature/viewpoint: green gradient + 🌿
  - food/restaurant: red-orange gradient + 🍛
  - adventure: blue gradient + 🏔️
  - tourist/cultural: purple gradient + ✨
  - default: gray gradient + 📍
- When `photoUrl` arrives: crossfade to real image (framer-motion `AnimatePresence`)

---

## 7. AI Prompt for Local Sightseeing

### 7.1 Local Prompt Variant

**File:** `src/lib/ai/prompts.ts`

Add `stageALocalPrompt` function:

```
Given pickup city: {city}
Package: {hours} hours / {radiusKm} km radius
Car type: {carType}
Date: {date}, Time: {time}

Suggest 10-15 sightseeing spots within {radiusKm} km of {city} center.
For each stop provide: name, type, description, whyVisit, famousFor,
rating, approximateKm (from city center), suggestedDuration, tags.

All stops must be real, famous places physically within the radius.
Order by recommended visit sequence for a day trip.
```

### 7.2 Generator Change

**File:** `src/lib/ai/generator.ts`

- `generateCandidates` checks if `ctx.isLocal` is true
- If local: use `stageALocalPrompt` instead of `stageAPrompt`
- Cache key for local: `local-{city}-{carType}-{radiusKm}-{season}-{daypart}`

### 7.3 API Route Change

**File:** `src/app/api/ai/generate-stops/route.ts`

- Accept `isLocal` and `localPackage` in body
- When local: set `destination = source` conceptually, pass `isLocal` and `radiusKm` (80 or 120) to context

---

## 8. File Change Summary

| File | Change Type | What |
|------|------------|------|
| `src/types/index.ts` | Modify | Add `LocalPackage`, `photoUrl` to Stop, local fields to Car, SearchParams, TravelContext |
| `src/components/SearchWidget.tsx` | Modify | Add "Local" tab, conditional form fields |
| `src/app/listing/page.tsx` | Modify | Package toggle, local pricing, local-aware header |
| `src/components/CarCard.tsx` | Modify | Accept local props, pass to PlanningModal |
| `src/hooks/useTripLogic.ts` | Modify | Skip validation for instant render, wire lazy photos |
| `src/hooks/useLazyPlacePhotos.ts` | Create | Background photo fetching hook |
| `src/lib/ai/prompts.ts` | Modify | Add `stageALocalPrompt` |
| `src/lib/ai/generator.ts` | Modify | Route to local prompt when `isLocal` |
| `src/app/api/ai/generate-stops/route.ts` | Modify | Accept isLocal + localPackage |
| `src/components/PlanningModal.tsx` | Modify | Accept local context |
| `src/components/ScoutContainer.tsx` | Modify | Wire lazy photos, image placeholders |

---

## 9. Verification

Manual checks (per v2 testing discipline):

1. **Local tab:** Home → Local tab → enter "Bangalore" → pick date/time → Explore Cabs → listing shows package toggle + car cards with local pricing
2. **Package toggle:** Switch 8hr/80km ↔ 12hr/120km → prices update on all cards
3. **Local AI flow:** Click "Plan My Perfect Trip" on Innova → PersonaPicker → "Family Weekend" → PlanningModal opens → stops show Bangalore sightseeing spots (Lalbagh, Cubbon Park, etc.)
4. **Instant render:** Stops appear within 20-25 seconds (no 2-3 min wait)
5. **Lazy photos:** Stop cards initially show gradient placeholders → photos fade in over next 10-20 seconds
6. **One-way/round-trip unchanged:** Existing flow still works identically
7. **Mobile:** Local tab, package toggle, and image placeholders render cleanly on iPhone SE viewport

---

*End of spec.*
