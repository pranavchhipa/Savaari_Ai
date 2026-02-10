'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Location, Stop, RouteData, RouteOption, TripStats, AIRecommendation, AIRouteStopsResponse } from '@/types';
import { calculateTripStats } from '@/lib/calculateTripStats';
import { getCoordinateAtDistance, calculateArrivalTime, getMidpointForNightHalt } from '@/lib/routing';
// import { searchLocations } from '@/lib/geocoding'; // Removed in favor of client-side geocoding
import { isPointInBoundingBox, getRouteMetrics } from '@/lib/geoUtils';
import { loadGoogleMapsScript } from '@/lib/maps';

interface UseTripLogicProps {
    source: Location | null;
    destination: Location | null;
    tripType: 'one-way' | 'round-trip';
    baseFare: number;
    perKmRate: number;
    driverAllowancePerDay: number;
    pickupDate?: string;
    dropDate?: string;
    pickupTime?: string;
}

interface UseTripLogicReturn {
    routeData: RouteData | null;
    routeOptions: RouteOption[];
    selectedRouteId: string;
    selectRoute: (routeId: string) => void;
    stops: Stop[];
    selectedStops: Stop[];
    recommendations: AIRecommendation[];
    dontMiss: AIRecommendation[];
    tripStats: TripStats | null;
    isLoading: boolean;
    error: string | null;
    toggleStopSelection: (stopId: string) => void;
    addRecommendationAsStop: (rec: AIRecommendation) => void;
    addedRecommendationIds: Set<string>;
    nightHaltSuggestion: { location: { lat: number; lng: number }; suggestedCity: string } | null;
    scoutTip: string | null;
}

export function useTripLogic({
    source,
    destination,
    tripType,
    baseFare,
    perKmRate,
    driverAllowancePerDay,
    pickupDate,
    dropDate,
    pickupTime,
}: UseTripLogicProps): UseTripLogicReturn {
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string>('route-0');
    const [stops, setStops] = useState<Stop[]>([]);
    const [selectedStops, setSelectedStops] = useState<Stop[]>([]);
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [dontMiss, setDontMiss] = useState<AIRecommendation[]>([]);
    const [addedRecommendationIds, setAddedRecommendationIds] = useState<Set<string>>(new Set());
    const [tripStats, setTripStats] = useState<TripStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nightHaltSuggestion, setNightHaltSuggestion] = useState<{
        location: { lat: number; lng: number };
        suggestedCity: string;
    } | null>(null);
    const [scoutTip, setScoutTip] = useState<string | null>(null);

    // Initialize Google Maps Script
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (apiKey) {
            loadGoogleMapsScript(apiKey).catch(err => console.error('Failed to load Maps script:', err));
        }
    }, []);

    // Ref to keep current stops for callbacks
    const stopsRef = useRef<Stop[]>([]);
    stopsRef.current = stops;

    // Convert AI recommendations to Stop format with validated coordinates
    const convertAIStopsToStops = useCallback((
        aiStops: AIRecommendation[],
        routeCoordinates: { lat: number; lng: number }[],
        sourceLocation: Location,
        destLocation: Location,
        totalDistanceKm: number,
        leg: 'onward' | 'return' = 'onward'
    ): Stop[] => {
        const result: Stop[] = [];

        // Add start point only for onward
        if (leg === 'onward') {
            result.push({
                id: 'start',
                name: sourceLocation.name,
                type: 'start',
                location: sourceLocation,
                duration: 0,
                suggestedTime: calculateArrivalTime(0),
                description: 'Trip starting point',
                leg: 'onward'
            });
        }

        // Sort AI stops by distance
        const sortedAIStops = [...aiStops].sort((a, b) => a.approximateKm - b.approximateKm);

        // Add AI-generated stops
        sortedAIStops.forEach((aiStop, index) => {
            let coord;
            if (leg === 'return') {
                const returnProgress = Math.max(0, (totalDistanceKm - aiStop.approximateKm) / totalDistanceKm);
                const returnCoordIndex = Math.floor(returnProgress * (routeCoordinates.length - 1));
                coord = routeCoordinates[returnCoordIndex] || routeCoordinates[Math.floor(routeCoordinates.length / 2)];
            } else {
                coord = getCoordinateAtDistance(routeCoordinates, aiStop.approximateKm, totalDistanceKm);
            }

            result.push({
                id: `${leg}-stop-${index + 1}`,
                name: aiStop.name,
                type: aiStop.type as Stop['type'],
                location: {
                    name: aiStop.name,
                    displayName: `${aiStop.name} - ${aiStop.famousFor || aiStop.description}`,
                    lat: coord.lat,
                    lng: coord.lng,
                },
                duration: aiStop.suggestedDuration,
                suggestedTime: calculateArrivalTime(aiStop.approximateKm),
                description: aiStop.whyVisit || aiStop.description,
                isSelected: false,
                detourKm: aiStop.detourKm || 0,
                leg: leg,
                rating: aiStop.rating,
                badges: aiStop.badges,
                famousFor: aiStop.famousFor,
                bestTimeToVisit: aiStop.bestTimeToVisit,
            });
        });

        // Add end point only for onward
        if (leg === 'onward') {
            result.push({
                id: 'end',
                name: destLocation.name,
                type: 'end',
                location: destLocation,
                duration: 0,
                suggestedTime: calculateArrivalTime(totalDistanceKm),
                description: 'Trip destination',
                leg: 'onward'
            });
        }

        return result;
    }, []);

    // Fetch AI-generated stops
    const fetchAIStops = async (
        sourceName: string,
        destName: string,
        distanceKm: number
    ): Promise<AIRouteStopsResponse | null> => {
        try {
            const response = await fetch('/api/ai/generate-stops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: sourceName,
                    destination: destName,
                    distanceKm,
                }),
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch AI stops:', error);
            return null;
        }
    };

    // Search for a place using Google Places Client SDK (Text Search)
    const searchPlaceWithGoogle = async (
        query: string,
        biasLat: number,
        biasLng: number,
        radiusMeters: number = 50000
    ): Promise<Location[]> => {
        if (typeof window === 'undefined' || !window.google?.maps?.places) {
            console.warn('Google Maps API not loaded yet');
            return [];
        }

        return new Promise((resolve) => {
            const service = new window.google.maps.places.PlacesService(document.createElement('div'));
            const request = {
                query,
                location: new window.google.maps.LatLng(biasLat, biasLng),
                radius: radiusMeters,
            };

            service.textSearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    const mapped = results.map(p => ({
                        name: p.name || '',
                        displayName: p.formatted_address || p.name || '',
                        lat: p.geometry?.location?.lat() || 0,
                        lng: p.geometry?.location?.lng() || 0,
                    }));
                    resolve(mapped);
                } else {
                    resolve([]);
                }
            });
        });
    };

    // Fallback using Geocoding Service (Client SDK)
    const searchPlaceWithGeocoder = async (query: string): Promise<Location[]> => {
        if (typeof window === 'undefined' || !window.google?.maps) return [];
        const geocoder = new window.google.maps.Geocoder();
        return new Promise((resolve) => {
            geocoder.geocode({ address: query, componentRestrictions: { country: 'IN' } }, (results, status) => {
                if (status === 'OK' && results) {
                    resolve(results.map(r => ({
                        name: query,
                        displayName: r.formatted_address,
                        lat: r.geometry.location.lat(),
                        lng: r.geometry.location.lng()
                    })));
                } else {
                    resolve([]);
                }
            });
        });
    };

    // Validate and process AI stops against route using Google Places
    const processAndValidateStops = async (
        aiStops: AIRecommendation[],
        leg: 'onward' | 'return',
        legSource: Location,
        legDest: Location,
        routeCoordinates: RouteData['coordinates']
    ): Promise<AIRecommendation[]> => {
        const validatedStops: (AIRecommendation & { routeIndex: number })[] = [];

        // Calculate route midpoint for location bias
        const midLat = (legSource.lat + legDest.lat) / 2;
        const midLng = (legSource.lng + legDest.lng) / 2;

        for (const stop of aiStops) {
            try {
                // Try Google Places (Client SDK) first
                let locations = await searchPlaceWithGoogle(stop.name, midLat, midLng);

                // Fallback to Geocoding Service (Client SDK) if Google Places returns nothing
                if (locations.length === 0) {
                    locations = await searchPlaceWithGeocoder(stop.name);
                }

                let bestMatch: { location: Location; metrics: { minDistance: number; routeIndex: number } } | null = null;

                for (const loc of locations) {
                    if (isPointInBoundingBox(loc, legSource, legDest, 100)) {
                        const metrics = getRouteMetrics(loc, routeCoordinates);
                        if (metrics.minDistance <= 50) {
                            if (!bestMatch || metrics.minDistance < bestMatch.metrics.minDistance) {
                                bestMatch = { location: loc, metrics };
                            }
                        }
                    }
                }

                if (bestMatch) {
                    validatedStops.push({
                        ...stop,
                        routeIndex: bestMatch.metrics.routeIndex
                    });
                } else {
                    console.warn(`[Sarathi] Rejected stop: ${stop.name} - Not found near route`);
                }
            } catch (e) {
                console.warn(`[Sarathi] Geocoding failed for ${stop.name}`);
            }
        }

        // Sort by route index
        if (leg === 'onward') {
            validatedStops.sort((a, b) => a.routeIndex - b.routeIndex);
        } else {
            validatedStops.sort((a, b) => b.routeIndex - a.routeIndex);
        }

        return validatedStops;
    };

    // Fetch route and generate stops
    const fetchRouteAndStops = useCallback(async () => {
        if (!source || !destination) return;

        setIsLoading(true);
        setError(null);
        setScoutTip('🤖 Sarathi AI is finding the best attractions for your journey...');

        try {
            // Fetch route (now returns multiple route options)
            console.log("Fetching routes for:", source.name, "to", destination.name);
            const response = await fetch('/api/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ start: source, end: destination })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Route fetch failed');
            }

            const route = await response.json();
            if (!route) throw new Error('Could not fetch route. Please try again.');

            // Store route data and alternatives
            setRouteData(route);
            setRouteOptions(route.alternativeRoutes || [{
                id: 'route-0',
                label: 'Recommended Route',
                coordinates: route.coordinates,
                distanceKm: route.distanceKm,
                durationMinutes: route.durationMinutes,
                tollInfo: route.tollInfo,
                isRecommended: true,
                highlights: [],
                color: '#2563EB',
            }]);
            setSelectedRouteId(route.selectedRouteId || 'route-0');

            // Fetch AI recommendations for the route
            const distance = route.distanceKm;
            const onwardResponse = await fetchAIStops(source.name, destination.name, distance);

            // Store recommendations for the showcase component
            if (onwardResponse?.stops) {
                setRecommendations(onwardResponse.stops);
                setDontMiss(onwardResponse.dontMiss || []);
            }

            let finalStops: Stop[] = [];

            // Process onward stops
            if (onwardResponse?.stops && onwardResponse.stops.length > 0) {
                const validatedOnward = await processAndValidateStops(
                    onwardResponse.stops,
                    'onward',
                    source,
                    destination,
                    route.coordinates
                );

                if (validatedOnward.length > 0) {
                    const mappedOnward = convertAIStopsToStops(
                        validatedOnward,
                        route.coordinates,
                        source,
                        destination,
                        route.distanceKm,
                        'onward'
                    );
                    finalStops = [...finalStops, ...mappedOnward];
                } else {
                    // If validation removed all stops, use raw AI data (with approximate positions)
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
            } else {
                // Minimal start/end if AI completely fails
                finalStops.push({
                    id: 'start', name: source.name, type: 'start',
                    location: source, duration: 0,
                    suggestedTime: calculateArrivalTime(0),
                    description: 'Trip starting point', leg: 'onward'
                });
                finalStops.push({
                    id: 'end', name: destination.name, type: 'end',
                    location: destination, duration: 0,
                    suggestedTime: calculateArrivalTime(distance),
                    description: 'Trip destination', leg: 'onward'
                });
            }

            // Handle round trip
            if (tripType === 'round-trip') {
                const returnResponse = await fetchAIStops(destination.name, source.name, distance);

                if (returnResponse?.stops && returnResponse.stops.length > 0) {
                    const validatedReturn = await processAndValidateStops(
                        returnResponse.stops,
                        'return',
                        destination,
                        source,
                        route.coordinates
                    );

                    const stopsToMap = validatedReturn.length > 0 ? validatedReturn : returnResponse.stops;
                    const mappedReturn = convertAIStopsToStops(
                        stopsToMap,
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

            // Night halt
            if (onwardResponse?.nightHalt) {
                const midIndex = Math.floor(route.coordinates.length / 2);
                setNightHaltSuggestion({
                    location: route.coordinates[midIndex],
                    suggestedCity: onwardResponse.nightHalt.city,
                });
            } else {
                setNightHaltSuggestion(getMidpointForNightHalt(route.coordinates, route.distanceKm));
            }

            setStops(finalStops);
            setSelectedStops(finalStops.filter(s => s.type === 'start' || s.type === 'end'));

            // Initial trip stats
            const tollEstimate = route.tollInfo?.estimatedPrice || 0;
            const initialStats = calculateTripStats({
                totalDistanceKm: route.distanceKm,
                durationMinutes: route.durationMinutes,
                selectedStops: [],
                baseFare,
                perKmRate,
                driverAllowancePerDay,
                tripType,
                tollEstimate,
                routeLabel: route.alternativeRoutes?.[0]?.label,
            });
            setTripStats(initialStats);

            const recCount = onwardResponse?.stops?.length || 0;
            setScoutTip(`✨ Sarathi found ${recCount} amazing attractions along your route! Add stops to customize your journey.`);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [source, destination, baseFare, perKmRate, driverAllowancePerDay, tripType, convertAIStopsToStops]);

    // Select a different route
    const selectRoute = useCallback((routeId: string) => {
        const selectedRoute = routeOptions.find(r => r.id === routeId);
        if (!selectedRoute || !source || !destination) return;

        setSelectedRouteId(routeId);

        // Update route data with selected route's coordinates
        setRouteData(prev => prev ? {
            ...prev,
            coordinates: selectedRoute.coordinates,
            distanceKm: selectedRoute.distanceKm,
            durationMinutes: selectedRoute.durationMinutes,
            tollInfo: selectedRoute.tollInfo,
            selectedRouteId: routeId,
        } : null);

        // Recalculate stats for selected route
        const tollEstimate = selectedRoute.tollInfo?.estimatedPrice || 0;
        const currentSelectedStops = selectedStops.filter(s => s.type !== 'start' && s.type !== 'end');
        const totalDetour = currentSelectedStops.reduce((acc, stop) => acc + (stop.detourKm || 0), 0);

        const stats = calculateTripStats({
            totalDistanceKm: selectedRoute.distanceKm + totalDetour,
            durationMinutes: selectedRoute.durationMinutes + (totalDetour * 1.5),
            selectedStops: currentSelectedStops,
            baseFare,
            perKmRate,
            driverAllowancePerDay,
            tripType,
            tollEstimate,
            routeLabel: selectedRoute.label,
        });
        setTripStats(stats);

        setScoutTip(`🛣️ Switched to ${selectedRoute.label} — ${Math.round(selectedRoute.distanceKm)} km, ${Math.round(selectedRoute.durationMinutes / 60)}h drive`);
    }, [routeOptions, source, destination, selectedStops, baseFare, perKmRate, driverAllowancePerDay, tripType]);

    // Toggle stop selection
    const toggleStopSelection = useCallback((stopId: string) => {
        const currentStop = stopsRef.current.find((s) => s.id === stopId);
        if (!currentStop) return;
        if (currentStop.type === 'start' || currentStop.type === 'end') return;

        setStops((prevStops) =>
            prevStops.map((stop) =>
                stop.id === stopId ? { ...stop, isSelected: !stop.isSelected } : stop
            )
        );

        setSelectedStops((prevSelected) => {
            const isCurrentlySelected = prevSelected.some((s) => s.id === stopId);

            if (isCurrentlySelected) {
                return prevSelected.filter((s) => s.id !== stopId);
            } else {
                const newSelected = [...prevSelected, { ...currentStop, isSelected: true }];
                return newSelected.sort((a, b) => {
                    if (a.type === 'start') return -1;
                    if (b.type === 'start') return 1;
                    if (a.type === 'end') return 1;
                    if (b.type === 'end') return -1;
                    const aIndex = stopsRef.current.findIndex((s) => s.id === a.id);
                    const bIndex = stopsRef.current.findIndex((s) => s.id === b.id);
                    return aIndex - bIndex;
                });
            }
        });
    }, []);

    // Add AI recommendation as a stop
    const addRecommendationAsStop = useCallback((rec: AIRecommendation) => {
        if (!routeData || !source || !destination) return;

        const recId = rec.id || rec.name;

        // Toggle off if already added
        if (addedRecommendationIds.has(recId)) {
            const stopId = `rec-${recId}`;
            setStops(prev => prev.filter(s => s.id !== stopId));
            setSelectedStops(prev => prev.filter(s => s.id !== stopId));
            setAddedRecommendationIds(prev => {
                const next = new Set(prev);
                next.delete(recId);
                return next;
            });
            return;
        }

        // Add to stops
        const coord = getCoordinateAtDistance(
            routeData.coordinates,
            rec.approximateKm,
            routeData.distanceKm
        );

        const newStop: Stop = {
            id: `rec-${recId}`,
            name: rec.name,
            type: rec.type as Stop['type'],
            location: {
                name: rec.name,
                displayName: `${rec.name} - ${rec.famousFor || rec.description}`,
                lat: coord.lat,
                lng: coord.lng,
            },
            duration: rec.suggestedDuration,
            suggestedTime: calculateArrivalTime(rec.approximateKm),
            description: rec.whyVisit || rec.description,
            isSelected: true,
            detourKm: rec.detourKm || 0,
            leg: 'onward',
            rating: rec.rating,
            badges: rec.badges,
            famousFor: rec.famousFor,
            bestTimeToVisit: rec.bestTimeToVisit,
        };

        // Insert in order (by approximateKm)
        setStops(prev => {
            const newStops = [...prev];
            // Find insert position (after start, before end, ordered by approxKm)
            let insertIndex = newStops.findIndex(s => s.type === 'end');
            if (insertIndex === -1) insertIndex = newStops.length;

            // Find right position based on coordinate position
            for (let i = 1; i < insertIndex; i++) {
                const existingCoord = newStops[i].location;
                const existingProgress = routeData.coordinates.findIndex(
                    c => Math.abs(c.lat - existingCoord.lat) < 0.01 && Math.abs(c.lng - existingCoord.lng) < 0.01
                );
                const newProgress = routeData.coordinates.findIndex(
                    c => Math.abs(c.lat - coord.lat) < 0.01 && Math.abs(c.lng - coord.lng) < 0.01
                );
                if (newProgress < existingProgress) {
                    insertIndex = i;
                    break;
                }
            }

            newStops.splice(insertIndex, 0, newStop);
            return newStops;
        });

        setSelectedStops(prev => {
            const newSelected = [...prev, newStop];
            return newSelected.sort((a, b) => {
                if (a.type === 'start') return -1;
                if (b.type === 'start') return 1;
                if (a.type === 'end') return 1;
                if (b.type === 'end') return -1;
                return 0;
            });
        });

        setAddedRecommendationIds(prev => new Set([...prev, recId]));
    }, [routeData, source, destination]);

    // Recalculate trip stats when selected stops change
    useEffect(() => {
        if (!routeData) return;

        const activeStops = selectedStops.filter(s => s.type !== 'start' && s.type !== 'end');
        const totalDetour = activeStops.reduce((acc, stop) => acc + (stop.detourKm || 5), 0);
        const tollEstimate = routeData.tollInfo?.estimatedPrice || 0;

        const stats = calculateTripStats({
            totalDistanceKm: routeData.distanceKm + totalDetour,
            durationMinutes: routeData.durationMinutes + (totalDetour * 1.5),
            selectedStops: activeStops,
            baseFare,
            perKmRate,
            driverAllowancePerDay,
            tripType,
            tollEstimate,
            routeLabel: routeOptions.find(r => r.id === selectedRouteId)?.label,
        });

        setTripStats(stats);
        generateScoutTip(selectedStops, stats);
    }, [selectedStops, routeData, baseFare, perKmRate, driverAllowancePerDay, tripType, routeOptions, selectedRouteId]);

    // Generate AI scout tip based on selections
    const generateScoutTip = (stopsArr: Stop[], stats: TripStats) => {
        const heritageCount = stopsArr.filter(s => s.type === 'heritage').length;
        const natureCount = stopsArr.filter(s => s.type === 'nature' || s.type === 'viewpoint').length;
        const foodCount = stopsArr.filter(s => s.type === 'food' || s.type === 'restaurant').length;
        const adventureCount = stopsArr.filter(s => s.type === 'adventure').length;
        const activeStops = stopsArr.filter(s => s.type !== 'start' && s.type !== 'end').length;

        if (activeStops === 0) {
            setScoutTip("✨ Add stops from Sarathi's recommendations to make your trip unforgettable!");
        } else if (heritageCount >= 2) {
            setScoutTip("🏛️ Incredible heritage trail! These historical gems will make your journey legendary.");
        } else if (stats.totalDriveTimeHours > 14) {
            setScoutTip(`🌙 Long journey (${Math.round(stats.totalDriveTimeHours)}hrs). A night halt at ${nightHaltSuggestion?.suggestedCity || 'midpoint'} is recommended.`);
        } else if (natureCount >= 2) {
            setScoutTip("🌿 Nature lover's dream! Visit viewpoints during golden hour (6-7 AM or 5-6 PM).");
        } else if (foodCount >= 2) {
            setScoutTip("🍛 Foodie's paradise! These legendary stops are worth every detour.");
        } else if (adventureCount >= 1) {
            setScoutTip("🏔️ Adventure awaits! Make sure to carry comfortable shoes and water.");
        } else if (stats.totalDays > 1) {
            setScoutTip(`📅 ${stats.totalDays}-day adventure with ${activeStops} stops. Driver allowance included.`);
        } else {
            setScoutTip(`✨ ${activeStops} attraction${activeStops > 1 ? 's' : ''} added! Each stop makes your trip more memorable.`);
        }
    };

    // Fetch route when source/destination changes
    useEffect(() => {
        fetchRouteAndStops();
    }, [fetchRouteAndStops]);

    return {
        routeData,
        routeOptions,
        selectedRouteId,
        selectRoute,
        stops,
        selectedStops,
        recommendations,
        dontMiss,
        tripStats,
        isLoading,
        error,
        toggleStopSelection,
        addRecommendationAsStop,
        addedRecommendationIds,
        nightHaltSuggestion,
        scoutTip,
    };
}
