"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/context/CartContext";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export default function ProductCard({ product, categoryName = "Jewellery" }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);

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
    <div className="group relative flex flex-col rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-maroon/5">
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

        {/* Price & Add to Cart button */}
        <div className="mt-auto flex flex-col gap-3">
          <p className="font-display text-lg font-bold text-maroon">
            &#8377;{product.price.toLocaleString("en-IN")}
          </p>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product.status !== "out_of_stock") {
                addToCart(product);
              }
            }}
            disabled={product.status === "out_of_stock"}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold uppercase tracking-widest shadow-sm transition-all duration-300 ${
              product.status === "out_of_stock"
                ? "bg-gray-150 text-gray-400 cursor-not-allowed border border-gray-200"
                : "maroon-gradient text-white hover:shadow-md hover:scale-[1.02] cursor-pointer"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {product.status === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
