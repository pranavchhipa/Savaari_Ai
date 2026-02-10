'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Car, Location, TripStats, Stop } from '@/types';
import PlanningModal from './PlanningModal';
import BookingModal from './BookingModal';
import { formatCurrency } from '@/lib/calculateTripStats';
import {
    Star,
    Users,
    Wind,
    CheckCircle,
    Sparkles,
    Briefcase,
    ArrowRight,
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
    const [showPlanningModal, setShowPlanningModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(car.baseFare);

    // Sync local price state with incoming prop updates
    useEffect(() => {
        setCurrentPrice(car.baseFare);
    }, [car.baseFare]);

    // Generate default tripStats for direct booking (without customization)
    const defaultTripStats: TripStats = {
        totalDistanceKm: 0,
        totalDriveTimeHours: 0,
        totalDays: 1,
        baseFare: car.baseFare,
        extraKmCharge: 0,
        driverAllowance: 0,
        tollEstimate: 0,
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

                            {/* Plan My Perfect Trip CTA — positioned below features */}
                            <button
                                onClick={() => setShowPlanningModal(true)}
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 text-[#2563EB] border border-blue-200/60 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300 group"
                            >
                                <Sparkles className="w-4 h-4 text-indigo-500 group-hover:animate-pulse" />
                                <span>Plan My Perfect Trip</span>
                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </button>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 md:min-w-[180px]">
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

                            {/* Action Button */}
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5"
                            >
                                <span>Select Car</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Planning Modal */}
            <PlanningModal
                isOpen={showPlanningModal}
                onClose={() => setShowPlanningModal(false)}
                car={car}
                source={source}
                destination={destination}
                tripType={tripType}
                pickupDate={pickupDate}
                dropDate={dropDate}
                pickupTime={pickupTime}
            />

            {/* Direct Booking Modal (without customization) */}
            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                source={source}
                destination={destination}
                car={car}
                tripType={tripType}
                tripStats={defaultTripStats}
                selectedStops={[]}
                pickupDate={pickupDate || new Date().toISOString().split('T')[0]}
                dropDate={dropDate}
                pickupTime={pickupTime || '09:00'}
            />
        </>
    );
}
