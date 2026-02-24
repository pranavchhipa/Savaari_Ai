'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Building2, CheckCircle2, ChevronRight, Lock, Mail, MapPin, Phone, UploadCloud } from 'lucide-react';

export default function AgentLoginRegister() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [regStep, setRegStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        router.push('/b2b-demo/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* B2B Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2563EB] rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-gray-900 tracking-tight block leading-none pt-1">Savaari</span>
                            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">B2B Agent Portal</span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/b2b-demo')}
                        className="text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                        ← Back to savaari.com
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
                {/* Background elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-70"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-[100px] opacity-70"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white w-full max-w-lg rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative z-10"
                >
                    {isSubmitted ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Received!</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Thank you for applying to join the Savaari B2B network. Our team will verify your details and activate your account within 24 hours.
                            </p>
                            <button
                                onClick={() => { setIsSubmitted(false); setActiveTab('login'); }}
                                className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all font-medium"
                            >
                                Return to Login
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => setActiveTab('login')}
                                    className={`flex-1 py-5 text-sm font-bold tracking-wide transition-colors relative ${activeTab === 'login' ? 'text-[#2563EB]' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    AGENT LOGIN
                                    {activeTab === 'login' && (
                                        <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('register')}
                                    className={`flex-1 py-5 text-sm font-bold tracking-wide transition-colors relative ${activeTab === 'register' ? 'text-[#2563EB]' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    REGISTER AS AGENT
                                    {activeTab === 'register' && (
                                        <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
                                    )}
                                </button>
                            </div>

                            {/* Form Container */}
                            <div className="p-8 pb-10">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'login' ? (
                                        <motion.div
                                            key="login"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-6"
                                        >
                                            <div className="text-center mb-8">
                                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back, Partner</h2>
                                                <p className="text-gray-500 text-sm">Log in to manage your bookings and wallet</p>
                                            </div>

                                            <form onSubmit={handleLogin} className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Email or Mobile Number</label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                            <Mail className="w-5 h-5" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="agent@company.com"
                                                            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all font-medium text-gray-900"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Password</label>
                                                        <a href="#" className="text-xs font-semibold text-[#2563EB] hover:underline">Forgot?</a>
                                                    </div>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                            <Lock className="w-5 h-5" />
                                                        </div>
                                                        <input
                                                            type="password"
                                                            required
                                                            placeholder="••••••••"
                                                            className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all font-medium text-gray-900"
                                                        />
                                                    </div>
                                                </div>

                                                <button type="submit" className="w-full py-4 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all mt-4">
                                                    Log Into Dashboard
                                                </button>
                                            </form>

                                            <div className="text-center mt-6">
                                                <span className="text-gray-400 text-sm">or</span>
                                            </div>
                                            <button className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">
                                                Login via OTP
                                            </button>
                                        </motion.div>

                                    ) : (

                                        <motion.div
                                            key="register"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {/* Step Indicator */}
                                            <div className="flex items-center justify-center gap-2 mb-8">
                                                <div className={`w-2.5 h-2.5 rounded-full ${regStep === 1 ? 'bg-[#2563EB]' : 'bg-gray-200'}`}></div>
                                                <div className={`w-2.5 h-2.5 rounded-full ${regStep === 2 ? 'bg-[#2563EB]' : 'bg-gray-200'}`}></div>
                                            </div>

                                            {regStep === 1 ? (
                                                <div className="space-y-4">
                                                    <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Contact Details</h2>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Full Name</label>
                                                        <input type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all" />
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div className="flex-1">
                                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Email</label>
                                                            <input type="email" placeholder="work@email.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Mobile</label>
                                                            <input type="text" placeholder="10 Digit Number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all" />
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setRegStep(2)}
                                                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all mt-6 flex items-center justify-center gap-2"
                                                    >
                                                        Next Step <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Agency Details</h2>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Agency / Company Name</label>
                                                        <div className="relative">
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                                <Building2 className="w-4 h-4" />
                                                            </div>
                                                            <input type="text" placeholder="Doe Travels Pvt Ltd" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all" />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">City of Operation</label>
                                                        <div className="relative">
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                                <MapPin className="w-4 h-4" />
                                                            </div>
                                                            <input type="text" placeholder="Bangalore, Mumbai, etc." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none transition-all" />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">PAN Number</label>
                                                            <input type="text" placeholder="ABCDE1234F" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none uppercase transition-all" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">GST Number</label>
                                                            <input type="text" placeholder="Optional" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] outline-none uppercase transition-all" />
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                                            <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-[#2563EB] transition-colors" />
                                                            <span className="text-xs font-medium text-gray-500">Upload PAN Card/Company Proof</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3 pt-4">
                                                        <button
                                                            onClick={() => setRegStep(1)}
                                                            className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                                                        >
                                                            Back
                                                        </button>
                                                        <button
                                                            onClick={() => setIsSubmitted(true)}
                                                            className="flex-1 py-4 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                                                        >
                                                            Submit Application
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
