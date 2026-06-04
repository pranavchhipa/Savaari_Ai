'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Calendar, Clock, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location } from '@/types';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

type TripTab = 'one-way' | 'round-trip' | 'local';

const TAB_LABEL: Record<TripTab, string> = { 'one-way': 'One Way', 'round-trip': 'Round Trip', 'local': 'Local' };

export default function SearchWidget() {
    const router = useRouter();
    const [source, setSource] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [sourceQuery, setSourceQuery] = useState('');
    const [destQuery, setDestQuery] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [dropDate, setDropDate] = useState('');
    const [pickupTime, setPickupTime] = useState('07:00');
    const [tripTab, setTripTab] = useState<TripTab>('one-way');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setPickupDate(tomorrow.toISOString().split('T')[0]);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);
        setDropDate(dayAfter.toISOString().split('T')[0]);
    }, []);

    const swapLocations = () => {
        const s = source, q = sourceQuery;
        setSource(destination); setSourceQuery(destQuery);
        setDestination(s); setDestQuery(q);
    };

    const handleSourceSelect = (l: Location) => { setSource(l); setSourceQuery(l.name); };
    const handleDestSelect = (l: Location) => { setDestination(l); setDestQuery(l.name); };

    const handleSubmit = () => {
        if (!source) { alert('Please select a pickup city'); return; }
        if (tripTab !== 'local' && !destination) { alert('Please select a destination city'); return; }
        setIsLoading(true);
        sessionStorage.setItem('savaari_search', JSON.stringify({
            source,
            destination: tripTab === 'local' ? null : destination,
            pickupDate,
            tripType: tripTab,
            dropDate: tripTab === 'round-trip' ? dropDate : undefined,
            pickupTime,
        }));
        router.push('/packages');
    };

    const timeOptions = Array.from({ length: 48 }).map((_, i) => {
        const h = Math.floor(i / 2);
        const m = i % 2 === 0 ? '00' : '30';
        const time = `${h.toString().padStart(2, '0')}:${m}`;
        const label = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return { value: time, label };
    });

    const fieldInput = 'w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 focus:border-[#2563EB]/40 focus:bg-white transition-all cursor-pointer';
    const fieldLabel = 'block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-4xl mx-auto"
        >
            <div className="relative bg-white rounded-[28px] shadow-2xl shadow-black/40 px-4 md:px-5 pt-4 md:pt-5 pb-10">
                {/* Segmented tabs */}
                <div className="flex justify-center mb-4">
                    <div className="inline-flex bg-gray-100 rounded-full p-1">
                        {(['one-way', 'round-trip', 'local'] as TripTab[]).map((tab) => (
                            <button key={tab} onClick={() => setTripTab(tab)} className="relative px-5 md:px-8 py-2.5 text-sm font-semibold rounded-full transition-colors">
                                {tripTab === tab && (
                                    <motion.div layoutId="tabPill" className="absolute inset-0 bg-[#2563EB] rounded-full shadow-md shadow-blue-500/30" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                                )}
                                <span className={`relative z-10 ${tripTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}>{TAB_LABEL[tab]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Locations */}
                <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-3">
                    <div className={tripTab === 'local' ? 'w-full min-w-0' : 'flex-1 min-w-0'}>
                        <GooglePlacesAutocomplete
                            label={tripTab === 'local' ? 'Pickup City' : 'From'}
                            placeholder={tripTab === 'local' ? 'Enter your city' : 'Enter pickup city'}
                            defaultValue={sourceQuery}
                            onPlaceSelect={handleSourceSelect}
                            iconColor="#2563EB"
                        />
                    </div>
                    <AnimatePresence>
                        {tripTab !== 'local' && (
                            <motion.div
                                key="to" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                                className="flex flex-col md:flex-row items-stretch gap-2 md:gap-3 flex-1 min-w-0"
                            >
                                <div className="hidden md:flex items-end justify-center pb-2.5">
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }} onClick={swapLocations}
                                        className="w-9 h-9 bg-gray-50 hover:bg-[#2563EB] hover:text-white rounded-full flex items-center justify-center text-gray-400 border border-gray-200 hover:border-[#2563EB] transition-all"
                                    >
                                        <ArrowLeftRight className="w-3.5 h-3.5" />
                                    </motion.button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <GooglePlacesAutocomplete
                                        label="To" placeholder="Enter destination city" defaultValue={destQuery}
                                        onPlaceSelect={handleDestSelect} iconColor="#F97316"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Date / Time / Button */}
                <div className="flex flex-col md:flex-row items-end gap-2 md:gap-3 mt-3">
                    <div className="flex-1 min-w-0 w-full">
                        <label className={fieldLabel}>Pickup Date</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#2563EB]/60"><Calendar className="w-4 h-4" /></div>
                            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className={fieldInput} />
                        </div>
                    </div>

                    <AnimatePresence>
                        {tripTab === 'round-trip' && (
                            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex-1 min-w-0 w-full overflow-hidden">
                                <label className={fieldLabel}>Return Date</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#F97316]/60"><Calendar className="w-4 h-4" /></div>
                                    <input type="date" value={dropDate} onChange={(e) => setDropDate(e.target.value)} min={pickupDate} className={fieldInput} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex-1 min-w-0 w-full">
                        <label className={fieldLabel}>Pickup Time</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#2563EB]/60"><Clock className="w-4 h-4" /></div>
                            <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={`${fieldInput} pr-8 appearance-none`}>
                                {timeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300"><ChevronDown className="w-4 h-4" /></div>
                        </div>
                    </div>

                </div>

                {/* Explore button — compact, straddles the card's bottom edge */}
                <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={isLoading}
                    className="absolute left-1/2 -translate-x-1/2 -bottom-6 px-12 md:px-16 py-3.5 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#FB923C] hover:to-[#F97316] text-white rounded-xl font-bold text-base tracking-wide shadow-xl shadow-orange-500/40 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
                >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
                    <span>{isLoading ? 'Searching...' : 'Explore Packages'}</span>
                </motion.button>
            </div>
        </motion.div>
    );
}
