import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { directStayEntity, siteUrl } from "@/lib/seo";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DirectStay",
    template: "%s | DirectStay",
  },
  description: "DirectStay builds direct-booking websites and AI-powered operating systems for vacation rental owners.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "DirectStay",
    "direct booking vacation rentals",
    "vacation rental owner software",
    "AI vacation rental operations",
    "book vacation homes direct",
    "Villa La Percha",
    "Turks and Caicos villa rental",
  ],
  openGraph: {
    title: "DirectStay | Direct-booking vacation rental websites and AI operations",
    description:
      "DirectStay helps independent vacation rental owners build direct-booking brands with polished property sites and AI-assisted operations.",
    url: "/",
    siteName: "DirectStay",
    type: "website",
    images: [
      {
        url: "/images/aerial-house-ocean-neighbors.jpg",
        width: 1200,
        height: 630,
        alt: "DirectStay featured villa in Providenciales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DirectStay | Direct-booking vacation rental websites and AI operations",
    description:
      "DirectStay helps independent vacation rental owners build direct-booking brands with polished property sites and AI-assisted operations.",
    images: ["/images/aerial-house-ocean-neighbors.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${display.variable} ${body.variable} font-body antialiased bg-[#FAFAF8]`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(directStayEntity) }}
        />
        {children}
      </body>
    </html>
  );
}
