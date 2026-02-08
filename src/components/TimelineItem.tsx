'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stop } from '@/types';
import { getStopTypeIcon, getStopTypeColor } from '@/lib/calculateTripStats';
import { Moon, MapPin, ChevronDown, Info, Loader2, Sparkles, Camera, Clock } from 'lucide-react';

interface PlaceInfo {
    description: string;
    whyStopHere: string;
    recommendedTime: string;
    photoSpots: string[];
    bestTimeToVisit?: string;
    localTips?: string;
}

interface TimelineItemProps {
    stop: Stop;
    isSelected: boolean;
    onToggle: () => void;
    onFocus: () => void;
    showNightHalt?: boolean;
    isLast?: boolean;
    nearCity?: string;
}

export default function TimelineItem({
    stop,
    isSelected,
    onToggle,
    onFocus,
    showNightHalt,
    isLast,
    nearCity,
}: TimelineItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [placeInfo, setPlaceInfo] = useState<PlaceInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

    const isStartOrEnd = stop.type === 'start' || stop.type === 'end';
    const color = getStopTypeColor(stop.type);
    const icon = getStopTypeIcon(stop.type);

    // Fetch AI description when expanded
    useEffect(() => {
        if (isExpanded && !placeInfo && !hasAttemptedFetch && !isStartOrEnd) {
            fetchPlaceInfo();
        }
    }, [isExpanded]);

    const fetchPlaceInfo = async () => {
        setIsLoading(true);
        setHasAttemptedFetch(true);

        // Check localStorage cache first
        const cacheKey = `place-info-${stop.name}-${stop.type}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsedCache = JSON.parse(cached);
                if (Date.now() - parsedCache.timestamp < 7 * 24 * 60 * 60 * 1000) {
                    setPlaceInfo(parsedCache.data);
                    setIsLoading(false);
                    return;
                }
            } catch (e) {
                // Cache invalid, continue to fetch
            }
        }

        try {
            const response = await fetch('/api/ai/place-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    placeName: stop.name,
                    placeType: stop.type,
                    nearCity: nearCity,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPlaceInfo(data);
                // Cache the result
                localStorage.setItem(cacheKey, JSON.stringify({
                    data,
                    timestamp: Date.now(),
                }));
            } else {
                // Use fallback
                setPlaceInfo(getDefaultPlaceInfo());
            }
        } catch (error) {
            console.error('Failed to fetch place info:', error);
            setPlaceInfo(getDefaultPlaceInfo());
        } finally {
            setIsLoading(false);
        }
    };

    const getDefaultPlaceInfo = (): PlaceInfo => {
        const defaults: Record<string, PlaceInfo> = {
            heritage: {
                description: `${stop.name} is a historic landmark worth exploring. Rich in culture and architecture, it offers a glimpse into India's fascinating past.`,
                whyStopHere: 'Perfect for history enthusiasts and photographers',
                recommendedTime: '60-90 minutes',
                photoSpots: ['Main entrance', 'Courtyard'],
            },
            viewpoint: {
                description: `${stop.name} offers breathtaking panoramic views. A perfect spot to stretch your legs and capture stunning photos.`,
                whyStopHere: 'Spectacular views and photo opportunities',
                recommendedTime: '20-30 minutes',
                photoSpots: ['Main viewpoint'],
            },
            restaurant: {
                description: `${stop.name} is a popular dining spot known for authentic local cuisine and quick service.`,
                whyStopHere: 'Taste authentic local delicacies',
                recommendedTime: '45-60 minutes',
                photoSpots: [],
            },
            food: {
                description: `${stop.name} is a beloved food stop along this route. Famous for its fresh preparations and quick service.`,
                whyStopHere: 'Famous highway food stop loved by travelers',
                recommendedTime: '30-45 minutes',
                photoSpots: [],
            },
            fuel: {
                description: 'Well-maintained fuel station with clean restrooms and refreshment options.',
                whyStopHere: 'Clean facilities and quick refueling',
                recommendedTime: '15-20 minutes',
                photoSpots: [],
            },
            rest: {
                description: 'Comfortable break point with refreshments and restroom facilities. Perfect for stretching after a long drive.',
                whyStopHere: 'Comfortable rest with good amenities',
                recommendedTime: '20-30 minutes',
                photoSpots: [],
            },
        };

        return defaults[stop.type] || {
            description: `${stop.name} is a recommended stop along your route. Consider adding it to your itinerary.`,
            whyStopHere: 'A worthwhile addition to your trip',
            recommendedTime: '30 minutes',
            photoSpots: [],
        };
    };

    const getStartEndInfo = () => {
        if (stop.type === 'start') {
            return 'Your journey begins here. Make sure to start fresh and well-rested. Have a safe trip!';
        }
        return 'Your final destination. We hope you have a wonderful journey with Savaari!';
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative flex items-start gap-3"
            >
                {/* Timeline Line */}
                {!isLast && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 to-gray-100" />
                )}

                {/* Small Timeline Dot */}
                <div
                    className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                    onClick={onFocus}
                >
                    <span className="text-sm">{icon}</span>
                </div>

                {/* Compact Content */}
                <div className="flex-1 pb-4">
                    <div className="flex items-center gap-3">
                        {/* Checkbox for non-start/end stops */}
                        {!isStartOrEnd && (
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={onToggle}
                                    className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] focus:ring-offset-0 cursor-pointer"
                                />
                            </label>
                        )}

                        {/* Halt Name */}
                        <div className="flex items-center gap-2 flex-1">
                            <span className={`font-medium ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                                {stop.name}
                            </span>
                            {isStartOrEnd && (
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: color }}
                                >
                                    {stop.type === 'start' ? 'Start' : 'End'}
                                </span>
                            )}
                            {stop.duration > 0 && !isStartOrEnd && (
                                <span className="text-xs text-gray-400">
                                    ({stop.duration} min)
                                </span>
                            )}
                        </div>

                        {/* Expand/Collapse Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-[#2563EB] hover:bg-blue-50 rounded-md transition-colors"
                        >
                            <Info className="w-3 h-3" />
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Expandable Details with AI Info */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-2 ml-7 p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100 shadow-sm">
                                    {/* Sarathi Badge */}
                                    {!isStartOrEnd && (
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                                            </svg>
                                            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
                                                Sarathi™ Recommends
                                            </span>
                                        </div>
                                    )}

                                    {isLoading ? (
                                        <div className="flex items-center gap-2 py-4">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                            <span className="text-sm text-gray-500">Sarathi is finding details...</span>
                                        </div>
                                    ) : isStartOrEnd ? (
                                        <p className="text-sm text-gray-600">{getStartEndInfo()}</p>
                                    ) : placeInfo ? (
                                        <div className="space-y-3">
                                            {/* Description */}
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {placeInfo.description}
                                            </p>

                                            {/* Why Stop Here - Highlighted */}
                                            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                                                <span className="text-green-600 mt-0.5">⭐</span>
                                                <div>
                                                    <span className="text-xs font-semibold text-green-800">Why stop here:</span>
                                                    <p className="text-sm text-green-700">{placeInfo.whyStopHere}</p>
                                                </div>
                                            </div>

                                            {/* Quick Info Row */}
                                            <div className="flex flex-wrap gap-3 text-xs">
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{placeInfo.recommendedTime}</span>
                                                </div>
                                                {placeInfo.bestTimeToVisit && (
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <span>🌅</span>
                                                        <span>Best: {placeInfo.bestTimeToVisit}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Photo Spots */}
                                            {placeInfo.photoSpots && placeInfo.photoSpots.length > 0 && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Camera className="w-3 h-3" />
                                                    <span>📸 {placeInfo.photoSpots.join(' • ')}</span>
                                                </div>
                                            )}

                                            {/* Local Tips */}
                                            {placeInfo.localTips && (
                                                <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                                    💡 <span className="font-medium">Local Tip:</span> {placeInfo.localTips}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600">
                                            {getDefaultPlaceInfo().description}
                                        </p>
                                    )}

                                    {/* Map Actions */}
                                    <div className="mt-3 flex items-center gap-3">
                                        {/* View on Leaflet map */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onFocus();
                                            }}
                                            className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline font-medium"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            View on map
                                        </button>

                                        {/* Open in Google Maps */}
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name + (stop.location ? `, ${stop.location.lat},${stop.location.lng}` : ''))}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
                                        >
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
                                                <circle cx="12" cy="9" r="2.5" fill="#fff" />
                                            </svg>
                                            <span>Google Maps</span>
                                            <svg className="w-2.5 h-2.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M7 17L17 7M17 7H7M17 7V17" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Night Halt Divider */}
            {showNightHalt && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative flex items-center gap-3 my-2 ml-3"
                >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center shadow">
                        <Moon className="w-3 h-3 text-yellow-300" />
                    </div>
                    <div className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <span className="text-xs font-medium text-indigo-800">
                            🌙 Night Halt Suggested
                        </span>
                    </div>
                </motion.div>
            )}
        </>
    );
}
