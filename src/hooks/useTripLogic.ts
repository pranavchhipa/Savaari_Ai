'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Location, Stop, RouteData, TripStats } from '@/types';
import { getRoute, generateStopsAlongRoute, getMidpointForNightHalt } from '@/lib/routing';
import { calculateTripStats } from '@/lib/calculateTripStats';
import { searchLocations } from '@/lib/geocoding';
import { isPointInBoundingBox, getMinDistanceToRoute, getRouteMetrics } from '@/lib/geoUtils';

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
    stops: Stop[];
    selectedStops: Stop[];
    tripStats: TripStats | null;
    isLoading: boolean;
    error: string | null;
    toggleStopSelection: (stopId: string) => void;
    nightHaltSuggestion: { location: { lat: number; lng: number }; suggestedCity: string } | null;
    scoutTip: string | null;
}

interface AIGeneratedStop {
    name: string;
    type: 'heritage' | 'viewpoint' | 'restaurant' | 'food' | 'fuel' | 'rest';
    description: string;
    whyVisit: string;
    approximateKm: number;
    suggestedDuration: number;
    famousFor?: string;
    detourKm?: number;
}

interface AIRouteStopsResponse {
    stops: AIGeneratedStop[];
    nightHalt?: {
        city: string;
        reason: string;
        approximateKm: number;
    };
    fallback?: boolean;
    error?: string;
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
    const [stops, setStops] = useState<Stop[]>([]);
    const [selectedStops, setSelectedStops] = useState<Stop[]>([]);
    const [tripStats, setTripStats] = useState<TripStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nightHaltSuggestion, setNightHaltSuggestion] = useState<{
        location: { lat: number; lng: number };
        suggestedCity: string;
    } | null>(null);
    const [scoutTip, setScoutTip] = useState<string | null>(null);

    // Ref to keep current stops for callbacks
    const stopsRef = useRef<Stop[]>([]);
    stopsRef.current = stops;

    // Convert AI stops to our Stop format
    const convertAIStopsToStops = (
        aiStops: AIGeneratedStop[],
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
                suggestedTime: '06:00 AM',
                description: 'Trip starting point',
                leg: 'onward'
            });
        }

        // Sort AI stops by distance
        const sortedAIStops = [...aiStops].sort((a, b) => a.approximateKm - b.approximateKm);

        // Add AI-generated stops
        sortedAIStops.forEach((aiStop, index) => {
            // Calculate approximate position on route
            // For return leg, we might need to reverse logic if using same route coords, 
            // but for now simple approximation is fine.
            const progress = Math.min(aiStop.approximateKm / totalDistanceKm, 0.95);
            const coordIndex = Math.floor(progress * (routeCoordinates.length - 1));
            // If return leg, coordinate logic might need inversion closer to end? 
            // Actually, AI returns "distance from Source". 
            // For Return leg (Dest -> Source), "Source" is Destination. 
            // So distance is from Destination.

            let coord;
            if (leg === 'return') {
                // If fetching stops from Dest -> Source, approximateKm is from Dest.
                // So on the original route (Source -> Dest), this is (Total - approx)
                const returnProgress = Math.max(0, (totalDistanceKm - aiStop.approximateKm) / totalDistanceKm);
                const returnCoordIndex = Math.floor(returnProgress * (routeCoordinates.length - 1));
                coord = routeCoordinates[returnCoordIndex] || routeCoordinates[Math.floor(routeCoordinates.length / 2)];
            } else {
                coord = routeCoordinates[coordIndex] || routeCoordinates[Math.floor(routeCoordinates.length / 2)];
            }

            // Calculate arrival time
            const startHour = 6;
            const travelTime = aiStop.approximateKm / 40; // 40 km/h average
            const arrivalHour = startHour + travelTime;
            const hour = Math.floor(arrivalHour) % 24;
            const minutes = Math.floor((arrivalHour % 1) * 60);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

            result.push({
                id: `${leg}-stop-${index + 1}`,
                name: aiStop.name,
                type: aiStop.type,
                location: {
                    name: aiStop.name,
                    displayName: `${aiStop.name} - ${aiStop.famousFor || aiStop.description}`,
                    lat: coord.lat,
                    lng: coord.lng,
                },
                duration: aiStop.suggestedDuration,
                suggestedTime: `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`,
                description: aiStop.whyVisit,
                isSelected: false,
                detourKm: aiStop.detourKm || 0,
                leg: leg
            });
        });

        // Add end point only for onward
        if (leg === 'onward') {
            const endTime = 6 + (totalDistanceKm / 40);
            const endHour = Math.floor(endTime) % 24;
            const endMinutes = Math.floor((endTime % 1) * 60);
            const endPeriod = endHour >= 12 ? 'PM' : 'AM';
            const endDisplayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;

            result.push({
                id: 'end',
                name: destLocation.name,
                type: 'end',
                location: destLocation,
                duration: 0,
                suggestedTime: `${String(endDisplayHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`,
                description: 'Trip destination',
                leg: 'onward'
            });
        }

        return result;
    };

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

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch AI stops:', error);
            return null;
        }
    };

    // Fetch route and generate stops
    const fetchRouteAndStops = useCallback(async () => {
        if (!source || !destination) return;

        setIsLoading(true);
        setError(null);
        setScoutTip('🤖 Sarathi AI is finding the best stops for your journey...');

        try {
            const route = await getRoute(source, destination);

            if (!route) {
                throw new Error('Could not fetch route. Please try again.');
            }

            setRouteData(route);

            // Fetch Onward Stops
            const startName = source.name;
            const destName = destination.name;
            const distance = route.distanceKm;

            const onwardPromise = fetchAIStops(startName, destName, distance);

            // Only fetch return stops if Round Trip
            let returnPromise: Promise<AIRouteStopsResponse | null> = Promise.resolve(null);
            if (tripType === 'round-trip') {
                returnPromise = fetchAIStops(destName, startName, distance);
            }

            const [onwardResponse, returnResponse] = await Promise.all([onwardPromise, returnPromise]);

            let finalStops: Stop[] = [];

            // Helper to process and validate stops
            const processStops = async (
                aiStops: AIGeneratedStop[],
                leg: 'onward' | 'return',
                legSource: Location,
                legDest: Location,
                routeCoordinates: RouteData['coordinates']
            ): Promise<AIGeneratedStop[]> => {
                const validatedStops: (AIGeneratedStop & { routeIndex: number })[] = [];

                for (const stop of aiStops) {
                    try {
                        const locations = await searchLocations(stop.name);

                        // Find the best matching location that is on the route
                        let bestMatch: { location: Location; metrics: { minDistance: number; routeIndex: number } } | null = null;

                        for (const loc of locations) {
                            // First check if roughly in bounding box (100km buffer)
                            if (isPointInBoundingBox(loc, legSource, legDest, 100)) {
                                // Get precise route metrics
                                const metrics = getRouteMetrics(loc, routeCoordinates);

                                // Strict 50km limit from route
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

                // SORT BY ROUTE INDEX
                // This ensures they appear exactly in the order they are encountered on the road
                if (leg === 'onward') {
                    validatedStops.sort((a, b) => a.routeIndex - b.routeIndex);
                } else {
                    // For return leg (Dest -> Source), we travel from Index MAX to Index 0.
                    // So stops should be ordered Descending by Route Index.
                    validatedStops.sort((a, b) => b.routeIndex - a.routeIndex);
                }

                return validatedStops;
            };

            let onwardStopsProcessed: AIGeneratedStop[] = [];
            if (onwardResponse && onwardResponse.stops) {
                onwardStopsProcessed = await processStops(
                    onwardResponse.stops,
                    'onward',
                    source,
                    destination,
                    route.coordinates
                );
            }

            if (onwardStopsProcessed.length > 0) {
                const mappedOnward = convertAIStopsToStops(
                    onwardStopsProcessed,
                    route.coordinates,
                    source,
                    destination,
                    route.distanceKm,
                    'onward'
                );
                finalStops = [...finalStops, ...mappedOnward];
            } else {
                const fallback = generateStopsAlongRoute(route.coordinates, source, destination, route.distanceKm);
                finalStops = [...finalStops, ...fallback];
            }

            // For Return Journey - logic to handle Round Trip correctly
            if (tripType === 'round-trip') {
                let returnStopsProcessed: AIGeneratedStop[] = [];

                // If we got a specific return response, use it
                if (returnResponse && returnResponse.stops) {
                    returnStopsProcessed = await processStops(
                        returnResponse.stops,
                        'return',
                        destination,
                        source,
                        route.coordinates // Using SAME coordinates (Source->Dest)
                    );
                } else if (onwardStopsProcessed.length > 0) {
                    // Fallback: Use onward stops but reversed, maybe filtered?
                    // For now, let's just reverse the onward stops so they make sense
                    returnStopsProcessed = [...onwardStopsProcessed].reverse();
                }

                if (returnStopsProcessed.length > 0) {
                    const mappedReturn = convertAIStopsToStops(
                        returnStopsProcessed,
                        route.coordinates,
                        destination,
                        source,
                        route.distanceKm,
                        'return'
                    );

                    const uniqueReturn = mappedReturn.map(s => ({
                        ...s,
                        id: `return-${s.id}`
                    }));
                    finalStops = [...finalStops, ...uniqueReturn];
                }
            }



            // Set Night Halt
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
            // Default select nothing or just start/end
            setSelectedStops(finalStops.filter(s => s.type === 'start' || s.type === 'end'));

            // Calculate initial trip stats
            const initialStats = calculateTripStats({
                totalDistanceKm: route.distanceKm,
                durationMinutes: route.durationMinutes,
                selectedStops: [],
                baseFare,
                perKmRate,
                driverAllowancePerDay,
                tripType,
            });
            setTripStats(initialStats);

            setScoutTip(`✨ Sarathi AI planned your ${tripType === 'round-trip' ? 'Round Trip' : 'Journey'} with ${finalStops.length} stops!`);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [source, destination, baseFare, perKmRate, driverAllowancePerDay, tripType]);

    // Toggle stop selection
    const toggleStopSelection = useCallback((stopId: string) => {
        // Get current stop from ref (always fresh)
        const currentStop = stopsRef.current.find((s) => s.id === stopId);
        if (!currentStop) return;

        // Don't allow toggling start/end
        if (currentStop.type === 'start' || currentStop.type === 'end') return;

        // Update stops array
        setStops((prevStops) =>
            prevStops.map((stop) =>
                stop.id === stopId ? { ...stop, isSelected: !stop.isSelected } : stop
            )
        );

        // Update selectedStops
        setSelectedStops((prevSelected) => {
            const isCurrentlySelected = prevSelected.some((s) => s.id === stopId);

            if (isCurrentlySelected) {
                // Remove from selected
                return prevSelected.filter((s) => s.id !== stopId);
            } else {
                // Add to selected and sort by original order
                const newSelected = [...prevSelected, { ...currentStop, isSelected: true }];

                // Sort by id pattern (start first, end last, stops by number)
                return newSelected.sort((a, b) => {
                    if (a.type === 'start') return -1;
                    if (b.type === 'start') return 1;
                    if (a.type === 'end') return 1;
                    if (b.type === 'end') return -1;
                    // Sort by stop index
                    const aIndex = stopsRef.current.findIndex((s) => s.id === a.id);
                    const bIndex = stopsRef.current.findIndex((s) => s.id === b.id);
                    return aIndex - bIndex;
                });
            }
        });
    }, []);

    // Recalculate trip stats when selected stops change
    useEffect(() => {
        if (!routeData) return;

        const totalDetour = selectedStops.reduce((acc, stop) => {
            if (stop.type === 'start' || stop.type === 'end') return acc;
            return acc + (stop.detourKm || 20); // Default to 20km if detourKm not available
        }, 0);

        const stats = calculateTripStats({
            totalDistanceKm: (routeData.distanceKm + totalDetour),
            durationMinutes: routeData.durationMinutes + (totalDetour * 1.5), // Approx 1.5 min per km
            selectedStops,
            baseFare,
            perKmRate,
            driverAllowancePerDay,
            tripType,
        });

        console.log('[Sarathi] Recalculating stats:', {
            stopsCount: selectedStops.filter(s => s.type !== 'start' && s.type !== 'end').length,
            totalFare: stats.totalFare,
            totalDays: stats.totalDays,
            driverAllowance: stats.driverAllowance,
        });

        setTripStats(stats);

        // Generate Scout tip based on selections
        generateScoutTip(selectedStops, stats);
    }, [selectedStops, routeData, baseFare, perKmRate, driverAllowancePerDay, tripType]);

    // Generate AI scout tip
    const generateScoutTip = (stopsArr: Stop[], stats: TripStats) => {
        const heritageCount = stopsArr.filter((s) => s.type === 'heritage').length;
        const viewpointCount = stopsArr.filter((s) => s.type === 'viewpoint').length;
        const foodCount = stopsArr.filter((s) => s.type === 'restaurant' || s.type === 'food').length;

        if (heritageCount >= 2) {
            setScoutTip("🏛️ Great heritage trail! These historical sites will make your journey memorable.");
        } else if (stats.totalDriveTimeHours > 14) {
            setScoutTip(`🌙 Long journey ahead (${Math.round(stats.totalDriveTimeHours)}hrs). A night halt at ${nightHaltSuggestion?.suggestedCity || 'midpoint'} is recommended.`);
        } else if (viewpointCount >= 2) {
            setScoutTip("📸 Scenic route ahead! Visit viewpoints during golden hour (6-7 AM or 5-6 PM).");
        } else if (foodCount >= 2) {
            setScoutTip("🍽️ Foodie's paradise! These are famous stops loved by travelers.");
        } else if (stats.totalDays > 1) {
            setScoutTip(`📅 ${stats.totalDays}-day adventure planned. Driver allowance of ₹${driverAllowancePerDay}/day included.`);
        } else {
            setScoutTip("✨ Sarathi AI recommends these stops for the best experience!");
        }
    };

    // Fetch route when source/destination changes
    useEffect(() => {
        fetchRouteAndStops();
    }, [fetchRouteAndStops]);

    return {
        routeData,
        stops,
        selectedStops,
        tripStats,
        isLoading,
        error,
        toggleStopSelection,
        nightHaltSuggestion,
        scoutTip,
    };
}
