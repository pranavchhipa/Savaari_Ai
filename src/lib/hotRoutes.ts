// Server-side hot route data — imported by ai.ts

import { AIRecommendation, StopBadge } from '@/types';

// Helper to create a stop entry concisely
function s(id: string, name: string, type: AIRecommendation['type'], desc: string, why: string, famous: string, rating: number, badges: StopBadge[], km: number, detour: number, duration: number, best: string): AIRecommendation {
    return { id, name, type, description: desc, whyVisit: why, famousFor: famous, rating, badges, approximateKm: km, detourKm: detour, suggestedDuration: duration, bestTimeToVisit: best };
}

/**
 * Curated tourist attractions for Savaari's top 19 hot routes.
 * These bypass AI entirely to save credits and provide instant results.
 */
export const hotRoutes: Record<string, AIRecommendation[]> = {
    // 1. Bangalore → Mysore (already partially existed, enhanced)
    'bangalore-mysore': [
        s('h1', 'Ramanagara', 'nature', 'The "Sholay" filming location with dramatic rocky outcrops. A paradise for rock climbing and Bollywood fans.', 'Stand where Bollywood history was made', 'Sholay filming location', 4.2, ['instagram-worthy'], 50, 2, 30, 'morning'),
        s('h2', 'Channapatna Toy Town', 'cultural', 'UNESCO-recognized wooden toy tradition from Tipu Sultan era. Watch artisans craft colorful lacquerware toys.', 'Buy handcrafted toys from centuries-old workshops', 'Traditional wooden toys', 4.0, ['hidden-gem', 'family-friendly'], 65, 1, 40, 'anytime'),
        s('h3', 'Srirangapatna Fort', 'heritage', 'Island fortress where Tipu Sultan made his last stand. Explore the palace, dungeons, and Ranganathaswamy Temple.', 'Walk through a fortress that changed Indian history', 'Tipu Sultan Fort', 4.7, ['must-visit'], 120, 3, 60, 'morning'),
        s('h4', 'Brindavan Gardens', 'tourist', 'Iconic illuminated musical fountain gardens at KRS Dam. A mesmerizing spectacle of water, light, and music.', 'One of India\'s most famous garden experiences', 'Musical fountain & illuminated gardens', 4.5, ['must-visit', 'instagram-worthy'], 140, 5, 90, 'evening'),
        s('h5', 'Mysore Palace', 'heritage', 'One of India\'s most magnificent royal palaces. The illuminated palace at night with 97,000 bulbs is unforgettable.', 'India\'s most visited palace after the Taj Mahal', 'Indo-Saracenic architecture', 4.9, ['must-visit', 'instagram-worthy'], 150, 0, 90, 'morning'),
    ],

    // 2. Hyderabad → Srisailam
    'hyderabad-srisailam': [
        s('h1', 'Ananthagiri Hills', 'nature', 'Lush green hills and dense forests just outside Hyderabad. Popular trekking destination with ancient temples.', 'A serene escape into nature at the city\'s doorstep', 'Trekking & waterfalls', 4.2, ['instagram-worthy'], 80, 5, 60, 'morning'),
        s('h2', 'Urmila Devi Temple', 'heritage', 'Ancient temple dedicated to Goddess Urmila, nestled in the Nallamala forest. A spiritual stop on the pilgrimage route.', 'Ancient forest temple with mystical atmosphere', 'Nallamala forest temple', 4.0, ['hidden-gem'], 120, 2, 30, 'morning'),
        s('h3', 'Akka Mahadevi Caves', 'heritage', 'Natural limestone caves with religious significance near Srisailam. The caves have ancient inscriptions and carvings.', 'Explore ancient caves with centuries-old carvings', 'Limestone caves & ancient art', 4.3, ['hidden-gem'], 180, 8, 45, 'morning'),
        s('h4', 'Srisailam Dam', 'nature', 'One of the largest dams in India across the Krishna River. The backwaters and surrounding hills create stunning vistas.', 'Marvel at engineering and nature combined', 'Krishna River dam & viewpoint', 4.5, ['instagram-worthy'], 210, 2, 45, 'anytime'),
        s('h5', 'Mallikarjuna Swamy Temple', 'heritage', 'One of the 12 Jyotirlingas and 18 Shakti Peethas — the only place in India with both. Ancient Shiva temple of immense significance.', 'One of India\'s holiest pilgrimage sites', '12 Jyotirlingas & Shakti Peetha', 4.9, ['must-visit'], 215, 0, 90, 'morning'),
    ],

    // 3. Bangalore → Chikkaballapur
    'bangalore-chikkaballapur': [
        s('h1', 'Devanahalli Fort', 'heritage', 'Birthplace of Tipu Sultan — a well-preserved 15th-century fort. The stone walls tell tales of Vijayanagara and Mysore kingdoms.', 'Visit the birthplace of the Tiger of Mysore', 'Tipu Sultan\'s birthplace', 4.3, ['must-visit'], 30, 3, 45, 'morning'),
        s('h2', 'Bhoga Nandeeshwara Temple', 'heritage', 'A 1000-year-old Shiva temple at the foothills of Nandi Hills — one of Karnataka\'s oldest temples with stunning Chola-era carvings.', 'Witness a millennium of temple architecture', 'Ancient Chola-era temple', 4.5, ['must-visit'], 50, 5, 45, 'morning'),
        s('h3', 'Nandi Hills', 'viewpoint', 'Famous sunrise viewpoint at 4851 ft with panoramic views. Tipu Sultan\'s summer retreat with cool breezes and historic fortifications.', 'The most iconic sunrise near Bangalore', 'Sunrise viewpoint & Tipu\'s retreat', 4.7, ['must-visit', 'instagram-worthy'], 55, 8, 90, 'morning'),
    ],

    // 4. Bangalore → Coorg
    'bangalore-coorg': [
        s('h1', 'Ramanagara', 'nature', 'Rocky outcrops made famous by the Sholay film. Popular for rock climbing and silk farming.', 'The iconic Sholay filming location', 'Rocky cliffs & rock climbing', 4.2, ['instagram-worthy'], 50, 2, 30, 'morning'),
        s('h2', 'Bylakuppe Tibetan Settlement', 'cultural', 'India\'s second-largest Tibetan settlement with stunning golden monasteries. The Namdroling Monastery is breathtaking.', 'Experience Tibet in the heart of Karnataka', 'Golden Temple & Tibetan culture', 4.6, ['must-visit', 'instagram-worthy'], 200, 10, 60, 'morning'),
        s('h3', 'Dubare Elephant Camp', 'nature', 'Bathe and feed elephants at this riverside camp on the Cauvery. A unique wildlife experience at the edge of Coorg.', 'Get up close with elephants at the river', 'Elephant bathing & Cauvery riverside', 4.4, ['family-friendly'], 230, 5, 60, 'morning'),
        s('h4', 'Abbey Falls', 'nature', 'A stunning waterfall nestled among coffee and spice plantations. The lush green surroundings are quintessential Coorg.', 'Coorg\'s most beautiful waterfall', 'Waterfall amid coffee plantations', 4.5, ['instagram-worthy'], 260, 3, 45, 'anytime'),
        s('h5', 'Raja\'s Seat', 'viewpoint', 'The famous sunset viewpoint where Coorg kings watched sunsets over misty valleys. The musical fountain show at dusk is delightful.', 'Watch sunset like the kings of Coorg', 'Royal sunset viewpoint', 4.6, ['must-visit', 'instagram-worthy'], 265, 0, 45, 'evening'),
    ],

    // 5. Bangalore → Ooty
    'bangalore-ooty': [
        s('h1', 'Mysore Palace', 'heritage', 'One of India\'s grandest palaces illuminated with 97,000 bulbs. A must-see whether day or night.', 'India\'s most visited palace after the Taj', 'Royal palace & illumination', 4.9, ['must-visit', 'instagram-worthy'], 145, 5, 90, 'morning'),
        s('h2', 'Bandipur National Park', 'nature', 'One of India\'s premier tiger reserves in the Nilgiri Biosphere. Spot elephants, deer, and if lucky, a Bengal tiger.', 'Safari through one of India\'s finest wildlife reserves', 'Tiger reserve & elephant herds', 4.7, ['must-visit', 'instagram-worthy'], 220, 0, 120, 'morning'),
        s('h3', 'Mudumalai National Park', 'nature', 'Contiguous with Bandipur, this sanctuary is famous for its elephant population. The Moyar River gorge is spectacular.', 'See India\'s largest elephant population in the wild', 'Elephant sanctuary & Moyar gorge', 4.5, ['must-visit'], 260, 2, 90, 'morning'),
        s('h4', 'Ooty Botanical Gardens', 'nature', 'Established in 1848, these 22-hectare gardens house rare plant species and a fossilized tree trunk over 20 million years old.', 'A 175-year-old botanical treasure', 'Rare plants & fossil tree', 4.4, ['family-friendly'], 280, 0, 60, 'morning'),
        s('h5', 'Ooty Lake', 'nature', 'A serene artificial lake surrounded by Eucalyptus trees and the Nilgiri hills. Boating here with misty mountains is magical.', 'Boating amidst the Queen of Hill Stations', 'Boating & Nilgiri views', 4.3, ['family-friendly', 'instagram-worthy'], 282, 0, 60, 'anytime'),
    ],

    // 6. Mumbai → Pune
    'mumbai-pune': [
        s('h1', 'Khandala', 'viewpoint', 'A picturesque hill station perched on the Western Ghats. The famous Duke\'s Nose offers panoramic valley views.', 'Stunning Western Ghats viewpoints', 'Duke\'s Nose & valley views', 4.3, ['instagram-worthy'], 80, 2, 45, 'morning'),
        s('h2', 'Lonavala', 'nature', 'The beloved hill station famous for its chikki and misty valleys. Tiger\'s Leap and Bhushi Dam are iconic landmarks.', 'Maharashtra\'s favorite weekend getaway', 'Tiger\'s Leap & chikki', 4.5, ['must-visit', 'family-friendly'], 85, 0, 60, 'anytime'),
        s('h3', 'Karla Caves', 'heritage', 'Ancient Buddhist rock-cut caves dating to the 2nd century BC. The grand Chaitya hall is one of the finest in India.', 'Walk through 2,200-year-old Buddhist caves', '2nd century BC Buddhist caves', 4.4, ['must-visit'], 95, 3, 45, 'morning'),
        s('h4', 'Lohagad Fort', 'heritage', 'A majestic hill fort rising 3400 ft with four grand gates. The Vinchukata (Scorpion Tail) formation is dramatic.', 'Trek to a fort with 2000 years of history', 'Historic hill fort & Vinchukata', 4.5, ['instagram-worthy', 'must-visit'], 100, 8, 90, 'morning'),
    ],

    // 7. Mumbai → Lonavala
    'mumbai-lonavala': [
        s('h1', 'Adlabs Imagica', 'tourist', 'India\'s premier theme park with international-standard rides. A must-stop for families on the Mumbai-Pune Expressway.', 'India\'s best theme park experience', 'Theme park & entertainment', 4.3, ['family-friendly'], 55, 3, 120, 'anytime'),
        s('h2', 'Tiger\'s Leap', 'viewpoint', 'A cliff-top viewpoint where a rock formation resembles a leaping tiger. The valley views during monsoon are breathtaking.', 'Stand at the edge of a misty valley', 'Iconic cliff viewpoint', 4.5, ['must-visit', 'instagram-worthy'], 82, 2, 30, 'morning'),
        s('h3', 'Bhushi Dam', 'nature', 'A popular dam where waterfalls cascade down steps during monsoon. Swimming and playing in the water is a Lonavala tradition.', 'Splash under waterfalls on ancient stone steps', 'Monsoon waterfall steps', 4.2, ['family-friendly'], 84, 1, 45, 'anytime'),
        s('h4', 'Karla Caves', 'heritage', 'Ancient Buddhist rock-cut caves from the 2nd century BC. The grand Chaitya hall with its 37 pillars is awe-inspiring.', 'Explore 2,200-year-old Buddhist masterpieces', 'Ancient Buddhist caves', 4.4, ['must-visit'], 90, 5, 45, 'morning'),
    ],

    // 8. Bangalore → Chikmagalur
    'bangalore-chikmagalur': [
        s('h1', 'Shravanabelagola', 'heritage', 'The 57-foot monolithic Bahubali statue — the world\'s tallest monolithic statue. A UNESCO tentative site and Jain pilgrimage center.', 'See the world\'s tallest monolithic statue', 'Bahubali statue & Jain heritage', 4.8, ['must-visit', 'instagram-worthy'], 150, 10, 90, 'morning'),
        s('h2', 'Belur Chennakeshava Temple', 'heritage', 'A 12th-century Hoysala masterpiece with astonishing stone carvings. Every inch is carved with intricate detail that defies belief.', 'Stone carving at its absolute finest', 'Hoysala architecture & carvings', 4.7, ['must-visit'], 190, 8, 60, 'morning'),
        s('h3', 'Halebidu Temple', 'heritage', 'Twin Hoysala temples with the most ornate carvings in India. The Nandi statue and frieze depicting the Ramayana are extraordinary.', 'Hoysala craftsmanship at its peak', 'Hoysaleshwara temple & Nandi', 4.6, ['must-visit', 'instagram-worthy'], 200, 12, 60, 'morning'),
        s('h4', 'Mullayanagiri Peak', 'viewpoint', 'Karnataka\'s highest peak at 6330 ft. The trek through shola forests to the summit temple offers stunning panoramic views.', 'Stand atop Karnataka\'s highest point', 'Highest peak in Karnataka', 4.5, ['instagram-worthy'], 245, 10, 90, 'morning'),
        s('h5', 'Baba Budangiri', 'heritage', 'Sacred mountain where Sufi saint Baba Budan introduced coffee to India. The cave shrine is revered by Hindus and Muslims alike.', 'Where Indian coffee history began', 'Birthplace of Indian coffee & Sufi shrine', 4.4, ['hidden-gem'], 250, 8, 60, 'morning'),
    ],

    // 9. Pune → Bhimashankar
    'pune-bhimashankar': [
        s('h1', 'Shivneri Fort', 'heritage', 'Birthplace of Chhatrapati Shivaji Maharaj. This hilltop fort has ancient water cisterns and a temple to Goddess Shivai.', 'Visit the birthplace of the Maratha Empire', 'Shivaji Maharaj\'s birthplace', 4.6, ['must-visit'], 100, 15, 90, 'morning'),
        s('h2', 'Lenyadri Caves', 'heritage', 'Buddhist caves dating to 1st-3rd century AD, including an Ashtavinayak Ganesh temple carved into the hillside.', 'Ancient Buddhist caves with a sacred Ganesh temple', 'Rock-cut caves & Ashtavinayak', 4.4, ['must-visit'], 95, 10, 60, 'morning'),
        s('h3', 'Bhimashankar Temple', 'heritage', 'One of the 12 sacred Jyotirlingas set in dense forest. The temple architecture and surrounding wildlife sanctuary are remarkable.', 'A sacred Jyotirlinga in pristine wilderness', 'Jyotirlinga & wildlife sanctuary', 4.8, ['must-visit'], 110, 0, 90, 'morning'),
    ],

    // 10. Hyderabad → Yadagirigutta
    'hyderabad-yadagirigutta': [
        s('h1', 'Bhongir Fort', 'heritage', 'A dramatic egg-shaped monolithic rock fort built in the 10th century. The climb to the top offers 360-degree views of the Deccan plateau.', 'Climb an ancient fort on a single massive rock', 'Monolithic rock fort & panoramic views', 4.3, ['instagram-worthy', 'must-visit'], 50, 2, 60, 'morning'),
        s('h2', 'Yadadri Lakshmi Narasimha Temple', 'heritage', 'The magnificently renovated hilltop temple dedicated to Lord Narasimha. The new white granite architecture is breathtaking.', 'A temple renovation rivaling ancient grandeur', 'Narasimha temple & hilltop views', 4.7, ['must-visit', 'instagram-worthy'], 70, 0, 90, 'morning'),
    ],

    // 11. Pune → Lonavala
    'pune-lonavala': [
        s('h1', 'Lohagad Fort', 'heritage', 'Majestic 3400ft hill fort with four grand gates. The Vinchukata rock formation and panoramic views are stunning.', 'Trek a 2000-year-old fort with epic views', 'Historic fort & Vinchukata', 4.5, ['must-visit', 'instagram-worthy'], 30, 5, 90, 'morning'),
        s('h2', 'Karla Caves', 'heritage', 'Ancient Buddhist rock-cut caves from the 2nd century BC with a magnificent Chaitya hall.', 'Explore India\'s finest ancient Buddhist caves', '2nd century BC Chaitya hall', 4.4, ['must-visit'], 45, 3, 45, 'morning'),
        s('h3', 'Tiger\'s Leap', 'viewpoint', 'Cliff-top viewpoint where rock resembles a leaping tiger. Misty valley views during monsoon are unforgettable.', 'Stand at the edge of the Western Ghats', 'Iconic cliff & valley views', 4.5, ['instagram-worthy'], 60, 2, 30, 'morning'),
        s('h4', 'Rajmachi Fort', 'heritage', 'Twin forts (Shrivardhan and Manaranjan) perched on the Western Ghats. The trek through monsoon valleys is legendary.', 'Trek to twin forts above the clouds', 'Twin hill forts & monsoon trek', 4.3, ['instagram-worthy'], 55, 10, 120, 'morning'),
    ],

    // 12. Bangalore → Nandi Hills
    'bangalore-nandihills': [
        s('h1', 'Devanahalli Fort', 'heritage', 'Birthplace of Tipu Sultan with well-preserved 15th-century fortifications. A quick historical stop on the way.', 'Visit where the Tiger of Mysore was born', 'Tipu Sultan\'s birthplace', 4.2, ['hidden-gem'], 35, 3, 30, 'morning'),
        s('h2', 'Nandi Hills Sunrise Point', 'viewpoint', 'The iconic sunrise viewpoint at 4851 ft where clouds form a sea below. Tipu Sultan\'s summer retreat with fortified walls.', 'The most magical sunrise near Bangalore', 'Sunrise above the clouds', 4.7, ['must-visit', 'instagram-worthy'], 60, 0, 90, 'morning'),
        s('h3', 'Bhoga Nandeeshwara Temple', 'heritage', 'A 1000-year-old Shiva temple featuring Chola, Hoysala, and Vijayanagara architecture styles in one complex.', 'A millennium of temple architecture in one place', 'Multi-dynasty ancient temple', 4.5, ['must-visit'], 55, 2, 45, 'morning'),
    ],

    // 13. Delhi → Agra (already existed, keeping enhanced version)
    'delhi-agra': [
        s('h1', 'ISKCON Temple Vrindavan', 'heritage', 'Magnificent Krishna temple complex in the holy city of Vrindavan. One of the most beautiful modern temples in India.', 'A spiritual masterpiece in Krishna\'s birthplace', 'Krishna worship & architecture', 4.6, ['must-visit', 'family-friendly'], 130, 10, 60, 'morning'),
        s('h2', 'Mathura Birthplace Temple', 'heritage', 'The sacred birthplace of Lord Krishna, one of Hinduism\'s holiest sites. Ancient history and devotional energy.', 'Stand where Lord Krishna was born', 'Krishna Janmabhoomi', 4.8, ['must-visit'], 145, 5, 60, 'morning'),
        s('h3', 'Taj Mahal', 'heritage', 'The crown jewel of India — UNESCO World Heritage Site and one of the Seven Wonders. Shah Jahan\'s monument to eternal love.', 'The most iconic monument on Earth', 'Symbol of eternal love', 5.0, ['must-visit', 'instagram-worthy'], 200, 0, 120, 'morning'),
        s('h4', 'Agra Fort', 'heritage', 'Massive red sandstone Mughal fortress. Shah Jahan spent his last days here, gazing at the Taj Mahal across the river.', 'Where Shah Jahan was imprisoned with a view of the Taj', 'Mughal imperial fortress', 4.7, ['must-visit', 'instagram-worthy'], 202, 0, 90, 'morning'),
        s('h5', 'Fatehpur Sikri', 'heritage', 'Akbar\'s abandoned capital — a UNESCO Site. The Buland Darwaza is the world\'s tallest gateway.', 'A perfectly preserved Mughal ghost city', 'Buland Darwaza & Panch Mahal', 4.6, ['must-visit', 'instagram-worthy'], 235, 2, 90, 'morning'),
    ],

    // 14. Pune → Mumbai (reverse of Mumbai-Pune, same stops reversed)
    'pune-mumbai': [
        s('h1', 'Lohagad Fort', 'heritage', 'A majestic hill fort rising 3400 ft with four grand gates and dramatic Vinchukata formation.', 'Trek to a fort with 2000 years of history', 'Historic hill fort', 4.5, ['instagram-worthy', 'must-visit'], 20, 8, 90, 'morning'),
        s('h2', 'Karla Caves', 'heritage', 'Ancient Buddhist caves from the 2nd century BC. The grand Chaitya hall is one of the finest in India.', 'Walk through 2,200-year-old Buddhist caves', '2nd century BC Buddhist caves', 4.4, ['must-visit'], 55, 3, 45, 'morning'),
        s('h3', 'Lonavala', 'nature', 'The beloved hill station famous for chikki and misty valleys. Tiger\'s Leap and Bhushi Dam are iconic.', 'Maharashtra\'s favorite hill station', 'Tiger\'s Leap & chikki', 4.5, ['must-visit', 'family-friendly'], 65, 0, 60, 'anytime'),
        s('h4', 'Khandala', 'viewpoint', 'Picturesque Western Ghats viewpoint. Duke\'s Nose offers panoramic views of the valley below.', 'Stunning Western Ghats panorama', 'Duke\'s Nose viewpoint', 4.3, ['instagram-worthy'], 70, 2, 45, 'morning'),
    ],

    // 15. Pune → Mahabaleshwar
    'pune-mahabaleshwar': [
        s('h1', 'Wai', 'heritage', 'An ancient town with stunning ghats on the Krishna River. The Menavali Ghat used in many Bollywood films is picturesque.', 'Walk the ghats made famous by Bollywood', 'Krishna River ghats & Bollywood', 4.2, ['hidden-gem'], 80, 3, 30, 'anytime'),
        s('h2', 'Pratapgad Fort', 'heritage', 'The mountain fortress where Shivaji defeated Afzal Khan. Panoramic views of the Sahyadri ranges are breathtaking.', 'Walk the battleground of Maratha history', 'Shivaji\'s legendary victory', 4.6, ['must-visit', 'instagram-worthy'], 110, 8, 90, 'morning'),
        s('h3', 'Mapro Garden', 'tourist', 'Famous strawberry garden and food park. Taste fresh strawberries, jams, and the iconic Mapro pizza in beautiful surroundings.', 'Taste the freshest strawberries in India', 'Strawberry garden & Mapro products', 4.3, ['family-friendly'], 118, 2, 45, 'anytime'),
        s('h4', 'Arthur\'s Seat', 'viewpoint', 'Called the "Queen of all viewpoints" — a cliff edge overlooking the Savitri River valley 600m below. The views are vertigo-inducing.', 'India\'s most dramatic cliff viewpoint', 'Valley viewpoint & Savitri gorge', 4.7, ['must-visit', 'instagram-worthy'], 120, 0, 45, 'morning'),
        s('h5', 'Elephant\'s Head Point', 'viewpoint', 'A viewpoint named for its elephant-trunk shaped cliff. Offers sweeping views of the Sahyadri Hills and the valley.', 'Watch clouds roll over Sahyadri peaks', 'Rock formation & valley views', 4.4, ['instagram-worthy'], 122, 1, 30, 'morning'),
    ],

    // 16. Indore → Ujjain
    'indore-ujjain': [
        s('h1', 'Mahakaleshwar Temple', 'heritage', 'One of the 12 Jyotirlingas — the only south-facing Jyotirlinga in India. The Bhasma Aarti at dawn is a profound spiritual experience.', 'Witness the most powerful Jyotirlinga in India', 'Jyotirlinga & Bhasma Aarti', 4.9, ['must-visit'], 55, 0, 90, 'morning'),
        s('h2', 'Ram Ghat', 'heritage', 'The sacred bathing ghat on the Shipra River where the Kumbh Mela is held. The evening aarti with floating diyas is mesmerizing.', 'The holiest ghat of the Kumbh city', 'Kumbh Mela ghat & Shipra aarti', 4.5, ['must-visit', 'instagram-worthy'], 56, 0, 45, 'evening'),
        s('h3', 'Kal Bhairav Temple', 'heritage', 'Unique temple where liquor is offered as prasad to Lord Kal Bhairav. The idol miraculously appears to drink the offering.', 'The only temple in India that offers liquor to God', 'Liquor offering & ancient ritual', 4.3, ['hidden-gem'], 57, 1, 30, 'anytime'),
    ],

    // 17. Bangalore → Srirangapatna
    'bangalore-srirangapatna': [
        s('h1', 'Ramanagara', 'nature', 'Dramatic rocky outcrops famous as the Sholay filming location. Great for rock climbing enthusiasts.', 'The iconic Sholay filming location', 'Rock climbing & Sholay hills', 4.2, ['instagram-worthy'], 50, 2, 30, 'morning'),
        s('h2', 'Channapatna Toy Town', 'cultural', 'UNESCO-recognized traditional toy-making village. Buy authentic handcrafted lacquerware toys.', 'Buy toys from a centuries-old craft tradition', 'Traditional wooden toys', 4.0, ['hidden-gem', 'family-friendly'], 65, 1, 40, 'anytime'),
        s('h3', 'Srirangapatna Fort', 'heritage', 'Tipu Sultan\'s island fortress and final stand. The Daria Daulat Bagh summer palace and Gumbaz mausoleum are remarkable.', 'Walk through Tipu Sultan\'s legendary fortress', 'Tipu Sultan\'s fort & palace', 4.7, ['must-visit'], 125, 0, 90, 'morning'),
        s('h4', 'Ranganathaswamy Temple', 'heritage', 'One of the 5 holiest Vaishnavite temples built on an island in the Cauvery. The Dravidian architecture is stunning.', 'An ancient island temple of immense holiness', 'Vaishnavite island temple', 4.6, ['must-visit'], 126, 0, 60, 'morning'),
    ],

    // 18. Delhi → Mathura
    'delhi-mathura': [
        s('h1', 'Chand Baori', 'heritage', 'One of the deepest stepwells in India with 3,500 narrow steps in 13 stories. A geometric marvel that defies imagination.', 'See one of the world\'s most stunning stepwells', 'Ancient stepwell architecture', 4.5, ['instagram-worthy', 'must-visit'], 50, 15, 45, 'morning'),
        s('h2', 'ISKCON Temple Vrindavan', 'heritage', 'Magnificent Krishna temple complex in Vrindavan. The architecture and devotional atmosphere are extraordinary.', 'A spiritual masterpiece near Krishna\'s birthplace', 'Krishna temple & architecture', 4.6, ['must-visit', 'family-friendly'], 140, 8, 60, 'morning'),
        s('h3', 'Krishna Janmabhoomi Temple', 'heritage', 'The sacred birthplace of Lord Krishna — one of Hinduism\'s holiest sites. Centuries of devotional history in one place.', 'Stand where Lord Krishna was born', 'Krishna\'s birthplace', 4.8, ['must-visit'], 150, 0, 60, 'morning'),
        s('h4', 'Dwarkadhish Temple Mathura', 'heritage', 'A beautiful 19th-century temple with intricate carvings, built on a high platform with city views. The Holi celebrations here are legendary.', 'Mathura\'s grandest temple with Holi traditions', 'Carved temple & Holi festival', 4.5, ['must-visit'], 152, 0, 45, 'morning'),
    ],

    // 19. Coimbatore → Ooty
    'coimbatore-ooty': [
        s('h1', 'Marudamalai Temple', 'heritage', 'Ancient hilltop temple dedicated to Lord Murugan on the way to the Nilgiris. The 12th-century temple offers panoramic city views.', 'A sacred Murugan temple with stunning vistas', 'Murugan temple & hilltop views', 4.3, ['must-visit'], 15, 2, 30, 'morning'),
        s('h2', 'Nilgiri Mountain Railway', 'heritage', 'UNESCO World Heritage mountain railway — one of the steepest rack railways in the world. The blue train climb through tea gardens is iconic.', 'Ride a UNESCO heritage train through the clouds', 'Heritage mountain railway', 4.8, ['must-visit', 'instagram-worthy'], 35, 0, 120, 'morning'),
        s('h3', 'Sim\'s Park Coonoor', 'nature', 'A stunning botanical park in Coonoor with rare plant species and stunning valley views. The Japanese garden section is beautiful.', 'A botanical gem in the Nilgiris', 'Botanical park & valley views', 4.3, ['family-friendly'], 55, 5, 45, 'morning'),
        s('h4', 'Dolphin\'s Nose Coonoor', 'viewpoint', 'A dramatic rock formation resembling a dolphin\'s nose, jutting out over a 1000ft drop. The Catherine Falls can be seen from here.', 'Peer over a 1000-foot drop into the Nilgiris', 'Rock viewpoint & Catherine Falls', 4.5, ['instagram-worthy'], 60, 3, 30, 'morning'),
        s('h5', 'Ooty Botanical Gardens', 'nature', 'Established in 1848 with rare plants and a fossilized tree trunk over 20 million years old. A 22-hectare horticultural treasure.', 'A 175-year-old botanical wonder', 'Rare plants & fossil tree', 4.4, ['family-friendly'], 85, 0, 60, 'morning'),
    ],
};

/**
 * Get hot route data if available for the given source-destination pair.
 * Uses fuzzy matching to handle variations (e.g. "New Delhi" → "delhi").
 */
export function getHotRouteData(source: string, destination: string): AIRecommendation[] | null {
    const normalize = (s: string) => s.toLowerCase()
        .replace(/,\s*(karnataka|telangana|maharashtra|tamil nadu|madhya pradesh|delhi|rajasthan|uttar pradesh)$/i, '')
        .replace(/\s+/g, '')
        .replace(/[^a-z]/g, '');

    const src = normalize(source);
    const dest = normalize(destination);

    // Direct match
    const key = `${src}-${dest}`;
    const reverseKey = `${dest}-${src}`;
    if (hotRoutes[key]) return hotRoutes[key];
    if (hotRoutes[reverseKey]) return hotRoutes[reverseKey];

    // Partial/fuzzy match
    for (const routeKey of Object.keys(hotRoutes)) {
        const [k1, k2] = routeKey.split('-');
        if ((src.includes(k1) || k1.includes(src)) && (dest.includes(k2) || k2.includes(dest))) {
            return hotRoutes[routeKey];
        }
        if ((src.includes(k2) || k2.includes(src)) && (dest.includes(k1) || k1.includes(dest))) {
            return hotRoutes[routeKey];
        }
    }

    return null; // Not a hot route — AI will handle this
}
