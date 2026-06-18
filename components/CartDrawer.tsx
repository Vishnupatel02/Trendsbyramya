"use client";

import React from "react";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, Heart } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, toggleWishlist, isInWishlist, cartTotal, cartCount } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div
          className={`w-screen max-w-md bg-ivory shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0`}
        >
          {/* Header */}
          <div className="p-6 border-b border-maroon/10 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-maroon" /> Shopping Cart ({cartCount})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-ink-muted hover:text-maroon transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <div className="p-4 bg-maroon/5 rounded-full mb-4">
                  <ShoppingBag className="w-8 h-8 text-maroon/60" />
                </div>
                <p className="text-sm font-semibold text-ink-muted">Your cart is empty</p>
                <p className="text-xs text-ink-muted/60 mt-1">Add items to your cart to see them here.</p>
                <button
                  onClick={onClose}
                  className="mt-6 inline-flex rounded-full gold-gradient px-6 py-2 text-xs font-bold uppercase tracking-widest text-ink shadow-md"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const wishlisted = isInWishlist(item.product.id);
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 bg-white rounded-lg border border-maroon/5 shadow-sm"
                  >
                    {/* Item Image */}
                    <div className="w-20 aspect-[3/4] bg-ivory rounded overflow-hidden shrink-0">
                      <img
                        src={item.product.images[0] || "https://images.unsplash.com/photo-1617032213178-1b887b1b3b0e?w=800&q=80"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between gap-1 items-start">
                          <h3 className="text-xs font-bold text-ink line-clamp-1">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-rose-600 p-0.5"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-maroon font-bold mt-1">
                          &#8377;{item.product.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-gray-200 rounded-full bg-ivory p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:text-maroon transition-colors rounded-full hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-2.5 text-ink">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:text-maroon transition-colors rounded-full hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Move to Wishlist */}
                        <button
                          onClick={() => toggleWishlist(item.product)}
                          className={`flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase ${
                            wishlisted ? "text-maroon" : "text-ink-muted hover:text-maroon"
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${wishlisted ? "fill-current" : ""}`} />
                          {wishlisted ? "Wishlisted" : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer summary */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-maroon/10 space-y-4">
              <div className="flex justify-between items-center text-ink">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Subtotal</span>
                <span className="font-display text-xl font-bold text-maroon">
                  &#8377;{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[10px] text-ink-muted/70 text-center leading-relaxed">
                Taxes and shipping details will be discussed during the WhatsApp consultation.
              </p>

              <div className="flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-center w-full rounded-full maroon-gradient py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:shadow-lg transition-all"
                >
                  View Cart & Enquiry
                </Link>
                <button
                  onClick={onClose}
                  className="w-full text-center text-xs font-semibold text-ink-muted hover:text-maroon py-1.5 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
