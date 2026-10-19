// Tracking helpers — hotel-maxim.ro
// Toate evenimentele merg în dataLayer; GTM decide ce trimite către Google Ads, GA4 și Meta.
// Nu se trimit date personale (nume, email, telefon) în dataLayer.

export type LeadForm = "rezervare" | "contact";

type DataLayerEvent = Record<string, unknown>;

declare global {
  interface Window {
    // Same shape as the declaration in @next/third-parties (TS requires identical modifiers).
    dataLayer?: Object[];
    gtag?: (...args: unknown[]) => void;
  }
}

function push(event: DataLayerEvent) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

function newEventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * Se apelează DOAR după ce trimiterea a reușit (după `await` fără eroare),
 * nu la click pe buton și nu la validarea câmpurilor.
 *
 * `event_id` se folosește ca ID de tranzacție în Google Ads și ca eventID în Meta,
 * ca o rezervare să nu fie numărată de două ori.
 */
export function trackLead(
  form: LeadForm,
  details: {
    locale?: "ro" | "en";
    room_type?: string;
    guests?: string | number;
    nights?: number;
    request_id?: string;
  } = {},
) {
  const { locale, request_id, ...rest } = details;
  push({
    event: "lead_submit",
    form_name: form,
    page_language: locale ?? (document.documentElement.lang?.startsWith("en") ? "en" : "ro"),
    event_id: request_id ?? newEventId(),
    ...rest,
  });
}

// ---- Consimțământ (Consent Mode v2) ----
// Păstrăm cheia și valorile pe care bannerul existent le folosește deja.

export const CONSENT_KEY = "cookie_consent_status";
export type ConsentStatus = "accepted" | "declined";

export function applyConsent(status: ConsentStatus) {
  const v = status === "accepted" ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  });
  if (status === "accepted") push({ event: "consent_granted" });
}
