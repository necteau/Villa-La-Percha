import Image from "next/image";

const catches = [
  "Bonefish from the dock",
  "Yellowtail snapper in the afternoon",
  "Jacks on a calm evening",
];

export default function DockFishing() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#8B7355" }}>
            From the Dock
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Surprisingly Good Fishing, Right at the House
          </h2>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-3xl mx-auto">
            One of the most underrated parts of Villa La Percha is how good the dock fishing can be.
            Guests have caught bonefish, yellowtail snapper, and jacks right from the property — no
            charter required, no long boat ride, just a rod, a little patience, and a sunset that
            makes the whole thing even better.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-stretch">
          <div className="relative overflow-hidden rounded-3xl border border-[#E8E4DF] bg-[#EEF1F3] min-h-[340px]">
            <Image
              src="/images/aerial-ocean-dock-stairs-pool-house.jpg"
              alt="Dock at Villa La Percha"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute left-6 bottom-6 max-w-md text-white">
              <p className="text-[10px] tracking-[0.24em] uppercase text-white/70 mb-3">Current Photo Placeholder</p>
              <p className="text-sm md:text-base leading-relaxed text-white/85">
                Replace this with one of your dock fishing photos later and this section will become even stronger.
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

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {catches.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-dashed border-[#D7CEC3] bg-white p-5 text-center text-sm text-[#6B6B6B]"
                >
                  <div className="text-2xl mb-2">🎣</div>
                  <p className="font-medium text-[#2C2C2C] mb-1">Photo Placeholder</p>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
