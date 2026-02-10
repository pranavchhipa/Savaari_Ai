'use client';

import { motion } from 'framer-motion';
import { Stop } from '@/types';
import TimelineItem from './TimelineItem';
import {
    Calendar,
    Clock,
    MapPin,
    Moon,
    Navigation,
    Sunrise,
    Sunset
} from 'lucide-react';

interface JourneySegment {
    fromStop: Stop;
    toStop: Stop;
    distanceKm: number;
    durationMinutes: number;
    departureTime: string;
    arrivalTime: string;
}

interface JourneyDayCardProps {
    dayNumber: number;
    date: string;
    stops: Stop[];
    segments: JourneySegment[];
    selectedStops: Stop[];
    onToggleStop: (stopId: string) => void;
    onFocusStop: (stopId: string) => void;
    totalDriveTimeMinutes: number;
    totalDistanceKm: number;
    nightHalt?: string;
    isFirstDay?: boolean;
    isLastDay?: boolean;
}

export default function JourneyDayCard({
    dayNumber,
    date,
    stops,
    segments,
    selectedStops,
    onToggleStop,
    onFocusStop,
    totalDriveTimeMinutes,
    totalDistanceKm,
    nightHalt,
    isFirstDay,
    isLastDay,
}: JourneyDayCardProps) {
    const isStopSelected = (stopId: string) =>
        selectedStops.some((s) => s.id === stopId);

    // Format date
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Format duration
    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h === 0) return `${m} min`;
        if (m === 0) return `${h} hr`;
        return `${h}hr ${m}min`;
    };

    // Get day period icon
    const getDayPeriodIcon = () => {
        if (isFirstDay) return <Sunrise className="w-4 h-4" />;
        if (isLastDay) return <Sunset className="w-4 h-4" />;
        return <Calendar className="w-4 h-4" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Day Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 gap-3 md:gap-0">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isFirstDay
                        ? 'bg-blue-500 text-white'
                        : isLastDay
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-700 text-white'
                        }`}>
                        {getDayPeriodIcon()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Day {dayNumber}
                            </span>
                            {isFirstDay && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                    Start
                                </span>
                            )}
                            {isLastDay && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                    Arrival
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">{formatDate(date)}</p>
                    </div>
                </div>

                {/* Day Stats */}
                <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
                    <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500">
                        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>{formatDuration(totalDriveTimeMinutes)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500">
                        <Navigation className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>{Math.round(totalDistanceKm)} km</span>
                    </div>
                </div>
            </div>

            {/* Timeline with Segments */}
            <div className="p-4">
                {stops.map((stop, index) => (
                    <div key={`${stop.id}-${index}`}>
                        {/* Timeline Item */}
                        <TimelineItem
                            stop={stop}
                            isSelected={isStopSelected(stop.id)}
                            onToggle={() => onToggleStop(stop.id)}
                            onFocus={() => onFocusStop(stop.id)}
                            isLast={index === stops.length - 1 && !segments[index]}
                        />

                        {/* Segment Info (between stops) */}
                        {segments[index] && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="ml-4 pl-6 py-2 border-l-2 border-dashed border-gray-200"
                            >
                                <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-transparent rounded-lg">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
                                        <span className="font-medium">
                                            {formatDuration(segments[index].durationMinutes)} drive
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-300">•</span>
                                    <span className="text-xs text-gray-500">
                                        {Math.round(segments[index].distanceKm)} km
                                    </span>
                                    {segments[index].arrivalTime && (
                                        <>
                                            <span className="text-xs text-gray-300">•</span>
                                            <span className="text-xs text-gray-500">
                                                Arrive ~{segments[index].arrivalTime}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Day Summary / Night Halt */}
            {nightHalt && (
                <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Moon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-indigo-800">Night Halt Recommended</p>
                            <p className="text-xs text-indigo-600">
                                Stay overnight at {nightHalt} for a comfortable journey
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Day Summary Stats */}
            <div className="px-4 pb-4">
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{stops.length} stops</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200" />
                    <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{formatDuration(totalDriveTimeMinutes)} driving</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200" />
                    <div className="flex items-center gap-2 text-slate-600">
                        <Navigation className="w-4 h-4 text-slate-400" />
                        <span>{Math.round(totalDistanceKm)} km covered</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
