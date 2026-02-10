'use client';

import { motion } from 'framer-motion';
import { RouteOption } from '@/types';
import { formatCurrency, formatDuration, formatDistance, getRouteFareDifference } from '@/lib/calculateTripStats';
import { Clock, Navigation, Zap, Mountain, Shield, Check, TrendingDown } from 'lucide-react';

interface RouteSelectorProps {
    routes: RouteOption[];
    selectedRouteId: string;
    onRouteSelect: (routeId: string) => void;
    perKmRate: number;
    driverAllowancePerDay: number;
}

export default function RouteSelector({
    routes,
    selectedRouteId,
    onRouteSelect,
    perKmRate,
    driverAllowancePerDay,
}: RouteSelectorProps) {
    if (routes.length <= 1) return null;

    // Calculate estimated fare for each route (quick estimate for comparison)
    const routesWithFare = routes.map(route => {
        const days = Math.max(1, Math.ceil((route.durationMinutes / 60) / 10));
        const billableKm = Math.max(route.distanceKm, days * 300);
        const fare = Math.round(billableKm * perKmRate + days * driverAllowancePerDay + (route.tollInfo?.estimatedPrice || 0));
        return { ...route, estimatedFare: fare };
    });

    const recommendedFare = routesWithFare[0].estimatedFare || 0;

    const getRouteIcon = (label: string) => {
        if (label.includes('Fast') || label.includes('Recommend')) return <Zap className="w-4 h-4" />;
        if (label.includes('Scenic')) return <Mountain className="w-4 h-4" />;
        if (label.includes('Toll-Free')) return <Shield className="w-4 h-4" />;
        if (label.includes('Short')) return <TrendingDown className="w-4 h-4" />;
        return <Navigation className="w-4 h-4" />;
    };

    const getRouteGradient = (index: number, isSelected: boolean) => {
        if (!isSelected) return 'from-white to-gray-50';
        const gradients = [
            'from-blue-50 to-indigo-50',
            'from-purple-50 to-violet-50',
            'from-emerald-50 to-teal-50',
        ];
        return gradients[index] || gradients[0];
    };

    const getAccentColor = (index: number) => {
        const colors = ['#2563EB', '#8B5CF6', '#059669'];
        return colors[index] || colors[0];
    };

    return (
        <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Navigation className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">Choose Your Route</h3>
                        <p className="text-xs text-gray-500">{routes.length} options available</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {routesWithFare.map((route, index) => {
                    const isSelected = route.id === selectedRouteId;
                    const fareDiff = getRouteFareDifference(recommendedFare, route.estimatedFare || 0);
                    const accentColor = getAccentColor(index);

                    return (
                        <motion.button
                            key={route.id}
                            onClick={() => onRouteSelect(route.id)}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative flex-shrink-0 min-w-[160px] md:min-w-[180px] p-4 rounded-xl border-2 transition-all ${isSelected
                                    ? 'shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300 shadow-sm'
                                } bg-gradient-to-br ${getRouteGradient(index, isSelected)}`}
                            style={{
                                borderColor: isSelected ? accentColor : undefined,
                            }}
                        >
                            {/* Recommended badge */}
                            {route.isRecommended && (
                                <div
                                    className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    ✦ BEST
                                </div>
                            )}

                            {/* Selected checkmark */}
                            {isSelected && (
                                <div
                                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    <Check className="w-3 h-3" />
                                </div>
                            )}

                            {/* Route icon & label */}
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {getRouteIcon(route.label)}
                                </div>
                                <span className="font-semibold text-xs text-gray-800 truncate">
                                    {route.label}
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-xs">{formatDuration(route.durationMinutes / 60)}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {formatDistance(route.distanceKm)}
                                    </span>
                                </div>

                                {/* Fare */}
                                <div className="pt-2 border-t border-gray-200/60">
                                    <div className="font-bold text-sm" style={{ color: accentColor }}>
                                        {formatCurrency(route.estimatedFare || 0)}
                                    </div>
                                    {fareDiff && !route.isRecommended && (
                                        <div className={`text-[10px] font-medium ${(route.estimatedFare || 0) > recommendedFare
                                                ? 'text-red-500'
                                                : 'text-green-600'
                                            }`}>
                                            {fareDiff} vs best
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Highlights */}
                            {route.highlights && route.highlights.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {route.highlights.slice(0, 2).map((highlight, i) => (
                                        <span
                                            key={i}
                                            className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white/80 text-gray-600 border border-gray-200/50"
                                        >
                                            {highlight}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
