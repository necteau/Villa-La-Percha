export default function LocationMap() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm tracking-[0.3em] uppercase text-sky-600 mb-3">Location</p>
            <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-6">
              Chalk Sound, Providenciales
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Nestled on the shores of Chalk Sound National Park — one of the Caribbean&apos;s most breathtaking natural wonders. The sound&apos;s turquoise waters are shallow, calm, and so clear you can see the coral gardens below.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🏄</span>
                <div>
                  <h4 className="font-medium text-slate-900">Water Activities</h4>
                  <p className="text-sm text-slate-500">Kayaks provided. Snorkel, paddleboard, and sail right from the property.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🪸</span>
                <div>
                  <h4 className="font-medium text-slate-900">Chalk Sound Park</h4>
                  <p className="text-sm text-slate-500">Boat through 50+ limestone cays and islands in this protected marine area.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🏖️</span>
                <div>
                  <h4 className="font-medium text-slate-900">Grace Bay</h4>
                  <p className="text-sm text-slate-500">World-renowned beach — just 20 minutes away by car.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🍽️</span>
                <div>
                  <h4 className="font-medium text-slate-900">Dining &amp; Shopping</h4>
                  <p className="text-sm text-slate-500">Provincetown shopping center and restaurants — 5 minutes away.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-sky-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-slate-500 text-sm">Map view of Chalk Sound<br />National Park area</p>
                <p className="text-slate-400 text-xs mt-2">Full embed requires a Google Maps API key</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
