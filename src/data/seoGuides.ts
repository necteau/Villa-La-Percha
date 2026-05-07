export interface SeoGuide {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const villaSeoGuides: SeoGuide[] = [
  {
    slug: "turks-and-caicos-private-villa-rental",
    title: "Turks and Caicos Private Villa Rental | Villa La Percha",
    description:
      "A practical guide to booking a private Turks and Caicos villa directly, with Villa La Percha in Chalk Sound as a private pool, dock, and beach-access option.",
    eyebrow: "Turks and Caicos Villa Rentals",
    h1: "A private Turks and Caicos villa for travelers who want space, water, and a direct booking path.",
    intro:
      "Villa La Percha is designed for guests who want the privacy of a full villa instead of separate resort rooms: four en-suite bedrooms, a private pool and hot tub, dock swimming, kayaks, paddleboards, and a location near Taylor Bay, Sapodilla Bay, and Chalk Sound.",
    sections: [
      {
        heading: "Why book a private villa in Turks and Caicos?",
        body:
          "A private villa gives families and groups one shared home base: kitchen, pool, outdoor dining, dock access, and room to spread out. That matters in Providenciales, where beach days, boat trips, dinners, and quiet mornings are often better when everyone can gather in one place.",
      },
      {
        heading: "Why Villa La Percha?",
        body:
          "Villa La Percha sits near Chalk Sound with easy access to Taylor Bay and Sapodilla Bay. Guests get a private pool, hot tub, ocean-facing outdoor spaces, dock swimming, kayaks, paddleboards, and four en-suite bedrooms for up to 8 people present at the property at any time.",
      },
      {
        heading: "Why book direct?",
        body:
          "Booking direct lets guests communicate with the property team instead of a marketplace queue, see the home through its own dedicated site, and avoid some of the platform-fee friction that can make luxury rentals feel needlessly expensive.",
      },
    ],
    faqs: [
      {
        question: "Is Villa La Percha a good Turks and Caicos villa for families?",
        answer:
          "Yes. The villa layout works well for families and groups because it has four en-suite bedrooms, shared indoor-outdoor living areas, a private pool, dock access, and nearby calm-water beaches including Taylor Bay.",
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
      "Stay near Chalk Sound in Providenciales at Villa La Percha, a private villa close to Taylor Bay, Sapodilla Bay, turquoise water, and west-side island adventures.",
    eyebrow: "Chalk Sound, Providenciales",
    h1: "A Chalk Sound villa close to Taylor Bay, Sapodilla Bay, and the quieter side of Provo.",
    intro:
      "Chalk Sound is one of Providenciales' most distinctive areas: bright turquoise water, limestone cays, calmer west-side beaches, and a quieter pace than the Grace Bay corridor. Villa La Percha puts guests close to that landscape while still keeping the rest of the island within reach.",
    sections: [
      {
        heading: "What makes Chalk Sound different?",
        body:
          "Chalk Sound is known for luminous shallow water, small rocky cays, and a more residential, scenic feel. It is a strong fit for guests who want beauty, privacy, and easy access to Taylor Bay and Sapodilla Bay without staying in the busiest resort zone.",
      },
      {
        heading: "Beach access from Villa La Percha",
        body:
          "Taylor Bay is a very short drive or walk from the villa area and is known for shallow, calm water. Sapodilla Bay is also close by and has a livelier local beach scene. Guests can also swim from the villa dock when conditions are appropriate.",
      },
      {
        heading: "Good for relaxed itineraries",
        body:
          "Staying in Chalk Sound makes it easy to mix slow villa days with island exploration: morning paddles, pool afternoons, sunset beach visits, casual seafood, and occasional Grace Bay dinners when the group wants more energy.",
      },
    ],
    faqs: [
      {
        question: "Is Chalk Sound a good area to stay in Providenciales?",
        answer:
          "Yes, especially for travelers who want scenic water, privacy, and proximity to Taylor Bay and Sapodilla Bay rather than the busier Grace Bay resort strip.",
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
      "Villa La Percha is a Providenciales private villa with pool, hot tub, outdoor dining, dock swimming, kayaks, paddleboards, and four en-suite bedrooms.",
    eyebrow: "Private Pool Villa",
    h1: "A Providenciales villa with private pool, hot tub, dock access, and space for the whole group.",
    intro:
      "For many Turks and Caicos trips, the pool becomes the center of the stay: coffee in the morning, swims between beach outings, sunset drinks, and late-night conversation after dinner. Villa La Percha pairs a private pool and hot tub with waterfront outdoor spaces and direct-booking convenience.",
    sections: [
      {
        heading: "Private pool plus outdoor living",
        body:
          "Villa La Percha has a private pool, connected hot tub, outdoor kitchen, dining areas, lounge spaces, and a screened indoor-outdoor living area. It is set up for groups that want to spend real time at the villa, not just sleep there.",
      },
      {
        heading: "More than a pool house",
        body:
          "Guests also have dock access for swimming and fishing, kayaks and paddleboards for water time, four en-suite bedrooms, and easy access to nearby beaches. The pool is part of a broader private-villa experience.",
      },
      {
        heading: "A strong resort alternative",
        body:
          "A private pool villa can work especially well for families or couples traveling together because everyone has shared gathering space, private bedrooms, and a home base that does not depend on resort schedules or crowded pool decks.",
      },
    ],
    faqs: [
      {
        question: "Does Villa La Percha have a private pool?",
        answer:
          "Yes. Villa La Percha has a private pool and hot tub, along with outdoor lounge and dining spaces.",
      },
      {
        question: "Can guests swim from the dock?",
        answer:
          "The villa has dock access with stairs into the water. Guests should always use normal care and supervision around docks, pools, and open water.",
      },
    ],
  },
  {
    slug: "book-turks-and-caicos-villa-direct",
    title: "Book a Turks and Caicos Villa Direct | Villa La Percha",
    description:
      "Learn why booking a Turks and Caicos villa direct can mean clearer communication, fewer platform layers, and a more personal stay at Villa La Percha.",
    eyebrow: "Book Direct",
    h1: "Book your Turks and Caicos villa direct instead of through another marketplace layer.",
    intro:
      "Direct booking is simple: guests inquire through the official Villa La Percha site, communicate with the property team, and confirm details without relying on a marketplace queue. It is built for clarity, not mystery fees and inbox limbo.",
    sections: [
      {
        heading: "Clearer communication",
        body:
          "Direct inquiries let the property team answer practical questions about dates, beaches, amenities, arrival details, and the fit for your group. For high-value villa stays, that direct relationship matters.",
      },
      {
        heading: "A property-specific experience",
        body:
          "A dedicated property site can explain the home, neighborhood, island guide, FAQs, and booking terms in more detail than a generic marketplace listing. Guests get more context before they commit.",
      },
      {
        heading: "Fewer platform layers",
        body:
          "Booking direct may reduce marketplace fee friction and keeps the reservation relationship closer to the property team. Exact pricing, taxes, and terms should always be confirmed through the official booking flow.",
      },
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
