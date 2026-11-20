import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// The design is light-only. Declaring it stops browsers that auto-darken pages from inverting it.
export const viewport: Viewport = { colorScheme: "only light", themeColor: "#fbf8f2" };

export const metadata: Metadata = {
  title: "HomeFlow | Residential Operations Management, San Francisco & the Peninsula",
  description:
    "Art and mirror installation, lighting, wire concealment, espresso machine care, shelving and residential maintenance across San Francisco and the Peninsula. Book a complimentary assessment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${manrope.variable} ${montserrat.variable} antialiased`}
    >
      <body className="min-h-screen bg-paper text-charcoal">{children}</body>
    </html>
  );
}
