'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Search } from 'lucide-react';
import { Location } from '@/types';

interface GooglePlacesAutocompleteProps {
    placeholder?: string;
    defaultValue?: string;
    onPlaceSelect: (location: Location) => void;
    label?: string;
    iconColor?: string;
}

// Built-in Indian city dataset with coordinates.
// The project's Google key has the Geocoding API / legacy Places Autocomplete
// disabled (REQUEST_DENIED), so for this prototype we resolve cities locally —
// instant, no API dependency, always works. Covers metros + popular getaways.
interface City { name: string; state: string; lat: number; lng: number; alt?: string }

const CITIES: City[] = [
    { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, alt: 'bengaluru' },
    { name: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394, alt: 'mysuru' },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, alt: 'new delhi' },
    { name: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266, alt: 'gurugram' },
    { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910 },
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
    { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
    { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
    { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
    { name: 'Goa', state: 'Goa', lat: 15.2993, lng: 74.1240, alt: 'panaji panjim' },
    { name: 'Ooty', state: 'Tamil Nadu', lat: 11.4102, lng: 76.6950, alt: 'udagamandalam' },
    { name: 'Coorg', state: 'Karnataka', lat: 12.4244, lng: 75.7382, alt: 'madikeri kodagu' },
    { name: 'Chikmagalur', state: 'Karnataka', lat: 13.3161, lng: 75.7720 },
    { name: 'Hampi', state: 'Karnataka', lat: 15.3350, lng: 76.4600 },
    { name: 'Mangalore', state: 'Karnataka', lat: 12.9141, lng: 74.8560 },
    { name: 'Gokarna', state: 'Karnataka', lat: 14.5479, lng: 74.3188 },
    { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, alt: 'cochin' },
    { name: 'Munnar', state: 'Kerala', lat: 10.0889, lng: 77.0595 },
    { name: 'Wayanad', state: 'Kerala', lat: 11.6854, lng: 76.1320 },
    { name: 'Pondicherry', state: 'Puducherry', lat: 11.9416, lng: 79.8083, alt: 'puducherry' },
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
    { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { name: 'Darjeeling', state: 'West Bengal', lat: 27.0360, lng: 88.2627 },
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
    { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
    { name: 'Lonavala', state: 'Maharashtra', lat: 18.7546, lng: 73.4062 },
    { name: 'Mahabaleshwar', state: 'Maharashtra', lat: 17.9307, lng: 73.6477 },
    { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
    { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
    { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
    { name: 'Manali', state: 'Himachal Pradesh', lat: 32.2396, lng: 77.1887 },
    { name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lng: 78.2676 },
    { name: 'Nainital', state: 'Uttarakhand', lat: 29.3919, lng: 79.4542 },
    { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322 },
    { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
    { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, alt: 'vizag' },
    { name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192 },
];

function searchCities(query: string): City[] {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    const starts: City[] = [];
    const contains: City[] = [];
    for (const c of CITIES) {
        const name = c.name.toLowerCase();
        const alt = c.alt || '';
        if (name.startsWith(q) || alt.split(' ').some((a) => a.startsWith(q))) {
            starts.push(c);
        } else if (name.includes(q) || alt.includes(q) || c.state.toLowerCase().includes(q)) {
            contains.push(c);
        }
    }
    return [...starts, ...contains].slice(0, 6);
}

export default function GooglePlacesAutocomplete({
    placeholder = 'Search for a city',
    defaultValue = '',
    onPlaceSelect,
    label = 'FROM',
    iconColor = '#2563EB',
}: GooglePlacesAutocompleteProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [matches, setMatches] = useState<City[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        const found = searchCities(value);
        setMatches(found);
        setIsOpen(found.length > 0);
    };

    const select = (c: City) => {
        setInputValue(c.name);
        setIsOpen(false);
        setMatches([]);
        onPlaceSelect({
            name: c.name,
            displayName: `${c.name}, ${c.state}, India`,
            lat: c.lat,
            lng: c.lng,
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && matches.length > 0) {
            e.preventDefault();
            select(matches[0]);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: iconColor }}>
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (matches.length > 0) setIsOpen(true); }}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    autoComplete="off"
                />
                {inputValue && (
                    <button
                        onClick={() => { setInputValue(''); setMatches([]); setIsOpen(false); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {isOpen && matches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-[100] max-h-[260px] overflow-y-auto">
                    {matches.map((c) => (
                        <button
                            key={`${c.name}-${c.state}`}
                            onClick={() => select(c)}
                            className="w-full px-3 py-2.5 text-left hover:bg-blue-50/50 flex items-center gap-2.5 transition-colors"
                        >
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <div className="font-medium text-gray-800 text-sm truncate">{c.name}</div>
                                <div className="text-xs text-gray-500 truncate">{c.state}, India</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
