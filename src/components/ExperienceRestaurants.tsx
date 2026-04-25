const restaurants = [
  {
    name: "Da Conch Shack",
    category: "Caribbean · Iconic",
    neighborhood: "Blue Hills",
    description: "A classic first stop for visitors who want a laid-back waterfront meal and a proper Turks and Caicos conch fix. Come for lunch or sunset, order conch done a few ways, and expect a lively scene rather than a quiet dinner.",
    mustTry: "Conch Salad",
    link: "https://daconchshack.com/",
    icon: "🦞",
    bestFor: "casual lunch · sunset · first-day island vibes",
  },
  {
    name: "Hemingway's on the Beach",
    category: "Island-Inspired · Beachfront",
    neighborhood: "Grace Bay",
    description: "Easy, beachfront Grace Bay dining that works well for breakfast, lunch, or a relaxed dinner after beach time. Good choice when you want something scenic and reliable without turning the meal into a production.",
    mustTry: "Eggs on the Beach",
    link: "https://www.hemingwaystci.com/",
    icon: "🍹",
    bestFor: "breakfast · easy family meal · beachfront table",
  },
  {
    name: "Omar's Beach Hut",
    category: "Caribbean · Beachfront",
    neighborhood: "Five Cays",
    description: "A fun, no-frills local spot near the water with seafood, strong drinks, and a more off-the-tourist-strip feel. Great when you want something casual and distinctly island rather than polished resort dining.",
    mustTry: "Lobster Pasta",
    link: "https://www.omars-beachhut.com/",
    icon: "🍽️",
    bestFor: "local feel · seafood lunch · casual dinner",
  },
  {
    name: "Coco Bistro",
    category: "Seafood · Fine Dining",
    neighborhood: "Grace Bay",
    description: "One of the island's best-known dinner reservations, with a polished setting under the palms and a menu that feels special without being stuffy. Good pick for a date night or one of the bigger dinners of the week.",
    mustTry: "Fresh Catch of the Day",
    link: "https://www.cocobistro.tc/",
    icon: "🌴",
    reservations: true,
    bestFor: "date night · polished dinner · special evening",
  },
  {
    name: "Provence by Eric",
    category: "French/Italian · Chef's Table",
    neighborhood: "Grace Bay",
    description: "A more intimate, chef-driven dinner for people who enjoy tasting menus and want something memorable beyond the usual island seafood circuit. Best saved for a slower night when dinner is the event.",
    mustTry: "Five-Course Blind Tasting",
    link: "https://www.provencebyeric.com/",
    icon: "🇫🇷",
    reservations: true,
    bestFor: "foodies · quieter evening · special occasion",
  },
  {
    name: "Infiniti Restaurant & Raw Bar",
    category: "Gourmet · Sunset",
    neighborhood: "Grace Bay Club",
    description: "A splurge dinner with a big setting, ocean views, and a more dressed-up feel than most island spots. Ideal when you want one high-end Grace Bay night on the itinerary.",
    mustTry: "Sunset Raw Bar Flight",
    link: "https://gracebayclub.gracebayresorts.com/restaurant/infiniti-restaurant-raw-bar/",
    icon: "🌅",
    reservations: true,
    bestFor: "sunset dinner · upscale night out · celebrations",
  },
  {
    name: "Magnolia",
    category: "Caribbean · Hilltop Dining",
    neighborhood: "Grace Bay",
    description: "Known for its elevated views and a dinner setting that feels a little quieter and more tucked away. A strong option for sunset if you want something less buzzy than the main Grace Bay strip.",
    mustTry: "Sunset Dinner",
    link: "https://www.magnoliaprovo.com/",
    icon: "🍷",
    reservations: true,
    bestFor: "sunset views · quieter dinner · couples",
  },
  {
    name: "CocoVan Airstream Lounge",
    category: "Casual · Food Truck",
    neighborhood: "Grace Bay",
    description: "An easy, casual stop when you want something fun and low-commitment. Good for lunch, an unfussy dinner, or a break from heavier sit-down meals.",
    mustTry: "Truffle Fried Mac and Cheese Balls",
    link: "https://www.cocovan.tc/",
    icon: "🌮",
    bestFor: "quick bite · families · casual night",
  },
  {
    name: "Bay Bistro",
    category: "Breakfast/Brunch · Ocean View",
    neighborhood: "Grace Bay",
    description: "A scenic choice for brunch or an easy oceanfront meal in Grace Bay. Worth considering when you want a beach view and a daytime meal that feels a little more vacation-ish.",
    mustTry: "Lobster Eggs Benedict",
    link: "https://turksandcaicoscatering.com/",
    icon: "🥞",
    bestFor: "brunch · daytime Grace Bay stop · ocean view",
  },
  {
    name: "BLT Steak at The Ritz-Carlton",
    category: "Steakhouse · Ultra-Premium",
    neighborhood: "Grace Bay",
    description: "Your high-end steakhouse option if someone in the group wants a break from seafood or a more traditional luxury dinner. Expensive, polished, and best reserved for a big night out.",
    mustTry: "Dry-Aged Steak",
    link: "https://www.ritzcarlton.com/en/hotels/caribbean/turks-and-caicos/dining",
    icon: "🥩",
    reservations: true,
    bestFor: "steak dinner · splurge night · celebratory meal",
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
            Here are the spots most worth building into a villa week — from casual seafood lunches to
            one or two dinners that feel worth dressing for.
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
                <p className="text-[11px] mt-2 uppercase tracking-wider text-[#6B6B6B]">
                  Best for: {r.bestFor}
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
