// Header updated at ${new Date().toISOString()}
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Phone, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/Logo';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <Logo className="w-10 h-10 group-hover:scale-105 transition-transform duration-300" />
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold text-gray-900 tracking-tight">Savaari</span>
                            <span className="text-[10px] font-semibold text-[#F97316] tracking-wide uppercase">Powered by Sarathi AI</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors">
                            Home
                        </Link>
                        <Link href="/listing" className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors">
                            Book a Cab
                        </Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="tel:+919045450000"
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            <span>9045-450-000</span>
                        </a>
                        <Link
                            href="/listing"
                            className="px-5 py-2 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                        >
                            Get App
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-3">
                            <Link
                                href="/"
                                className="block py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/listing"
                                className="block py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Book a Cab
                            </Link>
                            <a
                                href="tel:+919045450000"
                                className="flex items-center gap-2 py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                9045-450-000
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
