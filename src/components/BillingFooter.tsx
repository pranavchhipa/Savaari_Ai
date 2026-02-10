'use client';

import { motion } from 'framer-motion';
import { TripStats } from '@/types';
import { formatCurrency, formatDistance } from '@/lib/calculateTripStats';
import { IndianRupee, CreditCard, MapPin, Clock, Sparkles } from 'lucide-react';

interface BillingFooterProps {
    tripStats: TripStats | null;
    onConfirm: () => void;
    carName: string;
}

export default function BillingFooter({ tripStats, onConfirm, carName }: BillingFooterProps) {
    if (!tripStats) return null;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        >
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Fare Summary */}
                    <div className="flex items-center gap-6">
                        {/* Total Fare */}
                        <div>
                            <div className="text-xs text-gray-500 font-medium">Total Fare</div>
                            <div className="flex items-center gap-1">
                                <span className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(tripStats.totalFare)}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                <span>{formatDistance(tripStats.totalDistanceKm)}</span>
                            </div>
                            <div className="w-px h-4 bg-gray-200" />
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>{tripStats.totalDays} {tripStats.totalDays > 1 ? 'Days' : 'Day'}</span>
                            </div>
                            {tripStats.driverAllowance > 0 && (
                                <>
                                    <div className="w-px h-4 bg-gray-200" />
                                    <div className="flex items-center gap-1 text-green-600">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">All inclusive</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={onConfirm}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <CreditCard className="w-5 h-5" />
                        <span className="hidden sm:inline">Confirm Booking</span>
                        <span className="sm:hidden">Confirm</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
