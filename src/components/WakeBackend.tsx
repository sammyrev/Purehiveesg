"use client";

import { useEffect } from "react";
import { apiUrl } from "@/lib/api";

const healthUrl = `${apiUrl}/health`;
const maxAttempts = 3;
const retryDelayMs = 4000;

export function WakeBackend() {
  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        if (cancelled) return;

        try {
          const response = await fetch(healthUrl, { cache: "no-store" });
          if (response.ok) return;
        } catch {
          // Render cold starts often fail the first request.
        }

        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
    };

    void ping();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
