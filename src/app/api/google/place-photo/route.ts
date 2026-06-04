import { NextRequest, NextResponse } from 'next/server';

// Returns a real photo URL for a place name via Places API (New):
//   Text Search -> first place's first photo -> Photo media (skipHttpRedirect)
// The returned photoUri is a googleusercontent.com URL (no key), safe for <img>.

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const PHOTO_BASE = 'https://places.googleapis.com/v1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

export async function POST(req: NextRequest) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return NextResponse.json({ photoUrl: null });
    try {
        const { query } = (await req.json()) as { query?: string };
        if (!query || !query.trim()) return NextResponse.json({ photoUrl: null });

        const sres = await fetch(SEARCH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.photos',
            },
            body: JSON.stringify({ textQuery: query.trim(), maxResultCount: 1 }),
        });
        if (!sres.ok) return NextResponse.json({ photoUrl: null });
        const sdata = (await sres.json()) as AnyObj;
        const photoName: string | undefined = sdata.places?.[0]?.photos?.[0]?.name;
        if (!photoName) return NextResponse.json({ photoUrl: null });

        const pres = await fetch(
            `${PHOTO_BASE}/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true`,
            { headers: { 'X-Goog-Api-Key': apiKey } },
        );
        if (!pres.ok) return NextResponse.json({ photoUrl: null });
        const pdata = (await pres.json()) as AnyObj;
        return NextResponse.json({ photoUrl: pdata.photoUri || null });
    } catch {
        return NextResponse.json({ photoUrl: null });
    }
}
