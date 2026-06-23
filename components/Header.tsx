"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Heart, Instagram } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { fetchSiteConfig, fetchCategories } from "@/lib/actions";
import { SiteConfig, Category } from "@/lib/types";

interface HeaderProps {
  onCartClick?: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlist } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    whatsapp_number: "+91 97052 82684",
    email_address: "ramyajangili221@gmail.com",
    instagram_url: "https://www.instagram.com/trends_by_ramya",
  });
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await fetchSiteConfig();
        if (config) setSiteConfig(config);
        
        const allCats = await fetchCategories();
        const parents = allCats.filter(c => c.parent_type === "root");
        setParentCategories(parents);
      } catch (err) {
        console.error("Failed to load header site config:", err);
      }
    }
    loadConfig();

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const defaultCartClick = () => {
    router.push("/cart");
  };

  const activeCartClick = onCartClick || defaultCartClick;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? "glass-header shadow-md py-1.5 md:py-2" 
          : "bg-ivory/60 backdrop-blur-md md:bg-transparent py-2.5 md:py-4 border-b border-maroon/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-2 md:gap-0">
        {/* Main Header Top Row (Logo, Navigation on desktop, Action Icons) */}
        <div className="flex items-center justify-between w-full">
          {/* Logo Branding */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo.jpg"
              alt="Trends by Ramya Logo"
              className="h-10 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Menu (NO DROPDOWNS) */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-xs font-bold uppercase tracking-widest hover:text-maroon transition-colors ${
                pathname === "/" ? "text-maroon border-b border-maroon/20 pb-0.5" : "text-ink-muted"
              }`}
            >
              Home
            </Link>

            <Link
              href="/#categories"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-xs font-bold uppercase tracking-widest hover:text-maroon transition-colors text-ink-muted"
            >
              Categories
            </Link>

            {parentCategories
              .filter((cat) => cat.slug !== "handmade" && cat.slug !== "cat-handmade")
              .map((cat) => {
                const href = ["jewellery", "clothing"].includes(cat.slug) 
                  ? `/${cat.slug}` 
                  : `/shop?category=${cat.slug}`;
                const isActive = pathname === href || (href.startsWith("/shop") && pathname.includes(`category=${cat.slug}`));
                return (
                  <Link
                    key={cat.id}
                    href={href}
                    className={`text-xs font-bold uppercase tracking-widest hover:text-maroon transition-colors ${
                      isActive ? "text-maroon border-b border-maroon/20 pb-0.5" : "text-ink-muted"
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}

            <Link
              href="/shop?filter=new_arrival"
              className={`text-xs font-bold uppercase tracking-widest hover:text-maroon transition-colors ${
                pathname.includes("filter=new_arrival") ? "text-maroon border-b border-maroon/20 pb-0.5" : "text-ink-muted"
              }`}
            >
              New Arrivals
            </Link>

            <Link
              href="/about"
              className={`text-xs font-bold uppercase tracking-widest hover:text-maroon transition-colors ${
                pathname === "/about" ? "text-maroon border-b border-maroon/20 pb-0.5" : "text-ink-muted"
              }`}
            >
              About Us
            </Link>

            <Link
              href="/contact"
              className={`text-xs font-bold uppercase tracking-widest hover:text-maroon transition-colors ${
                pathname === "/contact" ? "text-maroon border-b border-maroon/20 pb-0.5" : "text-ink-muted"
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/shop?filter=wishlist"
              className="relative p-2 text-ink hover:text-maroon transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-maroon text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={activeCartClick}
              className="relative p-2 text-ink hover:text-maroon transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-ink text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Instagram Link */}
            <a
              href={siteConfig.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-ink hover:text-maroon transition-colors"
              aria-label="Instagram Link"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Mobile Horizontal Swipe Navigation Bar (Directly below Logo/Icons row) */}
        <nav className="md:hidden flex items-center overflow-x-auto whitespace-nowrap scrollbar-none py-2 border-t border-maroon/5 gap-6 scroll-smooth select-none touch-pan-x bg-white rounded-lg px-3 my-1 border border-maroon/10 shadow-sm">
          <Link
            href="/"
            className={`text-xs font-bold uppercase tracking-wider transition-colors py-1.5 px-0.5 ${
              pathname === "/" 
                ? "text-maroon border-b-2 border-maroon pb-0.5" 
                : "text-ink-muted"
            }`}
          >
            Home
          </Link>

          <Link
            href="/#categories"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className={`text-xs font-bold uppercase tracking-wider transition-colors py-1.5 px-0.5 ${
              pathname === "/#categories" || (pathname === "/" && typeof window !== "undefined" && window.location.hash === "#categories")
                ? "text-maroon border-b-2 border-maroon pb-0.5" 
                : "text-ink-muted"
            }`}
          >
            Categories
          </Link>

          {parentCategories
            .filter((cat) => cat.slug !== "handmade" && cat.slug !== "cat-handmade")
            .map((cat) => {
              const href = ["jewellery", "clothing"].includes(cat.slug) 
                ? `/${cat.slug}` 
                : `/shop?category=${cat.slug}`;
              const isActive = pathname === href || (href.startsWith("/shop") && pathname.includes(`category=${cat.slug}`));
              return (
                <Link
                  key={cat.id}
                  href={href}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors py-1.5 px-0.5 ${
                    isActive 
                      ? "text-maroon border-b-2 border-maroon pb-0.5" 
                      : "text-ink-muted"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}

          <Link
            href="/shop?filter=new_arrival"
            className={`text-xs font-bold uppercase tracking-wider transition-colors py-1.5 px-0.5 ${
              pathname.includes("filter=new_arrival") 
                ? "text-maroon border-b-2 border-maroon pb-0.5" 
                : "text-ink-muted"
            }`}
          >
            New Arrivals
          </Link>

          <Link
            href="/about"
            className={`text-xs font-bold uppercase tracking-wider transition-colors py-1.5 px-0.5 ${
              pathname === "/about" 
                ? "text-maroon border-b-2 border-maroon pb-0.5" 
                : "text-ink-muted"
            }`}
          >
            About Us
          </Link>

          <Link
            href="/contact"
            className={`text-xs font-bold uppercase tracking-wider transition-colors py-1.5 px-0.5 ${
              pathname === "/contact" 
                ? "text-maroon border-b-2 border-maroon pb-0.5" 
                : "text-ink-muted"
            }`}
          >
            Contact Us
          </Link>
        </nav>
      </div>
    </header>
  );
}
