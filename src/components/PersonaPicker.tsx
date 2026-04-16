'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Persona, PersonaMeta } from '@/types';

interface PersonaTile extends PersonaMeta {
    // Visual-only fields — keep them out of the shared type.
    accentFrom: string;
    accentTo: string;
    iconBg: string;
    iconRing: string;
}

export const PERSONAS: PersonaTile[] = [
    {
        id: 'family',
        name: 'Family Weekend',
        subtitle: 'Safe stops the kids will love',
        emoji: '👨‍👩‍👧',
        vibeChips: ['Kid-safe', 'Heritage', 'Open-air'],
        accentFrom: 'from-emerald-400',
        accentTo: 'to-teal-500',
        iconBg: 'bg-emerald-50',
        iconRing: 'ring-emerald-100',
    },
    {
        id: 'couple',
        name: 'Romantic Escape',
        subtitle: 'Scenic & intimate spots for two',
        emoji: '💑',
        vibeChips: ['Scenic', 'Sunsets', 'Cafes'],
        accentFrom: 'from-rose-400',
        accentTo: 'to-pink-500',
        iconBg: 'bg-rose-50',
        iconRing: 'ring-rose-100',
    },
    {
        id: 'friends',
        name: 'Friends Adventure',
        subtitle: 'High-energy, photo-ready stops',
        emoji: '🧑‍🤝‍🧑',
        vibeChips: ['Adventure', 'Photo-ops', 'Lively'],
        accentFrom: 'from-amber-400',
        accentTo: 'to-orange-500',
        iconBg: 'bg-amber-50',
        iconRing: 'ring-amber-100',
    },
    {
        id: 'solo',
        name: 'Solo Explorer',
        subtitle: 'Offbeat, cultural, flexible',
        emoji: '🧳',
        vibeChips: ['Offbeat', 'Culture', 'Flexible'],
        accentFrom: 'from-indigo-400',
        accentTo: 'to-violet-500',
        iconBg: 'bg-indigo-50',
        iconRing: 'ring-indigo-100',
    },
    {
        id: 'business',
        name: 'Business Quick',
        subtitle: 'Efficient — zero-detour stops',
        emoji: '💼',
        vibeChips: ['Minimal detour', 'Clean', 'Fast'],
        accentFrom: 'from-slate-500',
        accentTo: 'to-gray-700',
        iconBg: 'bg-slate-50',
        iconRing: 'ring-slate-100',
    },
];

interface PersonaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (persona: Persona) => void;
    source?: string;
    destination?: string;
}

export default function PersonaPicker({ isOpen, onClose, onSelect, source, destination }: PersonaPickerProps) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [confirming, setConfirming] = useState<Persona | null>(null);

    // Lock body scroll + Escape-to-close
    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = 'hidden';
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !confirming) onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKey);
        };
    }, [isOpen, onClose, confirming]);

    const handleSelect = (persona: Persona) => {
        setConfirming(persona);
        // Brief confirmation animation before closing
        setTimeout(() => {
            onSelect(persona);
            setConfirming(null);
        }, 400);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
                    onClick={() => !confirming && onClose()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 24 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        className="relative bg-white rounded-[28px] shadow-2xl shadow-slate-900/25 max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative gradient header strip */}
                        <div className="h-1.5 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#F97316]" />

                        {/* Header */}
                        <div className="px-6 md:px-8 pt-6 md:pt-7 pb-4 flex items-start justify-between gap-4 border-b border-gray-100">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-full mb-3">
                                    <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                                    <span className="text-[11px] font-semibold text-[#2563EB] tracking-wide uppercase">Sarathi AI</span>
                                </div>
                                <h2 className="text-2xl md:text-[28px] font-bold text-gray-900 leading-tight">
                                    Who are you travelling with?
                                </h2>
                                <p className="text-gray-500 mt-1.5 text-sm md:text-[15px]">
                                    We&rsquo;ll tailor every stop{source && destination ? ` from ${source} to ${destination}` : ''} to your group.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close persona picker"
                                disabled={!!confirming}
                                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-40"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Tiles grid */}
                        <div className="px-6 md:px-8 py-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {PERSONAS.map((p, idx) => {
                                    const isHover = hoverIndex === idx;
                                    const isConfirming = confirming === p.id;
                                    return (
                                        <motion.button
                                            key={p.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05, duration: 0.3 }}
                                            whileHover={{ y: -3 }}
                                            whileTap={{ scale: 0.985 }}
                                            onMouseEnter={() => setHoverIndex(idx)}
                                            onMouseLeave={() => setHoverIndex(null)}
                                            onClick={() => handleSelect(p.id)}
                                            disabled={!!confirming}
                                            className={`relative text-left p-5 rounded-2xl border transition-all overflow-hidden
                                                ${isConfirming
                                                    ? 'border-[#2563EB] bg-blue-50/70 shadow-lg shadow-blue-200/50'
                                                    : 'border-gray-200 hover:border-transparent hover:shadow-xl hover:shadow-slate-300/40'
                                                }
                                                ${confirming && !isConfirming ? 'opacity-40' : ''}`}
                                        >
                                            {/* Hover gradient border */}
                                            {isHover && !confirming && (
                                                <motion.div
                                                    layoutId="persona-hover-bg"
                                                    className={`absolute inset-0 -z-10 bg-gradient-to-br ${p.accentFrom} ${p.accentTo} opacity-[0.07]`}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                />
                                            )}

                                            {/* Icon bubble */}
                                            <div className={`w-14 h-14 rounded-2xl ${p.iconBg} ring-4 ${p.iconRing} flex items-center justify-center text-3xl mb-4 shadow-sm`}>
                                                <span className="transform group-hover:scale-110 transition-transform">{p.emoji}</span>
                                            </div>

                                            {/* Confirming checkmark overlay */}
                                            <AnimatePresence>
                                                {isConfirming && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-lg"
                                                    >
                                                        <Check className="w-4 h-4" strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <h3 className="font-semibold text-gray-900 text-[15px] leading-tight">{p.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.subtitle}</p>

                                            <div className="flex flex-wrap gap-1.5 mt-3.5">
                                                {p.vibeChips.map((chip) => (
                                                    <span
                                                        key={chip}
                                                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                                                    >
                                                        {chip}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Arrow appears on hover */}
                                            <AnimatePresence>
                                                {isHover && !confirming && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -4 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -4 }}
                                                        className="absolute bottom-4 right-4 text-[#2563EB]"
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Skip note */}
                            <div className="mt-5 text-center">
                                <button
                                    onClick={onClose}
                                    disabled={!!confirming}
                                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors disabled:opacity-40"
                                >
                                    I&rsquo;ll skip personalization
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
