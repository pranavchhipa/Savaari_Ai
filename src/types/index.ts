// TypeScript interfaces for Savaari

export interface Location {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

// Enhanced stop types — tourist-focused, no generic fuel/rest stops
export type StopType =
  | 'start'
  | 'end'
  | 'tourist'
  | 'heritage'
  | 'nature'
  | 'adventure'
  | 'cultural'
  | 'viewpoint'
  | 'food'
  | 'restaurant'
  | 'night_halt';

export type StopBadge = 'must-visit' | 'hidden-gem' | 'instagram-worthy' | 'family-friendly' | 'off-the-beaten-path';

export interface Stop {
  id: string;
  name: string;
  type: StopType;
  location: Location;
  duration: number; // in minutes
  isSelected?: boolean;
  suggestedTime?: string;
  description?: string;
  detourKm?: number;
  leg?: 'onward' | 'return';
  // Enhanced fields for tourist recommendations
  rating?: number;           // AI-estimated 1-5
  badges?: StopBadge[];
  famousFor?: string;
  bestTimeToVisit?: string;
  imageQuery?: string;       // For generating placeholder images
  photoUrl?: string;          // Google Places photo or lazy-loaded
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
  tollEstimate: number;          // Toll rolled into total
  totalFare: number;             // Includes tolls
  suggestedNightHalt?: string;
  routeLabel?: string;           // "Fastest", "Scenic", etc.
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
  localPackage8hr?: number;   // base price for 8hr/80km
  localPackage12hr?: number;  // base price for 12hr/120km
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

// Route alternative for multi-route selection
export interface RouteOption {
  id: string;
  label: string;              // "Fastest Route", "Scenic Route", etc.
  description?: string;       // "Via NH-48" from Google
  coordinates: RoutePoint[];
  distanceKm: number;
  durationMinutes: number;
  tollInfo?: {
    estimatedPrice: number;
    currency: string;
  };
  isRecommended?: boolean;
  highlights?: string[];      // "Via NH-48", "Avoids tolls"
  estimatedFare?: number;     // Pre-calculated for comparison
  color?: string;             // Polyline color
}

export interface RouteData {
  coordinates: RoutePoint[];
  distanceKm: number;
  durationMinutes: number;
  tollInfo?: {
    estimatedPrice: number;
    currency: string;
  };
  // Multi-route support
  alternativeRoutes?: RouteOption[];
  selectedRouteId?: string;
}

export interface SearchParams {
  source: Location | null;
  destination: Location | null;
  pickupDate: string;
  dropDate?: string;
  pickupTime?: string;
  tripType: 'one-way' | 'round-trip' | 'local';
  localPackage?: LocalPackage;
}

export type LocalPackage = '8hr_80km' | '12hr_120km';

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

// AI Recommendation types
export interface AIRecommendation {
  id: string;
  name: string;
  type: StopType;
  description: string;
  whyVisit: string;
  famousFor: string;
  rating: number;
  badges: StopBadge[];
  approximateKm: number;
  detourKm: number;
  suggestedDuration: number;
  bestTimeToVisit?: string;
  imageQuery?: string;
  photoUrl?: string;       // Google Places photo URL
}

export interface AIRouteStopsResponse {
  stops: AIRecommendation[];
  nightHalt?: {
    city: string;
    reason: string;
    approximateKm: number;
  };
  dontMiss?: AIRecommendation[];   // Top 3 must-visit
  fallback?: boolean;
  error?: string;
}

// ===== Personalization v2 =====

export type Persona = 'family' | 'couple' | 'friends' | 'solo' | 'business';
export type PaceLevel = 'relaxed' | 'balanced' | 'packed';
export type BudgetLevel = 'budget' | 'standard' | 'premium';

export interface PersonaMeta {
  id: Persona;
  name: string;              // "Family Weekend"
  subtitle: string;          // "Safe stops the kids will love"
  emoji: string;             // "👨‍👩‍👧"
  vibeChips: string[];       // ["Kid-safe", "Heritage", "Nature"]
}

export interface TravelContext {
  source: string;
  destination: string;
  distanceKm: number;
  carType: string;           // e.g. "Hatchback", "SUV", "MUV"
  pickupDate: string;        // YYYY-MM-DD
  pickupTime: string;        // HH:MM
  totalDays: number;         // from trip type + dates
  isLocal?: boolean;
  localPackage?: LocalPackage;
  radiusKm?: number;          // for local: 80 or 120
}

// Stage A output: broader than AIRecommendation, with persona-hint tags.
export type CandidateTag =
  | 'kid-safe'
  | 'scenic'
  | 'romantic'
  | 'adventure'
  | 'offbeat'
  | 'cultural-depth'
  | 'quick-stop'
  | 'paid-entry'
  | 'free'
  | 'photo-op';

export interface AICandidate extends AIRecommendation {
  tags?: CandidateTag[];
  entryFeeInr?: number;      // 0 for free
}

// Stage B output: subset of AICandidate with persona fit added.
export interface RerankedStop extends AICandidate {
  personaRelevance: number;  // 0-1
  personaReason?: string;    // "Kid-safe open gardens with clean restrooms"
}
