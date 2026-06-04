'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { Location, SearchParams } from '@/types';
import { getPackagesForRoute, TravelPackage } from '@/lib/packages';
import PackageCard from '@/components/PackageCard';
import PackageDetailModal from '@/components/PackageDetailModal';

const DEFAULT_SOURCE: Location = { name: 'Bangalore', displayName: 'Bangalore, Karnataka, India', lat: 12.9716, lng: 77.5946 };
const DEFAULT_DEST: Location = { name: 'Mysore', displayName: 'Mysore, Karnataka, India', lat: 12.2958, lng: 76.6394 };

export default function PackagesPage() {
    const router = useRouter();
    const [source, setSource] = useState<Location>(DEFAULT_SOURCE);
    const [destination, setDestination] = useState<Location>(DEFAULT_DEST);
    const [pickupDate, setPickupDate] = useState('');
    const [selected, setSelected] = useState<TravelPackage | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = sessionStorage.getItem('savaari_search');
        if (stored) {
            try {
                const p = JSON.parse(stored) as SearchParams;
                if (p.source) setSource(p.source);
                if (p.destination) setDestination(p.destination);
                if (p.pickupDate) setPickupDate(p.pickupDate);
            } catch { /* ignore */ }
        }
        setLoaded(true);
    }, []);

    const packages = useMemo(() => getPackagesForRoute(source.name, destination.name), [source, destination]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Sticky route header */}
            <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2 text-gray-800">
                        <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-white" /></div>
                        <span className="font-semibold">{source.name}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{destination.name}</span>
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
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Curated {destination.name} packages</h1>
                </div>
                <p className="text-gray-500 mb-6 ml-11">Handpicked trips — pick one, choose your car, and you&apos;re set.</p>

                {!loaded ? null : packages.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-3">🧳</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">No curated packages for this route yet</h3>
                        <p className="text-gray-500 mb-4">We currently have packages for <b>Bangalore → Mysore</b>. Try that route, or build a custom trip.</p>
                        <button onClick={() => router.push('/listing')} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium">Build a custom trip</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((p, i) => <PackageCard key={p.id} pkg={p} index={i} onSelect={setSelected} />)}
                    </div>
                )}
            </div>

            <PackageDetailModal
                isOpen={!!selected}
                pkg={selected}
                source={source}
                destination={destination}
                pickupDate={pickupDate || new Date().toISOString().split('T')[0]}
                onClose={() => setSelected(null)}
            />
        </div>
    );
}
