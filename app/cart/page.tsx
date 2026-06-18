"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Heart, Plus, Minus, MessageSquare, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { fetchSiteConfig } from "@/lib/actions";
import { SiteConfig } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CartPage() {
  const { cart, wishlist, removeFromCart, updateQuantity, toggleWishlist, addToCart, cartTotal, cartCount } = useCart();
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
        console.error("Failed to load cart site config:", err);
      }
    }
    loadConfig();
  }, []);

  const cleanPhone = siteConfig.whatsapp_number.replace(/[^0-9+]/g, "");

  // Generate WhatsApp message template
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    let productListText = "";
    cart.forEach((item) => {
      productListText += `- ${item.product.name} (Qty: ${item.quantity})\n`;
    });

    const messageTemplate = `Hello Trends by Ramya,\n\nI am interested in the following products:\n\n${productListText}\nPlease share availability and ordering details.\n\nThank you.`;
    const encodedMessage = encodeURIComponent(messageTemplate);
    
    // Open WhatsApp in new tab
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <>
      <Header onCartClick={() => setCartOpen(true)} />
      
      {/* Drawer can still be triggered */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md bg-ivory shadow-2xl p-6 flex flex-col justify-center items-center text-center">
              <ShoppingBag className="w-12 h-12 text-maroon mb-4" />
              <p className="font-semibold text-ink">You are already viewing the Cart Page</p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-6 rounded-full maroon-gradient px-6 py-2 text-xs font-bold uppercase tracking-widest text-white"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow pt-24 bg-white min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-maroon/10 pb-6 mb-8">
            <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Your Selection</span>
            <h1 className="font-display text-3xl font-bold text-ink mt-1">Shopping Cart</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-ivory/10 border border-maroon/5 rounded-xl">
                  <div className="p-4 bg-maroon/5 rounded-full mb-4">
                    <ShoppingBag className="w-8 h-8 text-maroon/50" />
                  </div>
                  <h3 className="font-display text-base font-bold text-ink mb-1">Your cart is empty</h3>
                  <p className="text-xs text-ink-muted">Add items to your cart to see them here.</p>
                  <Link
                    href="/shop"
                    className="mt-6 inline-flex rounded-full gold-gradient px-8 py-3 text-xs font-bold uppercase tracking-widest text-ink shadow-md"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 bg-ivory/20 rounded-xl border border-maroon/5 shadow-sm"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 aspect-[3/4] bg-ivory rounded-lg overflow-hidden shrink-0 mx-auto sm:mx-0">
                      <img
                        src={item.product.images[0] || "https://images.unsplash.com/photo-1617032213178-1b887b1b3b0e?w=800&q=80"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details & Operations */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-display text-base font-bold text-ink leading-snug">
                            {item.product.name}
                          </h3>
                          <span className="text-[10px] uppercase font-bold text-gold tracking-wider block mt-1">
                            SKU: {item.product.id}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-rose-600 p-1.5 transition-colors border border-gray-100 hover:border-rose-100 rounded-full bg-white"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-6">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-gray-200 rounded-full bg-white p-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:text-maroon transition-colors rounded-full hover:bg-gray-150"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold px-4 text-ink">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:text-maroon transition-colors rounded-full hover:bg-gray-150"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price Calculations */}
                        <div className="text-right">
                          <p className="text-[10px] text-ink-muted font-semibold">
                            &#8377;{item.product.price.toLocaleString("en-IN")} each
                          </p>
                          <p className="font-display text-base font-bold text-maroon mt-0.5">
                            &#8377;{(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Wishlist Section */}
              {wishlist.length > 0 && (
                <div className="pt-10">
                  <h2 className="font-display text-xl font-bold text-ink border-b border-maroon/10 pb-3 mb-6">
                    Saved in Wishlist
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex gap-4 p-3 bg-white rounded-lg border border-maroon/5 shadow-sm"
                      >
                        <div className="w-16 aspect-[3/4] bg-ivory rounded overflow-hidden shrink-0">
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-ink line-clamp-1">{prod.name}</h3>
                            <p className="text-xs text-maroon font-bold mt-1">&#8377;{prod.price}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                addToCart(prod);
                                toggleWishlist(prod); // Remove from wishlist after adding to cart
                              }}
                              className="text-[10px] font-bold uppercase tracking-wider text-white bg-maroon hover:bg-maroon-dark px-3 py-1.5 rounded transition-colors"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={() => toggleWishlist(prod)}
                              className="text-[10px] font-bold uppercase tracking-wider text-ink-muted hover:text-rose-600 px-3 py-1.5 rounded transition-colors border border-gray-200"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Enquiry Box (lg:col-span-4) */}
            {cart.length > 0 && (
              <div className="lg:col-span-4 bg-ivory/50 p-6 rounded-2xl border border-maroon/5 shadow-sm sticky top-28 space-y-6">
                <h3 className="font-display text-lg font-bold text-ink border-b border-maroon/10 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-ink-muted font-semibold">Total Items</span>
                    <span className="font-bold text-ink">{cartCount} items</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-ink-muted font-semibold">Shipping Cost</span>
                    <span className="font-bold text-ink text-[10px] uppercase text-gold">Calculated Later</span>
                  </div>
                  <div className="border-t border-maroon/10 pt-4 flex justify-between items-center text-ink">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Total Price</span>
                    <span className="font-display text-xl font-bold text-maroon">
                      &#8377;{cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full flex items-center justify-center gap-2 rounded-full border border-green-200 bg-green-50 hover:bg-green-100 py-4 text-xs font-bold uppercase tracking-widest text-green-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" /> Enquire on WhatsApp
                  </button>
                  <p className="text-[10px] text-ink-muted/70 text-center leading-relaxed mt-4">
                    Clicking the button will open a WhatsApp window to +91 97052 82684 with a pre-filled list of your items to complete the order inquiry.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
