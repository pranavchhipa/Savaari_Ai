import SearchWidget from '@/components/SearchWidget';
import { Car, Shield, Clock, Star, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F2FE] via-[#F1F5F9] to-[#FFEDD5]">
      {/* Hero Section */}
      <section className="relative pt-6 pb-24 md:pt-10 md:pb-32 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/50 to-orange-100/50 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#2563EB] rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-current" />
              <span>India's Most Trusted Car Rental</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Road Trips,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#7C3AED]">
                Reimagined
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Experience seamless outstation travel with <span className="font-semibold text-[#F97316]">Sarathi AI™</span>.
              Smart routes, perfect stops, and unforgettable memories.
            </p>
          </div>

          {/* Search Widget */}
          <SearchWidget />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Savaari?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience hassle-free travel with verified drivers, transparent pricing, and 24x7 support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                <Car className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Fleet</h3>
              <p className="text-gray-600 text-sm">
                Wide range of well-maintained cars from sedans to SUVs for every budget.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Drivers</h3>
              <p className="text-gray-600 text-sm">
                Background-verified, professional drivers with excellent track records.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">24x7 Support</h3>
              <p className="text-gray-600 text-sm">
                Round-the-clock customer support for any assistance during your trip.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sarathi™ AI Planner</h3>
              <p className="text-gray-600 text-sm">
                Smart trip planning with suggested stops, routes, and real-time pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50L+</div>
              <div className="text-blue-200">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">300+</div>
              <div className="text-blue-200">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">4.8★</div>
              <div className="text-blue-200">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-200">Verified Drivers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Savaari</span>
                <span className="ml-2 text-sm text-gray-400">Sarathi™</span>
              </div>
            </div>
            <div className="text-center md:text-right text-gray-400 text-sm">
              <p>© 2024 Savaari Car Rentals. All rights reserved.</p>
              <p className="mt-1">Made with ❤️ for travelers across India</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
