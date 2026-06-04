'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { Location, SearchParams } from '@/types';
import { getPackages, TravelPackage, PackageTripType, TRIP_TYPE_LABEL } from '@/lib/packages';
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
    const packages = useMemo(
        () => getPackages(tripType, source.name, destCity.name),
        [tripType, source, destCity],
    );

    const heading = isLocal
        ? `${source.name} day packages`
        : `${TRIP_TYPE_LABEL[tripType]} packages to ${destCity.name}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Sticky header */}
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
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
                </div>
                <p className="text-gray-500 mb-6 ml-11">Pick a curated trip — choose your car and book in a couple of taps.</p>

                {!loaded ? null : packages.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-3">🧳</div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">No packages for this route yet</h3>
                        <p className="text-gray-500 mb-4">Right now we have <b>Bangalore ⇄ Mysore</b> (one-way &amp; round-trip) and <b>Local Bangalore / Mysore</b>. Try one of those.</p>
                        <button onClick={() => router.push('/')} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium">Back to search</button>
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
                destination={destCity}
                pickupDate={pickupDate || new Date().toISOString().split('T')[0]}
                onClose={() => setSelected(null)}
            />
        </div>
    );
}
