'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, X, Loader2, Search } from 'lucide-react';
import { Location } from '@/types';

interface GooglePlacesAutocompleteProps {
    placeholder?: string;
    defaultValue?: string;
    onPlaceSelect: (location: Location) => void;
    label?: string;
    iconColor?: string;
}

// Built-in fallback so the field still works if the Google proxy is unreachable.
interface City { name: string; state: string; lat: number; lng: number; alt?: string }
const CITIES: City[] = [
    { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, alt: 'bengaluru' },
    { name: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394, alt: 'mysuru' },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, alt: 'new delhi' },
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
    { name: 'Goa', state: 'Goa', lat: 15.2993, lng: 74.1240, alt: 'panaji panjim' },
    { name: 'Ooty', state: 'Tamil Nadu', lat: 11.4102, lng: 76.6950, alt: 'udagamandalam' },
    { name: 'Coorg', state: 'Karnataka', lat: 12.4244, lng: 75.7382, alt: 'madikeri kodagu' },
    { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, alt: 'cochin' },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
];

function searchCities(query: string): City[] {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    const starts: City[] = [];
    const contains: City[] = [];
    for (const c of CITIES) {
        const name = c.name.toLowerCase();
        const alt = c.alt || '';
        if (name.startsWith(q) || alt.split(' ').some((a) => a.startsWith(q))) starts.push(c);
        else if (name.includes(q) || alt.includes(q)) contains.push(c);
    }
    return [...starts, ...contains].slice(0, 6);
}

interface Suggestion {
    id: string;
    main: string;
    secondary: string;
    placeId?: string;          // Google suggestion → resolve on select
    location?: Location;       // local suggestion → already resolved
}

export default function GooglePlacesAutocomplete({
    placeholder = 'Search for a city',
    defaultValue = '',
    onPlaceSelect,
    label = 'FROM',
    iconColor = '#2563EB',
}: GooglePlacesAutocompleteProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [matches, setMatches] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const reqSeq = useRef(0);

    useEffect(() => { setInputValue(defaultValue); }, [defaultValue]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const localMatches = (q: string): Suggestion[] =>
        searchCities(q).map((c) => ({
            id: `local-${c.name}`,
            main: c.name,
            secondary: `${c.state}, India`,
            location: { name: c.name, displayName: `${c.name}, ${c.state}, India`, lat: c.lat, lng: c.lng },
        }));

    const fetchSuggestions = useCallback(async (value: string) => {
        const q = value.trim();
        if (q.length < 2) { setMatches([]); setIsOpen(false); setIsLoading(false); return; }
        const seq = ++reqSeq.current;
        setIsLoading(true);
        try {
            const res = await fetch('/api/google/places-autocomplete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: q }),
            });
            if (seq !== reqSeq.current) return; // a newer keystroke superseded this
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                    setMatches(data.suggestions.map((s: { placeId: string; main: string; secondary: string }) => ({
                        id: s.placeId, main: s.main, secondary: s.secondary, placeId: s.placeId,
                    })));
                    setIsOpen(true);
                    setIsLoading(false);
                    return;
                }
            }
        } catch { /* fall through to local */ }
        if (seq !== reqSeq.current) return;
        const local = localMatches(q);
        setMatches(local);
        setIsOpen(local.length > 0);
        setIsLoading(false);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => fetchSuggestions(value), 280);
    };

    const select = async (m: Suggestion) => {
        setInputValue(m.main);
        setIsOpen(false);
        setMatches([]);
        if (m.location) { onPlaceSelect(m.location); return; }
        if (!m.placeId) return;
        try {
            const res = await fetch('/api/google/places-autocomplete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ placeId: m.placeId }),
            });
            const data = await res.json();
            if (data.place && data.place.lat != null && data.place.lng != null) {
                onPlaceSelect({
                    name: data.place.name || m.main,
                    displayName: data.place.displayName || m.secondary || m.main,
                    lat: data.place.lat,
                    lng: data.place.lng,
                });
            }
        } catch { /* ignore */ }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && matches.length > 0) { e.preventDefault(); select(matches[0]); }
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
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
                    autoComplete="off"
                    className="w-full pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
                {inputValue && (
                    <button
                        onClick={() => { setInputValue(''); setMatches([]); setIsOpen(false); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
                {isLoading && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    </div>
                )}
            </div>

            {isOpen && matches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-[100] max-h-[260px] overflow-y-auto">
                    {matches.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => select(m)}
                            className="w-full px-3 py-2.5 text-left hover:bg-blue-50/50 flex items-center gap-2.5 transition-colors"
                        >
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <div className="font-medium text-gray-800 text-sm truncate">{m.main}</div>
                                {m.secondary && <div className="text-xs text-gray-500 truncate">{m.secondary}</div>}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
