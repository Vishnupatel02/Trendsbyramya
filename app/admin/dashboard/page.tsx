import React from "react";
import { redirect } from "next/navigation";
import { checkAdminAuth, fetchProducts, fetchCategories, fetchSiteConfig, fetchInstagramFeed, fetchReviews, fetchContactEnquiries, fetchWebsiteVisits } from "@/lib/actions";
import DashboardClient from "@/components/DashboardClient";

// Force dynamic server validation on dashboard entries
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const isAuth = await checkAdminAuth();

  if (!isAuth) {
    redirect("/admin/login");
  }

  // Load fresh catalog data for the control panel
  const products = await fetchProducts();
  const categories = await fetchCategories();
  const siteConfig = await fetchSiteConfig();
  const instagramFeed = await fetchInstagramFeed();
  const reviews = await fetchReviews();
  const enquiries = await fetchContactEnquiries();
  const visitsData = await fetchWebsiteVisits();

  return (
    <DashboardClient
      initialProducts={products}
      initialCategories={categories}
      initialSiteConfig={siteConfig}
      initialInstagramFeed={instagramFeed}
      initialReviews={reviews}
      initialEnquiries={enquiries}
      initialVisitsData={visitsData}
    />
  );
}
