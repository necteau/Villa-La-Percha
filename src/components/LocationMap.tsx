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
              Villa La Percha sits in the quiet Chalk Sound neighborhood between Taylor Bay and Sapodilla Bay. Chalk Sound is behind the home, while Taylor Bay is just a one- to two-minute walk from the driveway.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🏄</span>
                <div>
                  <h4 className="font-medium text-slate-900">Water Access</h4>
                  <p className="text-sm text-slate-500">Launch two kayaks and two paddle boards from the dock, swim from the stairs into the water, or fish right from the property.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🪸</span>
                <div>
                  <h4 className="font-medium text-slate-900">Taylor Bay</h4>
                  <p className="text-sm text-slate-500">A calm, shallow beach just around the corner — ideal for kids, wading, and unforgettable sunsets.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🏖️</span>
                <div>
                  <h4 className="font-medium text-slate-900">Sapodilla Bay</h4>
                  <p className="text-sm text-slate-500">A lively, family-friendly beach nearby, often with food vendors, drinks, music, and shallow water.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">🍽️</span>
                <div>
                  <h4 className="font-medium text-slate-900">Dining &amp; Shopping</h4>
                  <p className="text-sm text-slate-500">Dining, groceries, and island essentials are all an easy drive away in Providenciales.</p>
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
