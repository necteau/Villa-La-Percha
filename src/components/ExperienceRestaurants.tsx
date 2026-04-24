const restaurants = [
  {
    name: "Da Conch Shack",
    category: "Caribbean · Iconic",
    neighborhood: "Blue Hills",
    description: "The most legendary local restaurant on the island. Watch chefs crack conch fresh at outdoor tables under canvas umbrellas. The conch salad is unmatched. Come Wednesday nights for live Junkanoo music and a DJ — this is island culture at its finest.",
    mustTry: "Conch Salad",
    link: "https://daconchshack.com/",
    icon: "🦞",
  },
  {
    name: "Hemingway's on the Beach",
    category: "Island-Inspired · Beachfront",
    neighborhood: "Grace Bay",
    description: "A beloved Grace Bay institution at The Sands resort. Beachfront breakfasts, surf-and-turf lunches, and sunset dinners on a sprawling outdoor patio. Casual elegance meets family-friendly vibes. The Sunday brunch is legendary.",
    mustTry: "Eggs on the Beach",
    link: "https://www.hemingwaystci.com/",
    icon: "🍹",
  },
  {
    name: "Omar's Beach Hut",
    category: "Caribbean · Beachfront",
    neighborhood: "Five Cays",
    description: "Steps from turquoise water at Five Cays Beach. Locally caught seafood, jerk chicken, and kicking rum punches served in a relaxed beach hut setting. The fisherman's dock next door means dinner was swimming this morning.",
    mustTry: "Lobster Pasta",
    link: "https://www.omars-beachhut.com/",
    icon: "🍽️",
  },
  {
    name: "Coco Bistro",
    category: "Seafood · Fine Dining",
    neighborhood: "Grace Bay",
    description: "One of Providenciales' most beloved restaurants. Set under a palm grove with twinkling lights, Coco Bistro sources its own herbs from an on-site garden. The fresh seafood is a local staple, beautifully plated in a romantic, waterless setting.",
    mustTry: "Fresh Catch of the Day",
    link: "https://www.cocobistro.tc/",
    icon: "🌴",
    reservations: true,
  },
  {
    name: "Provence by Eric",
    category: "French/Italian · Chef's Table",
    neighborhood: "Grace Bay",
    description: "A unique experience where you watch Chef Eric Vernice craft a five-course blind tasting inspired by Provence and his heritage. Fresh local ingredients meet French technique. Intimate, interactive, and unforgettable.",
    mustTry: "Five-Course Blind Tasting",
    link: "https://www.provencebyeric.com/",
    icon: "🇫🇷",
    reservations: true,
  },
  {
    name: "Infiniti Restaurant & Raw Bar",
    category: "Gourmet · Sunset",
    neighborhood: "Grace Bay Club",
    description: "Oceanfront dining at its most spectacular. Creative gourmet seafood, premium meats, and an expansive raw bar — all while watching the sun dissolve into the Caribbean. Dress code enforced. Perfect for a milestone evening.",
    mustTry: "Sunset Raw Bar Flight",
    link: "https://gracebayclub.gracebayresorts.com/restaurant/infiniti-restaurant-raw-bar/",
    icon: "🌅",
    reservations: true,
  },
  {
    name: "Magnolia",
    category: "Caribbean · Hilltop Dining",
    neighborhood: "Grace Bay",
    description: "A hidden gem perched on a hilltop overlooking Turtle Cove Marina and the North Shore. The sunset views are extraordinary. Excellent local seafood, well-prepared dishes, and a great specialty wine list.",
    mustTry: "Sunset Dinner",
    link: "https://www.magnoliaprovo.com/",
    icon: "🍷",
    reservations: true,
  },
  {
    name: "CocoVan Airstream Lounge",
    category: "Casual · Food Truck",
    neighborhood: "Grace Bay",
    description: "Gourmet tacos, tapas, and sandwiches served from an authentic 1974 Airstream kitchen in a palm-tree oasis. Weekly specials emphasize seafood and island seasonal shellfish. Great for a relaxed, no-fuss lunch with the family.",
    mustTry: "Truffle Fried Mac and Cheese Balls",
    link: "https://www.cocovan.tc/",
    icon: "🌮",
  },
  {
    name: "Bay Bistro",
    category: "Breakfast/Brunch · Ocean View",
    neighborhood: "Grace Bay",
    description: "The go-to weekend brunch spot on Providenciales. Seafood dishes and American breakfast classics — blueberry pancakes, Eggs Benedict — paired with spicy caesar or bubbly mimosas. The views of Grace Bay make it worth the trip.",
    mustTry: "Lobster Eggs Benedict",
    link: "https://turksandcaicoscatering.com/",
    icon: "🥞",
  },
  {
    name: "BLT Steak at The Ritz-Carlton",
    category: "Steakhouse · Ultra-Premium",
    neighborhood: "Grace Bay",
    description: "For the ultimate splurge. 100% naturally raised Black Angus steaks, prime cuts, and an intimate indoor/outdoor setting at one of the most luxurious hotels on the island. The seafood tower alone justifies the visit.",
    mustTry: "Dry-Aged Steak",
    link: "https://www.ritzcarlton.com/en/hotels/caribbean/turks-and-caicos/dining",
    icon: "🥩",
    reservations: true,
  },
];

export default function Restaurants() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            Where to Eat
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Restaurants
          </h2>
          <p className="text-sm md:text-base max-w-lg mx-auto text-[#6B6B6B] leading-relaxed">
            From legendary conch shacks to Michelin-caliber dining, Providenciales delivers
            world-class food at every level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((r) => (
            <a
              key={r.name}
              href={r.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-[#E8E4DF] rounded-xl overflow-hidden hover:shadow-lg hover:border-[#8B7355]/30 transition-all duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-[#F5F0E8] to-[#EDE8DF] flex items-center justify-center text-5xl">
                {r.icon}
              </div>
              <div className="p-6">
                <span className="text-[10px] tracking-wider uppercase font-medium" style={{ color: "#8B7355" }}>
                  {r.category}
                </span>
                <h3 className="font-display text-xl font-light mt-1 mb-1" style={{ color: "#2C2C2C" }}>
                  {r.name}
                </h3>
                <p className="text-[10px] tracking-wider uppercase text-[#6B6B6B] mb-3">
                  {r.neighborhood}
                </p>
                <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">{r.description}</p>
                <p className="text-sm italic" style={{ color: "#8B7355" }}>
                  Must try: {r.mustTry}
                </p>
                {r.reservations && (
                  <p className="text-[10px] mt-2 px-2 py-0.5 inline-block rounded bg-[#F5F0E8] font-medium" style={{ color: "#8B7355" }}>
                    Reservations recommended
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
