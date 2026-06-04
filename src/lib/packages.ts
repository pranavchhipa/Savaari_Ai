// Predefined, curated trip packages (BookMyShow-card style).
// Each package is a fixed product for a route, built from the curated
// attraction data. Start: Bangalore -> Mysore (4 packages).

import { getCuratedDestination, type CuratedAttraction } from './packageDestinations';
import { computePackagePrice } from './packagePricing';
import { cheapestCar } from './cars';
import type { Car, TripStats } from '@/types';

export type PackageTheme = 'Express' | 'Heritage' | 'Family' | 'Nature';

export interface PackageDay {
    day: number;
    title: string;
    attractionIds: string[];
}

export interface TravelPackage {
    id: string;
    from: string;
    to: string;
    title: string;
    theme: PackageTheme;
    tags: string[];
    durationDays: number;
    nights: number;
    transferKm: number;        // one-way road distance from origin (for pricing)
    summary: string;
    heroAttractionId: string;
    days: PackageDay[];
    inclusions: string[];
    exclusions: string[];
}

const INCLUSIONS = [
    'Cab at your disposal all trip',
    'Fuel & professional driver',
    'Tolls & taxes included',
    'Daily 8hr / 80km local sightseeing',
];
const EXCLUSIONS = ['Monument entry tickets', 'Meals & refreshments', 'Hotel stay'];

const PACKAGES: TravelPackage[] = [
    {
        id: 'blr-mys-express',
        from: 'Bangalore', to: 'Mysore',
        title: 'Mysore in a Day',
        theme: 'Express',
        tags: ['Quick getaway', 'Heritage', 'Day trip'],
        durationDays: 1, nights: 0, transferKm: 150,
        summary: 'Hit every Mysore icon in one well-paced day trip — palace, hilltop temple, cathedral, and the famous musical fountain at dusk.',
        heroAttractionId: 'mysore-1',
        days: [
            { day: 1, title: 'Mysore highlights', attractionIds: ['mysore-1', 'mysore-2', 'mysore-5', 'mysore-3'] },
        ],
        inclusions: INCLUSIONS, exclusions: EXCLUSIONS,
    },
    {
        id: 'blr-mys-heritage',
        from: 'Bangalore', to: 'Mysore',
        title: 'Royal Mysore Heritage',
        theme: 'Heritage',
        tags: ['Palaces', 'Culture', 'Art'],
        durationDays: 2, nights: 1, transferKm: 150,
        summary: 'A relaxed two-day immersion in the city of the Wadiyars — palaces, art galleries, the buzzing Devaraja market, and golden-hour gardens.',
        heroAttractionId: 'mysore-1',
        days: [
            { day: 1, title: 'Palaces & old city', attractionIds: ['mysore-1', 'mysore-7', 'mysore-8', 'mysore-5'] },
            { day: 2, title: 'Hills & gardens', attractionIds: ['mysore-2', 'mysore-10', 'mysore-3'] },
        ],
        inclusions: INCLUSIONS, exclusions: EXCLUSIONS,
    },
    {
        id: 'blr-mys-family',
        from: 'Bangalore', to: 'Mysore',
        title: 'Mysore Family Weekend',
        theme: 'Family',
        tags: ['Kid-safe', 'Zoo', 'Gardens'],
        durationDays: 2, nights: 1, transferKm: 150,
        summary: 'Built for kids — one of India\'s oldest zoos, a walk-through aviary, a vintage rail museum, plus the palace and musical fountain.',
        heroAttractionId: 'mysore-4',
        days: [
            { day: 1, title: 'Animals & easy fun', attractionIds: ['mysore-4', 'mysore-6', 'mysore-9'] },
            { day: 2, title: 'Palace & fountain', attractionIds: ['mysore-1', 'mysore-2', 'mysore-3'] },
        ],
        inclusions: INCLUSIONS, exclusions: EXCLUSIONS,
    },
    {
        id: 'blr-mys-coorg',
        from: 'Bangalore', to: 'Mysore',
        title: 'Mysore + Coorg Escape',
        theme: 'Nature',
        tags: ['Hills', 'Waterfalls', 'Coffee country'],
        durationDays: 3, nights: 2, transferKm: 250,
        summary: 'Pair the royal city with the misty hills of Coorg — palace and temple, then waterfalls, an elephant camp, and the Golden Temple.',
        heroAttractionId: 'coorg-1',
        days: [
            { day: 1, title: 'Mysore highlights', attractionIds: ['mysore-1', 'mysore-2'] },
            { day: 2, title: 'Into Coorg', attractionIds: ['coorg-1', 'coorg-3', 'coorg-4'] },
            { day: 3, title: 'Madikeri & back', attractionIds: ['coorg-2', 'coorg-6'] },
        ],
        inclusions: INCLUSIONS, exclusions: EXCLUSIONS,
    },
];

function findAttraction(id: string): CuratedAttraction | null {
    const city = id.split('-')[0];
    const list = getCuratedDestination(city);
    return list?.find((a) => a.id === id) || null;
}

export function resolvePackageDay(day: PackageDay): CuratedAttraction[] {
    return day.attractionIds
        .map(findAttraction)
        .filter((a): a is CuratedAttraction => a !== null);
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

export function packagePrice(pkg: TravelPackage, car: Car): TripStats {
    return computePackagePrice({ transferKm: pkg.transferKm, numDays: pkg.durationDays, car });
}

export function packagePriceFrom(pkg: TravelPackage): number {
    return packagePrice(pkg, cheapestCar).totalFare;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const ALIAS: Record<string, string> = { bengaluru: 'bangalore', mysuru: 'mysore' };
const canon = (s: string) => ALIAS[norm(s)] || norm(s);

export function getPackagesForRoute(from: string | undefined, to: string | undefined): TravelPackage[] {
    if (!from || !to) return [];
    const f = canon(from);
    const t = canon(to);
    return PACKAGES.filter((p) => canon(p.from) === f && canon(p.to) === t);
}

export function getPackageById(id: string): TravelPackage | null {
    return PACKAGES.find((p) => p.id === id) || null;
}

export function allPackages(): TravelPackage[] {
    return PACKAGES;
}
