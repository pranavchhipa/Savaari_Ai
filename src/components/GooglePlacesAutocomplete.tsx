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

// Load Google Maps script once
let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve) => {
        // Check if already loaded (e.g. by @vis.gl/react-google-maps APIProvider)
        if (window.google?.maps?.places) {
            scriptLoaded = true;
            resolve();
            return;
        }

        if (scriptLoaded) {
            resolve();
            return;
        }

        loadCallbacks.push(resolve);

        if (scriptLoading) return;
        scriptLoading = true;

        // Check if a Google Maps script tag already exists in the DOM
        const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
        if (existingScript) {
            // Script exists but hasn't loaded yet — wait for it
            const checkReady = setInterval(() => {
                if (window.google?.maps?.places) {
                    clearInterval(checkReady);
                    scriptLoaded = true;
                    loadCallbacks.forEach(cb => cb());
                    loadCallbacks.length = 0;
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            scriptLoaded = true;
            loadCallbacks.forEach(cb => cb());
            loadCallbacks.length = 0;
        };
        document.head.appendChild(script);
    });
}

export default function GooglePlacesAutocomplete({
    placeholder = 'Search for a city',
    defaultValue = '',
    onPlaceSelect,
    label = 'FROM',
    iconColor = '#2563EB',
}: GooglePlacesAutocompleteProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiReady, setApiReady] = useState(false);

    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) return;

        loadGoogleMapsScript(apiKey).then(() => {
            autocompleteService.current = new google.maps.places.AutocompleteService();
            sessionToken.current = new google.maps.places.AutocompleteSessionToken();
            const dummyDiv = document.createElement('div');
            placesService.current = new google.maps.places.PlacesService(dummyDiv);
            setApiReady(true);
        });
    }, []);

    useEffect(() => {
        setInputValue(defaultValue);
    }, [defaultValue]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchPredictions = useCallback((value: string) => {
        if (!autocompleteService.current || !sessionToken.current || value.length < 2) {
            setPredictions([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        autocompleteService.current.getPlacePredictions(
            {
                input: value,
                sessionToken: sessionToken.current,
                componentRestrictions: { country: 'in' },
                // types: ['(cities)'], // Removed to allow all place types (addresses, landmarks, etc.)
            },
            (results, status) => {
                setIsLoading(false);
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(results);
                    setIsOpen(true);
                } else {
                    setPredictions([]);
                }
            }
        );
    }, [apiReady]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => fetchPredictions(value), 250);
    };

    const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
        setInputValue(prediction.structured_formatting.main_text);
        setIsOpen(false);
        setPredictions([]);

        if (!placesService.current || !sessionToken.current) return;

        placesService.current.getDetails(
            {
                placeId: prediction.place_id,
                fields: ['name', 'geometry', 'formatted_address'],
                sessionToken: sessionToken.current,
            },
            (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                    const location: Location = {
                        name: place.name || prediction.structured_formatting.main_text,
                        displayName: place.formatted_address || prediction.description,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };
                    onPlaceSelect(location);
                    // Refresh session token
                    sessionToken.current = new google.maps.places.AutocompleteSessionToken();
                }
            }
        );
    };

    const clearInput = () => {
        setInputValue('');
        setPredictions([]);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="relative">
                <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: iconColor }}
                >
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (inputValue.length >= 2) fetchPredictions(inputValue);
                    }}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
                {inputValue && (
                    <button
                        onClick={clearInput}
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

            {/* Predictions Dropdown */}
            {isOpen && predictions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-[100] max-h-[260px] overflow-y-auto">
                    {predictions.map((prediction) => (
                        <button
                            key={prediction.place_id}
                            onClick={() => handleSelect(prediction)}
                            className="w-full px-3 py-2.5 text-left hover:bg-blue-50/50 flex items-center gap-2.5 transition-colors"
                        >
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <div className="font-medium text-gray-800 text-sm truncate">
                                    {prediction.structured_formatting.main_text}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {prediction.structured_formatting.secondary_text}
                                </div>
                            </div>
                        </button>
                    ))}
                    <div className="px-3 py-1.5 flex justify-end border-t border-gray-50">
                        <img
                            src="https://developers.google.com/static/maps/documentation/images/powered_by_google_on_white.png"
                            alt="Powered by Google"
                            className="h-3.5 opacity-60"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
