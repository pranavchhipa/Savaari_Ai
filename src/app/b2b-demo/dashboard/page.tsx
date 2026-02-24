'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ChevronDown, CheckCircle2 } from 'lucide-react';
import SearchWidget from '@/components/SearchWidget';
import B2BHeader from '../components/B2BHeader';

export default function AgentDashboardLegacyStyle() {
    const router = useRouter();
    const [showMobileModal, setShowMobileModal] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');
    const [showB2BOptions, setShowB2BOptions] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

            <B2BHeader />

            {/* Hero Section with City Skyline Background */}
            <section className="relative pt-12 pb-32 md:pb-48 bg-gray-900 border-b border-gray-200/50">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1548345680-f5475ea90f14?q=80&w=2073&auto=format&fit=crop"
                        alt="City skyline at dusk"
                        className="w-full h-full object-cover opacity-50 block"
                        style={{ objectPosition: 'center 20%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-wider shadow-sm" style={{ WebkitTextStroke: '1px rgba(0,0,0,0.5)' }}>
                        SERVICES ACROSS 2000+ CITIES
                    </h1>
                </div>
            </section>

            {/* The Core Booking Widget (Matched exactly to screenshot 1 & 2) */}
            <section className="relative z-20 max-w-5xl mx-auto px-4 -mt-24 md:-mt-32">
                <div className="bg-white rounded-xl shadow-2xl overflow-visible relative">

                    {/* Tabs based exactly on screenshot */}
                    <div className="flex border-b border-gray-200 justify-center pt-6 px-6">
                        <div className="inline-flex rounded-t-md overflow-hidden border border-gray-300">
                            <button className="px-6 py-2.5 text-xs font-bold bg-[#1FA6DD] text-white">ONE WAY</button>
                            <button className="px-6 py-2.5 text-xs font-bold bg-white text-gray-700 border-l border-gray-300 hover:bg-gray-50">ROUND TRIP</button>
                            <button className="px-6 py-2.5 text-xs font-bold bg-white text-gray-700 border-l border-gray-300 hover:bg-gray-50">LOCAL</button>
                            <button className="px-6 py-2.5 text-xs font-bold bg-white text-gray-700 border-l border-gray-300 hover:bg-gray-50">AIRPORT</button>
                        </div>
                    </div>

                    {/* Form Inputs based exactly on screenshot 1 */}
                    <div className="p-8 pt-6">
                        <div className="flex flex-col md:flex-row gap-6 relative items-end">

                            {/* From */}
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-800 mb-2">FROM</label>
                                <div className="relative border-b border-gray-300 pb-1">
                                    <span className="absolute left-0 top-1 text-gray-400">🔍</span>
                                    <input type="text" placeholder="Enter Pickup Location" className="w-full pl-6 text-sm text-gray-800 outline-none" />
                                </div>
                                <p className="text-[10px] text-red-500 mt-1">Please select from Dropdown</p>
                            </div>

                            {/* Swap Icon */}
                            <div className="flex-shrink-0 flex items-end justify-center pb-4 text-[#1FA6DD] bg-blue-50/50 p-2 rounded-full cursor-pointer hover:bg-blue-100">
                                ⇄
                            </div>

                            {/* To */}
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-800 mb-2">TO</label>
                                <div className="relative border-b border-gray-300 pb-1">
                                    <span className="absolute left-0 top-1 text-gray-400">🔍</span>
                                    <input type="text" placeholder="Enter Drop Location" className="w-full pl-6 text-sm text-gray-800 outline-none" />
                                </div>
                            </div>

                            {/* Pick Up Date */}
                            <div className="w-40">
                                <label className="block text-sm font-bold text-gray-800 mb-2">PICK UP DATE</label>
                                <div className="relative border-b border-gray-300 pb-1 flex justify-between items-center cursor-pointer">
                                    <span className="text-sm text-gray-900 font-medium">25-02-2026</span>
                                    <ChevronDown className="w-4 h-4 text-[#1FA6DD]" />
                                </div>
                            </div>

                            {/* Pick Up Time */}
                            <div className="w-40">
                                <label className="block text-sm font-bold text-gray-800 mb-2">PICK UP TIME</label>
                                <div className="relative border-b border-gray-300 pb-1 flex justify-between items-center cursor-pointer">
                                    <span className="text-sm text-gray-900 font-medium">7:00 AM</span>
                                    <ChevronDown className="w-4 h-4 text-[#1FA6DD]" />
                                </div>
                            </div>

                        </div>

                        {/* B2B Advanced Options Toggle */}
                        <div className="mt-6 border-t border-gray-100 pt-4">
                            <div
                                className="flex justify-between items-center cursor-pointer text-[#1FA6DD] hover:text-[#1889B6]"
                                onClick={() => setShowB2BOptions(!showB2BOptions)}
                            >
                                <span className="text-sm font-bold flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    Advanced B2B Agent Options
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showB2BOptions ? 'rotate-180' : ''}`} />
                            </div>

                            {showB2BOptions && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
                                    {/* Multi-Vehicle */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Vehicle Fleet Requirements</label>
                                        <select className="w-full border border-gray-300 rounded p-2 text-sm text-gray-700 bg-white shadow-sm outline-none focus:border-[#1FA6DD]">
                                            <option>1 Vehicle (Standard)</option>
                                            <option>2 Vehicles (Convoy)</option>
                                            <option>3+ Vehicles (Group Booking)</option>
                                        </select>
                                    </div>

                                    {/* Extra KM */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Advance KM Allowance</label>
                                        <div className="flex rounded shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                +
                                            </span>
                                            <input type="number" placeholder="0" className="flex-1 block w-full rounded-none rounded-r border border-gray-300 p-2 text-sm outline-none focus:border-[#1FA6DD]" />
                                            <span className="absolute right-6 top-[2.4rem] text-sm text-gray-400">KM</span>
                                        </div>
                                    </div>

                                    {/* Value Added Services */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Value Added Services (VAS)</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" className="rounded border-gray-300 text-[#1FA6DD] focus:ring-[#1FA6DD]" />
                                                <span className="text-sm text-gray-700 group-hover:text-gray-900">Add Luggage Carrier (+₹200)</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" className="rounded border-gray-300 text-[#1FA6DD] focus:ring-[#1FA6DD]" />
                                                <span className="text-sm text-gray-700 group-hover:text-gray-900">Request English/Local Driver</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" className="rounded border-gray-300 text-[#1FA6DD] focus:ring-[#1FA6DD]" />
                                                <span className="text-sm text-gray-700 group-hover:text-gray-900">Corporate Branding on Cab</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Exact Orange Explore Cabs Button placement */}
                    <div className="absolute left-1/2 -bottom-6 -translate-x-1/2">
                        <button
                            onClick={() => router.push('/b2b-demo/checkout')}
                            className="bg-[#F37021] hover:bg-[#d9651d] text-white font-bold px-12 py-3 rounded text-sm shadow-md transition-colors"
                        >
                            EXPLORE CABS
                        </button>
                    </div>
                </div>

                {/* Top Rated Strip */}
                <div className="flex justify-center mt-12 mb-6 text-white text-xs items-center gap-2 drop-shadow-md">
                    <span>🌿</span>
                    <span className="italic">India's Top Rated Car Rental Service</span>
                    <span>🌿</span>
                </div>

                {/* App Download Pill */}
                <div className="flex justify-center pb-20">
                    <div className="bg-white rounded-full shadow-lg p-2 px-6 flex items-center justify-center gap-6 divide-x divide-gray-200 shrink-0">
                        <div className="flex items-center gap-3 pr-6">
                            <div className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center font-bold">A</div>
                            <div>
                                <div className="text-xs font-bold text-gray-900">App Store</div>
                                <div className="text-[10px] text-gray-500">★★★★★ <br />(4.2K+ Reviews)</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pl-6 pr-6">
                            <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-red-500">G</div>
                            <div>
                                <div className="text-xs font-bold text-gray-900">Google</div>
                                <div className="text-[10px] text-gray-500">★★★★★ <br />(6.1K+ Reviews)</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pl-6">
                            <div className="w-8 h-8 rounded flex items-center justify-center text-green-500">▶</div>
                            <div>
                                <div className="text-xs font-bold text-gray-900">Play Store</div>
                                <div className="text-[10px] text-gray-500">★★★★★ <br />(15.5K+ Reviews)</div>
                            </div>
                        </div>
                    </div>
                </div>

            </section>

            {/* Promotional Banners (Bottom of screenshot 1) */}
            <section className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 pointer-events-none">
                <div className="h-48 bg-[#FFF4E6] rounded-xl overflow-hidden relative border border-orange-100 flex flex-col justify-end p-4">
                    <h3 className="text-2xl font-bold text-[#1FA6DD] text-center mb-1">Book Now</h3>
                    <p className="text-gray-800 font-bold text-center">at zero cost</p>
                </div>
                <div className="h-48 bg-gray-900 rounded-xl overflow-hidden relative border border-gray-800 flex flex-col justify-end p-4">
                    <h3 className="text-2xl font-bold text-[#1FA6DD] text-center mb-1">Book up to 1 hour</h3>
                    <p className="text-gray-300 font-medium text-center">before your trip starts</p>
                </div>
                <div className="h-48 bg-[#E6F4F9] rounded-xl overflow-hidden relative border border-blue-100 flex flex-col justify-end p-4">
                    <h3 className="text-2xl font-bold text-[#1FA6DD] text-center mb-1">Free Cancellations</h3>
                    <p className="text-gray-800 font-medium text-center">up to 1 hour before your trip</p>
                </div>
            </section>

            {/* Legacy Mobile Number Modal Overlay (Screenshot 2) */}
            {showMobileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="bg-[#1FA6DD] px-4 py-3 flex justify-between items-center text-white">
                            <span className="font-medium text-sm">Enter your mobile number to proceed</span>
                            <button onClick={() => setShowMobileModal(false)} className="hover:text-gray-200">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 pb-6">
                            <div className="flex gap-2 mb-6">
                                <select className="border border-gray-300 rounded p-2 text-sm text-gray-700 w-1/3 bg-white outline-none">
                                    <option>India (+91)</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Eg. 99XXXXXXX"
                                    className="border border-gray-300 rounded p-2 text-sm text-gray-700 w-2/3 outline-none"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                />
                            </div>

                            <button className="w-full bg-[#F37021] hover:bg-[#d9651d] text-white font-bold py-3 rounded text-sm mb-4">
                                CONTINUE
                            </button>

                            <p className="text-center text-[10px] text-gray-500">
                                By proceeding, you agree to Savaari's <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">T&Cs</a>
                            </p>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

// Temporary patch to fix missing X icon import above if it errors, but Lucide usually includes it.
function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );
}
