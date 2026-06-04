'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, Shield, IndianRupee, Headphones, Star, ArrowRight } from 'lucide-react';
import SearchWidget from '@/components/SearchWidget';
import PackageCard from '@/components/PackageCard';
import Logo from '@/components/Logo';
import { getPackageById, TravelPackage } from '@/lib/packages';

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    bangalore: { lat: 12.9716, lng: 77.5946 },
    mysore: { lat: 12.2958, lng: 76.6394 },
};
function cityLoc(name: string) {
    const c = CITY_COORDS[name.toLowerCase()] || { lat: 0, lng: 0 };
    return { name, displayName: `${name}, Karnataka, India`, lat: c.lat, lng: c.lng };
}

const FEATURED_IDS = ['rt-blr-mys-romantic', 'rt-blr-mys-family', 'ow-blr-mys-solo', 'lo-blr-romantic', 'lo-mys-family', 'rt-blr-mys-solo'];

const QUICK_ROUTES = [
    { label: 'Bangalore → Mysore', from: 'Bangalore', to: 'Mysore', tripType: 'round-trip' as const },
    { label: 'Mysore Day Trip', from: 'Bangalore', to: 'Mysore', tripType: 'one-way' as const },
    { label: 'Local Bangalore', from: 'Bangalore', to: 'Bangalore', tripType: 'local' as const },
    { label: 'Local Mysore', from: 'Mysore', to: 'Mysore', tripType: 'local' as const },
];

export default function Home() {
    const router = useRouter();
    const featured = FEATURED_IDS.map(getPackageById).filter((p): p is TravelPackage => p !== null);

    const go = (from: string, to: string, tripType: 'one-way' | 'round-trip' | 'local') => {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        sessionStorage.setItem('savaari_search', JSON.stringify({
            source: cityLoc(from),
            destination: tripType === 'local' ? null : cityLoc(to),
            tripType, pickupDate: tomorrow, pickupTime: '07:00',
        }));
        router.push('/packages');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HERO + SEARCH (on top) */}
            <section className="relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] pt-12 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F97316]/15 rounded-full blur-[100px]" />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
                />

                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md text-white/90 rounded-full text-xs font-medium mb-6 border border-white/15"
                    >
                        <Star className="w-3.5 h-3.5 text-[#F97316] fill-[#F97316]" />
                        India&apos;s Most Trusted Car Rental
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight"
                    >
                        Curated road-trip{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#A78BFA]">packages</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        className="text-base md:text-lg text-gray-300 mt-4 max-w-2xl mx-auto"
                    >
                        Handpicked stops, all-inclusive pricing, zero planning. One-way, round-trip &amp; local — pick a trip and go.
                    </motion.p>

                    {/* SEARCH WIDGET — on top */}
                    <div className="mt-9">
                        <SearchWidget />
                    </div>
                </div>
            </section>

            {/* FEATURED PACKAGES */}
            <section className="relative z-20 -mt-16 pb-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-5">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Popular packages</h2>
                            <p className="text-sm text-gray-500">Ready-to-book trips, loved by travellers.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featured.map((p, i) => (
                            <PackageCard key={p.id} pkg={p} index={i} onSelect={(pkg) => go(pkg.from, pkg.to, pkg.tripType)} />
                        ))}
                    </div>
                </div>
            </section>

            {/* QUICK ROUTES */}
            <section className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Browse by trip</h3>
                    <div className="flex flex-wrap gap-3">
                        {QUICK_ROUTES.map((r) => (
                            <button
                                key={r.label}
                                onClick={() => go(r.from, r.to, r.tripType)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] hover:shadow-md transition-all"
                            >
                                {r.label}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY SAVAARI */}
            <section className="py-14 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">Why book a package?</h2>
                    <p className="text-gray-500 text-center max-w-xl mx-auto mb-10">Everything sorted before you leave — no haggling, no surprises.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { icon: Package, title: 'Curated Packages', desc: 'Handpicked itineraries with the best stops on every route.', color: '#2563EB', bg: 'from-blue-50 to-white', border: 'border-blue-100' },
                            { icon: Shield, title: 'Verified Drivers', desc: 'Background-checked, professional drivers you can trust.', color: '#10B981', bg: 'from-emerald-50 to-white', border: 'border-emerald-100' },
                            { icon: IndianRupee, title: 'All-Inclusive Pricing', desc: 'Fuel, driver and tolls baked in. The price you see is final.', color: '#F97316', bg: 'from-orange-50 to-white', border: 'border-orange-100' },
                            { icon: Headphones, title: '24×7 Support', desc: 'Round-the-clock help before, during and after your trip.', color: '#7C3AED', bg: 'from-purple-50 to-white', border: 'border-purple-100' },
                        ].map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                className={`group p-6 bg-gradient-to-br ${f.bg} rounded-2xl border ${f.border} hover:shadow-xl transition-all duration-300`}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg" style={{ backgroundColor: f.color, boxShadow: `0 8px 24px ${f.color}30` }}>
                                    <f.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1.5">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-10 md:p-14 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F97316]/10 rounded-full blur-[60px]" />
                        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                            {[
                                { value: '50L+', label: 'Happy Customers', icon: '🎉' },
                                { value: '300+', label: 'Cities Covered', icon: '📍' },
                                { value: '4.8★', label: 'Average Rating', icon: '⭐' },
                                { value: '10K+', label: 'Verified Drivers', icon: '🚗' },
                            ].map((s, i) => (
                                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                                    <div className="text-2xl mb-3">{s.icon}</div>
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">{s.value}</div>
                                    <div className="text-sm text-gray-400 font-medium">{s.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-10 bg-[#0F172A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Logo className="w-10 h-10" />
                            <span className="text-xl font-bold text-white">Savaari</span>
                        </div>
                        <div className="text-center md:text-right text-gray-500 text-sm">
                            <p>© 2026 Savaari Car Rentals. All rights reserved.</p>
                            <p className="mt-1 text-gray-600">Made with ❤️ for travellers across India</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
