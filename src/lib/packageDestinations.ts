// Curated destination-sightseeing data for the Packages prototype.
// Real attractions with real coordinates so the day-plan + map work even
// without an OPENROUTER / Google Places key. When a key is present, the AI
// path (usePackagePlan) is tried first and this is the graceful fallback.

import type { AIRecommendation } from '@/types';

export interface CuratedAttraction extends AIRecommendation {
  lat: number;
  lng: number;
}

const DESTINATIONS: Record<string, CuratedAttraction[]> = {
  mysore: [
    {
      id: 'mysore-1', name: 'Mysore Palace', type: 'heritage',
      description: 'The opulent seat of the Wadiyar dynasty and one of India\'s grandest royal residences. On Sunday nights and festivals it lights up with nearly 100,000 bulbs.',
      whyVisit: 'India\'s most visited palace after the Taj — unmissable.', famousFor: 'Indo-Saracenic architecture & evening illumination',
      rating: 4.8, badges: ['must-visit', 'instagram-worthy'], approximateKm: 1, detourKm: 0, suggestedDuration: 90, bestTimeToVisit: 'morning',
      lat: 12.3052, lng: 76.6552,
    },
    {
      id: 'mysore-2', name: 'Chamundi Hills', type: 'viewpoint',
      description: 'A 1,000-step climb (or short drive) to the Chamundeshwari Temple, with sweeping views over Mysore and the giant Nandi bull statue en route.',
      whyVisit: 'Hilltop temple + the best panorama of the city.', famousFor: 'Chamundeshwari Temple & city views',
      rating: 4.6, badges: ['must-visit'], approximateKm: 13, detourKm: 0, suggestedDuration: 75, bestTimeToVisit: 'morning',
      lat: 12.2724, lng: 76.6706,
    },
    {
      id: 'mysore-3', name: 'Brindavan Gardens', type: 'tourist',
      description: 'The iconic terraced gardens below the KRS Dam, famous for the musical fountain show after sunset. A classic family evening out.',
      whyVisit: 'One of India\'s most loved garden + fountain spectacles.', famousFor: 'Musical fountain & illuminated terraces',
      rating: 4.4, badges: ['family-friendly', 'instagram-worthy'], approximateKm: 19, detourKm: 0, suggestedDuration: 90, bestTimeToVisit: 'evening',
      lat: 12.4218, lng: 76.5716,
    },
    {
      id: 'mysore-4', name: 'Mysore Zoo', type: 'nature',
      description: 'Sri Chamarajendra Zoological Gardens — one of the oldest and best-maintained zoos in India, home to big cats, gorillas, giraffes and more.',
      whyVisit: 'Kids love it; spacious, shaded and well-kept.', famousFor: 'One of India\'s oldest zoos',
      rating: 4.5, badges: ['family-friendly'], approximateKm: 2, detourKm: 0, suggestedDuration: 120, bestTimeToVisit: 'morning',
      lat: 12.3022, lng: 76.6637,
    },
    {
      id: 'mysore-5', name: "St. Philomena's Cathedral", type: 'heritage',
      description: 'A soaring neo-Gothic cathedral with twin 175-ft spires, one of the tallest churches in Asia, with beautiful stained-glass interiors.',
      whyVisit: 'Stunning neo-Gothic architecture, quick to visit.', famousFor: 'Neo-Gothic twin spires',
      rating: 4.5, badges: ['instagram-worthy'], approximateKm: 2, detourKm: 0, suggestedDuration: 40, bestTimeToVisit: 'morning',
      lat: 12.3199, lng: 76.6552,
    },
    {
      id: 'mysore-6', name: 'Karanji Lake', type: 'nature',
      description: 'A serene lake with a walk-through aviary (one of India\'s largest) and a butterfly park, set against the backdrop of Chamundi Hills.',
      whyVisit: 'Calm nature break with the biggest aviary in India.', famousFor: 'Walk-through aviary & boating',
      rating: 4.3, badges: ['family-friendly', 'hidden-gem'], approximateKm: 2, detourKm: 0, suggestedDuration: 60, bestTimeToVisit: 'afternoon',
      lat: 12.3017, lng: 76.6694,
    },
    {
      id: 'mysore-7', name: 'Jaganmohan Palace Art Gallery', type: 'cultural',
      description: 'A former royal palace now housing one of South India\'s richest art collections, including original Raja Ravi Varma paintings.',
      whyVisit: 'A treasure trove of Indian art in a royal setting.', famousFor: 'Raja Ravi Varma paintings',
      rating: 4.2, badges: ['hidden-gem'], approximateKm: 1, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'afternoon',
      lat: 12.3074, lng: 76.6492,
    },
    {
      id: 'mysore-8', name: 'Devaraja Market', type: 'cultural',
      description: 'A vibrant 100-year-old bazaar bursting with flowers, fruit, spices and the famous Mysore sandalwood and incense.',
      whyVisit: 'A feast for the senses and great for souvenirs.', famousFor: 'Flowers, spices & sandalwood',
      rating: 4.1, badges: ['off-the-beaten-path'], approximateKm: 1, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'morning',
      lat: 12.3098, lng: 76.6531,
    },
    {
      id: 'mysore-9', name: 'Mysore Rail Museum', type: 'cultural',
      description: 'An open-air museum of vintage locomotives and royal saloon carriages, including the Maharani\'s coach. A hit with children.',
      whyVisit: 'Charming, quick and great for families.', famousFor: 'Vintage locomotives & royal coaches',
      rating: 4.2, badges: ['family-friendly'], approximateKm: 3, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'afternoon',
      lat: 12.3199, lng: 76.6447,
    },
    {
      id: 'mysore-10', name: 'Lalitha Mahal Palace', type: 'heritage',
      description: 'A gleaming white former royal guesthouse modelled on St Paul\'s Cathedral, now a heritage hotel — stop for its grand facade and high tea.',
      whyVisit: 'Photogenic white palace, lovely for a relaxed stop.', famousFor: 'White Italianate palace',
      rating: 4.3, badges: ['instagram-worthy'], approximateKm: 5, detourKm: 0, suggestedDuration: 40, bestTimeToVisit: 'afternoon',
      lat: 12.2958, lng: 76.6929,
    },
  ],
  ooty: [
    { id: 'ooty-1', name: 'Ooty Botanical Gardens', type: 'nature', description: 'Sprawling terraced gardens with rare trees, an Italian garden and a 20-million-year-old fossil tree.', whyVisit: 'The green heart of Ooty.', famousFor: 'Terraced gardens & fossil tree', rating: 4.4, badges: ['family-friendly'], approximateKm: 2, detourKm: 0, suggestedDuration: 90, bestTimeToVisit: 'morning', lat: 11.4133, lng: 76.7050 },
    { id: 'ooty-2', name: 'Ooty Lake', type: 'nature', description: 'A picturesque artificial lake offering pedal and row boating amid eucalyptus groves.', whyVisit: 'Classic Ooty boating experience.', famousFor: 'Boating', rating: 4.1, badges: ['family-friendly'], approximateKm: 3, detourKm: 0, suggestedDuration: 60, bestTimeToVisit: 'afternoon', lat: 11.4015, lng: 76.6857 },
    { id: 'ooty-3', name: 'Doddabetta Peak', type: 'viewpoint', description: 'The highest peak in the Nilgiris at 2,637 m, with a telescope house and 360° views.', whyVisit: 'Best views in the Nilgiris.', famousFor: 'Highest Nilgiri peak', rating: 4.5, badges: ['must-visit', 'instagram-worthy'], approximateKm: 10, detourKm: 0, suggestedDuration: 60, bestTimeToVisit: 'morning', lat: 11.4002, lng: 76.7357 },
    { id: 'ooty-4', name: 'Nilgiri Mountain Railway', type: 'heritage', description: 'A UNESCO World Heritage toy train chugging through tunnels and tea slopes between Ooty and Coonoor.', whyVisit: 'A UNESCO heritage ride.', famousFor: 'UNESCO toy train', rating: 4.7, badges: ['must-visit', 'instagram-worthy'], approximateKm: 1, detourKm: 0, suggestedDuration: 120, bestTimeToVisit: 'morning', lat: 11.4086, lng: 76.6953 },
    { id: 'ooty-5', name: 'Rose Garden', type: 'nature', description: 'India\'s largest rose garden with thousands of varieties cascading down a hillside.', whyVisit: 'Spectacular when in bloom.', famousFor: 'Largest rose garden in India', rating: 4.2, badges: ['instagram-worthy'], approximateKm: 2, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'morning', lat: 11.4090, lng: 76.7010 },
    { id: 'ooty-6', name: 'Tea Factory & Museum', type: 'cultural', description: 'See how Nilgiri tea is made and sample fresh brews with valley views.', whyVisit: 'Great for tea lovers + tastings.', famousFor: 'Nilgiri tea', rating: 4.0, badges: ['off-the-beaten-path'], approximateKm: 5, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'afternoon', lat: 11.4180, lng: 76.7250 },
  ],
  coorg: [
    { id: 'coorg-1', name: 'Abbey Falls', type: 'nature', description: 'A powerful waterfall framed by coffee and spice plantations, viewed from a hanging bridge.', whyVisit: 'Coorg\'s signature waterfall.', famousFor: 'Waterfall amid coffee estates', rating: 4.3, badges: ['must-visit', 'instagram-worthy'], approximateKm: 8, detourKm: 0, suggestedDuration: 60, bestTimeToVisit: 'morning', lat: 12.4584, lng: 75.7330 },
    { id: 'coorg-2', name: "Raja's Seat", type: 'viewpoint', description: 'A garden viewpoint where Kodava kings watched the sunset over rolling misty valleys.', whyVisit: 'The best sunset in Madikeri.', famousFor: 'Sunset valley views', rating: 4.2, badges: ['instagram-worthy'], approximateKm: 2, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'evening', lat: 12.4180, lng: 75.7270 },
    { id: 'coorg-3', name: 'Dubare Elephant Camp', type: 'adventure', description: 'A riverside camp where you can bathe and feed trained elephants, with rafting nearby.', whyVisit: 'Hands-on elephant experience.', famousFor: 'Elephant interactions', rating: 4.4, badges: ['family-friendly'], approximateKm: 30, detourKm: 0, suggestedDuration: 120, bestTimeToVisit: 'morning', lat: 12.3560, lng: 75.9750 },
    { id: 'coorg-4', name: 'Namdroling Monastery (Golden Temple)', type: 'heritage', description: 'A dazzling Tibetan Buddhist monastery at Bylakuppe with giant golden Buddha statues.', whyVisit: 'A serene golden marvel.', famousFor: 'Golden Buddha statues', rating: 4.6, badges: ['must-visit'], approximateKm: 34, detourKm: 0, suggestedDuration: 75, bestTimeToVisit: 'morning', lat: 12.4250, lng: 75.9560 },
    { id: 'coorg-5', name: 'Talacauvery', type: 'heritage', description: 'The sacred birthplace of the river Cauvery on the slopes of Brahmagiri, with hilltop shrines.', whyVisit: 'Spiritual + scenic origin point.', famousFor: 'Source of the Cauvery', rating: 4.3, badges: ['off-the-beaten-path'], approximateKm: 44, detourKm: 0, suggestedDuration: 60, bestTimeToVisit: 'morning', lat: 12.3870, lng: 75.4900 },
    { id: 'coorg-6', name: 'Madikeri Fort', type: 'heritage', description: 'A 17th-century fort housing a palace, museum and old church in the heart of Madikeri.', whyVisit: 'History + town views in one stop.', famousFor: 'Hilltop fort & museum', rating: 4.0, badges: ['hidden-gem'], approximateKm: 1, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'afternoon', lat: 12.4220, lng: 75.7390 },
  ],
  goa: [
    { id: 'goa-1', name: 'Baga Beach', type: 'nature', description: 'Goa\'s liveliest beach, famous for water sports, shacks and a buzzing nightlife strip.', whyVisit: 'The classic North Goa beach scene.', famousFor: 'Water sports & nightlife', rating: 4.2, badges: ['must-visit'], approximateKm: 12, detourKm: 0, suggestedDuration: 120, bestTimeToVisit: 'evening', lat: 15.5553, lng: 73.7517 },
    { id: 'goa-2', name: 'Fort Aguada', type: 'heritage', description: 'A well-preserved 17th-century Portuguese fort and lighthouse overlooking the Arabian Sea.', whyVisit: 'History with stunning sea views.', famousFor: 'Portuguese fort & lighthouse', rating: 4.4, badges: ['must-visit', 'instagram-worthy'], approximateKm: 15, detourKm: 0, suggestedDuration: 60, bestTimeToVisit: 'morning', lat: 15.4925, lng: 73.7736 },
    { id: 'goa-3', name: 'Basilica of Bom Jesus', type: 'heritage', description: 'A UNESCO World Heritage baroque church in Old Goa holding the relics of St Francis Xavier.', whyVisit: 'Goa\'s most important heritage church.', famousFor: 'UNESCO baroque church', rating: 4.6, badges: ['must-visit'], approximateKm: 10, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'morning', lat: 15.5009, lng: 73.9116 },
    { id: 'goa-4', name: 'Calangute Beach', type: 'nature', description: 'The "Queen of Beaches" — a long sweep of sand with every kind of shack and shop.', whyVisit: 'The biggest, busiest Goa beach.', famousFor: 'Queen of Beaches', rating: 4.0, badges: ['family-friendly'], approximateKm: 13, detourKm: 0, suggestedDuration: 90, bestTimeToVisit: 'afternoon', lat: 15.5440, lng: 73.7553 },
    { id: 'goa-5', name: 'Anjuna Flea Market', type: 'cultural', description: 'A legendary hippie-era market with handicrafts, jewellery and live music (Wednesdays).', whyVisit: 'Quirky shopping + great vibe.', famousFor: 'Hippie flea market', rating: 4.1, badges: ['off-the-beaten-path'], approximateKm: 18, detourKm: 0, suggestedDuration: 75, bestTimeToVisit: 'afternoon', lat: 15.5870, lng: 73.7440 },
    { id: 'goa-6', name: 'Dudhsagar Falls', type: 'nature', description: 'India\'s "Sea of Milk" — a four-tiered 310 m waterfall reached by a thrilling jeep safari.', whyVisit: 'One of India\'s most spectacular falls.', famousFor: '310 m tiered waterfall', rating: 4.7, badges: ['must-visit', 'instagram-worthy'], approximateKm: 60, detourKm: 0, suggestedDuration: 180, bestTimeToVisit: 'morning', lat: 15.3144, lng: 74.3144 },
  ],
  jaipur: [
    { id: 'jaipur-1', name: 'Hawa Mahal', type: 'heritage', description: 'The "Palace of Winds" — a five-storey honeycomb facade of 953 windows glowing pink at sunrise.', whyVisit: 'Jaipur\'s most iconic photo stop.', famousFor: '953 windows & pink sandstone', rating: 4.6, badges: ['must-visit', 'instagram-worthy'], approximateKm: 1, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'morning', lat: 26.9239, lng: 75.8267 },
    { id: 'jaipur-2', name: 'Amber Fort', type: 'heritage', description: 'A majestic hilltop fort-palace above Maota Lake, famed for its Sheesh Mahal mirror hall.', whyVisit: 'Rajasthan\'s grandest hilltop fort.', famousFor: 'Sheesh Mahal & ramparts', rating: 4.8, badges: ['must-visit', 'instagram-worthy'], approximateKm: 11, detourKm: 0, suggestedDuration: 120, bestTimeToVisit: 'morning', lat: 26.9855, lng: 75.8513 },
    { id: 'jaipur-3', name: 'City Palace', type: 'heritage', description: 'The living royal residence blending Rajput and Mughal design, with courtyards and museums.', whyVisit: 'See how Jaipur royalty still lives.', famousFor: 'Royal courtyards & museums', rating: 4.5, badges: ['must-visit'], approximateKm: 1, detourKm: 0, suggestedDuration: 90, bestTimeToVisit: 'morning', lat: 26.9258, lng: 75.8237 },
    { id: 'jaipur-4', name: 'Jantar Mantar', type: 'heritage', description: 'A UNESCO observatory of giant masonry instruments, including the world\'s largest stone sundial.', whyVisit: 'Astronomical genius in stone.', famousFor: "World's largest stone sundial", rating: 4.3, badges: ['must-visit'], approximateKm: 1, detourKm: 0, suggestedDuration: 45, bestTimeToVisit: 'afternoon', lat: 26.9247, lng: 75.8244 },
    { id: 'jaipur-5', name: 'Nahargarh Fort', type: 'viewpoint', description: 'A ridge-top fort with the best sunset panorama over the whole pink city.', whyVisit: 'Best sunset view of Jaipur.', famousFor: 'City sunset views', rating: 4.5, badges: ['instagram-worthy'], approximateKm: 6, detourKm: 0, suggestedDuration: 60, bestTimeToVisit: 'evening', lat: 26.9374, lng: 75.8155 },
    { id: 'jaipur-6', name: 'Jal Mahal', type: 'heritage', description: 'The romantic "Water Palace" appearing to float in the middle of Man Sagar Lake.', whyVisit: 'A serene, photogenic quick stop.', famousFor: 'Palace on the lake', rating: 4.2, badges: ['instagram-worthy'], approximateKm: 6, detourKm: 0, suggestedDuration: 30, bestTimeToVisit: 'morning', lat: 26.9535, lng: 75.8460 },
  ],
};

// City-name aliases → canonical key
const ALIASES: Record<string, string> = {
  mysuru: 'mysore',
  udagamandalam: 'ooty',
  madikeri: 'coorg',
  kodagu: 'coorg',
  panaji: 'goa',
  panjim: 'goa',
};

export function getCuratedDestination(city: string | undefined | null): CuratedAttraction[] | null {
  if (!city) return null;
  const key = city.toLowerCase().replace(/[^a-z]/g, '');
  const canonical = ALIASES[key] || key;

  let list = DESTINATIONS[canonical];
  if (!list) {
    // partial/contains match (e.g. "mysorecity", "north goa")
    const match = Object.keys(DESTINATIONS).find(
      (k) => canonical.includes(k) || k.includes(canonical),
    );
    if (match) list = DESTINATIONS[match];
  }
  if (!list) return null;

  // Return fresh copies so callers can mutate safely.
  return list.map((a) => ({ ...a }));
}

export function hasCuratedDestination(city: string | undefined | null): boolean {
  return getCuratedDestination(city) !== null;
}
