import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Villa La Percha | Private Luxury Villa in Chalk Sound, Providenciales",
  description: "Experience the crystal-clear waters of Chalk Sound. Villa La Percha offers direct ocean access, kayaks, and a private pool. Book direct and save 15-20%.",
  keywords: ["Turks and Caicos villa", "Chalk Sound rental", "private villa Providenciales", "luxury Caribbean rental", "Villa La Percha"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-body antialiased bg-[#FAFAF8]">{children}</body>
    </html>
  );
}
