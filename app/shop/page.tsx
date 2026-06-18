import React from "react";
import { fetchProducts, fetchCategories } from "@/lib/actions";
import ShopClient from "@/components/ShopClient";

// Force dynamic rendering so server actions read fresh db.json/Supabase data on every request
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await fetchProducts();
  const categories = await fetchCategories();

  return <ShopClient products={products} categories={categories} />;
}
