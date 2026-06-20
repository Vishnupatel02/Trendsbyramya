"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  whatsappNumber?: string;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function ProductCard({ product, categoryName = "Jewellery", whatsappNumber }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);
  
  const cleanPhone = (whatsappNumber || "+91 97052 82684").replace(/[^0-9+]/g, "");
  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/product/${product.id}` : "";
  const whatsappText = `Hello Trends by Ramya,\n\nI am interested in ordering this product:\n\n- Name: ${product.name}\n- Price: ₹${product.price.toLocaleString("en-IN")}\n- Link: ${productUrl}\n\nPlease guide me through the checkout.`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`;

  // Format stock status label
  const getStockStatus = () => {
    switch (product.status) {
      case "in_stock":
        return { text: "In Stock", color: "text-green-600 bg-green-50" };
      case "low_stock":
        return { text: "Low Stock", color: "text-amber-600 bg-amber-50" };
      case "out_of_stock":
        return { text: "Out of Stock", color: "text-rose-600 bg-rose-50" };
      default:
        return { text: "In Stock", color: "text-green-600 bg-green-50" };
    }
  };

  // Format badge text
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

  const badge = getBadge();
  const stockInfo = getStockStatus();

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white overflow-hidden border border-maroon/5 shadow-[0_8px_32px_rgba(122,31,43,0.012)] hover:shadow-[0_20px_48px_rgba(122,31,43,0.04)] hover:border-maroon/10 hover:-translate-y-1 transition-all duration-700 ease-out">
      {/* Product Image Wrapper */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ivory image-zoom-trigger">
        {/* Badge Overlay */}
        {badge && (
          <span className={`absolute top-3 left-3 z-10 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest shadow-sm ${badge.style}`}>
            {badge.text}
          </span>
        )}

        {/* Wishlist Button Overlay */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all duration-300 ${
            wishlisted
              ? "bg-maroon text-white"
              : "bg-white/80 text-ink-muted hover:bg-maroon hover:text-white"
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Main Product Link & Image */}
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1617032213178-1b887b1b3b0e?w=800&q=80"}
            alt={product.name}
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Description details */}
      <div className="flex flex-col flex-grow p-4">
        {/* Category & Stock Status */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold">
            {categoryName}
          </span>
          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${stockInfo.color}`}>
            {stockInfo.text}
          </span>
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.id}`} className="block mb-2 group-hover:text-maroon transition-colors">
          <h3 className="font-display text-base font-semibold leading-tight text-ink line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price & Action Buttons */}
        <div className="mt-auto flex flex-col gap-3">
          <p className="font-display text-lg font-bold text-maroon">
            &#8377;{product.price.toLocaleString("en-IN")}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.status !== "out_of_stock") {
                  addToCart(product);
                }
              }}
              disabled={product.status === "out_of_stock"}
              className={`w-full sm:flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ease-out ${
                product.status === "out_of_stock"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "maroon-gradient text-white hover:shadow-[0_10px_24px_rgba(122,31,43,0.12)] hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {product.status === "out_of_stock" ? "Out" : "Add to Cart"}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-full sm:flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider border border-green-500 bg-white/85 text-green-600 hover:bg-green-50/70 hover:shadow-[0_10px_24px_rgba(34,197,94,0.08)] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-500 ease-out cursor-pointer text-center"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-current flex-shrink-0" />
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
