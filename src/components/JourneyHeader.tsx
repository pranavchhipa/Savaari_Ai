'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location } from '@/types';
import {
    MapPin,
    Calendar,
    ArrowRight,
    Plane,
    Edit3,
    Clock,
    Navigation,
    RefreshCw
} from 'lucide-react';

interface JourneyHeaderProps {
    source: Location;
    destination: Location;
    pickupDate: string;
    dropDate?: string;
    pickupTime?: string;
    tripType: 'one-way' | 'round-trip';
    totalDays: number;
    totalDistanceKm: number;
    totalDriveTimeHours: number;
    onChangeDestination?: () => void;
}

export default function JourneyHeader({
    source,
    destination,
    pickupDate,
    dropDate,
    pickupTime,
    tripType,
    totalDays,
    totalDistanceKm,
    totalDriveTimeHours,
    onChangeDestination,
}: JourneyHeaderProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Format the pickup date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    // Calculate arrival date
    const getArrivalDate = () => {
        if (dropDate) {
            const date = new Date(dropDate);
            return date.toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }
        const date = new Date(pickupDate);
        date.setDate(date.getDate() + totalDays - 1);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    // Format drive time
    const formatDriveTime = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        if (h === 0) return `${m} min`;
        if (m === 0) return `${h} hr`;
        return `${h}hr ${m}min`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        x: isHovered ? 20 : 0,
                        opacity: isHovered ? 0.15 : 0.1,
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: isHovered ? -20 : 0,
                        opacity: isHovered ? 0.15 : 0.1,
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10">
                {/* Route Visualization */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 md:gap-0">
                    {/* Source */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-400/30">
                            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-blue-300 uppercase tracking-wider font-medium">From</p>
                            <h3 className="text-lg md:text-xl font-bold text-white truncate max-w-[150px] md:max-w-none">{source.name}</h3>
                        </div>
                    </div>

                    {/* Animated Route Line - Hidden on Mobile */}
                    <div className="hidden md:flex flex-1 mx-6 relative">
                        <div className="w-full h-px bg-gradient-to-r from-blue-400 via-slate-500 to-orange-400 relative">
                            {/* Animated Dots */}
                            <motion.div
                                animate={{ x: ['0%', '100%'] }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"
                            />
                        </div>

                        {/* Flight/Route Icon */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-3 py-1 rounded-full border border-slate-600">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Navigation className="w-4 h-4 rotate-90" />
                                <span className="text-xs font-medium">{Math.round(tripType === 'round-trip' ? totalDistanceKm / 2 : totalDistanceKm)} km</span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Arrow & Distance */}
                    <div className="flex md:hidden items-center justify-center gap-3 text-slate-400">
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-400 to-orange-400" />
                        <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded-full">
                            <Navigation className="w-3 h-3 rotate-90" />
                            <span className="text-xs font-medium">{Math.round(totalDistanceKm)} km</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-orange-400 to-transparent" />
                    </div>

                    {/* Destination */}
                    <div className="flex items-center gap-3 md:flex-row-reverse">
                        <div>
                            <p className="text-xs text-orange-300 uppercase tracking-wider font-medium md:text-right">To</p>
                            <h3 className="text-lg md:text-xl font-bold text-white md:text-right truncate max-w-[150px] md:max-w-none">{destination.name}</h3>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-orange-400/30">
                            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                        </div>
                    </div>

                    {/* Round Trip Return - Desktop Only for layout balance */}
                    {tripType === 'round-trip' && (
                        <>
                            {/* Animated Route Line 2 - Return */}
                            <div className="hidden md:flex flex-1 mx-6 relative">
                                <div className="w-full h-px bg-gradient-to-r from-orange-400 via-slate-500 to-blue-400 relative">
                                    <motion.div
                                        animate={{ x: ['0%', '100%'] }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'linear',
                                            delay: 1.5
                                        }}
                                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50"
                                    />
                                    {/* Distance Pill for Return */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-800/50 backdrop-blur-sm z-10">
                                        <div className="flex items-center gap-2">
                                            <Navigation className="w-4 h-4 rotate-90 text-blue-400" />
                                            <span className="text-xs font-medium text-blue-400">{Math.round(totalDistanceKm / 2)} km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Return Source */}
                            <div className="hidden md:flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-400/30">
                                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-300 uppercase tracking-wider font-medium">Return</p>
                                    <h3 className="text-lg md:text-xl font-bold text-white truncate max-w-[150px] md:max-w-none">{source.name}</h3>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Journey Details Row */}
                <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between gap-3 md:gap-4 pt-4 border-t border-slate-700/50">
                    {/* Date Range */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-300">
                                {formatDate(pickupDate)}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="text-sm text-slate-300">
                                {getArrivalDate()}
                            </span>
                        </div>

                        {/* Duration Pill */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-full">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-300">
                                {totalDays} {totalDays > 1 ? 'Days' : 'Day'} · {formatDriveTime(totalDriveTimeHours)} drive
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                        {/* Trip Type Badge */}
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${tripType === 'round-trip'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                            <div className="flex items-center gap-1.5">
                                {tripType === 'round-trip' && <RefreshCw className="w-3 h-3" />}
                                {tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                            </div>
                        </div>

                        {/* Change Destination Button */}
                        {onChangeDestination && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onChangeDestination}
                                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-xs md:text-sm font-medium text-slate-300 hover:text-white transition-colors border border-slate-600/50"
                            >
                                <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="hidden sm:inline">Change Destination</span>
                                <span className="sm:hidden">Change</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
