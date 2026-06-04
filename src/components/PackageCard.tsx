'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, ArrowRight } from 'lucide-react';
import {
    TravelPackage,
    PackageTheme,
    packageHeroAttraction,
    packageAttractionCount,
    packageAvgRating,
    packagePriceFrom,
} from '@/lib/packages';
import { formatCurrency } from '@/lib/calculateTripStats';

const THEME_STYLE: Record<PackageTheme, { chip: string; emoji: string }> = {
    Express: { chip: 'bg-amber-100 text-amber-700', emoji: '⚡' },
    Heritage: { chip: 'bg-orange-100 text-orange-700', emoji: '🏛️' },
    Family: { chip: 'bg-emerald-100 text-emerald-700', emoji: '👨‍👩‍👧' },
    Nature: { chip: 'bg-green-100 text-green-700', emoji: '🌿' },
};

interface PackageCardProps {
    pkg: TravelPackage;
    onSelect: (pkg: TravelPackage) => void;
    index?: number;
}

export default function PackageCard({ pkg, onSelect, index = 0 }: PackageCardProps) {
    const [photo, setPhoto] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const hero = packageHeroAttraction(pkg);
        if (!hero) return;
        fetch('/api/google/place-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: `${hero.name}, ${pkg.to}` }),
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => { if (!cancelled && d?.photoUrl) setPhoto(d.photoUrl); })
            .catch(() => { });
        return () => { cancelled = true; };
    }, [pkg]);

    const count = packageAttractionCount(pkg);
    const rating = packageAvgRating(pkg);
    const from = packagePriceFrom(pkg);
    const theme = THEME_STYLE[pkg.theme];
    const durLabel = pkg.nights > 0 ? `${pkg.durationDays}D / ${pkg.nights}N` : 'Day Trip';

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            whileHover={{ y: -4 }}
            onClick={() => onSelect(pkg)}
            className="group text-left bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/60 border border-gray-100 hover:shadow-xl transition-all flex flex-col"
        >
            <div className="relative h-44 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-5xl">{theme.emoji}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${theme.chip}`}>{theme.emoji} {pkg.theme}</span>
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/40 backdrop-blur px-2.5 py-1 rounded-full">{durLabel}</span>
                <span className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-bold text-white bg-black/40 backdrop-blur px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{rating}
                </span>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{pkg.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pkg.summary}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {pkg.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t}</span>
                    ))}
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{count} stops</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pkg.durationDays} {pkg.durationDays > 1 ? 'days' : 'day'}</span>
                </div>
                <div className="mt-auto pt-4 flex items-end justify-between">
                    <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">From</div>
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(from)}</div>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-[#2563EB] group-hover:gap-2 transition-all">View <ArrowRight className="w-4 h-4" /></span>
                </div>
            </div>
        </motion.button>
    );
}
