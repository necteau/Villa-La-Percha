import Image from "next/image";

const catches = [
  {
    title: "Dock set up and ready",
    description: "Step out with a rod, set up on the dock, and fish right from the house.",
    image: "/images/fishing-rods-dock.jpg",
    alt: "Fishing rods set up on the dock at Villa La Percha",
  },
  {
    title: "Bonefish from the dock",
    description: "Proof that this is more than a nice view — guests have landed real catches here.",
    image: "/images/fishing-bonefish-catch.jpg",
    alt: "Guest holding a bonefish caught from the dock",
  },
  {
    title: "Catch and release moments",
    description: "The kind of spontaneous vacation memory that sticks with people.",
    image: "/images/fishing-bonefish-closeup.jpg",
    alt: "Close-up of a bonefish on the dock",
  },
];

export default function DockFishing() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#8B7355" }}>
            From the Dock
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Surprisingly Good Fishing, Right at the House
          </h2>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-3xl mx-auto">
            One of the most underrated parts of Villa La Percha is how good the dock fishing can be.
            Guests have caught bonefish, yellowtail snapper, and jacks right from the property — no
            charter required, no long boat ride, just a rod, a little patience, and a setting that
            makes the whole thing even better.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-stretch">
          <div className="relative overflow-hidden rounded-3xl border border-[#E8E4DF] bg-[#EEF1F3] min-h-[340px]">
            <Image
              src="/images/fishing-rods-dock.jpg"
              alt="Fishing rods set up on the dock at Villa La Percha"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute left-6 bottom-6 max-w-md text-white">
              <p className="text-[10px] tracking-[0.24em] uppercase text-white/70 mb-3">Actual Guest Fishing Photos</p>
              <p className="text-sm md:text-base leading-relaxed text-white/85">
                Fish from the dock at your own pace — easy, fun, and far more memorable than another scheduled excursion.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-[#E8E4DF] bg-[#FAFAF8] p-7">
              <h3 className="font-display text-2xl font-light mb-4" style={{ color: "#2C2C2C" }}>
                Why guests notice it
              </h3>
              <ul className="space-y-3 text-sm md:text-base text-[#6B6B6B] leading-relaxed">
                <li>• Easy fishing access without booking a charter</li>
                <li>• Great activity for early mornings and sunset evenings</li>
                <li>• Fun for both serious anglers and casual vacation fishing</li>
                <li>• Pairs perfectly with dock drinks, swimming, and outdoor dinner</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {catches.slice(1).map((item) => (
                <div key={item.title} className="rounded-2xl overflow-hidden border border-[#E8E4DF] bg-white shadow-sm">
                  <div className="relative aspect-[4/3] bg-[#EEF1F3]">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 30vw"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-[#2C2C2C] mb-1">{item.title}</p>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
