import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "HomeFlow | Kitchen organization & setup, SF Peninsula",
  description:
    "Make your home work for you. Free 30-minute video consult, then book Nick for kitchen organization, fixtures, repairs and layout fixes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable} ${montserrat.variable} antialiased`}
    >
      <body className="min-h-screen bg-black text-white">{children}</body>
    </html>
  );
}
