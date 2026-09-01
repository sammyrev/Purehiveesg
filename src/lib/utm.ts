const STORAGE_KEY = "purehive_utm";

export type StoredUtm = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

export function captureUtmParams(): StoredUtm {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const stored: StoredUtm = {};

  if (params.get("utm_source")) stored.utmSource = params.get("utm_source") ?? undefined;
  if (params.get("utm_medium")) stored.utmMedium = params.get("utm_medium") ?? undefined;
  if (params.get("utm_campaign")) stored.utmCampaign = params.get("utm_campaign") ?? undefined;
  if (params.get("utm_content")) stored.utmContent = params.get("utm_content") ?? undefined;
  if (params.get("utm_term")) stored.utmTerm = params.get("utm_term") ?? undefined;

  if (Object.keys(stored).length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return stored;
  }

  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing) as StoredUtm;
    } catch {
      return {};
    }
  }

  return {};
}

export function getStoredUtm(): StoredUtm {
  if (typeof window === "undefined") {
    return {};
  }

  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (!existing) {
    return {};
  }

  try {
    return JSON.parse(existing) as StoredUtm;
  } catch {
    return {};
  }
}
