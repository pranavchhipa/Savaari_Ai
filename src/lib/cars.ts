import type { Car } from '@/types';

// Shared sample fleet (used by /listing and /packages).
export const sampleCars: Car[] = [
    {
        id: '1', name: 'Maruti Wagon R', image: '/cars/wagon-r.png', type: 'Hatchback',
        seats: 4, ac: true, rating: 4.7, reviewCount: 2341,
        baseFare: 3900, perKmRate: 12, driverAllowancePerDay: 300,
        features: ['Fuel Included', 'Toll Included in Est.'], localPackage8hr: 1800, localPackage12hr: 2400,
    },
    {
        id: '2', name: 'Toyota Etios', image: '/cars/etios.png', type: 'Sedan',
        seats: 4, ac: true, rating: 4.8, reviewCount: 3892,
        baseFare: 4500, perKmRate: 14, driverAllowancePerDay: 300,
        features: ['Comfortable Ride', 'Spacious Boot'], localPackage8hr: 2200, localPackage12hr: 2900,
    },
    {
        id: '3', name: 'Honda Amaze', image: '/cars/amaze.png', type: 'Sedan',
        seats: 4, ac: true, rating: 4.6, reviewCount: 1567,
        baseFare: 4850, perKmRate: 15, driverAllowancePerDay: 350,
        features: ['Premium Interior', 'Extra Legroom'], localPackage8hr: 2400, localPackage12hr: 3200,
    },
    {
        id: '4', name: 'Maruti Ertiga', image: '/cars/ertiga.png', type: 'MUV',
        seats: 7, ac: true, rating: 4.5, reviewCount: 1893,
        baseFare: 5800, perKmRate: 18, driverAllowancePerDay: 400,
        features: ['Great for Groups', '7 Seater'], localPackage8hr: 3200, localPackage12hr: 4200,
    },
    {
        id: '5', name: 'Toyota Innova Crysta', image: '/cars/innova.png', type: 'SUV',
        seats: 7, ac: true, rating: 4.9, reviewCount: 5234,
        baseFare: 7100, perKmRate: 22, driverAllowancePerDay: 500,
        features: ['Captain Seats', 'Luxury Comfort', 'Ample Luggage'], localPackage8hr: 4500, localPackage12hr: 5800,
    },
];

export const cheapestCar = sampleCars[0];
