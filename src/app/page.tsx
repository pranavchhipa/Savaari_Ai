// Page updated at ${new Date().toISOString()}
'use client';

import SearchWidget from '@/components/SearchWidget';
import Logo from '@/components/Logo';
import { Car, Shield, Clock, MapPin, Star, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <section className="relative pt-6 pb-24 md:pt-10 md:pb-32 overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
            alt="Scenic road trip background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white/90 rounded-full text-sm font-medium mb-8 border border-white/20 shadow-lg"
            >
              <Star className="w-3.5 h-3.5 text-[#F97316] fill-[#F97316]" />
              <span>India&apos;s Most Trusted Car Rental</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
              Road Trips,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#A78BFA]">
                Reimagined
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-2 leading-relaxed drop-shadow-md">
              Experience seamless outstation travel with{' '}
              <span className="font-semibold text-[#F97316]">Sarathi AI™</span>.
            </p>
            <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto drop-shadow-md">
              Smart routes, hidden gems, and transparent pricing — all in one place.
            </p>
          </motion.div>

          {/* Search Widget */}
          <SearchWidget />
        </div>
      </section>

      {/* Features Section - Minimal Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Why Choose Savaari?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Hassle-free travel with verified drivers, transparent pricing, and 24×7 support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Car,
                title: 'Premium Fleet',
                desc: 'Well-maintained sedans to SUVs for every budget and journey.',
                color: '#2563EB',
                bg: 'from-blue-50 to-white',
                border: 'border-blue-100',
              },
              {
                icon: Shield,
                title: 'Verified Drivers',
                desc: 'Background-verified, professional drivers you can trust.',
                color: '#10B981',
                bg: 'from-emerald-50 to-white',
                border: 'border-emerald-100',
              },
              {
                icon: Clock,
                title: '24×7 Support',
                desc: 'Round-the-clock assistance for any help during your trip.',
                color: '#F97316',
                bg: 'from-orange-50 to-white',
                border: 'border-orange-100',
              },
              {
                icon: Zap,
                title: 'Sarathi™ AI',
                desc: 'Smart route planning with curated stops and live pricing.',
                color: '#7C3AED',
                bg: 'from-purple-50 to-white',
                border: 'border-purple-100',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group p-6 bg-gradient-to-br ${feature.bg} rounded-2xl border ${feature.border} hover:shadow-xl transition-all duration-300 cursor-default`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                  style={{ backgroundColor: feature.color, boxShadow: `0 8px 24px ${feature.color}30` }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Redesigned */}
      <section className="py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-10 md:p-14 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F97316]/10 rounded-full blur-[60px]" />

            {/* Dotted grid */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { value: '50L+', label: 'Happy Customers', icon: '🎉' },
                { value: '300+', label: 'Cities Covered', icon: '📍' },
                { value: '4.8★', label: 'Average Rating', icon: '⭐' },
                { value: '10K+', label: 'Verified Drivers', icon: '🚗' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl mb-3">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Ready to hit the road?
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto mb-8">
              Book your cab in under 2 minutes. Let Sarathi AI plan the perfect journey for you.
            </p>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all"
            >
              Plan Your Trip
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer - Clean */}
      <footer className="py-10 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-white">Savaari</span>
                <span className="text-[10px] font-medium text-gray-500 uppercase">Powered by Sarathi AI</span>
              </div>
            </div>
            <div className="text-center md:text-right text-gray-500 text-sm">
              <p>© 2024 Savaari Car Rentals. All rights reserved.</p>
              <p className="mt-1 text-gray-600">Made with ❤️ for travelers across India</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
