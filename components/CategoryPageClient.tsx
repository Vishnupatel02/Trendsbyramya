"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/lib/types";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

interface CategoryPageClientProps {
  title: string;
  description: string;
  parentType: "jewellery" | "clothing";
  categories: Category[];
}

const CATEGORY_IMAGES: Record<string, string> = {
  "handmade-jewellery": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
  "blackbeads-collection": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  "necklaces-bracelets": "https://images.unsplash.com/photo-1599643478518-a784e5c4f839?w=800&q=80",
  "earrings-collection": "https://images.unsplash.com/photo-1630019851114-04d301c0e28a?w=800&q=80",
  "temple-jewellery": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
  "kurtis": "https://images.unsplash.com/photo-1583391733981-5c55a0b0e0f0?w=800&q=80",
  "trendy-womens-clothing": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
};

export default function CategoryPageClient({
  title,
  description,
  parentType,
  categories,
}: CategoryPageClientProps) {
  const [cartOpen, setCartOpen] = useState(false);

  // Filter categories to only those matching parentType
  const filteredCategories = categories.filter(
    (c) => c.parent_type === parentType
  );

  return (
    <>
      <Header onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-grow pt-24 bg-white min-h-screen pb-20">
        {/* Banner Section */}
        <section className="bg-ivory py-16 md:py-20 border-b border-maroon/5 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">
              Trends by Ramya
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-ink mt-3">
              {title}
            </h1>
            <div className="w-16 h-0.5 bg-maroon mx-auto mt-4 mb-6"></div>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-xl mx-auto">
              {description}
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${
              parentType === "jewellery" ? "lg:grid-cols-3" : "max-w-4xl mx-auto"
            } gap-8`}
          >
            {filteredCategories.map((category) => {
              const image =
                category.image_url ||
                CATEGORY_IMAGES[category.slug] ||
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80";

              return (
                <Link
                  href={`/shop?category=${category.slug}`}
                  key={category.id}
                  className="group relative block rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] shadow-md border border-maroon/5 bg-ivory flex flex-col justify-end transition-all duration-500 hover:scale-[1.015] hover:-translate-y-1 hover:shadow-xl active:scale-[0.99] sm:active:scale-100 cursor-pointer"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-ink/30 z-10 transition-colors group-hover:bg-ink/40" />
                  <img
                    src={image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Content Overlays */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/30 rounded-2xl z-20 pointer-events-none transition-all duration-300 m-3" />

                  <div className="relative z-20 p-6 sm:p-8 text-white">
                    <h2 className="font-display text-xl sm:text-2xl font-bold mb-2 tracking-wide">
                      {category.name}
                    </h2>
                    <span
                      className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gold group-hover:text-white transition-colors cursor-pointer"
                    >
                      Shop Now <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
