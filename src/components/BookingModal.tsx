'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Car as CarIcon,
    Clock,
    CheckCircle,
    ArrowRight,
    IndianRupee,
    Shield,
    CreditCard,
    Loader2,
    Sparkles,
    PartyPopper
} from 'lucide-react';
import { Location, Car, Stop, TripStats } from '@/types';
import { formatCurrency } from '@/lib/calculateTripStats';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    source: Location;
    destination: Location;
    car: Car;
    tripType: 'one-way' | 'round-trip';
    tripStats: TripStats;
    selectedStops: Stop[];
    pickupDate: string;
}

import { useToast } from '@/components/ui/Toast';

type BookingStep = 'details' | 'review' | 'payment' | 'success';

interface BookingFormData {
    fullName: string;
    phone: string;
    email: string;
    pickupAddress: string;
    pickupTime: string;
    specialRequests: string;
}

export default function BookingModal({
    isOpen,
    onClose,
    source,
    destination,
    car,
    tripType,
    tripStats,
    selectedStops,
    pickupDate,
}: BookingModalProps) {
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState<BookingStep>('details');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<BookingFormData>({
        fullName: '',
        phone: '',
        email: '',
        pickupAddress: '',
        pickupTime: '06:00',
        specialRequests: '',
    });
    const [errors, setErrors] = useState<Partial<BookingFormData>>({});

    // Generate booking ID
    const generateBookingId = () => {
        const prefix = 'SAV';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    };

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: Partial<BookingFormData> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
        }

        if (!formData.pickupAddress.trim()) {
            newErrors.pickupAddress = 'Pickup address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleDetailsSubmit = () => {
        if (validateForm()) {
            setCurrentStep('review');
        }
    };

    // Handle booking confirmation
    const handleConfirmBooking = async () => {
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newBookingId = generateBookingId();
        setBookingId(newBookingId);

        // Store booking in localStorage for demo purposes
        const booking = {
            id: newBookingId,
            ...formData,
            source,
            destination,
            car: { name: car.name, type: car.type },
            tripType,
            tripStats,
            selectedStops: selectedStops.map(s => ({ name: s.name, type: s.type })),
            pickupDate,
            createdAt: new Date().toISOString(),
            status: 'confirmed',
        };

        const existingBookings = JSON.parse(localStorage.getItem('savaari_bookings') || '[]');
        localStorage.setItem('savaari_bookings', JSON.stringify([...existingBookings, booking]));

        setIsSubmitting(false);
        setCurrentStep('success');
        showToast('Booking Confirmed Successfully! 🎉', 'success');
    };

    // Handle modal close
    const handleClose = () => {
        if (currentStep === 'success') {
            // Reset state on successful booking close
            setCurrentStep('details');
            setFormData({
                fullName: '',
                phone: '',
                email: '',
                pickupAddress: '',
                pickupTime: '06:00',
                specialRequests: '',
            });
            setBookingId(null);
        }
        onClose();
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Time options
    const timeOptions = useMemo(() => {
        const options = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hour = h.toString().padStart(2, '0');
                const minute = m.toString().padStart(2, '0');
                const period = h >= 12 ? 'PM' : 'AM';
                const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                options.push({
                    value: `${hour}:${minute}`,
                    label: `${displayH}:${minute} ${period}`,
                });
            }
        }
        return options;
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    {currentStep === 'success' ? (
                                        <PartyPopper className="w-5 h-5 text-white" />
                                    ) : (
                                        <CarIcon className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg">
                                        {currentStep === 'details' && 'Your Details'}
                                        {currentStep === 'review' && 'Review Booking'}
                                        {currentStep === 'payment' && 'Payment'}
                                        {currentStep === 'success' && 'Booking Confirmed!'}
                                    </h2>
                                    <p className="text-sm text-blue-100">
                                        {currentStep === 'success'
                                            ? `Booking ID: ${bookingId}`
                                            : `${car.name} • ${tripType === 'round-trip' ? 'Round Trip' : 'One Way'}`
                                        }
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Progress Steps */}
                        {currentStep !== 'success' && (
                            <div className="px-4 py-3 bg-slate-50 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    {['details', 'review', 'payment'].map((step, idx) => (
                                        <div key={step} className="flex items-center flex-1">
                                            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${currentStep === step
                                                ? 'bg-[#2563EB] text-white'
                                                : ['review', 'payment'].indexOf(currentStep) > ['details', 'review', 'payment'].indexOf(step)
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                {['review', 'payment'].indexOf(currentStep) > ['details', 'review', 'payment'].indexOf(step) ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    idx + 1
                                                )}
                                            </div>
                                            <span className={`ml-2 text-xs font-medium hidden sm:block ${currentStep === step ? 'text-[#2563EB]' : 'text-gray-500'
                                                }`}>
                                                {step.charAt(0).toUpperCase() + step.slice(1)}
                                            </span>
                                            {idx < 2 && (
                                                <div className={`flex-1 h-0.5 mx-2 ${['review', 'payment'].indexOf(currentStep) > idx
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-200'
                                                    }`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Step 1: Details Form */}
                            {currentStep === 'details' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Trip Summary Card */}
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex items-center gap-2 flex-1">
                                                <MapPin className="w-4 h-4 text-[#2563EB]" />
                                                <span className="text-sm font-medium text-slate-800">{source.name}</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                            <div className="flex items-center gap-2 flex-1">
                                                <MapPin className="w-4 h-4 text-[#F97316]" />
                                                <span className="text-sm font-medium text-slate-800">{destination.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(pickupDate)}
                                            </span>
                                            <span>•</span>
                                            <span>{tripStats.totalDistanceKm} km</span>
                                            <span>•</span>
                                            <span>{tripStats.totalDays} day{tripStats.totalDays > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="space-y-3">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name *
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                                    placeholder="Enter your full name"
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                        }`}
                                                />
                                            </div>
                                            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Mobile Number *
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-gray-500">+91</span>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                                    placeholder="9876543210"
                                                    className={`w-full pl-16 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                        }`}
                                                />
                                            </div>
                                            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                    placeholder="you@example.com"
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                        }`}
                                                />
                                            </div>
                                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                        </div>

                                        {/* Pickup Address */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pickup Address *
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                                <textarea
                                                    value={formData.pickupAddress}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                                                    placeholder="Enter complete pickup address with landmark"
                                                    rows={2}
                                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none ${errors.pickupAddress ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                        }`}
                                                />
                                            </div>
                                            {errors.pickupAddress && <p className="text-xs text-red-500 mt-1">{errors.pickupAddress}</p>}
                                        </div>

                                        {/* Pickup Time */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pickup Time
                                            </label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <select
                                                    value={formData.pickupTime}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] appearance-none bg-white"
                                                >
                                                    {timeOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Special Requests */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Special Requests (Optional)
                                            </label>
                                            <textarea
                                                value={formData.specialRequests}
                                                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                                                placeholder="Any special requirements or instructions..."
                                                rows={2}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Review */}
                            {currentStep === 'review' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Customer Details */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                            <User className="w-4 h-4 text-[#2563EB]" />
                                            Passenger Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-slate-500">Name</span>
                                                <p className="font-medium text-slate-800">{formData.fullName}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Phone</span>
                                                <p className="font-medium text-slate-800">+91 {formData.phone}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-slate-500">Email</span>
                                                <p className="font-medium text-slate-800">{formData.email}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-slate-500">Pickup Address</span>
                                                <p className="font-medium text-slate-800">{formData.pickupAddress}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trip Details */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-[#2563EB]" />
                                            Trip Details
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Route</span>
                                                <span className="font-medium text-slate-800">
                                                    {source.name} → {destination.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Trip Type</span>
                                                <span className="font-medium text-slate-800">
                                                    {tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Pickup Date & Time</span>
                                                <span className="font-medium text-slate-800">
                                                    {formatDate(pickupDate)}, {timeOptions.find(t => t.value === formData.pickupTime)?.label}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Total Distance</span>
                                                <span className="font-medium text-slate-800">{tripStats.totalDistanceKm} km</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Duration</span>
                                                <span className="font-medium text-slate-800">{tripStats.totalDays} day{tripStats.totalDays > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Car Details */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                            <CarIcon className="w-4 h-4 text-[#2563EB]" />
                                            Vehicle
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-20 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <CarIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{car.name}</p>
                                                <p className="text-sm text-slate-500">{car.type} • {car.seats} Seater • AC</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fare Breakdown */}
                                    <div className="p-4 bg-[#2563EB]/5 rounded-xl border border-[#2563EB]/10">
                                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 text-[#2563EB]" />
                                            Fare Breakdown
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Base Fare</span>
                                                <span className="text-slate-800">{formatCurrency(tripStats.baseFare)}</span>
                                            </div>
                                            {tripStats.extraKmCharge > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Extra Km Charges</span>
                                                    <span className="text-slate-800">+{formatCurrency(tripStats.extraKmCharge)}</span>
                                                </div>
                                            )}
                                            {tripStats.driverAllowance > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Driver Allowance</span>
                                                    <span className="text-slate-800">+{formatCurrency(tripStats.driverAllowance)}</span>
                                                </div>
                                            )}
                                            <div className="pt-2 mt-2 border-t border-[#2563EB]/20 flex justify-between">
                                                <span className="font-bold text-slate-800">Total Amount</span>
                                                <span className="font-bold text-[#2563EB] text-lg">{formatCurrency(tripStats.totalFare)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-100">
                                        <Shield className="w-5 h-5 text-green-600" />
                                        <div className="text-sm">
                                            <p className="font-medium text-green-800">Secure Booking</p>
                                            <p className="text-green-600 text-xs">Your payment is protected with bank-grade security</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Success */}
                            {currentStep === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    {/* Success Animation */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                                        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
                                    >
                                        <CheckCircle className="w-12 h-12 text-white" />
                                    </motion.div>

                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Booking Confirmed! 🎉
                                    </h2>
                                    <p className="text-gray-500 mb-6">
                                        Your cab has been booked successfully.
                                    </p>

                                    {/* Booking ID */}
                                    <div className="inline-block p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                                        <p className="text-sm text-slate-500 mb-1">Booking ID</p>
                                        <p className="text-xl font-bold text-[#2563EB] font-mono">{bookingId}</p>
                                    </div>

                                    {/* Summary */}
                                    <div className="text-left p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Route</span>
                                                <span className="font-medium text-slate-800">{source.name} → {destination.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Pickup</span>
                                                <span className="font-medium text-slate-800">
                                                    {formatDate(pickupDate)}, {timeOptions.find(t => t.value === formData.pickupTime)?.label}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Vehicle</span>
                                                <span className="font-medium text-slate-800">{car.name}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-slate-200">
                                                <span className="font-medium text-slate-800">Amount Paid</span>
                                                <span className="font-bold text-[#2563EB]">{formatCurrency(tripStats.totalFare)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirmation Email Notice */}
                                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Confirmation sent to {formData.email}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer with CTA */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                            {currentStep === 'details' && (
                                <button
                                    onClick={handleDetailsSubmit}
                                    className="w-full py-4 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    Continue to Review
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            )}

                            {currentStep === 'review' && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5" />
                                                Pay {formatCurrency(tripStats.totalFare)} & Confirm
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep('details')}
                                        className="w-full py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        ← Back to Details
                                    </button>
                                </div>
                            )}

                            {currentStep === 'success' && (
                                <button
                                    onClick={handleClose}
                                    className="w-full py-4 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5"
                                >
                                    Done
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
