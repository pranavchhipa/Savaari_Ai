'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Phone, Briefcase } from 'lucide-react';

export default function B2CDemoHome() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Fake B2C Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-lg"></div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Savaari</span>
                    </div>

                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        Login / Sign Up
                    </button>
                </div>
            </header>

            {/* Fake content body */}
            <main className="max-w-7xl mx-auto p-8 opacity-50 pointer-events-none">
                <div className="h-64 bg-gray-200 rounded-2xl w-full mb-8"></div>
                <div className="flex gap-8">
                    <div className="h-40 bg-gray-200 rounded-2xl w-1/3"></div>
                    <div className="h-40 bg-gray-200 rounded-2xl w-1/3"></div>
                    <div className="h-40 bg-gray-200 rounded-2xl w-1/3"></div>
                </div>
            </main>

            {/* The Actual Login Modal Simulator */}
            <AnimatePresence>
                {showLoginModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                        >
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                                <p className="text-gray-500 text-sm mb-6">Login or sign up to continue</p>

                                {/* Consumer Login Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Mobile Number</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter your 10 digit number"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all">
                                        Generate OTP
                                    </button>
                                </div>
                            </div>

                            {/* The Bridge to B2B */}
                            <div className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col items-center justify-center text-center">
                                <p className="text-sm text-gray-600 mb-3">Are you a Travel Agent or Corporate Partner?</p>
                                <button
                                    onClick={() => router.push('/b2b-demo/login')}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-[#2563EB] hover:text-[#2563EB] hover:shadow-sm transition-all shadow-sm"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Go to Agent Portal
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
