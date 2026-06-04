'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Location, SearchParams } from '@/types';
import {
    getPackages, TravelPackage, PackageTripType, PackagePersona,
    TRIP_TYPE_LABEL, PACKAGE_PERSONAS, PERSONA_ORDER,
} from '@/lib/packages';
import PackageCard from '@/components/PackageCard';
import PackageDetailModal from '@/components/PackageDetailModal';

const DEFAULT_SOURCE: Location = { name: 'Bangalore', displayName: 'Bangalore, Karnataka, India', lat: 12.9716, lng: 77.5946 };
const DEFAULT_DEST: Location = { name: 'Mysore', displayName: 'Mysore, Karnataka, India', lat: 12.2958, lng: 76.6394 };

const isPackageType = (t: unknown): t is PackageTripType => t === 'one-way' || t === 'round-trip' || t === 'local';

export default function PackagesPage() {
    const router = useRouter();
    const [tripType, setTripType] = useState<PackageTripType>('round-trip');
    const [source, setSource] = useState<Location>(DEFAULT_SOURCE);
    const [destination, setDestination] = useState<Location | null>(DEFAULT_DEST);
    const [pickupDate, setPickupDate] = useState('');
    const [selected, setSelected] = useState<TravelPackage | null>(null);
    const [activePersona, setActivePersona] = useState<'all' | PackagePersona>('all');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = sessionStorage.getItem('savaari_search');
        if (stored) {
            try {
                const p = JSON.parse(stored) as SearchParams;
                if (isPackageType(p.tripType)) setTripType(p.tripType);
                if (p.source) setSource(p.source);
                setDestination(p.destination ?? null);
                if (p.pickupDate) setPickupDate(p.pickupDate);
            } catch { /* ignore */ }
        }
        setLoaded(true);
    }, []);

    const isLocal = tripType === 'local';
    const destCity = isLocal ? source : (destination ?? DEFAULT_DEST);
    const allPkgs = useMemo(() => getPackages(tripType, source.name, destCity.name), [tripType, source, destCity]);
    const present = PERSONA_ORDER.filter((per) => allPkgs.some((p) => p.persona === per));
    const filtered = activePersona === 'all' ? allPkgs : allPkgs.filter((p) => p.persona === activePersona);

    const heading = isLocal
        ? `${source.name} day packages`
        : `${TRIP_TYPE_LABEL[tripType]} packages to ${destCity.name}`;

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Sticky route header */}
            <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#2563EB]">{TRIP_TYPE_LABEL[tripType]}</span>
                    <div className="flex items-center gap-2 text-gray-800">
                        <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-white" /></div>
                        <span className="font-semibold">{source.name}</span>
                        {!isLocal && (
                            <>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold">{destCity.name}</span>
                            </>
                        )}
                    </div>
                    {pickupDate && (
                        <span className="ml-auto flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 text-[#2563EB]" />
                            {new Date(pickupDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{heading}</h1>
                <p className="text-gray-500 mt-1 mb-6">Pick a curated trip — choose your car and book in a couple of taps.</p>

                {/* Category filters */}
                {loaded && allPkgs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-7">
                        <button
                            onClick={() => setActivePersona('all')}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activePersona === 'all' ? 'bg-[#2563EB] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            All <span className="opacity-70">({allPkgs.length})</span>
                        </button>
                        {present.map((per) => {
                            const m = PACKAGE_PERSONAS[per];
                            const n = allPkgs.filter((p) => p.persona === per).length;
                            const active = activePersona === per;
                            return (
                                <button
                                    key={per}
                                    onClick={() => setActivePersona(per)}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${active ? `${m.solid} text-white shadow-md` : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                >
                                    {m.emoji} {m.label} <span className="opacity-70">({n})</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {!loaded ? null : allPkgs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-3">🧳</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">No packages for this route yet</h3>
                        <p className="text-gray-500 mb-4">Right now we have <b>Bangalore ⇄ Mysore</b> (one-way &amp; round-trip) and <b>Local Bangalore / Mysore</b>. Try one of those.</p>
                        <button onClick={() => router.push('/')} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium">Back to search</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((p, i) => <PackageCard key={p.id} pkg={p} index={i} onSelect={setSelected} />)}
                    </div>
                )}
            </div>

            <PackageDetailModal
                isOpen={!!selected}
                pkg={selected}
                source={source}
                destination={destCity}
                pickupDate={pickupDate || new Date().toISOString().split('T')[0]}
                onClose={() => setSelected(null)}
            />
        </div>
    );
}
