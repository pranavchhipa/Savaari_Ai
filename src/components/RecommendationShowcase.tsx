'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIRecommendation, StopBadge } from '@/types';
import { getStopTypeColor, getStopTypeIcon, getStopTypeLabel, formatDistance } from '@/lib/calculateTripStats';
import { Star, Plus, Check, Clock, MapPin, ChevronRight, Sparkles, X, Camera, Info } from 'lucide-react';
import RecommendationDetailModal from './RecommendationDetailModal';

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

function RecommendationCard({
    rec,
    onAdd,
    isAdded,
    index,
    onViewDetails,
}: {
    rec: AIRecommendation;
    onAdd: () => void;
    isAdded: boolean;
    index: number;
    onViewDetails: () => void;
}) {
    const color = getStopTypeColor(rec.type);
    const icon = getStopTypeIcon(rec.type);
    const typeLabel = getStopTypeLabel(rec.type);
    const hasPhoto = !!rec.photoUrl;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`flex-shrink-0 w-64 h-80 rounded-xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-xl transition-all ${isAdded ? 'ring-2 ring-green-500' : ''
                }`}
            onClick={onViewDetails}
        >
            {/* Background Image / Placeholder */}
            {hasPhoto ? (
                <img
                    src={rec.photoUrl}
                    alt={rec.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradientForType(rec.type)}`}>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-white/30" />
                    </div>
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

            {/* Top Right Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd();
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all ${isAdded
                        ? 'bg-green-500 text-white'
                        : 'bg-white/90 text-gray-700 hover:bg-blue-600 hover:text-white'
                        }`}
                >
                    {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
            </div>

            {/* Top Left Badge */}
            {rec.badges && rec.badges.length > 0 && (
                <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-gray-800 backdrop-blur-md shadow-sm">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {BADGE_CONFIG[rec.badges[0]]?.label || rec.badges[0]}
                    </span>
                </div>
            )}

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center gap-2 mb-1.5 opacity-90">
                    <span className="text-lg">{icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">{typeLabel}</span>
                    <span className="mx-1">•</span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{rec.rating.toFixed(1)}</span>
                    </div>
                </div>

                <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2 text-white">
                    {rec.name}
                </h3>

                <p className="text-xs text-gray-300 line-clamp-1 mb-3">
                    {rec.famousFor || rec.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rec.suggestedDuration}m
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            +{rec.detourKm}km
                        </span>
                    </div>
                    <span className="text-xs font-medium text-blue-200 group-hover:text-white flex items-center gap-0.5 transition-colors">
                        Details <ChevronRight className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// Helper for type gradients
function getGradientForType(type: string): string {
    switch (type) {
        case 'nature': return 'from-green-400 to-emerald-600';
        case 'heritage': return 'from-amber-400 to-orange-600';
        case 'waterfall': return 'from-cyan-400 to-blue-600';
        case 'beach': return 'from-sky-400 to-blue-600';
        case 'temple': return 'from-orange-400 to-red-600';
        case 'adventure': return 'from-red-400 to-rose-600';
        case 'food': return 'from-yellow-400 to-orange-500';
        default: return 'from-slate-400 to-slate-600';
    }
}

export default function RecommendationShowcase({
    recommendations,
    dontMiss,
    onAddStop,
    addedStopIds,
}: RecommendationShowcaseProps) {
    const [showAll, setShowAll] = useState(false);
    const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);

    if (!recommendations || recommendations.length === 0) return null;

    // Show "Don't Miss" items first, then rest
    const topPicks = dontMiss || recommendations.slice(0, 3);
    const allRecs = showAll ? recommendations : recommendations.slice(0, 6);

    return (
        <div className="border-b border-gray-100 pb-2">
            {/* Section Header */}
            <div className="p-4 pb-3">
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
                        <span className="text-xs text-red-700 line-clamp-1">
                            {topPicks.map(p => p.name).join(' · ')}
                        </span>
                    </div>
                )}
            </div>

            {/* Scrollable Cards */}
            <div className="flex gap-4 overflow-x-auto px-4 pb-6 scrollbar-hide pt-2">
                {allRecs.map((rec, index) => (
                    <RecommendationCard
                        key={rec.id || index}
                        rec={rec}
                        onAdd={() => onAddStop(rec)}
                        isAdded={addedStopIds.has(rec.id || rec.name)}
                        index={index}
                        onViewDetails={() => setSelectedRec(rec)}
                    />
                ))}
            </div>

            {/* Detail Modal */}
            <RecommendationDetailModal
                recommendation={selectedRec}
                isOpen={!!selectedRec}
                onClose={() => setSelectedRec(null)}
                onAddStop={(rec) => {
                    onAddStop(rec);
                    // Optional: Close modal after adding? Maybe keep open to allow "view added" state
                }}
                isAdded={selectedRec ? addedStopIds.has(selectedRec.id || selectedRec.name) : false}
            />
        </div>
    );
}
