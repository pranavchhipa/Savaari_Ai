'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Check, Star, Users, Loader2, CreditCard } from 'lucide-react';
import { Location, Car, Stop } from '@/types';
import { TravelPackage, resolvePackageDay, packagePrice, packageHeroAttraction, PACKAGE_PERSONAS } from '@/lib/packages';
import { sampleCars } from '@/lib/cars';
import { formatCurrency, getStopTypeIcon } from '@/lib/calculateTripStats';
import BookingModal from './BookingModal';

const GoogleMap = dynamic(() => import('./GoogleMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
        </div>
    ),
});

interface Props {
    isOpen: boolean;
    pkg: TravelPackage | null;
    source: Location;
    destination: Location;
    pickupDate: string;
    onClose: () => void;
}

export default function PackageDetailModal({ isOpen, pkg, source, destination, pickupDate, onClose }: Props) {
    const [selectedCar, setSelectedCar] = useState<Car>(sampleCars[0]);
    const [photos, setPhotos] = useState<Record<string, string>>({});
    const [showBooking, setShowBooking] = useState(false);

    const days = useMemo(() => (pkg ? pkg.days.map((d) => ({ ...d, attractions: resolvePackageDay(d) })) : []), [pkg]);
    const allAttractions = useMemo(() => days.flatMap((d) => d.attractions), [days]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => { if (isOpen) setSelectedCar(sampleCars[0]); }, [isOpen, pkg]);

    useEffect(() => {
        if (!isOpen || !pkg || allAttractions.length === 0) return;
        let cancelled = false;
        const items = [...allAttractions];
        let idx = 0;
        const worker = async () => {
            while (idx < items.length && !cancelled) {
                const a = items[idx++];
                try {
                    const r = await fetch('/api/google/place-photo', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: `${a.name}, ${pkg.to}` }),
                    });
                    if (r.ok) { const j = await r.json(); if (j.photoUrl && !cancelled) setPhotos((p) => ({ ...p, [a.id]: j.photoUrl })); }
                } catch { /* ignore */ }
            }
        };
        Promise.all(Array.from({ length: Math.min(3, items.length) }, worker));
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, pkg, allAttractions]);

    if (!pkg) return null;

    const persona = PACKAGE_PERSONAS[pkg.persona];
    const stats = packagePrice(pkg, selectedCar);
    const hero = packageHeroAttraction(pkg);
    const heroPhoto = hero ? photos[hero.id] : undefined;
    const isLocal = pkg.tripType === 'local';
    const durLabel = isLocal ? 'Day Trip' : pkg.nights > 0 ? `${pkg.durationDays}D / ${pkg.nights}N` : '1 Day';
    const routeLabel = isLocal ? source.name : `${source.name} → ${destination.name}`;

    const mapStops: Stop[] = allAttractions.map((a) => ({
        id: a.id, name: a.name, type: a.type,
        location: { name: a.name, displayName: a.famousFor || a.name, lat: a.lat, lng: a.lng },
        duration: a.suggestedDuration, isSelected: true, rating: a.rating, photoUrl: photos[a.id],
    }));
    const mapCoords = mapStops.map((s) => ({ lat: s.location.lat, lng: s.location.lng }));
    const bookingStops: Stop[] = allAttractions.map((a) => ({
        id: a.id, name: a.name, type: a.type,
        location: { name: a.name, displayName: a.name, lat: a.lat, lng: a.lng }, duration: a.suggestedDuration,
    }));

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex flex-col bg-white md:inset-4 md:rounded-2xl md:shadow-2xl md:m-auto md:max-w-5xl md:max-h-[95vh]"
                        >
                            <div className="relative h-40 flex-shrink-0 bg-slate-300 md:rounded-t-2xl overflow-hidden">
                                {heroPhoto ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={heroPhoto} alt={pkg.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                                <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-lg text-white"><X className="w-5 h-5" /></button>
                                <div className="absolute bottom-3 left-4 right-4 text-white">
                                    <div className="flex items-center gap-2 text-xs mb-1.5">
                                        <span className={`px-2 py-0.5 rounded-full ${persona.chip}`}>{persona.emoji} {persona.label}</span>
                                        <span className="bg-white/25 px-2 py-0.5 rounded-full">{durLabel}</span>
                                        <span>{routeLabel}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold drop-shadow">{pkg.title}</h2>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="p-4 md:p-6">
                                    <p className="text-gray-600 text-sm">{pkg.tagline}</p>

                                    <div className="flex flex-col lg:flex-row gap-6 mt-5">
                                        <div className="lg:w-3/5 space-y-4">
                                            <h3 className="font-bold text-gray-900">Your itinerary</h3>
                                            {days.map((d) => (
                                                <div key={d.day} className="rounded-xl border border-gray-200 overflow-hidden">
                                                    <div className="bg-slate-50 px-4 py-2 flex items-center gap-2 border-b border-gray-100">
                                                        <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center">{d.day}</span>
                                                        <span className="font-semibold text-sm text-gray-800">{isLocal ? d.title : `Day ${d.day}`}</span>
                                                        {!isLocal && <span className="text-gray-400 text-xs">· {d.title}</span>}
                                                    </div>
                                                    <div className="divide-y divide-gray-50">
                                                        {d.attractions.map((a) => (
                                                            <div key={a.id} className="flex gap-3 items-center p-3">
                                                                {photos[a.id] ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img src={photos[a.id]} alt={a.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                                                                ) : (
                                                                    <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">{getStopTypeIcon(a.type)}</div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="font-semibold text-sm text-gray-800 truncate">{a.name}</span>
                                                                        {typeof a.rating === 'number' && (
                                                                            <span className="flex items-center gap-0.5 text-amber-500 text-xs flex-shrink-0"><Star className="w-3 h-3 fill-current" />{a.rating.toFixed(1)}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-[11px] text-gray-500 line-clamp-1">{a.suggestedDuration} min · {a.famousFor || a.description}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                <div className="rounded-xl border border-green-100 bg-green-50/50 p-3">
                                                    <h4 className="text-xs font-bold text-green-800 mb-2">Included</h4>
                                                    <ul className="space-y-1.5">{pkg.inclusions.map((x) => (
                                                        <li key={x} className="flex items-start gap-1.5 text-xs text-gray-700"><Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />{x}</li>
                                                    ))}</ul>
                                                </div>
                                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                                    <h4 className="text-xs font-bold text-gray-700 mb-2">Not included</h4>
                                                    <ul className="space-y-1.5">{pkg.exclusions.map((x) => (
                                                        <li key={x} className="flex items-start gap-1.5 text-xs text-gray-500"><X className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />{x}</li>
                                                    ))}</ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:w-2/5 h-[260px] lg:h-auto lg:min-h-[420px] rounded-xl overflow-hidden">
                                            <GoogleMap routeCoordinates={mapCoords} stops={mapStops} tripType="package" />
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="font-bold text-gray-900 mb-3">Choose your car</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {sampleCars.map((car) => {
                                                const price = packagePrice(pkg, car).totalFare;
                                                const sel = selectedCar.id === car.id;
                                                return (
                                                    <button key={car.id} onClick={() => setSelectedCar(car)} className={`text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${sel ? 'border-[#2563EB] bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${sel ? 'border-[#2563EB] bg-[#2563EB]' : 'border-gray-300'}`}>{sel && <Check className="w-3 h-3 text-white" />}</div>
                                                        <div className="relative w-16 h-11 flex-shrink-0">
                                                            <Image src={car.image} alt={car.name} fill className="object-contain" sizes="64px" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-sm text-gray-800 truncate">{car.name}</div>
                                                            <div className="text-[11px] text-gray-500 flex items-center gap-2">
                                                                <span>{car.type}</span>
                                                                <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{car.seats}</span>
                                                                <span className="flex items-center gap-0.5 text-amber-500"><Star className="w-3 h-3 fill-current" />{car.rating}</span>
                                                            </div>
                                                        </div>
                                                        <div className="font-bold text-sm text-gray-900">{formatCurrency(price)}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3 flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs text-gray-500">{selectedCar.name} · {durLabel} · all-in</div>
                                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalFare)}</div>
                                </div>
                                <button onClick={() => setShowBooking(true)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all">
                                    <CreditCard className="w-5 h-5" />Confirm Booking
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BookingModal
                isOpen={showBooking}
                onClose={() => setShowBooking(false)}
                source={source}
                destination={destination}
                car={selectedCar}
                tripType="package"
                tripStats={stats}
                selectedStops={bookingStops}
                pickupDate={pickupDate}
                pickupTime="07:00"
            />
        </>
    );
}
