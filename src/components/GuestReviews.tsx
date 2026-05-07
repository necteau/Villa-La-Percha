import Image from "next/image";
import { getReviewPhotos, guestReviews, reviewSourceLinks } from "@/data/guestReviews";

const sourceLabel: Record<(typeof guestReviews)[number]["source"], string> = {
  airbnb: "Airbnb",
  direct: "Direct guest note",
  email: "Guest email",
  owner: "Owner-curated slot",
  vrbo: "VRBO",
};

export default function GuestReviews() {
  return (
    <section id="guest-reviews" className="overflow-hidden bg-[#FAFAF8] px-6 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8B7355]">Guest reviews</p>
            <h2 className="mt-4 font-display text-4xl font-light leading-tight text-[#2C2C2C] md:text-5xl">
              What past guests loved about Villa La Percha.
            </h2>
          </div>
          <div className="rounded-[28px] border border-[#E8E4DF] bg-white p-6 shadow-[0_18px_50px_rgba(44,44,44,0.07)]">
            <p className="text-sm leading-7 text-[#5F5A50]">
              Selected comments are sourced from public booking-platform reviews and owner-provided VRBO screenshots,
              then lightly edited only for readability. Reviews can optionally include up to four guest-provided photos
              when we add that to the post-stay process.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {reviewSourceLinks.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#D8CBB8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7A6448] transition hover:border-[#8B7355] hover:bg-[#F6F1EA]"
                >
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 -mx-6 px-6 md:-mx-8 md:px-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[#8B7355]">Swipe or scroll to read more</p>
            <div className="hidden text-2xl text-[#B9A98F] md:block" aria-hidden="true">
              ← →
            </div>
          </div>
          <div className="flex snap-x gap-5 overflow-x-auto pb-6 [scrollbar-width:thin] [scrollbar-color:#CDBFA8_transparent]">
            {guestReviews.map((review) => {
              const photos = getReviewPhotos(review);
              return (
                <article
                  key={review.id}
                  className="flex min-h-[420px] w-[82vw] max-w-[430px] shrink-0 snap-start flex-col overflow-hidden rounded-[30px] border border-[#E8E4DF] bg-white shadow-[0_18px_45px_rgba(44,44,44,0.07)] sm:w-[430px]"
                >
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 bg-[#F6F1EA] p-1">
                      {photos.map((photo, index) => (
                        <div
                          key={`${review.id}-${photo.src}`}
                          className={`relative overflow-hidden bg-[#DED3C4] ${index === 0 ? "col-span-2 aspect-[16/9] rounded-t-[24px]" : "aspect-[4/3]"} ${index === photos.length - 1 ? "rounded-br-[24px]" : ""}`}
                        >
                          <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="430px" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#F6F1EA] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B7355]">
                        {sourceLabel[review.source]}
                      </span>
                      <span className="rounded-full bg-[#EEF4F1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4F7566]">
                        {review.permissionStatus === "needs-explicit-permission" ? "Needs approval" : "Publishable"}
                      </span>
                    </div>
                    <blockquote className="mt-6 font-display text-2xl font-light leading-snug text-[#2C2C2C] md:text-[1.7rem]">
                      “{review.quote}”
                    </blockquote>
                    <div className="mt-auto border-t border-[#E8E4DF] pt-5">
                      <p className="text-sm font-semibold text-[#2C2C2C]">{review.attribution}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8B7355]">{review.stayContext}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
