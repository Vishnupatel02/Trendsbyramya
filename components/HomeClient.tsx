"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, Heart, ShoppingBag, ShieldCheck, Award, MessageSquare, BadgePercent, Sparkles, Instagram, AlertTriangle, Mail, Clock } from "lucide-react";
import { Product, Category, InstagramPost, SiteConfig, Review } from "@/lib/types";
import { createContactEnquiryAction } from "@/lib/actions";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import CartDrawer from "./CartDrawer";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramColoredIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="instagram-grad" x1="12%" y1="97%" x2="88%" y2="3%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path fill="url(#instagram-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

interface HomeClientProps {
  products: Product[];
  categories: Category[];
  instagramFeed: InstagramPost[];
  siteConfig: SiteConfig;
  reviews: Review[];
}

export default function HomeClient({ products, categories, instagramFeed, siteConfig, reviews }: HomeClientProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactLookingFor, setContactLookingFor] = useState("Jewellery Customization");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerAlert = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 3500);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactWhatsapp || !contactMessage) {
      triggerAlert("error", "Please fill in all required fields.");
      return;
    }
    setIsSubmittingEnquiry(true);
    try {
      const formData = new FormData();
      formData.append("name", contactName);
      formData.append("whatsapp", contactWhatsapp);
      formData.append("looking_for", contactLookingFor);
      formData.append("message", contactMessage);

      // Save dynamic enquiry to Supabase
      await createContactEnquiryAction(formData);

      triggerAlert("success", "Enquiry recorded! Opening WhatsApp...");
      
      const baseText = `Hello Trends by Ramya,\n\nMy Name: ${contactName}\nWhatsApp: ${contactWhatsapp}\nLooking For: ${contactLookingFor}\nMessage: ${contactMessage}`;
      const encodedText = encodeURIComponent(baseText);
      
      setTimeout(() => {
        window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, "_blank");
      }, 1000);

      // Reset Form fields
      setContactName("");
      setContactWhatsapp("");
      setContactMessage("");
    } catch (err: any) {
      triggerAlert("error", err.message || "Failed to submit enquiry.");
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  // Filter approved and featured reviews
  const approvedFeaturedReviews = (reviews || []).filter(
    (r) => r.status === "approved" && r.featured
  );

  // Group products by badges
  const trendingProducts = products.filter((p) => p.badge === "trending").slice(0, 4);

  // Fallbacks if no products are matching specific badges
  const displayTrending = trendingProducts.length > 0 ? trendingProducts : products.slice(2, 6);

  const cleanPhone = siteConfig.whatsapp_number.replace(/[^0-9+]/g, "");

  const parentCategories = categories.filter((c) => c.parent_type === "root");

  return (
    <>
      <Header onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-grow pt-20">
        {/* 1. HERO SECTION */}
        <section className="relative bg-ivory min-h-[85vh] flex items-center overflow-hidden border-b border-maroon/5 py-12 md:py-24">
          {/* Transparent Watermark Logo - Center-Right placement */}
          <div className="absolute right-4 md:right-[10%] lg:right-[15%] top-1/2 -translate-y-1/2 z-0 opacity-[0.06] pointer-events-none select-none w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] lg:w-[580px] lg:h-[580px]">
            <img
              src="/logo.jpg"
              alt=""
              className="w-full h-full object-contain rounded-full mix-blend-multiply filter grayscale"
            />
          </div>

          {/* Banner Alert Toast */}
          {successMessage && (
            <div className="fixed top-24 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <ShieldCheck className="w-4 h-4" /> {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="fixed top-24 right-6 z-50 bg-rose-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <AlertTriangle className="w-4 h-4" /> {errorMessage}
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="max-w-2xl lg:max-w-xl text-center md:text-left">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink leading-tight mb-6 animate-fade-in">
                Timeless Style, <br />
                <span className="text-maroon">Crafted for Every Woman</span>
              </h1>
              
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
                From handcrafted jewelry to elegant kurtis, Trends by Ramya brings together tradition, craftsmanship, and modern clothing for every occasion.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full maroon-gradient px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                
                <a
                  href="#how-to-order"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("how-to-order")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-maroon/20 bg-white/80 backdrop-blur-sm px-8 py-4 text-xs font-bold uppercase tracking-widest text-maroon hover:bg-maroon/5 transition-colors cursor-pointer"
                >
                  How To Order
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PARENT CATEGORIES SECTION (Featured Collections) */}
        <section id="categories" className="py-20 bg-white border-b border-maroon/5 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Our Categories</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2">Featured Collections</h2>
              <p className="text-xs text-ink-muted mt-3">Browse our curated selections of premium jewelry, clothing, and more.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {parentCategories.map((c) => {
                const href = ["jewellery", "clothing"].includes(c.slug) 
                  ? `/${c.slug}` 
                  : `/shop?category=${c.slug}`;
                return (
                  <div key={c.id} className="group relative rounded-2xl overflow-hidden aspect-[16/10] shadow-md border border-maroon/5 bg-ivory">
                    <div className="absolute inset-0 bg-ink/30 z-10 transition-colors group-hover:bg-ink/40" />
                    <img
                      src={c.image_url || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"}
                      alt={c.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end text-white">
                      <h3 className="font-display text-2xl font-bold mb-3">{c.name}</h3>
                      <Link
                        href={href}
                        className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gold hover:text-white transition-colors"
                      >
                        Explore Collection <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. TRENDING PRODUCTS SECTION */}
        <section className="py-20 bg-ivory border-b border-maroon/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
              <div>
                <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Popular Choice</span>
                <h2 className="font-display text-3xl font-bold text-ink mt-1">Trending Products</h2>
              </div>
              <Link
                href="/shop?filter=trending"
                className="text-xs font-bold uppercase tracking-widest text-maroon hover:text-maroon-dark transition-colors flex items-center gap-1.5"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {displayTrending.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  categoryName={categories.find((c) => c.id === prod.category_id)?.name}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. HOW TO ORDER SECTION */}
        <section id="how-to-order" className="py-16 bg-white border-b border-maroon/5 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Shopping Guide</span>
              <h2 className="font-display text-3xl font-bold text-ink mt-2">How To Order</h2>
              <div className="w-12 h-0.5 bg-maroon mx-auto mt-3 mb-4"></div>
              <p className="text-xs text-ink-muted leading-relaxed">Ordering your boutique favourites is simple. Follow these four quick steps to customize and complete your purchase.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Select Product",
                  desc: "Browse our catalog, pick your favorite items, and click the 'Order on WhatsApp' button on the product card or page.",
                  icon: (
                    <svg className="w-6 h-6 text-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  ),
                },
                {
                  step: "02",
                  title: "Send Details",
                  desc: "Share your Name, Delivery Address, required Size, and custom length requirements (e.g. for blackbeads) with us.",
                  icon: (
                    <svg className="w-6 h-6 text-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  step: "03",
                  title: "Secure Payment",
                  desc: "Complete your transaction securely using UPI (Google Pay, PhonePe, Paytm) to the provided official UPI details.",
                  icon: (
                    <svg className="w-6 h-6 text-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  step: "04",
                  title: "Get Confirmation",
                  desc: "Share a screenshot of your payment. We will verify the transaction and immediately share your booking confirmation.",
                  icon: (
                    <svg className="w-6 h-6 text-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ),
                },
              ].map((item, idx) => (
                <div key={idx} className="group relative bg-ivory/30 hover:bg-white p-6 rounded-2xl border border-maroon/5 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="absolute top-4 right-6 text-5xl font-extrabold font-display text-maroon/5 group-hover:text-maroon/10 transition-colors">
                    {item.step}
                  </div>
                  <div className="p-3 bg-maroon/5 rounded-xl w-fit text-maroon mb-4 group-hover:bg-maroon group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-display text-base font-bold text-ink mb-2">{item.title}</h3>
                  <p className="text-[11px] text-ink-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. CUSTOMER REVIEWS SECTION */}
        <section className="py-20 bg-ivory border-b border-maroon/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Customer Love</span>
              <h2 className="font-display text-3xl font-bold text-ink mt-2">Loved &amp; Trusted</h2>
              <p className="text-xs text-ink-muted mt-3">Here is what our happy customers have to say about Trends by Ramya.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {approvedFeaturedReviews.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-maroon/5 shadow-sm p-8">
                  <p className="text-xs text-ink-muted italic leading-relaxed">
                    No customer reviews available yet. Be the first to share your experience.
                  </p>
                </div>
              ) : (
                approvedFeaturedReviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-6 rounded-2xl border border-maroon/5 shadow-sm flex flex-col justify-between">
                    <div>
                      {/* Optional Review Image */}
                      {rev.image_url && (
                        <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-ivory">
                          <img
                            src={rev.image_url}
                            alt="Customer review product image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Stars */}
                      <div className="flex gap-1 text-gold mb-3">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      
                      <p className="text-xs text-ink-muted italic leading-relaxed mb-4">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                    
                    <div className="border-t border-maroon/5 pt-4 flex flex-col">
                      <h4 className="text-xs font-bold text-ink">{rev.name}</h4>
                      {rev.product_name && (
                        <span className="text-[9px] text-maroon font-bold uppercase tracking-wider mt-1">
                          Product: {rev.product_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* 6. CONTACT US SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Let&apos;s Design Together</span>
                  <h2 className="font-display text-3xl font-bold text-ink mt-2">Get In Touch</h2>
                  <div className="w-12 h-0.5 bg-maroon mt-3"></div>
                </div>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  We specialize in customized blackbeads (mangalsutra), bridal necklace coordinates, and tailored kurtis. Get in touch directly via our communication channels or submit the enquiry form to chat on WhatsApp.
                </p>

                {/* Direct Links */}
                <div className="space-y-4 pt-4">
                  {/* WhatsApp Info */}
                  <div className="flex items-center gap-4 p-4 bg-green-50/50 border border-green-100 rounded-xl">
                    <div className="p-2.5 bg-green-100 rounded-full text-green-700">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-bold text-green-800 tracking-wider">WhatsApp Business</h4>
                      <p className="text-xs font-bold text-ink mt-0.5">{siteConfig.whatsapp_number}</p>
                    </div>
                  </div>

                  {/* Email Info */}
                  <div className="flex items-center gap-4 p-4 bg-maroon/5 border border-maroon/10 rounded-xl">
                    <div className="p-2.5 bg-maroon/10 rounded-full text-maroon">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase font-bold text-maroon tracking-wider">Email Support</h4>
                      <p className="text-xs font-bold text-ink mt-0.5">{siteConfig.email_address}</p>
                    </div>
                  </div>

                  {/* Consultation Hours & Address Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Consultation Hours */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg text-ink-muted mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-ink-muted">Consultation Hours</p>
                        <p className="font-semibold text-ink leading-relaxed">
                          Mon - Sat: 10:00 AM - 8:00 PM <br />
                          <span className="text-gold-dark">Closed on Sundays</span>
                        </p>
                      </div>
                    </div>
                    {/* Delivery Info */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg text-ink-muted mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-ink-muted">Delivery Locations</p>
                        <p className="font-semibold text-ink leading-relaxed">
                          Shipping Worldwide <br />
                          <span className="text-gold-dark">Free Shipping inside India</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address & UPI Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-maroon/5">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg text-ink-muted mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-ink-muted">Boutique Address</p>
                        <p className="font-semibold text-ink leading-relaxed">
                          Hyderabad, Telangana, India
                        </p>
                      </div>
                    </div>
                    {/* UPI Info */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-ink-muted">UPI Payment Details</p>
                        <p className="font-semibold text-ink leading-relaxed">
                          UPI ID: <span className="font-bold text-maroon">ramyajangili221@oksbi</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Us Form Card (7 cols) */}
              <div id="contact" className="lg:col-span-7 bg-white p-8 rounded-2xl border border-maroon/5 shadow-sm space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gold tracking-widest">Enquiry Form</span>
                  <h3 className="font-display text-2xl font-bold text-ink mt-1">Design Consultations</h3>
                  <div className="w-12 h-0.5 bg-maroon mt-2"></div>
                  <p className="text-xs text-ink-muted leading-relaxed mt-3">
                    Have a specific blackbeads length request, or want to coordinate a bridal set with your Kanjivaram saree? Fill in the details below. We will save your requirement and open WhatsApp to finalize your design.
                  </p>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">Your Name</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Ramya Patel"
                        className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-ink-muted tracking-wider">WhatsApp Number</label>
                      <input
                        type="text"
                        required
                        value={contactWhatsapp}
                        onChange={(e) => setContactWhatsapp(e.target.value)}
                        placeholder="e.g. +91 97052 82684"
                        className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">What are you looking for?</label>
                    <select
                      value={contactLookingFor}
                      onChange={(e) => setContactLookingFor(e.target.value)}
                      className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs bg-white"
                    >
                      <option value="Jewellery Customization">Jewellery Customization</option>
                      <option value="Clothing Sizing">Clothing Sizing</option>
                      <option value="Bridal Coordinates">Bridal Coordinates</option>
                      <option value="Sarees Enquiries">Sarees Enquiries</option>
                      <option value="Other Boutique Enquiry">Other Boutique Enquiry</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">Message / Requirements</label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Specify blackbeads length, kurti size, custom design coordination request, etc..."
                      className="w-full border border-maroon/10 focus:border-maroon focus:outline-none rounded px-3 py-2 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingEnquiry}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full maroon-gradient py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:shadow-lg transition-transform hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                    {isSubmittingEnquiry ? "Saving Enquiry..." : "Send via WhatsApp"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
