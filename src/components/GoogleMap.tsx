'use client';

import { useEffect, useMemo, useCallback, useRef } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Stop, RoutePoint, RouteOption, TripStats } from '@/types';
import { getStopTypeColor, getStopTypeIcon, formatCurrency, formatDistance } from '@/lib/calculateTripStats';

interface GoogleMapProps {
    routeCoordinates: RoutePoint[];
    alternativeRoutes?: RouteOption[];
    selectedRouteId?: string;
    onRouteSelect?: (routeId: string) => void;
    stops: Stop[];
    selectedStopId?: string;
    onStopClick?: (stopId: string) => void;
    tripType: 'one-way' | 'round-trip';
    tripStats?: TripStats;
    perKmRate?: number;
}

// Stop marker with category-specific styling
function StopMarker({
    stop,
    onClick,
    isSelected,
    isStartOrEnd,
}: {
    stop: Stop;
    onClick: () => void;
    isSelected: boolean;
    isStartOrEnd: boolean;
}) {
    const map = useMap();
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const markerLib = useMapsLibrary('marker');

    useEffect(() => {
        if (!map || !markerLib) return;

        // Remove old marker
        if (markerRef.current) {
            markerRef.current.map = null;
        }

        const color = getStopTypeColor(stop.type);
        const icon = getStopTypeIcon(stop.type);

        // Create marker element
        const markerDiv = document.createElement('div');
        markerDiv.style.cssText = `
            cursor: pointer;
            transition: all 0.3s ease;
            filter: ${isSelected ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'};
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        `;

        if (isStartOrEnd) {
            // Premium start/end markers
            const isStart = stop.type === 'start';
            markerDiv.innerHTML = `
                <div style="
                    width: 36px; height: 36px;
                    background: linear-gradient(135deg, ${isStart ? '#2563EB, #1D4ED8' : '#F97316, #EA580C'});
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                ">
                    <span style="font-size: 16px;">${isStart ? '🚗' : '📍'}</span>
                </div>
            `;
        } else {
            // Tourist attraction markers with category colors
            const isStopSelected = stop.isSelected;
            markerDiv.innerHTML = `
                <div style="
                    display: flex; flex-direction: column; align-items: center;
                    opacity: ${isStopSelected ? '1' : '0.75'};
                ">
                    <div style="
                        width: ${isSelected ? '42px' : '34px'}; 
                        height: ${isSelected ? '42px' : '34px'};
                        background: ${isStopSelected ? `linear-gradient(135deg, ${color}, ${color}CC)` : '#FFFFFF'};
                        border-radius: 12px;
                        display: flex; align-items: center; justify-content: center;
                        border: 2.5px solid ${isStopSelected ? '#FFFFFF' : color};
                        box-shadow: ${isSelected ? `0 6px 20px ${color}50` : `0 2px 8px rgba(0,0,0,0.15)`};
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: ${isSelected ? '18px' : '14px'};">${icon}</span>
                    </div>
                    ${isSelected ? `
                        <div style="
                            margin-top: 4px;
                            background: ${color};
                            color: white;
                            padding: 2px 8px;
                            border-radius: 8px;
                            font-size: 10px;
                            font-weight: 700;
                            white-space: nowrap;
                            max-width: 120px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                        ">${stop.name}</div>
                    ` : ''}
                </div>
            `;
        }

        const marker = new markerLib.AdvancedMarkerElement({
            position: { lat: stop.location.lat, lng: stop.location.lng },
            map,
            content: markerDiv,
            title: stop.name,
            zIndex: isSelected ? 999 : isStartOrEnd ? 100 : 50,
        });

        marker.addListener('click', onClick);
        markerRef.current = marker;

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null;
            }
        };
    }, [map, markerLib, stop, onClick, isSelected, isStartOrEnd]);

    return null;
}

// Route statistics marker (Price/Distance label)
function RouteStatsMarker({
    coordinates,
    tripStats,
    perKmRate,
}: {
    coordinates: RoutePoint[];
    tripStats: TripStats;
    perKmRate: number;
}) {
    const map = useMap();
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const markerLib = useMapsLibrary('marker');

    useEffect(() => {
        if (!map || !markerLib || coordinates.length === 0) return;

        // Find midpoint of the route
        const midIndex = Math.floor(coordinates.length / 2);
        const midPoint = coordinates[midIndex];

        // Remove old marker
        if (markerRef.current) {
            markerRef.current.map = null;
        }

        // Create marker content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'route-stats-label';
        contentDiv.innerHTML = `
            <div style="
                background: white;
                padding: 6px 12px;
                border-radius: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 6px;
                border: 1.5px solid #2563EB;
                font-family: system-ui, -apple-system, sans-serif;
                white-space: nowrap;
                transform: translateY(-50%);
            ">
                <span style="
                    font-size: 12px;
                    font-weight: 700;
                    color: #1E293B;
                ">${formatDistance(tripStats.totalDistanceKm)}</span>
                <span style="
                    width: 4px;
                    height: 4px;
                    background: #CBD5E1;
                    border-radius: 50%;
                "></span>
                <span style="
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748B;
                ">${formatCurrency(perKmRate)}/km</span>
                ${tripStats.tollEstimate > 0 ? `
                    <span style="
                        width: 4px;
                        height: 4px;
                        background: #CBD5E1;
                        border-radius: 50%;
                    "></span>
                    <span style="
                        font-size: 11px;
                        font-weight: 600;
                        color: #EA580C;
                    ">Toll: ${formatCurrency(tripStats.tollEstimate)}</span>
                ` : ''}
            </div>
        `;

        const marker = new markerLib.AdvancedMarkerElement({
            position: { lat: midPoint.lat, lng: midPoint.lng },
            map,
            content: contentDiv,
            zIndex: 1000,
        });

        markerRef.current = marker;

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null;
            }
        };
    }, [map, markerLib, coordinates, tripStats, perKmRate]);

    return null;
}

// Route polyline component
function RoutePolyline({
    coordinates,
    color = '#2563EB',
    weight = 5,
    opacity = 1,
    isSelected = true,
    onClick,
    zIndex = 1,
}: {
    coordinates: RoutePoint[];
    color?: string;
    weight?: number;
    opacity?: number;
    isSelected?: boolean;
    onClick?: () => void;
    zIndex?: number;
}) {
    const map = useMap();
    const polylineRef = useRef<google.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map || coordinates.length === 0) return;

        // Remove old polyline
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        const polyline = new google.maps.Polyline({
            path: coordinates,
            strokeColor: color,
            strokeWeight: isSelected ? weight : weight - 1,
            strokeOpacity: isSelected ? opacity : opacity * 0.4,
            map,
            zIndex: isSelected ? zIndex + 10 : zIndex,
            clickable: !!onClick,
            geodesic: true,
        });

        if (onClick) {
            polyline.addListener('click', onClick);
            // Hover effects for unselected routes
            if (!isSelected) {
                polyline.addListener('mouseover', () => {
                    polyline.setOptions({
                        strokeOpacity: opacity * 0.7,
                        strokeWeight: weight,
                    });
                    map.getDiv().style.cursor = 'pointer';
                });
                polyline.addListener('mouseout', () => {
                    polyline.setOptions({
                        strokeOpacity: opacity * 0.4,
                        strokeWeight: weight - 1,
                    });
                    map.getDiv().style.cursor = '';
                });
            }
        }

        polylineRef.current = polyline;

        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
            }
        };
    }, [map, coordinates, color, weight, opacity, isSelected, onClick, zIndex]);

    return null;
}

function MapContent({
    routeCoordinates,
    alternativeRoutes,
    selectedRouteId,
    onRouteSelect,
    stops,
    selectedStopId,
    onStopClick,
    tripType,
    tripStats,
    perKmRate,
}: GoogleMapProps) {
    const map = useMap();

    // Fit map to route bounds
    useEffect(() => {
        if (!map || routeCoordinates.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        routeCoordinates.forEach((point) => {
            bounds.extend(new google.maps.LatLng(point.lat, point.lng));
        });
        map.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 });
    }, [map, routeCoordinates]);

    // Center on selected stop
    useEffect(() => {
        if (!map || !selectedStopId) return;
        const selectedStop = stops.find((s) => s.id === selectedStopId);
        if (selectedStop) {
            map.panTo(selectedStop.location);
            map.setZoom(12);
        }
    }, [map, selectedStopId, stops]);

    return (
        <>
            {/* Alternative routes (dimmed, clickable) */}
            {alternativeRoutes && alternativeRoutes.map((route) => {
                if (route.id === selectedRouteId) return null;
                return (
                    <RoutePolyline
                        key={route.id}
                        coordinates={route.coordinates}
                        color={route.color || '#94A3B8'}
                        weight={6}
                        opacity={0.6}
                        isSelected={false}
                        onClick={() => onRouteSelect?.(route.id)}
                        zIndex={1}
                    />
                );
            })}

            <RoutePolyline
                coordinates={routeCoordinates}
                color="#2563EB"
                weight={6}
                opacity={1}
                isSelected={true}
                zIndex={10}
            />

            {/* Price/Stats Label on Route */}
            {tripStats && perKmRate && (
                <RouteStatsMarker
                    coordinates={routeCoordinates}
                    tripStats={tripStats}
                    perKmRate={perKmRate}
                />
            )}

            {/* Stop markers */}
            {stops.map((stop, index) => (
                <StopMarker
                    key={`${stop.id}-${index}`}
                    stop={stop}
                    onClick={() => onStopClick?.(stop.id)}
                    isSelected={stop.id === selectedStopId}
                    isStartOrEnd={stop.type === 'start' || stop.type === 'end'}
                />
            ))}
        </>
    );
}

export default function GoogleMap(props: GoogleMapProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center p-6">
                    <div className="text-3xl mb-2">🗺️</div>
                    <p className="text-sm text-gray-500">Map unavailable</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultZoom={7}
                    defaultCenter={{ lat: 15, lng: 77 }}
                    mapId="savaari-scout-map"
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    zoomControl={true}
                    streetViewControl={false}
                    mapTypeControl={false}
                    fullscreenControl={true}
                    style={{ width: '100%', height: '100%' }}
                >
                    <MapContent {...props} />
                </Map>
            </APIProvider>
        </div>
    );
}
