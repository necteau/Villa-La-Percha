export type GuestReviewPhoto = {
  src: string;
  alt: string;
};

export type GuestReview = {
  id: string;
  quote: string;
  attribution: string;
  stayContext: string;
  source: "direct" | "airbnb" | "vrbo" | "email" | "owner";
  permissionStatus: "approved" | "public-source-review" | "needs-explicit-permission";
  photos: GuestReviewPhoto[];
};

export const reviewSourceLinks = [
  {
    label: "VRBO public listing",
    href: "https://www.vrbo.com/935749ha",
  },
  {
    label: "Airbnb public listing",
    href: "https://www.airbnb.com/rooms/20472078",
  },
];

export const guestReviewPhotoLimit = 4;

export const guestReviews: GuestReview[] = [
  {
    id: "vrbo-kimberly-feb-2025",
    quote:
      "We thoroughly enjoyed our stay! The pictures and description of the home and amenities were spot on — and the view was dreamy. Communication with the property manager and concierge was super easy and they were always available. I would highly recommend this home!",
    attribution: "Kimberly G.",
    stayContext: "VRBO verified review · 10/10 · February 2025",
    source: "vrbo",
    permissionStatus: "public-source-review",
    photos: [],
  },
  {
    id: "vrbo-eric-perfect-location",
    quote:
      "The villa was nicer than the pictures! The outdoor space was the highlight. Lots of room to hang out together, or to find your own space — in the sun, in the shade, or over the water. La Percha was by far the best.",
    attribution: "Eric S.",
    stayContext: "VRBO review · 10/10",
    source: "vrbo",
    permissionStatus: "public-source-review",
    photos: [],
  },
  {
    id: "vrbo-don-family-vacation",
    quote:
      "This family vacation exceeded expectations. Villa La Percha was exceptionally clean and well stocked, and the local management company was extremely responsive. Taylor Bay, the private dock, and the pool provided every option for water fun. We will return and strongly recommend it.",
    attribution: "Don S.",
    stayContext: "VRBO review · 10/10",
    source: "vrbo",
    permissionStatus: "public-source-review",
    photos: [],
  },
  {
    id: "vrbo-anna-great-vacation",
    quote:
      "We had a great time at Villa La Percha. The view, the house, the island — all perfection. The house had plenty of space for everyone to be together indoors or out, with generous bedrooms and outdoor space to get some peace and quiet.",
    attribution: "Anna C.",
    stayContext: "VRBO review · 10/10",
    source: "vrbo",
    permissionStatus: "public-source-review",
    photos: [],
  },
  {
    id: "airbnb-efren-june-2022",
    quote:
      "The space accommodated our party of 8. Each room had a bathroom, the common spaces were inviting and comfortable, and the kitchen was fully stocked. The house was amazing — great location and amenities!",
    attribution: "Efren · Berwyn, Illinois",
    stayContext: "Airbnb public review · 5 stars · June 2022",
    source: "airbnb",
    permissionStatus: "public-source-review",
    photos: [],
  },
  {
    id: "airbnb-maria-july-2022",
    quote: "Beautiful home in the most gorgeous location! Loved it for our family vacation.",
    attribution: "Maria · Atlanta, Georgia",
    stayContext: "Airbnb public review · 5 stars · July 2022",
    source: "airbnb",
    permissionStatus: "public-source-review",
    photos: [],
  },
];

export function getReviewPhotos(review: GuestReview) {
  return review.photos.slice(0, guestReviewPhotoLimit);
}
