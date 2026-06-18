"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Plus, Minus, ArrowLeft, MessageSquare, ShieldCheck, RefreshCw, Truck, Star } from "lucide-react";
import { Product, Category, SiteConfig, Review } from "@/lib/types";
import { createReviewAction } from "@/lib/actions";
import { useCart } from "@/lib/context/CartContext";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

interface ProductDetailClientProps {
  product: Product;
  category?: Category;
  siteConfig: SiteConfig;
  reviews: Review[];
}

export default function ProductDetailClient({ product, category, siteConfig, reviews }: ProductDetailClientProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);
  
  const [cartOpen, setCartOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review Form States
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter approved reviews for this product
  const productReviews = (reviews || []).filter(
    (r) => r.product_id === product.id && r.status === "approved"
  );

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("name", reviewName);
      formData.append("product_id", product.id);
      formData.append("product_name", product.name);
      formData.append("rating", reviewRating.toString());
      formData.append("comment", reviewComment);
      if (reviewImageFile) {
        formData.append("image", reviewImageFile);
      }

      const res = await createReviewAction(formData);
      if (res.success) {
        setSubmitSuccess(true);
        setReviewName("");
        setReviewRating(5);
        setReviewComment("");
        setReviewImageFile(null);
      } else {
        setSubmitError(res.error || "Failed to submit review.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Image zoom state
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: "none" });
  const containerRef = useRef<HTMLDivElement>(null);

  const images = product.images.length > 0 ? product.images : [
    "https://images.unsplash.com/photo-1617032213178-1b887b1b3b0e?w=800&q=80"
  ];

  // Stock status styling
  const getStockStatus = () => {
    switch (product.status) {
      case "in_stock":
        return { text: "In Stock", color: "text-green-600 bg-green-50 border-green-200" };
      case "low_stock":
        return { text: "Low Stock", color: "text-amber-600 bg-amber-50 border-amber-200" };
      case "out_of_stock":
        return { text: "Out of Stock", color: "text-rose-600 bg-rose-50 border-rose-200" };
      default:
        return { text: "In Stock", color: "text-green-600 bg-green-50 border-green-200" };
    }
  };

  const getBadge = () => {
    switch (product.badge) {
      case "new_arrival":
        return { text: "New Arrival", style: "bg-maroon text-white" };
      case "bestseller":
        return { text: "Bestseller", style: "bg-gold text-ink" };
      case "trending":
        return { text: "Trending", style: "bg-gold text-ink" };
      case "limited_stock":
        return { text: "Limited Edition", style: "bg-ink text-white" };
      default:
        return null;
    }
  };

  const stockInfo = getStockStatus();
  const badge = getBadge();
  const cleanPhone = siteConfig.whatsapp_number.replace(/[^0-9+]/g, "");

  // Mouse zoom handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${images[activeImageIndex]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: "200%", // Double scale
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  const handleEnquireNow = () => {
    const text = `Hello Trends by Ramya,\n\nI am interested in the following product:\n\n- ${product.name} (ID: ${product.id})\n- Price: ₹${product.price.toLocaleString("en-IN")}\n\nPlease share availability and ordering details.\n\nThank you.`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, "_blank");
  };

  return (
    <>
      <Header onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-grow pt-24 bg-white pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-ink-muted hover:text-maroon transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Image Section (lg:cols-7) */}
            <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
              {/* Main Image Box with Zoom */}
              <div className="flex-grow relative aspect-[3/4] bg-ivory rounded-2xl overflow-hidden border border-maroon/5">
                {badge && (
                  <span className={`absolute top-4 left-4 z-10 rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ${badge.style}`}>
                    {badge.text}
                  </span>
                )}
                
                {/* Desktop Zoom Pan Area */}
                <div
                  ref={containerRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="w-full h-full relative cursor-zoom-in"
                >
                  <img
                    src={images[activeImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Zoom Lens Overlay */}
                  <div
                    className="absolute inset-0 z-10 pointer-events-none bg-no-repeat bg-white transition-opacity duration-150"
                    style={{
                      ...zoomStyle,
                      opacity: zoomStyle.display === "block" ? 1 : 0,
                    }}
                  />
                </div>
              </div>

              {/* Thumbnails list */}
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-x-visible shrink-0 pb-2 md:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 md:w-20 md:h-24 bg-ivory rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activeImageIndex ? "border-maroon shadow-md scale-95" : "border-maroon/10 hover:border-maroon/40"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details Section (lg:cols-5) */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              {/* Category & Status */}
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-bold tracking-widest text-gold">
                  {category ? category.name : "Jewellery"}
                </span>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${stockInfo.color}`}>
                  {stockInfo.text}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-maroon">
                &#8377;{product.price.toLocaleString("en-IN")}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-2">Description</h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity Select & Actions */}
              <div className="pt-4 border-t border-maroon/10 space-y-4">
                {product.status !== "out_of_stock" && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Quantity</span>
                    <div className="flex items-center border border-gray-200 rounded-full bg-ivory p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1.5 hover:text-maroon transition-colors rounded-full hover:bg-gray-150"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold px-4 text-ink">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-1.5 hover:text-maroon transition-colors rounded-full hover:bg-gray-150"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Button Options */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => addToCart(product, quantity)}
                    disabled={product.status === "out_of_stock"}
                    className={`flex-grow flex items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-widest shadow-md transition-all ${
                      product.status === "out_of_stock"
                        ? "bg-gray-150 text-gray-400 border border-gray-200 cursor-not-allowed"
                        : "maroon-gradient text-white hover:shadow-lg hover:scale-[1.01]"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {product.status === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-4 rounded-full border transition-all ${
                      wishlisted
                        ? "bg-maroon border-maroon text-white shadow-md"
                        : "border-maroon/20 hover:border-maroon hover:bg-maroon/5 text-ink-muted hover:text-maroon"
                    }`}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* WhatsApp Quick Enquiry Button */}
                <button
                  onClick={handleEnquireNow}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-green-200 bg-green-50 hover:bg-green-100 py-3 text-xs font-bold uppercase tracking-widest text-green-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Enquire on WhatsApp
                </button>
              </div>

              {/* Luxury Badges Cards */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-maroon/10">
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-ivory/50 border border-maroon/5">
                  <Truck className="w-4 h-4 text-maroon mb-1" />
                  <span className="text-[9px] font-bold text-ink uppercase tracking-wider">Secure Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-ivory/50 border border-maroon/5">
                  <ShieldCheck className="w-4 h-4 text-maroon mb-1" />
                  <span className="text-[9px] font-bold text-ink uppercase tracking-wider">Premium Quality</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 rounded-lg bg-ivory/50 border border-maroon/5">
                  <RefreshCw className="w-4 h-4 text-maroon mb-1" />
                  <span className="text-[9px] font-bold text-ink uppercase tracking-wider">Easy Exchange</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <section className="border-t border-maroon/10 mt-16 pt-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Reviews List */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="font-display text-2xl font-bold text-ink">
                  Customer Reviews
                </h2>
                
                {productReviews.length === 0 ? (
                  <div className="p-8 bg-ivory/40 rounded-2xl border border-maroon/5 text-center">
                    <p className="text-sm text-ink-muted italic">
                      No customer reviews available yet. Be the first to share your experience.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {productReviews.map((rev) => (
                      <div key={rev.id} className="p-6 bg-white rounded-2xl border border-maroon/5 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex gap-1 text-gold">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </div>
                            <span className="text-[10px] text-ink-muted mt-1 block">
                              {new Date(rev.created_at).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-ink">{rev.name}</h4>
                        </div>
                        
                        <p className="text-xs text-ink-muted leading-relaxed">
                          {rev.comment}
                        </p>
                        
                        {rev.image_url && (
                          <div className="w-24 aspect-square bg-ivory rounded-lg overflow-hidden border border-maroon/5">
                            <img
                              src={rev.image_url}
                              alt="Customer upload"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submission Form */}
              <div className="lg:col-span-5 bg-ivory/30 border border-maroon/5 p-6 sm:p-8 rounded-3xl">
                <h3 className="font-display text-xl font-bold text-ink mb-2">Write a Review</h3>
                <p className="text-xs text-ink-muted mb-6">
                  Share your styling experience with other shoppers. Reviews are moderated and will appear once approved.
                </p>
                
                {submitSuccess ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <p className="text-xs text-green-700 font-bold">
                      Thank you! Your review has been submitted for moderation.
                    </p>
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="text-[10px] font-bold uppercase tracking-wider text-maroon mt-3 underline"
                    >
                      Submit Another Review
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {submitError && (
                      <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-100 p-3 rounded-lg">
                        {submitError}
                      </p>
                    )}
                    
                    <div>
                      <label htmlFor="review-name" className="block text-[10px] font-bold uppercase tracking-wider text-ink mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="review-name"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-white border border-maroon/10 focus:border-maroon rounded-xl px-4 py-3 text-xs text-ink outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-ink mb-1.5">
                        Rating
                      </label>
                      <div className="flex gap-1.5 text-gray-200">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= reviewRating ? "text-gold fill-current" : "text-gray-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="review-comment" className="block text-[10px] font-bold uppercase tracking-wider text-ink mb-1.5">
                        Review Message
                      </label>
                      <textarea
                        id="review-comment"
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you like or dislike about this product?"
                        className="w-full bg-white border border-maroon/10 focus:border-maroon rounded-xl px-4 py-3 text-xs text-ink outline-none resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label htmlFor="review-image" className="block text-[10px] font-bold uppercase tracking-wider text-ink mb-1.5">
                        Upload Product Image (Optional)
                      </label>
                      <input
                        type="file"
                        id="review-image"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setReviewImageFile(e.target.files[0]);
                          }
                        }}
                        className="w-full text-xs text-ink-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-maroon/5 file:text-maroon file:cursor-pointer file:hover:bg-maroon/10 border border-dashed border-maroon/20 p-3 rounded-xl bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center rounded-full maroon-gradient py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
