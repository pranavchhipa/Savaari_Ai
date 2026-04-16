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

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const run = async () => {
            if (apiKey) {
                await loadGoogleMapsScript(apiKey).catch(() => {});
            }

            for (let i = 0; i < needsPhoto.length; i += CONCURRENCY) {
                if (abortRef.current) break;

                const batch = needsPhoto.slice(i, i + CONCURRENCY);
                const results = await Promise.allSettled(
                    batch.map((s) => fetchPhoto(s.name)),
                );

                const newEntries: Array<[string, string]> = [];
                for (let j = 0; j < results.length; j++) {
                    const r = results[j];
                    if (r.status === 'fulfilled' && r.value) {
                        newEntries.push([r.value.name, r.value.url]);
                        fetchedRef.current.add(r.value.name);
                    } else {
                        if (batch[j]) fetchedRef.current.add(batch[j].name);
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

        const handle = setTimeout(run, 500);
        return () => {
            clearTimeout(handle);
            abortRef.current = true;
        };
    }, [stops, fetchPhoto]);

    return { photoMap, isLoading };
}
