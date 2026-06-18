"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Mail, Instagram, Clock, Send } from "lucide-react";
import { SiteConfig } from "@/lib/types";
import { fetchSiteConfig } from "@/lib/actions";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

export default function ContactClient() {
  const [cartOpen, setCartOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    whatsapp_number: "+91 97052 82684",
    email_address: "ramyajangili221@gmail.com",
    instagram_url: "https://www.instagram.com/trends_by_ramya",
  });

  // Contact Form States
  const [name, setName] = useState("");
  const [queryType, setQueryType] = useState("Jewellery Customization");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await fetchSiteConfig();
        if (config) setSiteConfig(config);
      } catch (err) {
        console.error("Failed to load contact site config:", err);
      }
    }
    loadConfig();
  }, []);

  const cleanPhone = siteConfig.whatsapp_number.replace(/[^0-9+]/g, "");

  const handleWhatsAppEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) {
      alert("Please fill in your name and message.");
      return;
    }

    const baseText = `Hello Trends by Ramya,\n\nMy Name: ${name}\nEnquiry Type: ${queryType}\nMessage: ${message}`;
    const encodedText = encodeURIComponent(baseText);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <Header onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-grow pt-24 bg-white min-h-screen pb-20">
        {/* Banner Section */}
        <section className="bg-ivory py-16 md:py-20 border-b border-maroon/5 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">
              Get In Touch
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-ink mt-3">
              Contact Us
            </h1>
            <div className="w-16 h-0.5 bg-maroon mx-auto mt-4 mb-6"></div>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-xl mx-auto">
              Have questions about sizing, custom jewellery lengths, or bridal orders? We are here to help.
            </p>
          </div>
        </section>

        {/* Contact Content Grid */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Info Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Bespoke Consultation</span>
                <h2 className="font-display text-3xl font-bold text-ink">
                  Let&apos;s Design <span className="text-maroon">Together</span>
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  We specialize in customized blackbeads (mangalsutra), bridal necklace coordinates, and tailored kurtis. Get in touch directly via our communication channels or submit the enquiry form to chat on WhatsApp.
                </p>
              </div>

              {/* Direct Links Container */}
              <div className="space-y-4 pt-4">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-green-50/40 hover:bg-green-50 border border-green-100 rounded-2xl transition-all hover:translate-x-1"
                >
                  <div className="p-3 bg-green-100 rounded-full text-green-700">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold text-green-800 tracking-wider">WhatsApp Business</h3>
                    <p className="text-sm font-bold text-ink mt-0.5">{siteConfig.whatsapp_number}</p>
                    <span className="text-[10px] text-green-600 font-semibold mt-1 block">Click to start chat &rarr;</span>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${siteConfig.email_address}`}
                  className="flex items-center gap-4 p-5 bg-maroon/5 hover:bg-maroon/10 border border-maroon/10 rounded-2xl transition-all hover:translate-x-1"
                >
                  <div className="p-3 bg-maroon/10 rounded-full text-maroon">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold text-maroon tracking-wider">Email Support</h3>
                    <p className="text-sm font-bold text-ink mt-0.5 line-clamp-1">{siteConfig.email_address}</p>
                    <span className="text-[10px] text-maroon font-semibold mt-1 block">Click to write mail &rarr;</span>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href={siteConfig.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-ivory/80 hover:bg-ivory border border-gold/15 rounded-2xl transition-all hover:translate-x-1"
                >
                  <div className="p-3 bg-gold/10 rounded-full text-gold">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold text-gold-dark tracking-wider">Instagram Page</h3>
                    <p className="text-sm font-bold text-ink mt-0.5">@trends_by_ramya</p>
                    <span className="text-[10px] text-gold-dark font-semibold mt-1 block">Click to visit profile &rarr;</span>
                  </div>
                </a>

                {/* Consultation Hours */}
                <div className="flex items-center gap-4 p-5 bg-white border border-maroon/5 rounded-2xl">
                  <div className="p-3 bg-ink/5 rounded-full text-ink-muted">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold text-ink-muted tracking-wider">Consultation Hours</h3>
                    <p className="text-xs font-semibold text-ink mt-0.5">Mon - Sat: 10:00 AM - 8:00 PM (IST)</p>
                    <p className="text-[10px] text-ink-muted mt-1">Closed on Sundays &amp; Public Holidays</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick WhatsApp Enquiry Form (7 cols) */}
            <div className="lg:col-span-7 bg-ivory/40 border border-maroon/5 p-8 sm:p-10 rounded-3xl shadow-sm">
              <h3 className="font-display text-2xl font-bold text-ink mb-2">Send WhatsApp Enquiry</h3>
              <p className="text-xs text-ink-muted mb-6">
                Fill out this quick form and click the button to generate a structured message. It will open in your WhatsApp automatically!
              </p>

              <form onSubmit={handleWhatsAppEnquiry} className="space-y-6">
                <div>
                  <label htmlFor="user-name" className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="user-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white border border-maroon/10 focus:border-maroon rounded-xl px-4 py-3.5 text-xs text-ink outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="enquiry-type" className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                    Enquiry Type
                  </label>
                  <select
                    id="enquiry-type"
                    value={queryType}
                    onChange={(e) => setQueryType(e.target.value)}
                    className="w-full bg-white border border-maroon/10 focus:border-maroon rounded-xl px-4 py-3.5 text-xs text-ink outline-none transition-colors cursor-pointer"
                  >
                    <option>Jewellery Customization</option>
                    <option>Clothing Sizing / Custom Tailoring</option>
                    <option>Bulk / Return Gift Orders</option>
                    <option>Order Status / Follow-up</option>
                    <option>General Collaboration / Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-ink mb-2">
                    Message / Requirements
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your design customisation, desired lengths, sizes or specific requirements..."
                    className="w-full bg-white border border-maroon/10 focus:border-maroon rounded-xl px-4 py-3.5 text-xs text-ink outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center rounded-full maroon-gradient px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:shadow-lg transition-transform hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4 mr-2" /> Start WhatsApp Chat
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
