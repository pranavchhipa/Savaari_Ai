'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import {
    TravelPackage,
    PACKAGE_PERSONAS,
    packageHeroAttraction,
    packageAttractionCount,
    packagePriceFrom,
} from '@/lib/packages';
import { formatCurrency } from '@/lib/calculateTripStats';

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

    const persona = PACKAGE_PERSONAS[pkg.persona];
    const count = packageAttractionCount(pkg);
    const from = packagePriceFrom(pkg);
    const durLabel = pkg.tripType === 'local' ? 'Day Trip' : pkg.nights > 0 ? `${pkg.durationDays}D / ${pkg.nights}N` : '1 Day';

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -6 }}
            onClick={() => onSelect(pkg)}
            className="group text-left bg-white rounded-2xl overflow-hidden shadow-lg shadow-slate-300/40 hover:shadow-2xl hover:shadow-slate-400/40 border border-gray-100 transition-all duration-300 flex flex-col"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-5xl">{persona.emoji}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

                {/* Prominent category label */}
                <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 ${persona.solid} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ring-2 ring-white/30`}>
                    <span className="text-sm leading-none">{persona.emoji}</span>{persona.label}
                </span>

                {/* Duration */}
                <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-black/45 backdrop-blur px-2.5 py-1 rounded-full">{durLabel}</span>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-lg leading-snug">{pkg.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{pkg.tagline}</p>

                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{count} stops</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pkg.durationDays} {pkg.durationDays > 1 ? 'days' : 'day'}</span>
                </div>

                <div className="mt-auto pt-4 mt-4 flex items-end justify-between border-t border-gray-100">
                    <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">From</div>
                        <div className="text-xl font-extrabold text-gray-900">{formatCurrency(from)}</div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-md shadow-blue-500/20 group-hover:bg-[#1D4ED8] group-hover:gap-2.5 transition-all">
                        View details <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </div>
        </motion.button>
    );
}
