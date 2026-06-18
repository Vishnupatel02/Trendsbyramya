import React from "react";
import AboutClient from "@/components/AboutClient";

// Force dynamic rendering so server actions read fresh db.json/Supabase data on every request
export const dynamic = "force-dynamic";

export default function AboutPage() {
  return <AboutClient />;
}
