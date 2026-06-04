// Predefined, curated trip packages (BookMyShow-card style), package-led model.
//   One Way   : Mysore highlights (priority) + en-route stop, dropped at Mysore (1-way km)
//   Round Trip: more Mysore sightseeing over 1-2 days, cab at disposal, returns home (2x km)
//   Local     : a day out within one city (8hr/80km, no intercity)
// Each (route + type) offers persona variants: Family / Romantic / Solo.

import { getCuratedDestination, type CuratedAttraction } from './packageDestinations';
import { SLAB_KM, SLAB_HOURS } from './packagePricing';
import { cheapestCar } from './cars';
import type { Car, TripStats } from '@/types';

export type PackageTripType = 'one-way' | 'round-trip' | 'local';
export type PackagePersona = 'family' | 'romantic' | 'solo' | 'friends';

export const PACKAGE_PERSONAS: Record<PackagePersona, { label: string; emoji: string; chip: string; solid: string }> = {
    family: { label: 'Family', emoji: '👨‍👩‍👧', chip: 'bg-emerald-100 text-emerald-700', solid: 'bg-emerald-500' },
    romantic: { label: 'Romantic', emoji: '💑', chip: 'bg-rose-100 text-rose-700', solid: 'bg-rose-500' },
    solo: { label: 'Solo', emoji: '🧳', chip: 'bg-indigo-100 text-indigo-700', solid: 'bg-indigo-500' },
    friends: { label: 'Friends', emoji: '🧑‍🤝‍🧑', chip: 'bg-amber-100 text-amber-700', solid: 'bg-amber-500' },
};

export const PERSONA_ORDER: PackagePersona[] = ['family', 'romantic', 'solo', 'friends'];

export const TRIP_TYPE_LABEL: Record<PackageTripType, string> = {
    'one-way': 'One Way',
    'round-trip': 'Round Trip',
    'local': 'Local',
};

export interface PackageDay { day: number; title: string; attractionIds: string[]; }

export interface TravelPackage {
    id: string;
    tripType: PackageTripType;
    persona: PackagePersona;
    from: string;            // origin city (== to for local)
    to: string;              // destination city
    title: string;
    tagline: string;
    durationDays: number;
    nights: number;
    transferKm: number;      // one-way road distance (0 for local)
    heroAttractionId: string;
    days: PackageDay[];
    inclusions: string[];
    exclusions: string[];
}

const INC_ONEWAY = ['One-way cab with stops', 'Fuel, driver & tolls', 'Sightseeing en route + at the destination'];
const INC_RT = ['Round-trip cab (Bangalore ⇄ Mysore)', 'Cab at your disposal', 'Fuel, driver & tolls', '8hr/80km local use per day'];
const INC_LOCAL = ['8hr / 80km city sightseeing', 'Cab at your disposal', 'Fuel, driver & tolls'];
const EXC = ['Monument entry tickets', 'Meals & refreshments', 'Hotel stay'];

const PACKAGES: TravelPackage[] = [
    // ===== ONE WAY: Bangalore -> Mysore (Mysore highlights priority + en-route) =====
    {
        id: 'ow-blr-mys-family', tripType: 'one-way', persona: 'family', from: 'Bangalore', to: 'Mysore',
        title: 'Toy Town & Mysore', tagline: 'Toys on the way, then the palace, zoo & fountain.',
        durationDays: 1, nights: 0, transferKm: 150, heroAttractionId: 'mysore-1',
        days: [{ day: 1, title: 'Bangalore to Mysore', attractionIds: ['enroute-2', 'mysore-1', 'mysore-4', 'mysore-3'] }],
        inclusions: INC_ONEWAY, exclusions: EXC,
    },
    {
        id: 'ow-blr-mys-romantic', tripType: 'one-way', persona: 'romantic', from: 'Bangalore', to: 'Mysore',
        title: 'Mysore Sunset Trail', tagline: 'Island fort, palace, and a sunset fountain for two.',
        durationDays: 1, nights: 0, transferKm: 150, heroAttractionId: 'mysore-3',
        days: [{ day: 1, title: 'Bangalore to Mysore', attractionIds: ['enroute-3', 'mysore-1', 'mysore-2', 'mysore-3'] }],
        inclusions: INC_ONEWAY, exclusions: EXC,
    },
    {
        id: 'ow-blr-mys-solo', tripType: 'one-way', persona: 'solo', from: 'Bangalore', to: 'Mysore',
        title: 'Mysore Heritage Drive', tagline: 'History-rich stops at your own pace.',
        durationDays: 1, nights: 0, transferKm: 150, heroAttractionId: 'mysore-1',
        days: [{ day: 1, title: 'Bangalore to Mysore', attractionIds: ['enroute-3', 'mysore-1', 'mysore-7', 'mysore-2'] }],
        inclusions: INC_ONEWAY, exclusions: EXC,
    },

    // ===== ROUND TRIP: Bangalore <-> Mysore (2 days, cab at disposal) =====
    {
        id: 'rt-blr-mys-family', tripType: 'round-trip', persona: 'family', from: 'Bangalore', to: 'Mysore',
        title: 'Mysore Weekend Getaway', tagline: 'Two easy days — zoo, palace, gardens & more.',
        durationDays: 2, nights: 1, transferKm: 150, heroAttractionId: 'mysore-4',
        days: [
            { day: 1, title: 'Animals & easy fun', attractionIds: ['mysore-1', 'mysore-4', 'mysore-6'] },
            { day: 2, title: 'Hills, gardens & home', attractionIds: ['mysore-2', 'mysore-3', 'mysore-9'] },
        ],
        inclusions: INC_RT, exclusions: EXC,
    },
    {
        id: 'rt-blr-mys-romantic', tripType: 'round-trip', persona: 'romantic', from: 'Bangalore', to: 'Mysore',
        title: 'Royal Mysore Escape', tagline: 'Golden-hour gardens, hilltop views, palace stay vibes.',
        durationDays: 2, nights: 1, transferKm: 150, heroAttractionId: 'mysore-3',
        days: [
            { day: 1, title: 'Palace & illuminated gardens', attractionIds: ['mysore-1', 'mysore-3'] },
            { day: 2, title: 'Sunrise hill & lakeside', attractionIds: ['mysore-2', 'mysore-10', 'mysore-6'] },
        ],
        inclusions: INC_RT, exclusions: EXC,
    },
    {
        id: 'rt-blr-mys-solo', tripType: 'round-trip', persona: 'solo', from: 'Bangalore', to: 'Mysore',
        title: 'Mysore Heritage Trail', tagline: 'Palaces, galleries and the old city, unhurried.',
        durationDays: 2, nights: 1, transferKm: 150, heroAttractionId: 'mysore-1',
        days: [
            { day: 1, title: 'Palaces & old city', attractionIds: ['mysore-1', 'mysore-7', 'mysore-8'] },
            { day: 2, title: 'Faith, hills & home', attractionIds: ['mysore-2', 'mysore-5', 'mysore-3'] },
        ],
        inclusions: INC_RT, exclusions: EXC,
    },

    // ===== LOCAL: Bangalore (day out in the city) =====
    {
        id: 'lo-blr-family', tripType: 'local', persona: 'family', from: 'Bangalore', to: 'Bangalore',
        title: 'Bangalore City Tour', tagline: 'Safari, gardens and the royal palace.',
        durationDays: 1, nights: 0, transferKm: 0, heroAttractionId: 'bangalore-7',
        days: [{ day: 1, title: 'A day in Bengaluru', attractionIds: ['bangalore-7', 'bangalore-1', 'bangalore-2'] }],
        inclusions: INC_LOCAL, exclusions: EXC,
    },
    {
        id: 'lo-blr-romantic', tripType: 'local', persona: 'romantic', from: 'Bangalore', to: 'Bangalore',
        title: 'Bangalore Sunset Tour', tagline: 'Leafy parks and a sunset over Nandi Hills.',
        durationDays: 1, nights: 0, transferKm: 0, heroAttractionId: 'bangalore-9',
        days: [{ day: 1, title: 'A day in Bengaluru', attractionIds: ['bangalore-1', 'bangalore-3', 'bangalore-9'] }],
        inclusions: INC_LOCAL, exclusions: EXC,
    },
    {
        id: 'lo-blr-solo', tripType: 'local', persona: 'solo', from: 'Bangalore', to: 'Bangalore',
        title: 'Bangalore Heritage Walk', tagline: 'Palace, parliament, temple and park.',
        durationDays: 1, nights: 0, transferKm: 0, heroAttractionId: 'bangalore-2',
        days: [{ day: 1, title: 'A day in Bengaluru', attractionIds: ['bangalore-2', 'bangalore-4', 'bangalore-5', 'bangalore-3'] }],
        inclusions: INC_LOCAL, exclusions: EXC,
    },

    // ===== LOCAL: Mysore (day out in the city) =====
    {
        id: 'lo-mys-family', tripType: 'local', persona: 'family', from: 'Mysore', to: 'Mysore',
        title: 'Mysore City Tour', tagline: 'Zoo, lake aviary, rail museum & palace.',
        durationDays: 1, nights: 0, transferKm: 0, heroAttractionId: 'mysore-4',
        days: [{ day: 1, title: 'A day in Mysuru', attractionIds: ['mysore-4', 'mysore-6', 'mysore-9', 'mysore-1'] }],
        inclusions: INC_LOCAL, exclusions: EXC,
    },
    {
        id: 'lo-mys-romantic', tripType: 'local', persona: 'romantic', from: 'Mysore', to: 'Mysore',
        title: 'Gardens & Hills of Mysore', tagline: 'Musical fountain, hilltop temple and a white palace.',
        durationDays: 1, nights: 0, transferKm: 0, heroAttractionId: 'mysore-3',
        days: [{ day: 1, title: 'A day in Mysuru', attractionIds: ['mysore-3', 'mysore-2', 'mysore-10'] }],
        inclusions: INC_LOCAL, exclusions: EXC,
    },
    {
        id: 'lo-mys-solo', tripType: 'local', persona: 'solo', from: 'Mysore', to: 'Mysore',
        title: 'Mysore Heritage Day', tagline: 'Palace, art gallery, market and cathedral.',
        durationDays: 1, nights: 0, transferKm: 0, heroAttractionId: 'mysore-1',
        days: [{ day: 1, title: 'A day in Mysuru', attractionIds: ['mysore-1', 'mysore-7', 'mysore-8', 'mysore-5'] }],
        inclusions: INC_LOCAL, exclusions: EXC,
    },

    // ===== Friends + extra variants =====
    {
        id: 'ow-blr-mys-friends', tripType: 'one-way', persona: 'friends', from: 'Bangalore', to: 'Mysore',
        title: 'Sholay Rocks & Mysore', tagline: 'Sholay rocks photo-op, palace and the fountain show.',
        durationDays: 1, nights: 0, transferKm: 150, heroAttractionId: 'mysore-1',
        days: [{ day: 1, title: 'Bangalore to Mysore', attractionIds: ['enroute-1', 'mysore-1', 'mysore-2', 'mysore-3'] }],
        inclusions: INC_ONEWAY, exclusions: EXC,
    },
    {
        id: 'ow-blr-mys-express', tripType: 'one-way', persona: 'family', from: 'Bangalore', to: 'Mysore',
        title: 'Mysore Express Dash', tagline: 'Straight to the three must-sees — palace, hills, fountain.',
        durationDays: 1, nights: 0, transferKm: 150, heroAttractionId: 'mysore-2',
        days: [{ day: 1, title: 'Bangalore to Mysore', attractionIds: ['mysore-1', 'mysore-2', 'mysore-3'] }],
        inclusions: INC_ONEWAY, exclusions: EXC,
    },
    {
        id: 'rt-blr-mys-friends', tripType: 'round-trip', persona: 'friends', from: 'Bangalore', to: 'Mysore',
        title: 'Mysore Road Trip', tagline: 'Forts, gardens and a lively two-day road trip.',
        durationDays: 2, nights: 1, transferKm: 150, heroAttractionId: 'mysore-3',
        days: [
            { day: 1, title: 'Palace & gardens', attractionIds: ['mysore-1', 'mysore-3', 'mysore-2'] },
            { day: 2, title: 'Forts & lakes', attractionIds: ['enroute-3', 'mysore-6', 'mysore-9'] },
        ],
        inclusions: INC_RT, exclusions: EXC,
    },
    {
        id: 'rt-blr-mys-grand', tripType: 'round-trip', persona: 'romantic', from: 'Bangalore', to: 'Mysore',
        title: 'Grand Mysore Weekend', tagline: 'The full royal experience over a relaxed two days.',
        durationDays: 2, nights: 1, transferKm: 150, heroAttractionId: 'mysore-1',
        days: [
            { day: 1, title: 'Palaces & fountain', attractionIds: ['mysore-1', 'mysore-7', 'mysore-3'] },
            { day: 2, title: 'Hills, lakes & faith', attractionIds: ['mysore-2', 'mysore-10', 'mysore-6', 'mysore-5'] },
        ],
        inclusions: INC_RT, exclusions: EXC,
    },
    {
        id: 'lo-blr-friends', tripType: 'local', persona: 'friends', from: 'Bangalore', to: 'Bangalore',
        title: 'Bangalore Day Out', tagline: 'Sunrise at Nandi Hills, parks and the city buzz.',
        durationDays: 1, nights: 0, transferKm: 0, heroAttractionId: 'bangalore-9',
        days: [{ day: 1, title: 'A day in Bengaluru', attractionIds: ['bangalore-9', 'bangalore-3', 'bangalore-10', 'bangalore-8'] }],
        inclusions: INC_LOCAL, exclusions: EXC,
    },
    {
        id: 'lo-mys-friends', tripType: 'local', persona: 'friends', from: 'Mysore', to: 'Mysore',
        title: 'Mysore Day Out', tagline: 'Hilltop views, gardens, zoo and the fountain.',
        durationDays: 1, nights: 0, transferKm: 0, heroAttractionId: 'mysore-3',
        days: [{ day: 1, title: 'A day in Mysuru', attractionIds: ['mysore-2', 'mysore-3', 'mysore-4', 'mysore-6'] }],
        inclusions: INC_LOCAL, exclusions: EXC,
    },
];

function findAttraction(id: string): CuratedAttraction | null {
    const city = id.split('-')[0];
    const list = getCuratedDestination(city);
    return list?.find((a) => a.id === id) || null;
}

export function resolvePackageDay(day: PackageDay): CuratedAttraction[] {
    return day.attractionIds.map(findAttraction).filter((a): a is CuratedAttraction => a !== null);
}

export function packageAttractionCount(pkg: TravelPackage): number {
    return pkg.days.reduce((acc, d) => acc + d.attractionIds.length, 0);
}

export function packageAvgRating(pkg: TravelPackage): number {
    const all = pkg.days.flatMap(resolvePackageDay);
    if (all.length === 0) return 4.6;
    return Math.round((all.reduce((a, x) => a + (x.rating || 4.5), 0) / all.length) * 10) / 10;
}

export function packageHeroAttraction(pkg: TravelPackage): CuratedAttraction | null {
    return findAttraction(pkg.heroAttractionId);
}

// Per-type pricing. Returns a TripStats so it slots into BillingFooter / BookingModal.
export function packagePrice(pkg: TravelPackage, car: Car): TripStats {
    const days = Math.max(1, pkg.durationDays);
    const perDaySlab = car.localPackage8hr ?? car.perKmRate * 80;
    const sightseeingFare = Math.round(perDaySlab * days);
    const driverAllowance = Math.round(car.driverAllowancePerDay * days);

    let transferFare = 0;
    let tollEstimate = 0;
    let transferKmTotal = 0;
    if (pkg.tripType === 'one-way') {
        transferFare = Math.round(pkg.transferKm * car.perKmRate);
        tollEstimate = Math.round(pkg.transferKm * 1.4);
        transferKmTotal = pkg.transferKm;
    } else if (pkg.tripType === 'round-trip') {
        transferFare = Math.round(pkg.transferKm * 2 * car.perKmRate);
        tollEstimate = Math.round(pkg.transferKm * 1.4 * 2);
        transferKmTotal = pkg.transferKm * 2;
    } // local: no transfer

    const baseFare = transferFare + sightseeingFare;
    const totalFare = baseFare + driverAllowance + tollEstimate;
    const slabKm = SLAB_KM['8hr_80km'];

    return {
        totalDistanceKm: Math.round(transferKmTotal + slabKm * days),
        totalDriveTimeHours: Math.round(((transferKmTotal) / 45 + SLAB_HOURS['8hr_80km'] * days) * 10) / 10,
        totalDays: days,
        baseFare,
        extraKmCharge: 0,
        driverAllowance,
        tollEstimate,
        totalFare,
        routeLabel: TRIP_TYPE_LABEL[pkg.tripType],
    };
}

export function packagePriceFrom(pkg: TravelPackage): number {
    return packagePrice(pkg, cheapestCar).totalFare;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const ALIAS: Record<string, string> = { bengaluru: 'bangalore', mysuru: 'mysore' };
const canon = (s: string) => ALIAS[norm(s)] || norm(s);

export function getPackages(tripType: PackageTripType, from: string | undefined, to: string | undefined): TravelPackage[] {
    if (!from) return [];
    const f = canon(from);
    return PACKAGES.filter((p) => {
        if (p.tripType !== tripType) return false;
        if (tripType === 'local') return canon(p.from) === f;
        return canon(p.from) === f && !!to && canon(p.to) === canon(to);
    });
}

export function getPackageById(id: string): TravelPackage | null {
    return PACKAGES.find((p) => p.id === id) || null;
}

export function allPackages(): TravelPackage[] {
    return PACKAGES;
}
