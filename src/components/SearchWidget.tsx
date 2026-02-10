'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Calendar, Clock, ChevronDown, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location } from '@/types';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

type TripTab = 'one-way' | 'round-trip';

export default function SearchWidget() {
    const router = useRouter();
    const [source, setSource] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [sourceQuery, setSourceQuery] = useState('');
    const [destQuery, setDestQuery] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [dropDate, setDropDate] = useState('');
    const [pickupTime, setPickupTime] = useState('07:00');
    const [tripTab, setTripTab] = useState<TripTab>('one-way');
    const [isLoading, setIsLoading] = useState(false);

    // Set default dates
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setPickupDate(tomorrow.toISOString().split('T')[0]);

        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);
        setDropDate(dayAfter.toISOString().split('T')[0]);
    }, []);

    const swapLocations = () => {
        const tempSource = source;
        const tempQuery = sourceQuery;
        setSource(destination);
        setSourceQuery(destQuery);
        setDestination(tempSource);
        setDestQuery(tempQuery);
    };

    const handleSourceSelect = (location: Location) => {
        setSource(location);
        setSourceQuery(location.name);
    };

    const handleDestSelect = (location: Location) => {
        setDestination(location);
        setDestQuery(location.name);
    };

    const handleSubmit = () => {
        if (!source || !destination) {
            if (!source && !destination) {
                alert('Please select pickup and drop locations');
                return;
            }
            if (!source) {
                alert('Please select a pickup location');
                return;
            }
            if (!destination) {
                alert('Please select a drop location');
                return;
            }
        }

        setIsLoading(true);

        const searchParams = {
            source,
            destination,
            pickupDate,
            tripType: tripTab,
            dropDate: tripTab === 'round-trip' ? dropDate : undefined,
            pickupTime,
        };
        sessionStorage.setItem('savaari_search', JSON.stringify(searchParams));
        router.push('/listing');
    };

    // Generate time options
    const timeOptions = Array.from({ length: 48 }).map((_, i) => {
        const h = Math.floor(i / 2);
        const m = i % 2 === 0 ? '00' : '30';
        const time = `${h.toString().padStart(2, '0')}:${m}`;
        const label = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        return { value: time, label };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-4xl mx-auto"
        >
            {/* Compact Trip Type Toggle */}
            <div className="flex justify-center mb-0">
                <div className="inline-flex bg-white rounded-t-2xl overflow-hidden border border-gray-200/60 border-b-0 shadow-sm">
                    {(['one-way', 'round-trip'] as TripTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setTripTab(tab)}
                            className={`relative px-8 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 ${tripTab === tab
                                    ? 'text-[#2563EB]'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab === 'one-way' ? 'One Way' : 'Round Trip'}
                            {tripTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#2563EB] rounded-full"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Form Card */}
            <div className="bg-white rounded-2xl rounded-t-none shadow-xl shadow-gray-200/60 border border-gray-200/60 border-t-0 overflow-visible">
                {/* Row 1: Locations */}
                <div className="p-6 pb-0">
                    <div className="flex flex-col md:flex-row items-stretch gap-0 relative">
                        {/* FROM */}
                        <div className="flex-1 min-w-0">
                            <GooglePlacesAutocomplete
                                label="From"
                                placeholder="Enter pickup city"
                                defaultValue={sourceQuery}
                                onPlaceSelect={handleSourceSelect}
                                iconColor="#2563EB"
                            />
                        </div>

                        {/* Swap Button - Desktop */}
                        <div className="hidden md:flex items-end justify-center px-2 pb-2">
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={swapLocations}
                                className="w-9 h-9 bg-gray-50 hover:bg-[#2563EB] hover:text-white rounded-full flex items-center justify-center text-gray-400 border border-gray-200 hover:border-[#2563EB] transition-all duration-300"
                            >
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                            </motion.button>
                        </div>

                        {/* Mobile Swap */}
                        <div className="md:hidden flex justify-center -my-1.5 relative z-10">
                            <motion.button
                                whileTap={{ rotate: 180 }}
                                onClick={swapLocations}
                                className="p-2 bg-white rounded-full shadow-md border border-gray-100 text-[#2563EB]"
                            >
                                <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
                            </motion.button>
                        </div>

                        {/* TO */}
                        <div className="flex-1 min-w-0">
                            <GooglePlacesAutocomplete
                                label="To"
                                placeholder="Enter destination city"
                                defaultValue={destQuery}
                                onPlaceSelect={handleDestSelect}
                                iconColor="#F97316"
                            />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="mx-6 my-4 border-t border-gray-100" />

                {/* Row 2: Date & Time */}
                <div className="px-6 pb-6">
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        {/* PICK UP DATE */}
                        <div className="flex-1 min-w-0 w-full">
                            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                                Pickup Date
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#2563EB]/60">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <input
                                    type="date"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/40 focus:bg-white transition-all cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* RETURN DATE (Round Trip only) */}
                        <AnimatePresence>
                            {tripTab === 'round-trip' && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                                    animate={{ opacity: 1, width: 'auto', marginLeft: 0 }}
                                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                    className="flex-1 min-w-0 w-full overflow-hidden"
                                >
                                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                                        Return Date
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F97316]/60">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="date"
                                            value={dropDate}
                                            onChange={(e) => setDropDate(e.target.value)}
                                            min={pickupDate}
                                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]/15 focus:border-[#F97316]/40 focus:bg-white transition-all cursor-pointer"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* PICK UP TIME */}
                        <div className="flex-1 min-w-0 w-full">
                            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                                Pickup Time
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#2563EB]/60">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <select
                                    value={pickupTime}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                    className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/40 focus:bg-white transition-all cursor-pointer appearance-none"
                                >
                                    {timeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* SEARCH BUTTON */}
                        <div className="w-full md:w-auto">
                            <label className="block text-[11px] font-semibold text-transparent uppercase tracking-widest mb-2 select-none">
                                Search
                            </label>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full md:w-auto px-10 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#FB923C] hover:to-[#F97316] text-white rounded-xl font-semibold text-sm tracking-wide shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-70"
                            >
                                {/* Shimmer */}
                                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-scout-shimmer" />

                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                                <span>{isLoading ? 'Searching...' : 'Explore Cabs'}</span>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Powered by AI strip */}
                <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50/50 border-t border-gray-100 rounded-b-2xl">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <Sparkles className="w-3 h-3 text-[#F97316]" />
                        <span>Powered by <span className="font-semibold text-gray-500">Sarathi AI™</span> — Smart routes & handpicked attractions</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
