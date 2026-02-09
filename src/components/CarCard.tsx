'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Car, Location, TripStats, Stop } from '@/types';
import ScoutContainer from './ScoutContainer';
import BookingModal from './BookingModal';
import { formatCurrency } from '@/lib/calculateTripStats';
import {
    Star,
    Users,
    Wind,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Briefcase,
} from 'lucide-react';

interface CarCardProps {
    car: Car;
    source: Location;
    destination: Location;
    tripType: 'one-way' | 'round-trip';
    pickupDate?: string;
    dropDate?: string;
    pickupTime?: string;
}

export default function CarCard({ car, source, destination, tripType, pickupDate, dropDate, pickupTime }: CarCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(car.baseFare);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [currentTripStats, setCurrentTripStats] = useState<TripStats | null>(null);
    const [currentStops, setCurrentStops] = useState<Stop[]>([]);
    const [currentDestination, setCurrentDestination] = useState(destination);

    // Sync local price state with incoming prop updates (e.g. when ListingPage recalculates fares)
    useEffect(() => {
        setCurrentPrice(car.baseFare);
    }, [car.baseFare]);

    const handlePriceUpdate = useCallback((newPrice: number) => {
        setCurrentPrice(newPrice);
    }, []);

    // Callback to receive tripStats from ScoutContainer
    const handleTripStatsUpdate = useCallback((tripStats: TripStats, selectedStops: Stop[]) => {
        setCurrentTripStats(tripStats);
        setCurrentStops(selectedStops);
    }, []);

    const handleDestinationChange = useCallback((newDest: Location) => {
        setCurrentDestination(newDest);
    }, []);

    const handleConfirmBooking = () => {
        if (currentTripStats) {
            setShowBookingModal(true);
        }
    };

    // Generate default tripStats if not available yet
    const defaultTripStats: TripStats = currentTripStats || {
        totalDistanceKm: 0,
        totalDriveTimeHours: 0,
        totalDays: 1,
        baseFare: car.baseFare,
        extraKmCharge: 0,
        driverAllowance: 0,
        totalFare: currentPrice,
    };

    return (
        <>
            <motion.div
                layout
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden"
            >
                {/* Main Card Content */}
                <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        {/* Car Image */}
                        <div className="flex-shrink-0 w-full md:w-48 h-36 md:h-32 relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                            { }
                            { }
                            <div className="absolute inset-0 p-2">
                                <Image
                                    src={car.image || '/placeholder-car.png'}
                                    alt={car.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 bg-[#2563EB] text-white text-xs font-medium rounded-full">
                                {car.type}
                            </div>
                        </div>

                        {/* Car Details */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{car.name}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{car.type} • or similar</p>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="font-bold text-sm">{car.rating}</span>
                                    <span className="text-xs text-green-600">({car.reviewCount})</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="flex flex-wrap gap-3 mt-4">
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span>{car.seats} Seats</span>
                                </div>
                                {car.ac && (
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                        <Wind className="w-4 h-4 text-gray-400" />
                                        <span>AC</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                    <span>2 Bags</span>
                                </div>
                            </div>

                            {/* Included Features */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {car.features.slice(0, 3).map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 md:min-w-[160px]">
                            <div className="text-right">
                                <div className="text-sm text-gray-500 line-through">
                                    {formatCurrency(currentPrice * 1.15)}
                                </div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {formatCurrency(currentPrice)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    for {tripType === 'round-trip' ? 'round trip' : 'one way'}
                                </div>
                            </div>

                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${isExpanded
                                    ? 'bg-gray-800 text-white shadow-gray-400/30 hover:bg-gray-700'
                                    : 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-orange-500/30 hover:shadow-orange-500/40'
                                    }`}
                            >
                                {isExpanded ? (
                                    <>
                                        <span>Close</span>
                                        <ChevronUp className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        <span>SELECT CAR</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expandable Scout Interface */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden border-t border-gray-100"
                        >
                            <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
                                {/* Sarathi Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Sarathi™</h3>
                                        <p className="text-xs text-gray-500">
                                            Smart trip planner • Customize your journey
                                        </p>
                                    </div>
                                </div>

                                {/* Scout Container */}
                                <ScoutContainer
                                    source={source}
                                    destination={currentDestination}
                                    car={car}
                                    tripType={tripType}
                                    onPriceUpdate={handlePriceUpdate}
                                    pickupDate={pickupDate}
                                    dropDate={dropDate}
                                    pickupTime={pickupTime}
                                    onDestinationChange={handleDestinationChange}
                                    onTripStatsUpdate={handleTripStatsUpdate}
                                />

                                {/* Confirm Booking CTA */}
                                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100">
                                    <div>
                                        <div className="text-sm text-gray-500">Total Payable</div>
                                        <div className="text-3xl font-bold text-gray-800">
                                            {formatCurrency(currentPrice)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleConfirmBooking}
                                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white rounded-xl font-bold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                source={source}
                destination={currentDestination}
                car={car}
                tripType={tripType}
                tripStats={defaultTripStats}
                selectedStops={currentStops}
                pickupDate={pickupDate || new Date().toISOString().split('T')[0]}
                dropDate={dropDate}
                pickupTime={pickupTime || '09:00'}
            />
        </>
    );
}
