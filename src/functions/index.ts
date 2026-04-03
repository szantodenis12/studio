import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {Resend} from "resend";

initializeApp();

const RESEND_API_KEY = "re_gaFVNFuJ_DfSfLzbV42EGMEtpDudWdSvQ";

export const onBookingStatusChange = onDocumentUpdated(
  "bookings/{bookingId}",
  async (event) => {
    if (!event.data) return null;

    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    if (beforeData?.status !== "Confirmed" && afterData?.status === "Confirmed") {
      const guestEmail = afterData.email;
      const guestName = afterData.fullName || "Stimate oaspete";

      if (!guestEmail) {
        logger.warn(`Rezervarea ${event.params.bookingId} nu are email.`);
        return null;
      }

      const resend = new Resend(RESEND_API_KEY);

      try {
        // FIX FOR DATE SHIFT: Force formatting using the Europe/Bucharest timezone
        const dateOptions: Intl.DateTimeFormatOptions = {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Europe/Bucharest",
        };

        const checkInDate = afterData.checkIn && typeof afterData.checkIn.toDate === "function" ?
          afterData.checkIn.toDate().toLocaleDateString("ro-RO", dateOptions) : "N/A";
        const checkOutDate = afterData.checkOut && typeof afterData.checkOut.toDate === "function" ?
          afterData.checkOut.toDate().toLocaleDateString("ro-RO", dateOptions) : "N/A";

        await resend.emails.send({
          from: "Hotel Maxim <rezervari@hotel-maxim.ro>",
          to: [guestEmail],
          subject: "Rezervarea ta la Hotel Maxim este confirmată!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
              <h2 style="color: #c5a059; text-align: center;">Confirmare Rezervare</h2>
              <p>Bună ziua, <strong>${guestName}</strong>,</p>
              <p>Suntem încântați să vă confirmăm rezervarea la <strong>Hotel Maxim</strong>.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;">Check-in:</td><td style="padding: 8px; border: 1px solid #ddd;">${checkInDate}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;">Check-out:</td><td style="padding: 8px; border: 1px solid #ddd;">${checkOutDate}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;">Tip Cameră:</td><td style="padding: 8px; border: 1px solid #ddd;">${afterData.roomType || "Standard"}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;">Total:</td><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${afterData.totalPrice} RON</td></tr>
              </table>
              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeeba; margin-top: 20px;">
                <p style="margin: 0 0 10px 0;"><strong>Plata se va efectua direct la hotel la sosire.</strong></p>
                <p style="margin: 0; font-size: 0.9em; color: #856404;">* Mențiune: Prețurile afișate nu includ taxa locală de 3%. Aceasta se va calcula și plăti separat la recepție în momentul check-in-ului.</p>
              </div>
              <p style="margin-top: 25px;">Vă așteptăm cu drag!</p>
            </div>`,
        });

        logger.info(`Email trimis către ${guestEmail}`);
        return event.data.after.ref.update({
          emailSent: true,
          emailSentAt: new Date(),
        });
      } catch (error) {
        logger.error("Eroare email:", error);
      }
    }
    return null;
  }
);
