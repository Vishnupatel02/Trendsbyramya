"use client";

import { useEffect } from "react";
import { recordVisitAction } from "@/lib/actions";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback to RFC4122 version 4 compliant pseudo-random UUID generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

        visitorId = generateUUID();
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
