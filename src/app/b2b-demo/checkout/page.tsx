'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowLeft, Wallet } from 'lucide-react';
import { useState } from 'react';
import B2BHeader from '../components/B2BHeader';

export default function B2BCheckoutFlow() {
    const router = useRouter();
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

    // Simulated wallet stats for demo
    const walletBalance = 1500; // Less than the 2500 needed for the demo trip! Low balance simulation.
    const baseFare = 10000;
    const advanceRequired = baseFare * 0.25; // 2500

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

            <B2BHeader />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 w-full py-8">

                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.push('/b2b-demo/dashboard')} className="p-2 hover:bg-gray-300 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Checkout & Payment Responsibility</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Payment Responsibility Options (The Core PRD Feature) */}
                    <div className="flex-1 space-y-6">

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-800 text-white px-6 py-4 border-b border-gray-200">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <span className="bg-[#1FA6DD] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    Select Payment Mode
                                </h2>
                                <p className="text-xs text-gray-300 mt-1 pl-8">Configure who pays for what part of this trip.</p>
                            </div>

                            <div className="p-6 space-y-4">

                                {/* Option 1 */}
                                <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === 'opt1' ? 'border-[#1FA6DD] bg-blue-50/50 shadow-md transform -translate-y-0.5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            <input
                                                type="radio"
                                                name="payment_split"
                                                className="w-5 h-5 text-[#1FA6DD] mt-1"
                                                checked={selectedPayment === 'opt1'}
                                                onChange={() => setSelectedPayment('opt1')}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">Option 1: Partial Agent Payment + Customer Pays Balance to Driver</h3>
                                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                                                <p><span className="text-gray-900 font-medium">Agent Pays:</span> 25% of Base Fare now (₹{advanceRequired}).</p>
                                                <p><span className="text-gray-900 font-medium">Customer Pays:</span> 75% of Base Fare + ALL EXTRAS directly to driver.</p>
                                            </div>
                                            <div className="mt-3 inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                                <CheckCircle2 className="w-3 h-3" /> Price breakup will not be shown to customer.
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                {/* Option 2 */}
                                <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === 'opt2' ? 'border-[#1FA6DD] bg-blue-50/50 shadow-md transform -translate-y-0.5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            <input
                                                type="radio"
                                                name="payment_split"
                                                className="w-5 h-5 text-[#1FA6DD] mt-1"
                                                checked={selectedPayment === 'opt2'}
                                                onChange={() => setSelectedPayment('opt2')}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-900 leading-tight">Option 2: Full Agent Responsibility for Base Fare</h3>
                                                <span className="text-[10px] font-bold bg-[#F37021] text-white px-2 py-0.5 rounded ml-2 whitespace-nowrap">B2B PREFERRED</span>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                                                <p><span className="text-gray-900 font-medium">Agent Pays NOW:</span> 25% of Base Fare (₹{advanceRequired}).</p>
                                                <p><span className="text-gray-900 font-medium">Agent Pays LATER:</span> Remaining 75% (₹7,500) strictly 48 hours before trip.</p>
                                                <p><span className="text-gray-900 font-medium">Customer Pays:</span> ONLY Extra KM/Tolls to driver.</p>
                                            </div>
                                            <div className="mt-3 inline-flex flex-wrap items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2 py-1 rounded">
                                                <AlertCircle className="w-3 h-3" /> Fallback Rule: If 75% not paid by T-48h, booking automatically downgrades to Option 1.
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                {/* Option 3 */}
                                <label className={`block border rounded-lg p-4 cursor-pointer transition-all ${selectedPayment === 'opt3' ? 'border-[#1FA6DD] bg-blue-50/50 shadow-md transform -translate-y-0.5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            <input
                                                type="radio"
                                                name="payment_split"
                                                className="w-5 h-5 text-[#1FA6DD] mt-1"
                                                checked={selectedPayment === 'opt3'}
                                                onChange={() => setSelectedPayment('opt3')}
                                                disabled={walletBalance < advanceRequired}
                                            />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold leading-tight ${walletBalance < advanceRequired ? 'text-gray-400' : 'text-gray-900'}`}>Option 3: Agent + Wallet-Based Extras Settlement</h3>
                                            <div className={`mt-2 text-sm space-y-1 ${walletBalance < advanceRequired ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <p><span className="font-medium">Agent Pays NOW:</span> 25% (₹{advanceRequired}).</p>
                                                <p><span className="font-medium">Agent Pays LATER:</span> 75% Base 48hrs before.</p>
                                                <p><span className="font-medium flex items-center gap-1"><Wallet className="w-3 h-3" /> All Extras:</span> Deducted automatically from Agent Wallet post-trip.</p>
                                            </div>

                                            {/* Wallet check logic from PRD */}
                                            {walletBalance < advanceRequired && (
                                                <div className="mt-3 inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-1 rounded">
                                                    <AlertCircle className="w-3 h-3" /> Ineligible: Wallet balance (₹{walletBalance}) is below required 25% base fare (₹{advanceRequired}).
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </label>

                            </div>
                        </div>

                        {/* Simulated Payment Gateway Trigger */}
                        {selectedPayment && (
                            <div className="bg-white rounded-xl shadow-sm border border-[#1FA6DD] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="bg-blue-50 px-6 py-4 flex justify-between items-center border-b border-[#1FA6DD]/20">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Amount to Pay Now</h3>
                                        <p className="text-xs text-gray-500">25% Advance to confirm booking</p>
                                    </div>
                                    <div className="text-2xl font-black text-[#1FA6DD]">₹{advanceRequired}</div>
                                </div>
                                <div className="p-6 bg-white">
                                    <button className="w-full bg-[#1FA6DD] hover:bg-[#1889B6] text-white font-bold py-4 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                                        onClick={() => {
                                            alert('Demo: Redirecting to Payment Gateway (Razorpay/Wallet Deduction)');
                                            router.push('/b2b-demo/dashboard');
                                        }}
                                    >
                                        PROCEED TO SECURE PAYMENT
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Trip Summary Context */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <span className="font-bold text-gray-800">Trip Summary</span>
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Outstation</span>
                            </div>

                            <div className="p-6 space-y-4">

                                <div className="space-y-3 pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold">PICKUP</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">Indira Gandhi Intl Airport, T3</p>
                                        <p className="text-xs text-gray-600">25-02-2026 at 7:00 AM</p>
                                    </div>
                                    <div className="pl-2 border-l-2 border-dashed border-gray-300 ml-1 py-1 h-4"></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold">DROP</p>
                                        <p className="text-sm font-medium text-gray-900">Taj Mahal, Agra</p>
                                    </div>
                                </div>

                                <div className="space-y-2 pb-4 border-b border-gray-100">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Vehicle Type</span>
                                        <span className="font-medium text-gray-900">Innova Crysta</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Distance Limit</span>
                                        <span className="font-medium text-gray-900">300 KM</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Agency Markup Applied</span>
                                        <span className="font-medium text-[#1FA6DD]">12% (Hidden)</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-gray-900">Total Operational Base Fare</span>
                                        <span className="text-xl font-black text-gray-900">₹{baseFare.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 text-right">Excludes Tolls, Taxes, and Extra KMs</p>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
