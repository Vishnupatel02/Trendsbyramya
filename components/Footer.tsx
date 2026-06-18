"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, Instagram, MapPin } from "lucide-react";
import { fetchSiteConfig } from "@/lib/actions";
import { SiteConfig } from "@/lib/types";

export default function Footer() {
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
        console.error("Failed to load footer site config:", err);
      }
    }
    loadConfig();
  }, []);

  const cleanPhone = siteConfig.whatsapp_number.replace(/[^0-9+]/g, "");

  return (
    <footer className="bg-ink text-ivory pt-16 pb-8 border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand Information */}
        <div className="flex flex-col space-y-4">
          <Link href="/" className="inline-block w-fit">
            <img
              src="/logo.jpg"
              alt="Trends by Ramya Logo"
              className="h-16 w-auto object-contain rounded-lg border border-gold/15 bg-white p-1"
            />
          </Link>
          <p className="text-xs text-ivory/70 leading-relaxed max-w-sm">
            Welcome to Trends by Ramya, where tradition meets modern clothing. We curate handcrafted jewelry, custom blackbeads, elegant kurtis, and stylish clothing designed for every occasion.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <a
              href={siteConfig.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-ivory/10 hover:bg-gold hover:text-ink rounded-full transition-colors text-ivory"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display text-base font-semibold tracking-wider text-gold mb-5 pb-1 border-b border-gold/15 w-fit">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-xs text-ivory/80">
            <li>
              <Link href="/" className="hover:text-gold transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-gold transition-colors">
                Shop All Collection
              </Link>
            </li>
            <li>
              <Link href="/shop?filter=new_arrival" className="hover:text-gold transition-colors">
                New Arrivals
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-gold transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-display text-base font-semibold tracking-wider text-gold mb-5 pb-1 border-b border-gold/15 w-fit">
            Categories
          </h4>
          <ul className="space-y-2.5 text-xs text-ivory/80">
            <li>
              <Link href="/shop?category=handmade-jewellery" className="hover:text-gold transition-colors">
                Handmade Jewellery
              </Link>
            </li>
            <li>
              <Link href="/shop?category=blackbeads-collection" className="hover:text-gold transition-colors">
                Blackbeads Collection
              </Link>
            </li>
            <li>
              <Link href="/shop?category=temple-jewellery" className="hover:text-gold transition-colors">
                Temple Jewellery
              </Link>
            </li>
            <li>
              <Link href="/shop?category=kurtis" className="hover:text-gold transition-colors">
                Kurtis Collection
              </Link>
            </li>
            <li>
              <Link href="/shop?category=trendy-womens-clothing" className="hover:text-gold transition-colors">
                Trendy Women's Clothing
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="font-display text-base font-semibold tracking-wider text-gold mb-5 pb-1 border-b border-gold/15 w-fit">
            Contact Us
          </h4>
          <ul className="space-y-4 text-xs text-ivory/80">
            <li className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-ivory/60 tracking-wider">WhatsApp Business</span>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors font-medium"
                >
                  {siteConfig.whatsapp_number}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-ivory/60 tracking-wider">Email Address</span>
                <a href={`mailto:${siteConfig.email_address}`} className="hover:text-gold transition-colors font-medium">
                  {siteConfig.email_address}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-ivory/60 tracking-wider">Location</span>
                <span className="text-ivory/70">Telangana, India</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
        <p className="text-xs text-ivory/50">
          &copy; {new Date().getFullYear()} Trends by Ramya. All Rights Reserved.
        </p>
        <p className="text-[10px] text-gold/60 tracking-widest uppercase font-medium">
          Made with Love &bull; Made in India
        </p>
      </div>
    </footer>
  );
}
