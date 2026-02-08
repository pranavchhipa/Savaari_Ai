'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoutePoint, Stop } from '@/types';
import { getStopTypeColor } from '@/lib/calculateTripStats';

interface LeafletMapProps {
    routeCoordinates: RoutePoint[];
    stops: Stop[];
    selectedStopId?: string;
    onStopClick?: (stopId: string) => void;
    tripType: 'one-way' | 'round-trip';
}

export default function LeafletMap({
    routeCoordinates,
    stops,
    selectedStopId,
    onStopClick,
    tripType,
}: LeafletMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const routeLayerRef = useRef<L.Polyline | null>(null);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
        }).setView([20.5937, 78.9629], 5); // Center of India

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update route when coordinates change
    useEffect(() => {
        if (!mapRef.current || routeCoordinates.length === 0) return;

        // Remove existing route
        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
        }

        // Draw new route
        const latLngs = routeCoordinates.map((c) => [c.lat, c.lng] as [number, number]);

        // Onward route (blue)
        const onwardRoute = L.polyline(latLngs, {
            color: '#2563EB',
            weight: 5,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round',
        }).addTo(mapRef.current);

        routeLayerRef.current = onwardRoute;

        // If round trip, add dashed return route (orange)
        if (tripType === 'round-trip') {
            L.polyline(latLngs, {
                color: '#F97316',
                weight: 4,
                opacity: 0.6,
                dashArray: '10, 10',
                lineCap: 'round',
                lineJoin: 'round',
            }).addTo(mapRef.current);
        }

        // Fit map to route bounds
        const bounds = L.latLngBounds(latLngs);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }, [routeCoordinates, tripType]);

    // Update markers when stops change
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Add new markers
        stops.forEach((stop) => {
            // Safety check for location
            if (!stop.location || typeof stop.location.lat !== 'number' || typeof stop.location.lng !== 'number') {
                console.warn('Invalid stop location:', stop);
                return;
            }

            const color = getStopTypeColor(stop.type);
            const isStartOrEnd = stop.type === 'start' || stop.type === 'end';
            const isSelected = stop.isSelected || isStartOrEnd;

            // Create custom icon
            const iconHtml = `
        <div class="flex items-center justify-center w-${isStartOrEnd ? '10' : '8'} h-${isStartOrEnd ? '10' : '8'} rounded-full ${isSelected ? '' : 'opacity-50'}" 
             style="background-color: ${color}; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <span class="text-white text-xs font-bold">${getStopIcon(stop.type)}</span>
        </div>
      `;

            const icon = L.divIcon({
                className: 'custom-marker',
                html: iconHtml,
                iconSize: [isStartOrEnd ? 40 : 32, isStartOrEnd ? 40 : 32],
                iconAnchor: [isStartOrEnd ? 20 : 16, isStartOrEnd ? 20 : 16],
            });

            const marker = L.marker([stop.location.lat, stop.location.lng], { icon })
                .addTo(mapRef.current!);

            // Add popup
            marker.bindPopup(`
        <div class="p-2">
          <div class="font-bold text-gray-800">${stop.name}</div>
          ${stop.suggestedTime ? `<div class="text-sm text-gray-500">${stop.suggestedTime}</div>` : ''}
          ${stop.duration ? `<div class="text-xs text-gray-400">${stop.duration} min stop</div>` : ''}
        </div>
      `);

            // Click handler
            marker.on('click', () => {
                if (onStopClick) {
                    onStopClick(stop.id);
                }
            });

            markersRef.current.push(marker);
        });
    }, [stops, onStopClick]);

    // Fly to selected stop
    useEffect(() => {
        if (!mapRef.current || !selectedStopId) return;

        const stop = stops.find((s) => s.id === selectedStopId);
        if (stop) {
            mapRef.current.flyTo([stop.location.lat, stop.location.lng], 12, {
                duration: 1,
            });

            // Open popup for selected marker
            const markerIndex = stops.findIndex((s) => s.id === selectedStopId);
            if (markerIndex >= 0 && markersRef.current[markerIndex]) {
                markersRef.current[markerIndex].openPopup();
            }
        }
    }, [selectedStopId, stops]);

    return (
        <div
            ref={mapContainerRef}
            className="w-full h-full min-h-[300px] rounded-xl overflow-hidden"
            style={{ zIndex: 1 }}
        />
    );
}

function getStopIcon(type: Stop['type']): string {
    const icons: Record<Stop['type'], string> = {
        start: '🚗',
        end: '🏁',
        restaurant: '🍽️',
        viewpoint: '📸',
        heritage: '🏛️',
        fuel: '⛽',
        rest: '☕',
        night_halt: '🌙',
        food: '🍽️',
    };
    return icons[type] || '📍';
}
