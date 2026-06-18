"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, Heart, ShoppingBag, ShieldCheck, Award, MessageSquare, BadgePercent, Sparkles, Instagram } from "lucide-react";
import { Product, Category, InstagramPost, SiteConfig, Review } from "@/lib/types";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import CartDrawer from "./CartDrawer";

interface HomeClientProps {
  products: Product[];
  categories: Category[];
  instagramFeed: InstagramPost[];
  siteConfig: SiteConfig;
  reviews: Review[];
}

export default function HomeClient({ products, categories, instagramFeed, siteConfig, reviews }: HomeClientProps) {
  const [cartOpen, setCartOpen] = useState(false);

  // Filter approved and featured reviews
  const approvedFeaturedReviews = (reviews || []).filter(
    (r) => r.status === "approved" && r.featured
  );

  // Group products by badges
  const bestSellers = products.filter((p) => p.badge === "bestseller").slice(0, 4);
  const newArrivals = products.filter((p) => p.badge === "new_arrival").slice(0, 4);
  const trendingProducts = products.filter((p) => p.badge === "trending").slice(0, 4);

  // Fallbacks if no products are matching specific badges
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : products.slice(0, 4);
  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : products.slice(4, 8);
  const displayTrending = trendingProducts.length > 0 ? trendingProducts : products.slice(2, 6);

  // Sample Testimonials - Removed in favor of real database reviews
  const testimonials = [];

  const cleanPhone = siteConfig.whatsapp_number.replace(/[^0-9+]/g, "");

  return (
    <>
      <Header onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-grow pt-20">
        {/* 1. HERO SECTION */}
        <section className="relative bg-ivory min-h-[85vh] flex items-center overflow-hidden border-b border-maroon/5 py-12 md:py-24">
          {/* Decorative background image elements */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-ivory via-transparent to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80"
              alt="Premium Jewelry Collection"
              className="w-full h-full object-cover object-center scale-105"
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
            <div className="max-w-2xl lg:max-w-xl text-center md:text-left">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink leading-tight mb-6 animate-fade-in">
                Timeless Style, <br />
                <span className="text-maroon">Crafted for Every Woman</span>
              </h1>
              
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed mb-8 max-w-lg">
                From handcrafted jewelry to elegant kurtis, Trends by Ramya brings together tradition, craftsmanship, and modern clothing for every occasion.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full maroon-gradient px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]"
                >
                  Explore Collection
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                
                <a
                  href={`https://wa.me/${cleanPhone}?text=Hello%20Trends%20by%20Ramya,%20I'd%20love%20to%20know%20more%20about%20your%20jewelry%20and%20clothing%20collection.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-maroon/20 bg-white/80 backdrop-blur-sm px-8 py-4 text-xs font-bold uppercase tracking-widest text-maroon hover:bg-maroon/5 transition-colors"
                >
                  Enquire on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. FEATURED COLLECTIONS */}
        <section className="py-20 bg-white border-b border-maroon/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Our Categories</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2">Featured Collections</h2>
              <p className="text-xs text-ink-muted mt-3">Browse our curated selections of premium jewelry and clothing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Jewelry Collection Card */}
              <div className="group relative rounded-2xl overflow-hidden aspect-[16/10] shadow-md border border-maroon/5 bg-ivory">
                <div className="absolute inset-0 bg-ink/30 z-10 transition-colors group-hover:bg-ink/40" />
                <img
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"
                  alt="Jewellery Collection"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end text-white">
                  <h3 className="font-display text-2xl font-bold mb-3">Jewellery Collection</h3>
                  <Link
                    href="/jewellery"
                    className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gold hover:text-white transition-colors"
                  >
                    Explore Jewellery <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>

              {/* Clothing Collection Card */}
              <div className="group relative rounded-2xl overflow-hidden aspect-[16/10] shadow-md border border-maroon/5 bg-ivory">
                <div className="absolute inset-0 bg-ink/30 z-10 transition-colors group-hover:bg-ink/40" />
                <img
                  src="https://images.unsplash.com/photo-1583391733981-5c55a0b0e0f0?w=800&q=80"
                  alt="Clothing Collection"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end text-white">
                  <h3 className="font-display text-2xl font-bold mb-3">Clothing Collection</h3>
                  <Link
                    href="/clothing"
                    className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gold hover:text-white transition-colors"
                  >
                    Explore Clothing <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BEST SELLERS SECTION */}
        <section className="py-20 bg-ivory border-b border-maroon/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
              <div>
                <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Most Loved</span>
                <h2 className="font-display text-3xl font-bold text-ink mt-1">Our Best Sellers</h2>
              </div>
              <Link
                href="/shop?filter=bestseller"
                className="text-xs font-bold uppercase tracking-widest text-maroon hover:text-maroon-dark transition-colors flex items-center gap-1.5"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {displayBestSellers.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  categoryName={categories.find((c) => c.id === prod.category_id)?.name}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. NEW ARRIVALS SECTION */}
        <section className="py-20 bg-white border-b border-maroon/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
              <div>
                <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Fresh Off The Craft</span>
                <h2 className="font-display text-3xl font-bold text-ink mt-1">New Arrivals</h2>
              </div>
              <Link
                href="/shop?filter=new_arrival"
                className="text-xs font-bold uppercase tracking-widest text-maroon hover:text-maroon-dark transition-colors flex items-center gap-1.5"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {displayNewArrivals.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  categoryName={categories.find((c) => c.id === prod.category_id)?.name}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 5. TRENDING PRODUCTS SECTION */}
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

        {/* 6. WHY CHOOSE US SECTION */}
        <section className="py-20 bg-white border-b border-maroon/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Our Core Values</span>
              <h2 className="font-display text-3xl font-bold text-ink mt-2">Why Choose Us</h2>
              <p className="text-xs text-ink-muted mt-3">We believe in making every shopping experience delightful, personal, and premium.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
              {[
                { title: "Handpicked Collections", desc: "Every design is curated with close attention to detail and traditional essence.", icon: Sparkles },
                { title: "Premium Quality", desc: "High-grade materials, fine gold polish, and durable knottings that last long.", icon: Award },
                { title: "Affordable Pricing", desc: "Honest boutique prices, removing heavy middleman markup costs.", icon: BadgePercent },
                { title: "WhatsApp Support", desc: "Reach out for sizing support, color matching, and custom adjustments.", icon: MessageSquare },
                { title: "Trusted Service", desc: "Secure packing, prompt replies, and dedicated customer care since 2018.", icon: ShieldCheck },
              ].map((val, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-4 bg-ivory/40 rounded-xl border border-maroon/5">
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

        {/* 7. CUSTOMER REVIEWS SECTION */}
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

        {/* 8. INSTAGRAM SECTION */}
        <section className="py-20 bg-white border-b border-maroon/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Instagram</span>
              <h2 className="font-display text-3xl font-bold text-ink mt-2">Follow Our Clothing Journey</h2>
              <p className="text-xs text-ink-muted mt-3">Stay updated with our daily designs, customer styling reels, and store updates.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {instagramFeed.map((post) => (
                <a
                  key={post.id}
                  href={post.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square bg-ivory rounded-xl overflow-hidden shadow-sm"
                >
                  <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 z-10 transition-opacity flex items-center justify-center text-white p-4">
                    <div className="flex flex-col items-center text-center">
                      <Instagram className="w-6 h-6 mb-2" />
                      <p className="text-[10px] font-semibold tracking-wider uppercase">View Post</p>
                    </div>
                  </div>
                  <img
                    src={post.image_url}
                    alt={post.caption || "Instagram Post"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </a>
              ))}
            </div>

            <div className="text-center">
              <a
                href={siteConfig.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-maroon/20 hover:bg-maroon hover:text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-maroon transition-all"
              >
                <Instagram className="w-4 h-4 mr-2" /> Follow @trends_by_ramya
              </a>
            </div>
          </div>
        </section>

        {/* 9. ABOUT US & CONTACT SECTION */}
        <section id="about" className="py-20 bg-ivory">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* About Us */}
              <div className="space-y-6">
                <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Our Story</span>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink">
                  Where Tradition Meets <br />
                  <span className="text-maroon">Modern Clothing</span>
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  Welcome to Trends by Ramya, where tradition meets modern clothing. We carefully curate handcrafted jewellery, blackbeads, elegant kurtis, and stylish clothing designed to make every woman feel confident and beautiful. Our goal is to bring quality, style, and affordability together in one destination.
                </p>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  As a women-led brand, we take pride in intentional, slow craftsmanship. Each jewelry item is individually hand-knotted, polished, and checked. No cheap mass assembly lines—just genuine beauty customized to your styling preferences.
                </p>
              </div>

              {/* Contact Information Cards */}
              <div id="contact" className="bg-white p-8 rounded-2xl border border-maroon/5 shadow-sm space-y-6">
                <h3 className="font-display text-xl font-bold text-ink border-b border-maroon/10 pb-3">
                  Design Consultations &amp; Enquiries
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Have a specific blackbeads length request, or want to coordinate a bridal set with your Kanjivaram saree? Send us a message!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp Box */}
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-4 bg-green-50/50 hover:bg-green-50 border border-green-100 rounded-xl transition-colors"
                  >
                    <span className="text-[10px] uppercase font-bold text-green-700 tracking-wider mb-1">WhatsApp Chat</span>
                    <span className="text-sm font-bold text-ink">{siteConfig.whatsapp_number}</span>
                    <span className="text-[10px] text-green-600 mt-2 font-medium">Click to chat &rarr;</span>
                  </a>

                  {/* Email Box */}
                  <a
                    href={`mailto:${siteConfig.email_address}`}
                    className="flex flex-col p-4 bg-maroon/5 hover:bg-maroon/10 border border-maroon/10 rounded-xl transition-colors"
                  >
                    <span className="text-[10px] uppercase font-bold text-maroon tracking-wider mb-1">Email Support</span>
                    <span className="text-sm font-bold text-ink line-clamp-1">{siteConfig.email_address}</span>
                    <span className="text-[10px] text-maroon mt-2 font-medium">Click to mail &rarr;</span>
                  </a>
                </div>

                <div className="pt-4 border-t border-maroon/5 text-center">
                  <p className="text-[10px] text-gold font-bold uppercase tracking-wider">
                    Free Design Consultations &bull; Custom Quotes in 24 Hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );

  function handleCategoryClick(slug: string) {
    window.location.href = `/shop?category=${slug}`;
  }
}
