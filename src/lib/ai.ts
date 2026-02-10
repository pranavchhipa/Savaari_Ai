'use server';

import { AIRouteStopsResponse, AIRecommendation, StopBadge } from '@/types';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

// Cache for AI responses
const aiCache = new Map<string, { data: AIRouteStopsResponse; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(source: string, destination: string, distanceKm: number): string {
    return `${source.toLowerCase()}-${destination.toLowerCase()}-${Math.round(distanceKm / 10) * 10}`;
}

/**
 * Generate tourist-focused route recommendations using AI.
 * As Savaari's product lead, this is our key differentiator:
 * - Recommendations that make customers WANT to take detours
 * - Each detour = more km = higher fare = more revenue
 * - Better experience = higher engagement = repeat customers
 */
export async function generateRouteStops(
    source: string,
    destination: string,
    distanceKm: number
): Promise<AIRouteStopsResponse | null> {
    const cacheKey = getCacheKey(source, destination, distanceKm);

    // Check cache
    const cached = aiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.warn('[Sarathi AI] No API key configured, using intelligent fallback');
        return generateIntelligentFallback(source, destination, distanceKm);
    }

    const needsNightHalt = distanceKm > 400;

    const prompt = `You are Sarathi, Savaari's expert AI travel advisor for Indian road trips. You have deep knowledge of every tourist destination, cultural site, hidden gem, and legendary food stop across India.

For a road trip from "${source}" to "${destination}" (approximately ${Math.round(distanceKm)} km):

Generate 8-10 MUST-VISIT tourist attractions and experiences that travelers would LOVE to discover along this specific route. Think like a passionate local guide who knows the BEST places.

RECOMMENDATION PRIORITIES (most important first):
1. 🏛️ UNESCO Sites, National Monuments, Famous Temples, Historic Forts
2. 🌊 Waterfalls, Lakes, National Parks, Scenic Natural Wonders  
3. 📸 Instagram-worthy Viewpoints, Sunrise/Sunset spots
4. 🎭 Cultural experiences, Traditional Markets, Artisan Villages
5. 🍛 LEGENDARY food stops - famous dhabas, regional specialties that people drive hours for
6. 🏔️ Adventure spots - trekking points, river crossings, eco-tourism

STRICT RULES:
- ONLY include REAL, VERIFIABLE places with correct names
- Places MUST be along or near this specific road route (within 30km detour max)
- Sort by DISTANCE from source (approximateKm)
- Each place must be genuinely worth stopping for - no generic rest stops
- Focus on places that will make travelers say "I'm SO glad we stopped here!"
- descriptions should be vivid, engaging travel writing (2 sentences max)
- whyVisit should be a single compelling hook that makes someone pull over

For BADGES, assign based on real quality:
- "must-visit": Famous enough that skipping would be a regret
- "hidden-gem": Lesser-known but extraordinary
- "instagram-worthy": Visually stunning, photo-worthy
- "family-friendly": Great for kids and families
- "off-the-beaten-path": Unique, adventurous, not touristy

Respond in this EXACT JSON format (no markdown, only valid JSON):
{
    "stops": [
        {
            "name": "Exact Real Place Name",
            "type": "heritage|tourist|nature|adventure|cultural|viewpoint|food",
            "description": "Vivid 2-sentence description",
            "whyVisit": "One compelling hook",
            "famousFor": "What makes it iconic",
            "rating": 4.5,
            "badges": ["must-visit", "instagram-worthy"],
            "approximateKm": 85,
            "detourKm": 3,
            "suggestedDuration": 45,
            "bestTimeToVisit": "morning"
        }
    ]${needsNightHalt ? `,
    "nightHalt": {
        "city": "Best City to Stay",
        "reason": "Why this is the ideal overnight stop",
        "approximateKm": ${Math.round(distanceKm * 0.45)}
    }` : ''},
    "dontMiss": [
        {
            "name": "Top Pick Name",
            "type": "heritage",
            "description": "This is THE reason to take this route",
            "whyVisit": "Unforgettable experience",
            "famousFor": "World-famous feature",
            "rating": 5,
            "badges": ["must-visit"],
            "approximateKm": 120,
            "detourKm": 2,
            "suggestedDuration": 60,
            "bestTimeToVisit": "anytime"
        }
    ]
}`;

    try {
        const response = await fetch(OPENROUTER_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://savaari.com',
                'X-Title': 'Savaari - Sarathi AI',
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are Sarathi, an expert Indian travel planner. Respond ONLY with valid JSON, no markdown formatting.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 3000,
            }),
        });

        if (!response.ok) {
            console.error('[Sarathi AI] API Error:', response.status);
            return generateIntelligentFallback(source, destination, distanceKm);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return generateIntelligentFallback(source, destination, distanceKm);
        }

        // Parse JSON, handling potential markdown wrapper
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
        }

        const parsed = JSON.parse(cleanContent) as AIRouteStopsResponse;

        // Validate and enhance stops
        if (parsed.stops && Array.isArray(parsed.stops)) {
            parsed.stops = parsed.stops
                .filter(stop => stop.name && stop.type && stop.approximateKm >= 0)
                .map((stop, index) => ({
                    ...stop,
                    id: `ai-stop-${index}`,
                    rating: Math.min(5, Math.max(1, stop.rating || 4)),
                    badges: validateBadges(stop.badges),
                    detourKm: Math.min(30, stop.detourKm || 5),
                    suggestedDuration: stop.suggestedDuration || 30,
                    type: validateStopType(stop.type),
                }));

            // Sort by approximateKm
            parsed.stops.sort((a, b) => a.approximateKm - b.approximateKm);
        }

        // Ensure dontMiss is populated
        if (!parsed.dontMiss || !Array.isArray(parsed.dontMiss) || parsed.dontMiss.length === 0) {
            // Pick top 3 rated stops as "Don't Miss"
            parsed.dontMiss = [...(parsed.stops || [])]
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 3)
                .map((stop, i) => ({
                    ...stop,
                    id: `dont-miss-${i}`,
                    badges: ['must-visit' as StopBadge, ...(stop.badges || []).filter(b => b !== 'must-visit')],
                }));
        }

        // Cache
        aiCache.set(cacheKey, { data: parsed, timestamp: Date.now() });

        console.log(`[Sarathi AI] Generated ${parsed.stops?.length || 0} recommendations for ${source} → ${destination}`);
        return parsed;

    } catch (error) {
        console.error('[Sarathi AI] Error:', error);
        return generateIntelligentFallback(source, destination, distanceKm);
    }
}

function validateStopType(type: string): AIRecommendation['type'] {
    const validTypes = ['tourist', 'heritage', 'nature', 'adventure', 'cultural', 'viewpoint', 'food', 'restaurant'];
    if (validTypes.includes(type)) return type as AIRecommendation['type'];
    // Map old types to new
    if (type === 'fuel' || type === 'rest') return 'tourist';
    return 'tourist';
}

function validateBadges(badges: unknown): StopBadge[] {
    if (!Array.isArray(badges)) return [];
    const validBadges: StopBadge[] = ['must-visit', 'hidden-gem', 'instagram-worthy', 'family-friendly', 'off-the-beaten-path'];
    return badges.filter(b => validBadges.includes(b as StopBadge)) as StopBadge[];
}

/**
 * Intelligent fallback when AI is unavailable.
 * Uses curated data for popular Indian routes.
 */
function generateIntelligentFallback(
    source: string,
    destination: string,
    distanceKm: number
): AIRouteStopsResponse {
    const srcLower = source.toLowerCase();
    const destLower = destination.toLowerCase();

    // Popular route database — curated by product team
    const popularRoutes: Record<string, AIRecommendation[]> = {
        'bangalore-mysore': [
            {
                id: 'fb-1', name: 'Ramanagara', type: 'nature',
                description: 'The "Sholay" filming location with dramatic rocky outcrops. A paradise for rock climbing enthusiasts and Bollywood fans alike.',
                whyVisit: 'Stand where Bollywood history was made', famousFor: 'Sholay filming location & rock climbing',
                rating: 4.2, badges: ['instagram-worthy', 'family-friendly'], approximateKm: 50, detourKm: 2, suggestedDuration: 30, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-2', name: 'Channapatna Toy Town', type: 'cultural',
                description: 'UNESCO-recognized wooden toy-making tradition dating back to Tipu Sultan era. Watch artisans craft colorful lacquerware toys by hand.',
                whyVisit: 'Buy authentic handcrafted toys from centuries-old workshops', famousFor: 'Traditional wooden toys & lacquerware',
                rating: 4.0, badges: ['hidden-gem', 'family-friendly'], approximateKm: 65, detourKm: 1, suggestedDuration: 40, bestTimeToVisit: 'anytime',
            },
            {
                id: 'fb-3', name: 'Srirangapatna', type: 'heritage',
                description: 'The island fortress where Tipu Sultan made his last stand. Explore the summer palace, dungeons, and the sacred Ranganathaswamy Temple.',
                whyVisit: 'Walk through a fortress that changed Indian history', famousFor: 'Tipu Sultan Fort & Ranganathaswamy Temple',
                rating: 4.7, badges: ['must-visit', 'family-friendly'], approximateKm: 120, detourKm: 3, suggestedDuration: 60, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-4', name: 'Kamat Lokaruchi', type: 'food',
                description: 'Legendary highway restaurant serving authentic Karnataka thali for over 50 years. The filter coffee here is the stuff of road-trip legends.',
                whyVisit: 'The most famous pit stop on the Bangalore-Mysore highway', famousFor: 'Karnataka thali & filter coffee',
                rating: 4.3, badges: ['must-visit'], approximateKm: 80, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'anytime',
            },
            {
                id: 'fb-5', name: 'Brindavan Gardens', type: 'tourist',
                description: 'The iconic illuminated musical fountain gardens at KRS Dam. A mesmerizing spectacle of water, light, and music after sunset.',
                whyVisit: 'One of India\'s most famous garden experiences', famousFor: 'Musical fountain & illuminated gardens',
                rating: 4.5, badges: ['must-visit', 'instagram-worthy', 'family-friendly'], approximateKm: 140, detourKm: 5, suggestedDuration: 90, bestTimeToVisit: 'evening',
            },
        ],
        'bangalore-goa': [
            {
                id: 'fb-1', name: 'Chitradurga Fort', type: 'heritage',
                description: 'The impregnable "Stone Fortress" with 19 gateways and Onake Obavva\'s legendary battle site. Karnataka\'s most dramatic hilltop fort.',
                whyVisit: 'India\'s most visually dramatic stone fortress', famousFor: 'Stone fortress & Onake Obavva legend',
                rating: 4.6, badges: ['must-visit', 'instagram-worthy'], approximateKm: 200, detourKm: 5, suggestedDuration: 90, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-2', name: 'Hampi Ruins', type: 'heritage',
                description: 'UNESCO World Heritage Site - the spectacular ruins of the Vijayanagara Empire. Boulder-strewn landscape with ancient temples beyond imagination.',
                whyVisit: 'A UNESCO wonder that will leave you speechless', famousFor: 'Vijayanagara ruins & boulder landscape',
                rating: 5.0, badges: ['must-visit', 'instagram-worthy'], approximateKm: 350, detourKm: 30, suggestedDuration: 180, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-3', name: 'Jog Falls', type: 'nature',
                description: 'India\'s second-highest plunge waterfall, thundering 253 meters down. During monsoon, the mist can be seen from kilometers away.',
                whyVisit: 'Witness India\'s most powerful waterfall', famousFor: 'Second-highest plunge waterfall in India',
                rating: 4.8, badges: ['must-visit', 'instagram-worthy'], approximateKm: 380, detourKm: 25, suggestedDuration: 120, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-4', name: 'Dandeli Wildlife Sanctuary', type: 'adventure',
                description: 'White-water rafting in the Kali River and spotting hornbills in pristine Western Ghats forest. The adventure capital of Karnataka.',
                whyVisit: 'Rafting, jungle safari & birdwatching in one stop', famousFor: 'White-water rafting & hornbill spotting',
                rating: 4.5, badges: ['off-the-beaten-path', 'instagram-worthy'], approximateKm: 450, detourKm: 15, suggestedDuration: 120, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-5', name: 'Dudhsagar Falls', type: 'nature',
                description: 'The "Sea of Milk" - a breathtaking 310m waterfall straddling the Goa-Karnataka border. Accessible via an unforgettable jeep safari through the forest.',
                whyVisit: 'India\'s most photogenic waterfall', famousFor: '310m waterfall & jeep safari',
                rating: 4.9, badges: ['must-visit', 'instagram-worthy'], approximateKm: 530, detourKm: 20, suggestedDuration: 150, bestTimeToVisit: 'morning',
            },
        ],
    };

    // Try to find a matching route
    const routeKey = `${srcLower}-${destLower}`;
    const reverseKey = `${destLower}-${srcLower}`;
    let stops = popularRoutes[routeKey] || popularRoutes[reverseKey];

    if (!stops) {
        // Generate generic but engaging stops based on distance
        stops = generateGenericTouristStops(source, destination, distanceKm);
    }

    const needsNightHalt = distanceKm > 400;

    return {
        stops,
        nightHalt: needsNightHalt ? {
            city: 'Midpoint City',
            reason: 'Rest after a long drive for a fresh start tomorrow',
            approximateKm: Math.round(distanceKm * 0.45),
        } : undefined,
        dontMiss: [...stops]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3)
            .map((s, i) => ({ ...s, id: `dont-miss-${i}`, badges: ['must-visit' as StopBadge, ...(s.badges || []).filter(b => b !== 'must-visit')] })),
        fallback: true,
    };
}

function generateGenericTouristStops(source: string, destination: string, distanceKm: number): AIRecommendation[] {
    const stopCount = Math.min(8, Math.max(4, Math.floor(distanceKm / 80)));
    const stops: AIRecommendation[] = [];
    const types: AIRecommendation['type'][] = ['heritage', 'viewpoint', 'food', 'nature', 'cultural', 'tourist'];

    for (let i = 0; i < stopCount; i++) {
        const progress = (i + 1) / (stopCount + 1);
        const km = Math.round(distanceKm * progress);
        const type = types[i % types.length];

        stops.push({
            id: `gen-${i}`,
            name: `Scenic Stop ${i + 1}`,
            type,
            description: `A beautiful ${type} stop along the ${source} to ${destination} route. Worth a quick visit to stretch your legs and soak in the surroundings.`,
            whyVisit: `Experience the beauty of the ${source}-${destination} corridor`,
            famousFor: `Local ${type} attraction`,
            rating: 3.5 + Math.random(),
            badges: i === 0 ? ['must-visit'] : i === stopCount - 1 ? ['hidden-gem'] : [],
            approximateKm: km,
            detourKm: Math.round(Math.random() * 10 + 2),
            suggestedDuration: 30 + Math.round(Math.random() * 30),
            bestTimeToVisit: 'anytime',
        });
    }

    return stops;
}

/**
 * Get place information for a specific location
 */
export async function getPlaceInfo(placeName: string): Promise<string | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(OPENROUTER_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://savaari.com',
                'X-Title': 'Savaari - Sarathi AI',
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a concise travel expert. Provide a 2-3 sentence description of the given place.'
                    },
                    { role: 'user', content: `Tell me about ${placeName} in India as a travel destination.` }
                ],
                temperature: 0.5,
                max_tokens: 200,
            }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch {
        return null;
    }
}
