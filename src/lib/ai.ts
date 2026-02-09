/**
 * Sarathi AI - OpenRouter Integration
 * 
 * Uses GPT-4o-mini for fast, high-quality responses
 * Cost: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Using GPT-4o for maximum reliability and reasoning (User requested 'Best')
const AI_MODEL = 'openai/gpt-4o';

interface PlaceInfo {
    description: string;
    whyStopHere: string;
    recommendedTime: string;
    photoSpots: string[];
    bestTimeToVisit?: string;
    localTips?: string;
}

interface AIResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

// Cache for place info to reduce API calls
const placeInfoCache = new Map<string, { data: PlaceInfo; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function getPlaceInfo(
    placeName: string,
    placeType: string,
    nearCity?: string
): Promise<PlaceInfo | null> {
    const cacheKey = `${placeName}-${placeType}-${nearCity || ''}`;

    // Check cache first
    const cached = placeInfoCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('OpenRouter API key not configured');
        return getDefaultPlaceInfo(placeName, placeType);
    }

    const prompt = `You are a travel expert for India. Provide a brief, engaging description for a traveler stopping at "${placeName}" ${nearCity ? `near ${nearCity}` : ''}.

Place type: ${placeType}

Respond in this exact JSON format (no markdown, just JSON):
{
    "description": "2-3 sentence engaging description of the place",
    "whyStopHere": "One compelling reason to stop (max 15 words)",
    "recommendedTime": "Suggested stop duration (e.g., '45-60 minutes')",
    "photoSpots": ["spot1", "spot2"],
    "bestTimeToVisit": "Best time of day (e.g., 'Sunrise' or 'Evening')",
    "localTips": "One local insider tip"
}`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://savaari.com',
                'X-Title': 'Sarathi AI Travel Planner',
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful travel assistant specializing in Indian tourism. Provide concise, engaging descriptions that make travelers excited to visit places. Always respond in valid JSON format.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: 300,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', response.status, errorText);
            return getDefaultPlaceInfo(placeName, placeType);
        }

        const data: AIResponse = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return getDefaultPlaceInfo(placeName, placeType);
        }

        // Parse JSON response
        const placeInfo = JSON.parse(content) as PlaceInfo;

        // Cache the result
        placeInfoCache.set(cacheKey, { data: placeInfo, timestamp: Date.now() });

        return placeInfo;
    } catch (error) {
        console.error('Error fetching place info:', error);
        return getDefaultPlaceInfo(placeName, placeType);
    }
}

// Fallback descriptions based on place type
function getDefaultPlaceInfo(placeName: string, placeType: string): PlaceInfo {
    const defaults: Record<string, PlaceInfo> = {
        heritage: {
            description: `${placeName} is a historic landmark worth exploring. Rich in culture and architecture, it offers a glimpse into India's fascinating past.`,
            whyStopHere: 'Perfect for history enthusiasts and photographers',
            recommendedTime: '60-90 minutes',
            photoSpots: ['Main entrance', 'Courtyard', 'Scenic viewpoint'],
            bestTimeToVisit: 'Morning or late afternoon',
            localTips: 'Hire a local guide for hidden stories',
        },
        viewpoint: {
            description: `${placeName} offers breathtaking panoramic views that make for unforgettable memories. A perfect spot to stretch your legs and capture stunning photos.`,
            whyStopHere: 'Spectacular views and photo opportunities',
            recommendedTime: '20-30 minutes',
            photoSpots: ['Main viewpoint', 'Sunrise point'],
            bestTimeToVisit: 'Sunrise or sunset',
            localTips: 'Arrive 30 minutes before sunset for best lighting',
        },
        restaurant: {
            description: `${placeName} is a popular dining spot known for authentic local cuisine. A great place to refuel and experience regional flavors.`,
            whyStopHere: 'Taste authentic local delicacies',
            recommendedTime: '45-60 minutes',
            photoSpots: ['Food presentation'],
            bestTimeToVisit: 'Lunch or dinner time',
            localTips: 'Try the local specialty dish',
        },
        food: {
            description: `${placeName} is a beloved food stop along this route. Famous for its fresh preparations and quick service, it's a favorite among travelers.`,
            whyStopHere: 'Famous highway food stop loved by travelers',
            recommendedTime: '30-45 minutes',
            photoSpots: ['Kitchen area', 'Food spread'],
            localTips: 'Order the house special',
        },
        fuel: {
            description: `${placeName} is a well-maintained fuel station with clean restrooms and refreshment options. Ideal for a quick break.`,
            whyStopHere: 'Clean facilities and quick refueling',
            recommendedTime: '15-20 minutes',
            photoSpots: [],
            localTips: 'Check tire pressure while here',
        },
        rest: {
            description: `${placeName} offers a comfortable break point with refreshments and restroom facilities. Perfect for stretching after a long drive.`,
            whyStopHere: 'Comfortable rest with good amenities',
            recommendedTime: '20-30 minutes',
            photoSpots: ['Surrounding area'],
            localTips: 'Take a short walk to refresh',
        },
    };

    return defaults[placeType] || {
        description: `${placeName} is a recommended stop along your route. Consider adding it to your itinerary for a more enriching journey.`,
        whyStopHere: 'A worthwhile addition to your trip',
        recommendedTime: '30 minutes',
        photoSpots: ['Scenic spots'],
    };
}

// Generate trip theme suggestions
export async function getTripThemes(
    source: string,
    destination: string,
    stops: string[]
): Promise<string[]> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return ['Scenic Route', 'Heritage Trail', 'Foodie Journey'];

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://savaari.com',
                'X-Title': 'Sarathi AI Travel Planner',
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: `Suggest 3 trip themes for a journey from ${source} to ${destination} passing through: ${stops.join(', ')}. 
                        
Return only a JSON array of theme names, e.g., ["Heritage Trail", "Food Explorer", "Nature Escape"]`,
                    },
                ],
                max_tokens: 100,
                temperature: 0.8,
            }),
        });

        if (!response.ok) return ['Scenic Route', 'Heritage Trail', 'Foodie Journey'];

        const data: AIResponse = await response.json();
        const content = data.choices[0]?.message?.content;

        return content ? JSON.parse(content) : ['Scenic Route', 'Heritage Trail', 'Foodie Journey'];
    } catch {
        return ['Scenic Route', 'Heritage Trail', 'Foodie Journey'];
    }
}

// Generate "Don't Miss" recommendation
export async function getDontMissRecommendation(
    source: string,
    destination: string,
    currentStops: string[]
): Promise<{ place: string; reason: string } | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://savaari.com',
                'X-Title': 'Sarathi AI Travel Planner',
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: `For a trip from ${source} to ${destination}, already stopping at: ${currentStops.join(', ')}.

Suggest ONE must-visit place they might be missing. Return JSON:
{"place": "Place Name", "reason": "15-word compelling reason to add it"}`,
                    },
                ],
                max_tokens: 100,
                temperature: 0.9,
            }),
        });

        if (!response.ok) return null;

        const data: AIResponse = await response.json();
        const content = data.choices[0]?.message?.content;

        return content ? JSON.parse(content) : null;
    } catch {
        return null;
    }
}

// Interface for AI-generated stops
export interface AIGeneratedStop {
    name: string;
    type: 'heritage' | 'viewpoint' | 'restaurant' | 'food' | 'fuel' | 'rest';
    description: string;
    whyVisit: string;
    approximateKm: number;
    suggestedDuration: number;
    famousFor?: string;
    detourKm?: number;
}

export interface AIRouteStopsResponse {
    stops: AIGeneratedStop[];
    nightHalt?: {
        city: string;
        reason: string;
        approximateKm: number;
    };
}

// Cache for route stops
const routeStopsCache = new Map<string, { data: AIRouteStopsResponse; timestamp: number }>();

/**
 * Generate real, famous places along a route using AI
 */
export async function generateRouteStops(
    source: string,
    destination: string,
    distanceKm: number
): Promise<AIRouteStopsResponse | null> {
    const cacheKey = `route-${source.toLowerCase()}-${destination.toLowerCase()}`;

    // Check cache first
    const cached = routeStopsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('OpenRouter API key not configured');
        return null;
    }

    const needsNightHalt = distanceKm > 400;

    const prompt = `You are an expert Indian travel planner and geographer. For a road trip from "${source}" to "${destination}" (approximately ${Math.round(distanceKm)} km):

    Generate 10-12 REAL, HIGH-QUALITY stops that travelers would actually want to visit along this specific route.
    
    STRICT RULES:
    1. Stops must be BETWEEN "${source}" and "${destination}" in the direction of travel.
    2. Stops must be within 50km radius of the main highway route.
    3. Do NOT suggest stops that require significant backtracking.
    4. Focus on: 
       - Famous Highway Dhabas/Food Courts (Real names only)
       - Scenic Viewpoints & Nature Spots
       - Historic Temples & Heritage Sites
       - Clean Rest Stops for families
    
    ${needsNightHalt ? `Since this is a long journey (${Math.round(distanceKm)} km), also identify the BEST city for a night halt roughly midway.` : ''}
    
    Respond in this exact JSON format (no markdown, just valid JSON):
    {
        "stops": [
            {
                "name": "Exact Name",
                "type": "heritage|viewpoint|restaurant|food|fuel|rest",
                "description": "Engaging description",
                "whyVisit": "Compelling reason",
                "approximateKm": 150,
                "detourKm": 5,
                "suggestedDuration": 60,
                "famousFor": "Famous feature"
            }
        ]${needsNightHalt ? `,
        "nightHalt": {
            "city": "City Name",
            "reason": "Why this is a good stop",
            "approximateKm": ${Math.round(distanceKm / 2)}
        }` : ''}
    }`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://savaari.com',
                'X-Title': 'Sarathi AI Travel Planner',
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert Indian travel and road trip planner. You have extensive knowledge of highways, tourist spots, famous dhabas, and attractions across India. Always suggest REAL places that exist. Respond only in valid JSON format.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: 800,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', response.status, errorText);
            return null;
        }

        const data: AIResponse = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return null;
        }

        // Clean the response - remove markdown code blocks if present
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.slice(7);
        }
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.slice(3);
        }
        if (cleanContent.endsWith('```')) {
            cleanContent = cleanContent.slice(0, -3);
        }
        cleanContent = cleanContent.trim();

        // Parse JSON response
        const routeStops = JSON.parse(cleanContent) as AIRouteStopsResponse;

        // Cache the result
        routeStopsCache.set(cacheKey, { data: routeStops, timestamp: Date.now() });

        return routeStops;
    } catch (error) {
        console.error('Error generating route stops:', error);
        return null;
    }
}
