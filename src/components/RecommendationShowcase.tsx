'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIRecommendation, StopBadge } from '@/types';
import { getStopTypeColor, getStopTypeIcon, getStopTypeLabel, formatDistance } from '@/lib/calculateTripStats';
import { Star, Plus, Check, Clock, MapPin, ChevronRight, Sparkles, X } from 'lucide-react';

interface RecommendationShowcaseProps {
    recommendations: AIRecommendation[];
    dontMiss?: AIRecommendation[];
    onAddStop: (recommendation: AIRecommendation) => void;
    addedStopIds: Set<string>;
}

const BADGE_CONFIG: Record<StopBadge, { label: string; color: string; bg: string; icon: string }> = {
    'must-visit': { label: 'Must Visit', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: '🔥' },
    'hidden-gem': { label: 'Hidden Gem', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: '💎' },
    'instagram-worthy': { label: 'Insta-Worthy', color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200', icon: '📸' },
    'family-friendly': { label: 'Family Friendly', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: '👨‍👩‍👧‍👦' },
    'off-the-beaten-path': { label: 'Offbeat', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: '🗺️' },
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    className={`w-3 h-3 ${star <= Math.round(rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                />
            ))}
            <span className="text-xs font-semibold text-gray-600 ml-1">{rating.toFixed(1)}</span>
        </div>
    );
}

function RecommendationCard({
    rec,
    onAdd,
    isAdded,
    index,
}: {
    rec: AIRecommendation;
    onAdd: () => void;
    isAdded: boolean;
    index: number;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const color = getStopTypeColor(rec.type);
    const icon = getStopTypeIcon(rec.type);
    const typeLabel = getStopTypeLabel(rec.type);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`flex-shrink-0 w-[260px] md:w-[280px] rounded-xl border-2 overflow-hidden transition-all ${isAdded
                    ? 'border-green-300 bg-green-50/30'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } shadow-sm hover:shadow-md`}
        >
            {/* Colored header strip */}
            <div
                className="h-1.5"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
            />

            <div className="p-4">
                {/* Type & Rating Row */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className="text-base">{icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
                            {typeLabel}
                        </span>
                    </div>
                    <StarRating rating={rec.rating || 4} />
                </div>

                {/* Name */}
                <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">
                    {rec.name}
                </h4>

                {/* Famous For */}
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                    {rec.famousFor}
                </p>

                {/* Badges */}
                {rec.badges && rec.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {rec.badges.slice(0, 2).map(badge => {
                            const config = BADGE_CONFIG[badge];
                            return (
                                <span
                                    key={badge}
                                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${config.bg} ${config.color}`}
                                >
                                    <span>{config.icon}</span>
                                    {config.label}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Description (expandable) */}
                <div
                    className="cursor-pointer group"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <p className={`text-xs text-gray-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {rec.description}
                    </p>
                    {!isExpanded && rec.description.length > 80 && (
                        <span className="text-[10px] text-blue-500 font-medium group-hover:underline">
                            Read more
                        </span>
                    )}
                </div>

                {/* Why Visit */}
                {isExpanded && rec.whyVisit && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200/50"
                    >
                        <p className="text-xs text-amber-800 font-medium">
                            💡 {rec.whyVisit}
                        </p>
                    </motion.div>
                )}

                {/* Stats Row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>+{rec.detourKm}km</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{rec.suggestedDuration}m</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd();
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAdded
                                ? 'bg-green-500 text-white shadow-green-500/20'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/20 hover:shadow-blue-500/30'
                            } shadow-md`}
                    >
                        {isAdded ? (
                            <>
                                <Check className="w-3 h-3" />
                                Added
                            </>
                        ) : (
                            <>
                                <Plus className="w-3 h-3" />
                                Add
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Best time to visit */}
                {rec.bestTimeToVisit && rec.bestTimeToVisit !== 'anytime' && (
                    <div className="mt-2 text-[10px] text-gray-400 italic">
                        Best visited in the {rec.bestTimeToVisit}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function RecommendationShowcase({
    recommendations,
    dontMiss,
    onAddStop,
    addedStopIds,
}: RecommendationShowcaseProps) {
    const [showAll, setShowAll] = useState(false);

    if (!recommendations || recommendations.length === 0) return null;

    // Show "Don't Miss" items first, then rest
    const topPicks = dontMiss || recommendations.slice(0, 3);
    const allRecs = showAll ? recommendations : recommendations.slice(0, 6);

    return (
        <div className="border-b border-gray-100">
            {/* Section Header */}
            <div className="p-4 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">
                                Sarathi Recommends
                            </h3>
                            <p className="text-[10px] text-gray-500">
                                Tourist attractions along your route
                            </p>
                        </div>
                    </div>
                    {recommendations.length > 6 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                            {showAll ? 'Show less' : `View all ${recommendations.length}`}
                            <ChevronRight className={`w-3 h-3 transition-transform ${showAll ? 'rotate-90' : ''}`} />
                        </button>
                    )}
                </div>

                {/* Don't Miss Banner */}
                {topPicks.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-50 to-amber-50 rounded-lg border border-red-200/50">
                        <span className="text-sm">🔥</span>
                        <span className="text-xs font-semibold text-red-800">
                            Don&apos;t Miss:
                        </span>
                        <span className="text-xs text-red-700">
                            {topPicks.map(p => p.name).join(' · ')}
                        </span>
                    </div>
                )}
            </div>

            {/* Scrollable Cards */}
            <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide">
                {allRecs.map((rec, index) => (
                    <RecommendationCard
                        key={rec.id || index}
                        rec={rec}
                        onAdd={() => onAddStop(rec)}
                        isAdded={addedStopIds.has(rec.id || rec.name)}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}
