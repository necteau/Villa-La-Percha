"use client";

import { useState } from "react";

type SegmentType = "morning" | "lunch" | "evening";

interface Activity {
  name: string;
  description: string;
  time: string;
  label: string;
}

interface DayProfile {
  day: string;
  theme: string;
  icon: string;
  note: string;
  defaults: Record<SegmentType, number>;
}

const itineraries: Record<SegmentType, Activity[]> = {
  morning: [
    {
      name: "Taylor Bay Slow Swim",
      description: "Start close to home with calm, shallow water and a quiet beach morning before the island gets moving.",
      time: "8:00 AM",
      label: "Beach",
    },
    {
      name: "Chalk Sound Kayak",
      description: "Launch from the villa side of the island and keep the morning easy: turquoise water, limestone cays, and no big production.",
      time: "7:30 AM",
      label: "Paddle",
    },
    {
      name: "Grace Bay Sunrise Swim",
      description: "Go early for the classic Provo beach moment: long white sand, clear water, and a quieter version of Grace Bay.",
      time: "6:45 AM",
      label: "Beach",
    },
    {
      name: "Bight Reef Snorkel",
      description: "An easy shore-snorkeling session at Coral Gardens, best paired with a casual lunch nearby after the water.",
      time: "9:00 AM",
      label: "Snorkel",
    },
    {
      name: "Malcolm’s Road Adventure",
      description: "A wilder northwest-coast outing for confident explorers. Bring water, sun protection, and a vehicle suited to rougher roads.",
      time: "8:30 AM",
      label: "Explore",
    },
    {
      name: "Villa Pool Morning",
      description: "No guilt, no schedule: coffee, pool, hot tub, dock, and a slow start before lunch plans pull everyone out.",
      time: "9:30 AM",
      label: "Villa",
    },
  ],
  lunch: [
    {
      name: "Las Brisas",
      description: "The easy Chalk Sound lunch: close to the villa, scenic, practical, and perfect when nobody wants to drive across the island.",
      time: "12:30 PM",
      label: "Nearby",
    },
    {
      name: "Da Conch Shack",
      description: "The classic conch stop: colorful, casual, beachfront, and best when the group wants a proper Turks and Caicos institution.",
      time: "1:00 PM",
      label: "Local Classic",
    },
    {
      name: "Omar’s Beach Hut",
      description: "Casual waterfront seafood near Five Cays — strong for lobster, rum punch, and a more local-feeling lunch.",
      time: "12:45 PM",
      label: "Seafood",
    },
    {
      name: "CocoVan Airstream Lounge",
      description: "Grace Bay tacos and casual bites from the palm-grove Airstream — easy, fun, and low-commitment.",
      time: "12:15 PM",
      label: "Casual",
    },
    {
      name: "Somewhere Café",
      description: "A natural follow-up to Bight Reef snorkeling: casual food, beach energy, and no need to overthink the logistics.",
      time: "12:30 PM",
      label: "Beach Lunch",
    },
    {
      name: "Villa Grill Lunch",
      description: "Stay put for grilled fish, cold drinks, pool breaks, and the rare vacation luxury of not herding everyone into a car.",
      time: "1:00 PM",
      label: "At Home",
    },
  ],
  evening: [
    {
      name: "Hemingway’s Sunset Dinner",
      description: "Beachfront and relaxed at The Sands — a strong first dinner when everyone wants ocean air without a formal production.",
      time: "6:00 PM",
      label: "Sunset",
    },
    {
      name: "Magnolia Hilltop Dinner",
      description: "Go for the elevated view, quieter setting, and sunset-over-Turtle-Cove feeling when the group wants something scenic.",
      time: "6:30 PM",
      label: "View",
    },
    {
      name: "Infiniti Raw Bar",
      description: "Grace Bay Club’s polished oceanfront choice for a milestone night: seafood, cocktails, dressier energy, and a proper splurge.",
      time: "7:00 PM",
      label: "Fine Dining",
    },
    {
      name: "Le Bouchon du Village",
      description: "A lively Grace Bay bistro for wine, French-Caribbean dinner energy, and a night that feels different from beach-bar fare.",
      time: "7:15 PM",
      label: "Bistro",
    },
    {
      name: "Villa Fire-Pit Dinner",
      description: "Bring dinner home, light the fire pit, let the kids drift between pool and stars, and make the house the restaurant.",
      time: "6:30 PM",
      label: "At Home",
    },
    {
      name: "Sapodilla Sunset + Casual Dinner",
      description: "Catch the west-side sunset near home, then keep dinner informal so the day ends easy instead of over-scheduled.",
      time: "5:45 PM",
      label: "Low-Key",
    },
  ],
};

const dayProfiles: DayProfile[] = [
  {
    day: "Monday",
    theme: "Settle In",
    icon: "🌊",
    note: "Keep the first full day beautiful and low-friction.",
    defaults: { morning: 0, lunch: 0, evening: 0 },
  },
  {
    day: "Tuesday",
    theme: "Chalk Sound Day",
    icon: "🛶",
    note: "Stay close to the villa and let the water do most of the work.",
    defaults: { morning: 1, lunch: 5, evening: 4 },
  },
  {
    day: "Wednesday",
    theme: "Island Classic",
    icon: "🐚",
    note: "A little local color, a little beach energy, no spreadsheet required.",
    defaults: { morning: 2, lunch: 1, evening: 3 },
  },
  {
    day: "Thursday",
    theme: "Snorkel + Beach",
    icon: "🤿",
    note: "Use the morning for reef time, then keep the afternoon casual.",
    defaults: { morning: 3, lunch: 4, evening: 5 },
  },
  {
    day: "Friday",
    theme: "Big Dinner Night",
    icon: "🍷",
    note: "Save one night for the polished Grace Bay version of the island.",
    defaults: { morning: 5, lunch: 3, evening: 2 },
  },
  {
    day: "Saturday",
    theme: "Adventure Day",
    icon: "🧭",
    note: "For the group that wants one bigger outing before the week winds down.",
    defaults: { morning: 4, lunch: 2, evening: 1 },
  },
  {
    day: "Sunday",
    theme: "Slow Finish",
    icon: "🌅",
    note: "End with calm water, villa time, and fewer moving parts.",
    defaults: { morning: 0, lunch: 5, evening: 4 },
  },
];

const segmentLabels: Record<SegmentType, string> = {
  morning: "Morning adventure",
  lunch: "Lunch",
  evening: "Dinner / evening",
};

export default function ItineraryBuilder() {
  const [segments, setSegments] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const swapSegment = (key: string, optionIndex: number) => {
    setSegments((prev) => ({ ...prev, [key]: optionIndex }));
  };

  const getOption = (day: DayProfile, type: SegmentType) => {
    const key = `${day.day}-${type}`;
    const optionIndex = segments[key] ?? day.defaults[type];
    return itineraries[type][optionIndex % itineraries[type].length];
  };

  const buildSummary = (): string => {
    const parts: string[] = [];
    for (const day of dayProfiles) {
      for (const type of ["morning", "lunch", "evening"] as SegmentType[]) {
        const seg = getOption(day, type);
        parts.push(`${day.day} ${segmentLabels[type]}: ${seg.name}`);
      }
    }
    return parts.join("\n");
  };

  return (
    <div className="bg-[#FAFAF8] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#8B7355]">Plan Your Week</p>
          <h2 className="mb-5 font-display text-4xl font-light leading-tight text-[#2C2C2C] md:text-6xl">
            A week that actually varies.
          </h2>
          <p className="text-sm leading-7 text-[#6B6B6B] md:text-base">
            Each day starts with a curated morning, lunch, and dinner/evening plan. Tap a card to swap it — but the default week is already balanced between villa time, beach time, local classics, and one or two proper nights out.
          </p>
        </div>

        <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {dayProfiles.map(({ day, theme, icon }) => (
            <div key={day} className="rounded-2xl border border-[#E8E4DF] bg-white p-4 shadow-sm transition hover:border-[#8B7355]/30 hover:shadow-md">
              <div className="mb-2 text-2xl">{icon}</div>
              <p className="text-[11px] uppercase tracking-wider text-[#6B6B6B]">{day}</p>
              <p className="mt-1 text-sm font-semibold text-[#2C2C2C]">{theme}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {dayProfiles.map((dayProfile) => (
            <section key={dayProfile.day} className="overflow-hidden rounded-[28px] border border-[#E8E4DF] bg-white shadow-[0_16px_45px_rgba(31,31,27,0.06)]">
              <div className="border-b border-[#E8E4DF] bg-[#f4efe5] px-6 py-5 md:px-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{dayProfile.icon}</span>
                    <div>
                      <h3 className="font-display text-2xl font-light text-[#2C2C2C] md:text-3xl">{dayProfile.day}: {dayProfile.theme}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">{dayProfile.note}</p>
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#8B7355]">Curated default · swappable</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3 md:p-8">
                {(["morning", "lunch", "evening"] as SegmentType[]).map((type) => {
                  const key = `${dayProfile.day}-${type}`;
                  const current = getOption(dayProfile, type);
                  const isExpanded = expanded.has(key);

                  return (
                    <div key={type} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B7355]">{segmentLabels[type]}</span>
                        <span className="text-xs text-[#8A8175]">{current.time}</span>
                      </div>

                      <button
                        type="button"
                        className={`w-full rounded-2xl border text-left transition-all duration-300 ${
                          isExpanded ? "border-[#8B7355] shadow-lg" : "border-[#E8E4DF] shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                        }`}
                        onClick={() => toggleExpand(key)}
                      >
                        <div className={`rounded-2xl p-5 ${
                          type === "morning" ? "bg-gradient-to-br from-amber-50 to-orange-50" : type === "lunch" ? "bg-gradient-to-br from-teal-50 to-cyan-50" : "bg-gradient-to-br from-indigo-50 to-purple-50"
                        }`}>
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8B7355]">{current.label}</p>
                          <h4 className="font-display text-xl font-light leading-tight text-[#2C2C2C]">{current.name}</h4>
                          <p className="mt-3 text-xs leading-6 text-[#6B6B6B]">{current.description}</p>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="space-y-2 rounded-2xl border border-[#E8E4DF] bg-[#FBFAF7] p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B7355]">Swap with</p>
                          {itineraries[type].map((alt, index) => (
                            <button
                              key={alt.name}
                              type="button"
                              onClick={() => swapSegment(key, index)}
                              className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                                current.name === alt.name ? "border-[#8B7355] bg-[#8B7355]/5" : "border-[#E8E4DF] bg-white hover:border-[#8B7355]/30"
                              }`}
                            >
                              <span className="font-semibold text-[#2C2C2C]">{alt.name}</span>
                              <span className="ml-2 text-[10px] text-[#6B6B6B]">{alt.time}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 text-center">
          <div className="inline-block rounded-[28px] border border-[#E8E4DF] bg-white p-8 shadow-sm md:p-10">
            <h3 className="mb-4 font-display text-3xl font-light text-[#2C2C2C]">Want this turned into a real plan?</h3>
            <p className="mx-auto mb-8 max-w-md text-sm leading-7 text-[#6B6B6B]">
              Send your preferred rhythm — adventurous, slow, food-focused, kid-friendly, or all of the above — and we’ll help shape the week around your group.
            </p>
            <a
              href="/villa-la-percha#availability"
              className="inline-block px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-white"
              style={{ backgroundColor: "#8B7355" }}
              onClick={(event) => {
                const summary = buildSummary();
                alert(`Your curated week:\n\n${summary}`);
                event.preventDefault();
              }}
            >
              Send Us Your Preferences
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
