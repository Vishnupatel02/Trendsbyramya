import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { CartProvider } from "@/lib/context/CartContext";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trends By Ramya | Handcrafted Jewelry & Women's Clothing",
  description:
    "Discover a premium collection of handmade jewelry, custom blackbeads, temple jewelry, necklaces, earrings, elegant kurtis, and women's clothing wear. Trends by Ramya brings tradition and modern clothing together.",
  keywords: [
    "Handmade Jewelry",
    "Blackbeads Collection",
    "Temple Jewelry",
    "Earrings",
    "Necklaces",
    "Bracelets",
    "Kurtis",
    "Women's Clothing",
    "Trends by Ramya",
    "Bespoke Jewelry India",
  ],
  authors: [{ name: "Ramya Jangili" }],
  openGraph: {
    title: "Trends By Ramya | Premium Handcrafted Jewelry & Clothing",
    description:
      "Carefully curated handcrafted jewelry, blackbeads, elegant kurtis, and stylish clothing designed to make every woman feel confident and beautiful.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-ivory text-ink font-sans flex flex-col antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
