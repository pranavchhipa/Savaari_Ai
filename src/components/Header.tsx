'use client';

import Link from 'next/link';
import { Phone, Download, Menu, X, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 transition-all duration-300 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-blue-900/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md group-hover:blur-lg transition-all" />
                            <div className="relative w-full h-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-xl flex items-center justify-center border border-white/20">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-gray-900 tracking-tight">Savaari</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[#F97316] rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sarathi AI</span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-gray-600 hover:text-[#2563EB] font-medium transition-colors hover:scale-105 transform">
                            Home
                        </Link>
                        <Link href="/listing" className="text-gray-600 hover:text-[#2563EB] font-medium transition-colors hover:scale-105 transform">
                            Explore Cabs
                        </Link>
                        <Link href="#" className="text-gray-600 hover:text-[#2563EB] font-medium transition-colors hover:scale-105 transform">
                            About
                        </Link>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Support Number */}
                        <a
                            href="tel:+919880112233"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/50 transition-all group"
                        >
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-[#2563EB] transition-colors">
                                <Phone className="w-4 h-4 text-[#2563EB] group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">24x7 Support</span>
                                <span className="font-bold text-sm text-gray-800 group-hover:text-[#2563EB] transition-colors">+91 98801-12233</span>
                            </div>
                        </a>

                        {/* Download App Button */}
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 hover:bg-gray-800 transition-all hover:-translate-y-0.5">
                            <Download className="w-4 h-4" />
                            <span>Get App</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-[#2563EB] transition-colors bg-white/50 rounded-lg"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100/50 bg-white/80 backdrop-blur-xl absolute left-0 right-0 px-4 shadow-xl">
                        <nav className="flex flex-col gap-2">
                            <Link
                                href="/"
                                className="px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#2563EB] rounded-xl font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/listing"
                                className="px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#2563EB] rounded-xl font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Explore Cabs
                            </Link>
                            <Link
                                href="#"
                                className="px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#2563EB] rounded-xl font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                About
                            </Link>
                        </nav>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                            <a
                                href="tel:+919880112233"
                                className="flex items-center gap-3 px-4 py-2 text-gray-700"
                            >
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-[#2563EB]" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">24x7 Support</div>
                                    <div className="font-semibold">+91 98801-12233</div>
                                </div>
                            </a>

                            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium shadow-lg">
                                <Download className="w-5 h-5" />
                                <span>Download App</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
