'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location } from '@/types';
import { searchLocations, popularCities } from '@/lib/geocoding';
import { MapPin, Search, X, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

interface DestinationChangerProps {
    currentDestination: Location;
    onDestinationChange: (newDestination: Location) => void;
    onClose: () => void;
    isOpen: boolean;
}

export default function DestinationChanger({
    currentDestination,
    onDestinationChange,
    onClose,
    isOpen,
}: DestinationChangerProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>(undefined);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setSuggestions(popularCities.slice(0, 6));
        }
    }, [isOpen]);

    // Debounced search
    const handleSearch = useCallback(async (searchQuery: string) => {
        setQuery(searchQuery);
        setSelectedLocation(null);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (searchQuery.length < 2) {
            setSuggestions(popularCities.slice(0, 6));
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            const results = await searchLocations(searchQuery);
            setSuggestions(results.length > 0 ? results : popularCities.filter(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
            ));
            setIsLoading(false);
        }, 300);
    }, []);

    const handleSelect = (location: Location) => {
        setSelectedLocation(location);
        setQuery(location.name);
        setSuggestions([]);
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            onDestinationChange(selectedLocation);
            onClose();
        }
    };

    const handleClose = () => {
        setQuery('');
        setSelectedLocation(null);
        setSuggestions([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Change Destination</h3>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Current Destination Info */}
                        <div className="p-4 bg-slate-50 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Current Destination</p>
                                    <p className="font-semibold text-gray-800">{currentDestination.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="p-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search for new destination..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                {isLoading && (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                                )}
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="max-h-64 overflow-y-auto border-t border-gray-100">
                            {suggestions.length > 0 ? (
                                <div className="p-2">
                                    <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                        {query.length < 2 ? 'Popular Destinations' : 'Search Results'}
                                    </p>
                                    {suggestions.map((location, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelect(location)}
                                            className={`w-full px-3 py-3 text-left hover:bg-blue-50 rounded-lg flex items-center gap-3 transition-all ${selectedLocation?.name === location.name ? 'bg-blue-50 ring-2 ring-blue-500/20' : ''
                                                }`}
                                        >
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${selectedLocation?.name === location.name
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800">{location.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{location.displayName}</p>
                                            </div>
                                            {selectedLocation?.name === location.name && (
                                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <path d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : query.length >= 2 && !isLoading ? (
                                <div className="p-6 text-center">
                                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500">No destinations found</p>
                                </div>
                            ) : null}
                        </div>

                        {/* Confirmation Bar */}
                        {selectedLocation && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertCircle className="w-4 h-4 text-blue-500" />
                                    <p className="text-sm text-blue-700">
                                        Route will be recalculated with new stops and fare
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="font-medium">{currentDestination.name}</span>
                                        <ArrowRight className="w-4 h-4 text-blue-500" />
                                        <span className="font-bold text-blue-600">{selectedLocation.name}</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleConfirm}
                                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        Confirm Change
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
