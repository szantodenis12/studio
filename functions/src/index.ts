import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {defineSecret} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

initializeApp();

export {createBooking} from "./booking.js";

// Stored in Google Secret Manager (`firebase functions:secrets:set RESEND_API_KEY`).
// Locally the emulator reads functions/.secret.local (gitignored, dummy value).
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

/** A claim on sending older than this is considered abandoned and may be retried. */
const SEND_CLAIM_TTL_MS = 10 * 60 * 1000;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** True for the placeholder used with the emulator (or an unset secret). */
function isDummyKey(key: string | undefined): boolean {
  return !key || !key.startsWith("re_") || key.includes("dummy");
}

export const onBookingStatusChange = onDocumentUpdated(
  {document: "bookings/{bookingId}", secrets: [RESEND_API_KEY]},
  async (event) => {
    if (!event.data) return null;

    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Trigger only when status changes to 'Confirmed'
    if (beforeData?.status === "Confirmed" || afterData?.status !== "Confirmed") return null;

    // Idempotency #1: never send twice for the same booking.
    if (afterData.emailSent === true) {
      logger.info(`Rezervarea ${event.params.bookingId}: email deja trimis, se ignoră.`);
      return null;
    }

    const guestEmail = afterData.email;
    const guestName = afterData.fullName || "Stimate oaspete";

    if (!guestEmail) {
      logger.warn(`Rezervarea ${event.params.bookingId} nu are email.`);
      return null;
    }

    // Idempotency #2: claim the send in a transaction so concurrent/retried
    // invocations (status toggled quickly, at-least-once delivery) can't both send.
    const ref = event.data.after.ref;
    const claimed = await getFirestore().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data();
      if (!data || data.emailSent === true) return false;
      const claimedAt = data.emailSendingAt?.toMillis?.() ?? 0;
      if (claimedAt && Date.now() - claimedAt < SEND_CLAIM_TTL_MS) return false;
      tx.update(ref, {emailSendingAt: FieldValue.serverTimestamp()});
      return true;
    });
    if (!claimed) {
      logger.info(`Rezervarea ${event.params.bookingId}: trimiterea este deja în curs, se ignoră.`);
      return null;
    }

    try {
      // Robust helper to convert various Firestore field types to a JS Date
      const toDate = (val: any): Date | null => {
        if (!val) return null;
        if (typeof val.toDate === "function") return val.toDate();
        if (val instanceof Date) return val;
        if (typeof val.seconds === "number") return new Date(val.seconds * 1000);
        return null;
      };

      const dateOptions: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Europe/Bucharest", // Pin to hotel local time
      };

      const checkInDateObj = toDate(afterData.checkIn);
      const checkOutDateObj = toDate(afterData.checkOut);

      const checkInDate = checkInDateObj ?
        checkInDateObj.toLocaleDateString("ro-RO", dateOptions) : "N/A";
      const checkOutDate = checkOutDateObj ?
        checkOutDateObj.toLocaleDateString("ro-RO", dateOptions) : "N/A";

      // Human-readable room name as edited in admin; falls back to the key.
      let roomName = String(afterData.roomType || "Standard");
      try {
        const roomSnap = await getFirestore().collection("rooms").doc(roomName).get();
        const title = roomSnap.data()?.details?.ro?.title;
        if (typeof title === "string" && title.trim()) roomName = title.trim();
      } catch (err) {
        logger.warn("Nu s-a putut citi numele camerei pentru email.", err);
      }

      const guestsCount = Number(afterData.guests);
      const guestsLabel = Number.isFinite(guestsCount) && guestsCount > 0 ?
        `${guestsCount} ${guestsCount === 1 ? "persoană" : "persoane"}` : "";

      const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
              <h2 style="color: #c5a059; text-align: center;">Confirmare Rezervare</h2>
              <p>Bună ziua, <strong>${escapeHtml(guestName)}</strong>,</p>
              <p>Suntem încântați să vă confirmăm rezervarea la <strong>Hotel Maxim</strong>.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;">Check-in:</td><td style="padding: 8px; border: 1px solid #ddd;">${checkInDate}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;">Check-out:</td><td style="padding: 8px; border: 1px solid #ddd;">${checkOutDate}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;">Tip Cameră:</td><td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(roomName)}</td></tr>
                ${guestsLabel ? `<tr><td style="padding: 8px; border: 1px solid #ddd;">Număr persoane:</td><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${escapeHtml(guestsLabel)}</td></tr>` : ""}
                <tr><td style="padding: 8px; border: 1px solid #ddd;">Total:</td><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${escapeHtml(afterData.totalPrice)} RON</td></tr>
              </table>
              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeeba; margin-top: 20px;">
                <p style="margin: 0 0 10px 0;"><strong>Plata se va efectua direct la hotel la sosire.</strong></p>
                ${guestsLabel ? `<p style="margin: 0 0 10px 0; font-size: 0.9em; color: #856404;">* Rezervarea este valabilă pentru <strong>${escapeHtml(guestsLabel)}</strong>. Persoanele suplimentare nu pot fi cazate fără acordul prealabil al recepției.</p>` : ""}
                <p style="margin: 0; font-size: 0.9em; color: #856404;">* Mențiune: Prețurile afișate nu includ taxa locală de 3%. Aceasta se va calcula și plăti separat la recepție în momentul check-in-ului.</p>
              </div>
              <p style="margin-top: 25px;">Vă așteptăm cu drag!</p>
            </div>`;

      const apiKey = RESEND_API_KEY.value();
      if (isDummyKey(apiKey)) {
        // Emulator / misconfiguration: log only, never call Resend.
        logger.info(`[email dezactivat - cheie de test] Confirmare către ${guestEmail} pentru ${event.params.bookingId}`);
      } else {
        // Loaded lazily: keeps cold starts (and emulator discovery) fast.
        const {Resend} = await import("resend");
        const resend = new Resend(apiKey);
        const {error} = await resend.emails.send(
          {
            from: "Hotel Maxim <rezervari@hotel-maxim.ro>",
            to: [guestEmail],
            subject: "Rezervarea ta la Hotel Maxim este confirmată!",
            html,
          },
          // Resend de-duplicates sends with the same key for 24h.
          {idempotencyKey: `booking-confirmed/${event.params.bookingId}`},
        );
        if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
        logger.info(`Email trimis către ${guestEmail}`);
      }

      await ref.update({
        emailSent: true,
        emailSentAt: new Date(),
        emailSendingAt: FieldValue.delete(),
      });
    } catch (error) {
      logger.error("Eroare email:", error);
      // Release the claim so a later status change can retry.
      await ref.update({emailSendingAt: FieldValue.delete()}).catch(() => undefined);
    }
    return null;
  }
);
