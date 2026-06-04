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

// ===== Editorial content shown on the package detail page =====
export interface PackageContent {
    overview: string;
    highlights: string[];
    goodToKnow: string[];
}

const GK_ONEWAY = [
    "Early ~7 AM start keeps the stops unhurried",
    "Dropped at your Mysore address — this is a one-way trip, no return",
    "Monument entry tickets are paid directly at each spot",
];
const GK_RT = [
    "The cab stays with you for the whole trip — sightsee at your own pace",
    "Stay at the hotel of your choice (accommodation not included)",
    "Reorder or skip stops anytime with your driver",
];
const GK_LOCAL = [
    "8 hours / 80 km within city limits, start any time you like",
    "Extra hours or kilometres are billed as per the standard slab",
    "Monument entry tickets are paid directly at each spot",
];

const PACKAGE_CONTENT: Record<string, PackageContent> = {
    // ---- One Way: Bangalore -> Mysore ----
    "ow-blr-mys-family": {
        overview: "A feel-good drive down the Mysore highway that the whole family will love. Break the journey at Channapatna to watch artisans turn wood into bright lacquered toys, then roll into Mysore for its grand palace, one of India's oldest zoos and the musical fountain at Brindavan Gardens. Easy pace, plenty for the kids, and you're dropped right at your Mysore stay.",
        highlights: ["Toy-making stop at Channapatna", "Grand Mysore Palace visit", "Animals galore at Mysore Zoo", "Musical fountain finale at Brindavan Gardens"],
        goodToKnow: GK_ONEWAY,
    },
    "ow-blr-mys-romantic": {
        overview: "A romantic one-way escape that ends on a high — golden hour by the fountains. Pause at Tipu's island-fortress of Srirangapatna, take in the regal Mysore Palace, climb Chamundi Hills for sweeping views, and finish with the illuminated musical fountain at Brindavan Gardens as the sun goes down.",
        highlights: ["Island fort of Srirangapatna", "Regal Mysore Palace", "Hilltop views from Chamundi", "Sunset fountain show for two"],
        goodToKnow: GK_ONEWAY,
    },
    "ow-blr-mys-solo": {
        overview: "A history-rich run to Mysore at your own rhythm. Start with Tipu Sultan's fortress town of Srirangapatna, dive into the Wadiyar legacy at Mysore Palace, admire original Raja Ravi Varma works at the Jaganmohan gallery, and round off with the climb to Chamundi Hills.",
        highlights: ["Tipu Sultan's Srirangapatna", "Wadiyar-era Mysore Palace", "Raja Ravi Varma art gallery", "Chamundi Hills temple & views"],
        goodToKnow: GK_ONEWAY,
    },
    "ow-blr-mys-friends": {
        overview: "A fun one-way road trip with a cinematic detour. Strike a pose among the granite boulders of Ramanagara where Sholay was filmed, then hit Mysore for its palace, the Chamundi Hills climb and the crowd-pleasing musical fountain after dark.",
        highlights: ["Sholay rocks photo-op at Ramanagara", "Iconic Mysore Palace", "Chamundi Hills panorama", "Evening musical fountain"],
        goodToKnow: GK_ONEWAY,
    },
    "ow-blr-mys-express": {
        overview: "Short on time? This no-fuss run heads straight for Mysore's three big-hitters — the palace, the Chamundi Hills viewpoint and the Brindavan musical fountain — and drops you at your destination. Maximum sights, minimum detours.",
        highlights: ["Straight to Mysore Palace", "Chamundi Hills views", "Brindavan musical fountain", "No detours, all highlights"],
        goodToKnow: GK_ONEWAY,
    },
    // ---- Round Trip: Bangalore <-> Mysore ----
    "rt-blr-mys-family": {
        overview: "Two relaxed days in Mysore with the cab at your disposal throughout. Day one is all easy fun — the zoo, the palace and the aviary at Karanji Lake; day two takes you up Chamundi Hills, through Brindavan Gardens and the vintage trains of the Rail Museum before heading home. No rushing, no rebooking.",
        highlights: ["Mysore Zoo & Karanji Lake aviary", "Lit-up Mysore Palace", "Chamundi Hills + Brindavan Gardens", "Vintage trains at the Rail Museum"],
        goodToKnow: GK_RT,
    },
    "rt-blr-mys-romantic": {
        overview: "A two-day couple's retreat built around golden light and grand views. Spend the first day at the palace and the illuminated Brindavan Gardens, then wake early for the Chamundi Hills sunrise, a stop at the gleaming white Lalitha Mahal palace and the calm of Karanji Lake before the drive home.",
        highlights: ["Illuminated Brindavan Gardens", "Royal Mysore Palace", "Sunrise from Chamundi Hills", "White Lalitha Mahal palace"],
        goodToKnow: GK_RT,
    },
    "rt-blr-mys-solo": {
        overview: "An unhurried two-day wander through Mysore's royal and cultural side. Explore the palace, the Jaganmohan art gallery and the century-old Devaraja Market on day one; on day two soak up Chamundi Hills, St Philomena's Cathedral and the Brindavan fountains before returning.",
        highlights: ["Mysore Palace & art gallery", "100-year-old Devaraja Market", "Neo-Gothic St Philomena's", "Chamundi Hills & Brindavan"],
        goodToKnow: GK_RT,
    },
    "rt-blr-mys-friends": {
        overview: "A lively two-day loop with the squad and your own cab to roam. Cover the palace and Brindavan Gardens on day one, then chase forts and lakes on day two — Tipu's Srirangapatna, the Karanji aviary and the quirky Rail Museum — before the drive back to Bangalore.",
        highlights: ["Mysore Palace & gardens", "Tipu's Srirangapatna fort", "Karanji Lake aviary", "Two days, cab on call"],
        goodToKnow: GK_RT,
    },
    "rt-blr-mys-grand": {
        overview: "The full royal experience, savoured over two relaxed days. Begin with the palace, the Jaganmohan gallery and the Brindavan fountains, then dedicate day two to Chamundi Hills, the Lalitha Mahal palace, Karanji Lake and St Philomena's Cathedral. Mysore, done properly.",
        highlights: ["Palace + Jaganmohan gallery", "Brindavan musical fountain", "Chamundi Hills & Lalitha Mahal", "St Philomena's Cathedral"],
        goodToKnow: GK_RT,
    },
    // ---- Local: Bangalore ----
    "lo-blr-family": {
        overview: "A full day showing the kids the best of Bengaluru. Start with a big-cat jeep safari at Bannerghatta, breathe in the greenery and glass house of Lalbagh, and finish at the Tudor-style Bangalore Palace. Comfortable, shaded and endlessly entertaining.",
        highlights: ["Big-cat safari at Bannerghatta", "Glass House at Lalbagh", "Tudor-style Bangalore Palace", "Easy, family-friendly pace"],
        goodToKnow: GK_LOCAL,
    },
    "lo-blr-romantic": {
        overview: "A laid-back day for two through the city's leafiest corners, timed for a sunset finish. Stroll Lalbagh's botanical paths and the shaded avenues of Cubbon Park, then drive up to Nandi Hills for golden-hour views above the clouds.",
        highlights: ["Botanical Lalbagh stroll", "Green calm of Cubbon Park", "Sunset atop Nandi Hills", "Relaxed, scenic pace"],
        goodToKnow: GK_LOCAL,
    },
    "lo-blr-solo": {
        overview: "A day tracing Bengaluru's landmarks at your own pace. Take in the Tudor Bangalore Palace, the granite grandeur of Vidhana Soudha, the serene hilltop ISKCON temple and the green heart of Cubbon Park — history, architecture and calm in one loop.",
        highlights: ["Tudor Bangalore Palace", "Iconic Vidhana Soudha", "Hilltop ISKCON temple", "Leafy Cubbon Park"],
        goodToKnow: GK_LOCAL,
    },
    "lo-blr-friends": {
        overview: "A high-energy day with the gang, bookended by Nandi Hills at dawn. Catch sunrise above the clouds, wind down in Cubbon Park, browse Commercial Street and UB City, and end at the historic Bull Temple. City buzz, sorted.",
        highlights: ["Sunrise at Nandi Hills", "Cubbon Park chill", "Shopping on Commercial Street", "Historic Bull Temple"],
        goodToKnow: GK_LOCAL,
    },
    // ---- Local: Mysore ----
    "lo-mys-family": {
        overview: "A day built for families in the heart of Mysuru. Meet the animals at one of India's oldest zoos, spot birds at the Karanji Lake aviary, climb aboard vintage trains at the Rail Museum and end at the magnificent Mysore Palace.",
        highlights: ["One of India's oldest zoos", "Karanji Lake walk-through aviary", "Vintage trains at Rail Museum", "Grand Mysore Palace"],
        goodToKnow: GK_LOCAL,
    },
    "lo-mys-romantic": {
        overview: "A gentle, scenic day for two around Mysuru. Watch the musical fountain dance at Brindavan Gardens, climb Chamundi Hills for the city panorama, and pause at the gleaming white Lalitha Mahal palace for high tea and photos.",
        highlights: ["Musical fountain at Brindavan", "Chamundi Hills panorama", "White Lalitha Mahal palace", "Slow, romantic pace"],
        goodToKnow: GK_LOCAL,
    },
    "lo-mys-solo": {
        overview: "A culture-soaked day across royal Mysuru. Tour the opulent palace, admire Raja Ravi Varma masterpieces at the Jaganmohan gallery, wander the century-old Devaraja Market and finish at the neo-Gothic St Philomena's Cathedral.",
        highlights: ["Opulent Mysore Palace", "Jaganmohan art gallery", "Bustling Devaraja Market", "St Philomena's Cathedral"],
        goodToKnow: GK_LOCAL,
    },
    "lo-mys-friends": {
        overview: "A full, fun day around Mysuru with the crew. Start with the Chamundi Hills climb, cool off at Brindavan Gardens, meet the animals at the zoo and catch the aviary at Karanji Lake — views, gardens and good times.",
        highlights: ["Chamundi Hills views", "Brindavan Gardens fountain", "Mysore Zoo", "Karanji Lake aviary"],
        goodToKnow: GK_LOCAL,
    },
};

export function getPackageContent(pkg: TravelPackage): PackageContent {
    const c = PACKAGE_CONTENT[pkg.id];
    if (c) return c;
    const gk = pkg.tripType === 'local' ? GK_LOCAL : pkg.tripType === 'round-trip' ? GK_RT : GK_ONEWAY;
    const places = pkg.days.flatMap(resolvePackageDay);
    return {
        overview: pkg.tagline,
        highlights: places.slice(0, 4).map((p) => p.name),
        goodToKnow: gk,
    };
}
