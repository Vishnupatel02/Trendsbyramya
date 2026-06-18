import React from "react";
import { fetchCategories } from "@/lib/actions";
import CategoryPageClient from "@/components/CategoryPageClient";

// Force dynamic rendering so server actions read fresh db.json/Supabase data on every request
export const dynamic = "force-dynamic";

export default async function JewelleryPage() {
  const categories = await fetchCategories();

  return (
    <CategoryPageClient
      title="Jewellery Collection"
      description="Explore our exquisite selection of handcrafted jewellery, featuring customized blackbeads collection, traditional temple sets, elegant necklaces, bracelets, and beautiful earrings. Each piece is designed to reflect timeless grace and detailed craftsmanship."
      parentType="jewellery"
      categories={categories}
    />
  );
}
