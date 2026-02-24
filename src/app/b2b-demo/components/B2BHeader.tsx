'use client';

import { useRouter } from 'next/navigation';
import { Phone, User, LogOut, Settings, CalendarDays } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function B2BHeader() {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center cursor-pointer transition-transform hover:scale-105" onClick={() => router.push('/b2b-demo/dashboard')}>
                    <span className="text-2xl font-black text-[#1FA6DD] italic tracking-tighter">SAVAARI</span>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center border border-[#1FA6DD] rounded-full overflow-hidden h-8 shadow-sm">
                        <div className="bg-white px-3 flex items-center gap-2 h-full">
                            <Phone className="w-3.5 h-3.5 text-[#1FA6DD]" />
                            <span className="text-xs font-semibold text-gray-700">24x7</span>
                        </div>
                        <div className="bg-[#1FA6DD] px-3 h-full flex items-center">
                            <span className="text-xs font-bold text-white tracking-wide">090 4545 0000</span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4 text-sm font-medium">
                        <button className="hidden md:block px-4 py-1.5 border border-gray-600 rounded-full text-gray-700 hover:bg-gray-50 hover:border-gray-900 transition-colors shadow-sm text-xs font-bold">
                            Get App
                        </button>

                        {/* Authenticated user pill - Click to open instead of hover for better UX */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className={`px-4 py-1.5 text-white rounded-full flex items-center gap-2 transition-all shadow-md active:scale-95 ${dropdownOpen ? 'bg-[#1889B6] ring-2 ring-blue-200' : 'bg-[#1FA6DD] hover:bg-[#1889B6]'}`}
                            >
                                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                    <User className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-xs font-bold tracking-wide">Hi, 7030343..</span>
                            </button>

                            {/* Dropdown Menu - Positioned with no gap to ensure it doesn't break if hover was used, but we use click now */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Agent Account</p>
                                    </div>

                                    <button
                                        onClick={() => { setDropdownOpen(false); router.push('/b2b-demo/bookings'); }}
                                        className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1FA6DD] transition-colors flex items-center gap-3 group"
                                    >
                                        <CalendarDays className="w-4 h-4 text-gray-400 group-hover:text-[#1FA6DD]" />
                                        <span className="font-medium">My Bookings</span>
                                    </button>

                                    <button
                                        onClick={() => { setDropdownOpen(false); router.push('/b2b-demo/settings'); }}
                                        className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1FA6DD] transition-colors flex items-center gap-3 group"
                                    >
                                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#1FA6DD]" />
                                        <span className="font-medium">Account Settings</span>
                                    </button>

                                    <div className="mx-4 border-t border-gray-100 my-1"></div>

                                    <button
                                        onClick={() => { setDropdownOpen(false); alert('Logged out'); router.push('/b2b-demo'); }}
                                        className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                                    >
                                        <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                                        <span className="font-medium">Log Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>

            </div>
        </header>
    );
}
