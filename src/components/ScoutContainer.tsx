'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Location, Car, Stop, JourneySegment, TripStats } from '@/types';
import { useTripLogic } from '@/hooks/useTripLogic';
import Timeline from './Timeline';
import ScoutTip from './ScoutTip';
import JourneyHeader from './JourneyHeader';
import JourneyDayCard from './JourneyDayCard';
import DestinationChanger from './DestinationChanger';
import { formatCurrency, formatDuration, formatDistance } from '@/lib/calculateTripStats';
import { MapPin, Clock, Calendar, IndianRupee, Loader2, Route, ChevronDown, ChevronUp } from 'lucide-react';

// Dynamic import for LeafletMap (SSR-safe)
const LeafletMap = dynamic(() => import('./LeafletMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        </div>
    ),
});

interface ScoutContainerProps {
    source: Location;
    destination: Location;
    car: Car;
    tripType: 'one-way' | 'round-trip';
    onPriceUpdate: (newPrice: number) => void;
    pickupDate?: string;
    dropDate?: string;
    pickupTime?: string;
    onDestinationChange?: (newDestination: Location) => void;
    onTripStatsUpdate?: (tripStats: TripStats, selectedStops: Stop[]) => void;
}

export default function ScoutContainer({
    source,
    destination,
    car,
    tripType,
    onPriceUpdate,
    pickupDate = new Date().toISOString().split('T')[0],
    dropDate,
    pickupTime,
    onDestinationChange,
    onTripStatsUpdate,
}: ScoutContainerProps) {
    const [focusedStopId, setFocusedStopId] = useState<string | undefined>();
    const [showDestinationChanger, setShowDestinationChanger] = useState(false);
    const [viewMode, setViewMode] = useState<'timeline' | 'daywise'>('daywise');
    const [currentDestination, setCurrentDestination] = useState(destination);

    const {
        routeData,
        stops,
        selectedStops,
        tripStats,
        isLoading,
        error,
        toggleStopSelection,
        nightHaltSuggestion,
        scoutTip,
    } = useTripLogic({
        source,
        destination: currentDestination,
        tripType,
        baseFare: car.baseFare,
        perKmRate: car.perKmRate,
        driverAllowancePerDay: car.driverAllowancePerDay,
        pickupDate,
        dropDate,
        pickupTime,
    });

    // Update parent with new price when tripStats changes
    useEffect(() => {
        if (tripStats) {
            onPriceUpdate(tripStats.totalFare);
        }
    }, [tripStats, onPriceUpdate]);

    // Notify parent of tripStats and selectedStops for booking
    useEffect(() => {
        if (tripStats && onTripStatsUpdate) {
            onTripStatsUpdate(tripStats, selectedStops);
        }
    }, [tripStats, selectedStops, onTripStatsUpdate]);

    // Find the midpoint stop for night halt display
    const nightHaltAfterStopId = useMemo(() => {
        if (!nightHaltSuggestion || stops.length < 3) return undefined;
        const midIndex = Math.floor(stops.length / 2);
        return stops[midIndex]?.id;
    }, [nightHaltSuggestion, stops]);

    // Calculate journey segments between stops
    const journeySegments = useMemo((): JourneySegment[] => {
        if (!routeData || stops.length < 2) return [];

        const segments: JourneySegment[] = [];
        const totalDistance = routeData.distanceKm;
        const avgSpeedKmH = 40; // Average speed

        for (let i = 0; i < stops.length - 1; i++) {
            const fromStop = stops[i];
            const toStop = stops[i + 1];

            // Calculate approximate distance between stops
            const segmentRatio = 1 / (stops.length - 1);
            const segmentDistance = totalDistance * segmentRatio;
            const segmentDuration = (segmentDistance / avgSpeedKmH) * 60; // in minutes

            // Calculate times
            const startHour = 6; // 6 AM start
            const preceedingDuration = i * (totalDistance / (stops.length - 1) / avgSpeedKmH);
            const departureHour = startHour + preceedingDuration;
            const arrivalHour = departureHour + (segmentDistance / avgSpeedKmH);

            const formatTime = (hours: number) => {
                const h = Math.floor(hours) % 24;
                const m = Math.floor((hours % 1) * 60);
                const period = h >= 12 ? 'PM' : 'AM';
                const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
            };

            segments.push({
                fromStop,
                toStop,
                distanceKm: segmentDistance,
                durationMinutes: Math.round(segmentDuration),
                departureTime: formatTime(departureHour),
                arrivalTime: formatTime(arrivalHour),
            });
        }

        return segments;
    }, [stops, routeData]);

    // Group stops by day for multi-day trips
    const journeyDays = useMemo(() => {
        if (!tripStats || stops.length === 0) return [];

        const isRoundTrip = tripType === 'round-trip';
        const totalTripDays = tripStats.totalDays;

        // Split stops by leg
        const onwardStops = stops.filter(s => s.leg !== 'return');
        const returnStops = stops.filter(s => s.leg === 'return');

        // Determine days distribution
        let onwardDaysCount = totalTripDays;
        let returnDaysCount = 0;

        if (isRoundTrip) {
            if (totalTripDays === 1) {
                onwardDaysCount = 1;
                returnDaysCount = 1;
            } else {
                onwardDaysCount = Math.ceil(totalTripDays / 2);
                returnDaysCount = totalTripDays - onwardDaysCount;
            }
        }

        const days: Array<{
            dayNumber: number;
            date: string;
            stops: Stop[];
            segments: JourneySegment[];
            totalDriveTimeMinutes: number;
            totalDistanceKm: number;
            nightHalt?: string;
        }> = [];

        // --- Generate Onward Days ---
        // Calculate stops per day for onward leg
        const onwardStopsPerDay = Math.ceil(onwardStops.length / onwardDaysCount);

        for (let day = 0; day < onwardDaysCount; day++) {
            const startIdx = day * onwardStopsPerDay;
            const endIdx = Math.min(startIdx + onwardStopsPerDay, onwardStops.length);
            const dayStops = onwardStops.slice(startIdx, endIdx);

            // Segments for this day - simplistic slicing of all segments?
            // Since segments are generated from full stops list, we need to map them.
            // But simpler: just accept dayStops and recalculate simplistic distance for UI
            // or try to match them.
            // For now, let's just pass empty segments or filter broadly.
            // Actually, let's reuse the segment logic but filter it.
            const daySegments = journeySegments.filter(js => dayStops.includes(js.fromStop));

            // Calculate day date
            const date = new Date(pickupDate);
            date.setDate(date.getDate() + day);

            // Distance & Time
            const dayDistance = daySegments.reduce((sum, s) => sum + s.distanceKm, 0);
            const dayTime = daySegments.reduce((sum, s) => sum + s.durationMinutes, 0);

            days.push({
                dayNumber: day + 1,
                date: date.toISOString().split('T')[0],
                stops: dayStops,
                segments: daySegments,
                totalDriveTimeMinutes: dayTime > 0 ? dayTime : (tripStats.totalDriveTimeHours * 60 / totalTripDays), // Fallback
                totalDistanceKm: dayDistance > 0 ? dayDistance : (tripStats.totalDistanceKm / (isRoundTrip ? 2 : 1) / onwardDaysCount),
                nightHalt: day < onwardDaysCount - 1 ? nightHaltSuggestion?.suggestedCity : undefined,
            });
        }

        // --- Generate Return Days ---
        if (isRoundTrip) {
            const returnStopsPerDay = Math.max(1, Math.ceil(returnStops.length / returnDaysCount));

            for (let i = 0; i < returnDaysCount; i++) {
                const dayNum = (totalTripDays === 1 ? 1 : onwardDaysCount + i + 1);
                const startIdx = i * returnStopsPerDay;
                const endIdx = Math.min(startIdx + returnStopsPerDay, returnStops.length);
                const dayStops = returnStops.slice(startIdx, endIdx);

                const daySegments = journeySegments.filter(js => dayStops.includes(js.fromStop));

                // Calculate date: if single day trip, same as pickup. Else offset.
                const dayOffset = (totalTripDays === 1 ? 0 : onwardDaysCount + i);
                const date = new Date(pickupDate);
                date.setDate(date.getDate() + dayOffset);

                const dayDistance = daySegments.reduce((sum, s) => sum + s.distanceKm, 0);

                days.push({
                    dayNumber: dayNum,
                    date: date.toISOString().split('T')[0],
                    stops: dayStops,
                    segments: daySegments,
                    totalDriveTimeMinutes: 0, // Simplified for return
                    totalDistanceKm: dayDistance > 0 ? dayDistance : (tripStats.totalDistanceKm / 2 / returnDaysCount),
                    nightHalt: i < returnDaysCount - 1 ? 'En route' : undefined,
                });
            }
        }

        return days;
    }, [stops, tripStats, journeySegments, pickupDate, nightHaltSuggestion, tripType]);

    // Handle destination change
    const handleDestinationChange = useCallback((newDestination: Location) => {
        setCurrentDestination(newDestination);
        if (onDestinationChange) {
            onDestinationChange(newDestination);
        }
    }, [onDestinationChange]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#2563EB] animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Planning your journey...</p>
                    <p className="text-sm text-gray-400 mt-1">Fetching route & generating stops</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center text-red-500">
                    <p className="font-medium">{error}</p>
                    <p className="text-sm mt-1">Please try again later</p>
                </div>
            </div>
        );
    }

    if (!routeData || !tripStats) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden"
        >
            {/* Premium Journey Header */}
            <div className="p-4">
                <JourneyHeader
                    source={source}
                    destination={currentDestination}
                    pickupDate={pickupDate}
                    dropDate={dropDate}
                    pickupTime={pickupTime}
                    tripType={tripType}
                    totalDays={tripStats.totalDays}
                    totalDistanceKm={tripStats.totalDistanceKm}
                    totalDriveTimeHours={tripStats.totalDriveTimeHours}
                    onChangeDestination={() => setShowDestinationChanger(true)}
                />
            </div>

            {/* Header Stats - Professional Blue Theme */}
            <div className="p-4 bg-white border-b border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Distance */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-9 h-9 bg-slate-600 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Distance</div>
                            <div className="font-bold text-slate-800 text-sm">
                                {formatDistance(tripStats.totalDistanceKm)}
                            </div>
                        </div>
                    </div>

                    {/* Drive Time */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-9 h-9 bg-slate-600 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Drive Time</div>
                            <div className="font-bold text-slate-800 text-sm">
                                {formatDuration(tripStats.totalDriveTimeHours)}
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-9 h-9 bg-slate-600 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Duration</div>
                            <div className="font-bold text-slate-800 text-sm">
                                {tripStats.totalDays} {tripStats.totalDays > 1 ? 'Days' : 'Day'}
                            </div>
                        </div>
                    </div>

                    {/* Stops Added */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="w-9 h-9 bg-[#2563EB] rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wide text-blue-400 font-medium">Stops Added</div>
                            <div className="font-bold text-[#2563EB] text-sm">
                                {selectedStops.filter(s => s.type !== 'start' && s.type !== 'end').length} stops
                            </div>
                        </div>
                    </div>

                    {/* Total Fare */}
                    <div className="flex items-center gap-3 p-3 bg-[#2563EB] rounded-xl col-span-2 md:col-span-1">
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                            <IndianRupee className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wide text-blue-200 font-medium">Total Fare</div>
                            <div className="font-bold text-white text-sm">
                                {formatCurrency(tripStats.totalFare)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scout Tip */}
            {scoutTip && (
                <div className="p-4 border-b border-gray-100">
                    <ScoutTip
                        tip={scoutTip}
                        type={
                            scoutTip.includes('long') || scoutTip.includes('Night')
                                ? 'warning'
                                : 'info'
                        }
                    />
                </div>
            )}

            {/* View Mode Toggle */}
            <div className="px-4 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">Your Journey</h3>
                    <span className="text-sm text-gray-500">
                        {tripStats.totalDays > 1 ? `${tripStats.totalDays} days` : 'Same day trip'}
                    </span>
                </div>

                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('daywise')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'daywise'
                            ? 'bg-white text-[#2563EB] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        Day-wise
                    </button>
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'timeline'
                            ? 'bg-white text-[#2563EB] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Route className="w-3.5 h-3.5" />
                        Timeline
                    </button>
                </div>
            </div>

            {/* Main Content - Split View */}
            <div className="flex flex-col lg:flex-row min-h-[500px]">
                {/* Journey Content (Left on Desktop, Bottom on Mobile) */}
                <div className="order-2 lg:order-1 w-full lg:w-2/5 p-4 lg:border-r border-gray-100 overflow-y-auto max-h-[600px]">
                    {viewMode === 'daywise' ? (
                        /* Day-wise View */
                        <div className="space-y-4">
                            {/* For Round Trip: Show Onward and Return sections */}
                            {tripType === 'round-trip' && journeyDays.length > 0 && (
                                <>
                                    {/* Onward Journey Header */}
                                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Onward Journey</div>
                                            <div className="text-xs text-blue-100">
                                                {source.name} → {currentDestination.name}
                                            </div>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <div className="text-xs text-blue-100">Distance</div>
                                            <div className="font-bold text-sm">{formatDistance(tripStats.totalDistanceKm / 2)}</div>
                                        </div>
                                    </div>

                                    {/* Onward Days (first half) */}
                                    {journeyDays.slice(0, Math.ceil(journeyDays.length / 2)).map((day, idx) => (
                                        <JourneyDayCard
                                            key={`onward-${day.dayNumber}`}
                                            dayNumber={day.dayNumber}
                                            date={day.date}
                                            stops={day.stops}
                                            segments={day.segments}
                                            selectedStops={selectedStops}
                                            onToggleStop={toggleStopSelection}
                                            onFocusStop={setFocusedStopId}
                                            totalDriveTimeMinutes={day.totalDriveTimeMinutes}
                                            totalDistanceKm={day.totalDistanceKm}
                                            nightHalt={day.nightHalt}
                                            isFirstDay={idx === 0}
                                            isLastDay={false}
                                        />
                                    ))}

                                    {/* Return Journey Header */}
                                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white mt-6">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M19 12H5M12 19l-7-7 7-7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Return Journey</div>
                                            <div className="text-xs text-orange-100">
                                                {currentDestination.name} → {source.name}
                                            </div>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <div className="text-xs text-orange-100">Distance</div>
                                            <div className="font-bold text-sm">{formatDistance(tripStats.totalDistanceKm / 2)}</div>
                                        </div>
                                    </div>

                                    {/* Return Days (second half) */}
                                    {journeyDays.slice(Math.ceil(journeyDays.length / 2)).map((day, idx, arr) => (
                                        <JourneyDayCard
                                            key={`return-${day.dayNumber}`}
                                            dayNumber={day.dayNumber}
                                            date={day.date}
                                            stops={day.stops}
                                            segments={day.segments}
                                            selectedStops={selectedStops}
                                            onToggleStop={toggleStopSelection}
                                            onFocusStop={setFocusedStopId}
                                            totalDriveTimeMinutes={day.totalDriveTimeMinutes}
                                            totalDistanceKm={day.totalDistanceKm}
                                            nightHalt={day.nightHalt}
                                            isFirstDay={false}
                                            isLastDay={idx === arr.length - 1}
                                        />
                                    ))}
                                </>
                            )}

                            {/* For One-way Trip: Show all days without split */}
                            {tripType === 'one-way' && journeyDays.map((day, idx) => (
                                <JourneyDayCard
                                    key={day.dayNumber}
                                    dayNumber={day.dayNumber}
                                    date={day.date}
                                    stops={day.stops}
                                    segments={day.segments}
                                    selectedStops={selectedStops}
                                    onToggleStop={toggleStopSelection}
                                    onFocusStop={setFocusedStopId}
                                    totalDriveTimeMinutes={day.totalDriveTimeMinutes}
                                    totalDistanceKm={day.totalDistanceKm}
                                    nightHalt={day.nightHalt}
                                    isFirstDay={idx === 0}
                                    isLastDay={idx === journeyDays.length - 1}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Timeline View */
                        <>
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">
                                    Select stops to add to your itinerary
                                </p>
                            </div>

                            <Timeline
                                stops={stops}
                                selectedStops={selectedStops}
                                onToggleStop={toggleStopSelection}
                                onFocusStop={setFocusedStopId}
                                showNightHaltAfter={nightHaltAfterStopId}
                            />
                        </>
                    )}

                    {/* Fare Breakdown */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-slate-800">Fare Breakdown</h4>
                            <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200">
                                {selectedStops.filter(s => s.type !== 'start' && s.type !== 'end').length} stops added
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Base Fare</span>
                                <span className="text-slate-800">{formatCurrency(tripStats.baseFare)}</span>
                            </div>
                            {tripStats.extraKmCharge > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Extra Km Charge</span>
                                    <span className="text-slate-800">
                                        +{formatCurrency(tripStats.extraKmCharge)}
                                    </span>
                                </div>
                            )}
                            {tripStats.driverAllowance > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Driver Allowance</span>
                                    <span className="text-slate-800">
                                        +{formatCurrency(tripStats.driverAllowance)}
                                    </span>
                                </div>
                            )}
                            <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-800">Total</span>
                                <span className="font-bold text-lg text-[#2563EB]">
                                    {formatCurrency(tripStats.totalFare)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map (Right on Desktop, Top on Mobile) */}
                <div className="order-1 lg:order-2 w-full lg:w-3/5 h-[300px] lg:h-auto lg:sticky lg:top-0">
                    <LeafletMap
                        routeCoordinates={routeData.coordinates}
                        stops={stops}
                        selectedStopId={focusedStopId}
                        onStopClick={toggleStopSelection}
                        tripType={tripType}
                    />
                </div>
            </div>

            {/* Destination Changer Modal */}
            <DestinationChanger
                currentDestination={currentDestination}
                onDestinationChange={handleDestinationChange}
                onClose={() => setShowDestinationChanger(false)}
                isOpen={showDestinationChanger}
            />
        </motion.div>
    );
}
