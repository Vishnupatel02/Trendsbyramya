import React from "react";
import { notFound } from "next/navigation";
import { fetchProductById, fetchCategories, fetchSiteConfig, fetchReviews } from "@/lib/actions";
import ProductDetailClient from "@/components/ProductDetailClient";

// Force dynamic rendering so server actions read fresh db.json/Supabase data on every request
export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  const categories = await fetchCategories();
  const category = categories.find((c) => c.id === product.category_id);
  const siteConfig = await fetchSiteConfig();
  const reviews = await fetchReviews();

  return (
    <ProductDetailClient
      product={product}
      category={category}
      siteConfig={siteConfig}
      reviews={reviews}
    />
  );
}
