import { Location, NominatimResult } from '@/types';

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

// Extended list of popular Indian cities for smart autocomplete
export const popularCities: Location[] = [
    // Tier 1 cities
    { name: 'Mumbai', displayName: 'Mumbai, Maharashtra, India', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', displayName: 'New Delhi, Delhi, India', lat: 28.6139, lng: 77.2090 },
    { name: 'Bangalore', displayName: 'Bangalore, Karnataka, India', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai', displayName: 'Chennai, Tamil Nadu, India', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata', displayName: 'Kolkata, West Bengal, India', lat: 22.5726, lng: 88.3639 },
    { name: 'Hyderabad', displayName: 'Hyderabad, Telangana, India', lat: 17.3850, lng: 78.4867 },

    // Tier 2 cities
    { name: 'Pune', displayName: 'Pune, Maharashtra, India', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', displayName: 'Ahmedabad, Gujarat, India', lat: 23.0225, lng: 72.5714 },
    { name: 'Jaipur', displayName: 'Jaipur, Rajasthan, India', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', displayName: 'Lucknow, Uttar Pradesh, India', lat: 26.8467, lng: 80.9462 },
    { name: 'Chandigarh', displayName: 'Chandigarh, India', lat: 30.7333, lng: 76.7794 },
    { name: 'Surat', displayName: 'Surat, Gujarat, India', lat: 21.1702, lng: 72.8311 },
    { name: 'Kochi', displayName: 'Kochi, Kerala, India', lat: 9.9312, lng: 76.2673 },
    { name: 'Indore', displayName: 'Indore, Madhya Pradesh, India', lat: 22.7196, lng: 75.8577 },
    { name: 'Nagpur', displayName: 'Nagpur, Maharashtra, India', lat: 21.1458, lng: 79.0882 },
    { name: 'Coimbatore', displayName: 'Coimbatore, Tamil Nadu, India', lat: 11.0168, lng: 76.9558 },

    // Popular tourist destinations
    { name: 'Goa', displayName: 'Goa, India', lat: 15.2993, lng: 74.1240 },
    { name: 'Panaji', displayName: 'Panaji, Goa, India', lat: 15.4909, lng: 73.8278 },
    { name: 'Agra', displayName: 'Agra, Uttar Pradesh, India', lat: 27.1767, lng: 78.0081 },
    { name: 'Mysore', displayName: 'Mysore, Karnataka, India', lat: 12.2958, lng: 76.6394 },
    { name: 'Udaipur', displayName: 'Udaipur, Rajasthan, India', lat: 24.5854, lng: 73.7125 },
    { name: 'Jodhpur', displayName: 'Jodhpur, Rajasthan, India', lat: 26.2389, lng: 73.0243 },
    { name: 'Jaisalmer', displayName: 'Jaisalmer, Rajasthan, India', lat: 26.9157, lng: 70.9083 },
    { name: 'Varanasi', displayName: 'Varanasi, Uttar Pradesh, India', lat: 25.3176, lng: 82.9739 },
    { name: 'Rishikesh', displayName: 'Rishikesh, Uttarakhand, India', lat: 30.0869, lng: 78.2676 },
    { name: 'Manali', displayName: 'Manali, Himachal Pradesh, India', lat: 32.2432, lng: 77.1892 },
    { name: 'Shimla', displayName: 'Shimla, Himachal Pradesh, India', lat: 31.1048, lng: 77.1734 },
    { name: 'Darjeeling', displayName: 'Darjeeling, West Bengal, India', lat: 27.0410, lng: 88.2663 },
    { name: 'Ooty', displayName: 'Ooty, Tamil Nadu, India', lat: 11.4102, lng: 76.6950 },
    { name: 'Kodaikanal', displayName: 'Kodaikanal, Tamil Nadu, India', lat: 10.2381, lng: 77.4892 },
    { name: 'Munnar', displayName: 'Munnar, Kerala, India', lat: 10.0889, lng: 77.0595 },
    { name: 'Alleppey', displayName: 'Alleppey, Kerala, India', lat: 9.4981, lng: 76.3388 },
    { name: 'Pondicherry', displayName: 'Pondicherry, India', lat: 11.9416, lng: 79.8083 },
    { name: 'Amritsar', displayName: 'Amritsar, Punjab, India', lat: 31.6340, lng: 74.8723 },
    { name: 'Lonavala', displayName: 'Lonavala, Maharashtra, India', lat: 18.7546, lng: 73.4062 },
    { name: 'Mahabaleshwar', displayName: 'Mahabaleshwar, Maharashtra, India', lat: 17.9307, lng: 73.6477 },
    { name: 'Shirdi', displayName: 'Shirdi, Maharashtra, India', lat: 19.7669, lng: 74.4778 },
    { name: 'Tirupati', displayName: 'Tirupati, Andhra Pradesh, India', lat: 13.6288, lng: 79.4192 },
    { name: 'Madurai', displayName: 'Madurai, Tamil Nadu, India', lat: 9.9252, lng: 78.1198 },
    { name: 'Hampi', displayName: 'Hampi, Karnataka, India', lat: 15.3350, lng: 76.4600 },
    { name: 'Ranthambore', displayName: 'Ranthambore, Rajasthan, India', lat: 26.0173, lng: 76.5026 },
    { name: 'Jim Corbett', displayName: 'Jim Corbett National Park, Uttarakhand, India', lat: 29.5300, lng: 78.7747 },

    // Major airports/hubs
    { name: 'Gurgaon', displayName: 'Gurgaon, Haryana, India', lat: 28.4595, lng: 77.0266 },
    { name: 'Noida', displayName: 'Noida, Uttar Pradesh, India', lat: 28.5355, lng: 77.3910 },
    { name: 'Navi Mumbai', displayName: 'Navi Mumbai, Maharashtra, India', lat: 19.0330, lng: 73.0297 },
    { name: 'Thane', displayName: 'Thane, Maharashtra, India', lat: 19.2183, lng: 72.9781 },

    // South India
    { name: 'Trivandrum', displayName: 'Thiruvananthapuram, Kerala, India', lat: 8.5241, lng: 76.9366 },
    { name: 'Thiruvananthapuram', displayName: 'Thiruvananthapuram, Kerala, India', lat: 8.5241, lng: 76.9366 },
    { name: 'Mangalore', displayName: 'Mangalore, Karnataka, India', lat: 12.9141, lng: 74.8560 },
    { name: 'Vizag', displayName: 'Visakhapatnam, Andhra Pradesh, India', lat: 17.6868, lng: 83.2185 },
    { name: 'Visakhapatnam', displayName: 'Visakhapatnam, Andhra Pradesh, India', lat: 17.6868, lng: 83.2185 },
];

// Smart search function that prioritizes popular cities
export async function searchLocations(query: string): Promise<Location[]> {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const results: Location[] = [];
    const seenNames = new Set<string>();

    // First, check popular cities (instant results, no API call)
    const matchingPopularCities = popularCities.filter(city => {
        const cityNameLower = city.name.toLowerCase();
        const displayNameLower = city.displayName.toLowerCase();

        // Match by name start or contains
        return cityNameLower.startsWith(normalizedQuery) ||
            displayNameLower.includes(normalizedQuery) ||
            // Fuzzy matching for common typos
            levenshteinDistance(cityNameLower, normalizedQuery) <= 2;
    });

    // Sort popular cities by relevance (exact start match first)
    matchingPopularCities.sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
        const bStartsWith = b.name.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
        return aStartsWith - bStartsWith;
    });

    // Add popular cities first (up to 3)
    for (const city of matchingPopularCities.slice(0, 3)) {
        const key = `${city.name.toLowerCase()}-${Math.round(city.lat * 100)}-${Math.round(city.lng * 100)}`;
        if (!seenNames.has(key)) {
            seenNames.add(key);
            results.push(city);
        }
    }

    // Only call Nominatim if we need more results
    if (results.length < 5 && query.length >= 3) {
        try {
            const response = await fetch(
                `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=8&addressdetails=1&featuretype=city`,
                {
                    headers: {
                        'User-Agent': 'SavaariScout/1.0',
                    },
                }
            );

            if (response.ok) {
                const nominatimResults: NominatimResult[] = await response.json();

                for (const result of nominatimResults) {
                    if (results.length >= 5) break;

                    const name = result.name || result.display_name.split(',')[0];
                    const lat = parseFloat(result.lat);
                    const lng = parseFloat(result.lon);
                    const key = `${name.toLowerCase()}-${Math.round(lat * 100)}-${Math.round(lng * 100)}`;

                    // Skip duplicates
                    if (seenNames.has(key)) continue;

                    // Skip very similar names already in results
                    const isDuplicate = results.some(r =>
                        r.name.toLowerCase() === name.toLowerCase() ||
                        (Math.abs(r.lat - lat) < 0.01 && Math.abs(r.lng - lng) < 0.01)
                    );
                    if (isDuplicate) continue;

                    seenNames.add(key);
                    results.push({
                        name,
                        displayName: formatDisplayName(result.display_name),
                        lat,
                        lng,
                    });
                }
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
    }

    return results;
}

// Format display name to be more readable
function formatDisplayName(displayName: string): string {
    const parts = displayName.split(',').map(p => p.trim());

    // Take first 3-4 meaningful parts
    const meaningfulParts = parts.filter(p =>
        p.length > 0 &&
        !p.match(/^\d+$/) &&  // Skip pure numbers
        !p.match(/^[A-Z]{2,3}\s\d+$/)  // Skip postal codes like "MH 400001"
    ).slice(0, 4);

    return meaningfulParts.join(', ');
}

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    if (m === 0) return n;
    if (n === 0) return m;

    // Quick check for short strings
    if (Math.abs(m - n) > 3) return Math.max(m, n);

    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
}

export async function reverseGeocode(lat: number, lng: number): Promise<Location | null> {
    try {
        const response = await fetch(
            `${NOMINATIM_API}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'SavaariScout/1.0',
                },
            }
        );

        if (!response.ok) throw new Error('Reverse geocoding failed');

        const result: NominatimResult = await response.json();

        return {
            name: result.name || result.address?.city || 'Unknown',
            displayName: formatDisplayName(result.display_name),
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}
