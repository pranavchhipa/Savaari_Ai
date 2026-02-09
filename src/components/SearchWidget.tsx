'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, ArrowRight, Search, X, ArrowLeftRight, ArrowUpDown, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location } from '@/types';
import { searchLocations, popularCities } from '@/lib/geocoding';

export default function SearchWidget() {
    const router = useRouter();
    const [source, setSource] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [sourceQuery, setSourceQuery] = useState('');
    const [destQuery, setDestQuery] = useState('');
    const [sourceSuggestions, setSourceSuggestions] = useState<Location[]>([]);
    const [destSuggestions, setDestSuggestions] = useState<Location[]>([]);
    const [showSourceDropdown, setShowSourceDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);
    const [pickupDate, setPickupDate] = useState('');
    const [dropDate, setDropDate] = useState('');
    const [pickupTime, setPickupTime] = useState('09:00');
    const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
    const [isLoading, setIsLoading] = useState(false);

    const sourceRef = useRef<HTMLDivElement>(null);
    const destRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>(undefined);

    // Set default pickup date to tomorrow
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setPickupDate(tomorrow.toISOString().split('T')[0]);

        // Default return date to day after tomorrow
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);
        setDropDate(dayAfter.toISOString().split('T')[0]);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sourceRef.current && !sourceRef.current.contains(e.target as Node)) {
                setShowSourceDropdown(false);
            }
            if (destRef.current && !destRef.current.contains(e.target as Node)) {
                setShowDestDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [sourceRef, destRef]);

    // Debounced search for source
    const handleSourceSearch = useCallback(async (query: string) => {
        setSourceQuery(query);
        setSource(null);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.length < 2) {
            setSourceSuggestions(popularCities.slice(0, 5));
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            const results = await searchLocations(query);
            setSourceSuggestions(results.length > 0 ? results : popularCities.filter(c =>
                c.name.toLowerCase().includes(query.toLowerCase())
            ));
            setIsLoading(false);
        }, 300);
    }, []);

    // Debounced search for destination
    const handleDestSearch = useCallback(async (query: string) => {
        setDestQuery(query);
        setDestination(null);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.length < 2) {
            setDestSuggestions(popularCities.slice(0, 5));
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            const results = await searchLocations(query);
            setDestSuggestions(results.length > 0 ? results : popularCities.filter(c =>
                c.name.toLowerCase().includes(query.toLowerCase())
            ));
            setIsLoading(false);
        }, 300);
    }, []);

    const selectSource = (location: Location) => {
        setSource(location);
        setSourceQuery(location.name);
        setShowSourceDropdown(false);
    };

    const selectDestination = (location: Location) => {
        setDestination(location);
        setDestQuery(location.name);
        setShowDestDropdown(false);
    };

    const swapLocations = () => {
        const tempSource = source;
        const tempQuery = sourceQuery;
        setSource(destination);
        setSourceQuery(destQuery);
        setDestination(tempSource);
        setDestQuery(tempQuery);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            let finalSource = source;
            let finalDest = destination;

            // Smart Resolve: If user typed but didn't select, try to find the location
            if (!finalSource && sourceQuery.length > 2) {
                const results = await searchLocations(sourceQuery);
                if (results.length > 0) {
                    finalSource = results[0];
                    setSource(finalSource);
                }
            }

            if (!finalDest && destQuery.length > 2) {
                const results = await searchLocations(destQuery);
                if (results.length > 0) {
                    finalDest = results[0];
                    setDestination(finalDest);
                }
            }

            if (!finalSource || !finalDest || !pickupDate) {
                alert('Please select valid locations from the list');
                setIsLoading(false);
                return;
            }

            // Store search params in sessionStorage
            const searchParams = {
                source: finalSource,
                destination: finalDest,
                pickupDate,
                tripType,
                dropDate: tripType === 'round-trip' ? dropDate : undefined,
                pickupTime,
            };
            sessionStorage.setItem('savaari_search', JSON.stringify(searchParams));

            router.push('/listing');
        } catch (error) {
            console.error("Search failed", error);
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-5xl mx-auto"
        >
            {/* Trip Type Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-full inline-flex relative border border-white/50 shadow-sm">
                    {/* Animated Background Pill */}
                    <motion.div
                        className="absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-md z-0"
                        layoutId="activeTab"
                        initial={false}
                        animate={{
                            left: tripType === 'one-way' ? '6px' : '50%',
                            right: tripType === 'one-way' ? '50%' : '6px',
                            width: 'calc(50% - 12px)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    <button
                        onClick={() => setTripType('one-way')}
                        className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${tripType === 'one-way' ? 'text-[#2563EB]' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        One Way
                    </button>
                    <button
                        onClick={() => setTripType('round-trip')}
                        className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${tripType === 'round-trip' ? 'text-[#2563EB]' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Round Trip
                    </button>
                </div>
            </div>

            {/* Search Form Container */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-visible">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-4 items-center">

                    {/* Source Input */}
                    <div ref={sourceRef} className="md:col-span-4 lg:col-span-5 relative group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                            Pickup Location
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#2563EB] group-focus-within:bg-[#2563EB] group-focus-within:text-white transition-all duration-300 shadow-sm">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={sourceQuery}
                                onChange={(e) => handleSourceSearch(e.target.value)}
                                onFocus={() => {
                                    setShowSourceDropdown(true);
                                    if (!sourceQuery) setSourceSuggestions(popularCities.slice(0, 5));
                                }}
                                placeholder="City, Airport, or Address"
                                className="glass-input w-full pl-16 pr-10 py-4 rounded-xl text-gray-800 placeholder-gray-400 font-medium focus:outline-none"
                            />
                            {sourceQuery && (
                                <button
                                    onClick={() => {
                                        setSourceQuery('');
                                        setSource(null);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Source Dropdown */}
                        <AnimatePresence>
                            {showSourceDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 z-50 max-h-[320px] overflow-y-auto scrollbar-thin"
                                >
                                    {isLoading && !sourceSuggestions.length ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <div className="animate-spin w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-2"></div>
                                            <span className="text-sm">Finding locations...</span>
                                        </div>
                                    ) : sourceSuggestions.length > 0 ? (
                                        <div className="py-2">
                                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                {sourceQuery.length < 2 ? 'Popular Cities' : 'Search Results'}
                                            </div>
                                            {sourceSuggestions.map((location, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => selectSource(location)}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50/80 flex items-center gap-4 transition-all group/item"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover/item:bg-blue-100 group-hover/item:text-blue-600 transition-colors">
                                                        <MapPin className="w-4 h-4 text-gray-400 group-hover/item:text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800">{location.name}</div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                            {location.displayName}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-gray-500">
                                            <MapPin className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                            <p className="text-sm">No locations found</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Swap Button (Desktop) */}
                    <div className="hidden md:flex md:col-span-2 justify-center pt-6 relative z-10">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={swapLocations}
                            className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-500 hover:text-[#2563EB] hover:shadow-blue-200Border border-gray-100 transition-colors"
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                        </motion.button>
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -z-10 hidden" />
                    </div>

                    {/* Swap Button (Mobile) */}
                    <div className="md:hidden flex justify-center -my-3 relative z-10">
                        <motion.button
                            whileTap={{ rotate: 180 }}
                            onClick={swapLocations}
                            className="p-2 bg-white rounded-full shadow-md border border-gray-100 text-[#2563EB]"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Destination Input */}
                    <div ref={destRef} className="md:col-span-4 lg:col-span-5 relative group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                            Drop Location
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#F97316] group-focus-within:bg-[#F97316] group-focus-within:text-white transition-all duration-300 shadow-sm">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={destQuery}
                                onChange={(e) => handleDestSearch(e.target.value)}
                                onFocus={() => {
                                    setShowDestDropdown(true);
                                    if (!destQuery) setDestSuggestions(popularCities.slice(0, 5));
                                }}
                                placeholder="Enter destination"
                                className="glass-input w-full pl-16 pr-10 py-4 rounded-xl text-gray-800 placeholder-gray-400 font-medium focus:outline-none"
                            />
                            {destQuery && (
                                <button
                                    onClick={() => {
                                        setDestQuery('');
                                        setDestination(null);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Destination Dropdown */}
                        <AnimatePresence>
                            {showDestDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 z-50 max-h-[320px] overflow-y-auto scrollbar-thin"
                                >
                                    {isLoading && !destSuggestions.length ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <div className="animate-spin w-6 h-6 border-2 border-[#F97316] border-t-transparent rounded-full mx-auto mb-2"></div>
                                            <span className="text-sm">Finding locations...</span>
                                        </div>
                                    ) : destSuggestions.length > 0 ? (
                                        <div className="py-2">
                                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                {destQuery.length < 2 ? 'Popular Cities' : 'Search Results'}
                                            </div>
                                            {destSuggestions.map((location, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => selectDestination(location)}
                                                    className="w-full px-4 py-3 text-left hover:bg-orange-50/80 flex items-center gap-4 transition-all group/item"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover/item:bg-orange-100 group-hover/item:text-orange-600 transition-colors">
                                                        <MapPin className="w-4 h-4 text-gray-400 group-hover/item:text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800">{location.name}</div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                            {location.displayName}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-gray-500">
                                            <MapPin className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                            <p className="text-sm">No locations found</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Second Row: Dates & Time */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-4 items-start mt-6">
                    {/* Pickup Date */}
                    <div className={`${tripType === 'round-trip' ? 'md:col-span-4' : 'md:col-span-6'} relative group`}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                            Pickup Date
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 pointer-events-none">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <input
                                type="date"
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="glass-input w-full pl-16 pr-4 py-4 rounded-xl text-gray-800 font-medium focus:outline-none cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Pickup Time */}
                    <div className={`${tripType === 'round-trip' ? 'md:col-span-4' : 'md:col-span-6'} relative group`}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                            Pickup Time
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 pointer-events-none">
                                <Clock className="w-5 h-5" />
                            </div>
                            <select
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="glass-input w-full pl-16 pr-4 py-4 rounded-xl text-gray-800 font-medium focus:outline-none cursor-pointer appearance-none bg-white"
                            >
                                {Array.from({ length: 48 }).map((_, i) => {
                                    const h = Math.floor(i / 2);
                                    const m = i % 2 === 0 ? '00' : '30';
                                    const time = `${h.toString().padStart(2, '0')}:${m}`;
                                    const label = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                    return <option key={time} value={time}>{label}</option>;
                                })}
                            </select>
                        </div>
                    </div>

                    {/* Drop Date (Round Trip Only) */}
                    <AnimatePresence>
                        {tripType === 'round-trip' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="md:col-span-4 relative group"
                            >
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                                    Return Date
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 pointer-events-none">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="date"
                                        value={dropDate}
                                        onChange={(e) => setDropDate(e.target.value)}
                                        min={pickupDate}
                                        className="glass-input w-full pl-16 pr-4 py-4 rounded-xl text-gray-800 font-medium focus:outline-none cursor-pointer"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Big Search Button (Full Width on Mobile, Bottom on Desktop for impact) */}
                <div className="mt-8 flex justify-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="w-full md:w-auto md:min-w-[300px] h-14 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#3B82F6] hover:to-[#2563EB] text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-scout-shimmer" />

                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="w-6 h-6" />
                        )}
                        <span>{isLoading ? 'Searching...' : 'Search Cabs'}</span>
                        {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

// Add this to your tailwind.config.ts if not present, or use the globals.css animation
// animation: { 'scout-shimmer': 'shimmer 2s infinite' }
