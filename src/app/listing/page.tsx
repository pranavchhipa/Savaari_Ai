'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import CarCard from '@/components/CarCard';
import { Car, SearchParams, Location } from '@/types';
import CarCardSkeleton from '@/components/CarCardSkeleton';

import {
    MapPin,
    ArrowRight,
    ArrowLeftRight,
    Calendar,
    Filter,
    SortAsc,
    ChevronLeft,
    ChevronDown,
    Check,
    X,
    Users,
    Car as CarIcon,
} from 'lucide-react';

// Sample car data
const sampleCars: Car[] = [
    {
        id: '1',
        name: 'Maruti Wagon R',
        image: '/cars/wagon-r.png',
        type: 'Hatchback',
        seats: 4,
        ac: true,
        rating: 4.7,
        reviewCount: 2341,
        baseFare: 8499,
        perKmRate: 11,
        driverAllowancePerDay: 300,
        features: ['Driver Allowance Included', 'Fuel Included', 'Toll Included'],
    },
    {
        id: '2',
        name: 'Toyota Etios',
        image: '/cars/etios.png',
        type: 'Sedan',
        seats: 4,
        ac: true,
        rating: 4.8,
        reviewCount: 3892,
        baseFare: 12363,
        perKmRate: 12,
        driverAllowancePerDay: 350,
        features: ['Driver Allowance Included', 'Comfortable Ride', 'Spacious Boot'],
    },
    {
        id: '3',
        name: 'Honda Amaze',
        image: '/cars/amaze.png',
        type: 'Sedan',
        seats: 4,
        ac: true,
        rating: 4.6,
        reviewCount: 1567,
        baseFare: 13499,
        perKmRate: 12,
        driverAllowancePerDay: 350,
        features: ['Premium Interior', 'USB Charging', 'Extra Legroom'],
    },
    {
        id: '4',
        name: 'Toyota Innova',
        image: '/cars/innova.png',
        type: 'SUV',
        seats: 7,
        ac: true,
        rating: 4.9,
        reviewCount: 5234,
        baseFare: 17863,
        perKmRate: 15,
        driverAllowancePerDay: 400,
        features: ['Captain Seats', 'Best for Families', 'Ample Luggage Space'],
    },
    {
        id: '5',
        name: 'Maruti Ertiga',
        image: '/cars/ertiga.png',
        type: 'MUV',
        seats: 7,
        ac: true,
        rating: 4.5,
        reviewCount: 1893,
        baseFare: 14999,
        perKmRate: 13,
        driverAllowancePerDay: 350,
        features: ['Great Mileage', '7 Seater', 'Comfortable Journey'],
    },
];

type SortOption = 'default' | 'price-low' | 'price-high' | 'rating';

interface FilterState {
    carTypes: string[];
    minSeats: number;
    maxPrice: number;
}

export default function ListingPage() {
    const router = useRouter();
    const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
    const [pickupDate, setPickupDate] = useState<string>('');
    const [filters, setFilters] = useState<FilterState>({
        carTypes: [],
        minSeats: 0,
        maxPrice: 50000,
    });

    // Load search params from sessionStorage
    useEffect(() => {
        const stored = sessionStorage.getItem('savaari_search');
        if (stored) {
            try {
                const params = JSON.parse(stored) as SearchParams;
                setSearchParams(params);
                setTripType(params.tripType || 'round-trip');
                setPickupDate(params.pickupDate || new Date().toISOString().split('T')[0]);
            } catch (e) {
                console.error('Failed to parse search params');
                setPickupDate(new Date().toISOString().split('T')[0]);
            }
        } else {
            setPickupDate(new Date().toISOString().split('T')[0]);
        }

        // Simulate network delay
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    }, []);

    // Save to sessionStorage when trip type or date changes
    useEffect(() => {
        if (!isLoading && searchParams) {
            const updated = { ...searchParams, tripType, pickupDate };
            sessionStorage.setItem('savaari_search', JSON.stringify(updated));
        }
    }, [tripType, pickupDate, isLoading]);

    // Default locations if not set
    const source: Location = searchParams?.source || {
        name: 'Bangalore',
        displayName: 'Bangalore, Karnataka, India',
        lat: 12.9716,
        lng: 77.5946,
    };

    const destination: Location = searchParams?.destination || {
        name: 'Mysore',
        displayName: 'Mysore, Karnataka, India',
        lat: 12.2958,
        lng: 76.6394,
    };

    // Sort and filter cars
    const filteredAndSortedCars = useMemo(() => {
        let result = [...sampleCars];

        // Apply filters
        if (filters.carTypes.length > 0) {
            result = result.filter(car => filters.carTypes.includes(car.type));
        }
        if (filters.minSeats > 0) {
            result = result.filter(car => car.seats >= filters.minSeats);
        }
        if (filters.maxPrice < 50000) {
            result = result.filter(car => car.baseFare <= filters.maxPrice);
        }

        // Apply sort
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => a.baseFare - b.baseFare);
                break;
            case 'price-high':
                result.sort((a, b) => b.baseFare - a.baseFare);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // Keep original order
                break;
        }

        return result;
    }, [sortBy, filters]);

    const carTypes = ['Hatchback', 'Sedan', 'SUV', 'MUV'];
    const activeFiltersCount = filters.carTypes.length + (filters.minSeats > 0 ? 1 : 0) + (filters.maxPrice < 50000 ? 1 : 0);

    const toggleCarType = (type: string) => {
        setFilters(prev => ({
            ...prev,
            carTypes: prev.carTypes.includes(type)
                ? prev.carTypes.filter(t => t !== type)
                : [...prev.carTypes, type],
        }));
    };

    const clearFilters = () => {
        setFilters({ carTypes: [], minSeats: 0, maxPrice: 50000 });
    };

    // Generate next 7 days for date picker
    const dateOptions = useMemo(() => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
                isToday: i === 0,
            });
        }
        return dates;
    }, []);



    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Search Summary Header */}
            <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Back & Route Info */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-gray-800">
                                    <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-semibold">{source.name}</span>
                                </div>

                                <ArrowRight className="w-4 h-4 text-gray-400" />

                                <div className="flex items-center gap-2 text-gray-800">
                                    <div className="w-8 h-8 bg-[#F97316] rounded-lg flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-semibold">{destination.name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trip Details - Improved UI */}
                        <div className="flex items-center gap-3">
                            {/* Date Picker */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-[#2563EB] hover:bg-blue-50/50 transition-all"
                                >
                                    <Calendar className="w-4 h-4 text-[#2563EB]" />
                                    <span className="font-medium">
                                        {new Date(pickupDate).toLocaleDateString('en-IN', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>

                                <AnimatePresence>
                                    {showDatePicker && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 min-w-[200px]"
                                        >
                                            {dateOptions.map((date) => (
                                                <button
                                                    key={date.value}
                                                    onClick={() => {
                                                        setPickupDate(date.value);
                                                        setShowDatePicker(false);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${pickupDate === date.value
                                                        ? 'bg-[#2563EB] text-white'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                >
                                                    <span>{date.label}</span>
                                                    {date.isToday && (
                                                        <span className={`text-xs ${pickupDate === date.value ? 'text-blue-200' : 'text-gray-400'}`}>
                                                            Today
                                                        </span>
                                                    )}
                                                    {pickupDate === date.value && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Trip Type Toggle - Professional Pill Style */}
                            <div className="flex items-center bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => setTripType('one-way')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tripType === 'one-way'
                                        ? 'bg-white text-[#2563EB] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                    <span className="hidden sm:inline">One Way</span>
                                </button>
                                <button
                                    onClick={() => setTripType('round-trip')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tripType === 'round-trip'
                                        ? 'bg-white text-[#2563EB] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <ArrowLeftRight className="w-4 h-4" />
                                    <span className="hidden sm:inline">Round Trip</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters & Sort */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {filteredAndSortedCars.length} cars available
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Select a car to plan your journey with Sarathi AI™
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showFilters || activeFiltersCount > 0
                                ? 'bg-[#2563EB] text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="w-5 h-5 bg-white text-[#2563EB] rounded-full text-xs font-bold flex items-center justify-center">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${sortBy !== 'default'
                                    ? 'bg-[#2563EB] text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <SortAsc className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    {sortBy === 'default' && 'Sort'}
                                    {sortBy === 'price-low' && 'Price: Low to High'}
                                    {sortBy === 'price-high' && 'Price: High to Low'}
                                    {sortBy === 'rating' && 'Top Rated'}
                                </span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                                {showSortDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 min-w-[180px]"
                                    >
                                        {[
                                            { value: 'default', label: 'Recommended' },
                                            { value: 'price-low', label: 'Price: Low to High' },
                                            { value: 'price-high', label: 'Price: High to Low' },
                                            { value: 'rating', label: 'Top Rated' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSortBy(option.value as SortOption);
                                                    setShowSortDropdown(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === option.value
                                                    ? 'bg-[#2563EB] text-white'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                                    }`}
                                            >
                                                <span>{option.label}</span>
                                                {sortBy === option.value && <Check className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-6"
                        >
                            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-800">Filters</h3>
                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-[#2563EB] hover:underline flex items-center gap-1"
                                        >
                                            <X className="w-4 h-4" />
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-6">
                                    {/* Car Type */}
                                    <div>
                                        <label className="text-sm text-gray-500 mb-2 block">Car Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {carTypes.map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => toggleCarType(type)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${filters.carTypes.includes(type)
                                                        ? 'bg-[#2563EB] text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <CarIcon className="w-4 h-4" />
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Seats */}
                                    <div>
                                        <label className="text-sm text-gray-500 mb-2 block">Minimum Seats</label>
                                        <div className="flex gap-2">
                                            {[0, 4, 5, 7].map((seats) => (
                                                <button
                                                    key={seats}
                                                    onClick={() => setFilters(prev => ({ ...prev, minSeats: seats }))}
                                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all ${filters.minSeats === seats
                                                        ? 'bg-[#2563EB] text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <Users className="w-4 h-4" />
                                                    {seats === 0 ? 'Any' : `${seats}+`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active Filter Chips */}
                {activeFiltersCount > 0 && !showFilters && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {filters.carTypes.map((type) => (
                            <span
                                key={type}
                                onClick={() => toggleCarType(type)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB]/10 text-[#2563EB] rounded-full text-sm cursor-pointer hover:bg-[#2563EB]/20"
                            >
                                {type}
                                <X className="w-3 h-3" />
                            </span>
                        ))}
                        {filters.minSeats > 0 && (
                            <span
                                onClick={() => setFilters(prev => ({ ...prev, minSeats: 0 }))}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB]/10 text-[#2563EB] rounded-full text-sm cursor-pointer hover:bg-[#2563EB]/20"
                            >
                                {filters.minSeats}+ Seats
                                <X className="w-3 h-3" />
                            </span>
                        )}
                    </div>
                )}

                {/* Car Cards */}
                <div className="space-y-6">
                    {isLoading ? (
                        <>
                            <CarCardSkeleton />
                            <CarCardSkeleton />
                            <CarCardSkeleton />
                        </>
                    ) : filteredAndSortedCars.length === 0 ? (
                        <div className="text-center py-12">
                            <CarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No cars match your filters</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your filter criteria</p>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        filteredAndSortedCars.map((car, index) => (
                            <motion.div
                                key={car.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <CarCard
                                    car={car}
                                    source={source}
                                    destination={destination}
                                    tripType={tripType}
                                    pickupDate={pickupDate}
                                />
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Why Savaari Banner */}
                <div className="mt-12 p-6 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-2xl text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Why book with Savaari?</h3>
                            <p className="text-blue-100 text-sm max-w-md">
                                Transparent pricing, verified drivers, and 24x7 support.
                                Plan your perfect trip with Sarathi AI.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold">4.8★</div>
                                <div className="text-xs text-blue-200">Average Rating</div>
                            </div>
                            <div className="w-px h-12 bg-blue-400/30"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">50L+</div>
                                <div className="text-xs text-blue-200">Happy Customers</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Click outside to close dropdowns */}
            {(showSortDropdown || showDatePicker) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowSortDropdown(false);
                        setShowDatePicker(false);
                    }}
                />
            )}
        </div>
    );
}
