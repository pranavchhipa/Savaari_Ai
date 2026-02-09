// TypeScript interfaces for Savaari Scout

export interface Location {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

export interface Stop {
  id: string;
  name: string;
  type: 'start' | 'end' | 'restaurant' | 'viewpoint' | 'heritage' | 'fuel' | 'rest' | 'night_halt' | 'food';
  location: Location;
  duration: number; // in minutes
  isSelected?: boolean;
  suggestedTime?: string;
  description?: string;
  detourKm?: number;
  leg?: 'onward' | 'return';
}

export interface TripDay {
  dayNumber: number;
  date: string;
  stops: Stop[];
  totalDriveTimeMinutes: number;
  totalDistanceKm: number;
}

export interface JourneySegment {
  fromStop: Stop;
  toStop: Stop;
  distanceKm: number;
  durationMinutes: number;
  departureTime: string;
  arrivalTime: string;
}

export interface TripStats {
  totalDistanceKm: number;
  totalDriveTimeHours: number;
  totalDays: number;
  baseFare: number;
  extraKmCharge: number;
  driverAllowance: number;
  totalFare: number;
  suggestedNightHalt?: string;
}

export interface Car {
  id: string;
  name: string;
  image: string;
  type: string;
  seats: number;
  ac: boolean;
  rating: number;
  reviewCount: number;
  baseFare: number;
  perKmRate: number;
  driverAllowancePerDay: number;
  features: string[];
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteData {
  coordinates: RoutePoint[];
  distanceKm: number;
  durationMinutes: number;
}

export interface SearchParams {
  source: Location | null;
  destination: Location | null;
  pickupDate: string;
  dropDate?: string;
  pickupTime?: string;
  tripType: 'one-way' | 'round-trip';
}

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface OSRMRoute {
  geometry: {
    coordinates: [number, number][];
  };
  distance: number;
  duration: number;
}
