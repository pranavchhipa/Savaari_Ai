'use server';

import { AIRouteStopsResponse, AIRecommendation, StopBadge } from '@/types';
import { getHotRouteData } from './hotRoutes';

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

    // 1. Check hot routes FIRST — instant, no AI credits
    const hotRouteStops = getHotRouteData(source, destination);
    if (hotRouteStops) {
        console.log(`[Sarathi AI] Hot route match: ${source} → ${destination} (${hotRouteStops.length} stops, no AI call)`);
        const hotResult: AIRouteStopsResponse = {
            stops: hotRouteStops,
            dontMiss: [...hotRouteStops]
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 3)
                .map((s, i) => ({ ...s, id: `dont-miss-${i}`, badges: ['must-visit' as StopBadge, ...(s.badges || []).filter(b => b !== 'must-visit')] })),
            nightHalt: distanceKm > 400 ? { city: 'Midpoint City', reason: 'Rest for a fresh start', approximateKm: Math.round(distanceKm * 0.45) } : undefined,
        };
        aiCache.set(cacheKey, { data: hotResult, timestamp: Date.now() });
        return hotResult;
    }

    // 2. Check if AI API key is available
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.warn('[Sarathi AI] No API key configured, using intelligent fallback');
        return generateIntelligentFallback(source, destination, distanceKm);
    }

    const needsNightHalt = distanceKm > 400;

    const prompt = `You are Sarathi, Savaari's expert AI travel advisor for Indian road trips.

Route: "${source}" → "${destination}" (~${Math.round(distanceKm)} km by road)

Generate 6-8 of the MOST FAMOUS tourist attractions that are ACTUALLY LOCATED ON or VERY NEAR (<20km detour) this specific driving route.

BE SPECIFIC — use the actual highway/road this route follows. For example:
- If the route passes through Agra → include Taj Mahal
- If it passes through Jaipur → include Hawa Mahal, Amber Fort
- If it passes near Lonavala → include it ONLY if the route actually goes via Mumbai-Pune Expressway
- If it passes through Mahabaleshwar → include Mapro Garden, Arthur's Seat

RULES (STRICTLY FOLLOW):
✅ ONLY include: Famous temples, forts, monuments, UNESCO sites, waterfalls, national parks, iconic viewpoints, famous beaches, historic landmarks
✅ Each place must be a REAL, NAMED, FAMOUS tourist attraction that any Indian would recognize
✅ Places MUST physically lie on or within 20km of the actual driving route between these two cities
✅ Sort by distance from source (approximateKm should be accurate road distance from source)

❌ DO NOT include: Hotels, resorts, petrol pumps, rest stops, generic restaurants, dhabas, highway food courts, malls, hospitals, gas stations, parking lots
❌ DO NOT include places that are famous but NOT on this specific route
❌ DO NOT make up fictional places — every name must be Google-searchable

Respond in this EXACT JSON format (no markdown, only valid JSON):
{
    "stops": [
        {
            "name": "Exact Famous Place Name",
            "type": "heritage|tourist|nature|adventure|cultural|viewpoint",
            "description": "2-sentence vivid description",
            "whyVisit": "One compelling reason",
            "famousFor": "What makes it iconic",
            "rating": 4.5,
            "badges": ["must-visit"],
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
            "description": "The top reason to take this route",
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
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are Sarathi, an expert Indian travel planner who knows every road and famous landmark in India. Respond ONLY with valid JSON, no markdown formatting. Only recommend REAL, FAMOUS tourist attractions that are geographically ON the driving route.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.4,
                max_tokens: 2000,
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
            // Filter out non-tourist stops (hotels, petrol pumps, etc.)
            const blockedKeywords = ['hotel', 'resort', 'petrol', 'pump', 'gas station', 'dhaba', 'restaurant', 'food court', 'mall', 'hospital', 'rest stop', 'parking'];
            parsed.stops = parsed.stops
                .filter(stop => {
                    if (!stop.name || !stop.type || stop.approximateKm < 0) return false;
                    const nameLower = stop.name.toLowerCase();
                    return !blockedKeywords.some(kw => nameLower.includes(kw));
                })
                .map((stop, index) => ({
                    ...stop,
                    id: `ai-stop-${index}`,
                    rating: Math.min(5, Math.max(1, stop.rating || 4)),
                    badges: validateBadges(stop.badges),
                    detourKm: Math.min(20, stop.detourKm || 5),
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

    // Popular route database — curated with REAL famous tourist attractions
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
                id: 'fb-3', name: 'Srirangapatna Fort', type: 'heritage',
                description: 'The island fortress where Tipu Sultan made his last stand. Explore the summer palace, dungeons, and the sacred Ranganathaswamy Temple.',
                whyVisit: 'Walk through a fortress that changed Indian history', famousFor: 'Tipu Sultan Fort & Ranganathaswamy Temple',
                rating: 4.7, badges: ['must-visit', 'family-friendly'], approximateKm: 120, detourKm: 3, suggestedDuration: 60, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-4', name: 'Brindavan Gardens', type: 'tourist',
                description: 'The iconic illuminated musical fountain gardens at KRS Dam. A mesmerizing spectacle of water, light, and music after sunset.',
                whyVisit: 'One of India\'s most famous garden experiences', famousFor: 'Musical fountain & illuminated gardens',
                rating: 4.5, badges: ['must-visit', 'instagram-worthy', 'family-friendly'], approximateKm: 140, detourKm: 5, suggestedDuration: 90, bestTimeToVisit: 'evening',
            },
            {
                id: 'fb-5', name: 'Mysore Palace', type: 'heritage',
                description: 'One of India\'s most magnificent royal palaces. The illuminated palace at night with 97,000 bulbs is an unforgettable sight.',
                whyVisit: 'India\'s most visited palace after the Taj Mahal', famousFor: 'Indo-Saracenic architecture & illumination',
                rating: 4.9, badges: ['must-visit', 'instagram-worthy'], approximateKm: 150, detourKm: 0, suggestedDuration: 90, bestTimeToVisit: 'morning',
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
                id: 'fb-2', name: 'Jog Falls', type: 'nature',
                description: 'India\'s second-highest plunge waterfall, thundering 253 meters down. During monsoon, the mist can be seen from kilometers away.',
                whyVisit: 'Witness India\'s most powerful waterfall', famousFor: 'Second-highest plunge waterfall in India',
                rating: 4.8, badges: ['must-visit', 'instagram-worthy'], approximateKm: 380, detourKm: 25, suggestedDuration: 120, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-3', name: 'Dandeli Wildlife Sanctuary', type: 'adventure',
                description: 'White-water rafting in the Kali River and spotting hornbills in pristine Western Ghats forest. The adventure capital of Karnataka.',
                whyVisit: 'Rafting, jungle safari & birdwatching in one stop', famousFor: 'White-water rafting & hornbill spotting',
                rating: 4.5, badges: ['off-the-beaten-path', 'instagram-worthy'], approximateKm: 450, detourKm: 15, suggestedDuration: 120, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-4', name: 'Dudhsagar Falls', type: 'nature',
                description: 'The "Sea of Milk" - a breathtaking 310m waterfall straddling the Goa-Karnataka border. Accessible via an unforgettable jeep safari.',
                whyVisit: 'India\'s most photogenic waterfall', famousFor: '310m waterfall & jeep safari',
                rating: 4.9, badges: ['must-visit', 'instagram-worthy'], approximateKm: 530, detourKm: 20, suggestedDuration: 150, bestTimeToVisit: 'morning',
            },
        ],
        'mumbai-goa': [
            {
                id: 'fb-1', name: 'Imagica Theme Park', type: 'tourist',
                description: 'India\'s leading international-standard theme park with thrilling rides and immersive experiences. A must-stop for families on the Mumbai-Goa highway.',
                whyVisit: 'India\'s best theme park experience', famousFor: 'Roller coasters & entertainment',
                rating: 4.3, badges: ['family-friendly'], approximateKm: 90, detourKm: 3, suggestedDuration: 120, bestTimeToVisit: 'anytime',
            },
            {
                id: 'fb-2', name: 'Pratapgad Fort', type: 'heritage',
                description: 'The mountain fortress where Shivaji Maharaj defeated Afzal Khan. Offers panoramic views of the Sahyadri ranges and Western Ghats.',
                whyVisit: 'Walk the battleground of Maratha history', famousFor: 'Shivaji\'s victory over Afzal Khan',
                rating: 4.6, badges: ['must-visit', 'instagram-worthy'], approximateKm: 200, detourKm: 15, suggestedDuration: 90, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-3', name: 'Ratnagiri', type: 'heritage',
                description: 'The coastal gem known for the finest Alphonso mangoes and the Thibaw Palace where the last King of Burma was exiled. Stunning sea forts dot the coastline.',
                whyVisit: 'Taste the world\'s best mangoes at their source', famousFor: 'Alphonso mangoes & Thibaw Palace',
                rating: 4.4, badges: ['hidden-gem'], approximateKm: 320, detourKm: 10, suggestedDuration: 60, bestTimeToVisit: 'anytime',
            },
            {
                id: 'fb-4', name: 'Sindhudurg Fort', type: 'heritage',
                description: 'Shivaji Maharaj\'s masterpiece sea fort built on a rocky island. The engineering marvel stands surrounded by Arabian Sea waters.',
                whyVisit: 'A spectacular sea fortress built by Shivaji himself', famousFor: 'Island sea fort & Maratha naval power',
                rating: 4.7, badges: ['must-visit', 'instagram-worthy'], approximateKm: 400, detourKm: 12, suggestedDuration: 90, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-5', name: 'Tarkarli Beach', type: 'nature',
                description: 'Crystal-clear waters perfect for snorkeling and scuba diving. One of India\'s most pristine and underrated beach destinations.',
                whyVisit: 'India\'s clearest waters for snorkeling', famousFor: 'Scuba diving & crystal-clear sea',
                rating: 4.5, badges: ['hidden-gem', 'instagram-worthy'], approximateKm: 420, detourKm: 15, suggestedDuration: 120, bestTimeToVisit: 'morning',
            },
        ],
        'delhi-agra': [
            {
                id: 'fb-1', name: 'ISKCON Temple Vrindavan', type: 'heritage',
                description: 'The magnificent Krishna temple complex in the holy city of Vrindavan. One of the most beautiful modern temples in India.',
                whyVisit: 'A spiritual masterpiece in Lord Krishna\'s birthplace', famousFor: 'Krishna worship & architectural beauty',
                rating: 4.6, badges: ['must-visit', 'family-friendly'], approximateKm: 130, detourKm: 10, suggestedDuration: 60, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-2', name: 'Mathura Birthplace Temple', type: 'heritage',
                description: 'The sacred birthplace of Lord Krishna, one of Hinduism\'s holiest sites. The temple complex buzzes with devotional energy and ancient history.',
                whyVisit: 'Stand at the exact spot where Lord Krishna was born', famousFor: 'Krishna Janmabhoomi',
                rating: 4.8, badges: ['must-visit'], approximateKm: 145, detourKm: 5, suggestedDuration: 60, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-3', name: 'Taj Mahal', type: 'heritage',
                description: 'The crown jewel of India — a UNESCO World Heritage Site and one of the Seven Wonders of the World. Shah Jahan\'s eternal monument to love.',
                whyVisit: 'The most iconic monument on Earth', famousFor: 'Symbol of eternal love & Mughal architecture',
                rating: 5.0, badges: ['must-visit', 'instagram-worthy'], approximateKm: 200, detourKm: 0, suggestedDuration: 120, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-4', name: 'Agra Fort', type: 'heritage',
                description: 'The massive red sandstone fortress of the Mughal emperors. Shah Jahan spent his last days here, gazing at the Taj Mahal he built.',
                whyVisit: 'Where Shah Jahan was imprisoned with a view of the Taj', famousFor: 'Mughal imperial fortress',
                rating: 4.7, badges: ['must-visit', 'instagram-worthy'], approximateKm: 202, detourKm: 0, suggestedDuration: 90, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-5', name: 'Fatehpur Sikri', type: 'heritage',
                description: 'Akbar\'s magnificent abandoned capital city — a UNESCO World Heritage Site. The Buland Darwaza is the tallest gateway in the world.',
                whyVisit: 'A perfectly preserved ghost city of the Mughal Empire', famousFor: 'Buland Darwaza & Panch Mahal',
                rating: 4.6, badges: ['must-visit', 'instagram-worthy'], approximateKm: 235, detourKm: 2, suggestedDuration: 90, bestTimeToVisit: 'morning',
            },
        ],
        'delhi-jaipur': [
            {
                id: 'fb-1', name: 'Neemrana Fort Palace', type: 'heritage',
                description: 'A 15th-century hilltop fort converted into a stunning heritage hotel. The zip-lining across the fort walls offers breathtaking views.',
                whyVisit: 'Zip-line across a 600-year-old fortress', famousFor: 'Heritage fort & zip-lining',
                rating: 4.5, badges: ['instagram-worthy', 'must-visit'], approximateKm: 120, detourKm: 2, suggestedDuration: 60, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-2', name: 'Amber Fort', type: 'heritage',
                description: 'The majestic hilltop fortress overlooking Maota Lake. The Sheesh Mahal (Mirror Palace) inside creates a magical starlit effect.',
                whyVisit: 'Rajasthan\'s most stunning hilltop fortress', famousFor: 'Sheesh Mahal & elephant rides',
                rating: 4.9, badges: ['must-visit', 'instagram-worthy'], approximateKm: 260, detourKm: 5, suggestedDuration: 120, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-3', name: 'Hawa Mahal', type: 'heritage',
                description: 'The iconic "Palace of Winds" with 953 small windows. Jaipur\'s most recognizable landmark, glowing pink at sunrise.',
                whyVisit: 'India\'s most photographed palace facade', famousFor: '953 windows & pink sandstone architecture',
                rating: 4.8, badges: ['must-visit', 'instagram-worthy'], approximateKm: 270, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-4', name: 'City Palace Jaipur', type: 'heritage',
                description: 'The royal residence of the Jaipur Maharaja, blending Rajasthani and Mughal architecture. Home to the world\'s largest silver vessels.',
                whyVisit: 'See how Indian royalty lived', famousFor: 'Royal architecture & world\'s largest silver vessels',
                rating: 4.7, badges: ['must-visit', 'family-friendly'], approximateKm: 272, detourKm: 0, suggestedDuration: 90, bestTimeToVisit: 'morning',
            },
            {
                id: 'fb-5', name: 'Jantar Mantar Jaipur', type: 'heritage',
                description: 'UNESCO World Heritage astronomical observatory built by Maharaja Jai Singh II. Houses the world\'s largest stone sundial.',
                whyVisit: 'Ancient astronomical genius in stone', famousFor: 'World\'s largest stone sundial & UNESCO site',
                rating: 4.4, badges: ['must-visit'], approximateKm: 273, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'anytime',
            },
        ],
    };

    // Try to find a matching route (normalize city names)
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
    const srcNorm = normalize(source);
    const destNorm = normalize(destination);
    const routeKey = `${srcNorm}-${destNorm}`;
    const reverseKey = `${destNorm}-${srcNorm}`;

    // Also try partial matches (e.g. "new delhi" matches "delhi")
    let stops = popularRoutes[routeKey] || popularRoutes[reverseKey];
    if (!stops) {
        for (const key of Object.keys(popularRoutes)) {
            const [k1, k2] = key.split('-');
            if ((srcNorm.includes(k1) || k1.includes(srcNorm)) && (destNorm.includes(k2) || k2.includes(destNorm))) {
                stops = popularRoutes[key];
                break;
            }
            if ((srcNorm.includes(k2) || k2.includes(srcNorm)) && (destNorm.includes(k1) || k1.includes(destNorm))) {
                stops = popularRoutes[key];
                break;
            }
        }
    }

    if (!stops) {
        // No fallback data — return empty so the UI shows "no recommendations"
        // instead of fake placeholder stops
        return {
            stops: [],
            dontMiss: [],
            fallback: true,
        };
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
