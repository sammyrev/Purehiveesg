/** Google Analytics 4 — hardcoded measurement ID (no env required). */
export const GA_MEASUREMENT_ID = "G-CLTDQX80EL";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, params ?? {});
}

export function trackFoundingPartnerClick(location: string): void {
  trackEvent("founding_partner_cta_click", { location });
}

export function trackFormStart(): void {
  trackEvent("application_form_start");
}

export function trackInitialSubmission(): void {
  trackEvent("application_form_submit_initial");
}

export function trackDetailsSubmission(): void {
  trackEvent("application_form_submit_details");
}
