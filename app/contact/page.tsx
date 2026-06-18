import React from "react";
import ContactClient from "@/components/ContactClient";

// Force dynamic rendering so server actions read fresh db.json/Supabase data on every request
export const dynamic = "force-dynamic";

export default function ContactPage() {
  return <ContactClient />;
}
