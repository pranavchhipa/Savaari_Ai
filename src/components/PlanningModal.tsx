'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { Car, Location, TripStats, Stop } from '@/types';
import ScoutContainer from './ScoutContainer';
import BillingFooter from './BillingFooter';
import BookingModal from './BookingModal';

interface PlanningModalProps {
    isOpen: boolean;
    onClose: () => void;
    car: Car;
    source: Location;
    destination: Location;
    tripType: 'one-way' | 'round-trip';
    pickupDate?: string;
    dropDate?: string;
    pickupTime?: string;
}

export default function PlanningModal({
    isOpen,
    onClose,
    car,
    source,
    destination,
    tripType,
    pickupDate,
    dropDate,
    pickupTime,
}: PlanningModalProps) {
    const [currentPrice, setCurrentPrice] = useState(car.baseFare);
    const [currentTripStats, setCurrentTripStats] = useState<TripStats | null>(null);
    const [currentStops, setCurrentStops] = useState<Stop[]>([]);
    const [currentDestination, setCurrentDestination] = useState(destination);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Reset state when modal opens with a new car
    useEffect(() => {
        if (isOpen) {
            setCurrentPrice(car.baseFare);
            setCurrentDestination(destination);
        }
    }, [isOpen, car.baseFare, destination]);

    const handlePriceUpdate = useCallback((newPrice: number) => {
        setCurrentPrice(newPrice);
    }, []);

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

    // Default tripStats for BookingModal fallback
    const defaultTripStats: TripStats = currentTripStats || {
        totalDistanceKm: 0,
        totalDriveTimeHours: 0,
        totalDays: 1,
        baseFare: car.baseFare,
        extraKmCharge: 0,
        driverAllowance: 0,
        tollEstimate: 0,
        totalFare: currentPrice,
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={onClose}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex flex-col bg-white md:inset-4 md:rounded-2xl md:shadow-2xl md:m-auto md:max-w-6xl md:max-h-[95vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] md:rounded-t-2xl flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-white text-lg">
                                            Customize your trip
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-blue-100">
                                            <span>{car.name}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>{source.name}</span>
                                                <ArrowRight className="w-3 h-3" />
                                                <span>{currentDestination.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Body — scrollable */}
                            <div className="flex-1 overflow-y-auto">
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
                                    isInModal={true}
                                />
                            </div>

                            {/* Sticky Billing Footer */}
                            <BillingFooter
                                tripStats={currentTripStats}
                                onConfirm={handleConfirmBooking}
                                carName={car.name}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Booking Modal — renders on top of everything */}
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
