export interface FAQItem {
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    question: "How does direct booking work?",
    answer:
      "Choose your preferred dates in the availability calendar, submit an inquiry, and we’ll follow up directly. The goal is a simpler, lower-friction booking experience without the extra markup guests often see on Airbnb or VRBO.",
  },
  {
    question: "How much can guests usually save by booking direct?",
    answer:
      "Direct bookings are typically about 15–30% lower than Airbnb or VRBO total pricing for the same stay once platform fees and other add-ons are included.",
  },
  {
    question: "How close is the villa to the beach?",
    answer:
      "Taylor Bay is about a one- to two-minute walk from the driveway, and Sapodilla Bay is also very close by. The villa is in the Chalk Sound neighborhood between both beaches.",
  },
  {
    question: "How many people does the house work well for?",
    answer:
      "Villa La Percha has four en-suite suites plus a half bath off the main living area, making it a strong fit for families, couples traveling together, or groups who want shared space without sacrificing privacy.",
  },
  {
    question: "What is included at the house?",
    answer:
      "Highlights include the pool and hot tub, dock access for swimming and fishing, two kayaks, two paddle boards, a screened indoor-outdoor living area, a full kitchen, an outdoor kitchen with professional grill and sink, Sonos throughout, and multiple outdoor gathering spaces.",
  },
  {
    question: "Is the water access good for kids and casual swimmers?",
    answer:
      "Taylor Bay is especially good for families because the water is calm, shallow, and easy. The property itself also has dock access with stairs into swimmable water, though guests should always use normal care and supervision around docks, pools, and open water.",
  },
  {
    question: "How quickly will someone respond to an inquiry?",
    answer: "The aim is to respond within 24 hours, and often faster.",
  },
  {
    question: "What makes this stay different from booking through a resort?",
    answer:
      "The biggest difference is privacy and usable group space. Instead of scattered hotel rooms, you get a full villa with indoor-outdoor living, a private pool and hot tub, dock access, fishing, paddling, and the freedom to settle in for the week.",
  },
];

export function getFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
