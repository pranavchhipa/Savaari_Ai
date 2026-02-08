'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Location, Stop, RouteData, TripStats } from '@/types';
import { getRoute, generateStopsAlongRoute, getMidpointForNightHalt } from '@/lib/routing';
import { calculateTripStats } from '@/lib/calculateTripStats';

interface UseTripLogicProps {
    source: Location | null;
    destination: Location | null;
    tripType: 'one-way' | 'round-trip';
    baseFare: number;
    perKmRate: number;
    driverAllowancePerDay: number;
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
        totalDistanceKm: number
    ): Stop[] => {
        const result: Stop[] = [];

        // Add start point
        result.push({
            id: 'start',
            name: sourceLocation.name,
            type: 'start',
            location: sourceLocation,
            duration: 0,
            suggestedTime: '06:00 AM',
            description: 'Trip starting point',
        });

        // Sort AI stops by distance
        const sortedAIStops = [...aiStops].sort((a, b) => a.approximateKm - b.approximateKm);

        // Add AI-generated stops
        sortedAIStops.forEach((aiStop, index) => {
            // Calculate approximate position on route
            const progress = Math.min(aiStop.approximateKm / totalDistanceKm, 0.95);
            const coordIndex = Math.floor(progress * (routeCoordinates.length - 1));
            const coord = routeCoordinates[coordIndex] || routeCoordinates[Math.floor(routeCoordinates.length / 2)];

            // Calculate arrival time
            const startHour = 6;
            const travelTime = aiStop.approximateKm / 40; // 40 km/h average
            const arrivalHour = startHour + travelTime;
            const hour = Math.floor(arrivalHour) % 24;
            const minutes = Math.floor((arrivalHour % 1) * 60);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

            result.push({
                id: `stop-${index + 1}`,
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
            });
        });

        // Add end point
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
        });

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

            // Try to get AI-generated stops
            const aiResponse = await fetchAIStops(
                source.name,
                destination.name,
                route.distanceKm
            );

            let generatedStops: Stop[];

            if (aiResponse && aiResponse.stops && aiResponse.stops.length > 0 && !aiResponse.fallback) {
                // Use AI-generated stops
                generatedStops = convertAIStopsToStops(
                    aiResponse.stops,
                    route.coordinates,
                    source,
                    destination,
                    route.distanceKm
                );

                // Set night halt from AI if available
                if (aiResponse.nightHalt) {
                    const midIndex = Math.floor(route.coordinates.length / 2);
                    setNightHaltSuggestion({
                        location: route.coordinates[midIndex],
                        suggestedCity: aiResponse.nightHalt.city,
                    });
                } else {
                    const nightHalt = getMidpointForNightHalt(route.coordinates, route.distanceKm);
                    setNightHaltSuggestion(nightHalt);
                }

                setScoutTip(`✨ Sarathi AI found ${aiResponse.stops.length} amazing stops for your ${source.name} to ${destination.name} trip!`);
            } else {
                // Fallback to hardcoded stops
                generatedStops = generateStopsAlongRoute(
                    route.coordinates,
                    source,
                    destination,
                    route.distanceKm
                );

                const nightHalt = getMidpointForNightHalt(route.coordinates, route.distanceKm);
                setNightHaltSuggestion(nightHalt);
            }

            setStops(generatedStops);

            // Auto-select start and end
            const initialSelectedStops = generatedStops.filter(
                (s) => s.type === 'start' || s.type === 'end'
            );
            setSelectedStops(initialSelectedStops);

            // Calculate initial trip stats
            const stats = calculateTripStats({
                totalDistanceKm: route.distanceKm,
                durationMinutes: route.durationMinutes,
                selectedStops: initialSelectedStops,
                baseFare,
                perKmRate,
                driverAllowancePerDay,
                tripType,
            });
            setTripStats(stats);
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

        const stats = calculateTripStats({
            totalDistanceKm: routeData.distanceKm,
            durationMinutes: routeData.durationMinutes,
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
