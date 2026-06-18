"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { Product, Category } from "@/lib/types";
import Header from "./Header";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import CartDrawer from "./CartDrawer";
import { useCart } from "@/lib/context/CartContext";

interface ShopClientProps {
  products: Product[];
  categories: Category[];
}

export default function ShopClient({ products, categories }: ShopClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>("default");

  // Read URL query parameters on mount or change
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const filterParam = searchParams.get("filter");

    if (categoryParam) {
      // Find category by slug
      const foundCat = categories.find((c) => c.slug === categoryParam);
      if (foundCat) {
        setSelectedCategory(foundCat.id);
      } else {
        setSelectedCategory("all");
      }
    } else {
      setSelectedCategory("all");
    }

    if (filterParam) {
      if (["new", "new_arrival"].includes(filterParam)) setSelectedBadge("new_arrival");
      else if (["bestseller", "bestsellers"].includes(filterParam)) setSelectedBadge("bestseller");
      else if (["trending"].includes(filterParam)) setSelectedBadge("trending");
      else if (["limited", "limited_stock"].includes(filterParam)) setSelectedBadge("limited_stock");
      else if (filterParam === "wishlist") setSelectedBadge("wishlist");
      else setSelectedBadge("all");
    } else {
      setSelectedBadge("all");
    }
  }, [searchParams, categories]);

  // Find dynamic price bounds
  const priceLimits = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 5000 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  // Initialize max price dynamically once products load
  useEffect(() => {
    if (priceLimits.max > 0) {
      setMaxPrice(priceLimits.max);
    }
  }, [priceLimits]);

  // Handle wishlist context check for custom wishlist filter
  const { wishlist } = useCart();
  function useCartContext() {
    return { wishlist };
  }

  // Filter and Sort logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Search Query Filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    // 3. Badge Filter
    if (selectedBadge !== "all") {
      if (selectedBadge === "wishlist") {
        result = result.filter((p) => wishlist.some((w) => w.id === p.id));
      } else {
        result = result.filter((p) => p.badge === selectedBadge);
      }
    }

    // 4. Availability Filter
    if (selectedAvailability !== "all") {
      result = result.filter((p) => p.status === selectedAvailability);
    }

    // 5. Price Filter
    result = result.filter((p) => p.price <= maxPrice);

    // 6. Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBadge, selectedAvailability, maxPrice, sortBy, wishlist]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBadge("all");
    setSelectedAvailability("all");
    setMaxPrice(priceLimits.max);
    setSortBy("default");
    router.push("/shop");
  };

  return (
    <>
      <Header onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-grow pt-24 bg-white min-h-screen pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="border-b border-maroon/10 pb-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-gold tracking-[0.25em]">Trends Catalog</span>
              <h1 className="font-display text-3xl font-bold text-ink mt-1">Shop Our Collection</h1>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search jewelry &amp; clothing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-maroon/10 focus:border-maroon focus:outline-none text-xs bg-ivory/50"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-ink-muted/50" />
            </div>
          </div>

          <div className="flex gap-8 items-start">
            {/* Sidebar Filters (Desktop) */}
            <aside className="hidden lg:block w-64 shrink-0 bg-ivory/30 p-6 rounded-xl border border-maroon/5 space-y-6 sticky top-28">
              <div className="flex justify-between items-center pb-3 border-b border-maroon/10">
                <h2 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-maroon" /> Filters
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-[10px] uppercase tracking-wider font-bold text-maroon hover:text-maroon-dark transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Categories</h3>
                <div className="flex flex-col space-y-2 text-xs">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`text-left py-1 hover:text-maroon font-semibold ${
                      selectedCategory === "all" ? "text-maroon pl-1.5 border-l-2 border-maroon" : "text-ink-muted"
                    }`}
                  >
                    All Collections
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`text-left py-1 hover:text-maroon font-semibold ${
                        selectedCategory === cat.id ? "text-maroon pl-1.5 border-l-2 border-maroon" : "text-ink-muted"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badges/Filters */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Featured Filters</h3>
                <div className="flex flex-col space-y-2 text-xs">
                  {[
                    { id: "all", name: "All Products" },
                    { id: "new_arrival", name: "New Arrivals" },
                    { id: "bestseller", name: "Bestsellers" },
                    { id: "trending", name: "Trending" },
                    { id: "limited_stock", name: "Limited Edition" },
                    { id: "wishlist", name: "My Wishlist" },
                  ].map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge.id)}
                      className={`text-left py-1 hover:text-maroon font-semibold ${
                        selectedBadge === badge.id ? "text-maroon pl-1.5 border-l-2 border-maroon" : "text-ink-muted"
                      }`}
                    >
                      {badge.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Max Price</h3>
                  <span className="text-xs font-bold text-maroon">&#8377;{maxPrice.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min={priceLimits.min}
                  max={priceLimits.max}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-maroon"
                />
                <div className="flex justify-between text-[10px] text-ink-muted font-bold mt-1">
                  <span>&#8377;{priceLimits.min}</span>
                  <span>&#8377;{priceLimits.max}</span>
                </div>
              </div>

              {/* Stock Availability */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Availability</h3>
                <div className="flex flex-col space-y-2 text-xs">
                  {[
                    { id: "all", name: "Any Status" },
                    { id: "in_stock", name: "In Stock" },
                    { id: "low_stock", name: "Low Stock" },
                    { id: "out_of_stock", name: "Out of Stock" },
                  ].map((status) => (
                    <button
                      key={status.id}
                      onClick={() => setSelectedAvailability(status.id)}
                      className={`text-left py-1 hover:text-maroon font-semibold ${
                        selectedAvailability === status.id ? "text-maroon pl-1.5 border-l-2 border-maroon" : "text-ink-muted"
                      }`}
                    >
                      {status.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Catalog Grid Area */}
            <div className="flex-grow">
              {/* Toolbar */}
              <div className="flex justify-between items-center gap-4 bg-ivory/30 p-3 rounded-lg border border-maroon/5 mb-6 text-xs text-ink-muted">
                <span className="font-semibold">Showing {filteredProducts.length} products</span>
                
                <div className="flex items-center gap-4">
                  {/* Mobile Filters Toggle Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-1 font-bold text-maroon hover:text-maroon-dark transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                  </button>

                  {/* Sorting dropdown */}
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-gold" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-maroon/10 focus:border-maroon focus:outline-none bg-white rounded px-2.5 py-1.5 font-semibold text-ink"
                    >
                      <option value="default">Sort: Recommended</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="newest">Sort: Newest</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-ivory/10 border border-maroon/5 rounded-xl">
                  <div className="p-4 bg-maroon/5 rounded-full mb-4">
                    <Search className="w-8 h-8 text-maroon/50" />
                  </div>
                  <h3 className="font-display text-base font-bold text-ink mb-1">No products found</h3>
                  <p className="text-xs text-ink-muted max-w-sm">We couldn&apos;t find any products matching your current filters. Try resetting them.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-6 rounded-full maroon-gradient px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      categoryName={categories.find((c) => c.id === prod.category_id)?.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden lg:hidden transition-opacity duration-300 ${
          mobileFiltersOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none bg-transparent"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          onClick={() => setMobileFiltersOpen(false)}
        />
        
        <div className="absolute inset-y-0 left-0 pr-10 max-w-full flex">
          <div className="w-screen max-w-xs bg-ivory shadow-2xl flex flex-col p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-maroon/10">
              <h2 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-maroon" /> Filters
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-ink-muted hover:text-maroon"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Categories</h3>
              <div className="flex flex-col space-y-2.5 text-xs">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setMobileFiltersOpen(false);
                  }}
                  className={`text-left py-1 font-semibold ${
                    selectedCategory === "all" ? "text-maroon pl-1.5 border-l-2 border-maroon" : "text-ink-muted"
                  }`}
                >
                  All Collections
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setMobileFiltersOpen(false);
                    }}
                    className={`text-left py-1 font-semibold ${
                      selectedCategory === cat.id ? "text-maroon pl-1.5 border-l-2 border-maroon" : "text-ink-muted"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges/Filters */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Featured Filters</h3>
              <div className="flex flex-col space-y-2.5 text-xs">
                {[
                  { id: "all", name: "All Products" },
                  { id: "new_arrival", name: "New Arrivals" },
                  { id: "bestseller", name: "Bestsellers" },
                  { id: "trending", name: "Trending" },
                  { id: "limited_stock", name: "Limited Edition" },
                  { id: "wishlist", name: "My Wishlist" },
                ].map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => {
                      setSelectedBadge(badge.id);
                      setMobileFiltersOpen(false);
                    }}
                    className={`text-left py-1 font-semibold ${
                      selectedBadge === badge.id ? "text-maroon pl-1.5 border-l-2 border-maroon" : "text-ink-muted"
                    }`}
                  >
                    {badge.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Max Price</h3>
                <span className="text-xs font-bold text-maroon">&#8377;{maxPrice}</span>
              </div>
              <input
                type="range"
                min={priceLimits.min}
                max={priceLimits.max}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-maroon"
              />
              <div className="flex justify-between text-[10px] text-ink-muted font-bold mt-1">
                <span>&#8377;{priceLimits.min}</span>
                <span>&#8377;{priceLimits.max}</span>
              </div>
            </div>

            {/* Stock Availability */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold mb-3">Availability</h3>
              <div className="flex flex-col space-y-2.5 text-xs">
                {[
                  { id: "all", name: "Any Status" },
                  { id: "in_stock", name: "In Stock" },
                  { id: "low_stock", name: "Low Stock" },
                  { id: "out_of_stock", name: "Out of Stock" },
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => {
                      setSelectedAvailability(status.id);
                      setMobileFiltersOpen(false);
                    }}
                    className={`text-left py-1 font-semibold ${
                      selectedAvailability === status.id ? "text-maroon pl-1.5 border-l-2 border-maroon" : "text-ink-muted"
                    }`}
                  >
                    {status.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                resetFilters();
                setMobileFiltersOpen(false);
              }}
              className="w-full py-2.5 rounded bg-maroon text-white text-xs font-bold uppercase tracking-widest text-center"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
