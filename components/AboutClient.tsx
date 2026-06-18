"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Award, BadgePercent, MessageSquare, ShieldCheck } from "lucide-react";
import { SiteConfig } from "@/lib/types";
import { fetchSiteConfig } from "@/lib/actions";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

export default function AboutClient() {
  const [cartOpen, setCartOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    whatsapp_number: "+91 97052 82684",
    email_address: "ramyajangili221@gmail.com",
    instagram_url: "https://www.instagram.com/trends_by_ramya",
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await fetchSiteConfig();
        if (config) setSiteConfig(config);
      } catch (err) {
        console.error("Failed to load about site config:", err);
      }
    }
    loadConfig();
  }, []);

  const coreValues = [
    { title: "Handpicked Collections", desc: "Every design is curated with close attention to detail and traditional essence.", icon: Sparkles },
    { title: "Premium Quality", desc: "High-grade materials, fine gold polish, and durable knottings that last long.", icon: Award },
    { title: "Affordable Pricing", desc: "Honest boutique prices, removing heavy middleman markup costs.", icon: BadgePercent },
    { title: "WhatsApp Support", desc: "Reach out for sizing support, color matching, and custom adjustments.", icon: MessageSquare },
    { title: "Trusted Service", desc: "Secure packing, prompt replies, and dedicated customer care since 2018.", icon: ShieldCheck },
  ];

  return (
    <>
      <Header onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-grow pt-24 bg-white min-h-screen pb-20">
        {/* Banner Section */}
        <section className="bg-ivory py-16 md:py-20 border-b border-maroon/5 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">
              Our Story
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-ink mt-3">
              About Trends by Ramya
            </h1>
            <div className="w-16 h-0.5 bg-maroon mx-auto mt-4 mb-6"></div>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-xl mx-auto">
              A women-led brand dedicated to curation, craftsmanship, and elegant clothing.
            </p>
          </div>
        </section>

        {/* Detailed Story Section */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Story text */}
            <div className="space-y-6">
              <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Est. 2018</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
                Where Tradition Meets <br />
                <span className="text-maroon">Modern Clothing</span>
              </h2>
              <div className="w-12 h-0.5 bg-gold mt-2"></div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Welcome to Trends by Ramya, where tradition meets modern clothing. We carefully curate handcrafted jewellery, blackbeads, elegant kurtis, and stylish clothing designed to make every woman feel confident and beautiful. Our goal is to bring quality, style, and affordability together in one destination.
              </p>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                As a women-led brand, we take pride in intentional, slow craftsmanship. Each jewelry item is individually hand-knotted, polished, and checked. No cheap mass assembly lines—just genuine beauty customized to your styling preferences.
              </p>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                We believe that premium designs shouldn&apos;t come with extortionate markups. By managing our workshop directly and working closely with traditional artisans, we deliver custom, high-end designs directly to you.
              </p>
            </div>

            {/* Brand Logo & Presentation */}
            <div className="flex justify-center items-center bg-ivory p-12 rounded-3xl border border-maroon/5 shadow-sm max-w-lg mx-auto w-full aspect-square">
              <div className="text-center">
                <img
                  src="/logo.jpg"
                  alt="Trends by Ramya Brand Logo"
                  className="h-40 w-40 rounded-full mx-auto object-contain shadow-md mb-6 transition-transform hover:scale-105 duration-300 border border-gold/10"
                />
                <h3 className="font-display text-lg font-bold text-ink">Trends by Ramya</h3>
                <p className="text-xs text-gold uppercase tracking-widest mt-1">Handcrafted Luxury</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 md:py-20 bg-ivory border-y border-maroon/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Our Core Values</span>
              <h2 className="font-display text-3xl font-bold text-ink mt-2">Why We Do What We Do</h2>
              <p className="text-xs text-ink-muted mt-3">We believe in making every shopping experience delightful, personal, and premium.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
              {coreValues.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-maroon/5 shadow-sm">
                  <div className="p-3 bg-maroon/5 rounded-full text-maroon mb-4">
                    <val.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-ink mb-2">{val.title}</h3>
                  <p className="text-[11px] text-ink-muted leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
