'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Calendar, MapPin, Car, IndianRupee, CheckCircle2 } from 'lucide-react';
import B2BHeader from '../components/B2BHeader';
import { useState } from 'react';

export default function BookingsLegacyStyle() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'current' | 'history'>('upcoming');

    // Dummy data
    const upcomingBookings = [
        { id: 'SBN-8821', date: '28 Feb 2026', time: '10:00 AM', from: 'Indira Gandhi Intl Airport, T3', to: 'Taj Mahal, Agra', car: 'Innova Crysta', amount: '10,000', status: 'Confirmed' },
        { id: 'SBN-8825', date: '05 Mar 2026', time: '08:00 AM', from: 'Bangalore Airport', to: 'Mysore', car: 'Etios', amount: '4,500', status: 'Driver Assigned' }
    ];

    const historyBookings = [
        { id: 'SBN-8710', date: '15 Jan 2026', time: '09:00 AM', from: 'Mumbai Central', to: 'Pune', car: 'Dzire', amount: '3,200', status: 'Completed' },
        { id: 'SBN-8650', date: '10 Dec 2025', time: '06:00 AM', from: 'Delhi', to: 'Chandigarh', car: 'Innova', amount: '6,000', status: 'Completed' }
    ];

    const renderBookingCard = (booking: any) => (
        <div key={booking.id} className="border border-gray-200 rounded-xl p-5 mb-4 hover:shadow-md transition-shadow bg-white">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                <div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded tracking-wider">ID: {booking.id}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{booking.status}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#1FA6DD] mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">From</p>
                            <p className="text-sm font-medium text-gray-800">{booking.from}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#F37021] mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">To</p>
                            <p className="text-sm font-medium text-gray-800">{booking.to}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 md:border-l md:border-gray-100 md:pl-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{booking.date} at <span className="font-semibold">{booking.time}</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{booking.car}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-900">₹{booking.amount}</span>
                    </div>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button className="px-4 py-2 border border-[#1FA6DD] text-[#1FA6DD] bg-white hover:bg-blue-50 text-sm font-semibold rounded transition-colors shadow-sm">
                    View Details
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">

            <B2BHeader />

            {/* Breadcrumb Row */}
            <div className="bg-[#F2F2F2] border-b border-gray-200 py-2">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-[10px] text-gray-500 flex gap-1 items-center">
                        <span className="hover:underline cursor-pointer" onClick={() => router.push('/b2b-demo/dashboard')}>Home</span>
                        <span>&gt;</span>
                        <span className="text-gray-800 font-medium">Booking</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 mb-1">
                        <button onClick={() => router.push('/b2b-demo/dashboard')} className="p-1 hover:bg-gray-300 rounded-full transition-colors -ml-1">
                            <ArrowLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <h1 className="text-gray-800 text-lg font-bold">Bookings</h1>
                    </div>
                </div>
            </div>

            {/* Main Content Area (Matches Screenshot 3) */}
            <main className="max-w-7xl mx-auto px-4 w-full flex py-8 gap-8">

                {/* Left Sidebar Menu */}
                <div className="w-64 flex-shrink-0">
                    <div className="border border-gray-200 rounded overflow-hidden">
                        <div
                            onClick={() => setActiveTab('upcoming')}
                            className={`p-4 flex justify-between items-center text-sm cursor-pointer border-b border-gray-200 transition-colors ${activeTab === 'upcoming' ? 'bg-white text-[#1FA6DD] font-semibold border-l-4 border-l-[#1FA6DD]' : 'bg-[#F9F9F9] text-gray-700 hover:bg-white border-l-4 border-l-transparent'}`}
                        >
                            <span>Upcoming ({upcomingBookings.length})</span>
                            {activeTab === 'upcoming' && <ChevronRight className="w-4 h-4" />}
                        </div>
                        <div
                            onClick={() => setActiveTab('current')}
                            className={`p-4 flex justify-between items-center text-sm cursor-pointer border-b border-gray-200 transition-colors ${activeTab === 'current' ? 'bg-white text-[#1FA6DD] font-semibold border-l-4 border-l-[#1FA6DD]' : 'bg-[#F9F9F9] text-gray-700 hover:bg-white border-l-4 border-l-transparent'}`}
                        >
                            <span>Current</span>
                            {activeTab === 'current' && <ChevronRight className="w-4 h-4" />}
                        </div>
                        <div
                            onClick={() => setActiveTab('history')}
                            className={`p-4 flex justify-between items-center text-sm cursor-pointer transition-colors ${activeTab === 'history' ? 'bg-white text-[#1FA6DD] font-semibold border-l-4 border-l-[#1FA6DD]' : 'bg-[#F9F9F9] text-gray-700 hover:bg-white border-l-4 border-l-transparent'}`}
                        >
                            <span>History ({historyBookings.length})</span>
                            {activeTab === 'history' && <ChevronRight className="w-4 h-4" />}
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1">
                    {activeTab === 'upcoming' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Bookings</h2>
                            {upcomingBookings.map(renderBookingCard)}
                        </div>
                    )}

                    {activeTab === 'current' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Current active trips</h2>
                            <div className="border border-gray-200 p-8 rounded-xl text-center bg-gray-50 flex flex-col items-center justify-center">
                                <Car className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No trips are currently in progress.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Past Bookings</h2>
                            {historyBookings.map(renderBookingCard)}
                        </div>
                    )}
                </div>

            </main>

        </div>
    );
}
