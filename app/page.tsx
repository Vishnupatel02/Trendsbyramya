import React from "react";
import { fetchProducts, fetchCategories, fetchInstagramFeed, fetchSiteConfig, fetchReviews } from "@/lib/actions";
import HomeClient from "@/components/HomeClient";

// Force dynamic rendering so server actions read fresh db.json/Supabase data on every request
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch data on the server side
  const products = await fetchProducts();
  const categories = await fetchCategories();
  const instagramFeed = await fetchInstagramFeed();
  const siteConfig = await fetchSiteConfig();
  const reviews = await fetchReviews();

  return (
    <HomeClient
      products={products}
      categories={categories}
      instagramFeed={instagramFeed}
      siteConfig={siteConfig}
      reviews={reviews}
    />
  );
}
