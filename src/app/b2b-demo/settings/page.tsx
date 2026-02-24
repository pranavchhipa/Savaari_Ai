'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, Percent, IndianRupee, Save, ArrowLeft } from 'lucide-react';
import B2BHeader from '../components/B2BHeader';
import { useState } from 'react';

export default function AccountSettingsLegacyStyle() {
    const router = useRouter();
    const [allowComm, setAllowComm] = useState(true);
    const [activeTab, setActiveTab] = useState<'personal' | 'markup'>('markup');

    // Markup State (from PRD implementation plan)
    const [markupType, setMarkupType] = useState<'percentage' | 'flat'>('percentage');
    const [markups, setMarkups] = useState({
        airport: '10',
        local: '15',
        outstation: '12'
    });

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">

            <B2BHeader />

            {/* Breadcrumb Row */}
            <div className="bg-[#F2F2F2] border-b border-gray-200 py-2">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-[10px] text-gray-500 flex gap-1 items-center">
                        <span className="hover:underline cursor-pointer" onClick={() => router.push('/b2b-demo/dashboard')}>Home</span>
                        <span>&gt;</span>
                        <span className="text-gray-800 font-medium">Account Settings</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 mb-1">
                        <button onClick={() => router.push('/b2b-demo/dashboard')} className="p-1 hover:bg-gray-300 rounded-full transition-colors -ml-1">
                            <ArrowLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <h1 className="text-gray-800 text-lg font-bold">Account Settings</h1>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 w-full flex py-8 gap-8">

                {/* Left Sidebar Menu */}
                <div className="w-64 flex-shrink-0">
                    <div className="border border-gray-200 rounded overflow-hidden">
                        <div
                            onClick={() => setActiveTab('personal')}
                            className={`p-4 flex justify-between items-center text-sm cursor-pointer border-b border-gray-200 transition-colors ${activeTab === 'personal' ? 'bg-white text-[#1FA6DD]' : 'bg-[#F9F9F9] text-gray-700 hover:bg-white'}`}
                        >
                            <span>Personal Info</span>
                            {activeTab === 'personal' && <ChevronRight className="w-4 h-4" />}
                        </div>
                        <div
                            onClick={() => setActiveTab('markup')}
                            className={`p-4 flex justify-between items-center text-sm cursor-pointer transition-colors ${activeTab === 'markup' ? 'bg-[#1FA6DD] text-white font-bold' : 'bg-[#F9F9F9] text-gray-700 hover:bg-white'}`}
                        >
                            <span>Markup Settings</span>
                            {activeTab === 'markup' && <ChevronRight className="w-4 h-4" />}
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 max-w-2xl">
                    {activeTab === 'personal' ? (
                        <div className="space-y-4 animate-in fade-in duration-300">

                            {/* Name */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#1FA6DD]"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#1FA6DD]"
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value="917030343566"
                                    readOnly
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 outline-none bg-gray-50"
                                />
                            </div>

                            {/* WhatsApp Toggle */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setAllowComm(!allowComm)}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${allowComm ? 'bg-[#4ADE80]' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${allowComm ? 'right-0.5' : 'left-0.5'}`}></div>
                                </button>
                                <span className="text-xs text-gray-600 font-medium">
                                    Allow Savaari to communicate over Whatsapp & SMS for Trip-related Details & Offers
                                </span>
                            </div>

                            {/* Update Button */}
                            <div className="pt-6 flex justify-end">
                                <button className="bg-[#1FA6DD] hover:bg-[#1889B6] text-white text-sm font-semibold px-8 py-2.5 rounded transition-colors shadow-sm">
                                    UPDATE
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                                <h3 className="text-[#1FA6DD] font-bold text-sm mb-1">Confidential Pricing Engine</h3>
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    Define your profit margins here. The base supplier rate will reman hidden from your customers. The final invoice generated for the customer will automatically include these markups.
                                </p>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-800">Markup Strategy</h4>
                                </div>
                                <div className="p-5 flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="markupType"
                                            checked={markupType === 'percentage'}
                                            onChange={() => setMarkupType('percentage')}
                                            className="w-4 h-4 text-[#1FA6DD]"
                                        />
                                        <span className="text-sm text-gray-700 font-medium">Percentage (%)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="markupType"
                                            checked={markupType === 'flat'}
                                            onChange={() => setMarkupType('flat')}
                                            className="w-4 h-4 text-[#1FA6DD]"
                                        />
                                        <span className="text-sm text-gray-700 font-medium">Flat Amount (₹)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-800">Trip-Specific Margins</h4>
                                </div>
                                <div className="p-5 space-y-5">
                                    {/* Airport */}
                                    <div className="flex items-center justify-between">
                                        <div className="w-1/3">
                                            <label className="text-sm font-bold text-gray-700">Airport Transfers</label>
                                        </div>
                                        <div className="w-2/3 relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                {markupType === 'percentage' ? <Percent className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
                                            </div>
                                            <input
                                                type="number"
                                                value={markups.airport}
                                                onChange={(e) => setMarkups({ ...markups, airport: e.target.value })}
                                                className="w-full border border-gray-300 rounded px-10 py-2 text-sm outline-none focus:border-[#1FA6DD] focus:ring-1 focus:ring-[#1FA6DD]"
                                            />
                                        </div>
                                    </div>

                                    {/* Local */}
                                    <div className="flex items-center justify-between">
                                        <div className="w-1/3">
                                            <label className="text-sm font-bold text-gray-700">Local Hourly</label>
                                        </div>
                                        <div className="w-2/3 relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                {markupType === 'percentage' ? <Percent className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
                                            </div>
                                            <input
                                                type="number"
                                                value={markups.local}
                                                onChange={(e) => setMarkups({ ...markups, local: e.target.value })}
                                                className="w-full border border-gray-300 rounded px-10 py-2 text-sm outline-none focus:border-[#1FA6DD] focus:ring-1 focus:ring-[#1FA6DD]"
                                            />
                                        </div>
                                    </div>

                                    {/* Outstation */}
                                    <div className="flex items-center justify-between">
                                        <div className="w-1/3">
                                            <label className="text-sm font-bold text-gray-700">Outstation</label>
                                        </div>
                                        <div className="w-2/3 relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                {markupType === 'percentage' ? <Percent className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
                                            </div>
                                            <input
                                                type="number"
                                                value={markups.outstation}
                                                onChange={(e) => setMarkups({ ...markups, outstation: e.target.value })}
                                                className="w-full border border-gray-300 rounded px-10 py-2 text-sm outline-none focus:border-[#1FA6DD] focus:ring-1 focus:ring-[#1FA6DD]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button className="bg-[#F37021] hover:bg-[#d9651d] text-white text-sm font-bold px-8 py-3 rounded transition-colors shadow-md flex items-center gap-2">
                                    <Save className="w-4 h-4" /> SAVE MARKUP RULES
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </main>

        </div>
    );
}
