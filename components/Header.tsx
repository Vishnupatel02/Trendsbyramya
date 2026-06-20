"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Heart, Menu, X, Instagram } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const defaultCartClick = () => {
    router.push("/cart");
  };

  const activeCartClick = onCartClick || defaultCartClick;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "glass-header shadow-md py-2" : "bg-transparent py-4 border-b border-maroon/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-ink hover:text-maroon transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo Branding */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo.jpg"
              alt="Trends by Ramya Logo"
              className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
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

            {parentCategories.map((cat) => {
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
      </header>

      {/* Mobile Menu Panel */}
      <div
        className={`fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-ivory shadow-2xl p-6 transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8 border-b border-maroon/10 pb-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <img
                src="/logo.jpg"
                alt="Trends by Ramya Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-ink-muted hover:text-maroon transition-colors"
              aria-label="Close Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-ink hover:text-maroon py-1 border-b border-maroon/5"
            >
              Home
            </Link>

            {parentCategories.map((cat) => {
              const href = ["jewellery", "clothing"].includes(cat.slug) 
                ? `/${cat.slug}` 
                : `/shop?category=${cat.slug}`;
              return (
                <Link
                  key={cat.id}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold uppercase tracking-wider text-ink hover:text-maroon py-1 border-b border-maroon/5"
                >
                  {cat.name}
                </Link>
              );
            })}

            <Link
              href="/shop?filter=new_arrival"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-ink hover:text-maroon py-1 border-b border-maroon/5"
            >
              New Arrivals
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-ink hover:text-maroon py-1 border-b border-maroon/5"
            >
              About Us
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold uppercase tracking-wider text-ink hover:text-maroon py-1 border-b border-maroon/5"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
