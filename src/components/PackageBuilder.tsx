'use client';

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Location, Car, Stop, TripStats, Persona } from '@/types';
import { usePackagePlan } from '@/hooks/usePackagePlan';
import CabMeter from './CabMeter';
import RecommendationShowcase from './RecommendationShowcase';
import { PERSONAS } from './PersonaPicker';
import { packageFareBreakdown } from '@/lib/packagePricing';
import { getDistance } from '@/lib/geoUtils';
import {
    formatCurrency,
    formatDistance,
    getStopTypeIcon,
} from '@/lib/calculateTripStats';
import {
    MapPin,
    Calendar,
    Clock,
    IndianRupee,
    Loader2,
    Sparkles,
    Star,
    X,
    Navigation,
    AlertCircle,
} from 'lucide-react';

const GoogleMap = dynamic(() => import('./GoogleMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        </div>
    ),
});

interface PackageBuilderProps {
    source: Location;
    destination: Location;
    car: Car;
    tripType: 'one-way' | 'round-trip' | 'local' | 'package';
    onPriceUpdate: (newPrice: number) => void;
    onTripStatsUpdate?: (tripStats: TripStats, selectedStops: Stop[]) => void;
    pickupDate?: string;
    dropDate?: string;
    pickupTime?: string;
    persona?: Persona | null;
    isInModal?: boolean;
    tripDays?: number;
}

const AVG_CITY_SPEED_KMH = 28;
const driveMinutes = (a: Stop, b: Stop) =>
    Math.round((getDistance(a.location, b.location) / AVG_CITY_SPEED_KMH) * 60);

export default function PackageBuilder({
    source,
    destination,
    car,
    onPriceUpdate,
    onTripStatsUpdate,
    pickupDate = new Date().toISOString().split('T')[0],
    pickupTime,
    persona = null,
    isInModal = false,
    tripDays = 3,
}: PackageBuilderProps) {
    const numDays = tripDays || 3;
    const {
        isLoading,
        error,
        attractions,
        days,
        addedIds,
        addAttraction,
        removeStop,
        tripStats,
        transferKm,
        usedAi,
    } = usePackagePlan({ source, destination, numDays, car, persona, pickupDate, pickupTime });

    const [activeDay, setActiveDay] = useState(1);
    const [focusedStopId, setFocusedStopId] = useState<string | undefined>();

    const allStops = useMemo(() => days.flatMap((d) => d.stops), [days]);

    // Report price + stats up to the PlanningModal (drives BillingFooter + booking).
    useEffect(() => {
        if (tripStats) onPriceUpdate(tripStats.totalFare);
    }, [tripStats, onPriceUpdate]);

    useEffect(() => {
        if (tripStats && onTripStatsUpdate) onTripStatsUpdate(tripStats, allStops);
    }, [tripStats, allStops, onTripStatsUpdate]);

    // Keep the active-day tab valid as the plan changes.
    useEffect(() => {
        if (days.length > 0 && activeDay > days.length) setActiveDay(1);
    }, [days, activeDay]);

    const activeDayPlan = days.find((d) => d.day === activeDay) || days[0];
    const activeStops = activeDayPlan?.stops || [];
    const mapCoords = activeStops.map((s) => ({ lat: s.location.lat, lng: s.location.lng }));

    const personaMeta = persona ? PERSONAS.find((p) => p.id === persona) : null;
    const fb = tripStats ? packageFareBreakdown({ transferKm, numDays, car }) : null;

    const dayDate = (day: number) => {
        const base = new Date(pickupDate);
        if (isNaN(base.getTime())) return '';
        base.setDate(base.getDate() + (day - 1));
        return base.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-[#2563EB] animate-spin mx-auto mb-4" />
                        <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <p className="font-semibold text-gray-700">Building your {destination.name} plan...</p>
                    <p className="text-sm text-gray-400 mt-1">Finding the best things to do, day by day</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={isInModal
                ? 'bg-white overflow-hidden'
                : 'bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden'
            }
        >
            {/* Header */}
            <div className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{source.name}</span>
                        <span className="opacity-70">→</span>
                        <span>{destination.name}</span>
                        <span className="opacity-70">·</span>
                        <span>{numDays} {numDays > 1 ? 'days' : 'day'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="bg-white/15 rounded-full px-2.5 py-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {dayDate(1)}
                        </span>
                        {personaMeta && (
                            <span className="bg-white/15 rounded-full px-2.5 py-1 flex items-center gap-1" title={personaMeta.subtitle}>
                                <span>{personaMeta.emoji}</span> {personaMeta.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats row */}
            {tripStats && (
                <div className="px-4 pb-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Stat icon={<Navigation className="w-4 h-4 text-white" />} bg="bg-slate-600" label="Sightseeing" value={`${allStops.length} stops`} />
                        <Stat icon={<Clock className="w-4 h-4 text-white" />} bg="bg-slate-600" label="Duration" value={`${numDays} ${numDays > 1 ? 'days' : 'day'}`} />
                        <Stat icon={<MapPin className="w-4 h-4 text-white" />} bg="bg-amber-500" label="Transfer" value={formatDistance(transferKm * 2)} />
                        <Stat icon={<IndianRupee className="w-4 h-4 text-white" />} bg="bg-[#2563EB]" label="All-in" value={formatCurrency(tripStats.totalFare)} highlight />
                    </div>
                </div>
            )}

            {error && (
                <div className="mx-4 mb-2 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Explore more attractions */}
            {attractions.length > 0 && (
                <RecommendationShowcase
                    recommendations={attractions}
                    onAddStop={addAttraction}
                    addedStopIds={addedIds}
                    title={`Things to do in ${destination.name}`}
                    subtitle="Tap ＋ to add or remove from your day plan"
                />
            )}

            {/* Split: day plan + map */}
            <div className="flex flex-col lg:flex-row min-h-[480px]">
                {/* Day plan */}
                <div className="order-2 lg:order-1 w-full lg:w-2/5 p-4 lg:border-r border-gray-100 overflow-y-auto max-h-[600px]">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg font-bold text-gray-800">Your itinerary</h3>
                        <span className="text-sm text-gray-500">{destination.name}</span>
                    </div>

                    {/* Day tabs */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {days.map((d) => (
                            <button
                                key={d.day}
                                onClick={() => setActiveDay(d.day)}
                                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${activeDay === d.day
                                    ? 'bg-[#2563EB] text-white shadow-sm'
                                    : 'bg-blue-50 text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Day {d.day}
                            </button>
                        ))}
                    </div>

                    {activeDayPlan && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="font-bold text-sm text-gray-800">
                                    Day {activeDayPlan.day}
                                    <span className="font-normal text-gray-400 ml-2">{dayDate(activeDayPlan.day)}</span>
                                </div>
                            </div>

                            <CabMeter
                                usedKm={activeDayPlan.usedKm}
                                usedHours={activeDayPlan.usedHours}
                                slabKm={activeDayPlan.slabKm}
                                slabHours={activeDayPlan.slabHours}
                                perKmRate={car.perKmRate}
                            />

                            {activeStops.length === 0 && (
                                <p className="text-sm text-gray-400 py-6 text-center">
                                    No stops on this day yet — add some from the list above.
                                </p>
                            )}

                            {activeStops.map((stop, i) => (
                                <div key={stop.id}>
                                    <div
                                        className="flex gap-3 items-start border border-gray-200 rounded-xl p-2.5 hover:border-blue-200 transition-colors cursor-pointer"
                                        onClick={() => setFocusedStopId(stop.id)}
                                    >
                                        {stop.photoUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={stop.photoUrl} alt={stop.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
                                                {getStopTypeIcon(stop.type)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-sm text-gray-800 truncate">{stop.name}</span>
                                                {typeof stop.rating === 'number' && (
                                                    <span className="flex items-center gap-0.5 text-amber-500 text-xs flex-shrink-0">
                                                        <Star className="w-3 h-3 fill-current" />{stop.rating.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-gray-500 line-clamp-1">
                                                {stop.duration} min · {stop.famousFor || stop.description}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeStop(stop.id); }}
                                            className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                                            aria-label={`Remove ${stop.name}`}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {i < activeStops.length - 1 && (
                                        <div className="text-[10px] text-gray-400 pl-4 py-1">
                                            ↓ {driveMinutes(stop, activeStops[i + 1])} min drive
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Fare breakdown */}
                    {fb && tripStats && !isInModal && (
                        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <h4 className="font-semibold text-slate-800 mb-3">Package price</h4>
                            <div className="space-y-2 text-sm">
                                <Row label={`Transfer ${source.name} ⇄ ${destination.name}`} value={formatCurrency(fb.transferFare)} />
                                <Row label={`Sightseeing — ${fb.days} × 8hr/80km`} value={formatCurrency(fb.sightseeingFare)} />
                                <Row label={`Driver allowance (${fb.days} days)`} value={`+${formatCurrency(fb.driverAllowance)}`} />
                                <Row label="Estimated tolls" value={`+${formatCurrency(fb.tollEstimate)}`} />
                                <div className="pt-3 mt-1 border-t border-slate-200 flex justify-between items-center">
                                    <span className="font-bold text-slate-800">Total</span>
                                    <span className="text-right">
                                        <span className="font-bold text-lg text-[#2563EB]">{formatCurrency(tripStats.totalFare)}</span>
                                        <span className="block text-[10px] text-slate-400">excludes entry tickets &amp; meals</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Map */}
                <div className="order-1 lg:order-2 w-full lg:w-3/5 h-[300px] lg:h-auto lg:sticky lg:top-0">
                    <GoogleMap
                        routeCoordinates={mapCoords}
                        stops={activeStops}
                        selectedStopId={focusedStopId}
                        onStopClick={(id) => setFocusedStopId(id)}
                        tripType="package"
                    />
                </div>
            </div>

            {usedAi && (
                <div className="px-4 py-2 text-[11px] text-gray-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Curated for you
                </div>
            )}
        </motion.div>
    );
}

function Stat({ icon, bg, label, value, highlight }: { icon: ReactNode; bg: string; label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${highlight ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{icon}</div>
            <div className="min-w-0">
                <div className={`text-[10px] uppercase tracking-wide font-medium ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>{label}</div>
                <div className={`font-bold text-sm truncate ${highlight ? 'text-white' : 'text-slate-800'}`}>{value}</div>
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-800">{value}</span>
        </div>
    );
}
