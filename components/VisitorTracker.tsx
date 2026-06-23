"use client";

import { useEffect } from "react";
import { recordVisitAction } from "@/lib/actions";

export default function VisitorTracker() {
  useEffect(() => {
    async function trackVisit() {
      if (typeof window === "undefined") return;

      try {
        const STORAGE_KEY = "trends_visitor_id";
        let visitorId = localStorage.getItem(STORAGE_KEY);
        
        if (visitorId) {
          return;
        }

        visitorId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, visitorId);

        await recordVisitAction(visitorId);
      } catch (err) {
        console.error("Visitor tracking error:", err);
      }
    }

    trackVisit();
  }, []);

  return null;
}
