# Local Tab + Performance Fix + Images — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Local" booking tab (8hr/80km, 12hr/120km packages), fix the 2-3 minute AI response delay by skipping Google Places validation on first render, and fix missing images with lazy background photo loading.

**Architecture:** Three independent improvements sharing overlapping files. (1) SearchWidget gets a third "Local" tab with simplified form; ListingPage gets a package toggle and local pricing. (2) `useTripLogic` bypasses `processAndValidateStops` for instant rendering; a new `useLazyPlacePhotos` hook fetches photos in the background. (3) `Stop` type gets `photoUrl`; components show gradient placeholders until photos load.

**Tech Stack:** Next.js 16.1.6 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide icons, OpenRouter → gpt-4o-mini, Google Places JS SDK.

**Testing approach:** Per spec §9, automated tests are deferred. Every task ends with `npx tsc --noEmit` and a manual browser verification step.

**Branch:** `feat/local-tab-perf-images` off current `main`.

---

## File Structure

### New files
| Path | Responsibility |
|---|---|
| `src/hooks/useLazyPlacePhotos.ts` | Background Google Places photo fetching with concurrency limit |

### Modified files
| Path | What changes |
|---|---|
| `src/types/index.ts` | Add `LocalPackage`, `photoUrl` to `Stop`, local pricing to `Car`, update `SearchParams` + `TravelContext` |
| `src/components/SearchWidget.tsx` | Add "Local" tab, conditional form (hide destination for local) |
| `src/app/listing/page.tsx` | Package toggle, local pricing, local-aware header, local package fields on `sampleCars` |
| `src/components/CarCard.tsx` | Accept local props, show package price, pass to PlanningModal |
| `src/components/PlanningModal.tsx` | Accept + forward local context |
| `src/components/ScoutContainer.tsx` | Wire lazy photos, pass local context to useTripLogic |
| `src/hooks/useTripLogic.ts` | Skip processAndValidateStops, instant render, integrate lazy photos, local trip mode |
| `src/lib/ai/prompts.ts` | Add `stageALocalPrompt` for city-radius sightseeing |
| `src/lib/ai/generator.ts` | Route to local prompt when `ctx.isLocal`, local cache key |
| `src/app/api/ai/generate-stops/route.ts` | Accept `isLocal` + `localPackage` in body |

---

## Task 0: Create feature branch

**Files:**
- git only

- [ ] **Step 1: Create branch off main**

```bash
git checkout main
git pull origin main
git checkout -b feat/local-tab-perf-images
```

Run: `git branch --show-current`
Expected: `feat/local-tab-perf-images`

---

## Task 1: Type updates

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add LocalPackage type and update SearchParams**

In `src/types/index.ts`, after `export type StopBadge = ...` (line 24), the `Stop` interface starts at line 26. Add `photoUrl` to the Stop interface after line 42 (`imageQuery`):

```ts
    photoUrl?: string;          // Google Places photo or lazy-loaded
```

- [ ] **Step 2: Add LocalPackage type**

After the `SearchParams` interface (line 133), add:

```ts
export type LocalPackage = '8hr_80km' | '12hr_120km';
```

- [ ] **Step 3: Update SearchParams to support local**

Replace the existing `SearchParams` interface (lines 126-133):

```ts
export interface SearchParams {
  source: Location | null;
  destination: Location | null;
  pickupDate: string;
  dropDate?: string;
  pickupTime?: string;
  tripType: 'one-way' | 'round-trip' | 'local';
  localPackage?: LocalPackage;
}
```

- [ ] **Step 4: Add local pricing fields to Car**

In the `Car` interface (ends at line 88), before the closing `}`, add:

```ts
  localPackage8hr?: number;   // base price for 8hr/80km
  localPackage12hr?: number;  // base price for 12hr/120km
```

- [ ] **Step 5: Update TravelContext for local**

In the `TravelContext` interface (ends at line 211), before the closing `}`, add:

```ts
  isLocal?: boolean;
  localPackage?: LocalPackage;
  radiusKm?: number;          // for local: 80 or 120
```

- [ ] **Step 6: Type-check and commit**

```bash
npx tsc --noEmit
git add src/types/index.ts
git commit -m "feat(types): add LocalPackage, photoUrl on Stop, local pricing on Car"
```

---

## Task 2: SearchWidget — Local tab

**Files:**
- Modify: `src/components/SearchWidget.tsx`

- [ ] **Step 1: Change TripTab type**

Replace line 10:

```ts
type TripTab = 'one-way' | 'round-trip';
```

with:

```ts
type TripTab = 'one-way' | 'round-trip' | 'local';
```

- [ ] **Step 2: Add "Local" to the tab bar**

Replace the tab rendering block (lines 107-126) — the `{(['one-way', 'round-trip'] as TripTab[]).map(...)` section — with:

```tsx
                    {(['one-way', 'round-trip', 'local'] as TripTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setTripTab(tab)}
                            className={`relative px-6 md:px-8 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 ${tripTab === tab
                                    ? 'text-[#2563EB]'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab === 'one-way' ? 'One Way' : tab === 'round-trip' ? 'Round Trip' : 'Local'}
                            {tripTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#2563EB] rounded-full"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
```

- [ ] **Step 3: Conditionally hide destination for local**

Wrap the entire "Row 1: Locations" section (the div at line 133 containing From, Swap, To) with an `AnimatePresence`. Replace lines 131-179 with:

```tsx
                {/* Row 1: Locations */}
                <div className="p-6 pb-0">
                    <div className="flex flex-col md:flex-row items-stretch gap-0 relative">
                        {/* FROM / PICKUP */}
                        <div className={`${tripTab === 'local' ? 'w-full' : 'flex-1'} min-w-0`}>
                            <GooglePlacesAutocomplete
                                label={tripTab === 'local' ? 'Pickup Address' : 'From'}
                                placeholder={tripTab === 'local' ? 'Enter pickup city or address' : 'Enter pickup city'}
                                defaultValue={sourceQuery}
                                onPlaceSelect={handleSourceSelect}
                                iconColor="#2563EB"
                            />
                        </div>

                        {/* Swap + Destination — hidden for local */}
                        <AnimatePresence>
                            {tripTab !== 'local' && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="flex flex-col md:flex-row items-stretch flex-1 min-w-0 overflow-hidden"
                                >
                                    {/* Swap Button - Desktop */}
                                    <div className="hidden md:flex items-end justify-center px-2 pb-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 180 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={swapLocations}
                                            className="w-9 h-9 bg-gray-50 hover:bg-[#2563EB] hover:text-white rounded-full flex items-center justify-center text-gray-400 border border-gray-200 hover:border-[#2563EB] transition-all duration-300"
                                        >
                                            <ArrowLeftRight className="w-3.5 h-3.5" />
                                        </motion.button>
                                    </div>

                                    {/* Mobile Swap */}
                                    <div className="md:hidden flex justify-center -my-1.5 relative z-10">
                                        <motion.button
                                            whileTap={{ rotate: 180 }}
                                            onClick={swapLocations}
                                            className="p-2 bg-white rounded-full shadow-md border border-gray-100 text-[#2563EB]"
                                        >
                                            <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
                                        </motion.button>
                                    </div>

                                    {/* TO */}
                                    <div className="flex-1 min-w-0">
                                        <GooglePlacesAutocomplete
                                            label="To"
                                            placeholder="Enter destination city"
                                            defaultValue={destQuery}
                                            onPlaceSelect={handleDestSelect}
                                            iconColor="#F97316"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
```

- [ ] **Step 4: Hide return date for local**

The return date AnimatePresence (line 207) currently checks `tripTab === 'round-trip'`. No change needed — local already hides it since it's not `'round-trip'`.

- [ ] **Step 5: Update handleSubmit for local**

Replace the `handleSubmit` function (lines 54-81) with:

```tsx
    const handleSubmit = () => {
        if (tripTab === 'local') {
            if (!source) {
                alert('Please select a pickup location');
                return;
            }
        } else {
            if (!source || !destination) {
                if (!source && !destination) {
                    alert('Please select pickup and drop locations');
                    return;
                }
                if (!source) {
                    alert('Please select a pickup location');
                    return;
                }
                if (!destination) {
                    alert('Please select a drop location');
                    return;
                }
            }
        }

        setIsLoading(true);

        const searchParams = {
            source,
            destination: tripTab === 'local' ? null : destination,
            pickupDate,
            tripType: tripTab,
            dropDate: tripTab === 'round-trip' ? dropDate : undefined,
            pickupTime,
        };
        sessionStorage.setItem('savaari_search', JSON.stringify(searchParams));
        router.push('/listing');
    };
```

- [ ] **Step 6: Type-check and commit**

```bash
npx tsc --noEmit
git add src/components/SearchWidget.tsx
git commit -m "feat(ui): add Local tab to SearchWidget with single pickup field"
```

---

## Task 3: ListingPage — package toggle + local pricing

**Files:**
- Modify: `src/app/listing/page.tsx`

- [ ] **Step 1: Add local pricing to sampleCars**

Add `localPackage8hr` and `localPackage12hr` to each car in the `sampleCars` array (lines 28-99). After each car's existing `features` array, add:

For Wagon R (id 1):
```ts
        localPackage8hr: 1800,
        localPackage12hr: 2400,
```

For Etios (id 2):
```ts
        localPackage8hr: 2200,
        localPackage12hr: 2900,
```

For Amaze (id 3):
```ts
        localPackage8hr: 2400,
        localPackage12hr: 3200,
```

For Ertiga (id 4):
```ts
        localPackage8hr: 3200,
        localPackage12hr: 4200,
```

For Innova Crysta (id 5):
```ts
        localPackage8hr: 4500,
        localPackage12hr: 5800,
```

- [ ] **Step 2: Import LocalPackage type and add state**

Add to the import from `@/types` (line 6):

```ts
import { Car, SearchParams, Location, LocalPackage } from '@/types';
```

After the existing state declarations (around line 121), add:

```ts
    const [localPackage, setLocalPackage] = useState<LocalPackage>('8hr_80km');
```

- [ ] **Step 3: Update tripType state to support local**

Change line 117:

```ts
    const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
```

to:

```ts
    const [tripType, setTripType] = useState<'one-way' | 'round-trip' | 'local'>('round-trip');
```

Also update the sessionStorage restore (around line 174) — it already reads `params.tripType` so it will pick up `'local'` automatically.

- [ ] **Step 4: Skip route fetch for local**

In the `loadRoute` function (starts ~line 158), wrap the route API call in a condition. After the sessionStorage parsing block (around line 182), add:

```ts
            // For local trips, skip route fetch — no destination
            if (params?.tripType === 'local') {
                setIsLoading(false);
                return;
            }
```

- [ ] **Step 5: Compute local pricing for car cards**

Find where `calculateTripStats` is used to compute per-car pricing (around line 230+). Add a local pricing branch. Before the existing distance-based calculation, add:

```ts
            // Local trip pricing — package-based
            if (tripType === 'local') {
                const packagePrice = localPackage === '8hr_80km'
                    ? (car.localPackage8hr ?? car.perKmRate * 80)
                    : (car.localPackage12hr ?? car.perKmRate * 120);
                return { ...car, baseFare: packagePrice };
            }
```

- [ ] **Step 6: Add package toggle UI**

Find the sticky header area in the JSX (the section that shows source → destination with trip type toggle). Add a package toggle for local mode. After the trip type toggle section, add:

```tsx
                        {/* Local Package Toggle */}
                        {tripType === 'local' && (
                            <div className="flex items-center gap-2 ml-4">
                                <div className="inline-flex bg-gray-100 rounded-xl p-1">
                                    {([
                                        { value: '8hr_80km' as LocalPackage, label: '8 hrs / 80 km' },
                                        { value: '12hr_120km' as LocalPackage, label: '12 hrs / 120 km' },
                                    ]).map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setLocalPackage(opt.value)}
                                            className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                                                localPackage === opt.value
                                                    ? 'bg-white text-[#2563EB] shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
```

- [ ] **Step 7: Update header for local mode**

In the route header display (the section showing "Source → Destination"), add a local variant:

```tsx
                        {tripType === 'local' ? (
                            <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                <MapPin className="w-5 h-5 text-[#2563EB]" />
                                <span>{source.name}</span>
                                <span className="text-sm font-medium text-gray-400">• Local</span>
                            </div>
                        ) : (
                            /* existing source → destination header */
```

- [ ] **Step 8: Pass local props to CarCard**

Where `<CarCard>` is rendered (around line 675), add local props:

```tsx
                                    <CarCard
                                        key={car.id}
                                        car={car}
                                        source={source}
                                        destination={tripType === 'local' ? source : destination}
                                        tripType={tripType === 'local' ? 'one-way' : tripType}
                                        pickupDate={pickupDate}
                                        dropDate={dropDate}
                                        pickupTime={pickupTime}
                                    />
```

Note: For local, we pass `source` as both source and destination. The AI will know to do local sightseeing because `isLocal` will be set in the generate-stops API call (Task 7).

- [ ] **Step 9: Type-check and commit**

```bash
npx tsc --noEmit
git add src/app/listing/page.tsx
git commit -m "feat(ui): add package toggle + local pricing on listing page"
```

---

## Task 4: Performance — skip validation for instant render

**Files:**
- Modify: `src/hooks/useTripLogic.ts`

This is the critical performance fix. We bypass `processAndValidateStops` (which makes N sequential Google Places calls) and render stops immediately with AI-provided coordinates.

- [ ] **Step 1: Bypass processAndValidateStops in fetchRouteAndStops**

In `fetchRouteAndStops` (starts around line 343), find the block that calls `processAndValidateStops` for onward stops (around line 396-444). Replace the entire onward processing block:

```ts
            // Process onward stops — INSTANT RENDER: skip Google Places validation,
            // use AI approximate coords directly for fast render. Photos load lazily.
            if (onwardResponse?.stops && onwardResponse.stops.length > 0) {
                setRecommendations(onwardResponse.stops);
                setDontMiss(onwardResponse.dontMiss || []);

                // Snapshot for Stage A re-rank pool
                setStageACandidates(onwardResponse.stops as AICandidate[]);

                const mappedOnward = convertAIStopsToStops(
                    onwardResponse.stops,
                    route.coordinates,
                    source,
                    destination,
                    route.distanceKm,
                    'onward'
                );
                finalStops = [...finalStops, ...mappedOnward];
            }
```

This removes the `processAndValidateStops` call and the photo-patching `setRecommendations` block. Photos will now come from the lazy hook (Task 5).

- [ ] **Step 2: Same for round-trip return leg**

Find the return-trip processing block (around line 462-486). Simplify it similarly:

```ts
            // Handle round trip — instant render (no validation)
            if (tripType === 'round-trip') {
                const returnResponse = await fetchAIStops(destination.name, source.name, distance, {
                    carType,
                    pickupDate,
                    pickupTime,
                    persona: persona ?? null,
                    pace: pace ?? 'balanced',
                    budget: budget ?? 'standard',
                });

                if (returnResponse?.stops && returnResponse.stops.length > 0) {
                    const mappedReturn = convertAIStopsToStops(
                        returnResponse.stops,
                        route.coordinates,
                        destination,
                        source,
                        route.distanceKm,
                        'return'
                    );
                    const uniqueReturn = mappedReturn.map(s => ({ ...s, id: `return-${s.id}` }));
                    finalStops = [...finalStops, ...uniqueReturn];
                }
            }
```

- [ ] **Step 3: Thread context into the onward fetchAIStops call**

Find the existing onward `fetchAIStops` call (around line 384). Update it to pass full context:

```ts
            const onwardResponse = await fetchAIStops(source.name, destination.name, distance, {
                carType,
                pickupDate,
                pickupTime,
                persona: persona ?? null,
                pace: pace ?? 'balanced',
                budget: budget ?? 'standard',
            });
```

- [ ] **Step 4: Add carType to fetchRouteAndStops dependencies**

The `fetchRouteAndStops` useCallback (around line 525) depends on `[source, destination, ...]`. Add `persona, pace, budget, carType` to the dependency array:

```ts
    }, [source, destination, baseFare, perKmRate, driverAllowancePerDay, tripType, convertAIStopsToStops, persona, pace, budget, carType]);
```

- [ ] **Step 5: Type-check and commit**

```bash
npx tsc --noEmit
git add src/hooks/useTripLogic.ts
git commit -m "perf: skip Google Places validation for instant stop rendering"
```

---

## Task 5: Lazy photo loading hook

**Files:**
- Create: `src/hooks/useLazyPlacePhotos.ts`
- Modify: `src/hooks/useTripLogic.ts` (wire it in)

- [ ] **Step 1: Create useLazyPlacePhotos hook**

Write `src/hooks/useLazyPlacePhotos.ts`:

```ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Stop } from '@/types';
import { loadGoogleMapsScript } from '@/lib/maps';

interface UseLazyPlacePhotosReturn {
    photoMap: Map<string, string>;
    isLoading: boolean;
}

const CONCURRENCY = 3;

export function useLazyPlacePhotos(
    stops: Stop[],
    biasLat: number,
    biasLng: number,
): UseLazyPlacePhotosReturn {
    const [photoMap, setPhotoMap] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const abortRef = useRef(false);
    const fetchedRef = useRef(new Set<string>());

    const fetchPhoto = useCallback(
        async (stopName: string): Promise<{ name: string; url: string } | null> => {
            if (typeof window === 'undefined' || !window.google?.maps?.places) return null;

            return new Promise((resolve) => {
                const service = new window.google.maps.places.PlacesService(
                    document.createElement('div'),
                );
                service.textSearch(
                    {
                        query: stopName,
                        location: new window.google.maps.LatLng(biasLat, biasLng),
                        radius: 50000,
                    },
                    (results, status) => {
                        if (
                            status === window.google.maps.places.PlacesServiceStatus.OK &&
                            results &&
                            results.length > 0
                        ) {
                            try {
                                const photo = results[0].photos?.[0];
                                if (photo) {
                                    const url = photo.getUrl({ maxWidth: 800, maxHeight: 600 });
                                    resolve({ name: stopName, url });
                                    return;
                                }
                            } catch {
                                /* ignore photo errors */
                            }
                        }
                        resolve(null);
                    },
                );
            });
        },
        [biasLat, biasLng],
    );

    useEffect(() => {
        // Filter stops that need photos (skip start/end, already-fetched, already-have-photo)
        const needsPhoto = stops.filter(
            (s) =>
                s.type !== 'start' &&
                s.type !== 'end' &&
                !s.photoUrl &&
                !fetchedRef.current.has(s.name),
        );

        if (needsPhoto.length === 0) return;

        abortRef.current = false;
        setIsLoading(true);

        // Ensure Google Maps is loaded
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const run = async () => {
            if (apiKey) {
                await loadGoogleMapsScript(apiKey).catch(() => {});
            }

            // Process in batches of CONCURRENCY
            for (let i = 0; i < needsPhoto.length; i += CONCURRENCY) {
                if (abortRef.current) break;

                const batch = needsPhoto.slice(i, i + CONCURRENCY);
                const results = await Promise.allSettled(
                    batch.map((s) => fetchPhoto(s.name)),
                );

                const newEntries: Array<[string, string]> = [];
                for (const r of results) {
                    if (r.status === 'fulfilled' && r.value) {
                        newEntries.push([r.value.name, r.value.url]);
                        fetchedRef.current.add(r.value.name);
                    } else {
                        // Mark as fetched even on failure to avoid retrying
                        const idx = results.indexOf(r);
                        if (batch[idx]) fetchedRef.current.add(batch[idx].name);
                    }
                }

                if (newEntries.length > 0 && !abortRef.current) {
                    setPhotoMap((prev) => {
                        const next = new Map(prev);
                        for (const [name, url] of newEntries) {
                            next.set(name, url);
                        }
                        return next;
                    });
                }
            }

            setIsLoading(false);
        };

        // Debounce 500ms to avoid double-fetching during re-rank
        const handle = setTimeout(run, 500);
        return () => {
            clearTimeout(handle);
            abortRef.current = true;
        };
    }, [stops, fetchPhoto]);

    return { photoMap, isLoading };
}
```

- [ ] **Step 2: Wire lazy photos into useTripLogic**

In `src/hooks/useTripLogic.ts`, add the import at the top:

```ts
import { useLazyPlacePhotos } from './useLazyPlacePhotos';
```

Inside the hook, after the existing state declarations (around line 80), add the lazy photo hook:

```ts
    // Lazy background photo loading — fires after stops render
    const centerLat = source?.lat ?? 0;
    const centerLng = source?.lng ?? 0;
    const { photoMap } = useLazyPlacePhotos(stops, centerLat, centerLng);
```

Add an effect to patch photos onto stops as they arrive:

```ts
    // Patch lazy-loaded photos onto stops
    useEffect(() => {
        if (photoMap.size === 0) return;
        setStops((prev) => {
            let changed = false;
            const updated = prev.map((s) => {
                if (!s.photoUrl && photoMap.has(s.name)) {
                    changed = true;
                    return { ...s, photoUrl: photoMap.get(s.name) };
                }
                return s;
            });
            return changed ? updated : prev;
        });
        // Also patch recommendations for the showcase
        setRecommendations((prev) => {
            let changed = false;
            const updated = prev.map((r) => {
                if (!r.photoUrl && photoMap.has(r.name)) {
                    changed = true;
                    return { ...r, photoUrl: photoMap.get(r.name) };
                }
                return r;
            });
            return changed ? updated : prev;
        });
    }, [photoMap]);
```

- [ ] **Step 3: Type-check and commit**

```bash
npx tsc --noEmit
git add src/hooks/useLazyPlacePhotos.ts src/hooks/useTripLogic.ts
git commit -m "feat: add useLazyPlacePhotos hook for background image loading"
```

---

## Task 6: Image placeholders in stop components

**Files:**
- Modify: `src/components/RecommendationShowcase.tsx` (verify existing placeholder works)
- Modify: `src/components/TimelineItem.tsx` (add photo display)

- [ ] **Step 1: Verify RecommendationShowcase placeholder**

Read `src/components/RecommendationShowcase.tsx` around lines 52-60. The `getGradientForType` function already provides gradient placeholders when `hasPhoto` is false. This works as-is — the lazy photo hook patches `photoUrl` onto recommendations, and the component re-renders with the real image.

No code change needed. Verify by reading the file.

- [ ] **Step 2: Add photoUrl display to TimelineItem**

In `src/components/TimelineItem.tsx`, the stop card doesn't currently show images. Find the main stop card content area (around line 90+). After the stop name/description block, add an image section:

```tsx
                    {/* Stop photo — lazy loaded */}
                    {stop.photoUrl && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 rounded-lg overflow-hidden h-24 w-full"
                        >
                            <img
                                src={stop.photoUrl}
                                alt={stop.name}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    )}
```

- [ ] **Step 3: Type-check and commit**

```bash
npx tsc --noEmit
git add src/components/TimelineItem.tsx
git commit -m "feat(ui): show lazy-loaded photos on timeline stop cards"
```

---

## Task 7: AI local sightseeing prompt

**Files:**
- Modify: `src/lib/ai/prompts.ts`
- Modify: `src/lib/ai/generator.ts`
- Modify: `src/app/api/ai/generate-stops/route.ts`

- [ ] **Step 1: Add stageALocalPrompt to prompts.ts**

In `src/lib/ai/prompts.ts`, after the `stageAPrompt` function (after line 126), add:

```ts
export interface StageALocalPromptInput {
  ctx: TravelContext;
}

export function stageALocalPrompt({ ctx }: StageALocalPromptInput): string {
  const season = seasonFor(ctx.pickupDate);
  const daypart = dayPartFor(ctx.pickupTime);
  const carConstraints = carConstraintsFor(ctx.carType);
  const radiusKm = ctx.radiusKm ?? 80;
  const hours = radiusKm <= 80 ? 8 : 12;

  return `You are Sarathi, Savaari's expert AI travel advisor for Indian local sightseeing.

CONTEXT
Pickup city: "${ctx.source}"
Package: ${hours} hours / ${radiusKm} km radius
Vehicle: ${ctx.carType} — ${carConstraints}
Date: ${ctx.pickupDate} at ${ctx.pickupTime} (${season}, ${daypart})

TASK
Suggest 10-15 REAL, FAMOUS sightseeing spots within ${radiusKm} km of ${ctx.source} city center. These spots should form a logical day-trip circuit. Include VARIETY — mix heritage, nature, viewpoints, cultural, food, markets.

RULES
- Every stop must be a REAL, NAMED, FAMOUS place in or near ${ctx.source} (Google-searchable).
- approximateKm is distance from city center (sorted by recommended visit order, NOT by distance).
- detourKm is 0 for all (everything is within the city radius).
- Each stop MUST have a "tags" array from: kid-safe, scenic, romantic, adventure, offbeat, cultural-depth, quick-stop, paid-entry, free, photo-op.
- Include entryFeeInr (0 for free).
- DO NOT include: hotels, petrol pumps, malls, hospitals, fictional places.
- Order stops in a logical sightseeing sequence for a day trip starting at ${ctx.pickupTime}.

OUTPUT (JSON only, no markdown fences):
${localOutputSchema()}`;
}

function localOutputSchema(): string {
  return `{
  "stops": [
    {
      "name": "Exact Famous Place",
      "type": "heritage|tourist|nature|adventure|cultural|viewpoint|food",
      "description": "2-sentence vivid description",
      "whyVisit": "One compelling reason",
      "famousFor": "What makes it iconic",
      "rating": 4.5,
      "badges": ["must-visit"],
      "approximateKm": 5,
      "detourKm": 0,
      "suggestedDuration": 45,
      "bestTimeToVisit": "morning",
      "tags": ["scenic", "photo-op"],
      "entryFeeInr": 50
    }
  ]
}`;
}
```

- [ ] **Step 2: Update generator.ts for local**

In `src/lib/ai/generator.ts`, add the import for `stageALocalPrompt`:

```ts
import { stageAPrompt, stageALocalPrompt } from './prompts';
```

Update the `stageACacheKey` function (line 13) to handle local:

```ts
function stageACacheKey(ctx: TravelContext): string {
  const season = new Date(ctx.pickupDate).getMonth();
  const daypart = parseInt(ctx.pickupTime.split(':')[0], 10);
  if (ctx.isLocal) {
    return `local-${ctx.source.toLowerCase()}-${ctx.carType}-${ctx.radiusKm ?? 80}-${season}-${daypart}`;
  }
  return `${ctx.source.toLowerCase()}-${ctx.destination.toLowerCase()}-${ctx.carType}-${season}-${daypart}`;
}
```

Update the `generateCandidates` function (line 33) to choose the right prompt:

```ts
  const prompt = ctx.isLocal ? stageALocalPrompt({ ctx }) : stageAPrompt({ ctx });
```

- [ ] **Step 3: Update generate-stops API route**

In `src/app/api/ai/generate-stops/route.ts`, add `isLocal` and `localPackage` to `GenerateStopsBody`:

```ts
interface GenerateStopsBody {
    source: string;
    destination: string;
    distanceKm: number;
    carType?: string;
    pickupDate?: string;
    pickupTime?: string;
    totalDays?: number;
    persona?: Persona | null;
    pace?: PaceLevel;
    budget?: BudgetLevel;
    isLocal?: boolean;
    localPackage?: string;
}
```

In the context builder (around line 38), add local fields:

```ts
        const radiusKm = body.localPackage === '12hr_120km' ? 120 : 80;

        const ctx: TravelContext = {
            source,
            destination: body.isLocal ? source : destination,
            distanceKm: body.isLocal ? radiusKm : distanceKm,
            carType: body.carType ?? 'Sedan',
            pickupDate: body.pickupDate ?? new Date().toISOString().split('T')[0],
            pickupTime: body.pickupTime ?? '09:00',
            totalDays: body.totalDays ?? 1,
            isLocal: body.isLocal ?? false,
            localPackage: body.localPackage as any,
            radiusKm: body.isLocal ? radiusKm : undefined,
        };
```

Also update the validation — for local, `distanceKm` might be 0 and `destination` might equal `source`:

```ts
        if (!source || (!body.isLocal && !destination) || (!body.isLocal && !distanceKm)) {
```

- [ ] **Step 4: Type-check and commit**

```bash
npx tsc --noEmit
git add src/lib/ai/prompts.ts src/lib/ai/generator.ts src/app/api/ai/generate-stops/route.ts
git commit -m "feat(ai): add local sightseeing prompt + wire isLocal through pipeline"
```

---

## Task 8: Local mode in useTripLogic

**Files:**
- Modify: `src/hooks/useTripLogic.ts`

- [ ] **Step 1: Accept isLocal prop**

The `UseTripLogicProps` interface already has `persona`, `pace`, `budget`, `carType` from v2. Add:

```ts
    isLocal?: boolean;
    localPackage?: string;
```

Destructure in the hook signature:

```ts
    isLocal,
    localPackage,
```

- [ ] **Step 2: Handle local mode in fetchRouteAndStops**

At the top of `fetchRouteAndStops`, after the `if (!source || !destination) return;` check, add a local branch:

```ts
        // Local mode: skip route fetch, generate sightseeing stops around pickup city
        if (isLocal) {
            setIsLoading(true);
            setError(null);
            setScoutTip('🤖 Sarathi AI is finding the best local attractions...');

            try {
                const radiusKm = localPackage === '12hr_120km' ? 120 : 80;
                // Synthetic route data centered on source
                setRouteData({
                    coordinates: [{ lat: source.lat, lng: source.lng }],
                    distanceKm: radiusKm,
                    durationMinutes: localPackage === '12hr_120km' ? 720 : 480,
                });

                const localResponse = await fetchAIStops(source.name, source.name, radiusKm, {
                    carType,
                    pickupDate,
                    pickupTime,
                    persona: persona ?? null,
                    pace: pace ?? 'balanced',
                    budget: budget ?? 'standard',
                });

                if (localResponse?.stops && localResponse.stops.length > 0) {
                    setRecommendations(localResponse.stops);
                    setDontMiss(localResponse.dontMiss || []);
                    setStageACandidates(localResponse.stops as AICandidate[]);

                    // For local, all stops are relative to city center
                    const localStops: Stop[] = [
                        {
                            id: 'start',
                            name: source.name,
                            type: 'start',
                            location: source,
                            duration: 0,
                            suggestedTime: pickupTime || '09:00',
                            description: 'Pickup point',
                            leg: 'onward',
                        },
                        ...localResponse.stops.map((s, i) => ({
                            id: `local-stop-${i}`,
                            name: s.name,
                            type: s.type as Stop['type'],
                            location: {
                                name: s.name,
                                displayName: `${s.name} - ${s.famousFor || s.description}`,
                                lat: source.lat + (Math.random() - 0.5) * 0.1,
                                lng: source.lng + (Math.random() - 0.5) * 0.1,
                            },
                            duration: s.suggestedDuration,
                            description: s.whyVisit || s.description,
                            isSelected: false,
                            detourKm: 0,
                            leg: 'onward' as const,
                            rating: s.rating,
                            badges: s.badges,
                            famousFor: s.famousFor,
                            bestTimeToVisit: s.bestTimeToVisit,
                        })),
                    ];
                    setStops(localStops);
                    setSelectedStops(localStops.filter(s => s.type === 'start'));
                    setScoutTip(`✨ Sarathi found ${localResponse.stops.length} amazing spots in ${source.name}!`);
                } else {
                    setStops([{
                        id: 'start', name: source.name, type: 'start',
                        location: source, duration: 0, description: 'Pickup point', leg: 'onward',
                    }]);
                    setScoutTip('No attractions found. Try a different city.');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
            return; // Don't run the normal route-based flow
        }
```

- [ ] **Step 3: Add isLocal to fetchRouteAndStops dependency array**

```ts
    }, [source, destination, baseFare, perKmRate, driverAllowancePerDay, tripType, convertAIStopsToStops, persona, pace, budget, carType, isLocal, localPackage]);
```

- [ ] **Step 4: Pass isLocal in fetchAIStops body**

In the `fetchAIStops` function, add `isLocal` and `localPackage` to the opts interface and the JSON body:

Add to the opts type:

```ts
            isLocal?: boolean;
            localPackage?: string;
```

Add to the JSON body:

```ts
                    isLocal: opts.isLocal,
                    localPackage: opts.localPackage,
```

Update the local mode call in Step 2 to pass these:

```ts
                const localResponse = await fetchAIStops(source.name, source.name, radiusKm, {
                    carType,
                    pickupDate,
                    pickupTime,
                    persona: persona ?? null,
                    pace: pace ?? 'balanced',
                    budget: budget ?? 'standard',
                    isLocal: true,
                    localPackage,
                });
```

- [ ] **Step 5: Type-check and commit**

```bash
npx tsc --noEmit
git add src/hooks/useTripLogic.ts
git commit -m "feat: add local sightseeing mode to useTripLogic"
```

---

## Task 9: Wire local context through CarCard → PlanningModal → ScoutContainer

**Files:**
- Modify: `src/components/ScoutContainer.tsx`

- [ ] **Step 1: Pass isLocal to useTripLogic in ScoutContainer**

The `ScoutContainerProps` interface already has `persona`. Add `isLocal` and `localPackage`:

```ts
    isLocal?: boolean;
    localPackage?: string;
```

Destructure in the component:

```ts
    isLocal = false,
    localPackage,
```

Pass to useTripLogic:

```ts
        isLocal,
        localPackage,
```

- [ ] **Step 2: Type-check and commit**

```bash
npx tsc --noEmit
git add src/components/ScoutContainer.tsx
git commit -m "feat: wire isLocal through ScoutContainer to useTripLogic"
```

---

## Task 10: Build verification + QA

**Files:**
- Only bug fixes if needed

- [ ] **Step 1: Type-check**

```bash
npx tsc --noEmit
```

Expected: exits with code 0.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: successful build.

- [ ] **Step 3: Manual QA — Local tab**

```bash
npm run dev
```

Open http://localhost:3000:
1. Click "Local" tab — destination field should hide
2. Enter "Bangalore" as pickup → select date/time → "Explore Cabs"
3. Listing page should show package toggle (8hr/80km selected)
4. Car prices should show local pricing (Innova: ₹4,500)
5. Switch to 12hr/120km — prices update (Innova: ₹5,800)

- [ ] **Step 4: Manual QA — Performance**

1. Click "Plan My Perfect Trip" on Innova
2. Pick "Family Weekend" persona
3. Stops should appear within 15-25 seconds (NOT 2-3 minutes)
4. Images should initially show gradient placeholders
5. Real photos should fade in over the next 10-20 seconds

- [ ] **Step 5: Manual QA — One-way/round-trip unchanged**

1. Go back to home, switch to "One Way"
2. Enter Bangalore → Mysore → search
3. Listing page should show normal route header (not local)
4. AI trip planning should still work normally

- [ ] **Step 6: Fix any issues and commit**

```bash
git add <files>
git commit -m "fix: QA fixes from local tab + performance rollout"
```

- [ ] **Step 7: Push to GitHub**

```bash
git push origin feat/local-tab-perf-images
```

---

## Self-review notes

- All 11 files from the spec §8 file change summary are covered by tasks.
- Type consistency: `LocalPackage`, `isLocal`, `localPackage`, `radiusKm` are defined in Task 1 and used consistently in Tasks 2-9.
- `stageALocalPrompt` is defined in Task 7 Step 1 and consumed in Task 7 Step 2.
- `useLazyPlacePhotos` is created in Task 5 Step 1 and wired in Task 5 Step 2.
- Performance fix (Task 4) removes `processAndValidateStops` from the critical path — the function is preserved but no longer called on first render.
- Image fix: `photoUrl` added to `Stop` in Task 1, lazy hook populates it in Task 5, components display it in Task 6.
- Local mode: full end-to-end flow from SearchWidget (Task 2) → ListingPage (Task 3) → useTripLogic (Task 8) → AI prompt (Task 7).

*End of plan.*
