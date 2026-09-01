"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@/lib/utm";

/** Captures UTM campaign params from the URL for application submissions. */
export function UtmCapture() {
  useEffect(() => {
    captureUtmParams();
  }, []);

  return null;
}
