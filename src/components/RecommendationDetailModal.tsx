'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Star,
    Clock,
    MapPin,
    Route,
    Calendar,
    Plus,
    Check,
    Sparkles,
    Camera,
} from 'lucide-react';
import { AIRecommendation } from '@/types';

interface RecommendationDetailModalProps {
    recommendation: AIRecommendation | null;
    isOpen: boolean;
    onClose: () => void;
    onAddStop: (rec: AIRecommendation) => void;
    isAdded: boolean;
}

// Map stop type to emoji and label
const typeInfo: Record<string, { emoji: string; label: string; color: string }> = {
    heritage: { emoji: '🏛️', label: 'Heritage', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    nature: { emoji: '🌿', label: 'Nature', color: 'bg-green-50 text-green-700 border-green-200' },
    viewpoint: { emoji: '🌅', label: 'Viewpoint', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    food: { emoji: '🍛', label: 'Food', color: 'bg-red-50 text-red-700 border-red-200' },
    restaurant: { emoji: '🍽️', label: 'Restaurant', color: 'bg-red-50 text-red-700 border-red-200' },
    adventure: { emoji: '🏔️', label: 'Adventure', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    temple: { emoji: '🕌', label: 'Temple', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    beach: { emoji: '🏖️', label: 'Beach', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    waterfall: { emoji: '💧', label: 'Waterfall', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    museum: { emoji: '🏛️', label: 'Museum', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    default: { emoji: '📍', label: 'Place', color: 'bg-gray-50 text-gray-700 border-gray-200' },
};

function getTypeInfo(type: string) {
    return typeInfo[type] || typeInfo.default;
}

export default function RecommendationDetailModal({
    recommendation: rec,
    isOpen,
    onClose,
    onAddStop,
    isAdded,
}: RecommendationDetailModalProps) {
    if (!rec) return null;

    const info = getTypeInfo(rec.type);
    const photoUrl = rec.photoUrl;
    const hasPhoto = !!photoUrl;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    {/* Modal - slides up from bottom on mobile, centered on desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-[60] md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg"
                    >
                        <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                            {/* Hero Image or Gradient */}
                            <div className="relative h-48 md:h-56 flex-shrink-0">
                                {hasPhoto ? (
                                    <img
                                        src={photoUrl}
                                        alt={rec.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center">
                                        <Camera className="w-12 h-12 text-white/40" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-3 right-3 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>

                                {/* Drag indicator on mobile */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/40 rounded-full md:hidden" />

                                {/* Name overlay */}
                                <div className="absolute bottom-3 left-4 right-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${info.color}`}>
                                            {info.emoji} {info.label}
                                        </span>
                                        {rec.rating > 0 && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                {rec.rating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-white drop-shadow-lg">{rec.name}</h2>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Badges */}
                                {rec.badges && rec.badges.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {rec.badges.map((badge, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium border border-indigo-100"
                                            >
                                                <Sparkles className="w-3 h-3 inline mr-1" />
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{rec.description}</p>
                                </div>

                                {/* Why Visit */}
                                {rec.whyVisit && (
                                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                        <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Why Visit</h4>
                                        <p className="text-sm text-gray-700">{rec.whyVisit}</p>
                                    </div>
                                )}

                                {/* Famous For */}
                                {rec.famousFor && (
                                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                                        <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Famous For</h4>
                                        <p className="text-sm text-gray-700">{rec.famousFor}</p>
                                    </div>
                                )}

                                {/* Quick Info Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                                        <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <p className="text-sm font-semibold text-gray-800">{rec.suggestedDuration}min</p>
                                        <p className="text-[10px] text-gray-500">Duration</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                                        <Route className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <p className="text-sm font-semibold text-gray-800">{rec.detourKm}km</p>
                                        <p className="text-[10px] text-gray-500">Detour</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                                        <MapPin className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                        <p className="text-sm font-semibold text-gray-800">{Math.round(rec.approximateKm)}km</p>
                                        <p className="text-[10px] text-gray-500">From Start</p>
                                    </div>
                                </div>

                                {/* Best Time */}
                                {rec.bestTimeToVisit && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50/50 rounded-xl border border-green-100">
                                        <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <div>
                                            <span className="text-xs font-medium text-green-700">Best Time to Visit: </span>
                                            <span className="text-xs text-gray-600">{rec.bestTimeToVisit}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer CTA */}
                            <div className="p-4 border-t border-gray-100 flex-shrink-0">
                                <button
                                    onClick={() => {
                                        onAddStop(rec);
                                        if (!isAdded) onClose();
                                    }}
                                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isAdded
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isAdded ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Added to Trip — Tap to Remove
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Add to My Trip
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
