import React from "react";
import { fetchCategories } from "@/lib/actions";
import CategoryPageClient from "@/components/CategoryPageClient";

// Force dynamic rendering so server actions read fresh db.json/Supabase data on every request
export const dynamic = "force-dynamic";

export default async function ClothingPage() {
  const categories = await fetchCategories();

  return (
    <CategoryPageClient
      title="Clothing Collection"
      description="Discover our premium, comfortable, and elegant clothing collection. From carefully tailored daily cotton kurtis to stunning festive ethnic suits, Trends by Ramya brings traditional aesthetics and modern cuts to your wardrobe."
      parentType="clothing"
      categories={categories}
    />
  );
}
