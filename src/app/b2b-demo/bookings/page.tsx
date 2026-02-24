'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import B2BHeader from '../components/B2BHeader';

export default function BookingsLegacyStyle() {
    const router = useRouter();

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
                        <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center text-[#1FA6DD] text-sm cursor-pointer hover:bg-gray-50">
                            <span>Upcoming</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="bg-[#F9F9F9] p-4 text-gray-700 text-sm cursor-pointer border-b border-gray-200 hover:bg-white">
                            Current
                        </div>
                        <div className="bg-[#F9F9F9] p-4 text-gray-700 text-sm cursor-pointer hover:bg-white">
                            History
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1">
                    <div className="border border-gray-300 p-4 rounded text-sm text-gray-700">
                        Something went wrong. Please <span className="underline cursor-pointer hover:text-gray-900">try again</span>.
                    </div>
                </div>

            </main>

        </div>
    );
}
