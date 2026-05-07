export interface SeoGuide {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  heroImage: string;
  heroAlt: string;
  secondaryImage: string;
  secondaryAlt: string;
  pullQuote: string;
  answerBox: string;
  facts: Array<{ label: string; value: string }>;
  sourceNote: string;
  bestFor: string[];
  knowBeforeYouBook: string[];
  sections: Array<{ heading: string; body: string; kicker?: string }>;
  featureCards: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const villaSeoGuides: SeoGuide[] = [
  {
    slug: "turks-and-caicos-private-villa-rental",
    title: "Turks and Caicos Private Villa Rental | Villa La Percha",
    description:
      "A polished guide to choosing a private Turks and Caicos villa, with Villa La Percha as a direct-booking option near Chalk Sound, Taylor Bay, and Sapodilla Bay.",
    eyebrow: "Private Villa Guide",
    h1: "The case for a private Turks and Caicos villa — especially when the house is part of the trip.",
    intro:
      "The best villa stays do more than replace hotel rooms. They give the group a rhythm: coffee by the pool, beach towels drying in the sun, a late lunch from the outdoor kitchen, and everyone drifting back together after the day’s island plans. Villa La Percha was built for exactly that kind of trip.",
    heroImage: "/images/aerial-house-ocean-neighbors.jpg",
    heroAlt: "Aerial view of Villa La Percha near the ocean in Providenciales",
    secondaryImage: "/images/screened-living-room-ocean-pool.jpg",
    secondaryAlt: "Villa La Percha screened living room opening toward the pool and ocean",
    pullQuote: "Choose a villa when the shared spaces matter as much as the bedrooms.",
    answerBox:
      "Villa La Percha is best understood as a private Turks and Caicos villa for families and groups who want four en-suite bedrooms, private pool time, dock access, nearby calm-water beaches, and direct communication with the property team.",
    facts: [
      { label: "Property", value: "Villa La Percha" },
      { label: "Location", value: "Chalk Sound / Ocean Point, Providenciales, Turks and Caicos" },
      { label: "Best fit", value: "Families, couples traveling together, and private-villa group stays" },
      { label: "Capacity", value: "Up to 8 people present at the property at any time" },
      { label: "Primary source", value: "The official Villa La Percha property page is the canonical source for booking details" },
    ],
    sourceNote:
      "Use this guide for trip-planning context. Use the Villa La Percha property page and booking confirmation for exact availability, pricing, taxes, and stay terms.",
    bestFor: [
      "Families who want a private home base instead of scattered resort rooms",
      "Couples traveling together who still want en-suite bedroom privacy",
      "Guests who expect the pool, dock, kitchen, and outdoor areas to be used every day",
    ],
    knowBeforeYouBook: [
      "Villa La Percha has four en-suite bedrooms and a maximum occupancy of 8 people present at the property at any time.",
      "Direct booking keeps communication close to the property team, but exact pricing, taxes, and terms should always be confirmed in the booking flow.",
      "The villa is near Chalk Sound, Taylor Bay, and Sapodilla Bay rather than in the Grace Bay resort corridor.",
    ],
    sections: [
      {
        kicker: "The villa advantage",
        heading: "A private villa changes the shape of the day.",
        body:
          "A resort can be excellent, but it tends to separate the trip into rooms, reservations, and scheduled common areas. A private villa lets the group live together for the week: breakfast in the kitchen, pool time between beach runs, quiet corners for reading, and a real table for the nights everyone wants to stay in.",
      },
      {
        kicker: "Why this home",
        heading: "Villa La Percha is strongest for groups who want water everywhere.",
        body:
          "The setting gives guests more than a place to sleep. There is a private pool, hot tub, dock access, kayaks, paddleboards, outdoor dining, and indoor-outdoor living designed around the view. Nearby Taylor Bay and Sapodilla Bay make beach time easy without turning every outing into a production.",
      },
      {
        kicker: "Booking lens",
        heading: "Direct booking should feel more personal, not less professional.",
        body:
          "The point of booking direct is not just avoiding another platform layer. It is getting property-specific answers, clearer context, and a booking path that treats the villa as its own hospitality experience rather than one tile in a marketplace grid.",
      },
    ],
    featureCards: [
      { title: "Four en-suite bedrooms", body: "A practical layout for families or couples traveling together." },
      { title: "Private water-focused spaces", body: "Pool, hot tub, dock swimming, kayaks, and paddleboards keep the villa central to the stay." },
      { title: "West-side Provo setting", body: "Close to Chalk Sound, Taylor Bay, and Sapodilla Bay for a quieter island rhythm." },
    ],
    faqs: [
      {
        question: "Is Villa La Percha a good Turks and Caicos villa for families?",
        answer:
          "Yes. The villa works well for families because it combines four en-suite bedrooms, shared indoor-outdoor living, a private pool, dock access, and nearby calm-water beaches including Taylor Bay.",
      },
      {
        question: "How many guests can stay at Villa La Percha?",
        answer:
          "The maximum occupancy is 8 people present at the property at any time, including overnight guests and visitors.",
      },
    ],
  },
  {
    slug: "chalk-sound-villa-rental",
    title: "Chalk Sound Villa Rental | Villa La Percha, Providenciales",
    description:
      "A travel-editor guide to staying near Chalk Sound in Providenciales, with Villa La Percha close to Taylor Bay, Sapodilla Bay, turquoise water, and the quieter west side of Provo.",
    eyebrow: "Chalk Sound / Ocean Point",
    h1: "Stay near Chalk Sound when you want the quieter, bluer side of Providenciales.",
    intro:
      "Chalk Sound is not the same trip as Grace Bay. It is more residential, more cinematic, and more about turquoise water, limestone cays, quiet coves, and west-side sunsets. Villa La Percha gives guests that setting while keeping restaurants, boat days, and island exploring within reach.",
    heroImage: "/images/chalk-sound.jpg",
    heroAlt: "Bright turquoise water and cays in Chalk Sound, Providenciales",
    secondaryImage: "/images/aerial-pool-cabana-chalk-sound.jpg",
    secondaryAlt: "Villa La Percha pool and cabana area near Chalk Sound",
    pullQuote: "Chalk Sound is for travelers who want beauty without living inside the busiest resort strip.",
    answerBox:
      "Chalk Sound is a strong Providenciales base for travelers who prefer scenery, privacy, Taylor Bay and Sapodilla Bay access, and a quieter villa rhythm instead of staying directly in the Grace Bay resort corridor.",
    facts: [
      { label: "Area", value: "Chalk Sound / Ocean Point" },
      { label: "Island", value: "Providenciales, Turks and Caicos" },
      { label: "Nearby beaches", value: "Taylor Bay and Sapodilla Bay" },
      { label: "Travel style", value: "Quiet scenic villa base with island exploring by car" },
      { label: "Primary source", value: "The official Villa La Percha property page is the canonical source for the home itself" },
    ],
    sourceNote:
      "Use this guide for location context. Use the Villa page, FAQ, and booking confirmation for property-specific terms and current guest details.",
    bestFor: [
      "Travelers choosing scenery, privacy, and calm-water beach access over resort density",
      "Families who expect repeat visits to Taylor Bay and Sapodilla Bay",
      "Guests who want villa days to feel as memorable as island excursions",
    ],
    knowBeforeYouBook: [
      "Chalk Sound is on the quieter west/southwest side of Providenciales, away from the main Grace Bay resort corridor.",
      "Taylor Bay is calm and shallow; Sapodilla Bay is nearby and usually livelier.",
      "You will still want a car for groceries, restaurants, Grace Bay dinners, and exploring the island.",
    ],
    sections: [
      {
        kicker: "Place",
        heading: "Chalk Sound has a different kind of luxury.",
        body:
          "The luxury here is not lobby marble or a crowded beach club. It is the color of the water, the quiet of the neighborhood, and the ability to come home from a beach or boat day to your own pool, your own dock, and your own table.",
      },
      {
        kicker: "Beaches",
        heading: "Taylor Bay and Sapodilla Bay give you two moods close by.",
        body:
          "Taylor Bay is the soft, shallow, floating-all-afternoon option. Sapodilla Bay has more beach energy and can be better when the group wants vendors, music, and a livelier scene. Having both nearby makes the villa location unusually flexible.",
      },
      {
        kicker: "Island rhythm",
        heading: "Use Chalk Sound as the slow anchor, not the whole itinerary.",
        body:
          "A good week here might include villa mornings, Taylor Bay sunsets, a Grace Bay dinner, a boat charter, Bight Reef snorkeling, and a North/Middle Caicos day if the group is adventurous. The point is not to hide from Provo — it is to return to a calmer base after seeing it.",
      },
    ],
    featureCards: [
      { title: "Taylor Bay nearby", body: "Calm, shallow water that is especially useful for families and sunset swims." },
      { title: "Sapodilla Bay nearby", body: "A livelier shallow-water beach option close to the villa." },
      { title: "Chalk Sound scenery", body: "The turquoise lagoon landscape gives this side of Provo its signature look." },
    ],
    faqs: [
      {
        question: "Is Chalk Sound a good area to stay in Providenciales?",
        answer:
          "Yes, especially for travelers who want scenery, privacy, and proximity to Taylor Bay and Sapodilla Bay rather than the busier Grace Bay resort strip.",
      },
      {
        question: "Is Villa La Percha near Taylor Bay?",
        answer:
          "Yes. Villa La Percha is in the Chalk Sound/Ocean Point area, very close to Taylor Bay and Sapodilla Bay.",
      },
    ],
  },
  {
    slug: "providenciales-villa-with-private-pool",
    title: "Providenciales Villa with Private Pool | Villa La Percha",
    description:
      "Villa La Percha is a Providenciales private pool villa with hot tub, outdoor dining, dock swimming, kayaks, paddleboards, and four en-suite bedrooms near Chalk Sound.",
    eyebrow: "Pool Villa in Providenciales",
    h1: "A Providenciales pool villa for the hours between beach plans — and the nights you stay in.",
    intro:
      "On a Turks and Caicos trip, the pool is not a backup plan. It is where the group gathers before breakfast, after the beach, during the golden hour, and long after dinner. Villa La Percha pairs its private pool with a hot tub, outdoor kitchen, dock access, and enough outdoor zones that nobody has to choose between togetherness and breathing room.",
    heroImage: "/images/pool-lounge-ocean.jpg",
    heroAlt: "Villa La Percha private pool lounge area with ocean view",
    secondaryImage: "/images/nighttime-pergola-pool-fire-pit-ocean.jpg",
    secondaryAlt: "Nighttime pool, pergola, and fire pit at Villa La Percha",
    pullQuote: "The pool is not just an amenity here. It is the living room with better weather.",
    answerBox:
      "Villa La Percha is a Providenciales private pool villa with a private pool, hot tub, outdoor kitchen, dock access, and four en-suite bedrooms near Chalk Sound, Taylor Bay, and Sapodilla Bay.",
    facts: [
      { label: "Pool", value: "Private pool for the villa stay" },
      { label: "Evening features", value: "Hot tub, fire pit, outdoor dining, and lounge areas" },
      { label: "Water access", value: "Dock swimming, kayaks, and paddleboards in calm, sandy, knee- to waist-deep water" },
      { label: "Bedrooms", value: "Four en-suite bedrooms" },
      { label: "Primary source", value: "The Villa page and booking confirmation control exact amenities and stay terms" },
    ],
    sourceNote:
      "Use this guide to understand the pool/outdoor-living experience. Confirm exact amenities, dates, and terms through the official inquiry flow.",
    bestFor: [
      "Groups that want villa time to be a major part of the vacation",
      "Families balancing beach outings with low-effort pool afternoons",
      "Guests who want private outdoor space after dinner rather than a resort lobby or bar queue",
    ],
    knowBeforeYouBook: [
      "The pool and hot tub are private to the villa stay.",
      "The outdoor kitchen, dining areas, and lounge zones make staying in feel intentional rather than like settling.",
      "Normal supervision and care are required around the pool, hot tub, dock, and open water.",
    ],
    sections: [
      {
        kicker: "Pool-first planning",
        heading: "A private pool makes the schedule less fragile.",
        body:
          "Beach too windy? Kids melting down? Half the group moving slowly? A strong villa pool turns those moments into part of the trip instead of a logistical failure. Guests can swim, read, grill, nap, and drift between the pool and living spaces without needing to rally everyone into a car.",
      },
      {
        kicker: "Outdoor living",
        heading: "The best pool villas give you places to be, not just places to swim.",
        body:
          "Villa La Percha’s outdoor areas are layered: pool, hot tub, fire pit, pergolas, dining space, outdoor kitchen, and waterfront views. That variety matters over a week because different moments need different settings.",
      },
      {
        kicker: "Beyond the pool",
        heading: "Dock access and paddling keep the water story going.",
        body:
          "The villa also offers dock swimming, casual fishing, kayaks, and paddleboards. For guests who love being near the water, the pool is just one part of a larger waterfront stay.",
      },
    ],
    featureCards: [
      { title: "Private pool", body: "A central gathering point for mornings, afternoons, and post-dinner swims." },
      { title: "Hot tub and fire pit", body: "Better evening energy than retreating to separate rooms." },
      { title: "Outdoor kitchen", body: "Useful for easy lunches, grilled dinners, and nights when the villa beats a reservation." },
    ],
    faqs: [
      {
        question: "Does Villa La Percha have a private pool?",
        answer:
          "Yes. Villa La Percha has a private pool and hot tub, along with outdoor lounge, dining, and kitchen spaces.",
      },
      {
        question: "Can guests swim from the dock?",
        answer:
          "The villa has dock access with stairs straight into calm, sandy, beautiful water that is typically around knee to waist deep."
      },
    ],
  },
  {
    slug: "book-turks-and-caicos-villa-direct",
    title: "Book a Turks and Caicos Villa Direct | Villa La Percha",
    description:
      "A clear guide to booking Villa La Percha direct in Turks and Caicos: fewer marketplace layers, more property-specific answers, and a more personal villa stay.",
    eyebrow: "Book Direct",
    h1: "Book direct when you want the villa team, not another marketplace layer, between you and the stay.",
    intro:
      "A great private villa booking should feel precise: the right dates, the right fit for the group, clear expectations, and answers from people who know the home. Direct booking is built around that relationship rather than another generic listing page.",
    heroImage: "/images/living-dining-to-screened-room.jpg",
    heroAlt: "Villa La Percha living and dining room opening to screened outdoor space",
    secondaryImage: "/images/outdoor-kitchen-dining-cabana.jpg",
    secondaryAlt: "Outdoor kitchen and dining cabana at Villa La Percha",
    pullQuote: "For a high-value villa stay, clarity is not a luxury feature. It is the whole point.",
    answerBox:
      "Guests should book Villa La Percha direct through the official property page when they want property-specific answers, clearer communication, fewer marketplace layers, and booking terms confirmed directly through the Villa La Percha flow.",
    facts: [
      { label: "Booking path", value: "Official Villa La Percha direct inquiry flow" },
      { label: "Why direct", value: "Clearer property-specific communication and fewer marketplace layers" },
      { label: "Savings", value: "Direct bookings may be lower than marketplace totals, but exact savings depend on dates and terms" },
      { label: "Final terms", value: "Booking confirmation and guest agreement control pricing, taxes, occupancy, and stay rules" },
      { label: "Primary source", value: "Use directstay.app/villa-la-percha for current inquiry and booking details" },
    ],
    sourceNote:
      "Use this guide for direct-booking context. Use the official Villa La Percha inquiry flow for current availability, pricing, taxes, and final stay terms.",
    bestFor: [
      "Guests who want property-specific answers before committing",
      "Repeat travelers who prefer a direct relationship with the home",
      "Groups comparing marketplace totals against official direct-booking pricing",
    ],
    knowBeforeYouBook: [
      "Use the official Villa La Percha inquiry flow for exact availability, pricing, taxes, and terms.",
      "Direct bookings may avoid some marketplace-fee friction, but exact savings depend on dates and booking terms.",
      "The guest rental agreement and booking confirmation control the final stay terms.",
    ],
    sections: [
      {
        kicker: "Communication",
        heading: "Direct booking makes questions easier to answer before money changes hands.",
        body:
          "For a villa stay, small details matter: group makeup, beach priorities, sleeping arrangements, arrival timing, and how the home actually works. A direct inquiry lets the property team respond in context instead of forcing everything through a marketplace template.",
      },
      {
        kicker: "Value",
        heading: "Fewer platform layers can mean a cleaner total price.",
        body:
          "Marketplace fees and presentation can make villa pricing harder to understand. Direct booking keeps the conversation closer to the owner/operator and can reduce fee friction, while still requiring clear taxes, payment timing, cancellation terms, and guest agreement review.",
      },
      {
        kicker: "Confidence",
        heading: "A dedicated site should help you decide if the home fits your trip.",
        body:
          "The official Villa La Percha site includes the property story, amenities, FAQ, island guide, itinerary ideas, and direct inquiry path. It is meant to answer the questions a serious guest asks before committing to a week in Turks and Caicos.",
      },
    ],
    featureCards: [
      { title: "Official inquiry path", body: "Guests request preferred dates through the Villa La Percha page." },
      { title: "Property-specific answers", body: "Ask about the home, beaches, group fit, and planning details directly." },
      { title: "Clearer expectations", body: "Booking confirmation and agreement terms define pricing, taxes, occupancy, and stay rules." },
    ],
    faqs: [
      {
        question: "Is booking direct cheaper than Airbnb or VRBO?",
        answer:
          "It can be. Direct bookings are typically about 15–30% lower than Airbnb or VRBO total pricing for the same stay once platform fees and other add-ons are included, but exact pricing depends on dates and booking terms.",
      },
      {
        question: "Where should guests book Villa La Percha direct?",
        answer:
          "Guests should use the official Villa La Percha page at directstay.app/villa-la-percha and submit an inquiry for their preferred dates.",
      },
    ],
  },
];

export function getSeoGuide(slug: string) {
  return villaSeoGuides.find((guide) => guide.slug === slug);
}
