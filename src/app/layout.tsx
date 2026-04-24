import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://villa-la-percha.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Villa La Percha | Private Luxury Villa in Chalk Sound, Providenciales",
  description: "Experience the crystal-clear waters of Chalk Sound. Villa La Percha offers direct ocean access, kayaks, and a private pool. Book direct and save 15-20%.",
  keywords: ["Turks and Caicos villa", "Chalk Sound rental", "private villa Providenciales", "luxury Caribbean rental", "Villa La Percha"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Villa La Percha | Private Luxury Villa in Chalk Sound, Providenciales",
    description:
      "Experience the crystal-clear waters of Chalk Sound. Villa La Percha offers direct ocean access, kayaks, and a private pool.",
    url: "/",
    siteName: "Villa La Percha",
    type: "website",
    images: [
      {
        url: "/images/aerial-house-ocean-neighbors.jpg",
        width: 1200,
        height: 630,
        alt: "Villa La Percha aerial view",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Villa La Percha | Private Luxury Villa in Chalk Sound, Providenciales",
    description:
      "Experience the crystal-clear waters of Chalk Sound. Private villa, direct booking, personalized stay.",
    images: ["/images/aerial-house-ocean-neighbors.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${display.variable} ${body.variable} font-body antialiased bg-[#FAFAF8]`}>{children}</body>
    </html>
  );
}
