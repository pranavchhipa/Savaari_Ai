import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy for Places API (New). Keeps the key server-side and
// avoids the legacy client SDK (which is blocked for new keys).
//   POST { input }    -> { suggestions: [{ placeId, main, secondary }] }
//   POST { placeId }  -> { place: { name, displayName, lat, lng } }

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const DETAILS_URL = 'https://places.googleapis.com/v1/places';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

export async function POST(req: NextRequest) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY not set', suggestions: [] }, { status: 200 });
    }

    try {
        const body = (await req.json()) as { input?: string; placeId?: string };

        // ---- Place details (resolve coordinates for a selected suggestion) ----
        if (body.placeId) {
            const res = await fetch(`${DETAILS_URL}/${encodeURIComponent(body.placeId)}`, {
                headers: {
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
                },
            });
            if (!res.ok) {
                return NextResponse.json({ error: 'details_failed', status: res.status }, { status: 200 });
            }
            const d = (await res.json()) as AnyObj;
            return NextResponse.json({
                place: {
                    name: d.displayName?.text || '',
                    displayName: d.formattedAddress || d.displayName?.text || '',
                    lat: d.location?.latitude,
                    lng: d.location?.longitude,
                },
            });
        }

        // ---- Autocomplete suggestions ----
        const input = (body.input || '').trim();
        if (input.length < 2) return NextResponse.json({ suggestions: [] });

        const res = await fetch(AUTOCOMPLETE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },
            body: JSON.stringify({ input, includedRegionCodes: ['in'] }),
        });
        if (!res.ok) {
            return NextResponse.json({ suggestions: [], status: res.status }, { status: 200 });
        }
        const data = (await res.json()) as AnyObj;
        const suggestions = (data.suggestions || [])
            .map((s: AnyObj) => s.placePrediction)
            .filter(Boolean)
            .map((p: AnyObj) => ({
                placeId: p.placeId,
                main: p.structuredFormat?.mainText?.text || p.text?.text || '',
                secondary: p.structuredFormat?.secondaryText?.text || '',
            }))
            .filter((s: AnyObj) => s.placeId && s.main)
            .slice(0, 6);

        return NextResponse.json({ suggestions });
    } catch (e) {
        return NextResponse.json({ suggestions: [], error: String(e) }, { status: 200 });
    }
}
